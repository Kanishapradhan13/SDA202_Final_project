import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock user data - will be replaced with real data from store in Component 2
const mockUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  age: 28,
  email: 'john.doe@example.com',
  photos: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  ],
  bio: 'Love hiking, good coffee, and meeting new people. Always up for an adventure! 🏔️☕',
  interests: ['Hiking', 'Photography', 'Coffee', 'Travel', 'Music', 'Cooking'],
  job: 'Software Engineer',
  school: 'University of Technology',
  location: 'San Francisco, CA',
  distance: 5,
  lookingFor: 'Long-term relationship',
};

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
}

function SettingItem({ icon, title, subtitle, onPress, showArrow = true }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={24} color="#FF4458" />
        </View>
        <View>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const [user] = useState(mockUser);

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };

  const handleEditPhotos = () => {
    // TODO: Navigate to photo management screen
    Alert.alert('Edit Photos', 'Photo editing coming soon!');
  };

  const handleSettings = () => {
    // TODO: Navigate to settings screen
    Alert.alert('Settings', 'Settings screen coming soon!');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy & Safety', 'Privacy settings coming soon!');
  };

  const handleSupport = () => {
    Alert.alert('Help & Support', 'Support options coming soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout logic in Component 3
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photos */}
        <View style={styles.photosSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosContainer}
          >
            {user.photos.map((photo, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.photoContainer,
                  index === 0 && styles.mainPhoto
                ]}
                onPress={handleEditPhotos}
              >
                <Image 
                  source={{ uri: photo }} 
                  style={styles.photo}
                  contentFit="cover"
                />
                {index === 0 && (
                  <View style={styles.mainPhotoOverlay}>
                    <Ionicons name="camera" size={24} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            
            {/* Add Photo Button */}
            <TouchableOpacity 
              style={styles.addPhotoButton}
              onPress={handleEditPhotos}
            >
              <Ionicons name="add" size={30} color="#FF4458" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Basic Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.age}>{user.age}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="briefcase-outline" size={18} color="#666" />
            <Text style={styles.infoText}>{user.job}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="school-outline" size={18} color="#666" />
            <Text style={styles.infoText}>{user.school}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.infoText}>{user.location}</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {user.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <SettingItem
            icon="settings-outline"
            title="App Settings"
            subtitle="Notifications, Discovery, etc."
            onPress={handleSettings}
          />
          
          <SettingItem
            icon="shield-outline"
            title="Privacy & Safety"
            subtitle="Control your privacy"
            onPress={handlePrivacy}
          />
          
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help or contact us"
            onPress={handleSupport}
          />
          
          <SettingItem
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            showArrow={false}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>TinderClone v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with ❤️ for learning</Text>
        </View>
      </ScrollView>
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
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF4458',
  },
  editButtonText: {
    color: '#FF4458',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  photosSection: {
    backgroundColor: 'white',
    paddingVertical: 20,
    marginBottom: 10,
  },
  photosContainer: {
    paddingHorizontal: 20,
  },
  photoContainer: {
    width: 120,
    height: 160,
    borderRadius: 12,
    marginRight: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  mainPhoto: {
    width: 140,
    height: 180,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  mainPhotoOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 120,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF4458',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    minHeight: 150,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  age: {
    fontSize: 24,
    color: '#666',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#fff0f1',
    borderColor: '#FF4458',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  interestText: {
    color: '#FF4458',
    fontSize: 14,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  appInfoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
});