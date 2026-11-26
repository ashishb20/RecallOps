package com.recallops.notification.dispatch;

import com.recallops.notification.config.ResendConfig;
import com.recallops.notification.domain.NotificationQueue;
import com.recallops.notification.domain.enums.ChannelType;
import com.recallops.notification.domain.enums.EventType;
import com.recallops.notification.domain.enums.QueueStatus;
import com.recallops.notification.repository.NotificationQueueRepository;
import com.recallops.notification.repository.NotificationStatusLogRepository;
import com.recallops.notification.domain.NotificationStatusLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestClient;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailDispatcher implements NotificationDispatcher {

    private final RestClient resendClient;
    private final ResendConfig resendConfig;
    private final NotificationQueueRepository queueRepository;
    private final NotificationStatusLogRepository statusLogRepository;
    private final DispatcherRegistry dispatcherRegistry;

    @Override
    public ChannelType getChannel() {
        return ChannelType.EMAIL;
    }

    @PostConstruct
    public void register() {
        dispatcherRegistry.register(this);
    }

    @Override
    public void dispatch(NotificationQueue queue) {
        log.info("EmailDispatcher: sending email for queue {}", queue.getId());
        
        String templateName = switch (queue.getEventType()) {
            case USER_WELCOME -> "welcome.html";
            case TASK_DUE_TODAY -> "task-due.html";
        };
        
        String html;
        try {
            html = loadTemplate(templateName);
        } catch (IOException e) {
            log.error("Failed to load template {}: {}", templateName, e.getMessage());
            throw new IllegalStateException("Template load failed: " + e.getMessage(), e);
        }
        
        String renderedHtml = renderTemplate(html, queue.getPayload());
        
        ResendRequest request = ResendRequest.builder()
            .from(resendConfig.getFromEmail())
            .to(queue.getUserEmail())
            .subject(buildSubject(queue.getEventType()))
            .html(renderedHtml)
            .build();
        
        try {
            ResendResponse response = resendClient.post()
                .uri("/emails")
                .body(request)
                .retrieve()
                .body(ResendResponse.class);
            
            if (response != null && response.getId() != null) {
                handleSuccess(queue, response.getId());
            } else {
                throw new IllegalStateException("Resend returned null response");
            }
        } catch (Exception e) {
            log.error("Resend API error for queue {}: {}", queue.getId(), e.getMessage());
            // Rethrow so poller applies backoff and dead-letters after max retries
            throw new IllegalStateException("Resend API error: " + e.getMessage(), e);
        }
    }

    private String loadTemplate(String templateName) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/" + templateName);
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }

    private String renderTemplate(String template, Map<String, Object> payload) {
        String result = template;
        if (payload != null) {
            for (Map.Entry<String, Object> entry : payload.entrySet()) {
                result = result.replace("{{" + entry.getKey() + "}}", String.valueOf(entry.getValue()));
            }
        }
        return result;
    }

    private String buildSubject(EventType eventType) {
        return switch (eventType) {
            case USER_WELCOME -> "Welcome to RecallOps!";
            case TASK_DUE_TODAY -> "Task Due Today - Time to Review";
        };
    }

    private void handleSuccess(NotificationQueue queue, String resendId) {
        queue.setStatus(QueueStatus.SENT);
        queue.setSentAt(Instant.now());
        queueRepository.save(queue);
        
        statusLogRepository.save(NotificationStatusLog.builder()
            .queueId(queue.getId())
            .fromStatus(QueueStatus.PROCESSING)
            .toStatus(QueueStatus.SENT)
            .message("Email sent via Resend: " + resendId)
            .timestamp(Instant.now())
            .build());
        
        log.info("Email sent successfully: queueId={}, resendId={}", queue.getId(), resendId);
    }

    // Inner DTOs for Resend API
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class ResendRequest {
        private String from;
        private String to;
        private String subject;
        private String html;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class ResendResponse {
        private String id;
    }
}