package com.recallops.notification.domain;

import com.recallops.notification.domain.enums.ChannelType;
import com.recallops.notification.domain.enums.QueueStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notification_status_log")
public class NotificationStatusLog {
    @Id
    private String id;
    @Indexed
    private String queueId;
    private QueueStatus fromStatus;
    private QueueStatus toStatus;
    private String message;
    private Instant timestamp;
}