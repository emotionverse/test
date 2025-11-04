// lib/auth.js
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {
    getAuth,
    getReactNativePersistence,
    GoogleAuthProvider,
    initializeAuth,
    onAuthStateChanged,
    signInWithCredential,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { app } from "./firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

// ✅ Initialize Firebase Auth safely (works on Android & iOS)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export const useGoogleAuth = () => {
  const [user, setUser] = useState(undefined);

  // ⚙️ Detect environment
  const isExpoGo = Constants.executionEnvironment === "storeClient";
  const redirectUri = "https://auth.expo.io/@emotionverse/emotionverse";

  console.log("👉 Environment:", isExpoGo ? "Expo Go" : "Dev Client");
  console.log("👉 Redirect URI used:", redirectUri);

  // ✅ Google Sign-In request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "942038424737-1be35f0g5rpm1slkbpj9vrkncml10b1p.apps.googleusercontent.com", // Web client ID only
    redirectUri,
  });

  // 👤 Track Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("👤 Auth state changed:", firebaseUser?.email || "No user");
      setUser(firebaseUser || null);
    });
    return unsub;
  }, []);

  // ⚙️ Handle Google response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => console.log("✅ Google Sign-In successful"))
        .catch((e) => console.error("❌ Sign-in error:", e));
    }
  }, [response]);

  // 🚫 Prevent crashes in Dev Client
  const safePromptAsync = async () => {
    if (!isExpoGo) {
      Alert.alert(
        "⚠️ Google Sign-In Unavailable",
        "Google Sign-In works only in Expo Go during development.\n\nTo use it in your Dev Client or Play Store app, you’ll need to verify your app and add a valid redirect URI in the Google Cloud Console."
      );
      return;
    }
    await promptAsync();
  };

  return { user, promptAsync: safePromptAsync };
};
