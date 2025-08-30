export class MissionProgressException extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'MissionProgressException';
  }
}

export class InvalidMissionTypeException extends MissionProgressException {
  constructor(missionType: string) {
    super(`Invalid mission type: ${missionType}`, 'INVALID_MISSION_TYPE');
  }
}

export class MissionNotFoundException extends MissionProgressException {
  constructor(missionId: string) {
    super(`Mission not found: ${missionId}`, 'MISSION_NOT_FOUND');
  }
}

export class MissionProgressCalculationException extends MissionProgressException {
  constructor(message: string, cause?: Error) {
    super(`Mission progress calculation failed: ${message}`, 'CALCULATION_FAILED');
    if (cause) {
      this.stack = cause.stack;
    }
  }
}

export class MissionRewardGrantException extends MissionProgressException {
  constructor(userId: string, missionId: string, cause?: Error) {
    super(`Failed to grant mission reward for user ${userId}, mission ${missionId}`, 'REWARD_GRANT_FAILED');
    if (cause) {
      this.stack = cause.stack;
    }
  }
}