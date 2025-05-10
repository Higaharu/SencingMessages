import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
  Vibration,
  Pressable,
} from 'react-native';
import { Emotion, Message } from '../types';
import { EmotionSelector } from './EmotionSelector';
import { EmotionBubble } from './EmotionBubble';
import { Ionicons } from '@expo/vector-icons';
import { getEmotionById, predefinedEmotions } from '../utils/emotions';

// Webブラウザ用のスタイルを定義
const webStyles = Platform.OS === 'web' ? {
  pointer: { cursor: 'pointer' },
  default: { cursor: 'default' }
} : {};

interface EmotionInputProps {
  onSendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void;
  senderId: string;
  receiverId: string;
}

export const EmotionInput: React.FC<EmotionInputProps> = ({
  onSendMessage,
  senderId,
  receiverId,
}) => {
  const [text, setText] = useState('');
  const [showEmotionSelector, setShowEmotionSelector] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(
    // Default to first emotion if joy is not found
    getEmotionById('joy') || predefinedEmotions[0]
  );
  const [debugMessage, setDebugMessage] = useState<string>('');

  useEffect(() => {
    // Log initial emotion
    console.log('Initial emotion:', selectedEmotion?.name);
  }, []);

  // モーダル表示状態の変更を監視
  useEffect(() => {
    console.log('Modal visibility changed:', showEmotionSelector);
    setDebugMessage(`Modal: ${showEmotionSelector ? 'OPEN' : 'CLOSED'}`);
  }, [showEmotionSelector]);

  const handleSendMessage = useCallback(() => {
    if (!selectedEmotion) {
      Alert.alert('送信エラー', '感情を選択してください');
      return;
    }

    console.log('Sending message with emotion:', selectedEmotion.name, 'intensity:', selectedEmotion.intensity);
    // 現在選択されている感情のディープコピーを作成
    const emotionToSend = {...selectedEmotion};
    
    onSendMessage({
      senderId,
      receiverId,
      emotion: emotionToSend,
      textContent: text.trim() || undefined,
    });

    // タッチフィードバック
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate([0, 50, 50, 100]); // パターン振動
      } catch (error) {
        console.error('Vibration error:', error);
      }
    }

    // Reset input
    setText('');
    
    // 送信後も感情強度を維持
    // コメントアウトしてリセットしないように変更
    /*
    if (selectedEmotion) {
      // 現在選択されている感情の絵文字や種類を維持したまま強度のみリセット
      setSelectedEmotion(prevEmotion => {
        if (!prevEmotion) return null;
        return {
          ...prevEmotion,
          intensity: 0.5 // デフォルトの強度値
        };
      });
    }
    */
  }, [text, selectedEmotion, onSendMessage, senderId, receiverId]);

  const handleSelectEmotion = useCallback((emotion: Emotion) => {
    console.log('Emotion selected in EmotionInput:', emotion.name, 'emoji:', emotion.emoji, 'intensity:', emotion.intensity);
    // 選択された感情の完全なコピーを保存 (強度情報を含む)
    setSelectedEmotion({...emotion});
    setShowEmotionSelector(false);
    setDebugMessage(`選択完了: ${emotion.name}, 絵文字: ${emotion.emoji || 'なし'}, 強度: ${emotion.intensity}`);
  }, []);

  const toggleEmotionSelector = useCallback(() => {
    console.log('Toggle emotion selector called, platform:', Platform.OS);
    setShowEmotionSelector(prev => !prev);
    
    // タッチフィードバック (モバイルのみ)
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(50); // 短い振動
      } catch (error) {
        console.error('Vibration error:', error);
      }
    }
  }, []);

  // ブラウザ環境でのクリックイベントを強化
  const handleWebClick = useCallback((e: any) => {
    console.log('Web click detected');
    e.preventDefault();
    toggleEmotionSelector();
  }, [toggleEmotionSelector]);

  // Webのカスタムレンダリング
  const renderWebVersion = () => {
    // 絵文字表示用にユニークなキーを生成
    const selectedEmotionKey = selectedEmotion ? `${selectedEmotion.id}-${Date.now()}` : 'empty';
    
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '10px 16px',
          backgroundColor: '#f8f8f8',
          borderTopWidth: 1,
          borderTopStyle: 'solid',
          borderTopColor: '#e0e0e0',
          width: '100%',
        }}
      >
        <div 
          onClick={toggleEmotionSelector} 
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            width: 80,
            minHeight: 80,
            padding: 10,
            marginRight: 8,
            backgroundColor: showEmotionSelector ? 'rgba(52, 152, 219, 0.15)' : 'rgba(0,0,0,0.05)',
            border: showEmotionSelector 
              ? '1px solid rgba(52, 152, 219, 0.5)' 
              : '1px solid rgba(0,0,0,0.1)',
            zIndex: 10,
          }}
        >
          <div style={{ 
            marginBottom: 5,
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {selectedEmotion && (
              <div key={selectedEmotionKey}>
                {selectedEmotion.emoji ? (
                  <span style={{ fontSize: '40px' }}>{selectedEmotion.emoji}</span>
                ) : (
                  <EmotionBubble 
                    emotion={selectedEmotion} 
                    size={40} 
                    autoAnimate={false}
                    useEmoji={true}
                  />
                )}
              </div>
            )}
          </div>
          <span style={{ 
            fontSize: 10, 
            color: '#666', 
            marginTop: 4, 
            textAlign: 'center'
          }}>
            クリックして感情を選択
          </span>
        </div>

        <textarea
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 100,
            border: '1px solid #e0e0e0',
            borderRadius: 20,
            padding: '8px 16px',
            backgroundColor: 'white',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 1.5,
            overflow: 'auto'
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力（任意）"
          rows={1}
        />

        <div
          onClick={selectedEmotion ? handleSendMessage : undefined}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: selectedEmotion ? '#3498db' : '#bdc3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
            padding: 5,
            cursor: selectedEmotion ? 'pointer' : 'default',
          }}
        >
          <Ionicons name="send" size={24} color="white" />
        </div>
      </div>
    )
  }

  const renderMobileVersion = () => {
    // 絵文字表示用にユニークなキーを生成
    const selectedEmotionKey = selectedEmotion ? `${selectedEmotion.id}-${Date.now()}` : 'empty';
    
    return (
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[
            styles.emotionButton,
            showEmotionSelector && styles.emotionButtonActive,
          ]}
          onPress={toggleEmotionSelector}
          activeOpacity={0.6}
          accessibilityLabel="感情を選択"
          accessibilityHint="タップして感情を選択する画面を開きます"
        >
          <View style={styles.emotionBubbleContainer}>
            {selectedEmotion ? (
              <View key={selectedEmotionKey}>
                {selectedEmotion.emoji ? (
                  <Text style={{ fontSize: 40 }}>{selectedEmotion.emoji}</Text>
                ) : (
                  <EmotionBubble 
                    emotion={selectedEmotion} 
                    size={40} 
                    autoAnimate={false}
                    useEmoji={true}
                  />
                )}
              </View>
            ) : (
              <View style={styles.emptyEmotionButton}>
                <Ionicons name="happy-outline" size={24} color="#888" />
              </View>
            )}
          </View>
          <Text style={styles.emotionSelectorHint}>
            タップして感情を選択
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder="メッセージを入力（任意）"
          multiline={true}
          maxLength={200}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            !selectedEmotion && styles.disabledSendButton,
          ]}
          onPress={handleSendMessage}
          disabled={!selectedEmotion}
          activeOpacity={0.6}
          accessibilityLabel="送信"
          accessibilityHint="メッセージを送信します"
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      {Platform.OS === 'web' ? renderWebVersion() : renderMobileVersion()}
      
      {/* デバッグ情報 */}
      {debugMessage ? (
        <Text style={styles.debugText}>
          {debugMessage} | 感情: {selectedEmotion?.emoji || selectedEmotion?.name} | {Platform.OS}
        </Text>
      ) : null}

      {/* EmotionSelector component */}
      <EmotionSelector
        visible={showEmotionSelector}
        onClose={() => {
          console.log('EmotionSelector closed by onClose');
          setShowEmotionSelector(false);
        }}
        onSelectEmotion={handleSelectEmotion}
        initialEmotion={selectedEmotion}
        key={`selector-${showEmotionSelector}`}
      />
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  emotionButton: {
    marginRight: 8,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  emotionButtonActive: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    borderColor: 'rgba(52, 152, 219, 0.5)',
  },
  emotionButtonPressed: {
    backgroundColor: 'rgba(52, 152, 219, 0.3)',
    transform: Platform.OS === 'web' ? [{ scale: 0.95 }] : undefined,
  },
  emotionBubbleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    width: 50,
    height: 50,
  },
  emotionSelectorHint: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyEmotionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 5,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginHorizontal: 8,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    padding: 5,
  },
  disabledSendButton: {
    backgroundColor: '#bdc3c7',
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    padding: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
}); 