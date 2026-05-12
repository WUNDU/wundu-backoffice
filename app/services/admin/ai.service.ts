import { api } from "~/lib/api";
import type {
  AiCostEstimate,
  AiRateLimit,
  AiUsage,
  AdminConversationDetail,
  AdminConversationSummary,
  ConversationListParams,
  Page,
} from "~/types/admin";

const BASE = "/admin/ai";

export const aiService = {
  getUsage() {
    return api.get<AiUsage>(`${BASE}/usage`).then((r) => r.data);
  },

  getCosts() {
    return api.get<AiCostEstimate>(`${BASE}/usage/costs`).then((r) => r.data);
  },

  listConversations(params?: ConversationListParams) {
    return api.get<Page<AdminConversationSummary>>(`${BASE}/conversations`, { params }).then((r) => r.data);
  },

  getConversation(conversationId: string) {
    return api.get<AdminConversationDetail>(`${BASE}/conversations/${conversationId}`).then((r) => r.data);
  },

  deleteConversation(conversationId: string) {
    return api.delete<void>(`${BASE}/conversations/${conversationId}`).then((r) => r.data);
  },

  getRateLimits() {
    return api.get<AiRateLimit[]>(`${BASE}/rate-limits`).then((r) => r.data);
  },
};
