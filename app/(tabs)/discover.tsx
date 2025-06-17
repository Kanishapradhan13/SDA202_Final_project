import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.7;

// Mock data - will be replaced with real data from store in Component 2
const mockProfiles = [
  {
    id: '1',
    name: 'Sarah',
    age: 25,
    photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b515?w=400'],
    bio: 'Love hiking and good coffee ☕',
    distance: 2,
  },
  {
    id: '2',
    name: 'Emma',
    age: 23,
    photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'],
    bio: 'Artist and dog lover 🎨🐕',
    distance: 5,
  },
  {
    id: '3',
    name: 'Jessica',
    age: 28,
    photos: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'],
    bio: 'Yoga instructor and traveler ✈️🧘‍♀️',
    distance: 3,
  },
];

interface ProfileCardProps {
  profile: typeof mockProfiles[0];
}

function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: profile.photos[0] }}
        style={styles.cardImage}
        contentFit="cover"
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardGradient}
      >
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
          </View>
          <Text style={styles.bio}>{profile.bio}</Text>
          <View style={styles.distanceRow}>
            <Ionicons name="location-outline" size={16} color="white" />
            <Text style={styles.distance}>{profile.distance} km away </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function DiscoverScreen() {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    console.log(`Swiped ${direction} on ${currentProfile.name}`);
    
    // Show feedback
    if (direction === 'right') {
      Alert.alert('Liked!', `You liked ${currentProfile.name}`);
    } else {
      Alert.alert('Passed', `You passed on ${currentProfile.name}`);
    }
    
    // Move to next profile
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      
      if (currentIndex >= profiles.length - 1) {
        Alert.alert('No more profiles', 'Check back later for more matches!');
      }
    }, 1000);
  };

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#FF4458" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#FF4458" />
          <Text style={styles.emptyTitle}>No more profiles!</Text>
          <Text style={styles.emptySubtitle}>Check back later for more potential matches</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => setCurrentIndex(0)}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="#FF4458" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        <ProfileCard profile={currentProfile} />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleSwipe('left')}
        >
          <Ionicons name="close" size={30} color="#FF4458" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('right')}
        >
          <Ionicons name="heart" size={30} color="#4FC3F7" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: 'flex-end',
  },
  cardInfo: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  age: {
    fontSize: 24,
    color: 'white',
  },
  bio: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    opacity: 0.9,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 14,
    color: 'white',
    marginLeft: 5,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  passButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF4458',
  },
  likeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#4FC3F7',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#FF4458',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});