import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Conversation, User, AnimationType, VibrationPattern } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { getEmotionById } from '../utils/emotions';
import { EmotionBubble } from '../components/EmotionBubble';
import { UserAvatar } from '../components/UserAvatar';

// Sample conversations for demonstration
const CURRENT_USER: User = {
  id: 'user1',
  name: 'あなた',
};

const SAMPLE_USERS: User[] = [
  {
    id: 'user2',
    name: 'ジェニー',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg', // アバター画像あり
  },
  {
    id: 'user3',
    name: 'アン',
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg', // アバター画像あり
    // アバターなし - 絵文字が使用される
  },
  {
    id: 'user4',
    name: 'マイケル',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg', // アバター画像あり
  },
];

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    participants: [CURRENT_USER, SAMPLE_USERS[0]],
    lastMessage: {
      id: 'msg1',
      senderId: SAMPLE_USERS[0].id,
      receiverId: CURRENT_USER.id,
      emotion: getEmotionById('joy') || {
        id: 'joy',
        name: '喜び',
        description: '幸せで満たされた気持ち',
        color: '#FFD700',
        secondaryColor: '#FFA500',
        intensity: 0.8,
        animationType: AnimationType.PULSE,
        vibrationPattern: VibrationPattern.GENTLE,
      },
      textContent: 'それなら良かった。またご飯に行きましょう！',
      timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      isRead: false,
    },
    unreadCount: 1,
  },
  {
    id: 'conv2',
    participants: [CURRENT_USER, SAMPLE_USERS[1]],
    lastMessage: {
      id: 'msg2',
      senderId: CURRENT_USER.id,
      receiverId: SAMPLE_USERS[1].id,
      emotion: getEmotionById('gratitude') || {
        id: 'gratitude',
        name: '感謝',
        description: '感謝の気持ち',
        color: '#9ACD32',
        secondaryColor: '#7CFC00',
        intensity: 0.7,
        animationType: AnimationType.EXPAND,
        vibrationPattern: VibrationPattern.GENTLE,
      },
      textContent: '昨日はありがとう',
      timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: 'conv3',
    participants: [CURRENT_USER, SAMPLE_USERS[2]],
    lastMessage: {
      id: 'msg3',
      senderId: SAMPLE_USERS[2].id,
      receiverId: CURRENT_USER.id,
      emotion: getEmotionById('excitement') || {
        id: 'excitement',
        name: '興奮',
        description: '高揚した気持ち',
        color: '#FF6347',
        secondaryColor: '#FF7F50',
        intensity: 0.85,
        animationType: AnimationType.BOUNCE,
        vibrationPattern: VibrationPattern.RHYTHMIC,
      },
      textContent: '新しいスニーカーを買ったぜ！！',
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      isRead: true,
    },
    unreadCount: 0,
  },
];

interface HomeScreenProps {
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS);

  const getOtherUser = (conversation: Conversation): User => {
    return conversation.participants.find(
      (participant) => participant.id !== CURRENT_USER.id
    ) || conversation.participants[0];
  };

  const navigateToChat = (conversation: Conversation) => {
    navigation?.navigate('Chat', { conversationId: conversation.id });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherUser(item);
    const lastMessage = item.lastMessage;
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigateToChat(item)}
      >
        <View style={styles.avatarContainer}>
          <UserAvatar user={otherUser} size={50} useAnimalEmoji={true} />
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text
              style={[
                styles.userName,
                isUnread && styles.unreadText,
              ]}
            >
              {otherUser.name}
            </Text>
            {lastMessage && (
              <Text style={styles.timestamp}>
                {formatTime(lastMessage.timestamp)}
              </Text>
            )}
          </View>

          <View style={styles.lastMessageContainer}>
            {lastMessage && (
              <View style={styles.emotionPreview}>
                <EmotionBubble emotion={lastMessage.emotion} size={24} />
                {lastMessage.textContent && (
                  <Text
                    style={[
                      styles.lastMessageText,
                      isUnread && styles.unreadText,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {lastMessage.textContent}
                  </Text>
                )}
              </View>
            )}

            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Format timestamp to a human-readable string
  const formatTime = (timestamp: number): string => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today, show time
      return messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      // Yesterday
      return '昨日';
    } else if (diffDays < 7) {
      // Within a week
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      return days[messageDate.getDay()] + '曜日';
    } else {
      // More than a week ago
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>感情メッセージ</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Ionicons name="create-outline" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newChatButton: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#888888',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emotionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lastMessageText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#000000',
  },
  unreadBadge: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    height: 20,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 