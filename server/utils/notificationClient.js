
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || '';

export const sendNotificationEvent = async (eventData, logger = console) => {
  // Empty URL = notification service disabled 
  if (!NOTIFICATION_SERVICE_URL) return false;

  const url = `${NOTIFICATION_SERVICE_URL}/api/v1/notifications/events`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const headers = {
      'Content-Type': 'application/json',
    };
    if (INTERNAL_SECRET) {
      headers['X-Internal-Secret'] = INTERNAL_SECRET;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (logger.warn) {
        logger.warn({ status: response.status, eventType: eventData.eventType }, 'Notification service returned non-202 status');
      }
      return false;
    }

    return true;
  } catch (err) {
    if (logger.warn) {
      logger.warn({ error: err.message, eventType: eventData.eventType }, 'Notification event publish failed (non-blocking)');
    }
    return false;
  }
};
