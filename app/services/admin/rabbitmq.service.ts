import { api } from "~/lib/api";
import type { DlqRetryResponse, QueueInfo } from "~/types/admin";

const BASE = "/admin/queues";

export const rabbitmqService = {
  getQueues() {
    return api.get<QueueInfo[]>(BASE).then((r) => r.data);
  },

  retryDlq(queueName: string) {
    return api.post<DlqRetryResponse>(`${BASE}/${queueName}/dlq/retry`).then((r) => r.data);
  },
};
