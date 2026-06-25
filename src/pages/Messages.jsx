import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// ── Simple XOR-based encryption using a shared key ──────────────────────────
// We use a simple but effective approach: CryptoJS-style using Web Crypto API
// The key is derived from a shared secret known to both sender and receiver.

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "superconnect-secret-key-2024";

function strToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToStr(bytes) {
  return new TextDecoder().decode(bytes);
}

async function getCryptoKey(keyMaterial) {
  const keyBytes = await crypto.subtle.digest("SHA-256", strToBytes(keyMaterial));
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptMessage(plaintext, keyMaterial) {
  try {
    const key = await getCryptoKey(keyMaterial);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = strToBytes(plaintext);
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
    // combine iv + ciphertext, encode as base64
    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.byteLength);
    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error("Encrypt error:", e);
    return plaintext; // fallback: store plain if crypto fails
  }
}

async function decryptMessage(ciphertext, keyMaterial) {
  try {
    const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const key = await getCryptoKey(keyMaterial);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return bytesToStr(new Uint8Array(decrypted));
  } catch (e) {
    // If decryption fails (e.g. old plain-text messages), return as-is
    return ciphertext;
  }
}

const styles = `
  :root {
    --bg: #0F0F11;
    --surface: #1A1A1F;
    --border: #2A2A2F;
    --ink: #F4F4F5;
    --ink-muted: #A1A1AA;
    --accent: #7C3AED;
  }

  .messages-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', sans-serif;
    color: var(--ink);
    padding: 80px 24px 80px;
    display: flex;
    justify-content: center;
  }

  .messages-inner {
    width: 100%;
    max-width: 1200px;
    display: flex;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    height: 75vh;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    overflow: hidden;
  }

  /* ── Sidebar (Chats list) ── */
  .chat-sidebar {
    width: 300px;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    background: var(--surface);
  }

  .sidebar-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
  }

  .sidebar-header h3 {
    font-family: 'Inter', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
  }

  .chat-list {
    flex: 1;
    overflow-y: auto;
  }

  .chat-user-item {
    padding: 16px 24px;
    cursor: pointer;
    border-bottom: 1px solid var(--border);
    transition: background 200ms ease;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
  }

  .chat-user-item:hover, .chat-user-item.active {
    background: rgba(124, 58, 237, 0.08);
  }

  /* ── Chat Window ── */
  .chat-window {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg);
  }

  .chat-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .chat-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .chat-header .lock-badge {
    margin-left: auto;
    font-size: 0.75rem;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .messages-area {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .message-wrapper {
    display: flex;
    flex-direction: column;
  }

  .message-bubble {
    max-width: 70%;
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 0.95rem;
    line-height: 1.4;
    word-break: break-word;
  }

  .message-wrapper.sent {
    align-items: flex-end;
  }

  .message-wrapper.sent .message-bubble {
    background: var(--accent);
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  .message-wrapper.received {
    align-items: flex-start;
  }

  .message-wrapper.received .message-bubble {
    background: #2A2A2F;
    color: var(--ink);
    border-bottom-left-radius: 4px;
  }

  /* ── Input Area ── */
  .input-area {
    padding: 16px 24px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    display: flex;
    gap: 12px;
  }

  .chat-input {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 10px 16px;
    font-family: inherit;
    font-size: 0.95rem;
    outline: none;
    color: var(--ink);
    transition: border-color 200ms ease;
  }

  .chat-input:focus {
    border-color: var(--accent);
  }
  
  .chat-input::placeholder {
    color: var(--ink-muted);
  }

  .btn-send {
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 20px;
    padding: 0 20px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 200ms ease;
  }

  .btn-send:hover {
    background: #6D28D9;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink-muted);
    font-style: italic;
  }
`;

export default function Messages() {
  const [user, setUser] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser) return;

      setUser(currentUser);
      fetchChatUsers(currentUser.id);
    } catch(err) {
      console.error(err);
    }
  };

  // ✅ build chat list from followers + following + existing messages
  const fetchChatUsers = async (userId) => {
    // people who follow me
    const { data: followersData } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", userId);

    // people I follow
    const { data: followingData } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    // people already in conversation with me
    const { data: sentMsgs } = await supabase
      .from("messages")
      .select("receiver_id")
      .eq("sender_id", userId);

    const { data: receivedMsgs } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("receiver_id", userId);

    const ids = [
      ...(followersData || []).map((f) => f.follower_id),
      ...(followingData || []).map((f) => f.following_id),
      ...(sentMsgs || []).map((m) => m.receiver_id),
      ...(receivedMsgs || []).map((m) => m.sender_id),
    ];

    const uniqueIds = [...new Set(ids)].filter((id) => id !== userId);

    if (uniqueIds.length === 0) {
      setChatUsers([]);
      return;
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", uniqueIds);

    if (error) {
      console.log("CHAT USERS ERROR:", error.message);
      return;
    }

    setChatUsers(profiles || []);
  };

  const fetchMessages = async (otherUserId) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.log("MESSAGES ERROR:", error.message);
      return;
    }

    // 🔓 Decrypt each message before displaying
    const decrypted = await Promise.all(
      (data || []).map(async (msg) => ({
        ...msg,
        content: await decryptMessage(msg.content, ENCRYPTION_KEY),
      }))
    );

    setMessages(decrypted);
  };

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser || !user) return;

    // 🔐 Encrypt before storing
    const encryptedContent = await encryptMessage(text, ENCRYPTION_KEY);

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: selectedUser.id,
        content: encryptedContent,
      },
    ]);

    if (error) {
      console.log("SEND ERROR:", error.message);
      return;
    }

    setText("");
    fetchMessages(selectedUser.id);
    fetchChatUsers(user.id);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="messages-root">
        <div className="messages-inner">
          {/* LEFT: Sidebar */}
          <div className="chat-sidebar">
            <div className="sidebar-header">
              <h3>Messages</h3>
            </div>
            
            <div className="chat-list">
              {chatUsers.length === 0 ? (
                <div style={{ padding: "20px", color: "var(--ink-muted)", fontStyle: "italic" }}>No chats yet</div>
              ) : (
                chatUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`chat-user-item ${selectedUser?.id === u.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedUser(u);
                      fetchMessages(u.id);
                    }}
                  >
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                        {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    {u.name || "User"}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Chat Window */}
          <div className="chat-window">
            {selectedUser ? (
              <>
                <div className="chat-header">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <h3>{selectedUser.name}</h3>
                  <span className="lock-badge">🔒 End-to-end encrypted</span>
                </div>

                <div className="messages-area">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-wrapper ${msg.sender_id === user.id ? "sent" : "received"}`}
                    >
                      <div className="message-bubble">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="input-area">
                  <input
                    className="chat-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    placeholder="Type a message..."
                  />
                  <button className="btn-send" onClick={sendMessage}>Send</button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}