import { Emotion, AnimationType, VibrationPattern } from '../types';

export const predefinedEmotions: Emotion[] = [
  {
    id: 'joy',
    name: '喜び',
    description: '幸せで満たされた気持ち',
    color: '#FFD700', // Gold/Yellow
    secondaryColor: '#FFA500', // Orange
    intensity: 0.8,
    animationType: AnimationType.BOUNCE,
    vibrationPattern: VibrationPattern.RHYTHMIC,
    emoji: '😊', // 喜びの絵文字
  },
  {
    id: 'sadness',
    name: '悲しみ',
    description: '喪失感や悲しみの感情',
    color: '#1E90FF', // Deep blue
    secondaryColor: '#4169E1', // Royal blue
    intensity: 0.6,
    animationType: AnimationType.WAVE,
    vibrationPattern: VibrationPattern.GENTLE,
    emoji: '😢', // 悲しみの絵文字
  },
  {
    id: 'anger',
    name: '怒り',
    description: '怒りや不満の感情',
    color: '#FF4500', // Red-orange
    secondaryColor: '#DC143C', // Crimson
    intensity: 0.9,
    animationType: AnimationType.SHAKE,
    vibrationPattern: VibrationPattern.INTENSE,
    emoji: '😠', // 怒りの絵文字
  },
  {
    id: 'surprise',
    name: '驚き',
    description: '予想外の出来事に対する反応',
    color: '#9932CC', // Purple
    secondaryColor: '#8A2BE2', // Violet
    intensity: 0.85,
    animationType: AnimationType.EXPAND,
    vibrationPattern: VibrationPattern.QUICK,
    emoji: '😲', // 驚きの絵文字
  },
  {
    id: 'fear',
    name: '恐怖',
    description: '危険や脅威に対する反応',
    color: '#800000', // Maroon
    secondaryColor: '#4B0082', // Indigo
    intensity: 0.7,
    animationType: AnimationType.PULSE,
    vibrationPattern: VibrationPattern.RHYTHMIC,
    emoji: '😨', // 恐怖の絵文字
  },
  {
    id: 'disgust',
    name: '嫌悪',
    description: '不快な感情',
    color: '#006400', // Dark green
    secondaryColor: '#556B2F', // Olive
    intensity: 0.6,
    animationType: AnimationType.ROTATE,
    vibrationPattern: VibrationPattern.GENTLE,
    emoji: '🤢', // 嫌悪の絵文字
  },
  {
    id: 'love',
    name: '愛',
    description: '深い愛情や思いやり',
    color: '#FF69B4', // Hot pink
    secondaryColor: '#FF1493', // Deep pink
    intensity: 0.9,
    animationType: AnimationType.PULSE,
    vibrationPattern: VibrationPattern.GENTLE,
    emoji: '❤️', // 愛の絵文字
  },
  {
    id: 'calm',
    name: '落ち着き',
    description: '穏やかで平和な感情',
    color: '#00CED1', // Turquoise
    secondaryColor: '#20B2AA', // Light sea green
    intensity: 0.3,
    animationType: AnimationType.WAVE,
    vibrationPattern: VibrationPattern.GENTLE,
    emoji: '😌', // 落ち着きの絵文字
  },
  {
    id: 'excitement',
    name: '興奮',
    description: '高揚した気持ち',
    color: '#FF6347', // Tomato
    secondaryColor: '#FF7F50', // Coral
    intensity: 0.85,
    animationType: AnimationType.BOUNCE,
    vibrationPattern: VibrationPattern.RHYTHMIC,
    emoji: '🤩', // 興奮の絵文字
  },
  {
    id: 'gratitude',
    name: '感謝',
    description: '感謝の気持ち',
    color: '#9ACD32', // Yellow green
    secondaryColor: '#7CFC00', // Lawn green
    intensity: 0.7,
    animationType: AnimationType.EXPAND,
    vibrationPattern: VibrationPattern.GENTLE,
    emoji: '🙏', // 感謝の絵文字
  },
];

export const getEmotionById = (id: string): Emotion | undefined => {
  return predefinedEmotions.find(emotion => emotion.id === id);
};

export const getEmotionByName = (name: string): Emotion | undefined => {
  return predefinedEmotions.find(emotion => emotion.name === name);
}; 