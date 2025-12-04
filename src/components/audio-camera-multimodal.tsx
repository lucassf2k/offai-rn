import React, { useEffect, useState } from "react";
import {
  Button,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { initLlama, LlamaContext } from "llama.rn";

// Configuração para gravar em WAV (Melhor compatibilidade com modelos de IA)
const RECORDING_OPTIONS: any = {
  android: {
    extension: ".wav",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4, // Android as vezes requer codificação específica ou polyfill para WAV puro
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000, // 16kHz é padrão para muitos modelos
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: ".wav",
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/wav",
    bitsPerSecond: 128000,
  },
};

export default function AudioMultimodal() {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // Estados do Llama
  const [context, setContext] = useState<LlamaContext | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isInferencing, setIsInferencing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [statusText, setStatusText] = useState("Inicializando modelo...");

  // 1. Inicialização do Modelo Multimodal
  useEffect(() => {
    const initializeLlama = async () => {
      try {
        // Inicializa o contexto principal
        const ctx = await initLlama({
          model: "file://path/to/your/multimodal-model.gguf", // Substitua pelo caminho real
          n_ctx: 4096,
          n_gpu_layers: 99,
          ctx_shift: false, // Importante: Desabilitar para multimodal
        });

        // Inicializa o suporte multimodal (projetor)
        const success = await ctx.initMultimodal({
          path: "file://path/to/your/mmproj-model.gguf", // Substitua pelo caminho real
          use_gpu: true,
        });

        if (success) {
          console.log("Multimodal support initialized!");
          setContext(ctx);
          setStatusText("Modelo pronto. Pressione gravar.");
        } else {
          setStatusText("Falha ao carregar projetor multimodal.");
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
        setStatusText("Erro ao carregar modelos.");
      } finally {
        setIsModelLoading(false);
      }
    };

    initializeLlama();

    // Cleanup ao desmontar
    return () => {
      if (context) context.release();
    };
  }, []);

  // 2. Funções de Gravação
  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Usando as opções customizadas para WAV
      const { recording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS
      );
      setRecording(recording);
      setTranscription(""); // Limpa transcrição anterior
      setStatusText("Gravando...");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setStatusText("Processando áudio...");
    setIsInferencing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(undefined);

      if (uri) {
        console.log("Recording stored at", uri);
        await processAudioWithLlama(uri);
      }
    } catch (error) {
      console.error(error);
      setStatusText("Erro ao parar gravação.");
      setIsInferencing(false);
    }
  }

  // 3. Processamento com Llama (Inferencia)
  async function processAudioWithLlama(fileUri: string) {
    if (!context) {
      setStatusText("Erro: Contexto Llama não existe.");
      return;
    }

    try {
      // Lê o arquivo gravado e converte para Base64
      const base64Audio = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const result = await context.completion({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transcribe this audio:", // Prompt para o modelo
              },
              {
                type: "input_audio",
                input_audio: {
                  data: base64Audio, // Envia o base64 puro
                  format: "wav", // Informa o formato configurado no RECORDING_OPTIONS
                },
              },
            ],
          },
        ],
        n_predict: 200,
      });

      console.log("Resultado:", result.text);
      setTranscription(result.text);
      setStatusText("Concluído.");
    } catch (e) {
      console.error("Erro na inferência:", e);
      setStatusText("Erro durante o processamento do áudio.");
    } finally {
      setIsInferencing(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{statusText}</Text>

      {isModelLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.controls}>
          <Button
            title={recording ? "Parar Gravação" : "Iniciar Gravação"}
            onPress={recording ? stopRecording : startRecording}
            disabled={isInferencing || !context} // Desabilita se estiver processando
            color={recording ? "red" : "#2196F3"}
          />
        </View>
      )}

      {isInferencing && (
        <ActivityIndicator
          style={{ marginTop: 20 }}
          size="small"
          color="#999"
        />
      )}

      <ScrollView style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Resposta do Modelo:</Text>
        <Text style={styles.resultText}>
          {transcription || "Nenhuma transcrição ainda."}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  status: {
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  controls: {
    marginBottom: 30,
    width: "100%",
    maxWidth: 200,
  },
  resultContainer: {
    marginTop: 20,
    width: "100%",
    maxHeight: 300,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  resultLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontWeight: "bold",
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});
