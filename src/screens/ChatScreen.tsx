import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
} from 'react-native';
import { EmotionMessage } from '../components/EmotionMessage';
import { EmotionInput } from '../components/EmotionInput';
import { Message, User, AnimationType, VibrationPattern } from '../types';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';
import { UserAvatar } from '../components/UserAvatar';

// Sample users for demonstration
const CURRENT_USER: User = {
  id: 'user1',
  name: 'あなた',
  // 自分のアバターは設定しない（絵文字が使われる）
};

// 友人ユーザー - アバター画像がある
const OTHER_USER_WITH_AVATAR: User = {
  id: 'user2',
  name: '友人',
  avatar: 'https://randomuser.me/api/portraits/women/68.jpg', // アバター画像あり
};

// 友人ユーザー - アバターなし（絵文字が使われる）
const OTHER_USER_NO_AVATAR: User = {
  id: 'user3',
  name: '同僚',
  // アバターなし
};

// 使用するユーザーを選択（テスト用に切り替え可能）
// true: アバター画像あり, false: アバター画像なし（絵文字使用）
const USE_AVATAR = true;
const OTHER_USER = USE_AVATAR ? OTHER_USER_WITH_AVATAR : OTHER_USER_NO_AVATAR;

// Sample messages for demonstration
const createInitialMessages = (): Message[] => {
  return [
    {
      id: '1',
      senderId: OTHER_USER.id,
      receiverId: CURRENT_USER.id,
      emotion: {
        id: 'joy',
        name: '喜び',
        description: '幸せで満たされた気持ち',
        color: '#FFD700',
        secondaryColor: '#FFA500',
        intensity: 0.8,
        animationType: AnimationType.BOUNCE,
        vibrationPattern: VibrationPattern.RHYTHMIC,
        emoji: '😊',
      },
      textContent: 'こんにちは！感情チャットへようこそ！',
      timestamp: Date.now() - 3600000,
      isRead: true,
    },
    {
      id: '2',
      senderId: CURRENT_USER.id,
      receiverId: OTHER_USER.id,
      emotion: {
        id: 'excitement',
        name: '興奮',
        description: '高揚した気持ち',
        color: '#FF6347',
        secondaryColor: '#FF7F50',
        intensity: 1.0,
        animationType: AnimationType.PULSE,
        vibrationPattern: VibrationPattern.INTENSE,
        emoji: '🤩',
      },
      textContent: 'やった！メッセージが送れました！',
      timestamp: Date.now() - 1800000,
      isRead: true,
    },
    {
      id: '3',
      senderId: OTHER_USER.id,
      receiverId: CURRENT_USER.id,
      emotion: {
        id: 'love',
        name: '愛',
        description: '深い愛情や思いやり',
        color: '#FF69B4',
        secondaryColor: '#FF1493',
        intensity: 0.7,
        animationType: AnimationType.PULSE,
        vibrationPattern: VibrationPattern.GENTLE,
        emoji: '❤️',
      },
      textContent: '絵文字を使って感情を表現してみてね！',
      timestamp: Date.now() - 900000,
      isRead: true,
    },
  ];
};

interface ChatScreenProps {
  navigation?: any;
  route?: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const [messages, setMessages] = useState<Message[]>(createInitialMessages());
  const flatListRef = useRef<FlatList>(null);
  const webScrollRef = useRef<HTMLDivElement | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [windowHeight, setWindowHeight] = useState(Dimensions.get('window').height);
  const [isMessageAdded, setIsMessageAdded] = useState(false);

  useEffect(() => {
    console.log('ChatScreen mounted', { messagesCount: messages.length });
    
    // Debug emotion types
    console.log('Available emotion types:', Object.values(AnimationType));
    console.log('Available vibration patterns:', Object.values(VibrationPattern));

    // キーボードイベントのリスナーを追加
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => scrollToBottom(true), 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // ウィンドウのリサイズイベントを監視（Webのみ）
    if (Platform.OS === 'web') {
      const handleResize = () => {
        setWindowHeight(Dimensions.get('window').height);
        setTimeout(() => scrollToBottom(false), 100);
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }

    return () => {
      console.log('ChatScreen unmounted');
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Webでのスクロール処理
  const scrollWebToBottom = () => {
    if (webScrollRef.current) {
      console.log('Scrolling web container to bottom');
      const scrollContainer = webScrollRef.current;
      // アニメーションなしでまず最下部へスクロール
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      
      // 少し遅延してアニメーション付きで再スクロール（より確実に最下部に到達するため）
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }, 50);
    }
  };

  // スクロール位置を最下部に維持する関数
  const scrollToBottom = (animated = true) => {
    if (Platform.OS === 'web') {
      scrollWebToBottom();
      return;
    }

    if (flatListRef.current && messages.length > 0) {
      console.log('Scrolling native flatlist to bottom');
      // まず即座にスクロール
      flatListRef.current.scrollToEnd({ animated: false });

      // 少し遅延してアニメーション付きで再スクロール
      setTimeout(() => {
        try {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated });
          }
        } catch (error) {
          console.error('Error scrolling to end:', error);
        }
      }, 100);
    }
  };

  // メッセージが変更されたときに最下部にスクロール
  useEffect(() => {
    if (isMessageAdded) {
      console.log('Messages updated, scrolling to bottom');
      scrollToBottom();
      setIsMessageAdded(false);
    }
  }, [messages, isMessageAdded]);

  // レイアウト変更時に最下部にスクロール
  const handleLayoutChange = () => {
    scrollToBottom(false);
  };

  const handleSendMessage = (newMessageData: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    console.log('New message data:', {
      emotion: newMessageData.emotion.name,
      hasText: !!newMessageData.textContent,
    });
    
    try {
      // 感情オブジェクトのディープコピーを作成して独立させる
      const emotionClone = { ...newMessageData.emotion };
      
      const newMessage: Message = {
        ...newMessageData,
        // ディープコピーした感情を使用
        emotion: emotionClone,
        id: uuidv4(),
        timestamp: Date.now(),
        isRead: false,
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);
      setIsMessageAdded(true);
      
      // メッセージ送信後すぐにスクロール
      setTimeout(() => scrollToBottom(true), 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('エラー', 'メッセージの送信に失敗しました');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.senderId === CURRENT_USER.id;
    return <EmotionMessage message={item} isUser={isUser} />;
  };

  const handleGoBack = () => {
    console.log('Navigating back');
    navigation?.goBack();
  };

  // Webブラウザ向けのカスタムレンダリング
  if (Platform.OS === 'web') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        backgroundColor: '#F5F5F5'
      }}>
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E0E0E0',
          zIndex: 10,
        }}>
          <div onClick={handleGoBack} style={{ 
            padding: 8, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ marginRight: 10 }}>
              <UserAvatar user={OTHER_USER} size={30} useAnimalEmoji={true} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{OTHER_USER.name}</div>
          </div>
          <div style={{ width: 40 }} />
        </div>

        {/* メッセージエリア - 固定高さでスクロール可能 */}
        <div 
          ref={webScrollRef}
          style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '16px 8px',
            scrollBehavior: 'smooth'
          }}
          onScroll={() => setIsScrolling(true)}
          onScrollEnd={() => setIsScrolling(false)}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onLayout={handleLayoutChange}
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            onMomentumScrollEnd={() => setIsScrolling(false)}
          />
        </div>

        {/* 入力エリア - 画面下部に固定 */}
        <div style={{ 
          position: 'sticky',
          bottom: 0,
          width: '100%',
          backgroundColor: '#F5F5F5',
          borderTop: '1px solid #E0E0E0',
          zIndex: 100,
        }}>
          <EmotionInput
            onSendMessage={handleSendMessage}
            senderId={CURRENT_USER.id}
            receiverId={OTHER_USER.id}
          />
        </div>
      </div>
    );
  }

  // モバイル向けのレンダリング
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={{ marginRight: 10 }}>
            <UserAvatar user={OTHER_USER} size={30} useAnimalEmoji={true} />
          </View>
          <Text style={styles.headerTitle}>{OTHER_USER.name}</Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>
      
      <KeyboardAvoidingView 
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onLayout={handleLayoutChange}
            onScrollBeginDrag={() => setIsScrolling(true)}
            onScrollEndDrag={() => setIsScrolling(false)}
            onMomentumScrollEnd={() => setIsScrolling(false)}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            onContentSizeChange={() => {
              if (isMessageAdded) {
                scrollToBottom(true);
              }
            }}
            onScrollToIndexFailed={(info) => {
              console.warn('Scroll to index failed:', info);
              setTimeout(() => {
                scrollToBottom(true);
              }, 200);
            }}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <EmotionInput
            onSendMessage={handleSendMessage}
            senderId={CURRENT_USER.id}
            receiverId={OTHER_USER.id}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
}); 