"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Property } from "@/types/property";
import { mockProperties } from "@/data/mock-properties";

interface PropertyState {
  properties: Property[];
  currentPropertyId: string | null;
  addProperty: (property: Omit<Property, "id" | "status" | "createdAt" | "updatedAt">) => string;
  updatePropertyStatus: (id: string, status: Property["status"]) => void;
  setCurrentProperty: (id: string | null) => void;
  getProperty: (id: string) => Property | undefined;
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: mockProperties,
      currentPropertyId: null,
      addProperty: (data) => {
        const id = `prop-${Date.now()}`;
        const now = new Date().toISOString();
        const property: Property = {
          ...data,
          id,
          status: "draft",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          properties: [property, ...state.properties],
          currentPropertyId: id,
        }));
        return id;
      },
      updatePropertyStatus: (id, status) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      setCurrentProperty: (id) => set({ currentPropertyId: id }),
      getProperty: (id) => get().properties.find((p) => p.id === id),
    }),
    { name: "propia-properties" }
  )
);
