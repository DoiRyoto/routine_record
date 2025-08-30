import { Challenge } from '../entities/Challenge';
import { ChallengeId } from '../valueObjects/ChallengeId';
import { UserId } from '../valueObjects/UserId';

export interface IChallengeRepository {
  findById(id: ChallengeId): Promise<Challenge | null>;
  findActive(): Promise<Challenge[]>;
  save(challenge: Challenge): Promise<void>;
  delete(id: ChallengeId): Promise<void>;
  findParticipants(challengeId: ChallengeId): Promise<UserId[]>;
  addParticipant(challengeId: ChallengeId, userId: UserId): Promise<void>;
  removeParticipant(challengeId: ChallengeId, userId: UserId): Promise<void>;
}