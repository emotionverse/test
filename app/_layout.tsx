// app/_layout.tsx
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { useGoogleAuth } from "../lib/auth";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user } = useGoogleAuth();

  // 🔁 Redirect user based on authentication state
  useEffect(() => {
    if (user === null) {
      router.replace("/login"); // Not signed in → go to login
    } else if (user) {
      router.replace("/(tabs)"); // Signed in → go to main app
    }
  }, [user]);

  // ⏳ Show a loading spinner while Firebase checks session
  if (user === undefined) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fdf6ff",
        }}
      >
        <ActivityIndicator size="large" color="#6b21a8" />
      </View>
    );
  }

  // 🎨 App navigation and theming
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Main Tabs (Emotionverse Home) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Modal Example */}
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />

        {/* Login Screen */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
