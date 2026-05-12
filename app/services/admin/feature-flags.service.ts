import { api } from "~/lib/api";
import type { FeatureFlag, UpdateFlagRequest } from "~/types/admin";

const BASE = "/admin/feature-flags";

export const featureFlagsService = {
  list() {
    return api.get<FeatureFlag[]>(BASE).then((r) => r.data);
  },

  update(key: string, body: UpdateFlagRequest) {
    return api.put<FeatureFlag>(`${BASE}/${key}`, body).then((r) => r.data);
  },
};
