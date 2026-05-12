// ─── Enums ────────────────────────────────────────────────────────────────────

export type KycStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "REQUIRES_EDD";
export type RiskTier = "LOW" | "MEDIUM" | "HIGH";
export type PlanType = "FREE" | "PREMIUM";
export type UserRole = "CLIENTE" | "ADMIN";

export type DocumentStatus =
  | "PENDING"
  | "OCR_PROCESSING"
  | "PROCESSED"
  | "NEEDS_MANUAL_CATEGORY"
  | "REJECTED_NOT_RECEIPT"
  | "DUPLICATE"
  | "FAILED";

export type AuditAction =
  | "USER_ACTIVATED" | "USER_DEACTIVATED" | "USER_SUSPENDED" | "USER_FROZEN"
  | "USER_PLAN_CHANGED" | "KYC_STATUS_CHANGED" | "LIMIT_OVERRIDE" | "SESSIONS_REVOKED"
  | "ADMIN_PROMOTED" | "ADMIN_DEMOTED" | "SESSION_REVOKED" | "SECURITY_UNBLOCKED"
  | "CATEGORY_CREATED" | "CATEGORY_UPDATED" | "CATEGORY_DELETED"
  | "DOCUMENT_DELETED" | "BROADCAST_SENT" | "CONFIG_UPDATED" | "AUDIT_EXPORTED";

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── §1 Users ─────────────────────────────────────────────────────────────────

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  planType: PlanType;
  kycStatus: KycStatus;
  riskTier: RiskTier;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  emailVerified: boolean;
  updatedAt: string;
  lastLogin: string | null;
  frozenAt: string | null;
  freezeReason: string | null;
  kycReviewedBy: string | null;
  kycReviewedAt: string | null;
  kycRejectionReason: string | null;
  planStart: string | null;
  planEnd: string | null;
  isTrial: boolean;
}

export interface UserListParams {
  kycStatus?: KycStatus;
  riskTier?: RiskTier;
  isActive?: boolean;
  plan?: PlanType;
  page?: number;
  size?: number;
  sort?: string;
}

export interface FreezeUserRequest {
  reason: string;
}

export interface ReviewKycRequest {
  status: KycStatus;
  reason?: string | null;
}

export interface ChangePlanRequest {
  planType: PlanType;
}

export interface OverrideLimitRequest {
  monthlyLimit: number;
  reason: string;
}

// ─── §2 Admins ────────────────────────────────────────────────────────────────

export interface AdminSummary {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface PromoteAdminRequest {
  userId: string;
}

// ─── §3 Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  kycApprovedUsers: number;
  kycPendingUsers: number;
  usersByPlan: Record<string, number>;
  usersByRiskTier: Record<string, number>;
  totalTransactions: number;
  totalTransactionValue: number;
  totalIncome: number;
  totalExpenses: number;
  averageTransactionValue: number;
  transactionsByCategory: Record<string, number>;
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  newUsersLast30Days: number;
  activeSessions: number;
}

export interface UserGrowthPoint {
  date: string;
  newUsers: number;
}

// ─── §4 Security ──────────────────────────────────────────────────────────────

export interface LoginAttempt {
  key: string;
  type: "email" | "ip";
  identifier: string;
  failureCount: number;
  blocked: boolean;
  ttlSeconds: number;
}

// ─── §5 Sessions ──────────────────────────────────────────────────────────────

export interface AdminSession {
  tokenId: string;
  userId: string;
  userEmail: string;
  userAgent: string;
  ipAddress: string;
  issuedAt: string;
  expiresAt: string;
}

// ─── §6 Categories ────────────────────────────────────────────────────────────

export interface AdminCategory {
  id: string;
  name: string;
  type: "DEFAULT" | "CUSTOM";
  userId: string | null;
  isActive: boolean;
  deletedAt: string | null;
}

export interface CategoryListParams {
  type?: "DEFAULT" | "CUSTOM";
  userId?: string;
  name?: string;
  page?: number;
  size?: number;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

// ─── §7 Transactions ──────────────────────────────────────────────────────────

export interface AdminTransactionSummary {
  id: string;
  userId: string;
  type: "INCOME" | "EXPENSE";
  source: string;
  amount: number;
  description: string;
  status: string;
  categoryName: string;
  transactionDate: string;
  createdAt: string;
}

export interface AdminTransactionDetail extends AdminTransactionSummary {
  operationNumber: string | null;
  categoryId: string;
  ocr: {
    ocrRecordId: string;
    fileName: string;
    docType: string;
    ocrStatus: string;
    confidence: number;
  } | null;
}

export interface TransactionListParams {
  userId?: string;
  categoryId?: string;
  type?: "INCOME" | "EXPENSE";
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ─── §8 Goals ─────────────────────────────────────────────────────────────────

export interface AdminGoal {
  id: string;
  userId: string;
  title: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  status: "ACTIVE" | "DONE" | "ARCHIVED";
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface GoalStats {
  total: number;
  active: number;
  completed: number;
  completionRate: number;
  averageTargetAmount: number;
  averageCurrentAmount: number;
}

export interface GoalListParams {
  userId?: string;
  status?: "ACTIVE" | "DONE" | "ARCHIVED";
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

// ─── §9 Documents ─────────────────────────────────────────────────────────────

export interface AdminDocumentSummary {
  id: string;
  userId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  status: DocumentStatus;
  docType: string;
  provider: string;
  geminiConfidence: number | null;
  createdAt: string;
}

export interface AdminDocumentDetail extends AdminDocumentSummary {
  docHash: string;
  extractedText: string | null;
  geminiModelVersion: string | null;
  geminiRawResponse: string | null;
}

export interface OcrStats {
  total: number;
  successRate: number;
  avgConfidence: number;
  byStatus: Record<DocumentStatus, number>;
  byProvider: Record<string, number>;
}

export interface DocumentListParams {
  userId?: string;
  status?: DocumentStatus;
  docType?: string;
  page?: number;
  size?: number;
}

// ─── §10 Notifications ───────────────────────────────────────────────────────

export interface AdminNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  readRate: number;
  byType: Record<string, number>;
}

export interface BroadcastRequest {
  userIds: string[];
  title: string;
  message: string;
  type?: string;
}

export interface BroadcastResponse {
  sent: number;
}

export interface NotificationListParams {
  userId?: string;
  type?: string;
  isRead?: boolean;
  page?: number;
  size?: number;
}

// ─── §11 AI ──────────────────────────────────────────────────────────────────

export interface AiUsage {
  totalRequests: number;
  byModel: Record<string, number>;
  note: string;
}

export interface AiCostEstimate {
  disclaimer: string;
  byModel: Record<string, {
    requests: number;
    estimatedTokens: number;
    estimatedCostUsd: number;
  }>;
}

export interface AdminConversationSummary {
  id: string;
  userId: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string;
}

export interface AdminConversationDetail {
  conversationId: string;
  userId: string;
  totalMessages: number;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    sentAt: string;
  }>;
}

export interface AiRateLimit {
  userId: string;
  dailyRequests: number;
  dailyLimit: number;
  ttlSeconds: number;
}

export interface ConversationListParams {
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

// ─── §12 System ──────────────────────────────────────────────────────────────

export interface SystemHealth {
  status: "UP" | "DOWN" | "DEGRADED";
  components: Record<string, { status: string; details: Record<string, unknown> }>;
  checkedAt: string;
}

export interface SystemInfo {
  version: string;
  uptime: string;
  profiles: string[];
  buildHash: string;
  jvm: {
    vendor: string;
    version: string;
    heapMaxMb: number;
    heapUsedMb: number;
  };
}

export interface SystemMetrics {
  cpuUsagePercent: number;
  memory: { totalMb: number; usedMb: number; freeMb: number };
  heap: { maxMb: number; usedMb: number };
  threads: { total: number; daemon: number; peak: number };
  connectionPool: { active: number; idle: number; max: number; waiting: number };
}

// ─── §13 Feature Flags ───────────────────────────────────────────────────────

export interface FeatureFlag {
  key: string;
  value: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UpdateFlagRequest {
  value: string;
}

// ─── §14 Audit ───────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  actorIp: string;
  targetType: string;
  targetId: string;
  action: AuditAction;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  sessionId: string;
  userAgent: string;
}

export interface AuditListParams {
  actorId?: string;
  targetType?: string;
  action?: AuditAction;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

// ─── §15 RabbitMQ ────────────────────────────────────────────────────────────

export interface QueueInfo {
  name: string;
  messageCount: number;
  consumerCount: number;
  isDlq: boolean;
}

export interface DlqRetryResponse {
  queue: string;
  retriedMessages: number;
}

// ─── §16 Chat Cache ──────────────────────────────────────────────────────────

export interface ClearCacheResponse {
  message: string;
  entriesRemoved: number;
}
