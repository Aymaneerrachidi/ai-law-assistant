import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { P } from "../../constants/theme";
import { useLanguage } from "../../context/LanguageContext";
import Header from "../../components/Header";

// Same sentence data from web app
const SENTENCE_BASE = {
  sports_violence: { articles: "306-1 à 306-4", minM: 6, maxM: 24, minF: 5000, maxF: 20000 },
  theft: { articles: "467-468", minM: 1, maxM: 24, minF: 100, maxF: 2000 },
  aggravated_theft: { articles: "468-469", minM: 24, maxM: 120, minF: 200, maxF: 5000 },
  assault: { articles: "393-395", minM: 1, maxM: 36, minF: 200, maxF: 10000 },
  assault_weapon: { articles: "398", minM: 36, maxM: 72, minF: 1000, maxF: 20000 },
  rape: { articles: "475-476", minM: 60, maxM: 360, minF: 5000, maxF: 50000 },
  fraud: { articles: "450, 234-235", minM: 6, maxM: 36, minF: 250, maxF: 5000 },
  drug_possession: { articles: "209", minM: 1, maxM: 12, minF: 500, maxF: 5000 },
  drug_trafficking: { articles: "210-212", minM: 24, maxM: 240, minF: 5000, maxF: 1000000 },
  trafficking: { articles: "448-10 à 448-14", minM: 12, maxM: 60, minF: 5000, maxF: 50000 },
  terrorism: { articles: "218-1 à 218-5", minM: 120, maxM: 360, minF: 50000, maxF: 500000 },
  bribery: { articles: "248-250", minM: 60, maxM: 120, minF: 10000, maxF: 100000 },
};
const AGG_MULT = { weapon_use: 2.0, gang: 1.5, multiple_victims: 1.75, repeat_offender: 1.5, premeditated: 2.0, leader_role: 1.75, vulnerable_victim: 2.0 };
const MIT_MULT = { first_offense: 0.5, young_age: 0.65, cooperation: 0.7, remorse: 0.75, restitution: 0.8 };

export default function SentenceScreen() {
  const { language, t, rtl } = useLanguage();
  const [crime, setCrime] = useState("");
  const [aggFactors, setAggFactors] = useState([]);
  const [mitFactors, setMitFactors] = useState([]);
  const [result, setResult] = useState(null);

  function toggle(arr, setArr, key) {
    setArr((prev) => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function estimate() {
    const b = SENTENCE_BASE[crime];
    if (!b) return;
    let sm = 1, fm = 1;
    aggFactors.forEach(k => { if (AGG_MULT[k]) { sm *= AGG_MULT[k]; fm *= AGG_MULT[k]; } });
    mitFactors.forEach(k => { if (MIT_MULT[k]) { sm *= MIT_MULT[k]; fm *= MIT_MULT[k]; } });
    sm = Math.max(0.3, Math.min(3, sm));
    fm = Math.max(0.3, Math.min(3, fm));
    const yr = (language === "ar" || language === "dar") ? "سنوات" : language === "fr" ? "ans" : "years";
    const mo = (language === "ar" || language === "dar") ? "أشهر" : language === "fr" ? "mois" : "months";
    const fmt = (n) => n >= 12 ? `${Math.round(n / 12)} ${yr}` : `${Math.round(n)} ${mo}`;
    setResult({
      articles: b.articles,
      base: { prison: `${fmt(b.minM)} – ${fmt(b.maxM)}`, fine: `${b.minF.toLocaleString()}–${b.maxF.toLocaleString()} DH` },
      adjusted: { prison: `${fmt(b.minM * sm)} – ${fmt(b.maxM * sm)}`, fine: `${Math.round(b.minF * fm).toLocaleString()}–${Math.round(b.maxF * fm).toLocaleString()} DH` },
      multiplier: sm.toFixed(2),
    });
  }

  function reset() {
    setCrime("");
    setAggFactors([]);
    setMitFactors([]);
    setResult(null);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.iconBox}>
            <Ionicons name="scale-outline" size={28} color={P.gold} />
          </View>
          <Text style={[styles.title, rtl && styles.rtlText]}>{t.sentenceTitle}</Text>
          <Text style={[styles.desc, rtl && styles.rtlText]}>{t.sentenceDesc}</Text>
        </View>

        {!result ? (
          <>
            {/* Crime type */}
            <Text style={[styles.label, rtl && styles.rtlText]}>{t.sentenceCrimeLabel}</Text>
            <View style={styles.optionsGrid}>
              {Object.entries(t.sentenceCrimes).map(([key, label]) => {
                const on = crime === key;
                return (
                  <TouchableOpacity key={key} onPress={() => setCrime(on ? "" : key)}
                    style={[styles.optionBtn, on && styles.optionBtnActive]}>
                    <Text style={[styles.optionText, rtl && styles.rtlText, on && { color: P.gold }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Aggravating */}
            <Text style={[styles.label, rtl && styles.rtlText]}>{t.sentenceAggLabel}</Text>
            <View style={styles.optionsGrid}>
              {Object.entries(t.sentenceAggFactors).map(([key, label]) => {
                const on = aggFactors.includes(key);
                return (
                  <TouchableOpacity key={key} onPress={() => toggle(aggFactors, setAggFactors, key)}
                    style={[styles.checkBtn, on && styles.checkBtnActive]}>
                    <Ionicons name={on ? "checkbox" : "square-outline"} size={18} color={on ? P.gold : P.textDim} />
                    <Text style={[styles.checkText, rtl && styles.rtlText, on && { color: P.text }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Mitigating */}
            <Text style={[styles.label, rtl && styles.rtlText]}>{t.sentenceMitLabel}</Text>
            <View style={styles.optionsGrid}>
              {Object.entries(t.sentenceMitFactors).map(([key, label]) => {
                const on = mitFactors.includes(key);
                return (
                  <TouchableOpacity key={key} onPress={() => toggle(mitFactors, setMitFactors, key)}
                    style={[styles.checkBtn, on && styles.checkBtnActive]}>
                    <Ionicons name={on ? "checkbox" : "square-outline"} size={18} color={on ? P.gold : P.textDim} />
                    <Text style={[styles.checkText, rtl && styles.rtlText, on && { color: P.text }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Estimate button */}
            <TouchableOpacity onPress={estimate} disabled={!crime}
              style={[styles.estimateBtn, !crime && { opacity: 0.5 }]}>
              <Text style={styles.estimateBtnText}>{t.sentenceBtn}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Results */}
            <View style={styles.resultCard}>
              <Text style={[styles.resultLabel, rtl && styles.rtlText]}>{t.sentenceArticles}</Text>
              <Text style={[styles.resultValue, rtl && styles.rtlText]}>{result.articles}</Text>
            </View>

            <View style={styles.resultRow}>
              <View style={[styles.resultCard, { flex: 1 }]}>
                <Text style={[styles.resultLabel, rtl && styles.rtlText]}>{t.sentenceBaseRange}</Text>
                <Text style={[styles.resultSmallLabel, rtl && styles.rtlText]}>{t.sentencePrison}</Text>
                <Text style={[styles.resultValue, rtl && styles.rtlText]}>{result.base.prison}</Text>
                <Text style={[styles.resultSmallLabel, rtl && styles.rtlText]}>{t.sentenceFine}</Text>
                <Text style={[styles.resultValue, rtl && styles.rtlText]}>{result.base.fine}</Text>
              </View>
              <View style={[styles.resultCard, { flex: 1, borderColor: P.gold + "40" }]}>
                <Text style={[styles.resultLabel, rtl && styles.rtlText, { color: P.gold }]}>{t.sentenceAdjRange}</Text>
                <Text style={[styles.resultSmallLabel, rtl && styles.rtlText]}>{t.sentencePrison}</Text>
                <Text style={[styles.resultValue, rtl && styles.rtlText, { color: P.gold }]}>{result.adjusted.prison}</Text>
                <Text style={[styles.resultSmallLabel, rtl && styles.rtlText]}>{t.sentenceFine}</Text>
                <Text style={[styles.resultValue, rtl && styles.rtlText, { color: P.gold }]}>{result.adjusted.fine}</Text>
              </View>
            </View>

            <View style={styles.resultCard}>
              <Text style={[styles.resultLabel, rtl && styles.rtlText]}>{t.sentenceMultiplier}</Text>
              <Text style={[styles.resultValue, rtl && styles.rtlText, { fontSize: 24, color: P.gold }]}>{result.multiplier}×</Text>
            </View>

            <TouchableOpacity onPress={reset} style={styles.resetBtn}>
              <Text style={styles.resetText}>{t.sentenceReset}</Text>
            </TouchableOpacity>
          </>
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
  label: { fontSize: 13, fontWeight: "600", color: P.textDim, marginBottom: 10, marginTop: 16 },

  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionBtn: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderColor: P.border,
    backgroundColor: P.bgCard,
  },
  optionBtnActive: { borderColor: P.gold + "60", backgroundColor: P.gold + "10" },
  optionText: { fontSize: 13, color: P.textMid },

  checkBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: P.border,
    backgroundColor: P.bgCard, minWidth: "45%",
  },
  checkBtnActive: { borderColor: P.gold + "40", backgroundColor: P.gold + "08" },
  checkText: { fontSize: 12, color: P.textDim, flex: 1 },

  estimateBtn: {
    backgroundColor: P.gold, borderRadius: 12, padding: 16,
    alignItems: "center", marginTop: 24,
  },
  estimateBtnText: { fontSize: 15, fontWeight: "600", color: P.bg },

  resultRow: { flexDirection: "row", gap: 10 },
  resultCard: {
    backgroundColor: P.bgCard, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: P.border,
  },
  resultLabel: { fontSize: 12, fontWeight: "600", color: P.textDim, marginBottom: 6 },
  resultSmallLabel: { fontSize: 10, color: P.textDim, marginTop: 6, marginBottom: 2 },
  resultValue: { fontSize: 16, fontWeight: "600", color: P.text },

  resetBtn: {
    borderWidth: 1, borderColor: P.gold + "40", borderRadius: 12,
    padding: 14, alignItems: "center", marginTop: 10,
  },
  resetText: { fontSize: 14, fontWeight: "600", color: P.gold },
});
