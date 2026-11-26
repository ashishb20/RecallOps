package com.recallops.notification.dispatch;

import com.recallops.notification.domain.NotificationQueue;
import com.recallops.notification.domain.enums.ChannelType;

public interface NotificationDispatcher {
    ChannelType getChannel();
    void dispatch(NotificationQueue queue);
}