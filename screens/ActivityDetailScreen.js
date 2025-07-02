import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@summer_bucket_list';

const ActivityDetailsScreen = ({ route, navigation }) => {
  const { activity } = route.params;
  const [activityData, setActivityData] = useState(activity);
  const [notes, setNotes] = useState(activity.notes || '');
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    if (activityData.location) {
      reverseGeocode();
    }
  }, []);

  const reverseGeocode = async () => {
    if (activityData.location) {
      try {
        const [result] = await Location.reverseGeocodeAsync({
          latitude: activityData.location.latitude,
          longitude: activityData.location.longitude,
        });
        if (result) {
          setLocationName(`${result.city || ''}, ${result.region || ''}`);
        }
      } catch (error) {
        console.log('Reverse geocode error:', error);
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to add photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateActivity({ photo: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take photos!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateActivity({ photo: result.assets[0].uri });
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how to add a photo to this activity',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const updateLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need location permissions to save your location!');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      updateActivity({
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      });
      reverseGeocode();
    } catch (error) {
      Alert.alert('Error', 'Could not get your location');
    }
  };

  const updateActivity = async (updates) => {
    const updatedActivity = { ...activityData, ...updates };
    setActivityData(updatedActivity);

    // Update in AsyncStorage
    try {
      const storedActivities = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedActivities) {
        const activities = JSON.parse(storedActivities);
        const index = activities.findIndex(a => a.id === activityData.id);
        if (index !== -1) {
          activities[index] = updatedActivity;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
        }
      }
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const saveNotes = () => {
    updateActivity({ notes });
    Alert.alert('Success', 'Notes saved!');
  };

  const removePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => updateActivity({ photo: null }) }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Activity Header */}
        <View style={styles.header}>
          <Text style={styles.activityTitle}>{activityData.text}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {activityData.completed ? '✅ Completed' : '⏳ Pending'}
            </Text>
          </View>
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Memory Photo</Text>
          {activityData.photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: activityData.photo }} style={styles.photo} />
              <TouchableOpacity style={styles.removePhotoButton} onPress={removePhoto}>
                <Ionicons name="close-circle" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addPhotoButton} onPress={showImageOptions}>
              <Ionicons name="camera-outline" size={40} color="#FF6B35" />
              <Text style={styles.addPhotoText}>Add a photo memory</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          {activityData.location ? (
            <View>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: activityData.location.latitude,
                  longitude: activityData.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={activityData.location}
                  title={activityData.text}
                />
              </MapView>
              {locationName ? (
                <Text style={styles.locationText}>{locationName}</Text>
              ) : null}
            </View>
          ) : (
            <TouchableOpacity style={styles.addLocationButton} onPress={updateLocation}>
              <Ionicons name="location-outline" size={24} color="#FF6B35" />
              <Text style={styles.addLocationText}>Add current location</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Notes & Memories</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Write about this adventure..."
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveNotes}>
            <Text style={styles.saveButtonText}>Save Notes</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>
              {new Date(activityData.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {activityData.completedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Completed:</Text>
              <Text style={styles.infoValue}>
                {new Date(activityData.completedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E1',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  addPhotoButton: {
    height: 150,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    marginTop: 10,
    color: '#FF6B35',
    fontSize: 16,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  locationText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    gap: 10,
  },
  addLocationText: {
    color: '#FF6B35',
    fontSize: 16,
  },
  notesInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
  },
  saveButton: {
    marginTop: 15,
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#FFF',
    marginTop: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default ActivityDetailsScreen;