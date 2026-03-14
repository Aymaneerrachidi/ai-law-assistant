// Design tokens — exact match from the web version
export const P = {
  bg: "#1a1510",
  bgCard: "#231e17",
  bgInput: "#2a241c",
  bgHover: "#2f2820",
  gold: "#c8a45e",
  goldMuted: "#a08346",
  goldLight: "#e0c97a",
  text: "#e8e0d4",
  textMid: "#b5a999",
  textDim: "#8a7e72",
  border: "#35302a",
  borderLight: "#4a4238",
  userBubble: "#2c2518",
  aiBubble: "#211c15",
  bannerBg: "#1a1000",
};

export const FONTS = {
  latin: "Inter",
  arabic: "Cairo",
  brand: "Inter",
};

export const EASING = "cubic-bezier(0.4,0,0.2,1)";

// Spacing scale (multiples of 4px)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// Typography scale
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  body: 14,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 28,
};

// Shadow presets
export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  subtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  goldGlow: {
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
};
