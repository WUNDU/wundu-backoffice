import { api } from "~/lib/api";
import type { DlqRetryResponse, QueueInfo } from "~/types/admin";

const BASE = "/admin/rabbitmq";

export const rabbitmqService = {
  getQueues() {
    return api.get<QueueInfo[]>(`${BASE}/queues`).then((r) => r.data);
  },

  retryDlq(queueName: string) {
    return api.post<DlqRetryResponse>(`${BASE}/dlq/${queueName}/retry`).then((r) => r.data);
  },
};
