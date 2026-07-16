// @ts-nocheck
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";

const API_URL =
  "https://c0eb-2405-4803-f179-fb40-887e-9932-18c7-6c3c.ngrok-free.app";

const USER_ID = 1;
const AI_ID = 2;
const AI_USER = {
  _id: AI_ID,
  name: "CryptoVault AI",
  avatar: "https://i.imgur.com/8Km9tLL.png",
};

export default function ChatScreen({ navigation }: any) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [actionData, setActionData] = useState<any>(null);
  const [actionValues, setActionValues] = useState<any>({});

  // ================= SUGGESTIONS =================

  const suggestions = useMemo(
    () => [
      { id: "1", title: "Design database", subtitle: "for e-commerce" },
      { id: "2", title: "Explain airplane", subtitle: "to a kid" },
      { id: "3", title: "Redux flow", subtitle: "for super app" },
      { id: "4", title: "Optimize RN", subtitle: "performance tips" },
    ],
    [],
  );

  // ================= MESSAGE UPDATE =================

  const updateAIMessage = (id: number, updater: (prev: string) => string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === id ? { ...m, text: updater(m.text || "") } : m,
      ),
    );
  };

  // ✅ FIX: delay append để auto scroll chạy đúng
  const pushAIMessage = (text: string) => {
    const msg = {
      _id: Date.now(),
      text,
      createdAt: new Date(),
      user: AI_USER,
    };

    setTimeout(() => {
      setMessages((prev) => GiftedChat.append(prev, [msg]));
    }, 10);
  };

  // ================= API CALL =================

  const callAI = async (prompt: string) => {
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        body: JSON.stringify({ question: prompt }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      pushAIMessage(data.answer || "No answer");

      if (data.suggested_action) {
        setActionData(data.suggested_action);
        setActionValues({});
      }

      if (data.confirm_message) {
        pushAIMessage(data.confirm_message);
      }
    } catch (e) {
      console.log(e);
      pushAIMessage(
        "Xin lỗi, AI đang tạm thời gián đoạn. Vui lòng thử lại sau ít phút.",
      );
    }

    setIsTyping(false);
  };

  // ================= CONFIRM ACTION =================

  const submitAction = async () => {
    if (!actionData) return;

    try {
      setIsTyping(true);

      const res = await fetch(`${API_URL}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: actionData.type,
          values: actionValues,
        }),
      });

      const data = await res.json();

      pushAIMessage(data.result || "Action completed");
    } catch (e) {
      console.error("Action error:", e);
      pushAIMessage(
        "Không thể thực hiện yêu cầu lúc này. Vui lòng kiểm tra lại và thử lại.",
      );
    }

    setActionData(null);
    setActionValues({});
    setIsTyping(false);
  };

  // ================= SEND =================

  // ✅ FIX: delay append user message
  const onSend = useCallback((newMsgs: IMessage[] = []) => {
    if (!newMsgs.length) return;

    setTimeout(() => {
      setMessages((prev) => GiftedChat.append(prev, newMsgs));
    }, 10);

    setText("");
    callAI(newMsgs[0].text);
  }, []);

  // ================= EMPTY STATE =================

  const EmptyState = () => {
    if (messages.length > 0) return null;

    return (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyWrapFixInverted}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suggestions.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.suggestionCard}
                onPress={() => setText(s.title + " " + s.subtitle)}
              >
                <Text style={styles.suggestionTitle}>{s.title}</Text>
                <Text style={styles.suggestionSub}>{s.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  // ================= RENDERERS =================

  const renderInputToolbar = (props: any) => (
    <InputToolbar {...props} containerStyle={styles.inputToolbar} />
  );

  const renderSend = (props: any) => {
    const disabled = !props.text?.trim();

    return (
      <Send {...props} disabled={disabled}>
        <View style={[styles.sendBtn, { opacity: disabled ? 0.4 : 1 }]}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>↑</Text>
        </View>
      </Send>
    );
  };

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: "#000" },
        left: { backgroundColor: "#eee" },
      }}
      textStyle={{
        right: { color: "#fff" },
        left: { color: "#000" },
      }}
    />
  );

  const openMenu = () => {
    if (navigation?.openDrawer) {
      navigation.openDrawer();
      return;
    }
    navigation?.navigate?.(HomeStackScreenKey.MoreActionScreen);
  };

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation?.goBack?.()}>
        <Feather name="arrow-left" size={20} color="#111" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>AI Assistant ▾</Text>
      <TouchableOpacity style={styles.headerIconBtn} onPress={openMenu}>
        <Feather name="menu" size={20} color="#111" />
      </TouchableOpacity>
    </View>
  );

  // ================= UI =================

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: USER_ID }}
        text={text}
        textInputProps={{
          value: text,
          onChangeText: setText,
        }}
        isTyping={isTyping}
        isSendButtonAlwaysVisible
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderChatEmpty={EmptyState}
        listProps={{
          maintainVisibleContentPosition: { minIndexForVisible: 1 },
        }}
      />

      {isTyping && messages.length === 0 && (
        <ActivityIndicator style={{ marginBottom: 20 }} />
      )}
    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },

  headerTitle: { fontWeight: "600", fontSize: 16 },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },

  emptyWrap: { flex: 1, justifyContent: "center" },
  emptyWrapFixInverted: {
    transform: [{ scaleY: -1 }],
  },

  suggestionCard: {
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 16,
    width: 200,
    marginHorizontal: 6,
    writingDirection: "ltr",
  },

  suggestionTitle: {
    fontWeight: "600",
    writingDirection: "ltr",
    textAlign: "left",
    includeFontPadding: false,
  },
  suggestionSub: {
    fontSize: 12,
    color: "#666",
    writingDirection: "ltr",
    textAlign: "left",
    includeFontPadding: false,
  },

  inputToolbar: {
    borderTopWidth: 0,
    margin: 10,
    borderRadius: 24,
    backgroundColor: "#f2f2f2",
  },

  sendBtn: {
    backgroundColor: "#000",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },

  actionPanel: {
    padding: 16,
    backgroundColor: "#fafafa",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  actionTitle: { fontWeight: "700", marginBottom: 8 },

  actionInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },

  actionBtn: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
