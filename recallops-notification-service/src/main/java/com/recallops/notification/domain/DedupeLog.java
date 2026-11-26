package com.recallops.notification.domain;

import com.recallops.notification.domain.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notification_dedupe_log")
@CompoundIndex(name = "idx_user_event_date", def = "{'userId': 1, 'eventType': 1, 'dateKey': 1}", unique = true)
public class DedupeLog {
    @Id
    private String id;
    @Indexed
    private String userId;
    private EventType eventType;
    private String dateKey; // yyyy-MM-dd
    @Indexed(expireAfter = "86400s")
    private Instant createdAt;
}