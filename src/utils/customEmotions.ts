import AsyncStorage from '@react-native-async-storage/async-storage';
import { Emotion, AnimationType, VibrationPattern } from '../types';
import { v4 as uuidv4 } from 'uuid';

const CUSTOM_EMOTIONS_KEY = 'custom_emotions';

// カスタム感情のデフォルト設定
export const createCustomEmotion = (
  name: string,
  emoji: string,
  color: string = '#FFD700',
  secondaryColor: string = '#FFA500',
  animationType: AnimationType = AnimationType.PULSE,
  vibrationPattern: VibrationPattern = VibrationPattern.GENTLE,
  intensity: number = 0.8
): Emotion => {
  return {
    id: `custom_${uuidv4().slice(0, 8)}`,
    name,
    description: `カスタム感情: ${name}`,
    color,
    secondaryColor,
    intensity,
    animationType,
    vibrationPattern,
    emoji
  };
};

// カスタム感情を保存する
export const saveCustomEmotion = async (emotion: Emotion): Promise<boolean> => {
  try {
    // 既存のカスタム感情を取得
    const existingEmotions = await getCustomEmotions();
    
    // 同じIDの感情がある場合は上書き、なければ追加
    const updatedEmotions = existingEmotions.some(e => e.id === emotion.id)
      ? existingEmotions.map(e => e.id === emotion.id ? emotion : e)
      : [...existingEmotions, emotion];
    
    // 保存
    await AsyncStorage.setItem(CUSTOM_EMOTIONS_KEY, JSON.stringify(updatedEmotions));
    return true;
  } catch (error) {
    console.error('Error saving custom emotion:', error);
    return false;
  }
};

// カスタム感情を取得する
export const getCustomEmotions = async (): Promise<Emotion[]> => {
  try {
    const emotionsJson = await AsyncStorage.getItem(CUSTOM_EMOTIONS_KEY);
    if (!emotionsJson) return [];
    
    return JSON.parse(emotionsJson) as Emotion[];
  } catch (error) {
    console.error('Error getting custom emotions:', error);
    return [];
  }
};

// カスタム感情を削除する
export const deleteCustomEmotion = async (id: string): Promise<boolean> => {
  try {
    const emotions = await getCustomEmotions();
    const filteredEmotions = emotions.filter(e => e.id !== id);
    
    await AsyncStorage.setItem(CUSTOM_EMOTIONS_KEY, JSON.stringify(filteredEmotions));
    return true;
  } catch (error) {
    console.error('Error deleting custom emotion:', error);
    return false;
  }
};

// 指定したIDのカスタム感情を取得する
export const getCustomEmotionById = async (id: string): Promise<Emotion | null> => {
  try {
    const emotions = await getCustomEmotions();
    const emotion = emotions.find(e => e.id === id);
    return emotion || null;
  } catch (error) {
    console.error('Error getting custom emotion by ID:', error);
    return null;
  }
};

// パレットの色
export const colorPalette = [
  // 明るい色
  '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', 
  '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE',
  '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40',
  '#FF6E40',
  
  // 暗い色
  '#D32F2F', '#C2185B', '#7B1FA2', '#512DA8', '#303F9F',
  '#1976D2', '#0288D1', '#0097A7', '#00796B', '#388E3C',
  '#689F38', '#AFB42B', '#FBC02D', '#FFA000', '#F57C00',
  '#E64A19',
  
  // パステルカラー
  '#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9',
  '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9',
  '#DCEDC8', '#F0F4C3', '#FFF9C4', '#FFECB3', '#FFE0B2',
  '#FFCCBC'
]; 