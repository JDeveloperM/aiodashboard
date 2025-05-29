import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notification-service';
import { 
  isNotificationSupported, 
  hasNotificationPermission, 
  requestNotificationPermission 
} from '@/lib/notifications';

/**
 * Hook for managing notifications in React components
 */
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState(notificationService.loadSettings());

  // Check notification permission on mount
  useEffect(() => {
    if (isNotificationSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  // Update notification service when settings change
  useEffect(() => {
    notificationService.updateSettings(settings);
  }, [settings]);

  /**
   * Request notification permission
   */
  const requestPermission = async () => {
    if (!isNotificationSupported()) {
      return 'denied';
    }

    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);
    
    // Update browser notification setting based on permission
    if (newPermission === 'granted') {
      updateSettings({ browser: true });
    }
    
    return newPermission;
  };

  /**
   * Update notification settings
   */
  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  /**
   * Send a test notification
   */
  const sendTestNotification = () => {
    if (hasNotificationPermission() && settings.browser) {
      notificationService.notifySystem(
        'Test Notification', 
        'This is a test notification from AIonet'
      );
      return true;
    }
    return false;
  };

  return {
    isSupported: isNotificationSupported(),
    permission,
    settings,
    updateSettings,
    requestPermission,
    sendTestNotification,
    notifyTrade: notificationService.notifyTrade.bind(notificationService),
    notifyNews: notificationService.notifyNews.bind(notificationService),
    notifySystem: notificationService.notifySystem.bind(notificationService),
    notifyPromotion: notificationService.notifyPromotion.bind(notificationService),
  };
}
