import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import { useEffect } from "react";
// import ModelDownloader from "@/components/download-model";
import { ModelDownloadList } from "@/components/model-download-list";
import { LLM_PATHS } from "@/lib/llama-rn/constants";
import ModelDownloader from "@/components/download-model";
import { removeModel } from "@/lib/llama-rn";

export default function Download() {
  const listFiles = async () => {
    try {
      // Caminho base do app
      const dir = LLM_PATHS.DOWNLOAD_DIR;

      // Lê todos os arquivos/pastas dentro desse diretório
      const files = await FileSystem.readDirectoryAsync(dir!);

      console.log("📂 Conteúdo de documentDirectory:");
      console.log(files);

      // Se quiser mostrar o caminho completo de cada item:
      files.forEach((f) => {
        console.log(`${dir}${f}`);
      });
    } catch (error) {
      console.error("Erro ao listar arquivos:", error);
    }
  };

  useEffect(() => {
    listFiles();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#222",
        padding: 20,
      }}
    >
      {/* <ModelDownloader /> */}
      <ModelDownloadList />
    </SafeAreaView>
  );
}
