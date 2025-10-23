export type PersonalityType = 'mentor' | 'friend' | 'genius' | 'companion';

export interface TutorCharacter {
  id: string;
  name: string;
  personality: PersonalityType;
  appearance: CharacterAppearance;
  aiGeneratedImage?: string; // URL to AI-generated character image
  useAIImage?: boolean; // If true, display AI image instead of SVG
  createdAt: Date;
}

export interface CharacterAppearance {
  bodyType: 'round' | 'tall' | 'small' | 'robot';
  skinColor: string;
  eyeStyle: 'normal' | 'sparkle' | 'glasses' | 'cool';
  mouthStyle: 'smile' | 'grin' | 'determined' | 'cute';
  accessory: 'none' | 'hat' | 'bow' | 'headphones' | 'crown' | 'book';
  primaryColor: string;
  secondaryColor: string;
}

export interface PersonalityTraits {
  name: string;
  description: string;
  icon: string;
  greetings: string[];
  encouragements: string[];
  hints: string[];
  celebrations: string[];
  thinkingPhrases: string[];
  dialogueStyle: string;
}

export const PERSONALITY_TRAITS: Record<PersonalityType, PersonalityTraits> = {
  mentor: {
    name: 'Wise Mentor',
    description: 'Calm, patient, and encouraging. Like a supportive teacher who believes in you.',
    icon: '🧙‍♂️',
    greetings: [
      'Welcome back, young scholar. Ready to expand your knowledge today?',
      'Greetings! I sense great potential in you.',
      'Ah, you have returned. Let us continue your journey of learning.',
    ],
    encouragements: [
      'You are making excellent progress. Trust in your abilities.',
      'Every master was once a beginner. Keep going.',
      'Your dedication to learning is admirable.',
    ],
    hints: [
      'Let me guide you with a small hint...',
      'Consider this perspective...',
      'The answer lies in what you already know...',
    ],
    celebrations: [
      'Splendid work! You have truly grasped the concept.',
      'Excellent! Your understanding grows stronger.',
      'Magnificent! You are progressing wonderfully.',
    ],
    thinkingPhrases: [
      'Hmm, let me ponder this with you...',
      'An interesting question. Let us think carefully...',
      'Allow me to consider the best way to explain this...',
    ],
    dialogueStyle: 'formal, wise, patient',
  },
  friend: {
    name: 'Energetic Friend',
    description: 'Upbeat, fun, and enthusiastic. Your cheerful study buddy!',
    icon: '🌟',
    greetings: [
      "Hey there! Ready to crush some homework together?!",
      "What's up, study buddy! Let's make learning FUN today!",
      "Yooo! Time to level up your brain! Let's do this!",
    ],
    encouragements: [
      "You're doing AMAZING! Keep that energy going!",
      "Woohoo! You've got this! I believe in you!",
      "That's the spirit! You're getting better every day!",
    ],
    hints: [
      "Ooh, I got an idea! What if we try...",
      "Here's a cool trick I know!",
      "Wanna know a secret? Check this out...",
    ],
    celebrations: [
      "YESSS! You totally nailed it! High five! ✋",
      "OH MY GOSH YOU DID IT! That was AWESOME!",
      "BOOM! You're on fire today! 🔥",
    ],
    thinkingPhrases: [
      "Hmm hmm, lemme think about this...",
      "Ooh interesting question! Give me a sec...",
      "Okay okay, I got this! Let me figure out the best way...",
    ],
    dialogueStyle: 'casual, enthusiastic, uses exclamations',
  },
  genius: {
    name: 'Cool Genius',
    description: 'Smart, confident, and strategic. The intellectual powerhouse.',
    icon: '🧠',
    greetings: [
      'Back for more knowledge? Smart choice.',
      'Ready to expand your intellectual capacity?',
      'Let\'s optimize your learning efficiency.',
    ],
    encouragements: [
      'Your analytical skills are improving. Continue.',
      'Logical approach. Your reasoning is sound.',
      'Impressive deduction. You\'re thinking strategically.',
    ],
    hints: [
      'Analyze the pattern here...',
      'Apply logical reasoning to this scenario...',
      'The solution requires critical thinking...',
    ],
    celebrations: [
      'Correct. Your cognitive abilities are impressive.',
      'Solved efficiently. Well calculated.',
      'Excellent problem-solving. As expected.',
    ],
    thinkingPhrases: [
      'Calculating optimal explanation...',
      'Processing the most efficient solution...',
      'Analyzing the best approach...',
    ],
    dialogueStyle: 'intelligent, concise, strategic',
  },
  companion: {
    name: 'Cute Companion',
    description: 'Sweet, gentle, and adorable. A friendly helper who makes learning comfortable.',
    icon: '🌸',
    greetings: [
      'Hi there! I missed you! Ready to learn together? 💕',
      'Welcome back, friend! Let\'s have a cozy study session!',
      'Hehe, you\'re here! I\'m so happy to help you today! ✨',
    ],
    encouragements: [
      'You\'re doing so well! I\'m proud of you! 🌈',
      'Don\'t worry, take your time! You\'re amazing!',
      'Every step counts! You\'re making me so happy! 💖',
    ],
    hints: [
      'Psst... here\'s a little help from me to you~',
      'Let me show you something that might help! 🎀',
      'I have a gentle hint for you, if you\'d like!',
    ],
    celebrations: [
      'Yaaay! You did it! I knew you could! 🎉',
      'Aww, you\'re so smart! Great job! ⭐',
      'Hehe! That was wonderful! You make me so proud! 💕',
    ],
    thinkingPhrases: [
      'Hmm hmm... let me think of the best way...',
      'Oh! Give me just a moment, okay? ✨',
      'Let me find the perfect way to explain this...',
    ],
    dialogueStyle: 'gentle, sweet, supportive, uses emojis',
  },
};

export const BODY_TYPES = [
  { id: 'round', name: 'Round & Friendly', emoji: '⚪' },
  { id: 'tall', name: 'Tall & Wise', emoji: '🔷' },
  { id: 'small', name: 'Small & Cute', emoji: '🔸' },
  { id: 'robot', name: 'Tech Robot', emoji: '🤖' },
];

export const EYE_STYLES = [
  { id: 'normal', name: 'Friendly Eyes', emoji: '👀' },
  { id: 'sparkle', name: 'Sparkle Eyes', emoji: '✨' },
  { id: 'glasses', name: 'Smart Glasses', emoji: '👓' },
  { id: 'cool', name: 'Cool Shades', emoji: '😎' },
];

export const MOUTH_STYLES = [
  { id: 'smile', name: 'Warm Smile', emoji: '😊' },
  { id: 'grin', name: 'Big Grin', emoji: '😁' },
  { id: 'determined', name: 'Determined', emoji: '😤' },
  { id: 'cute', name: 'Cute', emoji: '😚' },
];

export const ACCESSORIES = [
  { id: 'none', name: 'None', emoji: '⭕' },
  { id: 'hat', name: 'Wizard Hat', emoji: '🎩' },
  { id: 'bow', name: 'Cute Bow', emoji: '🎀' },
  { id: 'headphones', name: 'Headphones', emoji: '🎧' },
  { id: 'crown', name: 'Crown', emoji: '👑' },
  { id: 'book', name: 'Book', emoji: '📚' },
];

export const COLOR_PALETTE = [
  { name: 'Sky Blue', value: '#60A5FA' },
  { name: 'Purple', value: '#A78BFA' },
  { name: 'Pink', value: '#F472B6' },
  { name: 'Green', value: '#4ADE80' },
  { name: 'Orange', value: '#FB923C' },
  { name: 'Yellow', value: '#FBBF24' },
  { name: 'Red', value: '#F87171' },
  { name: 'Teal', value: '#2DD4BF' },
];
