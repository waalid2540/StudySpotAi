import OpenAI from 'openai';
import { QuizQuestion } from '../types';

const hasValidApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10;

const client = hasValidApiKey ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
}) : null;

export class AIService {
  /**
   * Check if running in demo mode (no API key)
   */
  private isDemoMode(): boolean {
    return !hasValidApiKey;
  }
  /**
   * Get AI homework help with step-by-step solution
   */
  async solveHomework(question: string, subject: string): Promise<string> {
    try {
      const completion = await client!.chat.completions.create({
        model: 'gpt-4o',  // Latest GPT-4 model from OpenAI
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `You are an expert tutor helping a student with ${subject}.

Question: ${question}

Please provide:
1. A clear step-by-step solution
2. Explanation of key concepts
3. Tips to remember for similar problems
4. Practice suggestions

Make it educational and encouraging!`,
          },
        ],
      });

      return completion.choices[0]?.message?.content || 'Unable to generate solution';
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate homework solution');
    }
  }

  /**
   * Generate AI-powered quiz
   */
  async generateQuiz(
    subject: string,
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    numQuestions: number = 5
  ): Promise<QuizQuestion[]> {
    try {
      const completion = await client!.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: `Generate ${numQuestions} multiple choice questions for:
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "q1",
    "question": "question text",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswer": 0,
    "explanation": "why this is correct"
  }
]

Make questions educational and age-appropriate.`,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid quiz format');
    } catch (error) {
      console.error('Quiz Generation Error:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  /**
   * Analyze student performance and generate insights
   */
  async generateInsights(
    homeworkData: any[],
    quizScores: number[],
    subjects: string[]
  ): Promise<{ strengths: string[]; weaknesses: string[]; recommendations: string[] }> {
    try {
      const avgScore = quizScores.length > 0
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
        : 0;

      const completion = await client!.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Analyze this student's performance:

Subjects: ${subjects.join(', ')}
Average Quiz Score: ${avgScore}%
Completed Homework: ${homeworkData.length}

Provide a JSON response with:
{
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["area 1", "area 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        strengths: ['Consistent homework completion'],
        weaknesses: ['Needs more practice'],
        recommendations: ['Continue regular study habits'],
      };
    } catch (error) {
      console.error('Insights Generation Error:', error);
      return {
        strengths: ['Making progress'],
        weaknesses: ['Continue practicing'],
        recommendations: ['Keep up the good work'],
      };
    }
  }

  /**
   * Chat with AI tutor
   */
  async chat(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
    try {
      // Demo mode: Return mock responses
      if (this.isDemoMode()) {
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        const userInput = lastUserMessage?.content.toLowerCase() || '';

        // Smart demo responses based on question content
        if (userInput.includes('math') || userInput.includes('solve') || /\d+/.test(userInput)) {
          return `I'd be happy to help you with this math problem!

Let me break it down step by step:

1. First, identify what type of problem this is (algebra, geometry, arithmetic, etc.)
2. Then, gather all the given information
3. Apply the appropriate mathematical principles
4. Show your work as you solve
5. Check your answer to make sure it makes sense

Could you share the specific math problem you're working on? I'll guide you through solving it step by step!

*Note: This is a demo response. To enable full AI tutoring with GPT-4o, add your OpenAI API key to the .env file.*`;
        } else if (userInput.includes('essay') || userInput.includes('write') || userInput.includes('introduction')) {
          return `Great question about writing! Here are some tips for writing a strong introduction:

**Key Elements of a Good Introduction:**
1. Hook - Start with something interesting (question, fact, or quote)
2. Background - Give context about your topic
3. Thesis Statement - Clearly state your main argument

**Example Structure:**
"Did you know that [interesting fact]? This surprising statistic relates to [your topic]. Throughout history, [background context]. This essay will explore [your main points]."

**Tips:**
- Keep it concise (3-5 sentences)
- Make it engaging
- Clearly preview what's coming

Would you like help with a specific topic you're writing about?

*Note: This is a demo response. To enable full AI tutoring with GPT-4o, add your OpenAI API key to the .env file.*`;
        } else if (userInput.includes('science') || userInput.includes('photosynthesis') || userInput.includes('biology')) {
          return `Excellent science question! Let me explain this concept:

**Photosynthesis** is how plants make their own food using sunlight.

**Simple Explanation:**
Think of plants as having tiny solar panels in their leaves. They take in:
- ☀️ Sunlight (energy)
- 💧 Water (from roots)
- 🌫️ Carbon dioxide (from air)

And they create:
- 🍬 Glucose (sugar for food)
- 💨 Oxygen (what we breathe!)

**The Formula:**
6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂

**Why It Matters:**
- Plants feed themselves
- We get oxygen to breathe
- It's the foundation of most life on Earth!

What aspect would you like to explore further?

*Note: This is a demo response. To enable full AI tutoring with GPT-4o, add your OpenAI API key to the .env file.*`;
        } else {
          return `I'm here to help you learn! I can assist with:

📚 **Math Problems** - Algebra, geometry, calculus, and more
✍️ **Writing** - Essays, creative writing, grammar
🔬 **Science** - Biology, chemistry, physics concepts
📖 **Reading Comprehension** - Understanding texts and themes
🗣️ **Languages** - Grammar, vocabulary, practice

What subject are you working on? Feel free to ask me any homework question!

*Note: This is a demo response. To enable full AI tutoring with GPT-4o, add your OpenAI API key to the .env file.*`;
        }
      }

      // Real API mode
      if (!client) {
        throw new Error('AI service not initialized');
      }

      // Prepare messages for OpenAI (which uses system/user/assistant roles)
      const openAIMessages: any[] = [
        {
          role: 'system',
          content: 'You are a helpful, patient, and encouraging AI tutor. Help students learn by explaining concepts clearly, asking guiding questions, and providing examples. Be supportive and positive.',
        }
      ];

      // Add conversation history
      messages.forEach(msg => {
        openAIMessages.push({
          role: msg.role,
          content: msg.content,
        });
      });

      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 2048,
        messages: openAIMessages,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Chat Error:', error);
      throw new Error('Failed to process chat message');
    }
  }
}

export const aiService = new AIService();
