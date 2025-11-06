import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { notificationService } from '../services/notificationService';

export default function SettingsScreen() {
  const [email, setEmail] = useState('');
  const [backendUrl, setBackendUrl] = useState('http://localhost:3001');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const userEmail = await notificationService.getUserEmail();
    if (userEmail) {
      setEmail(userEmail);
    }
  };

  const saveSettings = async () => {
    if (email) {
      await notificationService.saveUserEmail(email);
      Alert.alert('Success', 'Settings saved successfully!');
    } else {
      Alert.alert('Error', 'Please enter an email address.');
    }
  };

  const requestNotificationPermission = async () => {
    const hasPermission = await notificationService.requestPermissions();
    if (hasPermission) {
      Alert.alert('Success', 'Notification permission granted!');
    } else {
      Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
    }
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear All Reminders',
      'Are you sure you want to clear all scheduled reminders?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const notifications = await notificationService.getAllScheduledNotifications();
            for (const eventId in notifications) {
              await notificationService.cancelNotification(eventId);
            }
            Alert.alert('Success', 'All reminders cleared!');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Configure your preferences</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Configuration</Text>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="your@email.com"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={saveSettings}>
            <Text style={styles.buttonText}>Save Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Configuration</Text>
          <Text style={styles.inputLabel}>Backend URL</Text>
          <TextInput
            style={styles.textInput}
            value={backendUrl}
            onChangeText={setBackendUrl}
            placeholder="http://localhost:3001"
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>
            Change this to your Azure backend URL when deployed
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={requestNotificationPermission}
          >
            <Text style={styles.buttonText}>Request Notification Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={clearAllNotifications}
          >
            <Text style={styles.buttonText}>Clear All Reminders</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Multi-Sport Australia Tracker
          </Text>
          <Text style={styles.aboutText}>
            Track F1, Bathurst, NRL, and AFL events
          </Text>
          <Text style={styles.aboutText}>
            Version 1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDanger: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
});
