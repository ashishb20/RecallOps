package com.recallops.notification.dispatch;

import com.recallops.notification.domain.enums.ChannelType;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DispatcherRegistry {

    private final Map<ChannelType, NotificationDispatcher> dispatchers = new EnumMap<>(ChannelType.class);

    public void register(NotificationDispatcher dispatcher) {
        dispatchers.put(dispatcher.getChannel(), dispatcher);
        log.debug("Registered dispatcher for channel: {}", dispatcher.getChannel());
    }

    public NotificationDispatcher getDispatcher(ChannelType channel) {
        return dispatchers.get(channel);
    }

    @PostConstruct
    public void logRegisteredDispatchers() {
        log.info("DispatcherRegistry initialized with: {}", dispatchers.keySet());
    }
}