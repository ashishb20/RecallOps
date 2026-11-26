package com.recallops.notification.controller;

import com.recallops.notification.domain.NotificationQueue;
import com.recallops.notification.domain.enums.ChannelType;
import com.recallops.notification.domain.enums.QueueStatus;
import com.recallops.notification.dto.EventPublishRequest;
import com.recallops.notification.dto.InAppNotificationDto;
import com.recallops.notification.dto.UnreadCountResponse;
import com.recallops.notification.repository.NotificationQueueRepository;
import com.recallops.notification.service.EventPublisherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "http://localhost:5172") // local Vite dev only; service not deployed
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final EventPublisherService eventPublisherService;
    private final NotificationQueueRepository queueRepository;

    @Value("${app.internal-secret:}")
    private String internalSecret;

    
    @PostMapping("/events")
    public ResponseEntity<Void> publishEvent(
            @RequestHeader(value = "X-Internal-Secret", required = false) String secretHeader,
            @Valid @RequestBody EventPublishRequest request) {
        if (internalSecret != null && !internalSecret.isBlank() && !internalSecret.equals(secretHeader)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid internal secret");
        }
        log.info("Received event: type={}, entityId={}, userId={}", 
            request.getEventType(), request.getEntityId(), request.getUserId());
        
        eventPublisherService.publish(request);
        
        return ResponseEntity.accepted().build();
    }

    
    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(@RequestParam("userId") String userId) {
        long count = queueRepository.countByUserIdAndChannelAndStatusAndIsReadFalse(
            userId, ChannelType.IN_APP, QueueStatus.SENT);
        
        return ResponseEntity.ok(UnreadCountResponse.builder().count(count).build());
    }

    /**
     * Get latest in-app notifications for a user (feed).
     * Returns most recent 10 by default, sorted by createdAt desc.
     */
    @GetMapping("/in-app")
    public ResponseEntity<List<InAppNotificationDto>> getInAppNotifications(
            @RequestParam("userId") String userId,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        
        int safeLimit = Math.max(1, Math.min(limit, 50));
        List<NotificationQueue> notifications = queueRepository
            .findByUserIdAndChannelAndStatus(
                userId, ChannelType.IN_APP, QueueStatus.SENT, PageRequest.of(0, safeLimit));
        
        List<InAppNotificationDto> dtos = notifications.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    /**
     * Mark notification as read.
     * Updates isRead flag, used by frontend on click.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable("id") String id, @RequestParam("userId") String userId) {
        return queueRepository.findById(id)
            .filter(q -> q.getUserId().equals(userId))
            .filter(q -> q.getChannel() == ChannelType.IN_APP)
            .map(queue -> {
                queue.setRead(true);
                queueRepository.save(queue);
                log.debug("Marked notification as read: id={}, userId={}", id, userId);
                return ResponseEntity.ok().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    private InAppNotificationDto toDto(NotificationQueue queue) {
        Map<String, Object> payload = queue.getPayload() != null ? queue.getPayload() : Map.of();
        String taskTitle = String.valueOf(payload.getOrDefault("taskTitle", "Task"));
        String stage = String.valueOf(payload.getOrDefault("stage", "Review"));

        String title = queue.getEventType() == com.recallops.notification.domain.enums.EventType.USER_WELCOME
            ? "Welcome to RecallOps!"
            : "Task Due: " + taskTitle;
        
        String body = queue.getEventType() == com.recallops.notification.domain.enums.EventType.USER_WELCOME
            ? "Thanks for joining RecallOps — your spaced-repetition companion."
            : "Review '" + taskTitle + "' (Stage: " + stage + ")";
        
        return InAppNotificationDto.builder()
            .id(queue.getId())
            .title(title)
            .body(body)
            .channel(queue.getChannel())
            .isRead(queue.isRead())
            .createdAt(queue.getScheduledAt())
            .build();
    }
}