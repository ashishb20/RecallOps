package com.recallops.notification.repository;

import com.recallops.notification.domain.NotificationStatusLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationStatusLogRepository extends MongoRepository<NotificationStatusLog, String> {
}