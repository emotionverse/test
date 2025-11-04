import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
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
import { app } from "./firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

// Initialize Firebase auth
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

  // ✅ Always use Expo proxy redirect in dev
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  console.log("👉 Redirect URI used:", redirectUri);

  // ✅ Use ONLY webClientId for Expo proxy login
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "942038424737-1be35f0g5rpm1slkbpj9vrkncml10b1p.apps.googleusercontent.com", // ← web client only
    redirectUri,
  });

  // Monitor auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("👤 Auth state changed:", firebaseUser?.email || "No user");
      setUser(firebaseUser || null);
    });
    return unsub;
  }, []);

  // Handle sign-in response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => console.log("✅ Google Sign-In successful"))
        .catch((e) => console.error("❌ Sign-in error:", e));
    }
  }, [response]);

  return { user, promptAsync };
};
