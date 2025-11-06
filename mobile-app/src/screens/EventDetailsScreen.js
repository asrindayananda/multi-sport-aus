import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { notificationService } from '../services/notificationService';

export default function EventDetailsScreen({ route, navigation }) {
  const { event } = route.params;
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('60');

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    const userEmail = await notificationService.getUserEmail();
    if (userEmail) {
      setEmail(userEmail);
    }
    
    const notificationId = await notificationService.getScheduledNotification(event.id);
    setReminderEnabled(!!notificationId);
  };

  const handleReminderToggle = async (value) => {
    setReminderEnabled(value);
    
    if (value) {
      const hasPermission = await notificationService.requestPermissions();
      if (hasPermission) {
        const minutes = parseInt(reminderMinutes) || 60;
        await notificationService.scheduleNotification(event, minutes);
        Alert.alert('Success', 'Reminder scheduled successfully!');
      } else {
        setReminderEnabled(false);
        Alert.alert('Permission Required', 'Please enable notifications in settings.');
      }
    } else {
      await notificationService.cancelNotification(event.id);
      Alert.alert('Success', 'Reminder cancelled.');
    }
  };

  const handleEmailToggle = async (value) => {
    setEmailEnabled(value);
    
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address.');
      setEmailEnabled(false);
      return;
    }
    
    try {
      if (value) {
        await notificationService.subscribeEmailReminder(email, event);
        await notificationService.saveUserEmail(email);
        Alert.alert('Success', 'Email reminder subscribed!');
      } else {
        await notificationService.unsubscribeEmailReminder(email, event.id);
        Alert.alert('Success', 'Email reminder unsubscribed.');
      }
    } catch (error) {
      setEmailEnabled(!value);
      Alert.alert('Error', 'Failed to update email reminder. Please check your backend is running.');
    }
  };

  const getSportColor = (sport) => {
    const colors = {
      F1: '#E10600',
      Bathurst: '#FFB612',
      NRL: '#0066CC',
      AFL: '#FF0000',
    };
    return colors[sport] || '#007AFF';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: getSportColor(event.sport) }]}>
        <Text style={styles.sportBadge}>{event.sport}</Text>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDate}>
          {new Date(event.date).toLocaleDateString('en-AU', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
        <Text style={styles.eventTime}>Time: {event.time}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionText}>{event.location}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>{event.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notification Reminder</Text>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderText}>Enable reminder</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={handleReminderToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={reminderEnabled ? '#007AFF' : '#f4f3f4'}
            />
          </View>
          {reminderEnabled && (
            <View style={styles.reminderInput}>
              <Text style={styles.inputLabel}>Minutes before event:</Text>
              <TextInput
                style={styles.textInput}
                value={reminderMinutes}
                onChangeText={setReminderMinutes}
                keyboardType="numeric"
                placeholder="60"
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Reminder</Text>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderText}>Enable email reminder</Text>
            <Switch
              value={emailEnabled}
              onValueChange={handleEmailToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={emailEnabled ? '#007AFF' : '#f4f3f4'}
            />
          </View>
          <View style={styles.emailInput}>
            <Text style={styles.inputLabel}>Email address:</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="your@email.com"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Events</Text>
        </TouchableOpacity>
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
    padding: 20,
    paddingTop: 60,
  },
  sportBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 16,
    color: '#FFFFFF',
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
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderText: {
    fontSize: 16,
    color: '#666',
  },
  reminderInput: {
    marginTop: 8,
  },
  emailInput: {
    marginTop: 12,
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
  },
  backButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
