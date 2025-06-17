import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const MATCH_CARD_WIDTH = (width - 60) / 2;

// Mock data - will be replaced with real data from store in Component 2
const mockMatches = [
  {
    id: '1',
    name: 'Sarah',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b515?w=400',
    lastMessage: 'Hey! How are you?',
    timestamp: '2 hours ago',
    unread: true,
  },
  {
    id: '2',
    name: 'Emma',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    lastMessage: 'That sounds great!',
    timestamp: '1 day ago',
    unread: false,
  },
  {
    id: '3',
    name: 'Jessica',
    age: 28,
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    lastMessage: 'See you soon 😊',
    timestamp: '3 days ago',
    unread: false,
  },
  {
    id: '4',
    name: 'Ashley',
    age: 26,
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    lastMessage: 'Nice to meet you!',
    timestamp: '1 week ago',
    unread: true,
  },
];

const mockNewMatches = [
  {
    id: '5',
    name: 'Olivia',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400',
    matchedAt: '5 minutes ago',
  },
  {
    id: '6',
    name: 'Sophia',
    age: 27,
    photo: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=400',
    matchedAt: '2 hours ago',
  },
];

interface MatchCardProps {
  match: typeof mockNewMatches[0];
}

function NewMatchCard({ match }: MatchCardProps) {
  return (
    <TouchableOpacity 
      style={styles.newMatchCard}
      onPress={() => router.push(`/chat/${match.id}`)}
    >
      <Image 
        source={{ uri: match.photo }} 
        style={styles.newMatchImage}
        contentFit="cover"
      />
      <Text style={styles.newMatchName}>{match.name}</Text>
      <Text style={styles.matchTime}>{match.matchedAt}</Text>
    </TouchableOpacity>
  );
}

interface ConversationCardProps {
  match: typeof mockMatches[0];
}

function ConversationCard({ match }: ConversationCardProps) {
  return (
    <TouchableOpacity 
      style={styles.conversationCard}
      onPress={() => router.push(`/chat/${match.id}`)}
    >
      <View style={styles.conversationImageContainer}>
        <Image 
          source={{ uri: match.photo }} 
          style={styles.conversationImage}
          contentFit="cover"
        />
        {match.unread && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{match.name}</Text>
          <Text style={styles.conversationTime}>{match.timestamp}</Text>
        </View>
        <Text 
          style={[
            styles.lastMessage,
            match.unread && styles.unreadMessage
          ]}
          numberOfLines={1}
        >
          {match.lastMessage}
        </Text>
      </View>
      
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color="#ccc" 
      />
    </TouchableOpacity>
  );
}

export default function MatchesScreen() {
  const [activeTab, setActiveTab] = useState<'matches' | 'messages'>('matches');

  const renderNewMatches = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>New Matches</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.newMatchesContainer}
      >
        {mockNewMatches.map(match => (
          <NewMatchCard key={match.id} match={match} />
        ))}
      </ScrollView>
    </View>
  );

  const renderConversations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Messages</Text>
      <ScrollView style={styles.conversationsContainer}>
        {mockMatches.map(match => (
          <ConversationCard key={match.id} match={match} />
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#FF4458" />
      <Text style={styles.emptyTitle}>No matches yet</Text>
      <Text style={styles.emptySubtitle}>
        Keep swiping to find your perfect match!
      </Text>
      <TouchableOpacity 
        style={styles.discoverButton}
        onPress={() => router.push('/(tabs)/discover')}
      >
        <Text style={styles.discoverButtonText}>Start Swiping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color="#FF4458" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab,
            activeTab === 'matches' && styles.activeTab
          ]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'matches' && styles.activeTabText
          ]}>
            Matches ({mockNewMatches.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab,
            activeTab === 'messages' && styles.activeTab
          ]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'messages' && styles.activeTabText
          ]}>
            Messages ({mockMatches.filter(m => m.unread).length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'matches' ? (
          mockNewMatches.length > 0 ? renderNewMatches() : renderEmptyState()
        ) : (
          renderConversations()
        )}
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
  filterButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF4458',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FF4458',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 10,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  newMatchesContainer: {
    paddingHorizontal: 20,
  },
  newMatchCard: {
    width: MATCH_CARD_WIDTH,
    marginRight: 15,
    alignItems: 'center',
  },
  newMatchImage: {
    width: MATCH_CARD_WIDTH,
    height: MATCH_CARD_WIDTH * 1.2,
    borderRadius: 12,
    marginBottom: 8,
  },
  newMatchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 12,
    color: '#666',
  },
  conversationsContainer: {
    flex: 1,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  conversationImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  conversationImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4458',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 24,
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
  discoverButton: {
    backgroundColor: '#FF4458',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  discoverButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});