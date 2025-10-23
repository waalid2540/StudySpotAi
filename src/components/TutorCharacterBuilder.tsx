import React, { useState } from 'react';
import { Sparkles, Wand2, Palette, Save, Image as ImageIcon } from 'lucide-react';
import {
  PersonalityType,
  CharacterAppearance,
  TutorCharacter,
  PERSONALITY_TRAITS,
  BODY_TYPES,
  EYE_STYLES,
  MOUTH_STYLES,
  ACCESSORIES,
  COLOR_PALETTE,
} from '../types/tutorCharacter';
import { TutorCharacterPreview } from './TutorCharacterPreview';
import { AICharacterGenerator } from './AICharacterGenerator';

interface TutorCharacterBuilderProps {
  onSave: (character: TutorCharacter) => void;
  initialCharacter?: TutorCharacter;
}

export const TutorCharacterBuilder: React.FC<TutorCharacterBuilderProps> = ({
  onSave,
  initialCharacter,
}) => {
  const [step, setStep] = useState<'personality' | 'method' | 'appearance' | 'ai-generate' | 'preview'>('personality');
  const [name, setName] = useState(initialCharacter?.name || '');
  const [personality, setPersonality] = useState<PersonalityType>(
    initialCharacter?.personality || 'friend'
  );
  const [appearance, setAppearance] = useState<CharacterAppearance>(
    initialCharacter?.appearance || {
      bodyType: 'round',
      skinColor: '#FBBF24',
      eyeStyle: 'normal',
      mouthStyle: 'smile',
      accessory: 'none',
      primaryColor: '#60A5FA',
      secondaryColor: '#A78BFA',
    }
  );
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | undefined>(
    initialCharacter?.aiGeneratedImage
  );
  const [useAIImage, setUseAIImage] = useState<boolean>(
    initialCharacter?.useAIImage || false
  );
  const [creationMethod, setCreationMethod] = useState<'customize' | 'ai'>('customize');

  const handleSave = () => {
    const character: TutorCharacter = {
      id: initialCharacter?.id || `char-${Date.now()}`,
      name: name || `${PERSONALITY_TRAITS[personality].name}`,
      personality,
      appearance,
      aiGeneratedImage,
      useAIImage,
      createdAt: initialCharacter?.createdAt || new Date(),
    };
    onSave(character);
  };

  const handleAIImageGenerated = (imageUrl: string) => {
    setAiGeneratedImage(imageUrl);
    setUseAIImage(true);
    setStep('preview');
  };

  const randomize = () => {
    const randomBodyType = BODY_TYPES[Math.floor(Math.random() * BODY_TYPES.length)].id as CharacterAppearance['bodyType'];
    const randomEyeStyle = EYE_STYLES[Math.floor(Math.random() * EYE_STYLES.length)].id as CharacterAppearance['eyeStyle'];
    const randomMouthStyle = MOUTH_STYLES[Math.floor(Math.random() * MOUTH_STYLES.length)].id as CharacterAppearance['mouthStyle'];
    const randomAccessory = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id as CharacterAppearance['accessory'];
    const randomPrimary = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].value;
    const randomSecondary = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].value;

    setAppearance({
      ...appearance,
      bodyType: randomBodyType,
      eyeStyle: randomEyeStyle,
      mouthStyle: randomMouthStyle,
      accessory: randomAccessory,
      primaryColor: randomPrimary,
      secondaryColor: randomSecondary,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-500" />
          Create Your AI Tutor
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Design a personalized learning companion to help you study!
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4">
          {['personality', 'appearance', 'preview'].map((s, idx) => (
            <React.Fragment key={s}>
              <button
                onClick={() => setStep(s as typeof step)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  step === s
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">
                  {idx + 1}
                </span>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
              {idx < 2 && (
                <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Customization Options */}
        <div className="space-y-6">
          {/* Step 1: Personality */}
          {step === 'personality' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Choose Personality
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {(Object.keys(PERSONALITY_TRAITS) as PersonalityType[]).map((type) => {
                  const trait = PERSONALITY_TRAITS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setPersonality(type)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        personality === type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{trait.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {trait.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {trait.description}
                          </p>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 italic">
                            "{trait.greetings[0]}"
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep('method')}
                className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                Next: Choose Creation Method
              </button>
            </div>
          )}

          {/* Step 2: Method Selection */}
          {step === 'method' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                How would you like to create your tutor?
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => {
                    setCreationMethod('ai');
                    setStep('ai-generate');
                  }}
                  className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-left transition-all hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        ✨ AI-Generated Character
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Describe your ideal tutor and let AI create a unique, personalized character image for you!
                      </p>
                      <div className="mt-3 text-xs text-purple-600 dark:text-purple-400 font-medium">
                        Recommended • Most unique
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCreationMethod('customize');
                    setUseAIImage(false);
                    setStep('appearance');
                  }}
                  className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 bg-white dark:bg-gray-800 text-left transition-all hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        🎨 Customize Character
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Build your tutor from scratch using our customization options. Choose body, eyes, accessories, and colors!
                      </p>
                      <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Full control • Instant
                      </div>
                    </div>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setStep('personality')}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 3: AI Generation */}
          {step === 'ai-generate' && (
            <div className="space-y-4">
              <AICharacterGenerator
                personality={personality}
                onGenerated={handleAIImageGenerated}
              />
              <button
                onClick={() => setStep('method')}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Method Selection
              </button>
            </div>
          )}

          {/* Step 2: Appearance */}
          {step === 'appearance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Customize Appearance
                </h3>
                <button
                  onClick={randomize}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  Randomize
                </button>
              </div>

              {/* Character Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Character Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={PERSONALITY_TRAITS[personality].name}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Body Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Body Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BODY_TYPES.map((body) => (
                    <button
                      key={body.id}
                      onClick={() => setAppearance({ ...appearance, bodyType: body.id as CharacterAppearance['bodyType'] })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        appearance.bodyType === body.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{body.emoji}</span>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {body.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Eye Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Eye Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EYE_STYLES.map((eye) => (
                    <button
                      key={eye.id}
                      onClick={() => setAppearance({ ...appearance, eyeStyle: eye.id as CharacterAppearance['eyeStyle'] })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        appearance.eyeStyle === eye.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{eye.emoji}</span>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {eye.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mouth Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mouth Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MOUTH_STYLES.map((mouth) => (
                    <button
                      key={mouth.id}
                      onClick={() => setAppearance({ ...appearance, mouthStyle: mouth.id as CharacterAppearance['mouthStyle'] })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        appearance.mouthStyle === mouth.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{mouth.emoji}</span>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {mouth.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accessory
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => setAppearance({ ...appearance, accessory: acc.id as CharacterAppearance['accessory'] })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        appearance.accessory === acc.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{acc.emoji}</span>
                      <div className="text-xs font-medium text-gray-900 dark:text-white mt-1">
                        {acc.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAppearance({ ...appearance, primaryColor: color.value })}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        appearance.primaryColor === color.value
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAppearance({ ...appearance, secondaryColor: color.value })}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        appearance.secondaryColor === color.value
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('personality')}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('preview')}
                  className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
                >
                  Preview
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Your Tutor is Ready!
              </h3>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                <div className="text-center">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {name || PERSONALITY_TRAITS[personality].name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {PERSONALITY_TRAITS[personality].description}
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-left">
                    <p className="text-sm italic text-gray-700 dark:text-gray-300">
                      "{PERSONALITY_TRAITS[personality].greetings[0]}"
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('appearance')}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Tutor
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-8 flex flex-col items-center justify-center min-h-[500px]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Live Preview
            </h3>

            {/* Show AI-generated image if available and enabled */}
            {useAIImage && aiGeneratedImage ? (
              <div className="w-64 h-64 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
                <img
                  src={aiGeneratedImage}
                  alt="AI-generated character"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <TutorCharacterPreview
                appearance={appearance}
                emotion="happy"
                animate={true}
                size="large"
              />
            )}

            <p className="text-center text-gray-700 dark:text-gray-300 mt-6 font-medium">
              {name || PERSONALITY_TRAITS[personality].name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
              {PERSONALITY_TRAITS[personality].icon} {PERSONALITY_TRAITS[personality].name}
            </p>

            {/* Toggle between AI and SVG */}
            {aiGeneratedImage && (
              <button
                onClick={() => setUseAIImage(!useAIImage)}
                className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <ImageIcon className="w-4 h-4" />
                {useAIImage ? 'Show Customized Character' : 'Show AI Character'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
