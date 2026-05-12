import { api } from "~/lib/api";
import type { FeatureFlag, UpdateFlagRequest } from "~/types/admin";

const BASE = "/admin/config";

export const featureFlagsService = {
  list() {
    return api.get<FeatureFlag[]>(BASE).then((r) => r.data);
  },

  update(key: string, body: UpdateFlagRequest) {
    return api.patch<FeatureFlag>(`${BASE}/${key}`, body).then((r) => r.data);
  },
};
