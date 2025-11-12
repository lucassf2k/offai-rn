import { SafeAreaView } from "react-native-safe-area-context";
import ModelDownloader from "@/components/download-model";

export default function Download() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "#222",
        padding: 20,
      }}
    >
      <ModelDownloader />
    </SafeAreaView>
  );
}
