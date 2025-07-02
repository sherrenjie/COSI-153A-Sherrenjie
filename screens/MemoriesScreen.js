import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const imageSize = (width - 30) / 2;

const STORAGE_KEY = '@summer_bucket_list';

const MemoriesScreen = () => {
  const [activities, setActivities] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async () => {
    try {
      const storedActivities = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedActivities !== null) {
        const parsed = JSON.parse(storedActivities);
        // Filter only activities with photos
        const withPhotos = parsed.filter(a => a.photo && a.completed);
        setActivities(withPhotos);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const openImageModal = (activity) => {
    setSelectedImage(activity);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📸 Summer Memories</Text>
        <Text style={styles.subtitle}>Your completed adventure photos</Text>
      </View>

      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="camera-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>No memories yet!</Text>
          <Text style={styles.emptyText}>
            Complete activities and add photos to see them here
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.imageContainer}
                onPress={() => openImageModal(activity)}
              >
                <Image source={{ uri: activity.photo }} style={styles.gridImage} />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageTitle} numberOfLines={2}>
                    {activity.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            onPress={closeImageModal}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              {selectedImage && (
                <>
                  <Image 
                    source={{ uri: selectedImage.photo }} 
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalTitle}>{selectedImage.text}</Text>
                    {selectedImage.completedAt && (
                      <Text style={styles.modalDate}>
                        Completed on {new Date(selectedImage.completedAt).toLocaleDateString()}
                      </Text>
                    )}
                    {selectedImage.notes && (
                      <ScrollView style={styles.modalNotesScroll}>
                        <Text style={styles.modalNotes}>{selectedImage.notes}</Text>
                      </ScrollView>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={closeImageModal}
                  >
                    <Ionicons name="close-circle" size={32} color="#FFF" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E1',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  imageTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  modalNotesScroll: {
    maxHeight: 100,
  },
  modalNotes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default MemoriesScreen;