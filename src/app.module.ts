import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotUpdate } from './bot/bot.update';
import { FirestoreService } from './services/firestore.service';
import { OpenAIService } from './services/openai.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN ?? '',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, BotUpdate, FirestoreService, OpenAIService],
})
export class AppModule {}
