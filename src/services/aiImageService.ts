import axios from 'axios';

export interface CharacterGenerationPrompt {
  personality: 'mentor' | 'friend' | 'genius' | 'companion';
  style: 'anime' | 'cartoon' | 'realistic' | 'chibi' | 'pixel-art';
  characteristics: string[]; // e.g., ['glasses', 'friendly smile', 'blue hair']
  customDescription?: string;
}

export interface GeneratedCharacter {
  imageUrl: string;
  prompt: string;
  generatedAt: Date;
}

// Personality-based prompt templates
const PERSONALITY_PROMPTS = {
  mentor: 'wise, elderly mentor character with kind eyes and gentle expression, wearing traditional robes',
  friend: 'energetic, cheerful young character with bright smile and enthusiastic pose, casual modern outfit',
  genius: 'intelligent, cool character with confident expression, glasses, analytical look, modern clothing',
  companion: 'cute, adorable character with big eyes, sweet smile, colorful and friendly appearance',
};

const STYLE_PROMPTS = {
  anime: 'anime style, cel-shaded, vibrant colors, detailed',
  cartoon: 'cartoon style, clean lines, bold colors, expressive',
  realistic: 'semi-realistic digital art, detailed shading',
  chibi: 'chibi style, super deformed, large head, cute proportions',
  'pixel-art': '16-bit pixel art style, retro gaming aesthetic',
};

export class AIImageService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // In production, this would come from environment variables
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1/images/generations';
  }

  /**
   * Generate a character using AI based on description
   */
  async generateCharacter(params: CharacterGenerationPrompt): Promise<GeneratedCharacter> {
    const prompt = this.buildPrompt(params);

    try {
      // If no API key, return a demo/placeholder
      if (!this.apiKey) {
        console.warn('No OpenAI API key found. Using demo mode.');
        return this.getDemoCharacter(params);
      }

      const response = await axios.post(
        this.baseUrl,
        {
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        imageUrl: response.data.data[0].url,
        prompt,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error generating character:', error);
      throw new Error('Failed to generate character. Please try again.');
    }
  }

  /**
   * Build the AI prompt from character parameters
   */
  private buildPrompt(params: CharacterGenerationPrompt): string {
    const parts: string[] = [];

    // Add style
    parts.push(STYLE_PROMPTS[params.style]);

    // Add personality base
    parts.push(PERSONALITY_PROMPTS[params.personality]);

    // Add characteristics
    if (params.characteristics.length > 0) {
      parts.push(params.characteristics.join(', '));
    }

    // Add custom description
    if (params.customDescription) {
      parts.push(params.customDescription);
    }

    // Add quality modifiers
    parts.push(
      'professional character design, clean background, centered character, full body portrait, high quality'
    );

    // Safety filters
    parts.push('appropriate for children, friendly, educational, SFW');

    return parts.join(', ');
  }

  /**
   * Get a demo character (for when API key is not available)
   */
  private getDemoCharacter(params: CharacterGenerationPrompt): GeneratedCharacter {
    // Use placeholder image service that generates avatars
    const seed = `${params.personality}-${params.style}-${Date.now()}`;
    const demoUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    return {
      imageUrl: demoUrl,
      prompt: this.buildPrompt(params),
      generatedAt: new Date(),
    };
  }

  /**
   * Alternative: Generate using Stable Diffusion via Replicate (cheaper)
   */
  async generateWithStableDiffusion(params: CharacterGenerationPrompt): Promise<GeneratedCharacter> {
    const replicateApiKey = import.meta.env.VITE_REPLICATE_API_KEY;

    if (!replicateApiKey) {
      return this.getDemoCharacter(params);
    }

    const prompt = this.buildPrompt(params);

    try {
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'stability-ai/sdxl:latest',
          input: {
            prompt,
            negative_prompt: 'ugly, deformed, nsfw, inappropriate, scary',
            width: 1024,
            height: 1024,
          },
        },
        {
          headers: {
            Authorization: `Token ${replicateApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Poll for completion
      const prediction = await this.pollPrediction(response.data.id, replicateApiKey);

      return {
        imageUrl: prediction.output[0],
        prompt,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error with Stable Diffusion:', error);
      return this.getDemoCharacter(params);
    }
  }

  /**
   * Poll Replicate API for prediction completion
   */
  private async pollPrediction(predictionId: string, apiKey: string): Promise<any> {
    const maxAttempts = 30;
    const delay = 2000; // 2 seconds

    for (let i = 0; i < maxAttempts; i++) {
      const response = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${apiKey}`,
          },
        }
      );

      if (response.data.status === 'succeeded') {
        return response.data;
      }

      if (response.data.status === 'failed') {
        throw new Error('Image generation failed');
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error('Image generation timeout');
  }

  /**
   * Generate character description suggestions based on personality
   */
  getSuggestions(personality: string): string[] {
    const suggestions: Record<string, string[]> = {
      mentor: [
        'Long white beard',
        'Wise eyes',
        'Traditional robes',
        'Holding a staff',
        'Gentle smile',
        'Silver hair',
        'Reading glasses',
        'Ancient book',
      ],
      friend: [
        'Bright colorful outfit',
        'Energetic pose',
        'Big smile',
        'Casual clothes',
        'Thumbs up',
        'Backpack',
        'Headphones around neck',
        'Skateboard',
      ],
      genius: [
        'Lab coat',
        'Smart glasses',
        'Clipboard',
        'Confident smirk',
        'Modern tech outfit',
        'Tablet device',
        'Analytical expression',
        'Cool hairstyle',
      ],
      companion: [
        'Big sparkling eyes',
        'Cute accessories',
        'Colorful bow',
        'Soft pastel colors',
        'Heart shapes',
        'Fluffy hair',
        'Sweet expression',
        'Holding plush toy',
      ],
    };

    return suggestions[personality] || [];
  }
}

export const aiImageService = new AIImageService();
