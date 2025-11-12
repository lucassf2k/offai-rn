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

const BASE_PATH = FileSystem.documentDirectory;
const DOWNLOAD_DIR = `${BASE_PATH}models/`;
const MODEL_NAME = "Phi-3-mini-4k-instruct-q4.gguf";
const MODEL_PATH = `${DOWNLOAD_DIR}${MODEL_NAME}`;

const models = [
  { id: "1", name: "Gemma 2B" },
  { id: "2", name: "Phi 3 Mini" },
  { id: "3", name: "LLaMA 3.2 1B" },
];

export function ModelDownloadList() {
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");

  async function downloadModel(
    url: string,
    onProgress?: (progress: number) => void
  ) {
    const folderInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, {
        intermediates: true,
      });
    }

    const fileInfo = await FileSystem.getInfoAsync(MODEL_PATH);
    if (fileInfo.exists) {
      console.log("✅ Modelo já existe:", MODEL_PATH);
      return MODEL_PATH;
    }

    console.log("📥 Baixando modelo...");

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      MODEL_PATH,
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

  const handleDownload = async (name: string) => {
    setDownloading(true);
    try {
      await downloadModel(
        "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf",
        (p) => setProgress(p)
      );
    } catch (err) {
      console.error(err);
    }
    setDownloading(false);
  };

  const handleRemove = (modelName: string) => {
    console.log("Removed:", modelName);
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
                onPress={() => handleDownload(item.name)}
              >
                <Ionicons name="download-outline" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  S.iconButton,
                  { backgroundColor: "red", marginLeft: 10 },
                ]}
                onPress={() => handleRemove(item.name)}
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
