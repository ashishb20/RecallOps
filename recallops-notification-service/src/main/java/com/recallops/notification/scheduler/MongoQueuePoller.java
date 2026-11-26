package com.recallops.notification.scheduler;

import com.recallops.notification.domain.NotificationQueue;
import com.recallops.notification.domain.NotificationStatusLog;
import com.recallops.notification.domain.enums.QueueStatus;
import com.recallops.notification.dispatch.DispatcherRegistry;
import com.recallops.notification.dispatch.NotificationDispatcher;
import com.recallops.notification.repository.NotificationQueueRepository;
import com.recallops.notification.repository.NotificationStatusLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class MongoQueuePoller {

    private static final int MAX_BATCH_SIZE = 25;
    private static final int MAX_RETRIES = 3;
    private static final long BASE_BACKOFF_MS = 30_000L;
    private static final long STUCK_AFTER_SECONDS = 300L;

    private final MongoTemplate mongoTemplate;
    private final NotificationQueueRepository queueRepository;
    private final NotificationStatusLogRepository statusLogRepository;
    private final DispatcherRegistry dispatcherRegistry;

    @Scheduled(fixedDelayString = "${app.notification.poll-interval-ms:5000}")
    public void pollAndProcess() {
        Instant now = Instant.now();
        requeueStuckRows(now);

        for (int i = 0; i < MAX_BATCH_SIZE; i++) {
            NotificationQueue claimed = claimNext(now);
            if (claimed == null) {
                return;
            }
            process(claimed);
        }
    }


    private NotificationQueue claimNext(Instant now) {
        Query query = Query.query(Criteria.where("status").is(QueueStatus.PENDING)
            .and("scheduledAt").lte(now));

        Update update = Update.update("status", QueueStatus.PROCESSING)
            .set("claimedAt", now);

        return mongoTemplate.findAndModify(
            query, update, FindAndModifyOptions.options().returnNew(true), NotificationQueue.class);
    }

    /** A row left in PROCESSING after a crash would otherwise never be retried. */
    private void requeueStuckRows(Instant now) {
        Query stuck = Query.query(Criteria.where("status").is(QueueStatus.PROCESSING)
            .and("claimedAt").lt(now.minusSeconds(STUCK_AFTER_SECONDS)));
        Update requeue = Update.update("status", QueueStatus.PENDING)
            .set("scheduledAt", now)
            .inc("retryCount", 1);
        mongoTemplate.updateMulti(stuck, requeue, NotificationQueue.class);
    }

    private void process(NotificationQueue queue) {
        NotificationDispatcher dispatcher = dispatcherRegistry.getDispatcher(queue.getChannel());

        if (dispatcher == null) {
            log.error("No dispatcher for channel: {}", queue.getChannel());
            handleFailure(queue, "No dispatcher for channel: " + queue.getChannel());
            return;
        }

        try {
            dispatcher.dispatch(queue);
        } catch (Exception e) {
            log.error("Dispatch error for queue {}: {}", queue.getId(), e.getMessage());
            handleFailure(queue, "Dispatch exception: " + e.getMessage());
        }
    }

    private void handleFailure(NotificationQueue queue, String error) {
        int nextRetry = queue.getRetryCount() + 1;
        QueueStatus nextStatus;

        if (nextRetry >= MAX_RETRIES) {
            nextStatus = QueueStatus.FAILED;
            queue.setErrorMessage(error);
            log.warn("Queue moved to FAILED after {} retries: id={}, error={}", MAX_RETRIES, queue.getId(), error);
        } else {
            nextStatus = QueueStatus.PENDING;
            long backoffMs = BASE_BACKOFF_MS * (1L << (nextRetry - 1)); // 30s, 60s
            queue.setScheduledAt(Instant.now().plusMillis(backoffMs));
            queue.setErrorMessage(error);
            log.info("Queue re-queued: id={}, retry={}", queue.getId(), nextRetry);
        }

        queue.setStatus(nextStatus);
        queue.setRetryCount(nextRetry);
        queueRepository.save(queue);

        statusLogRepository.save(NotificationStatusLog.builder()
            .queueId(queue.getId())
            .fromStatus(QueueStatus.PROCESSING)
            .toStatus(nextStatus)
            .message(error)
            .timestamp(Instant.now())
            .build());
    }
}
