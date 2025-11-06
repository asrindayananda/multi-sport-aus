import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const BACKEND_URL = 'http://localhost:3001'; // Change this to your Azure backend URL

export const notificationService = {
  // Request notification permissions
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push notification permissions!');
      return false;
    }
    
    return true;
  },

  // Schedule a local notification for an event
  async scheduleNotification(event, reminderMinutesBefore = 60) {
    try {
      const eventDate = new Date(`${event.date}T${event.time}`);
      const reminderDate = new Date(eventDate.getTime() - reminderMinutesBefore * 60000);
      
      // Only schedule if the reminder date is in the future
      if (reminderDate > new Date()) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${event.sport} Reminder`,
            body: `${event.title} starts in ${reminderMinutesBefore} minutes!`,
            data: { event },
          },
          trigger: reminderDate,
        });
        
        // Store notification ID
        await this.saveScheduledNotification(event.id, notificationId);
        return notificationId;
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  // Cancel a scheduled notification
  async cancelNotification(eventId) {
    try {
      const notificationId = await this.getScheduledNotification(eventId);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        await this.removeScheduledNotification(eventId);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  // Save notification ID to AsyncStorage
  async saveScheduledNotification(eventId, notificationId) {
    try {
      const notifications = await this.getAllScheduledNotifications();
      notifications[eventId] = notificationId;
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  },

  // Get notification ID from AsyncStorage
  async getScheduledNotification(eventId) {
    try {
      const notifications = await this.getAllScheduledNotifications();
      return notifications[eventId] || null;
    } catch (error) {
      console.error('Error getting notification:', error);
      return null;
    }
  },

  // Remove notification ID from AsyncStorage
  async removeScheduledNotification(eventId) {
    try {
      const notifications = await this.getAllScheduledNotifications();
      delete notifications[eventId];
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  },

  // Get all scheduled notifications
  async getAllScheduledNotifications() {
    try {
      const notificationsJson = await AsyncStorage.getItem('scheduledNotifications');
      return notificationsJson ? JSON.parse(notificationsJson) : {};
    } catch (error) {
      console.error('Error getting all notifications:', error);
      return {};
    }
  },

  // Subscribe to email reminders via backend
  async subscribeEmailReminder(email, event) {
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
  async unsubscribeEmailReminder(email, eventId) {
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
  async getUserEmail() {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      return email;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  },

  // Save user's email to storage
  async saveUserEmail(email) {
    try {
      await AsyncStorage.setItem('userEmail', email);
    } catch (error) {
      console.error('Error saving user email:', error);
    }
  },
};
