// app/login.tsx
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGoogleAuth } from "../lib/auth";

export default function LoginScreen() {
  const router = useRouter();
  const { user, promptAsync, loading } = useGoogleAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6b21a8" />
      </View>
    );
  }

  if (user) {
    router.replace("/(tabs)");
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌈 Welcome to Emotionverse</Text>
      <Text style={styles.subtitle}>Sign in to begin your journey</Text>

      <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fdf6ff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6b21a8",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#6b21a8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
