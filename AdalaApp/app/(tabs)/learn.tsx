import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { P } from "../../constants/theme";
import { useLanguage } from "../../context/LanguageContext";
import { learnConcepts } from "../../constants/translations";
import { API } from "../../constants/api";
import Header from "../../components/Header";

export default function LearnScreen() {
  const { language, t, rtl } = useLanguage();
  const [concept, setConcept] = useState("");
  const [custom, setCustom] = useState("");
  const [level, setLevel] = useState("beginner");
  const [style, setStyle] = useState("simple");
  const [bg, setBg] = useState("nonlawyer");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function explain() {
    const conceptText = custom.trim() || concept;
    if (!conceptText || loading) return;
    setResult("");
    setLoading(true);
    try {
      const res = await fetch(API.explain, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: conceptText, language, level, style, background: bg }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(text.slice(0, 200)); }
      if (!res.ok) throw new Error(data.error || "Explanation failed");
      setResult(data.explanation);
    } catch (err) {
      setResult(err.message || "Error generating explanation.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setConcept("");
    setCustom("");
    setResult("");
  }

  const PillGroup = ({ options, selected, onSelect }) => (
    <View style={[styles.pillRow, rtl && { flexDirection: "row-reverse" }]}>
      {Object.entries(options).map(([key, label]) => {
        const on = selected === key;
        return (
          <TouchableOpacity key={key} onPress={() => onSelect(key)}
            style={[styles.pill, on && styles.pillActive]}>
            <Text style={[styles.pillText, on && styles.pillTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon + Title */}
        <View style={styles.headerSection}>
          <View style={styles.iconBox}>
            <Ionicons name="book-outline" size={28} color={P.gold} />
          </View>
          <Text style={[styles.title, rtl && styles.rtlText]}>{t.learnTitle}</Text>
          <Text style={[styles.desc, rtl && styles.rtlText]}>{t.learnDesc}</Text>
        </View>

        {!result ? (
          <>
            {/* Study Profile */}
            <View style={styles.profileCard}>
              <Text style={[styles.cardTitle, rtl && styles.rtlText]}>{t.learnProfile}</Text>

              <Text style={[styles.label, rtl && styles.rtlText]}>{t.learnLevelLabel}</Text>
              <PillGroup options={t.learnLevels} selected={level} onSelect={setLevel} />

              <Text style={[styles.label, rtl && styles.rtlText]}>{t.learnStyleLabel}</Text>
              <PillGroup options={t.learnStyles} selected={style} onSelect={setStyle} />

              <Text style={[styles.label, rtl && styles.rtlText]}>{t.learnBgLabel}</Text>
              <PillGroup options={t.learnBgs} selected={bg} onSelect={setBg} />
            </View>

            {/* Concepts */}
            <Text style={[styles.sectionTitle, rtl && styles.rtlText]}>{t.learnConceptsTitle}</Text>
            <View style={styles.conceptsGrid}>
              {(learnConcepts[language] || learnConcepts.ar).map((c) => {
                const on = concept === c.id;
                return (
                  <TouchableOpacity key={c.id} onPress={() => setConcept(on ? "" : c.id)}
                    style={[styles.conceptCard, on && styles.conceptCardActive]}>
                    <Text style={[styles.conceptLabel, rtl && styles.rtlText, on && { color: P.gold }]}>{c.label}</Text>
                    <Text style={[styles.conceptSub, rtl && styles.rtlText]}>{c.sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom input */}
            <Text style={[styles.label, rtl && styles.rtlText, { marginTop: 16 }]}>{t.learnCustomLabel}</Text>
            <TextInput
              value={custom}
              onChangeText={setCustom}
              placeholder={t.learnCustomPlaceholder}
              placeholderTextColor={P.textDim}
              style={[styles.customInput, rtl && styles.rtlText, rtl && { textAlign: "right" }]}
            />

            {/* Explain button */}
            <TouchableOpacity
              onPress={explain}
              disabled={loading || (!concept && !custom.trim())}
              style={[styles.explainBtn, (loading || (!concept && !custom.trim())) && { opacity: 0.5 }]}
            >
              {loading ? (
                <ActivityIndicator color={P.bg} />
              ) : (
                <Text style={styles.explainBtnText}>{t.learnBtnLabel}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Result */}
            <View style={styles.resultCard}>
              <Text style={[styles.resultText, rtl && styles.rtlText]}>{result}</Text>
            </View>
            <TouchableOpacity onPress={reset} style={styles.resetBtn}>
              <Text style={styles.resetText}>{t.learnReset}</Text>
            </TouchableOpacity>
          </>
        )}

        {loading && !result && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={P.gold} />
            <Text style={{ color: P.gold, fontSize: 14, marginTop: 12 }}>{t.learnExplaining}</Text>
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

  headerSection: { alignItems: "center", marginBottom: 24, marginTop: 16 },
  iconBox: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: P.gold + "18", borderWidth: 1, borderColor: P.gold + "30",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "700", color: P.text, marginBottom: 8, textAlign: "center" },
  desc: { fontSize: 14, color: P.textMid, textAlign: "center", lineHeight: 22, paddingHorizontal: 10 },

  profileCard: {
    backgroundColor: P.bgCard, borderRadius: 14, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: P.border,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: P.text, marginBottom: 14 },
  label: { fontSize: 12, color: P.textDim, marginBottom: 8, marginTop: 12 },

  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: P.border, backgroundColor: "transparent",
  },
  pillActive: { backgroundColor: P.gold, borderColor: P.gold },
  pillText: { fontSize: 12, fontWeight: "600", color: P.textDim },
  pillTextActive: { color: P.bg },

  sectionTitle: { fontSize: 13, fontWeight: "600", color: P.textDim, marginBottom: 12 },
  conceptsGrid: { gap: 10 },
  conceptCard: {
    backgroundColor: P.bgCard, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: P.border,
  },
  conceptCardActive: { borderColor: P.gold + "60", backgroundColor: P.gold + "10" },
  conceptLabel: { fontSize: 15, fontWeight: "600", color: P.text, marginBottom: 4 },
  conceptSub: { fontSize: 11, color: P.textDim },

  customInput: {
    backgroundColor: P.bgInput, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: P.border, color: P.text, fontSize: 14,
  },
  explainBtn: {
    backgroundColor: P.gold, borderRadius: 12, padding: 16,
    alignItems: "center", marginTop: 20,
  },
  explainBtnText: { fontSize: 15, fontWeight: "600", color: P.bg },

  resultCard: {
    backgroundColor: P.bgCard, borderRadius: 14, padding: 16, marginTop: 8,
    borderWidth: 1, borderColor: P.border,
  },
  resultText: { fontSize: 14, color: P.text, lineHeight: 24 },
  resetBtn: {
    borderWidth: 1, borderColor: P.gold + "40", borderRadius: 12,
    padding: 14, alignItems: "center", marginTop: 16,
  },
  resetText: { fontSize: 14, fontWeight: "600", color: P.gold },

  loadingBox: { alignItems: "center", paddingVertical: 40 },
});
