import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  TextInput
} from 'react-native';

// 一般的な絵文字のリスト
const popularEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
  '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
  '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
  '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
  '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
  '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾',
  '🤖', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤',
  '🤍', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'
];

// カテゴリー
const emojiCategories = [
  { name: '人気', emojis: popularEmojis },
  { name: '顔と感情', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇'] },
  { name: '動物', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷'] },
  { name: '食べ物', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍'] },
  { name: '活動', emojis: ['⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸'] },
  { name: 'シンボル', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞'] }
];

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  visible,
  onClose,
  onSelectEmoji
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);

  // 検索フィルター
  const filteredEmojis = searchText 
    ? popularEmojis.filter(emoji => emoji.includes(searchText))
    : emojiCategories[selectedCategory].emojis;

  // Webブラウザ用のレンダリング
  if (Platform.OS === 'web') {
    return (
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
            }}
          >
            <h2 style={{ margin: '0 0 15px 0', textAlign: 'center' }}>
              絵文字を選択
            </h2>

            <input
              type="text"
              placeholder="絵文字を検索..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                padding: '10px 15px',
                borderRadius: 8,
                marginBottom: 15,
                border: '1px solid #ddd',
                fontSize: 16,
                width: '100%',
              }}
            />

            {!searchText && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                overflowX: 'auto',
                gap: 10,
                marginBottom: 15,
                padding: '5px 0',
              }}>
                {emojiCategories.map((category, index) => (
                  <div
                    key={category.name}
                    onClick={() => setSelectedCategory(index)}
                    style={{
                      padding: '8px 15px',
                      borderRadius: 20,
                      backgroundColor: selectedCategory === index ? '#e1f5fe' : '#f5f5f5',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            )}

            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 10,
              padding: '10px 0',
            }}>
              {filteredEmojis.map((emoji, index) => (
                <div
                  key={index}
                  onClick={() => onSelectEmoji(emoji)}
                  style={{
                    fontSize: 24,
                    textAlign: 'center',
                    padding: '10px 0',
                    cursor: 'pointer',
                    borderRadius: 8,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>

            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 15,
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
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // モバイル用のレンダリング
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>絵文字を選択</Text>
          
          <TextInput
            style={styles.searchInput}
            placeholder="絵文字を検索..."
            value={searchText}
            onChangeText={setSearchText}
          />
          
          {!searchText && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
              contentContainerStyle={styles.categoryContent}
            >
              {emojiCategories.map((category, index) => (
                <TouchableOpacity
                  key={category.name}
                  style={[
                    styles.categoryButton,
                    selectedCategory === index && styles.selectedCategory
                  ]}
                  onPress={() => setSelectedCategory(index)}
                >
                  <Text style={styles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          <ScrollView style={styles.emojiContainer}>
            <View style={styles.emojiGrid}>
              {filteredEmojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => onSelectEmoji(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
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
    maxHeight: '80%',
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
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryContent: {
    paddingVertical: 5,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#e1f5fe',
  },
  categoryText: {
    fontSize: 14,
  },
  emojiContainer: {
    flex: 1,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: '12.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  emoji: {
    fontSize: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    padding: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 