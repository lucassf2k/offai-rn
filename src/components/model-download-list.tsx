import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { ProgressBar } from "react-native-paper";
import { removeModel } from "@/lib/llama-rn";

const BASE_PATH = FileSystem.documentDirectory;
const DOWNLOAD_DIR = `${BASE_PATH}models/`;
const MODEL_NAME = "Phi-3-mini-4k-instruct-q4.gguf";
const MODEL_PATH = `${DOWNLOAD_DIR}${MODEL_NAME}`;

const models = [
  {
    id: "1",
    name: "Gemma 3 4B",
    filename: "gemma-3-4b-it-UD-IQ2_M.gguf",
    link: "https://huggingface.co/unsloth/gemma-3-4b-it-GGUF/resolve/main/gemma-3-4b-it-UD-IQ2_M.gguf",
  },
  {
    id: "2",
    name: "Phi 3 Mini",
    filename: "Phi-3-mini-4k-instruct-IQ2_M.gguf",
    link: "https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/resolve/main/Phi-3-mini-4k-instruct-IQ2_M.gguf",
  },
  { id: "3", name: "LLaMA 3.2 3B", filename: "", link: "" },
  {
    id: "4",
    name: "LLaMA 3.2 1B Q4M",
    filename: "Llama-3.2-1B-Instruct-Q4_K_M.gguf",
    link: "https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf",
  },
  {
    id: "5",
    name: "Gemma 3 1B Q6K",
    filename: "gemma-3-1b-it-Q6_K.gguf",
    link: "https://huggingface.co/unsloth/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q6_K.gguf",
  },
  {
    id: "6",
    name: "LLama 3.2 1B Q6K",
    filename: "Llama-3.2-1B-Instruct-Q6_K.gguf",
    link: "https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q6_K.gguf",
  },
];

export function ModelDownloadList() {
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");

  async function downloadModel(
    url: string,
    filename: string,
    onProgress?: (progress: number) => void
  ) {
    const folderInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, {
        intermediates: true,
      });
    }

    const fileInfo = await FileSystem.getInfoAsync(
      `${DOWNLOAD_DIR}/${filename}`
    );
    if (fileInfo.exists) {
      console.log("✅ Modelo já existe:", `${DOWNLOAD_DIR}/${filename}`);
      return MODEL_PATH;
    }

    console.log("📥 Baixando modelo...");

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      `${DOWNLOAD_DIR}/${filename}`,
      {},
      (downloadProgress) => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;

        if (onProgress) onProgress(progress);
      }
    );

    try {
      await downloadResumable.downloadAsync();
      console.log("✅ Modelo baixado com sucesso!");
      return MODEL_PATH;
    } catch (e) {
      console.error("❌ Erro ao baixar modelo:", e);
      throw e;
    }
  }

  const handleDownload = async (link: string, filename: string) => {
    setDownloading(true);
    try {
      await downloadModel(link, filename, (p) => setProgress(p));
    } catch (err) {
      console.error(err);
    }
    setDownloading(false);
  };

  const handleRemove = async (modelName: string) => {
    await removeModel(modelName);
  };

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={models}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: "#333" }} />
        )}
        renderItem={({ item }) => (
          <View style={S.itemRow}>
            {/* Model name */}
            <Text style={S.modelText}>{item.name}</Text>

            {/* Icons */}
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[S.iconButton, { backgroundColor: "#315cd3ff" }]}
                onPress={() => handleDownload(item.link, item.filename)}
              >
                <Ionicons name="download-outline" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  S.iconButton,
                  { backgroundColor: "red", marginLeft: 10 },
                ]}
                onPress={() => handleRemove(item.filename)}
              >
                <Ionicons name="trash-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {downloading && (
        <View style={{ marginBottom: 20 }}>
          <Text>{(progress * 100).toFixed(1)}%</Text>
          <ProgressBar
            progress={progress}
            color="#4CAF50"
            style={{ height: 20, borderRadius: 5 }}
          />
        </View>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  modelText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  iconButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
