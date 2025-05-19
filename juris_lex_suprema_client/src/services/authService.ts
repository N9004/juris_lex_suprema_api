// src/services/authService.ts
import { api } from './api'; // Import the configured api client
import type { User, UserCreate, Token, EmailVerificationPayload } from '../types/entities';

// API_URL will be handled by the 'api' client instance
// const API_URL = 'http://localhost:8000'; // This is no longer needed here

export interface LoginCredentials {
  email: string;
  password: string;
}

// RegisterCredentials might need adjustment if backend expects UserCreate schema directly
// For now, keeping it as is, assuming UserCreate is compatible or handled by endpoint.
// Original RegisterCredentials included verification_code, which is unusual for a direct /users/ POST.
// Assuming UserCreate is the correct schema for POST /users/
// export interface RegisterCredentials {
//   email: string;
//   password: string;
//   full_name?: string; // Matching UserCreate
// }

export interface AuthResponse extends Token {}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.email); // FastAPI OAuth2PasswordRequestForm expects 'username'
    formData.append('password', credentials.password);

    // Use the api client. Note: Content-Type for FormData will be set by browser/axios automatically.
    // The api client uses axiosInstance which has its own Content-Type default that might be overridden.
    // For /token with FormData, typically Content-Type is 'application/x-www-form-urlencoded' or handled by FormData itself.
    // We might need a separate axios instance or override for this specific call if api.ts default Content-Type interferes.
    // However, the original AuthService also used a new axios.post, let's try with a specific config for api.post here.
    const response = await api.post<AuthResponse>('/token', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  }

  async register(userData: UserCreate): Promise<User> { // Changed to UserCreate and returns User
    // Assuming POST /users/ expects application/json as per api.ts default
    const response = await api.post<User>('/users/', userData);
    return response.data; // Return created user data as per typical REST patterns
  }

  async verifyEmail(payload: EmailVerificationPayload): Promise<void> { // Use EmailVerificationPayload type
    // Assuming POST /users/verify-email/ expects application/json
    await api.post<void>('/users/verify-email/', payload);
  }

  logout(): void {
    localStorage.removeItem('token');
    // Optionally, redirect or notify other parts of the app
    // window.location.href = '/login'; // This is already handled by api.ts interceptor on 401
  }

  getCurrentToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentToken();
  }

  async getCurrentUser(): Promise<User> {
    // This request will now automatically use the token from localStorage via api.ts interceptor
    const response = await api.get<User>('/users/me/');
    return response.data;
  }
}

export const authService = new AuthService();