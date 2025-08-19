import { initModel } from "@/lib/llama-rn";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [hasGenerateResponse, setHasGenerateResponse] =
    useState<boolean>(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      text: `Olá! Sou seu assistente GPT 😄`,
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setHasGenerateResponse((prevState) => !prevState);
    const response = await initModel(input);

    // Simula resposta do bot
    const botReply = {
      id: Date.now().toString(),
      sender: "bot",
      text: response,
    };
    setMessages((prev) => [...prev, botReply]);
    setHasGenerateResponse((prevState) => !prevState);

    setInput("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#222", padding: 20 }}>
      {/* Mensagens */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <>
            {hasGenerateResponse ? (
              <View
                style={{
                  backgroundColor: item.sender === "user" ? "#4a90e2" : "#555",
                  padding: 10,
                  borderRadius: 8,
                  marginVertical: 4,
                  alignSelf: item.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                <ActivityIndicator size="small" color={"#fff"} />
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: item.sender === "user" ? "#4a90e2" : "#555",
                  padding: 10,
                  borderRadius: 8,
                  marginVertical: 4,
                  alignSelf: item.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                <Text style={{ color: "#fff" }}>{item.text}</Text>
              </View>
            )}
          </>
        )}
        contentContainerStyle={{ padding: 10 }}
      />

      {/* Caixa de entrada */}
      <View
        style={{ flexDirection: "row", padding: 10, backgroundColor: "#333" }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: "#444",
            color: "#fff",
            padding: 10,
            borderRadius: 8,
          }}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            marginLeft: 8,
            backgroundColor: "#4a90e2",
            paddingHorizontal: 16,
            justifyContent: "center",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
