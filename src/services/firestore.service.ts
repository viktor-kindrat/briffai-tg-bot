import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserProfile } from '../interfaces/user-profile.interface';

const USERS_COLLECTION = 'users';

@Injectable()
export class FirestoreService {
  private readonly db: FirebaseFirestore.Firestore;

  constructor() {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
    this.db = admin.firestore();
  }

  private getUserDocRef(telegramId: number) {
    return this.db.collection(USERS_COLLECTION).doc(String(telegramId));
  }

  async getUserProfile(telegramId: number): Promise<UserProfile | null> {
    const snapshot = await this.getUserDocRef(telegramId).get();
    if (!snapshot.exists) {
      return null;
    }
    return snapshot.data() as UserProfile;
  }

  async createUserProfile(profile: UserProfile): Promise<void> {
    await this.getUserDocRef(profile.telegramId).set(profile);
  }

  async updateUserProfile(
    telegramId: number,
    updates: Partial<UserProfile>,
  ): Promise<void> {
    await this.getUserDocRef(telegramId).set(updates, { merge: true });
  }
}
