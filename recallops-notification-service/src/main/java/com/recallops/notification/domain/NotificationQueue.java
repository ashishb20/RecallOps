package com.recallops.notification.domain;

import com.recallops.notification.domain.enums.ChannelType;
import com.recallops.notification.domain.enums.EventType;
import com.recallops.notification.domain.enums.QueueStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notification_queue")
@CompoundIndex(name = "idx_status_scheduled", def = "{'status': 1, 'scheduledAt': 1}")
public class NotificationQueue {
    @Id
    private String id;
    private String userId;
    private String userEmail;
    private EventType eventType;
    private Map<String, Object> payload;
    private ChannelType channel;
    private QueueStatus status;
    private int retryCount;
    private Instant scheduledAt;
    private Instant claimedAt;
    private Instant sentAt;
    @Indexed(expireAfter = "0s")
    private Instant expireAt;
    private String errorMessage;
    @org.springframework.data.mongodb.core.mapping.Field("isRead")
    private boolean isRead;
}
