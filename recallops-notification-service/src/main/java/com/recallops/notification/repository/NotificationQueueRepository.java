package com.recallops.notification.repository;

import com.recallops.notification.domain.NotificationQueue;
import com.recallops.notification.domain.enums.ChannelType;
import com.recallops.notification.domain.enums.QueueStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationQueueRepository extends MongoRepository<NotificationQueue, String> {
    
    @Query("{'status': ?0, 'claimedAt': {'$lt': ?1}}")
    List<NotificationQueue> findStaleProcessing(QueueStatus status, Instant cutoff);

    // Client API queries
    @Query(value = "{'userId': ?0, 'channel': ?1, 'status': ?2, 'isRead': false}", count = true)
    long countByUserIdAndChannelAndStatusAndIsReadFalse(String userId, ChannelType channel, QueueStatus status);
    
    @Query(value = "{'userId': ?0, 'channel': ?1, 'status': ?2}", sort = "{'scheduledAt': -1}")
    List<NotificationQueue> findByUserIdAndChannelAndStatus(
        String userId, ChannelType channel, QueueStatus status, org.springframework.data.domain.Pageable pageable);
}