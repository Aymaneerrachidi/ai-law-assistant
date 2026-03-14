import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { P, SHADOWS } from "../constants/theme";
import { useLanguage } from "../context/LanguageContext";

const LANGS = [
  { c: "dar", l: "دارجة" },
  { c: "ar", l: "ع" },
  { c: "fr", l: "FR" },
  { c: "en", l: "EN" },
];

export default function Header({ onLanguageChange }) {
  const { language, setLanguage, rtl, t } = useLanguage();

  const handleLang = (code) => {
    setLanguage(code);
    onLanguageChange?.(code);
  };

  return (
    <View style={styles.container}>
      {/* Disclaimer banner */}
      <View style={styles.banner}>
        <Text style={[styles.bannerText, rtl && styles.rtlText]}>{t.govDisclaimer}</Text>
      </View>
      {/* Header row */}
      <View style={[styles.header, rtl && { flexDirection: "row-reverse" }]}>
        <View style={[styles.brandRow, rtl && { flexDirection: "row-reverse" }]}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>⚖️</Text>
          </View>
          <Text style={styles.brandName}>
            Adala App <Text style={styles.brandArabic}>- عدالة</Text>
          </Text>
        </View>
        <View style={[styles.langRow, rtl && { flexDirection: "row-reverse" }]}>
          {LANGS.map(({ c, l }) => {
            const on = language === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => handleLang(c)}
                style={[styles.langBtn, on && styles.langBtnActive]}
              >
                <Text style={[styles.langLabel, on && styles.langLabelActive]}>{l}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.goldLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: P.bg,
    ...SHADOWS.header,
  },
  banner: {
    backgroundColor: P.bannerBg,
    borderBottomWidth: 1,
    borderBottomColor: P.gold + "40",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  bannerText: { fontSize: 10, color: P.gold, textAlign: "center", lineHeight: 16 },
  rtlText: { writingDirection: "rtl" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: P.gold + "20",
  },
  goldLine: {
    height: 1,
    backgroundColor: P.gold + "18",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoContainer: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: P.gold + "20",
    borderWidth: 1,
    borderColor: P.gold + "45",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.goldGlow,
  },
  logoText: { fontSize: 18 },
  brandName: { fontSize: 15, fontWeight: "700", color: P.gold, letterSpacing: -0.3 },
  brandArabic: { fontWeight: "500", fontSize: 14 },
  langRow: { flexDirection: "row", gap: 4 },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: P.borderLight,
  },
  langBtnActive: {
    backgroundColor: P.gold,
    borderColor: P.gold,
    ...SHADOWS.goldGlow,
  },
  langLabel: { fontSize: 11, fontWeight: "600", color: P.textDim },
  langLabelActive: { color: P.bg },
});
