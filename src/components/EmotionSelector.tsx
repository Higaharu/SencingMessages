import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  Alert,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Dimensions,
  Vibration,
  Pressable,
  TouchableHighlight,
} from 'react-native';
import { Emotion } from '../types';
import { EmotionBubble } from './EmotionBubble';
import { predefinedEmotions } from '../utils/emotions';
import { getCustomEmotions } from '../utils/customEmotions';
import { CustomEmotionCreator } from './CustomEmotionCreator';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface EmotionSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectEmotion: (emotion: Emotion) => void;
  initialEmotion?: Emotion | null;
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  visible,
  onClose,
  onSelectEmotion,
  initialEmotion = null,
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(initialEmotion || predefinedEmotions[0]);
  const [intensity, setIntensity] = useState<number>(initialEmotion?.intensity || 0.5);
  const [debugMessage, setDebugMessage] = useState('初期化中');
  const [customEmotions, setCustomEmotions] = useState<Emotion[]>([]);
  const [showCustomEmotionCreator, setShowCustomEmotionCreator] = useState(false);
  const [selectedCustomEmotion, setSelectedCustomEmotion] = useState<Emotion | null>(null);
  
  // カスタム感情の読み込み
  const loadCustomEmotions = useCallback(async () => {
    try {
      const emotions = await getCustomEmotions();
      setCustomEmotions(emotions);
    } catch (error) {
      console.error('Error loading custom emotions:', error);
    }
  }, []);
  
  // 画面サイズを取得
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const isSmallScreen = screenHeight < 700;
  const itemWidth = Math.floor((screenWidth - 40) / 3); // 項目の幅を計算

  // 初期化時の選択状態を設定
  useEffect(() => {
    console.log('EmotionSelector rendered, visible:', visible);
    console.log('Initial emotion:', initialEmotion?.name, initialEmotion?.emoji);
    
    if (visible) {
      if (initialEmotion) {
        // 初期値のディープコピーを作成し、現在の強度を保持
        const preservedEmotion = {
          ...initialEmotion,
          id: initialEmotion.id,
          name: initialEmotion.name,
          description: initialEmotion.description,
          color: initialEmotion.color,
          secondaryColor: initialEmotion.secondaryColor,
          emoji: initialEmotion.emoji, // 明示的に絵文字を保持
          animationType: initialEmotion.animationType,
          vibrationPattern: initialEmotion.vibrationPattern,
          intensity: initialEmotion.intensity // 現在の強度を保持
        };
        console.log('Setting selected emotion with emoji:', preservedEmotion.emoji, 'intensity:', preservedEmotion.intensity);
        setSelectedEmotion(preservedEmotion);
        setIntensity(initialEmotion.intensity); // スライダーも現在の強度で初期化
      } else if (predefinedEmotions.length > 0) {
        // Fallback to first emotion if none provided
        const defaultEmotion = {
          ...predefinedEmotions[0],
          intensity: 0.5
        };
        setSelectedEmotion(defaultEmotion);
        setIntensity(0.5);
      }
      
      loadCustomEmotions();
    }
    
    setDebugMessage(`表示状態: ${visible ? '表示中' : '非表示'}, 感情: ${initialEmotion?.name || '未選択'}, 絵文字: ${initialEmotion?.emoji || 'なし'}, 強度: ${initialEmotion?.intensity || 0.5}`);
  }, [initialEmotion, visible, loadCustomEmotions]);

  // メモ化された感情選択ハンドラー
  const handleSelectEmotion = useCallback((emotion: Emotion) => {
    console.log('Selecting emotion for confirmation:', emotion.name, 'emoji:', emotion.emoji);
    // Create a new emotion object with the current intensity
    const customizedEmotion: Emotion = {
      ...emotion,
      id: emotion.id,
      name: emotion.name,
      description: emotion.description,
      color: emotion.color,
      secondaryColor: emotion.secondaryColor,
      emoji: emotion.emoji, // 明示的に絵文字を保持
      animationType: emotion.animationType,
      vibrationPattern: emotion.vibrationPattern,
      intensity, // 現在のスライダー値を使用
    };
    
    setSelectedEmotion(customizedEmotion);
    setDebugMessage(`選択: ${emotion.name}, 絵文字: ${emotion.emoji || 'なし'}`);
    
    // タッチフィードバック
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(50); // 短い振動フィードバック
      } catch (error) {
        console.error('Vibration error:', error);
      }
    }
  }, [intensity]);

  // 確定ボタン処理
  const handleConfirmSelection = useCallback(() => {
    if (selectedEmotion) {
      console.log('Confirming emotion selection:', selectedEmotion.name, 'emoji:', selectedEmotion.emoji);
      // 完全なディープコピーを作成
      const customizedEmotion: Emotion = {
        ...selectedEmotion,
        id: selectedEmotion.id,
        name: selectedEmotion.name,
        description: selectedEmotion.description,
        color: selectedEmotion.color,
        secondaryColor: selectedEmotion.secondaryColor,
        emoji: selectedEmotion.emoji, // 明示的に絵文字を保持
        animationType: selectedEmotion.animationType,
        vibrationPattern: selectedEmotion.vibrationPattern,
        intensity, // 現在の強度を反映
      };
      
      onSelectEmotion(customizedEmotion);
      onClose();
    } else {
      Alert.alert('選択エラー', '感情を選択してください');
    }
  }, [selectedEmotion, intensity, onSelectEmotion, onClose]);

  // モーダルを閉じる処理
  const handleClose = useCallback(() => {
    console.log('Closing emotion selector modal');
    setDebugMessage('閉じる処理中');
    onClose();
  }, [onClose]);

  // モーダル外のタップでモーダルを閉じる処理（オプション）
  const handleOutsidePress = useCallback(() => {
    if (Platform.OS !== 'web') {  // ウェブでは動作しないようにする
      console.log('Outside of modal content pressed, closing');
      handleClose();
    }
  }, [handleClose]);

  // モーダル内のコンテンツタップはバブリングを防止
  const handleModalContentPress = useCallback((e: any) => {
    e.stopPropagation();
  }, []);

  // 強度変更のハンドラ
  const handleIntensityChange = useCallback((value: number) => {
    console.log('Intensity changed:', value);
    setIntensity(value);
    
    // 選択中の感情があれば、その強度も更新
    if (selectedEmotion) {
      setSelectedEmotion({
        ...selectedEmotion,
        intensity: value
      });
    }
  }, [selectedEmotion]);

  // カスタム感情保存ハンドラー
  const handleCustomEmotionSave = useCallback((emotion: Emotion) => {
    // カスタム感情を再読み込み
    loadCustomEmotions();
    
    // 保存した感情を選択する
    handleSelectEmotion(emotion);
    
    // モーダルを閉じる
    setShowCustomEmotionCreator(false);
    setSelectedCustomEmotion(null);
  }, [loadCustomEmotions, handleSelectEmotion]);

  // Webブラウザ対応: キーボードイベント処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        handleClose();
      }
    };
    
    if (Platform.OS === 'web') {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (Platform.OS === 'web') {
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [visible, handleClose]);

  // If not visible, don't render anything
  if (!visible) {
    return null;
  }

  // Web用のモーダルコンポーネント
  if (Platform.OS === 'web') {
    // Web用のカスタムスライダー
    const WebSlider = () => (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'center',
        marginBottom: 20,
        width: '100%'
      }}>
        <div style={{ fontSize: 16, marginRight: 10 }}>強度</div>
        <div style={{ 
          position: 'relative',
          flex: 1,
          height: 40, 
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={intensity}
            onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
            style={{
              width: '100%',
              margin: 0,
              padding: 0,
              backgroundColor: 'transparent',
              accentColor: '#3498db',
            }}
          />
        </div>
        <div style={{ fontSize: 16, marginLeft: 10, width: 45, textAlign: 'right' }}>
          {Math.round(intensity * 100)}%
        </div>
      </div>
    );

    return (
      <>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              height: '70%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h2 style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              marginBottom: 10, 
              textAlign: 'center' 
            }}>
              感情を選択
            </h2>
            
            <div style={{ 
              fontSize: 10, 
              color: '#999', 
              textAlign: 'center', 
              marginBottom: 10 
            }}>
              {debugMessage}
            </div>
            
            <WebSlider />
            
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              maxHeight: '60%'
            }}>
              {/* デフォルト感情 */}
              <h3 style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                marginBottom: 10,
                marginTop: 5,
                padding: '0 5px' 
              }}>
                基本感情
              </h3>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                padding: '0 5px',
                marginBottom: 20,
              }}>
                {predefinedEmotions.map((emotion) => (
                  <div
                    key={emotion.id}
                    onClick={() => handleSelectEmotion(emotion)}
                    style={{
                      padding: 10,
                      marginBottom: 10,
                      textAlign: 'center',
                      borderRadius: 10,
                      cursor: 'pointer',
                      backgroundColor: selectedEmotion?.id === emotion.id 
                        ? 'rgba(52, 152, 219, 0.2)' 
                        : 'transparent',
                      border: selectedEmotion?.id === emotion.id ? '2px solid rgba(52, 152, 219, 0.5)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '120px',
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1,
                    }} />
                    <EmotionBubble
                      emotion={{
                        ...emotion,
                        intensity,
                      }}
                      size={isSmallScreen ? 50 : 60}
                      withText={true}
                      autoAnimate={true}
                      useEmoji={true}
                    />
                  </div>
                ))}
              </div>
              
              {/* カスタム感情 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0 5px',
                marginBottom: 10,
              }}>
                <h3 style={{ 
                  fontSize: 16, 
                  fontWeight: 'bold',
                  margin: 0,
                }}>
                  カスタム感情
                </h3>
                <button
                  onClick={() => setShowCustomEmotionCreator(true)}
                  style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: 20,
                    padding: '5px 15px',
                    fontSize: 14,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ marginRight: 5 }}>+</span>
                  <span>追加</span>
                </button>
              </div>
              
              {customEmotions.length > 0 ? (
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  padding: '0 5px'
                }}>
                  {customEmotions.map((emotion) => (
                    <div
                      key={emotion.id}
                      onClick={() => handleSelectEmotion(emotion)}
                      style={{
                        padding: 10,
                        marginBottom: 10,
                        textAlign: 'center',
                        borderRadius: 10,
                        cursor: 'pointer',
                        backgroundColor: selectedEmotion?.id === emotion.id 
                          ? 'rgba(52, 152, 219, 0.2)' 
                          : 'transparent',
                        border: selectedEmotion?.id === emotion.id ? '2px solid rgba(52, 152, 219, 0.5)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '120px',
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1,
                      }} />
                      <EmotionBubble
                        emotion={{
                          ...emotion,
                          intensity,
                        }}
                        size={isSmallScreen ? 50 : 60}
                        withText={true}
                        autoAnimate={true}
                        useEmoji={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: '10px 5px', 
                  textAlign: 'center', 
                  color: '#999',
                  fontSize: 14,
                }}>
                  カスタム感情がありません。追加してみましょう。
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              marginTop: 15 
            }}>
              <div
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 10,
                  textAlign: 'center',
                  margin: '0 5px',
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 44,
                  cursor: 'pointer',
                }}
              >
                キャンセル
              </div>
              <div
                onClick={selectedEmotion ? handleConfirmSelection : undefined}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 10,
                  textAlign: 'center',
                  margin: '0 5px',
                  backgroundColor: selectedEmotion ? '#3498db' : '#bdc3c7',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 44,
                  cursor: selectedEmotion ? 'pointer' : 'default',
                }}
              >
                選択
              </div>
            </div>
          </div>
        </div>

        <CustomEmotionCreator
          visible={showCustomEmotionCreator}
          onClose={() => setShowCustomEmotionCreator(false)}
          onSave={handleCustomEmotionSave}
          initialEmotion={selectedCustomEmotion}
        />
      </>
    );
  }

  // Mobile用のモーダル
  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={handleModalContentPress}>
              <SafeAreaView style={[
                styles.modalContent,
                isSmallScreen && styles.modalContentSmall
              ]}>
                <Text style={styles.title}>感情を選択</Text>
                
                {/* デバッグ情報 */}
                <Text style={styles.debugText}>{debugMessage}</Text>
                
                <View style={styles.intensityContainer}>
                  <Text style={styles.intensityLabel}>強度</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0.1}
                    maximumValue={1.0}
                    step={0.1}
                    value={intensity}
                    onValueChange={handleIntensityChange}
                    minimumTrackTintColor="#3498db"
                    maximumTrackTintColor="#bdc3c7"
                    thumbTintColor="#3498db"
                  />
                  <Text style={styles.intensityValue}>{Math.round(intensity * 100)}%</Text>
                </View>
                
                <ScrollView 
                  style={styles.emotionsContainer}
                  contentContainerStyle={styles.emotionsContentContainer}
                >
                  {/* 基本感情セクション */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>基本感情</Text>
                  </View>
                  
                  <View style={styles.emotionsGrid}>
                    {predefinedEmotions.map((emotion) => (
                      <TouchableHighlight
                        key={emotion.id}
                        style={[
                          styles.emotionItem,
                          {
                            width: itemWidth,
                            height: isSmallScreen ? 100 : 120,
                          },
                          selectedEmotion?.id === emotion.id && styles.selectedItem,
                        ]}
                        onPress={() => handleSelectEmotion(emotion)}
                        underlayColor="rgba(52, 152, 219, 0.1)"
                        accessible={true}
                        accessibilityLabel={`感情: ${emotion.name}`}
                        accessibilityHint={emotion.description}
                      >
                        <EmotionBubble
                          emotion={{
                            ...emotion,
                            intensity,
                          }}
                          size={isSmallScreen ? 50 : 60}
                          withText={true}
                          autoAnimate={true}
                          useEmoji={true}
                        />
                      </TouchableHighlight>
                    ))}
                  </View>
                  
                  {/* カスタム感情セクション */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>カスタム感情</Text>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => setShowCustomEmotionCreator(true)}
                    >
                      <Ionicons name="add" size={16} color="white" />
                      <Text style={styles.addButtonText}>追加</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {customEmotions.length > 0 ? (
                    <View style={styles.emotionsGrid}>
                      {customEmotions.map((emotion) => (
                        <TouchableHighlight
                          key={emotion.id}
                          style={[
                            styles.emotionItem,
                            {
                              width: itemWidth,
                              height: isSmallScreen ? 100 : 120,
                            },
                            selectedEmotion?.id === emotion.id && styles.selectedItem,
                          ]}
                          onPress={() => handleSelectEmotion(emotion)}
                          underlayColor="rgba(52, 152, 219, 0.1)"
                          accessible={true}
                          accessibilityLabel={`感情: ${emotion.name}`}
                          accessibilityHint={emotion.description}
                        >
                          <EmotionBubble
                            emotion={{
                              ...emotion,
                              intensity,
                            }}
                            size={isSmallScreen ? 50 : 60}
                            withText={true}
                            autoAnimate={true}
                            useEmoji={true}
                          />
                        </TouchableHighlight>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyCustomContainer}>
                      <Text style={styles.emptyCustomText}>
                        カスタム感情がありません。追加してみましょう。
                      </Text>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>キャンセル</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.selectButton,
                      !selectedEmotion && styles.disabledButton,
                    ]}
                    onPress={handleConfirmSelection}
                    disabled={!selectedEmotion}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>選択</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      <CustomEmotionCreator
        visible={showCustomEmotionCreator}
        onClose={() => setShowCustomEmotionCreator(false)}
        onSave={handleCustomEmotionSave}
        initialEmotion={selectedCustomEmotion}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: Platform.OS === 'web' ? '80%' : '70%',
    width: '100%',
  },
  modalContentSmall: {
    height: '85%',
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  intensityLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  intensityValue: {
    fontSize: 16,
    marginLeft: 10,
    width: 45,
    textAlign: 'right',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  emotionsContainer: {
    flex: 1,
    maxHeight: Platform.OS === 'web' ? '60%' : '50%',
  },
  emotionsContentContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingHorizontal: 5,
    marginBottom: 20,
  },
  emotionItem: {
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  selectedItem: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.5)',
  },
  emptyCustomContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCustomText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  selectButton: {
    backgroundColor: '#3498db',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 