"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";
import { mockUser } from "@/data/mock-user";

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (_email: string, _password: string) => {
        set({ isLoggedIn: true, user: mockUser });
        return true;
      },
      logout: () => {
        set({ isLoggedIn: false, user: null });
      },
    }),
    { name: "propia-auth" }
  )
);
