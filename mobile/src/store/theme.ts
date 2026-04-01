import { atom } from "jotai";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemePreference = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "mylibrary_theme_preference";

const getInitialTheme = (): ThemePreference => {
  return "system";
};

export const themePreferenceAtom = atom<ThemePreference>(getInitialTheme());

export const loadThemeAtom = atom(
  null,
  async (get, set) => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        set(themePreferenceAtom, stored);
      }
    } catch (e) {
      console.warn("Failed to read theme from storage", e);
    }
  }
);

export const saveThemeAtom = atom(
  null,
  async (get, set, newTheme: ThemePreference) => {
    set(themePreferenceAtom, newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Failed to save theme to storage", e);
    }
  }
);
