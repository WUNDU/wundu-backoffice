export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => ["dashboard", "stats"] as const,
    growth: (params?: { groupBy?: string }) => ["dashboard", "growth", params] as const,
    recentTransactions: () => ["dashboard", "recent-transactions"] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => ["users", "list"] as const,
    admins: () => ["users", "admins"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (type: "" | "INCOME" | "EXPENSE", page: number) =>
      ["transactions", type, page] as const,
  },
  goals: {
    all: ["goals"] as const,
    list: (page: number) => ["goals", "list", page] as const,
    stats: () => ["goals", "stats"] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: (page: number) => ["categories", "list", page] as const,
  },
} as const;
