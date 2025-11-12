import { SafeAreaView } from "react-native-safe-area-context";
// import ModelDownloader from "@/components/download-model";
import { ModelDownloadList } from "@/components/model-download-list";

export default function Download() {
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
