export interface User {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  is_platform_admin: boolean;
}

export interface MyRole {
  app_key: string;
  role_key: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  display_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenResponse;
}
