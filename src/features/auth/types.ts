export type AuthUser = {
  id?: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};