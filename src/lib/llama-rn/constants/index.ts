import * as FileSystem from "expo-file-system";

const BASE_PATH = FileSystem.documentDirectory;
// const MODEL_PATH = `${BASE_PATH}models/Phi-3-mini-4k-instruct-q4.gguf`;
const MODEL_PATH = `${BASE_PATH}models/gemma-3-1b-it-Q4_0.gguf`;
const DOWNLOAD_DIR = `${BASE_PATH}models/`;

export const LLM_PATHS = Object.freeze({
  BASE_PATH,
  MODEL_PATH,
  DOWNLOAD_DIR,
});
