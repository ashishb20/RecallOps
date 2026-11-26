package com.recallops.notification.dispatch;

import com.recallops.notification.domain.NotificationQueue;
import com.recallops.notification.domain.NotificationStatusLog;
import com.recallops.notification.domain.enums.ChannelType;
import com.recallops.notification.domain.enums.QueueStatus;
import com.recallops.notification.repository.NotificationQueueRepository;
import com.recallops.notification.repository.NotificationStatusLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class InAppDispatcher implements NotificationDispatcher {

    private final NotificationQueueRepository queueRepository;
    private final NotificationStatusLogRepository statusLogRepository;
    private final DispatcherRegistry dispatcherRegistry;

    @Override
    public ChannelType getChannel() {
        return ChannelType.IN_APP;
    }

    @PostConstruct
    public void register() {
        dispatcherRegistry.register(this);
    }

    @Override
    public void dispatch(NotificationQueue queue) {
        // The queue row is the notification. Marking it SENT makes it visible
        // to the unread-count and feed queries.
        queue.setStatus(QueueStatus.SENT);
        queue.setSentAt(Instant.now());
        queueRepository.save(queue);

        statusLogRepository.save(NotificationStatusLog.builder()
            .queueId(queue.getId())
            .fromStatus(QueueStatus.PROCESSING)
            .toStatus(QueueStatus.SENT)
            .message("In-app notification available")
            .timestamp(Instant.now())
            .build());

        log.debug("InAppDispatcher: marked queue {} as SENT", queue.getId());
    }
}
