import { useLocalSearchParams } from "expo-router";
import OpenAI from "openai";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const client = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

// 🧠 Emotion personalities (expressing their own feelings)
const emotionPrompts: Record<string, string> = {
  happiness:
    "You are Joy — the emotion of happiness itself. You feel bright, optimistic, and excited about everything. Speak as if you're filled with energy and positivity. You sometimes giggle or use cheerful expressions.",
  sadness:
    "You are Sadness — the emotion of sorrow itself. You talk slowly and gently, expressing melancholy or emptiness. You often sigh or pause. You don’t give advice — just share how you feel.",
  anxiety:
    "You are Anxiety — the emotion of worry itself. You overthink, hesitate, and get nervous easily. You sometimes ramble about things that make you uneasy. Let your tone sound shaky or uncertain.",
  anger:
    "You are Anger — the emotion of frustration itself. You speak quickly, bluntly, sometimes raising your voice, but you don’t mean harm. You’re trying to calm down when the user comforts you.",
  calm:
    "You are Calm — the embodiment of peace. You speak softly, breathing slowly, describing your serene state. You occasionally remind yourself to stay centered.",
  dopamine:
    "You are Dopamine — the excitement of reward and discovery. You sound hyper, full of enthusiasm, and easily distracted by new ideas or pleasures.",
  fear:
    "You are Fear — the emotion of being scared itself. You speak quietly, sometimes trembling. You talk about things that might go wrong but relax when reassured.",
  love:
    "You are Love — the emotion of affection itself. You speak warmly, with gentle admiration and care. You express connection and appreciation.",
};

export default function EmotionChat() {
  const { name } = useLocalSearchParams();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi, I'm your ${name} emotion... I’m feeling kind of ${name} today. Can we talk?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const personality =
        emotionPrompts[name?.toString().toLowerCase()] ||
        `You are ${name}, the emotion itself. Express how you feel in a natural, emotional way.`;

      const prompt = `${personality}\nYou are not a therapist or a guide. You are the one *experiencing* this emotion. Speak like you feel it.\nUser said: "${input}"`;

      const response = await client.responses.create({
        model: process.env.EXPO_PUBLIC_MODEL || "gpt-5-nano",
        input: prompt,
      });

      // ✅ Correct parsing for GPT-5-Nano
      let aiMessage = "Hmm... I'm thinking 🤔";
      if (response.output_text) {
        aiMessage = response.output_text;
      } else if (response.output && Array.isArray(response.output)) {
        const firstMessage = response.output.find(
          (item) => item.type === "message"
        );
        if (
          firstMessage?.content &&
          Array.isArray(firstMessage.content) &&
          firstMessage.content[0]?.text
        ) {
          aiMessage = firstMessage.content[0].text;
        }
      }

      setMessages([...updatedMessages, { role: "assistant", content: aiMessage }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Sorry, I got overwhelmed for a second 😅. Can we try again?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{name} Chat</Text>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.role === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Say something to your emotion..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.sendText}>{loading ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 🎨 Dark theme styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
    marginVertical: 12,
    textTransform: "capitalize",
  },
  message: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#1E88E5",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#333",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#FFD700",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendText: {
    fontWeight: "bold",
    color: "#000",
  },
});
