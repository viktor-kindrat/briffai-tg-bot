export interface UserProfile {
  telegramId: number;
  username: string;
  isOnboarded: boolean;
  // FSM State: 'IDLE', 'WAITING_FOR_NICHE', 'WAITING_FOR_AUDIENCE', 'WAITING_FOR_STYLE_EXAMPLE', 'WAITING_FOR_DAILY_TOPIC', 'WAITING_FOR_CLARIFICATION'
  conversationState: string;
  businessProfile: {
    projectName: string;
    niche: string;
    targetAudience: string;
    valueProposition: string;
    toneOfVoice: string;
    styleExample: string;
  };
  currentDraft?: {
    topic: string;
    clarifyingQuestion?: string;
    userAnswer?: string;
  };
}
