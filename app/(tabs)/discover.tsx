import React, { useState, useRef } from 'react';
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
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

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

interface SwipeCardProps {
  profile: typeof mockProfiles[0];
  isTop: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
}

function SwipeCard({ profile, isTop, onSwipe }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const panGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      // Card interaction started
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = interpolate(
        event.translationX,
        [-screenWidth / 2, screenWidth / 2],
        [-15, 15],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      const swipeThreshold = screenWidth * 0.3;
      
      if (Math.abs(event.translationX) > swipeThreshold) {
        // Swipe completed
        const direction = event.translationX > 0 ? 'right' : 'left';
        const targetX = event.translationX > 0 ? screenWidth : -screenWidth;
        
        translateX.value = withSpring(targetX, { damping: 15 });
        translateY.value = withSpring(event.translationY, { damping: 15 });
        
        runOnJS(onSwipe)(direction);
      } else {
        // Snap back
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, screenWidth * 0.5],
      [1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: isTop ? opacity : 1,
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, screenWidth * 0.3],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-screenWidth * 0.3, 0],
      [1, 0],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <PanGestureHandler onGestureEvent={panGestureEvent} enabled={isTop}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image
          source={{ uri: profile.photos[0] }}
          style={styles.cardImage}
          contentFit="cover"
        />
        
        {/* Like overlay */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, likeStyle]}>
          <Text style={styles.overlayText}>LIKE</Text>
        </Animated.View>
        
        {/* Nope overlay */}
        <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeStyle]}>
          <Text style={styles.overlayText}>NOPE</Text>
        </Animated.View>

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
              <Text style={styles.distance}>{profile.distance} km away</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </PanGestureHandler>
  );
}

export default function DiscoverScreen() {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    console.log(`Swiped ${direction} on ${profiles[currentIndex]?.name}`);
    
    // TODO: In Component 3, this will call the swipe service
    // swipeService.recordSwipe(profiles[currentIndex].id, direction);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      
      if (currentIndex >= profiles.length - 1) {
        // Load more profiles or show "no more cards" message
        Alert.alert('No more profiles', 'Check back later for more matches!');
      }
    }, 300);
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (currentIndex < profiles.length) {
      handleSwipe(direction);
    }
  };

  const renderCards = () => {
    return profiles.map((profile, index) => {
      if (index < currentIndex) return null;
      
      const isTop = index === currentIndex;
      const style = isTop ? {} : {
        transform: [{ scale: 0.95 }],
        opacity: 0.8,
      };

      return (
        <View
          key={profile.id}
          style={[styles.cardContainer, style, { zIndex: profiles.length - index }]}
        >
          <SwipeCard
            profile={profile}
            isTop={isTop}
            onSwipe={handleSwipe}
          />
        </View>
      );
    }).filter(Boolean);
  };

  if (currentIndex >= profiles.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#FF4458" />
          <Text style={styles.emptyTitle}>No more profiles!</Text>
          <Text style={styles.emptySubtitle}>Check back later for more potential matches</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              setCurrentIndex(0);
              // TODO: Reload profiles from server
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

      <View style={styles.cardsContainer}>
        {renderCards()}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleButtonSwipe('left')}
        >
          <Ionicons name="close" size={30} color="#FF4458" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
        >
          <Ionicons name="star" size={24} color="#00ACED" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleButtonSwipe('right')}
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
  cardContainer: {
    position: 'absolute',
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
  overlay: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 3,
    borderRadius: 10,
    transform: [{ rotate: '-20deg' }],
  },
  likeOverlay: {
    right: 20,
    borderColor: '#4FC3F7',
  },
  nopeOverlay: {
    left: 20,
    borderColor: '#FF4458',
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
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
    marginHorizontal: 15,
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
  superLikeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#00ACED',
    width: 50,
    height: 50,
    borderRadius: 25,
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