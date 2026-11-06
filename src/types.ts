export interface Character {
  id: string;
  name: string;
  gender: string;
  age: number | string;
  avatar: string;
  openingGreeting: string;
  openingGreetingTranslation?: string;
  personalityPrompt: string;
  moodTag?: string;
  userNickname?: string;
  selfNickname?: string;
  isDefault?: boolean;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'character';
  text: string;
  translation?: string;
  timestamp: string;
  isAction?: boolean;
}

export interface CallDialogue {
  chinese: string;
  pinyin?: string;
  vietnamese: string;
}

export interface CallLog {
  id: string;
  duration: number;
  timestamp: string;
  characterName: string;
}

export interface UserProfile {
  name: string;
  age: number;
  avatar?: string;
  appearance?: string;
  personality?: string;
}
