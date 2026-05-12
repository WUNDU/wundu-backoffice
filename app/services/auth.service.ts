import { api, apiClient } from "~/lib/api";

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth",
      { email, password },
      { withCredentials: true }
    );
    return data;
  }

  async refresh(): Promise<RefreshResponse> {
    const { data } = await api.post<RefreshResponse>("/auth/refresh", undefined, {
      withCredentials: true,
    });
    return data;
  }

  async logoutApi(): Promise<void> {
    await api.post("/auth/logout", undefined, { withCredentials: true });
  }

  async getAdminProfile(): Promise<AdminProfile> {
    const { data } = await apiClient.get<AdminProfile>("/users/me");
    return data;
  }
}

export const authService = new AuthService();
