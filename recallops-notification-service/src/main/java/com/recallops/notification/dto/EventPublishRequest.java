package com.recallops.notification.dto;

import com.recallops.notification.domain.enums.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventPublishRequest {
    @NotNull
    private EventType eventType;
    
    @NotBlank
    private String entityId;
    
    @NotBlank
    private String userId;

    private String userEmail;

    private Map<String, Object> payload;
}