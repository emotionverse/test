import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

 

  const emotions = [
    { id: "1", name: "Joy", emoji: "😊" },
    { id: "2", name: "Sadness", emoji: "😢" },
    { id: "3", name: "Anxiety", emoji: "😰" },
    { id: "4", name: "Anger", emoji: "😡" },
    { id: "5", name: "Peace", emoji: "😌" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌈 Welcome to Emotionverse</Text>
      <Text style={styles.subtitle}>Choose your emotion to begin</Text>

      <FlatList
        data={emotions}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.emotionCard,
              selected === item.name && styles.selectedCard,
            ]}
            onPress={() => {
              setSelected(item.name);
              router.push(`/emotion/${item.name}`);
            }}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.emotionText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {selected && (
        <Text style={styles.selectionText}>
          You selected <Text style={{ fontWeight: "bold" }}>{selected}</Text> 💭
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdf6ff",
    paddingTop: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6b21a8",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  emotionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 30,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  selectedCard: {
    backgroundColor: "#e9d5ff",
  },
  emoji: {
    fontSize: 40,
  },
  emotionText: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  selectionText: {
    marginTop: 30,
    fontSize: 18,
    color: "#6b21a8",
  },
});
