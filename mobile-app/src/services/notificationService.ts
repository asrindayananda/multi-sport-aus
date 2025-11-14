import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import PushNotification from 'react-native-push-notification';
import { SportEvent } from '../types';

const BACKEND_URL = 'http://localhost:3001'; // Change this to your Azure backend URL

// Configure push notifications
PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: true,
});

// Create notification channel for Android
PushNotification.createChannel(
  {
    channelId: 'sports-reminders',
    channelName: 'Sports Event Reminders',
    channelDescription: 'Notifications for upcoming sports events',
    playSound: true,
    soundName: 'default',
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`createChannel returned '${created}'`)
);

export const notificationService = {
  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        if (permissions.alert) {
          resolve(true);
        } else {
          PushNotification.requestPermissions().then(() => {
            resolve(true);
          });
        }
      });
    });
  },

  // Schedule a local notification for an event
  async scheduleNotification(event: SportEvent, reminderMinutesBefore: number = 60): Promise<string | null> {
    try {
      const eventDate = new Date(`${event.date}T${event.time}`);
      const reminderDate = new Date(eventDate.getTime() - reminderMinutesBefore * 60000);
      
      // Only schedule if the reminder date is in the future
      if (reminderDate > new Date()) {
        const notificationId = Math.random().toString(36).substring(7);
        
        PushNotification.localNotificationSchedule({
          channelId: 'sports-reminders',
          id: notificationId,
          title: `${event.sport} Reminder`,
          message: `${event.title} starts in ${reminderMinutesBefore} minutes!`,
          date: reminderDate,
          allowWhileIdle: true,
          userInfo: { event },
        });
        
        // Store notification ID
        await this.saveScheduledNotification(event.id, notificationId);
        return notificationId;
      }
      return null;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  // Cancel a scheduled notification
  async cancelNotification(eventId: string): Promise<void> {
    try {
      const notificationId = await this.getScheduledNotification(eventId);
      if (notificationId) {
        PushNotification.cancelLocalNotification(notificationId);
        await this.removeScheduledNotification(eventId);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  // Save notification ID to AsyncStorage
  async saveScheduledNotification(eventId: string, notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllScheduledNotifications();
      notifications[eventId] = notificationId;
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  },

  // Get notification ID from AsyncStorage
  async getScheduledNotification(eventId: string): Promise<string | null> {
    try {
      const notifications = await this.getAllScheduledNotifications();
      return notifications[eventId] || null;
    } catch (error) {
      console.error('Error getting notification:', error);
      return null;
    }
  },

  // Remove notification ID from AsyncStorage
  async removeScheduledNotification(eventId: string): Promise<void> {
    try {
      const notifications = await this.getAllScheduledNotifications();
      delete notifications[eventId];
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  },

  // Get all scheduled notifications
  async getAllScheduledNotifications(): Promise<Record<string, string>> {
    try {
      const notificationsJson = await AsyncStorage.getItem('scheduledNotifications');
      return notificationsJson ? JSON.parse(notificationsJson) : {};
    } catch (error) {
      console.error('Error getting all notifications:', error);
      return {};
    }
  },

  // Subscribe to email reminders via backend
  async subscribeEmailReminder(email: string, event: SportEvent): Promise<any> {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/reminders/subscribe`, {
        email,
        event,
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to email reminder:', error);
      throw error;
    }
  },

  // Unsubscribe from email reminders
  async unsubscribeEmailReminder(email: string, eventId: string): Promise<any> {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/reminders/unsubscribe`, {
        email,
        eventId,
      });
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from email reminder:', error);
      throw error;
    }
  },

  // Get user's email from storage
  async getUserEmail(): Promise<string | null> {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      return email;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  },

  // Save user's email to storage
  async saveUserEmail(email: string): Promise<void> {
    try {
      await AsyncStorage.setItem('userEmail', email);
    } catch (error) {
      console.error('Error saving user email:', error);
    }
  },
};
