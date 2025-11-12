import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system";
import { ProgressBar } from "react-native-paper";

const BASE_PATH = FileSystem.documentDirectory;
const DOWNLOAD_DIR = `${BASE_PATH}models/`;
const MODEL_NAME = "Phi-3-mini-4k-instruct-q4.gguf";
const MODEL_PATH = `${DOWNLOAD_DIR}${MODEL_NAME}`;

export default function ModelDownloader() {
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

  const handleDownload = async () => {
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

  return (
    <View style={{ padding: 20 }}>
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

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity style={S.button} onPress={handleDownload}>
          <Text style={S.buttonText}>Baixar modelo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[S.button, { backgroundColor: "red" }]}
          onPress={handleDownload}
        >
          <Text style={S.buttonText}>Remover modelo</Text>
        </TouchableOpacity>
      </View>

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
