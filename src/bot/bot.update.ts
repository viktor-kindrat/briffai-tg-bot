import { Injectable } from '@nestjs/common';
import { Ctx, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { UserProfile } from '../interfaces/user-profile.interface';
import { FirestoreService } from '../services/firestore.service';
import { OpenAIService } from '../services/openai.service';

const STATES = {
  IDLE: 'IDLE',
  WAITING_FOR_NICHE: 'WAITING_FOR_NICHE',
  WAITING_FOR_AUDIENCE: 'WAITING_FOR_AUDIENCE',
  WAITING_FOR_STYLE_EXAMPLE: 'WAITING_FOR_STYLE_EXAMPLE',
  WAITING_FOR_DAILY_TOPIC: 'WAITING_FOR_DAILY_TOPIC',
  WAITING_FOR_CLARIFICATION: 'WAITING_FOR_CLARIFICATION',
} as const;

@Update()
@Injectable()
export class BotUpdate {
  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly openAIService: OpenAIService,
  ) {}

  @On('text')
  async onMessage(@Ctx() ctx: Context) {
    const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text.trim() : '';
    if (!messageText) {
      await ctx.reply('Please send a text message.');
      return;
    }

    const telegramId = ctx.from?.id;
    if (!telegramId) {
      await ctx.reply('Unable to identify your account.');
      return;
    }

    const username =
      ctx.from?.username ??
      `${ctx.from?.first_name ?? ''} ${ctx.from?.last_name ?? ''}`.trim();

    let profile = await this.firestoreService.getUserProfile(telegramId);

    if (!profile) {
      profile = this.buildDefaultProfile(telegramId, username);
      await this.firestoreService.createUserProfile(profile);
    }

    if (!profile.isOnboarded) {
      await this.handleOnboarding(ctx, profile, messageText);
      return;
    }

    await this.handleDailyFlow(ctx, profile, messageText);
  }

  private buildDefaultProfile(telegramId: number, username: string): UserProfile {
    return {
      telegramId,
      username,
      isOnboarded: false,
      conversationState: STATES.IDLE,
      businessProfile: {
        projectName: username || 'Your Project',
        niche: '',
        targetAudience: '',
        valueProposition: '',
        toneOfVoice: '',
        styleExample: '',
      },
    };
  }

  private async handleOnboarding(
    ctx: Context,
    profile: UserProfile,
    messageText: string,
  ) {
    switch (profile.conversationState) {
      case STATES.WAITING_FOR_NICHE: {
        await this.firestoreService.updateUserProfile(profile.telegramId, {
          businessProfile: {
            ...profile.businessProfile,
            niche: messageText,
            projectName: messageText,
          },
          conversationState: STATES.WAITING_FOR_AUDIENCE,
        });
        await ctx.reply('Who is your audience?');
        break;
      }
      case STATES.WAITING_FOR_AUDIENCE: {
        await this.firestoreService.updateUserProfile(profile.telegramId, {
          businessProfile: {
            ...profile.businessProfile,
            targetAudience: messageText,
          },
          conversationState: STATES.WAITING_FOR_STYLE_EXAMPLE,
        });
        await ctx.reply('Send me text of your BEST post ever. I will learn your style.');
        break;
      }
      case STATES.WAITING_FOR_STYLE_EXAMPLE: {
        await this.firestoreService.updateUserProfile(profile.telegramId, {
          businessProfile: {
            ...profile.businessProfile,
            styleExample: messageText,
          },
          isOnboarded: true,
          conversationState: STATES.IDLE,
        });
        await ctx.reply('Thanks! You are onboarded. Send me a topic to craft your post.');
        break;
      }
      case STATES.IDLE:
      default: {
        await this.firestoreService.updateUserProfile(profile.telegramId, {
          conversationState: STATES.WAITING_FOR_NICHE,
        });
        await ctx.reply('Name of project & What do you do?');
        break;
      }
    }
  }

  private async handleDailyFlow(
    ctx: Context,
    profile: UserProfile,
    messageText: string,
  ) {
    if (profile.conversationState === STATES.WAITING_FOR_CLARIFICATION) {
      const topic = profile.currentDraft?.topic ?? 'your topic';
      const post = await this.openAIService.generatePost(profile, topic, messageText);

      await this.firestoreService.updateUserProfile(profile.telegramId, {
        conversationState: STATES.IDLE,
        currentDraft: {
          topic,
          userAnswer: messageText,
        },
      });

      await ctx.reply(post || 'Here is your post draft.');
      return;
    }

    const clarifyingQuestion = await this.openAIService.generateClarifyingQuestion(
      profile,
      messageText,
    );

    await this.firestoreService.updateUserProfile(profile.telegramId, {
      conversationState: STATES.WAITING_FOR_CLARIFICATION,
      currentDraft: {
        topic: messageText,
        clarifyingQuestion,
      },
    });

    await ctx.reply(clarifyingQuestion || 'Can you share more details about that?');
  }
}
