import { 
  hasNotificationPermission, 
  sendNotification, 
  sendTradeNotification, 
  sendSystemNotification 
} from '@/lib/notifications';

/**
 * Notification Service
 * 
 * This service handles sending notifications to the user based on their preferences.
 * It checks user settings before sending notifications.
 */
class NotificationService {
  private userSettings: {
    notifications: {
      browser: boolean;
      push: boolean;
      email: boolean;
      trades: boolean;
      news: boolean;
      promotions: boolean;
    }
  };

  constructor() {
    // Default settings - in a real app, these would be loaded from user settings
    this.userSettings = {
      notifications: {
        browser: true,
        push: true,
        email: true,
        trades: true,
        news: false,
        promotions: false
      }
    };
  }

  /**
   * Update user notification settings
   */
  updateSettings(settings: any) {
    this.userSettings = {
      ...this.userSettings,
      notifications: {
        ...this.userSettings.notifications,
        ...settings
      }
    };
    
    // In a real app, you would save these settings to the server
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSettings', JSON.stringify(this.userSettings.notifications));
    }
  }

  /**
   * Load user notification settings
   */
  loadSettings() {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        this.userSettings.notifications = JSON.parse(savedSettings);
      }
    }
    return this.userSettings.notifications;
  }

  /**
   * Check if a specific notification type is enabled
   */
  isEnabled(type: 'browser' | 'push' | 'email') {
    return this.userSettings.notifications[type];
  }

  /**
   * Check if a specific notification category is enabled
   */
  isCategoryEnabled(category: 'trades' | 'news' | 'promotions') {
    return this.userSettings.notifications[category];
  }

  /**
   * Send a trade notification
   */
  notifyTrade(tradeType: 'open' | 'close', symbol: string, profit?: number) {
    if (!this.isCategoryEnabled('trades')) return null;

    // Send browser notification if enabled
    if (this.isEnabled('browser') && hasNotificationPermission()) {
      return sendTradeNotification(tradeType, symbol, profit);
    }
    
    // In a real app, you would also handle push and email notifications here
    return null;
  }

  /**
   * Send a news notification
   */
  notifyNews(title: string, message: string) {
    if (!this.isCategoryEnabled('news')) return null;

    // Send browser notification if enabled
    if (this.isEnabled('browser') && hasNotificationPermission()) {
      return sendSystemNotification(title, message);
    }
    
    // In a real app, you would also handle push and email notifications here
    return null;
  }

  /**
   * Send a system notification
   */
  notifySystem(title: string, message: string) {
    // System notifications are always sent regardless of news/trades/promotions settings
    
    // Send browser notification if enabled
    if (this.isEnabled('browser') && hasNotificationPermission()) {
      return sendSystemNotification(title, message);
    }
    
    // In a real app, you would also handle push and email notifications here
    return null;
  }

  /**
   * Send a promotional notification
   */
  notifyPromotion(title: string, message: string) {
    if (!this.isCategoryEnabled('promotions')) return null;

    // Send browser notification if enabled
    if (this.isEnabled('browser') && hasNotificationPermission()) {
      return sendSystemNotification(title, message);
    }
    
    // In a real app, you would also handle push and email notifications here
    return null;
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();

// Export the class for testing purposes
export default NotificationService;
