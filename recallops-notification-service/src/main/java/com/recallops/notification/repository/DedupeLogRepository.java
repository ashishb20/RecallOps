package com.recallops.notification.repository;

import com.recallops.notification.domain.DedupeLog;
import com.recallops.notification.domain.enums.EventType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DedupeLogRepository extends MongoRepository<DedupeLog, String> {
    
    @Query("{'userId': ?0, 'eventType': ?1, 'dateKey': ?2}")
    Optional<DedupeLog> findByUserEventDate(String userId, EventType eventType, String dateKey);
}