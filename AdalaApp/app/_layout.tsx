import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LanguageProvider } from "../context/LanguageContext";
import { P } from "../constants/theme";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <StatusBar style="light" backgroundColor={P.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: P.bg } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </LanguageProvider>
  );
}
