import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import * as FileSystem from "expo-file-system";
import { ProgressBar } from "react-native-paper";

const BASE_PATH = FileSystem.documentDirectory;
const DOWNLOAD_DIR = `${BASE_PATH}models/`;
const MODEL_NAME = "Phi-3-mini-4k-instruct-q4.gguf";
const MODEL_PATH = `${DOWNLOAD_DIR}${MODEL_NAME}`;

async function downloadModel(
  url: string,
  onProgress?: (progress: number) => void
) {
  const folderInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!folderInfo.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
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

export default function ModelDownloader() {
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

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
      <Text style={{ marginBottom: 10, fontSize: 16, fontWeight: "bold" }}>
        Baixar Modelo
      </Text>

      <Button title="📥 Iniciar Download" onPress={handleDownload} />

      {downloading && (
        <View style={{ marginTop: 20 }}>
          <Text>{(progress * 100).toFixed(1)}%</Text>
          <ProgressBar
            progress={progress}
            color="#4CAF50"
            style={{ height: 10, borderRadius: 5 }}
          />
        </View>
      )}
    </View>
  );
}
