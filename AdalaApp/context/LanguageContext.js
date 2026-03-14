import React, { createContext, useContext, useState, useCallback } from "react";
import { I18nManager } from "react-native";
import { UI } from "../constants/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("ar");

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    const isRtl = lang === "ar" || lang === "dar";
    if (I18nManager.isRTL !== isRtl) {
      I18nManager.allowRTL(isRtl);
      I18nManager.forceRTL(isRtl);
    }
  }, []);

  const rtl = language === "ar" || language === "dar";
  const t = UI[language] || UI.ar;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, rtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
