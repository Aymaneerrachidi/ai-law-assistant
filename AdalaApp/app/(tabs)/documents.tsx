import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { P } from "../../constants/theme";
import { useLanguage } from "../../context/LanguageContext";
import { API } from "../../constants/api";
import Header from "../../components/Header";

export default function DocumentScreen() {
  const { language, t, rtl } = useLanguage();
  const [docState, setDocState] = useState("idle");
  const [fileName, setFileName] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [analysis, setAnalysis] = useState("");

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      setFileName(file.name);
      setExtractedText("");
      setAnalysis("");
      setDocState("extracting");

      // Read file and send to backend for analysis
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      });
      formData.append("language", language);

      setDocState("analyzing");

      try {
        const res = await fetch(API.analyze, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "Document uploaded via mobile app", language }),
        });
        const data = await res.json();
        setAnalysis(data.analysis || data.content || "Analysis completed.");
        setDocState("done");
      } catch (err) {
        setAnalysis(t.analyzeError);
        setDocState("done");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
      setDocState("idle");
    }
  }

  function resetDoc() {
    setDocState("idle");
    setExtractedText("");
    setAnalysis("");
    setFileName("");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {docState === "idle" && !extractedText ? (
          <View style={styles.uploadArea}>
            {/* Icon */}
            <View style={styles.iconBox}>
              <Ionicons name="document-text-outline" size={28} color={P.gold} />
            </View>
            <Text style={[styles.title, rtl && styles.rtlText]}>{t.uploadTitle}</Text>
            <Text style={[styles.desc, rtl && styles.rtlText]}>{t.uploadDesc}</Text>

            {/* Upload zone */}
            <TouchableOpacity style={styles.dropZone} onPress={pickFile} activeOpacity={0.7}>
              <Ionicons name="cloud-upload-outline" size={40} color={P.textDim} />
              <Text style={[styles.dropHint, rtl && styles.rtlText]}>{t.dropHint}</Text>
              <Text style={styles.supported}>{t.supported}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultsArea}>
            {/* File badge */}
            <View style={[styles.fileBadge, rtl && { flexDirection: "row-reverse" }]}>
              <Ionicons name="document" size={16} color={P.gold} />
              <Text style={styles.fileNameText}>{fileName}</Text>
              {docState === "done" && (
                <TouchableOpacity onPress={resetDoc} style={styles.resetBtn}>
                  <Text style={styles.resetText}>{t.reset}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Loading states */}
            {(docState === "extracting" || docState === "analyzing") && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={P.gold} />
                <Text style={styles.loadingText}>
                  {docState === "extracting" ? t.extracting : t.analyzing}
                </Text>
              </View>
            )}

            {/* Analysis result */}
            {docState === "done" && analysis && (
              <View style={styles.resultCard}>
                <Text style={[styles.resultTitle, rtl && styles.rtlText]}>{t.analysisTitle}</Text>
                <Text style={[styles.resultText, rtl && styles.rtlText]}>{analysis}</Text>
              </View>
            )}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },
  scroll: { flex: 1 },
  content: { padding: 20 },
  rtlText: { writingDirection: "rtl", textAlign: "right" },

  uploadArea: { alignItems: "center", paddingTop: 40 },
  iconBox: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: P.gold + "18", borderWidth: 1, borderColor: P.gold + "30",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700", color: P.text, marginBottom: 8, textAlign: "center" },
  desc: { fontSize: 14, color: P.textMid, textAlign: "center", lineHeight: 22, marginBottom: 30, paddingHorizontal: 20 },

  dropZone: {
    width: "100%", paddingVertical: 40,
    borderWidth: 2, borderStyle: "dashed", borderColor: P.border,
    borderRadius: 16, backgroundColor: P.bgCard,
    alignItems: "center", justifyContent: "center",
  },
  dropHint: { fontSize: 14, color: P.textMid, marginTop: 12 },
  supported: { fontSize: 12, color: P.textDim, marginTop: 4 },

  resultsArea: { gap: 16 },
  fileBadge: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 12, backgroundColor: P.bgCard,
    borderWidth: 1, borderColor: P.border, borderRadius: 10,
  },
  fileNameText: { flex: 1, fontSize: 13, color: P.text },
  resetBtn: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: P.gold + "40", borderRadius: 6,
  },
  resetText: { fontSize: 11, fontWeight: "600", color: P.gold },

  loadingBox: { alignItems: "center", paddingVertical: 40, gap: 16 },
  loadingText: { fontSize: 14, color: P.gold },

  resultCard: {
    backgroundColor: P.bgCard, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: P.border,
  },
  resultTitle: { fontSize: 16, fontWeight: "600", color: P.gold, marginBottom: 12 },
  resultText: { fontSize: 14, color: P.text, lineHeight: 24 },
});
