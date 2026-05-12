import { api } from "~/lib/api";
import type {
  AdminUserDetail,
  AdminUserSummary,
  ChangePlanRequest,
  FreezeUserRequest,
  OverrideLimitRequest,
  Page,
  ReviewKycRequest,
  UserListParams,
} from "~/types/admin";

const BASE = "/admin/users";

export const userService = {
  list(params?: UserListParams) {
    return api.get<Page<AdminUserSummary>>(BASE, { params }).then((r) => r.data);
  },

  get(userId: string) {
    return api.get<AdminUserDetail>(`${BASE}/${userId}`).then((r) => r.data);
  },

  activate(userId: string) {
    return api.post<void>(`${BASE}/${userId}/activate`).then((r) => r.data);
  },

  deactivate(userId: string) {
    return api.post<void>(`${BASE}/${userId}/deactivate`).then((r) => r.data);
  },

  freeze(userId: string, body: FreezeUserRequest) {
    return api.post<void>(`${BASE}/${userId}/freeze`, body).then((r) => r.data);
  },

  unfreeze(userId: string) {
    return api.post<void>(`${BASE}/${userId}/unfreeze`).then((r) => r.data);
  },

  reviewKyc(userId: string, body: ReviewKycRequest) {
    return api.post<void>(`${BASE}/${userId}/kyc/review`, body).then((r) => r.data);
  },

  changePlan(userId: string, body: ChangePlanRequest) {
    return api.post<void>(`${BASE}/${userId}/plan`, body).then((r) => r.data);
  },

  overrideLimits(userId: string, body: OverrideLimitRequest) {
    return api.post<void>(`${BASE}/${userId}/limits`, body).then((r) => r.data);
  },

  revokeSessions(userId: string) {
    return api.post<void>(`${BASE}/${userId}/sessions/revoke`).then((r) => r.data);
  },
};
