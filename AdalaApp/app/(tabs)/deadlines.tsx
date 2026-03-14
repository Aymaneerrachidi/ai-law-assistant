import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { P } from "../../constants/theme";
import { useLanguage } from "../../context/LanguageContext";
import Header from "../../components/Header";

// Same deadline data from web app
const DEADLINE_CASES = {
  criminal_appeal: { steps: [{ days: 10, key: "fileAppeal" }, { days: 90, key: "hearing" }, { days: 30, key: "decision" }], statute: "CPP Art. 415" },
  cassation: { steps: [{ days: 10, key: "fileCassation" }, { days: 180, key: "review" }, { days: 30, key: "judgment" }], statute: "CPP Art. 427" },
  divorce: { steps: [{ days: 30, key: "summons" }, { days: 14, key: "reconciliation" }, { days: 10, key: "register" }], statute: "Moudawana Art. 82" },
  custody: { steps: [{ days: 30, key: "hearing" }, { days: 30, key: "deliberation" }, { days: 10, key: "register" }], statute: "Moudawana Art. 166" },
  inheritance: { steps: [{ days: 15, key: "registerDeath" }, { days: 90, key: "fileClaim" }, { days: 180, key: "distribution" }], statute: "Moudawana Art. 276" },
  civil_case: { steps: [{ days: 30, key: "summons" }, { days: 60, key: "hearing" }, { days: 180, key: "judgment" }], statute: "CPC" },
  rental_dispute: { steps: [{ days: 30, key: "notice" }, { days: 30, key: "hearing" }, { days: 15, key: "execute" }], statute: "Loi 67-12" },
};

export default function DeadlinesScreen() {
  const { language, t, rtl } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [caseType, setCaseType] = useState("");
  const [result, setResult] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  function calculate() {
    const c = DEADLINE_CASES[caseType];
    if (!c) return;
    const today = new Date();
    let cur = new Date(date);
    const locale = (language === "ar" || language === "dar") ? "ar-MA" : language === "fr" ? "fr-FR" : "en-GB";
    const steps = c.steps.map((s, i) => {
      cur = new Date(cur);
      cur.setDate(cur.getDate() + s.days);
      const diff = Math.ceil((cur - today) / 86400000);
      return {
        step: i + 1,
        dayKey: s.key,
        days: s.days,
        date: cur.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }),
        daysLeft: diff,
        passed: diff < 0,
        urgent: diff >= 0 && diff <= 7,
      };
    });
    setResult({ caseName: caseType, statute: c.statute, steps, next: steps.find(s => !s.passed) || null });
  }

  function reset() {
    setCaseType("");
    setResult(null);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={28} color={P.gold} />
          </View>
          <Text style={[styles.title, rtl && styles.rtlText]}>{t.deadlineTitle}</Text>
          <Text style={[styles.desc, rtl && styles.rtlText]}>{t.deadlineDesc}</Text>
        </View>

        {!result ? (
          <>
            {/* Date input */}
            <Text style={[styles.label, rtl && styles.rtlText]}>{t.deadlineDateLabel}</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => {
              // For simplicity, use native date input
            }}>
              <Ionicons name="calendar" size={20} color={P.textDim} />
              <Text style={styles.dateText}>{date}</Text>
            </TouchableOpacity>

            {/* Case type */}
            <Text style={[styles.label, rtl && styles.rtlText]}>{t.deadlineCaseLabel}</Text>
            <View style={styles.caseGrid}>
              {Object.entries(t.deadlineCases).map(([key, label]) => {
                const on = caseType === key;
                return (
                  <TouchableOpacity key={key} onPress={() => setCaseType(on ? "" : key)}
                    style={[styles.caseBtn, on && styles.caseBtnActive]}>
                    <Text style={[styles.caseText, rtl && styles.rtlText, on && { color: P.gold }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Calculate button */}
            <TouchableOpacity onPress={calculate} disabled={!caseType}
              style={[styles.calcBtn, !caseType && { opacity: 0.5 }]}>
              <Text style={styles.calcBtnText}>{t.deadlineBtn}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Statute reference */}
            <View style={styles.statuteCard}>
              <Text style={[styles.statuteLabel, rtl && styles.rtlText]}>{t.deadlineStatute}</Text>
              <Text style={[styles.statuteValue, rtl && styles.rtlText]}>{result.statute}</Text>
            </View>

            {/* Next deadline highlight */}
            {result.next && (
              <View style={styles.nextCard}>
                <Ionicons name="alert-circle" size={20} color={P.gold} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nextLabel, rtl && styles.rtlText]}>{t.deadlineNext}</Text>
                  <Text style={[styles.nextDate, rtl && styles.rtlText]}>{result.next.date}</Text>
                  <Text style={[styles.nextDays, rtl && styles.rtlText]}>
                    {result.next.daysLeft} {t.deadlineDaysLeft}
                    {result.next.urgent ? ` ⚠️ ${t.deadlineUrgent}` : ""}
                  </Text>
                </View>
              </View>
            )}

            {/* Timeline */}
            {result.steps.map((step, i) => (
              <View key={i} style={[styles.timelineItem, step.passed && styles.timelinePassed, step.urgent && styles.timelineUrgent]}>
                <View style={[styles.timelineDot, step.passed ? styles.dotPassed : step.urgent ? styles.dotUrgent : styles.dotNormal]} />
                <View style={{ flex: 1 }}>
                  <View style={[styles.timelineRow, rtl && { flexDirection: "row-reverse" }]}>
                    <Text style={[styles.timelineStep, rtl && styles.rtlText]}>
                      {t.deadlineSteps[step.dayKey] || step.dayKey}
                    </Text>
                    {step.passed && (
                      <View style={styles.passedBadge}>
                        <Text style={styles.passedText}>{t.deadlinePassed}</Text>
                      </View>
                    )}
                    {step.urgent && !step.passed && (
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>{t.deadlineUrgent}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.timelineDate, rtl && styles.rtlText]}>{step.date}</Text>
                  <Text style={[styles.timelineDays, rtl && styles.rtlText]}>
                    +{step.days} {(language === "ar" || language === "dar") ? "يوم" : language === "fr" ? "jours" : "days"}
                    {" · "}{step.daysLeft >= 0 ? `${step.daysLeft} ${t.deadlineDaysLeft}` : t.deadlinePassed}
                  </Text>
                </View>
              </View>
            ))}

            <TouchableOpacity onPress={reset} style={styles.resetBtn}>
              <Text style={styles.resetText}>{t.deadlineReset}</Text>
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

  dateInput: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: P.bgInput, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: P.border,
  },
  dateText: { fontSize: 15, color: P.text },

  caseGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  caseBtn: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderColor: P.border,
    backgroundColor: P.bgCard,
  },
  caseBtnActive: { borderColor: P.gold + "60", backgroundColor: P.gold + "10" },
  caseText: { fontSize: 13, color: P.textMid },

  calcBtn: {
    backgroundColor: P.gold, borderRadius: 12, padding: 16,
    alignItems: "center", marginTop: 24,
  },
  calcBtnText: { fontSize: 15, fontWeight: "600", color: P.bg },

  statuteCard: {
    backgroundColor: P.bgCard, borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: P.border,
  },
  statuteLabel: { fontSize: 11, color: P.textDim, marginBottom: 4 },
  statuteValue: { fontSize: 14, fontWeight: "600", color: P.gold },

  nextCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: P.gold + "12", borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: P.gold + "30",
  },
  nextLabel: { fontSize: 11, color: P.textDim },
  nextDate: { fontSize: 16, fontWeight: "600", color: P.text, marginVertical: 2 },
  nextDays: { fontSize: 12, color: P.gold, fontWeight: "600" },

  timelineItem: {
    flexDirection: "row", gap: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: P.border,
  },
  timelinePassed: { opacity: 0.5 },
  timelineUrgent: {},
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  dotNormal: { backgroundColor: P.gold + "60" },
  dotUrgent: { backgroundColor: "#e0a020" },
  dotPassed: { backgroundColor: P.textDim + "60" },

  timelineRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  timelineStep: { fontSize: 14, fontWeight: "600", color: P.text, flex: 1 },
  timelineDate: { fontSize: 13, color: P.textMid, marginTop: 2 },
  timelineDays: { fontSize: 11, color: P.textDim, marginTop: 2 },

  passedBadge: {
    backgroundColor: P.textDim + "30", borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  passedText: { fontSize: 10, fontWeight: "600", color: P.textDim },
  urgentBadge: {
    backgroundColor: "#e0a020" + "30", borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  urgentText: { fontSize: 10, fontWeight: "600", color: "#e0a020" },

  resetBtn: {
    borderWidth: 1, borderColor: P.gold + "40", borderRadius: 12,
    padding: 14, alignItems: "center", marginTop: 16,
  },
  resetText: { fontSize: 14, fontWeight: "600", color: P.gold },
});
