import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { User } from '../types';
import { getUserEmoji } from '../utils/userEmojis';

interface UserAvatarProps {
  user: User;
  size?: number;
  useAnimalEmoji?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 50, 
  useAnimalEmoji = true 
}) => {
  // ユーザーの絵文字アバターを取得（キャッシュがあればそれを使用）
  const emojiAvatar = user.emojiAvatar || getUserEmoji(user.id, useAnimalEmoji);
  
  // スタイルを動的に計算
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  
  const emojiStyle = {
    fontSize: size * 0.6, // サイズに合わせて絵文字のサイズを調整
  };
  
  // Webプラットフォームの場合
  if (Platform.OS === 'web') {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: user.avatar ? 'transparent' : '#f0f0f0', // 写真がある場合は透明、ない場合はライトグレー
        borderWidth: user.avatar ? 0 : 1,
        borderColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span style={{
            fontSize: emojiStyle.fontSize,
            lineHeight: 1,
          }}>
            {emojiAvatar}
          </span>
        )}
      </div>
    );
  }
  
  // モバイルプラットフォームの場合
  return (
    <View style={[
      styles.container, 
      containerStyle,
      user.avatar ? styles.imageContainer : styles.emojiContainer
    ]}>
      {user.avatar ? (
        <Image 
          source={{ uri: user.avatar }} 
          style={[styles.image, containerStyle]} 
        />
      ) : (
        <Text style={[styles.emojiText, emojiStyle]}>
          {emojiAvatar}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  emojiContainer: {
    backgroundColor: '#f0f0f0', // ライトグレーの背景
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  image: {
    resizeMode: 'cover',
  },
  emojiText: {
    textAlign: 'center',
  },
}); 