package com.recallops.notification.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class ResendConfig {

    @Value("${app.resend.api-key:}")
    private String apiKey;

    @Value("${app.resend.from-email:noreply@recallops.local}")
    private String fromEmail;

    @Bean
    public RestClient resendClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        
        return RestClient.builder()
            .baseUrl("https://api.resend.com")
            .requestFactory(factory)
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();
    }

    public String getFromEmail() {
        return fromEmail;
    }
}