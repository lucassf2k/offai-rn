import * as FileSystem from "expo-file-system";
import {
  loadLlamaModelInfo,
  initLlama,
  LlamaContext,
  TokenData,
} from "llama.rn";
import { LLM_PATHS } from "@/lib/llama-rn/constants";

export async function downloadModel(url: string) {
  const folder = LLM_PATHS.DOWNLOAD_DIR;
  const folderInfo = await FileSystem.getInfoAsync(folder);
  if (!folderInfo.exists) {
    await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  }
  const fileInfo = await FileSystem.getInfoAsync(LLM_PATHS.MODEL_PATH);
  if (!fileInfo.exists) {
    console.log("Baixando...");
    await FileSystem.downloadAsync(url, LLM_PATHS.MODEL_PATH);
    console.log("✅ Modelo baixado com sucesso!");
  }
}

export async function loadModel() {
  const info = await loadLlamaModelInfo(LLM_PATHS.MODEL_PATH);
  console.log(JSON.stringify(info, null, 2));
}

export async function initModel(filename: string): Promise<LlamaContext> {
  console.log("Inicializando contexto...");
  const ctx = await initLlama({
    model: `${LLM_PATHS.DOWNLOAD_DIR}/${filename}`, // aqui vai direto o path do expo-file-system
    n_ctx: 2048,
    use_mlock: true,
    n_gpu_layers: 99, // só iOS
  });
  return ctx;
}

export async function generateResponse(
  ctx: LlamaContext,
  input: string,
  callback?: (data: TokenData) => void,
  nPredict: number = 100
) {
  const stopWords = ["</s>", "<|end|>", "<|eot_id|>", "<|end_of_text|>"];
  const res = await ctx.completion(
    {
      messages: [
        { role: "system", content: "Você é um assistente simpático." },
        { role: "user", content: input },
      ],
      n_predict: nPredict,
      temperature: 0.8,
      stop: stopWords,
    },
    callback
  );
  return res.text;
}

export async function removeModel(filename: string) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(
      `${LLM_PATHS.DOWNLOAD_DIR}/${filename}`
    );
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(`${LLM_PATHS.DOWNLOAD_DIR}/${filename}`, {
        idempotent: true,
      });
      console.log("🗑️ Modelo removido:", LLM_PATHS.MODEL_PATH);
    } else {
      console.log("⚠️ Modelo não encontrado:", LLM_PATHS.MODEL_PATH);
    }
  } catch (err) {
    console.error("❌ Erro ao remover modelo:", err);
  }
}

export async function getModelPublicPath() {
  const PUBLIC_PATH = `file:///storage/emulated/0/offai/models/Phi-3-mini-4k-instruct-q4.gguf`;
  try {
    const dirInfo = await FileSystem.getInfoAsync(LLM_PATHS.DOWNLOAD_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LLM_PATHS.DOWNLOAD_DIR, {
        intermediates: true,
      });
    }
    const fileInfo = await FileSystem.getInfoAsync(LLM_PATHS.MODEL_PATH);
    if (!fileInfo.exists) {
      console.log("📥 Copiando modelo para pasta privada...");
      const file = await FileSystem.StorageAccessFramework.readAsStringAsync(
        PUBLIC_PATH
      );
      await FileSystem.copyAsync({
        from: file,
        to: LLM_PATHS.MODEL_PATH,
      });
    } else {
      console.log("✅ Modelo já existe na pasta privada");
    }
  } catch (err) {
    console.log(err);
  }
}
