import type {
  RoutineCreateRequest,
  ExecutionRecordCreateRequest,
  UserSettingsUpdateRequest,
} from '@/lib/api-types/endpoints';
import {
  RoutinesGetResponseSchema,
  RoutinePostResponseSchema,
  RoutinePutResponseSchema,
  RoutineDeleteResponseSchema,
  ExecutionRecordsGetResponseSchema,
  ExecutionRecordPostResponseSchema,
  UserSettingsGetResponseSchema,
  UserSettingsPutResponseSchema,
  CategoriesGetResponseSchema,
  CategoryPostResponseSchema,
  UserProfileGetResponseSchema,
  ChallengesGetResponseSchema,
  ChallengePostResponseSchema,
} from '@/lib/schemas/api-response';

import { typedGet, typedPost, typedPut, typedDelete, typedPatch } from './fetch-client';

// Base URL取得
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

// Routines API Client
export const routinesAPI = {
  async getAll() {
    return typedGet(`${getBaseUrl()}/api/routines`, RoutinesGetResponseSchema);
  },

  async create(data: RoutineCreateRequest) {
    return typedPost(`${getBaseUrl()}/api/routines`, RoutinePostResponseSchema, data);
  },

  async update(id: string, data: Partial<RoutineCreateRequest>) {
    return typedPut(`${getBaseUrl()}/api/routines/${id}`, RoutinePutResponseSchema, data);
  },

  async delete(id: string) {
    return typedDelete(`${getBaseUrl()}/api/routines/${id}`, RoutineDeleteResponseSchema);
  },

  async restore(id: string) {
    return typedPatch(`${getBaseUrl()}/api/routines/${id}`, RoutinePutResponseSchema);
  },
};

// Execution Records API Client
export const executionRecordsAPI = {
  async getAll(params?: { startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    
    const query = searchParams.toString();
    const url = `${getBaseUrl()}/api/execution-records${query ? `?${query}` : ''}`;
    
    return typedGet(url, ExecutionRecordsGetResponseSchema);
  },

  async create(data: ExecutionRecordCreateRequest) {
    return typedPost(`${getBaseUrl()}/api/execution-records`, ExecutionRecordPostResponseSchema, data);
  },
};

// User Settings API Client
export const userSettingsAPI = {
  async get() {
    return typedGet(`${getBaseUrl()}/api/user-settings`, UserSettingsGetResponseSchema);
  },

  async update(data: UserSettingsUpdateRequest) {
    return typedPut(`${getBaseUrl()}/api/user-settings`, UserSettingsPutResponseSchema, data);
  },
};

// Categories API Client
export const categoriesAPI = {
  async getAll() {
    return typedGet(`${getBaseUrl()}/api/categories`, CategoriesGetResponseSchema);
  },

  async create(data: { name: string; color?: string }) {
    return typedPost(`${getBaseUrl()}/api/categories`, CategoryPostResponseSchema, data);
  },
};

// User Profile API Client
export const userProfileAPI = {
  async get() {
    return typedGet(`${getBaseUrl()}/api/user-profile`, UserProfileGetResponseSchema);
  },
};

// Challenges API Client
export const challengesAPI = {
  async getAll() {
    return typedGet(`${getBaseUrl()}/api/challenges`, ChallengesGetResponseSchema);
  },

  async join(challengeId: string, userId: string) {
    return typedPost(`${getBaseUrl()}/api/challenges`, ChallengePostResponseSchema, {
      action: 'join',
      challengeId,
      userId,
    });
  },

  async leave(challengeId: string, _userId: string) {
    return typedDelete(`${getBaseUrl()}/api/challenges/${challengeId}`, ChallengePostResponseSchema);
  },
};

// 統一されたAPI Client
export const apiClient = {
  routines: routinesAPI,
  executionRecords: executionRecordsAPI,
  userSettings: userSettingsAPI,
  categories: categoriesAPI,
  userProfile: userProfileAPI,
  challenges: challengesAPI,
};