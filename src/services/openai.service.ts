import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { UserProfile } from '../interfaces/user-profile.interface';

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.model = this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
  }

  async generateClarifyingQuestion(
    profile: UserProfile,
    topic: string,
  ): Promise<string> {
    const systemPrompt = `You are an expert journalist. Based on the user's business niche: ${profile.businessProfile.niche} and audience: ${profile.businessProfile.targetAudience}, ask ONE specific, deep question about the topic: '${topic}' to get more 'meat' for a LinkedIn post. Keep it short.`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: topic },
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() ?? '';
  }

  async generatePost(
    profile: UserProfile,
    topic: string,
    answer: string,
  ): Promise<string> {
    const systemPrompt = `You are a Ghostwriter for ${profile.businessProfile.projectName}.
CONTEXT:
* Niche: ${profile.businessProfile.niche}
* Audience: ${profile.businessProfile.targetAudience}
* Tone: ${profile.businessProfile.toneOfVoice}


STYLE REFERENCE (MIMIC THIS WRITING STYLE):
'''
${profile.businessProfile.styleExample}
'''
TASK:
Write a LinkedIn post about '${topic}'.
Incorporate the user's detailed answer: '${answer}'.
Strictly follow the sentence length and formatting of the STYLE REFERENCE.
Language: Ukrainian.`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: answer },
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() ?? '';
  }
}
