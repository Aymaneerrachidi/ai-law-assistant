import { useState, useRef, useEffect } from "react";

export default function MoroccanLawQA() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("ar");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = {
    ar: [
      "ما هي شروط الزواج في المغرب؟",
      "كيف تتم إجراءات الطلاق؟",
      "ما هي حقوق الحضانة؟",
      "كيف يتم تقسيم الإرث؟",
      "ما هي حقوق المرأة في مدونة الأسرة؟",
      "ما عقوبة السرقة في القانون الجنائي؟",
    ],
    fr: [
      "Quelles sont les conditions du mariage?",
      "Comment se déroule la procédure de divorce?",
      "Quels sont les droits de garde?",
      "Comment se fait le partage de l'héritage?",
      "Quels sont les droits de la femme?",
      "Quelle est la peine pour vol?",
    ],
    en: [
      "What are marriage conditions in Morocco?",
      "How does divorce procedure work?",
      "What are custody rights?",
      "How is inheritance divided?",
      "What are women's rights in the Family Code?",
      "What is the penalty for theft?",
    ],
  };

  const placeholders = {
    ar: "اطرح سؤالك القانوني هنا...",
    fr: "Posez votre question juridique ici...",
    en: "Ask your legal question here...",
  };

  const titles = {
    ar: "مساعد القانون المغربي",
    fr: "Assistant Juridique Marocain",
    en: "Moroccan Law Assistant",
  };

  const subtitles = {
    ar: "اسأل أي سؤال حول القانون المغربي",
    fr: "Posez vos questions sur le droit marocain",
    en: "Ask any question about Moroccan law",
  };

  const disclaimers = {
    ar: "⚖️ هذه المعلومات استرشادية فقط ولا تغني عن استشارة محامٍ مختص",
    fr: "⚖️ Ces informations sont indicatives et ne remplacent pas l'avis d'un avocat",
    en: "⚖️ This information is for guidance only and does not replace professional legal advice",
  };

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8787/api/moroccan-law-qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.content) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.content },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: language === "ar"
              ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى."
              : language === "fr"
              ? "Désolé, une erreur s'est produite. Veuillez réessayer."
              : "Sorry, an error occurred. Please try again.",
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: language === "ar"
            ? "عذراً، تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً."
            : language === "fr"
            ? "Désolé, impossible de se connecter. Veuillez réessayer plus tard."
            : "Sorry, unable to connect. Please try again later.",
        },
      ]);
    }

    setLoading(false);
  };

  const isRTL = language === "ar";

  const legalDomains = {
    ar: [
      { icon: "👨‍👩‍👧‍👦", label: "مدونة الأسرة", desc: "الزواج، الطلاق، الحضانة، الإرث" },
      { icon: "⚖️", label: "القانون الجنائي", desc: "الجرائم والعقوبات" },
      { icon: "📋", label: "المسطرة الجنائية", desc: "الإجراءات القضائية" },
      { icon: "📝", label: "الالتزامات والعقود", desc: "العقود والمعاملات المدنية" },
    ],
    fr: [
      { icon: "👨‍👩‍👧‍👦", label: "Code de la Famille", desc: "Mariage, divorce, garde, héritage" },
      { icon: "⚖️", label: "Code Pénal", desc: "Infractions et peines" },
      { icon: "📋", label: "Procédure Pénale", desc: "Procédures judiciaires" },
      { icon: "📝", label: "Obligations & Contrats", desc: "Contrats et transactions civiles" },
    ],
    en: [
      { icon: "👨‍👩‍👧‍👦", label: "Family Code", desc: "Marriage, divorce, custody, inheritance" },
      { icon: "⚖️", label: "Penal Code", desc: "Crimes and penalties" },
      { icon: "📋", label: "Criminal Procedure", desc: "Judicial procedures" },
      { icon: "📝", label: "Obligations & Contracts", desc: "Contracts and civil transactions" },
    ],
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #0a1628 0%, #0f2035 40%, #132a3e 100%)",
        fontFamily: isRTL
          ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif"
          : "'DM Sans', 'Segoe UI', sans-serif",
        direction: isRTL ? "rtl" : "ltr",
        color: "#e8edf3",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "rgba(10, 22, 40, 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #d4af37, #b8941f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 4px 15px rgba(212, 175, 55, 0.3)",
            }}
          >
            ⚖️
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: "#d4af37",
                letterSpacing: isRTL ? "0" : "0.5px",
              }}
            >
              {titles[language]}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                color: "rgba(212, 175, 55, 0.6)",
                letterSpacing: isRTL ? "0" : "0.3px",
              }}
            >
              {subtitles[language]}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {["ar", "fr", "en"].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: language === lang ? "1px solid #d4af37" : "1px solid rgba(255,255,255,0.1)",
                background: language === lang ? "rgba(212, 175, 55, 0.15)" : "transparent",
                color: language === lang ? "#d4af37" : "#8899aa",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {lang === "ar" ? "عربي" : lang === "fr" ? "FR" : "EN"}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 800, width: "100%", margin: "0 auto", padding: "0 16px" }}>
        
        {/* Welcome Screen */}
        {messages.length === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 0" }}>
            {/* Morocco emblem area */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  margin: "0 auto 16px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))",
                  border: "2px solid rgba(212,175,55,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                }}
              >
                🇲🇦
              </div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#d4af37",
                  margin: "0 0 8px",
                }}
              >
                {language === "ar" ? "مرحباً بك" : language === "fr" ? "Bienvenue" : "Welcome"}
              </h2>
              <p style={{ color: "#7a8fa3", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                {disclaimers[language]}
              </p>
            </div>

            {/* Legal domains */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: 24,
              }}
            >
              {legalDomains[language].map((d, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: "22px", marginBottom: 6 }}>{d.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#c9d4e0", marginBottom: 3 }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "#5a7089" }}>{d.desc}</div>
                </div>
              ))}
            </div>

            {/* Quick questions */}
            <div>
              <p style={{ fontSize: "12px", color: "#5a7089", marginBottom: 10, fontWeight: 600 }}>
                {language === "ar" ? "أسئلة شائعة:" : language === "fr" ? "Questions fréquentes:" : "Common questions:"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {quickQuestions[language].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid rgba(212, 175, 55, 0.12)",
                      background: "rgba(212, 175, 55, 0.04)",
                      color: "#b8c7d8",
                      fontSize: "13px",
                      textAlign: isRTL ? "right" : "left",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      lineHeight: 1.5,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(212, 175, 55, 0.1)";
                      e.target.style.borderColor = "rgba(212, 175, 55, 0.3)";
                      e.target.style.color = "#d4af37";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(212, 175, 55, 0.04)";
                      e.target.style.borderColor = "rgba(212, 175, 55, 0.12)";
                      e.target.style.color = "#b8c7d8";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? (isRTL ? "flex-start" : "flex-end") : (isRTL ? "flex-end" : "flex-start"),
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "14px 18px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1))"
                        : "rgba(255,255,255,0.04)",
                    border:
                      msg.role === "user"
                        ? "1px solid rgba(212,175,55,0.25)"
                        : "1px solid rgba(255,255,255,0.06)",
                    color: msg.role === "user" ? "#e8dcc0" : "#c4cfde",
                    fontSize: "14px",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.role === "assistant" && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#d4af37",
                        marginBottom: 8,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {language === "ar" ? "⚖️ المساعد القانوني" : "⚖️ Legal Assistant"}
                    </div>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: isRTL ? "flex-end" : "flex-start", marginBottom: 14 }}>
                <div
                  style={{
                    padding: "16px 24px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map((j) => (
                      <div
                        key={j}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#d4af37",
                          animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "12px", color: "#7a8fa3" }}>
                    {language === "ar" ? "جاري البحث في النصوص القانونية..." : language === "fr" ? "Recherche dans les textes juridiques..." : "Searching legal texts..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "rgba(10, 22, 40, 0.9)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(212, 175, 55, 0.1)",
          padding: "14px 16px 20px",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-end",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={placeholders[language]}
              rows={1}
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: "14px",
                border: "1px solid rgba(212, 175, 55, 0.15)",
                background: "rgba(255,255,255,0.04)",
                color: "#e0e8f0",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "none",
                outline: "none",
                direction: isRTL ? "rtl" : "ltr",
                lineHeight: 1.5,
                minHeight: "48px",
                maxHeight: "120px",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(212, 175, 55, 0.4)";
                e.target.style.background = "rgba(255,255,255,0.06)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(212, 175, 55, 0.15)";
                e.target.style.background = "rgba(255,255,255,0.04)";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                border: "none",
                background:
                  loading || !input.trim()
                    ? "rgba(212, 175, 55, 0.15)"
                    : "linear-gradient(135deg, #d4af37, #b8941f)",
                color: loading || !input.trim() ? "#5a6a7a" : "#0a1628",
                fontSize: "20px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
                boxShadow:
                  loading || !input.trim() ? "none" : "0 4px 15px rgba(212, 175, 55, 0.3)",
              }}
            >
              {loading ? "⏳" : isRTL ? "↩" : "➤"}
            </button>
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "#3d5065",
              marginTop: 8,
              marginBottom: 0,
            }}
          >
            {disclaimers[language]}
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
        
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
        
        * { box-sizing: border-box; }
        
        textarea::placeholder {
          color: #4a5f75;
        }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.35); }
      `}</style>
    </div>
  );
}
