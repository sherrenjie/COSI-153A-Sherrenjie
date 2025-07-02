import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = '@summer_bucket_list';
const SETTINGS_KEY = '@summer_bucket_settings';

const ProfileScreen = () => {
  const [userName, setUserName] = useState('Summer Explorer');
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [settings, setSettings] = useState({
    notifications: false,
    dailyReminder: false,
    darkMode: false,
  });

  useEffect(() => {
    loadStats();
    loadSettings();
  }, []);

  const loadStats = async () => {
    try {
      const storedActivities = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedActivities !== null) {
        const activities = JSON.parse(storedActivities);
        setStats({
          total: activities.length,
          completed: activities.filter(a => a.completed).length,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (storedSettings !== null) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleNotifications = async (value) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable notifications in settings');
        return;
      }
    }
    saveSettings({ ...settings, notifications: value });
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your activities and reset the app. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              await AsyncStorage.removeItem(SETTINGS_KEY);
              Alert.alert('Success', 'All data has been cleared');
              loadStats();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      const activities = await AsyncStorage.getItem(STORAGE_KEY);
      const dataStr = JSON.stringify(JSON.parse(activities || '[]'), null, 2);
      
      Alert.alert(
        'Export Data',
        'Your data has been prepared. You can copy it from the console or implement a share feature.',
        [{ text: 'OK' }]
      );
      console.log('Exported Data:', dataStr);
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const aboutItems = [
    {
      icon: 'information-circle-outline',
      title: 'App Version',
      value: '1.0.0',
    },
    {
      icon: 'person-outline',
      title: 'Developer',
      value: 'Sherren Jielita',
    },
    {
      icon: 'mail-outline',
      title: 'Contact',
      value: 'sherrenjielita@brandeis.edu',
      onPress: () => Linking.openURL('mailto:sherrenjielita@brandeis.edu'),
    },
  ];

  const settingItems = [
    {
      icon: 'notifications-outline',
      title: 'Push Notifications',
      description: 'Get reminders for your activities',
      type: 'switch',
      value: settings.notifications,
      onValueChange: toggleNotifications,
    },
    {
      icon: 'alarm-outline',
      title: 'Daily Reminder',
      description: 'Remind me to check my bucket list',
      type: 'switch',
      value: settings.dailyReminder,
      onValueChange: (value) => saveSettings({ ...settings, dailyReminder: value }),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileEmoji}>🌞</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userStats}>
            {stats.completed} of {stats.total} activities completed
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settingItems.map((item, index) => (
            <View key={index} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name={item.icon} size={24} color="#FF6B35" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
              </View>
              {item.type === 'switch' && (
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: '#DDD', true: '#FFB99A' }}
                  thumbColor={item.value ? '#FF6B35' : '#f4f3f4'}
                />
              )}
            </View>
          ))}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={styles.actionButton} onPress={exportData}>
            <Ionicons name="download-outline" size={20} color="#FF6B35" />
            <Text style={styles.actionButtonText}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={clearAllData}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>
              Clear All Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {aboutItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.aboutItem}
              onPress={item.onPress}
              disabled={!item.onPress}
            >
              <Ionicons name={item.icon} size={24} color="#FF6B35" />
              <View style={styles.aboutInfo}>
                <Text style={styles.aboutTitle}>{item.title}</Text>
                <Text style={styles.aboutValue}>{item.value}</Text>
              </View>
              {item.onPress && (
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for CS153A</Text>
          <Text style={styles.footerText}>Summer 2025</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E1',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileEmoji: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userStats: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEE',
    marginHorizontal: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 10,
    gap: 10,
  },
  dangerButton: {
    backgroundColor: '#FFE5E5',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '500',
  },
  dangerText: {
    color: '#FF3B30',
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  aboutInfo: {
    flex: 1,
    marginLeft: 15,
  },
  aboutTitle: {
    fontSize: 14,
    color: '#666',
  },
  aboutValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen;