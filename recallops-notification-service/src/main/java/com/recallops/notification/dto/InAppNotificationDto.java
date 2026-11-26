package com.recallops.notification.dto;

import com.recallops.notification.domain.enums.ChannelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InAppNotificationDto {
    private String id;
    private String title;
    private String body;
    private ChannelType channel;
    private boolean isRead;
    private Instant createdAt;
}