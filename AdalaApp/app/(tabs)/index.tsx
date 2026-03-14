import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView,
  Platform, StyleSheet, ScrollView, Animated, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { P, SHADOWS, SPACING, FONT_SIZES } from "../../constants/theme";
import { useLanguage } from "../../context/LanguageContext";
import { quickQuestions, legalDomains } from "../../constants/translations";
import { API } from "../../constants/api";
import Header from "../../components/Header";

// ── Skeleton pulse component for loading states ──
function SkeletonLine({ width = "100%", height = 14, style }: { width?: string | number; height?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View
      style={[
        { width, height, borderRadius: 6, backgroundColor: P.borderLight, opacity },
        style,
      ]}
    />
  );
}

// ── Animated thinking skeleton ──
function ThinkingSkeleton({ rtl }: { rtl: boolean }) {
  return (
    <View style={[skeletonStyles.container, rtl && { alignItems: "flex-end" }]}>
      <View style={skeletonStyles.bubble}>
        <SkeletonLine width="82%" height={12} style={{ marginBottom: 8 }} />
        <SkeletonLine width="60%" height={12} style={{ marginBottom: 8 }} />
        <SkeletonLine width="72%" height={12} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: { flexDirection: "row", marginBottom: 12 },
  bubble: {
    backgroundColor: P.aiBubble,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: P.border,
    maxWidth: "75%",
    minWidth: 180,
  },
});

// ── Animated message bubble ──
function MessageBubble({ item, rtl }: { item: any; rtl: boolean }) {
  const isUser = item.role === "user";
  const translateY = useRef(new Animated.Value(10)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();
  }, []);

  const justify = isUser
    ? rtl ? "flex-start" : "flex-end"
    : rtl ? "flex-end" : "flex-start";

  return (
    <Animated.View style={[styles.msgRow, { justifyContent: justify, opacity, transform: [{ translateY }] }]}>
      <View style={[styles.msgBubble, isUser ? styles.userBubble : styles.aiBubble, { maxWidth: "85%" }]}>
        <Text style={[styles.msgText, rtl && styles.rtlText, isUser && { color: P.text }]}>
          {item.content}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── Pressable card with scale feedback ──
function PressableCard({ style, onPress, children }: { style?: any; onPress: () => void; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
  };

  return (
    <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const { language, t, rtl } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const flatListRef = useRef(null);

  // Load saved messages
  useEffect(() => {
    AsyncStorage.getItem("adala_chat").then((s) => {
      if (s) try { setMessages(JSON.parse(s)); } catch {}
    });
  }, []);

  // Save messages
  useEffect(() => {
    AsyncStorage.setItem("adala_chat", JSON.stringify(messages));
  }, [messages]);

  const handleLanguageChange = useCallback(() => {
    setMessages([]);
    setInput("");
    setFollowUps([]);
    AsyncStorage.removeItem("adala_chat");
  }, []);

  async function send(text?: string) {
    const c = (text || input).trim();
    if (!c || loading) return;
    setFollowUps([]);
    setInput("");
    const userMsg = { role: "user", content: c, id: Date.now().toString() };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch(API.qa, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })), language }),
      });
      const text2 = await res.text();
      let d;
      try { d = JSON.parse(text2); } catch { throw new Error(text2.slice(0, 200)); }
      const reply = d.content || "No response received.";
      setMessages((p) => [...p, { role: "assistant", content: reply, id: (Date.now() + 1).toString() }]);
      if (Array.isArray(d.suggestions) && d.suggestions.length) {
        setFollowUps(d.suggestions.slice(0, 3));
      }
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Connection error. Please try again.", id: (Date.now() + 1).toString() }]);
    } finally {
      setLoading(false);
    }
  }

  const chat = messages.length > 0;

  // ── Welcome View with staggered animations ──
  const WelcomeView = () => {
    const domains = legalDomains[language] || legalDomains.ar;
    const questions = quickQuestions[language] || quickQuestions.ar;

    // Stagger anims for domain cards
    const domainAnims = useRef(domains.map(() => new Animated.Value(0))).current;
    const headerAnim = useRef(new Animated.Value(0)).current;
    const questionAnims = useRef(questions.map(() => new Animated.Value(0))).current;

    useEffect(() => {
      // Header first
      Animated.timing(headerAnim, {
        toValue: 1, duration: 400, delay: 60, useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
      // Domain cards stagger
      domains.forEach((_, i) => {
        Animated.timing(domainAnims[i], {
          toValue: 1, duration: 350, delay: 200 + i * 70, useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
      });
      // Quick questions stagger
      questions.forEach((_, i) => {
        Animated.timing(questionAnims[i], {
          toValue: 1, duration: 300, delay: 450 + i * 50, useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
      });
    }, [language]);

    return (
      <ScrollView style={styles.welcomeScroll} contentContainerStyle={styles.welcomeContent} showsVerticalScrollIndicator={false}>
        {/* Logo and subtitle */}
        <Animated.View
          style={[
            styles.welcomeHeader,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            },
          ]}
        >
          <View style={styles.welcomeLogo}>
            <Text style={{ fontSize: 36 }}>⚖️</Text>
          </View>
          <Text style={[styles.welcomeTitle, rtl && styles.rtlText]}>
            {rtl ? t.title : "Adala App"}
          </Text>
          <Text style={[styles.welcomeSub, rtl && styles.rtlText]}>{t.subtitle}</Text>
        </Animated.View>

        {/* Legal Domains */}
        <Text style={[styles.sectionTitle, rtl && styles.rtlText]}>{t.domainsTitle}</Text>
        <View style={styles.domainsGrid}>
          {domains.map((d, i) => (
            <Animated.View
              key={i}
              style={{
                flex: 1, minWidth: "45%",
                opacity: domainAnims[i],
                transform: [{ translateY: domainAnims[i].interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
              }}
            >
              <PressableCard style={styles.domainCard} onPress={() => send(d.title)}>
                <Text style={[styles.domainTitle, rtl && styles.rtlText]}>{d.title}</Text>
                <Text style={[styles.domainDesc, rtl && styles.rtlText]}>{d.desc}</Text>
              </PressableCard>
            </Animated.View>
          ))}
        </View>

        {/* Quick Questions */}
        <Text style={[styles.sectionTitle, rtl && styles.rtlText]}>{t.quickTitle}</Text>
        {questions.map((q, i) => (
          <Animated.View
            key={i}
            style={{
              opacity: questionAnims[i],
              transform: [{ translateY: questionAnims[i].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            }}
          >
            <PressableCard style={styles.quickBtn} onPress={() => send(q)}>
              <Text style={[styles.quickText, rtl && styles.rtlText]}>{q}</Text>
            </PressableCard>
          </Animated.View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // ── Chat Message renderer ──
  const renderMessage = ({ item }: { item: any }) => (
    <MessageBubble item={item} rtl={rtl} />
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header onLanguageChange={handleLanguageChange} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
        {!chat ? (
          <WelcomeView />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={() => (
              <View>
                {loading && <ThinkingSkeleton rtl={rtl} />}
                {followUps.length > 0 && !loading && (
                  <View style={styles.followUps}>
                    <Text style={[styles.followUpLabel, rtl && styles.rtlText]}>{t.followUpTitle}</Text>
                    {followUps.map((q, i) => (
                      <PressableCard
                        key={i}
                        style={styles.followUpBtn}
                        onPress={() => { setFollowUps([]); send(q); }}
                      >
                        <Text style={[styles.followUpText, rtl && styles.rtlText]}>{q}</Text>
                      </PressableCard>
                    ))}
                  </View>
                )}
              </View>
            )}
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t.placeholder}
              placeholderTextColor={P.textDim}
              style={[styles.textInput, rtl && styles.rtlText, rtl && { textAlign: "right" }]}
              editable={!loading}
              onSubmitEditing={() => send()}
              returnKeyType="send"
            />
            <PressableCard
              style={[styles.sendBtn, (loading || !input.trim()) && styles.sendBtnDisabled]}
              onPress={() => send()}
            >
              <Ionicons
                name="send"
                size={18}
                color={(loading || !input.trim()) ? P.textDim : P.bg}
                style={rtl ? { transform: [{ scaleX: -1 }] } : undefined}
              />
            </PressableCard>
          </View>
          <Text style={[styles.disclaimer, rtl && styles.rtlText]}>{t.disclaimer}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AnimatedDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return <Animated.View style={[styles.dot, { opacity }]} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },
  flex: { flex: 1 },
  rtlText: { writingDirection: "rtl", textAlign: "right" },

  // Welcome
  welcomeScroll: { flex: 1 },
  welcomeContent: { padding: SPACING.xl },
  welcomeHeader: { alignItems: "center", marginBottom: SPACING.xxxl, marginTop: SPACING.xl },
  welcomeLogo: {
    width: 68, height: 68, borderRadius: 18,
    backgroundColor: P.gold + "20", borderWidth: 1, borderColor: P.gold + "45",
    alignItems: "center", justifyContent: "center", marginBottom: SPACING.lg,
    ...SHADOWS.goldGlow,
  },
  welcomeTitle: { fontSize: FONT_SIZES.title, fontWeight: "700", color: P.gold, marginBottom: SPACING.sm, letterSpacing: -0.5 },
  welcomeSub: { fontSize: FONT_SIZES.body, color: P.textMid, textAlign: "center", lineHeight: 22, paddingHorizontal: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.sm, color: P.textDim, fontWeight: "700", marginBottom: SPACING.md, marginTop: SPACING.sm, letterSpacing: 0.5, textTransform: "uppercase" },

  // Domains
  domainsGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md, marginBottom: SPACING.xxl },
  domainCard: {
    backgroundColor: P.bgCard, borderRadius: 14, padding: SPACING.lg,
    borderWidth: 1, borderColor: P.border,
    ...SHADOWS.card,
  },
  domainTitle: { fontSize: FONT_SIZES.md, fontWeight: "600", color: P.text, marginBottom: SPACING.xs },
  domainDesc: { fontSize: 11, color: P.textDim, lineHeight: 16 },

  // Quick questions
  quickBtn: {
    backgroundColor: P.bgCard, borderRadius: 12, padding: SPACING.lg, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: P.border,
    ...SHADOWS.subtle,
  },
  quickText: { fontSize: FONT_SIZES.body, color: P.textMid, lineHeight: 20 },

  // Chat
  chatList: { padding: SPACING.md, paddingBottom: SPACING.sm },
  msgRow: { flexDirection: "row", marginBottom: SPACING.md },
  msgBubble: { borderRadius: 18, padding: SPACING.md, paddingHorizontal: SPACING.lg },
  userBubble: { backgroundColor: P.userBubble, borderWidth: 1, borderColor: P.gold + "35" },
  aiBubble: { backgroundColor: P.aiBubble, borderWidth: 1, borderColor: P.border },
  msgText: { fontSize: FONT_SIZES.body, color: P.text, lineHeight: 22 },

  // Thinking
  thinkingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dotsRow: { flexDirection: "row", gap: 3 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: P.gold },

  // Follow-ups
  followUps: { paddingVertical: SPACING.sm },
  followUpLabel: { fontSize: 11, color: P.textDim, marginBottom: SPACING.sm },
  followUpBtn: {
    borderWidth: 1, borderColor: P.border, borderRadius: 20,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, marginBottom: SPACING.sm,
    alignSelf: "flex-start", backgroundColor: P.bgCard,
  },
  followUpText: { fontSize: FONT_SIZES.sm, color: P.textMid },

  // Input
  inputBar: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderTopWidth: 1, borderTopColor: P.border,
    backgroundColor: P.bg,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  textInput: {
    flex: 1, height: 46, borderRadius: 14,
    backgroundColor: P.bgInput, borderWidth: 1, borderColor: P.border,
    paddingHorizontal: SPACING.lg, fontSize: FONT_SIZES.body, color: P.text,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: P.gold, alignItems: "center", justifyContent: "center",
    ...SHADOWS.goldGlow,
  },
  sendBtnDisabled: { backgroundColor: P.bgInput, shadowOpacity: 0 },
  disclaimer: { fontSize: FONT_SIZES.xs, color: P.textDim, textAlign: "center", marginTop: SPACING.sm },
});
