import "../global.css";

import { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useAtomValue, useSetAtom } from "jotai";
import "react-native-reanimated";

import { useAppTheme } from "@/src/hooks/useAppTheme";
import { queryClient } from "@/src/services/queryClient";
import {
  isAuthenticatedAtom,
  isLoadingSessionAtom,
  userAtom,
} from "@/src/store/auth";
import { loadThemeAtom } from "@/src/store/theme";
import { hydrateSession } from "@/src/services/authService";

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const isLoading = useAtomValue(isLoadingSessionAtom);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { mode } = useAppTheme();
  const setUser = useSetAtom(userAtom);
  const setIsLoading = useSetAtom(isLoadingSessionAtom);
  const loadTheme = useSetAtom(loadThemeAtom);

  useEffect(() => {
    (async () => {
      await loadTheme();
      try {
        const user = await hydrateSession();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
        try {
          await SplashScreen.hideAsync();
        } catch {
          // Ignore if splash screen is not registered
        }
      }
    })();
  }, [setIsLoading, setUser, loadTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={mode === "dark" ? DarkTheme : DefaultTheme}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="add-book"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="add-saga"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="edit-book/[id]"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="add-category"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="saga/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="edit-saga/[id]"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
          </Stack>
        </AuthGate>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
