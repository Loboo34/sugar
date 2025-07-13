import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/index";
import { getUserProfile, loginUser, registerUser } from "../services/api";

// Define at the top of your file
interface ApiError {
  message: string;
  status?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  isAuthenticated: () => boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (user: User) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>; // Fixed: should be Promise<void>
}



export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      setUser: (user: User | null) => set({ user }),
      isAuthenticated: () => {
        const state = get() as AuthState;
        return !!(state.user && state.token);
      },
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginUser(email, password);
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
        } catch (error: unknown) {
          let errorMessage = "Login failed";

          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (
            typeof error === "object" &&
            error !== null &&
            "message" in error
          ) {
            errorMessage = (error as ApiError).message;
          }

          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            token: null,
          });
        }
      },
      register: async (userData: User) => {
        set({ isLoading: true, error: null });
        try {
          const response = await registerUser(userData);
          set({
            user: userData,
            token: response.token,
            isLoading: false,
          });
        } catch (error: unknown) {
          let errorMessage = "Login failed";

          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (
            typeof error === "object" &&
            error !== null &&
            "message" in error
          ) {
            errorMessage = (error as ApiError).message;
          }

          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            token: null,
          });
        }
      },
      getProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await getUserProfile();
          set({
            user: response,
            isLoading: false,
          });
        } catch (error: unknown) {
          let errorMessage = "Login failed";

          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (
            typeof error === "object" &&
            error !== null &&
            "message" in error
          ) {
            errorMessage = (error as ApiError).message;
          }

          set({
            isLoading: false,
            error: errorMessage,
          });
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          error: null,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
