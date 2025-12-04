import { LlamaContext, TokenData } from "llama.rn";
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateResponse, initModel } from "@/lib/llama-rn";
import Markdown from "react-native-markdown-display";
import { Picker } from "@react-native-picker/picker";

export default function Index() {
  const [loadingReplyId, setLoadingReplyId] = useState<string | null>(null);
  const [llamaCtx, setLlamaCtx] = useState<LlamaContext>({} as LlamaContext);
  const [selectedModel, setSelectedModel] = useState("");
  const [responseStreaming, setResponseStreaming] = useState<
    string | undefined
  >("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      text: `Olá! Sou seu assistente GPT 😄`,
    },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    (async () => {
      const ctx = await initModel("gemma-3-1b-it-Q6_K.gguf");
      setLlamaCtx(ctx);
    })();
  }, []);

  const getResponseStreaming = (data: TokenData) => {
    if (data.token) {
      console.log("Streaming:", data.token);
      setResponseStreaming((prevState) => `${prevState}${data.token}`);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessageId = Date.now().toString();
    const userMessage = {
      id: userMessageId,
      sender: "user",
      text: input,
    };
    setResponseStreaming("");
    setMessages((prev) => [...prev, userMessage]);
    const loadingMessage = {
      id: `${userMessageId}-loading`,
      sender: "bot",
      text: "",
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setLoadingReplyId(loadingMessage.id);
    const response = await generateResponse(
      llamaCtx,
      input,
      getResponseStreaming,
      1024
    );
    // Simula resposta do bot

    setMessages((prevState) =>
      prevState.map((message) =>
        message.id === loadingMessage.id
          ? { ...message, text: response }
          : message
      )
    );
    setLoadingReplyId(null);
    setInput("");
  };

  const markdownStyles = {
    body: { color: "#fff" },
    heading1: { color: "#fff", fontSize: 24 },
    strong: { fontWeight: "bold" },
    link: { color: "#8ecae6" },
  } as StyleSheet.NamedStyles<any>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#222", padding: 20 }}>
      <Picker
        selectedValue={selectedModel}
        onValueChange={(itemValue) => setSelectedModel(itemValue)}
        style={S.picker}
        dropdownIconColor="#FFF"
      >
        <Picker.Item label="Selecionar modelo..." value="" />
        <Picker.Item label="Gemma 2B" value="gemma" />
        <Picker.Item label="Phi 3 Mini" value="phi3" />
        <Picker.Item label="LLaMA 3.2 1B" value="llama1b" />
      </Picker>
      {/* Mensagens */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isUser = item.sender === "user";
          const isLoading =
            loadingReplyId === item.id &&
            item.sender === "bot" &&
            responseStreaming === "";

          return (
            <View
              style={{
                backgroundColor: isUser ? "#4a90e2" : "#555",
                padding: 10,
                borderRadius: 8,
                marginVertical: 4,
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: "80%",
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : !item.text ? (
                <Markdown style={markdownStyles}>{responseStreaming}</Markdown>
              ) : (
                <Markdown style={markdownStyles}>{item.text}</Markdown>
              )}
            </View>
          );
        }}
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

const S = StyleSheet.create({
  button: {
    backgroundColor: "#315cd3ff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 5,
    alignItems: "center",
    width: "49%",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  picker: {
    marginBottom: 10,
    color: "#FFF",
    backgroundColor: "#333",
    borderRadius: 8,
  },
});
