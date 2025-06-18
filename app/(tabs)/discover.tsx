import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useUserStore } from '../../src/stores/userStore';
import { useMatchStore } from '../../src/stores/matchStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = screenHeight * 0.7;

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    photos: string[];
    bio?: string;
    distance: number;
  };
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
  const { 
    profiles, 
    currentProfileIndex, 
    isLoading, 
    hasMore,
    loadProfiles, 
    swipeProfile,
    resetProfiles 
  } = useUserStore();
  
  const { addMatch } = useMatchStore();

  // Load profiles when component mounts
  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSwipe = async (action: 'like' | 'pass') => {
    const currentProfile = profiles[currentProfileIndex];
    if (!currentProfile) return;

    console.log(`Swiped ${action} on ${currentProfile.name}`);
    
    try {
      const match = await swipeProfile(currentProfile.id, action);
      
      // Show feedback
      if (action === 'like') {
        if (match) {
          Alert.alert('It\'s a Match!', `You and ${currentProfile.name} liked each other!`, [
            { text: 'Keep Swiping', style: 'cancel' },
            { text: 'Send Message', onPress: () => console.log('Navigate to chat') }
          ]);
          // Add match to match store
          addMatch(match);
        } else {
          Alert.alert('Liked!', `You liked ${currentProfile.name}`);
        }
      } else {
        Alert.alert('Passed', `You passed on ${currentProfile.name}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record swipe. Please try again.');
    }
  };

  const currentProfile = profiles[currentProfileIndex];

  // Loading state
  if (isLoading && profiles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#FF4458" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4458" />
          <Text style={styles.loadingText}>Finding amazing people for you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No more profiles state
  if (!currentProfile && !hasMore) {
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
            onPress={() => {
              resetProfiles();
              loadProfiles();
            }}
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

      {currentProfile && (
        <>
          <View style={styles.cardsContainer}>
            <ProfileCard profile={currentProfile} />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.passButton]}
              onPress={() => handleSwipe('pass')}
              disabled={isLoading}
            >
              <Ionicons name="close" size={30} color="#FF4458" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.likeButton]}
              onPress={() => handleSwipe('like')}
              disabled={isLoading}
            >
              <Ionicons name="heart" size={30} color="#4FC3F7" />
            </TouchableOpacity>
          </View>
        </>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
});