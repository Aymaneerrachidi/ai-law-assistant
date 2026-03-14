import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { P, SHADOWS } from "../../constants/theme";
import { useLanguage } from "../../context/LanguageContext";
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from "react-native";
import { useRef, useEffect } from "react";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TAB_COUNT = 5;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT;

const TAB_ICONS: Record<string, string> = {
  index: "chatbubble-ellipses",
  documents: "document-text",
  learn: "book",
  sentence: "scale",
  deadlines: "calendar",
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t, rtl } = useLanguage();
  const indicatorX = useRef(new Animated.Value(state.index * TAB_WIDTH)).current;
  const scaleAnims = useRef(
    Array.from({ length: TAB_COUNT }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [state.index]);

  const tabs = state.routes.map((route, index) => {
    const isFocused = state.index === index;
    const label = descriptors[route.key]?.options?.title ?? route.name;

    const onPress = () => {
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
      // Bounce animation
      Animated.sequence([
        Animated.spring(scaleAnims[index], {
          toValue: 1.22,
          useNativeDriver: true,
          tension: 120,
          friction: 6,
        }),
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
      ]).start();
    };

    const iconName = TAB_ICONS[route.name] ?? "ellipse";

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.tabItem}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnims[index] }] }}>
          <Ionicons
            name={iconName as any}
            size={22}
            color={isFocused ? P.gold : P.textDim}
          />
        </Animated.View>
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive, rtl && { writingDirection: "rtl" }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.tabBar}>
      {/* Sliding gold indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { transform: [{ translateX: indicatorX }] },
        ]}
      />
      <View style={styles.tabRow}>{tabs}</View>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t.chatTab }} />
      <Tabs.Screen name="documents" options={{ title: t.docTab }} />
      <Tabs.Screen name="learn" options={{ title: t.learnTab }} />
      <Tabs.Screen name="sentence" options={{ title: t.sentenceTab }} />
      <Tabs.Screen name="deadlines" options={{ title: t.deadlineTab }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: P.bgCard,
    borderTopWidth: 1,
    borderTopColor: P.gold + "25",
    height: 65,
    paddingBottom: 8,
    paddingTop: 0,
    position: "relative",
    ...SHADOWS.header,
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    width: TAB_WIDTH,
    height: 2,
    backgroundColor: P.gold,
    borderRadius: 2,
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 4,
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: P.textDim,
  },
  tabLabelActive: {
    color: P.gold,
  },
});
