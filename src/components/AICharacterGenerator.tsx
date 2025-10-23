import React, { useState } from 'react';
import { Sparkles, Wand2, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { aiImageService, CharacterGenerationPrompt } from '../services/aiImageService';
import { PersonalityType, PERSONALITY_TRAITS } from '../types/tutorCharacter';
import toast from 'react-hot-toast';

interface AICharacterGeneratorProps {
  personality: PersonalityType;
  onGenerated: (imageUrl: string) => void;
  onUpload?: (file: File) => void;
}

export const AICharacterGenerator: React.FC<AICharacterGeneratorProps> = ({
  personality,
  onGenerated,
  onUpload,
}) => {
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [style, setStyle] = useState<'anime' | 'cartoon' | 'realistic' | 'chibi' | 'pixel-art'>('anime');
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<string[]>([]);
  const [customDescription, setCustomDescription] = useState('');

  const suggestions = aiImageService.getSuggestions(personality);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const params: CharacterGenerationPrompt = {
        personality,
        style,
        characteristics: selectedCharacteristics,
        customDescription: customDescription.trim(),
      };

      const result = await aiImageService.generateCharacter(params);
      setGeneratedImage(result.imageUrl);
      toast.success('Character generated successfully!');
    } catch (error) {
      toast.error('Failed to generate character. Please try again.');
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleUseImage = () => {
    if (generatedImage) {
      onGenerated(generatedImage);
      toast.success('AI character image applied!');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 5MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setGeneratedImage(imageUrl);
        if (onUpload) {
          onUpload(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCharacteristic = (char: string) => {
    setSelectedCharacteristics((prev) =>
      prev.includes(char) ? prev.filter((c) => c !== char) : [...prev, char]
    );
  };

  const styles: Array<{ id: typeof style; name: string; emoji: string }> = [
    { id: 'anime', name: 'Anime', emoji: '🎌' },
    { id: 'cartoon', name: 'Cartoon', emoji: '🎨' },
    { id: 'chibi', name: 'Chibi', emoji: '🥺' },
    { id: 'realistic', name: 'Realistic', emoji: '👤' },
    { id: 'pixel-art', name: 'Pixel Art', emoji: '🎮' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Character Generator
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Describe your ideal {PERSONALITY_TRAITS[personality].name} and let AI create a unique character!
        </p>

        {/* Art Style Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Art Style
          </label>
          <div className="grid grid-cols-5 gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  style === s.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">{s.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Characteristics */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Characteristics (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((char) => (
              <button
                key={char}
                onClick={() => toggleCharacteristic(char)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedCharacteristics.includes(char)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {char}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Description (optional)
          </label>
          <textarea
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="Add any additional details... (e.g., 'wearing a blue cape', 'holding a magic wand')"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate with AI
            </>
          )}
        </button>

        {/* Upload Option */}
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
        </div>
        <label className="mt-3 w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <Upload className="w-5 h-5" />
          Upload Your Own Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Preview Generated Image */}
      {generatedImage && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-500">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-500" />
            Generated Character
          </h4>
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-64 h-64 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              <img
                src={generatedImage}
                alt="Generated character"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setGeneratedImage(null)}
                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleUseImage}
                className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                Use This Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <strong>💡 Tip:</strong> Without an API key, we'll generate a demo character using free avatars.
          To use real AI generation (DALL-E 3), add your OpenAI API key to the environment variables.
        </p>
      </div>
    </div>
  );
};
