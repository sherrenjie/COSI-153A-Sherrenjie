import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ProgressChart, PieChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const STORAGE_KEY = '@summer_bucket_list';

const StatsScreen = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    withPhotos: 0,
    withLocations: 0,
    byCategory: {},
    completionRate: 0,
    streak: 0,
  });

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateStats();
  }, [activities]);

  const loadActivities = async () => {
    try {
      const storedActivities = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedActivities !== null) {
        setActivities(JSON.parse(storedActivities));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const calculateStats = () => {
    const total = activities.length;
    const completed = activities.filter(a => a.completed).length;
    const pending = total - completed;
    const withPhotos = activities.filter(a => a.photo).length;
    const withLocations = activities.filter(a => a.location).length;
    
    // Calculate by category
    const byCategory = {};
    activities.forEach(activity => {
      const cat = activity.category || 'other';
      if (!byCategory[cat]) {
        byCategory[cat] = { total: 0, completed: 0 };
      }
      byCategory[cat].total++;
      if (activity.completed) {
        byCategory[cat].completed++;
      }
    });

    // Calculate streak (consecutive days with completions)
    const completedDates = activities
      .filter(a => a.completed && a.completedAt)
      .map(a => new Date(a.completedAt).toDateString())
      .sort();
    
    let streak = 0;
    let currentStreak = 0;
    let lastDate = null;
    
    completedDates.forEach(dateStr => {
      const date = new Date(dateStr);
      if (!lastDate) {
        currentStreak = 1;
      } else {
        const dayDiff = (date - lastDate) / (1000 * 60 * 60 * 24);
        if (dayDiff === 1) {
          currentStreak++;
        } else if (dayDiff > 1) {
          currentStreak = 1;
        }
      }
      streak = Math.max(streak, currentStreak);
      lastDate = date;
    });

    setStats({
      total,
      completed,
      pending,
      withPhotos,
      withLocations,
      byCategory,
      completionRate: total > 0 ? (completed / total) : 0,
      streak,
    });
  };

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const categoryData = Object.entries(stats.byCategory).map(([category, data]) => ({
    name: getCategoryName(category),
    population: data.total,
    color: getCategoryColor(category),
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  const progressData = {
    data: [stats.completionRate],
  };

  function getCategoryName(categoryId) {
    const names = {
      adventure: 'Adventure',
      beach: 'Beach',
      food: 'Food',
      travel: 'Travel',
      fun: 'Fun',
      other: 'Other'
    };
    return names[categoryId] || 'Other';
  }

  function getCategoryColor(categoryId) {
    const colors = {
      adventure: '#4CAF50',
      beach: '#2196F3',
      food: '#FF9800',
      travel: '#9C27B0',
      fun: '#E91E63',
      other: '#607D8B'
    };
    return colors[categoryId] || '#607D8B';
  }

  const achievements = [
    {
      icon: '🎯',
      title: 'Getting Started',
      description: 'Complete your first activity',
      achieved: stats.completed >= 1,
    },
    {
      icon: '📸',
      title: 'Memory Keeper',
      description: 'Add photos to 5 activities',
      achieved: stats.withPhotos >= 5,
    },
    {
      icon: '🔥',
      title: 'On Fire!',
      description: '3-day completion streak',
      achieved: stats.streak >= 3,
    },
    {
      icon: '🏆',
      title: 'Summer Champion',
      description: 'Complete 10 activities',
      achieved: stats.completed >= 10,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Your Summer Stats</Text>
        <Text style={styles.subtitle}>Track your progress</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Activities</Text>
          </View>
          <View style={[styles.statCard, styles.completedCard]}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Progress Chart */}
        {stats.total > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Completion Progress</Text>
            <ProgressChart
              data={progressData}
              width={width - 40}
              height={200}
              strokeWidth={16}
              radius={60}
              chartConfig={chartConfig}
              hideLegend={false}
            />
            <Text style={styles.progressText}>
              {Math.round(stats.completionRate * 100)}% Complete
            </Text>
          </View>
        )}

        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Activities by Category</Text>
            <PieChart
              data={categoryData}
              width={width - 40}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        )}

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.chartTitle}>🏅 Achievements</Text>
          {achievements.map((achievement, index) => (
            <View 
              key={index} 
              style={[
                styles.achievementCard,
                achievement.achieved && styles.achievementCardCompleted
              ]}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
              {achievement.achieved && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </View>
          ))}
        </View>

        {/* Fun Facts */}
        <View style={styles.funFactsSection}>
          <Text style={styles.chartTitle}>✨ Fun Facts</Text>
          <View style={styles.funFact}>
            <Ionicons name="camera" size={20} color="#FF6B35" />
            <Text style={styles.funFactText}>
              {stats.withPhotos} activities have photo memories
            </Text>
          </View>
          <View style={styles.funFact}>
            <Ionicons name="location" size={20} color="#FF6B35" />
            <Text style={styles.funFactText}>
              {stats.withLocations} activities have saved locations
            </Text>
          </View>
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
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 20,
    margin: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: '#E8F5E9',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  chartSection: {
    backgroundColor: '#FFF',
    margin: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: -30,
  },
  achievementsSection: {
    margin: 20,
    marginBottom: 10,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementCardCompleted: {
    backgroundColor: '#E8F5E9',
  },
  achievementIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  funFactsSection: {
    margin: 20,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  funFact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  funFactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
});

export default StatsScreen;