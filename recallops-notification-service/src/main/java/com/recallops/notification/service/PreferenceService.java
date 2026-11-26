package com.recallops.notification.service;

import com.recallops.notification.domain.DedupeLog;
import com.recallops.notification.domain.enums.ChannelType;
import com.recallops.notification.domain.enums.EventType;
import com.recallops.notification.repository.DedupeLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreferenceService {

    private final DedupeLogRepository dedupeLogRepository;

    /**
     * Returns enabled channels for an event type.
     * ponytail: hardcoded defaults, no user preference UI yet.
     * Upgrade: add PreferenceRepository when a settings page exists.
     */
    public Set<ChannelType> getEnabledChannels(EventType eventType) {
        return switch (eventType) {
            case USER_WELCOME -> EnumSet.of(ChannelType.EMAIL);
            case TASK_DUE_TODAY -> EnumSet.of(ChannelType.EMAIL, ChannelType.IN_APP);
        };
    }

    /**
     * Claims the right to send this event for this user today.
     * The unique index on DedupeLog makes the insert the atomic check.
     */
    public boolean shouldSend(String userId, EventType eventType, String entityId) {
        String dateKey = LocalDate.now() + ":" + entityId;

        try {
            dedupeLogRepository.save(DedupeLog.builder()
                .userId(userId)
                .eventType(eventType)
                .dateKey(dateKey)
                .createdAt(Instant.now())
                .build());
            return true;
        } catch (DuplicateKeyException e) {
            log.debug("Dedupe blocked: userId={}, eventType={}, dateKey={}", userId, eventType, dateKey);
            return false;
        }
    }
}
