// ユーザーIDに基づいて一貫した絵文字を生成するユーティリティ

// 使用する絵文字リスト
const profileEmojis = [
  '👨', '👩', '👦', '👧', '👴', '👵', '🧑', 
  '👱', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳',
  '👨‍🦲', '👩‍🦲', '🧔', '👲', '👳', '👮', '👷', '💂',
  '🕵️', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳',
  '👩‍🎓', '👨‍🎓', '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭',
  '👨‍🏭', '👩‍💻', '👨‍💻', '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧',
  '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨', '👩‍🚒', '👨‍🚒', '👩‍✈️',
  '👨‍✈️', '👩‍🚀', '👨‍🚀', '👼', '🦸', '🦹', '🧙', '🧚',
  '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🧍'
];

// カラフルな動物絵文字のリスト
const animalEmojis = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨',
  '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦',
  '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝',
  '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷️', '🦂', '🦟',
  '🦠', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐',
  '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈',
  '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏',
  '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖',
  '🐏', '🐑', '🦙', '🐐', '🦌'
];

// デフォルトの絵文字（ユーザーIDがマッチしない場合）
export const DEFAULT_USER_EMOJI = '👤';

/**
 * ユーザーIDに基づいて一貫した絵文字を生成する
 * @param userId ユーザーID
 * @param useAnimals 動物絵文字を使用するかどうか
 * @returns 絵文字
 */
export const getUserEmoji = (userId: string, useAnimals: boolean = false): string => {
  if (!userId) return DEFAULT_USER_EMOJI;

  // ユーザーIDからハッシュ値を生成（簡易的な実装）
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0; // 32ビット整数に変換
  }

  // 絶対値を取る
  hash = Math.abs(hash);

  // 使用する絵文字リストを選択
  const emojiList = useAnimals ? animalEmojis : profileEmojis;
  
  // ハッシュ値を絵文字リストのインデックスに変換
  const index = hash % emojiList.length;
  
  return emojiList[index];
};

/**
 * ユーザーの最初の文字と絵文字を組み合わせた表示用文字列を生成
 * @param name ユーザー名
 * @param emoji ユーザー絵文字
 * @returns 表示用文字列
 */
export const getUserDisplayEmoji = (name: string, emoji: string): string => {
  if (!name) return emoji;
  
  // 名前の最初の文字を取得
  const firstChar = name.charAt(0);
  
  return `${emoji}`;
}; 