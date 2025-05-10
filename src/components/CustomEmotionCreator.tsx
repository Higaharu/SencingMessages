import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView
} from 'react-native';
import { Emotion, AnimationType, VibrationPattern } from '../types';
import { EmojiPicker } from './EmojiPicker';
import { createCustomEmotion, saveCustomEmotion } from '../utils/customEmotions';
import { EmotionBubble } from './EmotionBubble';

interface CustomEmotionCreatorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (emotion: Emotion) => void;
  initialEmotion?: Emotion | null;
}

export const CustomEmotionCreator: React.FC<CustomEmotionCreatorProps> = ({
  visible,
  onClose,
  onSave,
  initialEmotion = null
}) => {
  const [emoji, setEmoji] = useState('😊');
  const [intensity, setIntensity] = useState(0.5);
  const [animationType, setAnimationType] = useState(AnimationType.PULSE);
  const [vibrationPattern, setVibrationPattern] = useState(VibrationPattern.GENTLE);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // デフォルトカラー
  const defaultColor = '#FFD700';
  const defaultSecondaryColor = '#FFA500';

  // 初期値の設定
  useEffect(() => {
    if (visible) {
      if (initialEmotion) {
        setEmoji(initialEmotion.emoji || '😊');
        // 強度は常に一定のデフォルト値に設定
        setIntensity(0.5);
        setAnimationType(initialEmotion.animationType);
        setVibrationPattern(initialEmotion.vibrationPattern);
      } else {
        // 新規作成時のデフォルト値
        setEmoji('😊');
        setIntensity(0.5);
        setAnimationType(AnimationType.PULSE);
        setVibrationPattern(VibrationPattern.GENTLE);
      }
    }
  }, [initialEmotion, visible]);

  // プレビュー用の感情オブジェクト
  const previewEmotion: Emotion = {
    id: initialEmotion ? initialEmotion.id : 'preview',
    name: emoji, // 名前として絵文字を使用
    description: `カスタム感情: ${emoji}`,
    color: defaultColor,
    secondaryColor: defaultSecondaryColor,
    intensity,
    animationType,
    vibrationPattern,
    emoji
  };

  // 保存処理
  const handleSave = async () => {
    const newEmotion = initialEmotion 
      ? { 
          ...initialEmotion, 
          name: emoji, // 名前として絵文字を使用
          emoji, 
          intensity, 
          animationType, 
          vibrationPattern 
        }
      : createCustomEmotion(
          emoji, // 名前として絵文字を使用
          emoji, 
          defaultColor, 
          defaultSecondaryColor, 
          animationType, 
          vibrationPattern, 
          intensity
        );
    
    // 保存して結果を通知
    const result = await saveCustomEmotion(newEmotion);
    if (result) {
      onSave(newEmotion);
      onClose();
    } else {
      if (Platform.OS === 'web') {
        alert('保存に失敗しました');
      } else {
        Alert.alert('エラー', '保存に失敗しました');
      }
    }
  };

  // Webブラウザ用のレンダリング
  if (Platform.OS === 'web') {
    return (
      <>
        <Modal
          visible={visible}
          transparent={true}
          onRequestClose={onClose}
        >
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999,
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                width: '90%',
                maxWidth: 500,
                maxHeight: '80%',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
              }}
            >
              <h2 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>
                {initialEmotion ? '感情を編集' : '新しい感情を作成'}
              </h2>

              {/* プレビュー */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <EmotionBubble
                  emotion={previewEmotion}
                  size={80}
                  autoAnimate={true}
                  useEmoji={true}
                />
              </div>

              {/* 絵文字選択 */}
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>絵文字</label>
                <div
                  onClick={() => setShowEmojiPicker(true)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    fontSize: 24,
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {emoji}
                </div>
              </div>

              {/* アニメーション選択 */}
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>アニメーション</label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                }}>
                  {Object.values(AnimationType).map((type) => (
                    <div
                      key={type}
                      onClick={() => setAnimationType(type as AnimationType)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 20,
                        backgroundColor: animationType === type ? '#e1f5fe' : '#f5f5f5',
                        cursor: 'pointer',
                        fontWeight: animationType === type ? 'bold' : 'normal',
                      }}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              {/* ボタン */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 20,
              }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    flex: 1,
                    marginRight: 10,
                  }}
                >
                  キャンセル
                </button>

                <button
                  onClick={handleSave}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </Modal>

        <EmojiPicker
          visible={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelectEmoji={(selectedEmoji) => {
            setEmoji(selectedEmoji);
            setShowEmojiPicker(false);
          }}
        />
      </>
    );
  }

  // モバイル用のレンダリング
  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>
              {initialEmotion ? '感情を編集' : '新しい感情を作成'}
            </Text>

            {/* プレビュー */}
            <View style={styles.previewContainer}>
              <EmotionBubble
                emotion={previewEmotion}
                size={80}
                autoAnimate={true}
                useEmoji={true}
              />
            </View>

            {/* 絵文字選択 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>絵文字</Text>
              <TouchableOpacity
                style={styles.emojiSelector}
                onPress={() => setShowEmojiPicker(true)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            </View>

            {/* アニメーション選択 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>アニメーション</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.animationContainer}
              >
                {Object.values(AnimationType).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.animationOption,
                      animationType === type && styles.selectedAnimation
                    ]}
                    onPress={() => setAnimationType(type as AnimationType)}
                  >
                    <Text style={animationType === type ? styles.selectedAnimationText : styles.animationText}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ボタン */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>キャンセル</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelectEmoji={(selectedEmoji) => {
          setEmoji(selectedEmoji);
          setShowEmojiPicker(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emojiSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  animationContainer: {
    flexDirection: 'row',
    padding: 5,
  },
  animationOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  selectedAnimation: {
    backgroundColor: '#e1f5fe',
  },
  animationText: {
    fontSize: 14,
  },
  selectedAnimationText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 