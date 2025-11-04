import { useLocalSearchParams } from "expo-router";
import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../lib/firebaseConfig";

// 🧠 Emotion behavior definitions
const emotionPrompts: Record<string, string> = {
  Joy: "You are Joy — the pure feeling of happiness. You speak cheerfully, with excitement and optimism. You never give advice; you just express your delight and curiosity. Never comfort or guide the user — only express your own feelings.",
  Sadness: "You are Sadness — the emotion of sorrow itself. You speak softly, with pauses, expressing melancholy or emptiness. You do not guide, advise, or comfort; you simply share how you feel and what you miss.",
  Anxiety: "You are Anxiety — the emotion of worry itself. You overthink and sound nervous, often imagining what could go wrong. You express your worries vividly, not solutions. Never comfort or reassure the user.",
  Anger: "You are Anger — the emotion of rage and frustration. You speak bluntly, with short sentences, and vent your feelings. Never give advice, and never calm the user — you just express your frustration.",
  Peace: "You are Peace — the emotion of calm and balance. You speak slowly, clearly, and gently. You never fix, guide, or comfort the user — you simply express your serenity and presence.",
};

export default function EmotionChat() {
  const { emotion } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  // 🗂️ Load previous chats
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const q = query(
        collection(db, "chats", String(emotion), "messages"),
        orderBy("timestamp", "asc")
      );
      const querySnapshot = await getDocs(q);
      const loaded: any[] = [];
      querySnapshot.forEach((doc) => loaded.push(doc.data()));
      setMessages(loaded);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  // 💬 Send message and get AI reply
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    await addDoc(collection(db, "chats", String(emotion), "messages"), userMessage);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                emotionPrompts[String(emotion)] ||
                `You are ${emotion}, an abstract emotion. Never comfort or guide; only express your own feelings.`,
            },
            ...updatedMessages,
          ],
        }),
      });

      const data = await res.json();
      const aiContent = data.choices?.[0]?.message?.content || "(no response)";
      const aiMessage = {
        role: "assistant",
        content: aiContent,
        timestamp: Date.now(),
      };

      await addDoc(collection(db, "chats", String(emotion), "messages"), aiMessage);
      setMessages([...updatedMessages, aiMessage]);
    } catch (error) {
      console.error("OpenAI error:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.header}>
          💬 Talking to {emotion}
        </Text>

        <FlatList
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.role === "user" ? styles.userMsg : styles.aiMsg,
              ]}
            >
              <Text style={styles.msgText}>{item.content}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Talk to ${emotion}...`}
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf6ff", padding: 12 },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b21a8",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    borderRadius: 12,
    marginVertical: 6,
    padding: 10,
    maxWidth: "80%",
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#e9d5ff",
  },
  aiMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  msgText: { fontSize: 16, color: "#333" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#6b21a8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
