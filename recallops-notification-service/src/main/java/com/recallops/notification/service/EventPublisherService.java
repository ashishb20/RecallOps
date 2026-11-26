package com.recallops.notification.service;

import com.recallops.notification.domain.NotificationQueue;
import com.recallops.notification.domain.NotificationStatusLog;
import com.recallops.notification.domain.enums.ChannelType;
import com.recallops.notification.domain.enums.EventType;
import com.recallops.notification.domain.enums.QueueStatus;
import com.recallops.notification.dto.EventPublishRequest;
import com.recallops.notification.repository.NotificationQueueRepository;
import com.recallops.notification.repository.NotificationStatusLogRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisherService {

    private final NotificationQueueRepository queueRepository;
    private final NotificationStatusLogRepository statusLogRepository;
    private final PreferenceService preferenceService;

    /**
     * Idempotent event ingestion.
     * 1. Atomic dedupe insert (unique index = idempotency barrier)
     * 2. On success: fan out one queue row per enabled channel
     * 3. On duplicate: return without side effects
     */
    public void publish(@Valid EventPublishRequest request) {
        EventType eventType = request.getEventType();
        String entityId = request.getEntityId();
        String userId = request.getUserId();

        if (!preferenceService.shouldSend(userId, eventType, entityId)) {
            log.info("Duplicate event ignored: userId={}, eventType={}, entityId={}", userId, eventType, entityId);
            return;
        }

        Set<ChannelType> channels = preferenceService.getEnabledChannels(eventType);
        Instant now = Instant.now();
        String userEmail = request.getUserEmail() != null
            ? request.getUserEmail()
            : (request.getPayload() == null ? null : (String) request.getPayload().get("email"));

    
        for (ChannelType channel : channels) {
            NotificationQueue queue = NotificationQueue.builder()
                .userId(userId)
                .userEmail(userEmail)
                .eventType(eventType)
                .payload(request.getPayload())
                .channel(channel)
                .status(QueueStatus.PENDING)
                .retryCount(0)
                .scheduledAt(now)
                .expireAt(now.plusSeconds(86400 * 7)) // 7 day TTL
                .isRead(false)
                .build();

            queueRepository.save(queue);

            statusLogRepository.save(NotificationStatusLog.builder()
                .queueId(queue.getId())
                .fromStatus(null)
                .toStatus(QueueStatus.PENDING)
                .message("Event published, queued for " + channel)
                .timestamp(now)
                .build());

            log.debug("Queue row created: id={}, channel={}", queue.getId(), channel);
        }
    }
}
