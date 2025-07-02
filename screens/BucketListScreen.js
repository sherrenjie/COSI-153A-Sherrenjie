import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const STORAGE_KEY = '@summer_bucket_list';

const BucketListScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('adventure');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'adventure', icon: '🏔️', name: 'Adventure' },
    { id: 'beach', icon: '🏖️', name: 'Beach' },
    { id: 'food', icon: '🍔', name: 'Food' },
    { id: 'travel', icon: '✈️', name: 'Travel' },
    { id: 'fun', icon: '🎉', name: 'Fun' },
    { id: 'other', icon: '⭐', name: 'Other' }
  ];

  // Load activities from AsyncStorage
  useEffect(() => {
    loadActivities();
  }, []);

  // Save activities to AsyncStorage whenever they change
  useEffect(() => {
    if (!loading) {
      saveActivities();
    }
  }, [activities]);

  const loadActivities = async () => {
    try {
      const storedActivities = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedActivities !== null) {
        setActivities(JSON.parse(storedActivities));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveActivities = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  };

  const addActivity = async () => {
    if (inputText.trim() === '') {
      Alert.alert('Oops!', 'Please enter an activity');
      return;
    }

    // Get current location
    let location = null;
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        location = await Location.getCurrentPositionAsync({});
      }
    } catch (error) {
      console.log('Location error:', error);
    }

    const newActivity = {
      id: Date.now(),
      text: inputText,
      category: selectedCategory,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      photo: null,
      notes: '',
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      } : null
    };

    setActivities([...activities, newActivity]);
    setInputText('');
  };

  const toggleActivity = (id) => {
    setActivities(activities.map(activity =>
      activity.id === id 
        ? { 
            ...activity, 
            completed: !activity.completed,
            completedAt: !activity.completed ? new Date().toISOString() : null
          } 
        : activity
    ));
  };

  const deleteActivity = (id) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to remove this from your bucket list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => setActivities(activities.filter(a => a.id !== id)) }
      ]
    );
  };

  const getFilteredActivities = () => {
    let filtered = activities;
    
    switch (filter) {
      case 'completed':
        filtered = activities.filter(a => a.completed);
        break;
      case 'pending':
        filtered = activities.filter(a => !a.completed);
        break;
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '⭐';
  };

  const completedCount = activities.filter(a => a.completed).length;
  const totalCount = activities.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading your summer adventures...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>☀️ Summer Vibes</Text>
          <Text style={styles.subtitle}>Track your epic summer adventures!</Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {completedCount} of {totalCount} adventures completed ({Math.round(progressPercentage)}%)
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              To Do
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activities List */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
          {getFilteredActivities().map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityItem}
              onPress={() => navigation.navigate('ActivityDetails', { activity, setActivities })}
            >
              <View style={styles.activityContent}>
                <TouchableOpacity
                  style={styles.checkboxArea}
                  onPress={() => toggleActivity(activity.id)}
                >
                  <View style={[styles.checkbox, activity.completed && styles.checkboxCompleted]}>
                    {activity.completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
                
                <View style={styles.activityInfo}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(activity.category)}</Text>
                    <Text style={[styles.activityText, activity.completed && styles.activityTextCompleted]}>
                      {activity.text}
                    </Text>
                  </View>
                  
                  {activity.photo && (
                    <Image source={{ uri: activity.photo }} style={styles.activityThumbnail} />
                  )}
                  
                  <View style={styles.activityMeta}>
                    {activity.location && (
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={12} color="#666" />
                        <Text style={styles.metaText}>Location saved</Text>
                      </View>
                    )}
                    {activity.notes && (
                      <View style={styles.metaItem}>
                        <Ionicons name="document-text-outline" size={12} color="#666" />
                        <Text style={styles.metaText}>Has notes</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteActivity(activity.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6B35" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Section */}
        <View style={styles.inputSection}>
          {/* Category Selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categorySelector}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryButtonText}>{category.icon}</Text>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.categoryNameActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a summer adventure..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={addActivity}
            />
            <TouchableOpacity style={styles.addButton} onPress={addActivity}>
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E1',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  activityItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  checkboxArea: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityInfo: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  activityTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  activityThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginTop: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#666',
  },
  deleteButton: {
    padding: 5,
  },
  inputSection: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
  },
  categorySelector: {
    paddingHorizontal: 20,
    marginBottom: 10,
    maxHeight: 60,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 15,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  categoryButtonActive: {
    backgroundColor: '#FFE5D9',
  },
  categoryButtonText: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  categoryNameActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default BucketListScreen;