"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Activity, ArrowDown, ArrowUp, AudioLines, Check, ChevronDown, CircleHelp, Copy,
  FileText, Globe, Menu, MessageSquare, Mic, MicOff, Moon, MoreHorizontal, Paperclip,
  Plus, Search, Send, Settings2, ShieldCheck, Sparkles, Square, Sun, Trash2, X,
  Camera, Monitor, Volume2, VolumeX, StopCircle, Pencil, LogOut, Bell, Palette, Type, RefreshCw, UserRound, LockKeyhole, CheckCircle2
} from "lucide-react";
import { checkBackend, getApiBase, sendMessage, uploadFile } from "@/services/api";

type Message = { id: string; role: "user" | "assistant"; content: string; createdAt: number; attachment?: string };
type Conversation = { id: string; title: string; messages: Message[]; updatedAt: number };
type LocalAccount = { username: string; salt: string; passwordHash: string; createdAt: number };
const STORE = "aria.conversations.v3";
const ACCOUNTS_KEY = "aria.localAccounts.v1";
const SESSION_KEY = "aria.localSession.v1";
const DEFAULT_API = process.env.NEXT_PUBLIC_API_URL || "https://aria-ai-s5go.onrender.com";
const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
const makeConversation = (): Conversation => ({ id: id(), title: "New chat", messages: [], updatedAt: Date.now() });
const promptCards = [
  { icon: "✳", title: "Learn something", text: "Explain a difficult topic step by step, with examples." },
  { icon: "⌘", title: "Build with code", text: "Help me plan, write, and debug a software project." },
  { icon: "↗", title: "Think it through", text: "Help me turn an idea into a practical plan with milestones." },
  { icon: "▤", title: "Write & improve", text: "Help me write a clear answer with headings, subheadings, and examples." },
];
function readChats(key = STORE): Conversation[] {
  if (typeof window === "undefined") return [];
  try { const parsed = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}
function userChatKey(username: string) { return `${STORE}.${username.toLowerCase()}`; }
function toBase64(bytes: Uint8Array) { let binary = ""; bytes.forEach(byte => { binary += String.fromCharCode(byte); }); return btoa(binary); }
function fromBase64(value: string) { return Uint8Array.from(atob(value), char => char.charCodeAt(0)); }
async function derivePasswordHash(password: string, salt?: Uint8Array) {
  const actualSalt = salt || crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: actualSalt, iterations: 210000, hash: "SHA-256" }, key, 256);
  return { salt: toBase64(actualSalt), passwordHash: toBase64(new Uint8Array(bits)) };
}
function titleOf(text: string) { const t = text.replace(/\s+/g, " ").trim(); return t.length > 38 ? t.slice(0, 38) + "…" : t || "New chat"; }
function plainText(text: string) { return text.replace(/```[\s\S]*?```/g, " code block ").replace(/[`*_>#]/g, "").trim(); }
// Preserve backend wording while promoting a short plain-text first line to a heading.
function displayAnswer(text: string) {
  const value = text.trim();
  if (!value || /^#{1,6}\s/m.test(value) || /^[-*+]\s/m.test(value) || /^\d+[.)]\s/m.test(value) || value.startsWith("```")) return value;
  const lines = value.split("\n");
  const first = lines[0]?.trim() || "";
  if (first && first.length <= 72 && lines.length > 1 && (!lines[1].trim() || lines[1].trim().length > 0) && !/[.!?:]$/.test(first)) {
    return `## ${first}\n\n${lines.slice(1).join("\n").trim()}`;
  }
  return value;
}

export default function MainLayout() {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [account, setAccount] = useState<{ username: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [draft, setDraft] = useState("");
  const [backendUrl, setBackendUrl] = useState(DEFAULT_API);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_API);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(false);
  const [accent, setAccent] = useState("#7667f5");
  const [fontSize, setFontSize] = useState<"small" | "normal" | "large">("normal");
  const [compact, setCompact] = useState(false);
  const [notifyResponses, setNotifyResponses] = useState(true);
  const [toast, setToast] = useState("");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const buildRef = useRef("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"unknown" | "online" | "offline">("unknown");
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showScroll, setShowScroll] = useState(false);
  const [copied, setCopied] = useState("");
  const [busyLabel, setBusyLabel] = useState("Thinking");
  const [cameraBusy, setCameraBusy] = useState(false);
  const [screenBusy, setScreenBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortRef = useRef<AbortController | null>(null);
  const active = chats.find(c => c.id === activeId) || null;
  const filteredChats = useMemo(() => chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.updatedAt-a.updatedAt), [chats, search]);

  useEffect(() => {
    const storedApi = localStorage.getItem("aria.backendUrl") || DEFAULT_API;
    setBackendUrl(storedApi); setSettingsDraft(storedApi);
    setDark(localStorage.getItem("aria.theme") === "dark");
    setVoiceEnabled(localStorage.getItem("aria.voiceEnabled") !== "false");
    setAccent(localStorage.getItem("aria.accent") || "#7667f5");
    setFontSize((localStorage.getItem("aria.fontSize") as "small" | "normal" | "large") || "normal");
    setCompact(localStorage.getItem("aria.compact") === "true");
    setNotifyResponses(localStorage.getItem("aria.notifyResponses") !== "false");
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      setAccount({ username: session });
      let saved = readChats(userChatKey(session));
      if (!saved.length) saved = readChats("aria.conversations.v2");
      setChats(saved); setActiveId(saved[0]?.id || "");
      setAuthUsername(session);
    }
    setPreferencesReady(true); setAuthReady(true);
  }, []);
  useEffect(() => { if (typeof window !== "undefined" && account && authReady) localStorage.setItem(userChatKey(account.username), JSON.stringify(chats)); }, [chats, account, authReady]);
  useEffect(() => { if (preferencesReady) localStorage.setItem("aria.theme", dark ? "dark" : "light"); }, [dark, preferencesReady]);
  useEffect(() => { if (preferencesReady) localStorage.setItem("aria.accent", accent); }, [accent, preferencesReady]);
  useEffect(() => { if (preferencesReady) localStorage.setItem("aria.fontSize", fontSize); }, [fontSize, preferencesReady]);
  useEffect(() => { if (preferencesReady) localStorage.setItem("aria.compact", String(compact)); }, [compact, preferencesReady]);
  useEffect(() => { if (preferencesReady) localStorage.setItem("aria.notifyResponses", String(notifyResponses)); }, [notifyResponses, preferencesReady]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 4200); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => {
    let mounted = true;
    const checkVersion = async () => {
      try {
        const response = await fetch("/api/version", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!mounted || !data.buildId || data.buildId === "development") return;
        if (!buildRef.current) buildRef.current = data.buildId;
        else if (buildRef.current !== data.buildId) {
          buildRef.current = data.buildId; setUpdateAvailable(true); setToast("A new ARIA website version is ready. Refresh to update.");
          if ("Notification" in window && Notification.permission === "granted") new Notification("ARIA has been updated", { body: "A new website version is ready. Refresh to use it." });
        }

      } catch { /* Updates are best-effort; chat remains available. */ }
    };
    void checkVersion(); const timer = window.setInterval(checkVersion, 180000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [active?.messages.length, busy]);
  useEffect(() => {
    const el = listRef.current; if (!el) return;
    const handle = () => setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 180);
    el.addEventListener("scroll", handle); return () => el.removeEventListener("scroll", handle);
  }, [activeId]);
  useEffect(() => { void pingBackend(); return () => { recognitionRef.current?.stop?.(); window.speechSynthesis?.cancel?.(); abortRef.current?.abort(); }; }, [backendUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const pingBackend = useCallback(async () => {
    try { await checkBackend(backendUrl); setStatus("online"); }
    catch { setStatus("offline"); }
  }, [backendUrl]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAuthError("");
    const username = authUsername.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,24}$/.test(username)) { setAuthError("Use 3–24 characters: letters, numbers, dots, underscores or hyphens."); return; }
    if (authPassword.length < 8) { setAuthError("Use a password with at least 8 characters."); return; }
    // Permission is requested directly from the login/signup gesture. Denying it never blocks sign-in.
    if (notifyResponses && "Notification" in window && Notification.permission === "default") void Notification.requestPermission().catch(() => "denied");
    setAuthBusy(true);
    try {
      const accounts: LocalAccount[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
      const existing = accounts.find(item => item.username === username);
      if (authMode === "signup") {
        if (existing) { setAuthError("That username already exists on this browser. Choose another or switch to Log in."); return; }
        const derived = await derivePasswordHash(authPassword);
        accounts.push({ username, ...derived, createdAt: Date.now() });
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      } else {
        if (!existing) { setAuthError("No local account was found for this username on this browser."); return; }
        const derived = await derivePasswordHash(authPassword, fromBase64(existing.salt));
        if (derived.passwordHash !== existing.passwordHash) { setAuthError("Incorrect username or password."); return; }
      }
      localStorage.setItem(SESSION_KEY, username);
      let saved = readChats(userChatKey(username));
      if (!saved.length && authMode === "signup" && accounts.length === 1) saved = readChats("aria.conversations.v2");
      setChats(saved); setActiveId(saved[0]?.id || "");
      setAccount({ username }); setAuthPassword(""); setAuthError(""); setToast(`Welcome${authMode === "signup" ? " to ARIA" : " back"}, ${username}.`);
      void pingBackend();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not create or open the local account.");
    } finally { setAuthBusy(false); }
  }
  function logout() {
    localStorage.removeItem(SESSION_KEY); setAccount(null); setChats([]); setActiveId(""); setDraft(""); setFile(null); setSidebarOpen(false); setSettingsOpen(false); setAuthMode("login"); setToast("You have been logged out.");
  }
  function notifyResponseReady(chatTitle: string) {
    setToast(`ARIA finished: ${chatTitle || "Your response is ready"}`);
    if (notifyResponses && document.hidden && "Notification" in window && Notification.permission === "granted") {
      try { new Notification("ARIA response ready", { body: "Your answer is ready. Return to ARIA to view it.", tag: `aria-response-${activeId}` }); } catch { /* Browser may suppress notifications. */ }
    }
  }
  const updateChat = (chatId: string, fn: (c: Conversation) => Conversation) => setChats(prev => prev.map(c => c.id === chatId ? fn(c) : c));
  function renameChat(chatId: string) {
    const chat = chats.find(item => item.id === chatId); if (!chat) return;
    const proposed = window.prompt("Rename conversation", chat.title);
    if (proposed?.trim()) updateChat(chatId, current => ({ ...current, title: proposed.trim().slice(0, 100), updatedAt: Date.now() }));
  }
  const newChat = () => {
    const c = makeConversation(); setChats(prev => [c, ...prev]); setActiveId(c.id);
    setDraft(""); setFile(null); setError(""); setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 40);
  };
  const deleteChat = (chatId: string) => {
    const remaining = chats.filter(c => c.id !== chatId);
    setChats(remaining); if (chatId === activeId) setActiveId(remaining[0]?.id || "");
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { setError("Text-to-speech is not supported in this browser."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(plainText(text).slice(0, 12000));
    utterance.lang = "en-US"; utterance.rate = 1; utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => /aria|samantha|google us english/i.test(v.name) && v.lang.toLowerCase().startsWith("en")) || voices.find(v => v.lang.toLowerCase().startsWith("en"));
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
    window.speechSynthesis.speak(utterance);
  };
  const stopSpeech = () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); setSpeaking(false); };

  async function submit(textOverride?: string, attachment?: File | null) {
    const text = (textOverride ?? draft).trim();
    const activeFile = attachment === undefined ? file : attachment;
    if ((!text && !activeFile) || busy) return;
    let chatId = activeId;
    if (!chatId || !chats.some(c => c.id === chatId)) {
      const c = makeConversation(); chatId = c.id; setChats(prev => [c, ...prev]); setActiveId(c.id);
    }
    setError("");
    const userMsg: Message = { id: id(), role: "user", content: text || `Please review ${activeFile?.name}.`, createdAt: Date.now(), attachment: activeFile?.name };
    updateChat(chatId, c => ({ ...c, title: c.messages.length ? c.title : titleOf(text || activeFile?.name || ""), messages: [...c.messages, userMsg], updatedAt: Date.now() }));
    setDraft(""); setFile(null); setBusy(true); setBusyLabel(activeFile ? "Reading your file" : "Thinking");
    const controller = new AbortController(); abortRef.current = controller;
    try {
      let query = text;
      if (activeFile) {
        const result = await uploadFile(activeFile, chatId, backendUrl, controller.signal);
        const summary = typeof result.summary === "string" ? result.summary : "";
        query = `${query ? query + "\n\n" : ""}I uploaded the file "${activeFile.name}".${summary ? "\n\nDocument summary from ARIA:\n" + summary : " Please review the uploaded document and explain its key points."}`;
      }
      if (!query.trim()) query = "Please help me understand the uploaded file.";
      const reply = await sendMessage(query, chatId, backendUrl, controller.signal);
      const assistant: Message = { id: id(), role: "assistant", content: reply || "ARIA returned an empty response.", createdAt: Date.now() };
      updateChat(chatId, c => ({ ...c, messages: [...c.messages, assistant], updatedAt: Date.now() }));
      setStatus("online");
      notifyResponseReady(titleOf(reply));
      if (voiceEnabled) speak(reply);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError((e instanceof Error ? e.message : "Unknown error") + " Check the backend URL and confirm ARIA is running.");
      setStatus("offline");
    } finally { setBusy(false); setBusyLabel("Thinking"); abortRef.current = null; }
  }
  const stopRequest = () => { abortRef.current?.abort(); setBusy(false); setBusyLabel("Thinking"); };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void submit(); } };

  function startListening() {
    if (typeof window === "undefined") return;
    const w = window as any;
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) { setError("Voice input is not supported in this browser. Try Chrome or Edge, or type your message."); return; }
    stopSpeech();
    const rec = new Recognition(); recognitionRef.current = rec;
    rec.lang = "en-US"; rec.continuous = false; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onstart = () => { setListening(true); setError(""); };
    rec.onresult = (event: any) => {
      let final = ""; let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript; else interim += transcript;
      }
      setDraft((final || interim).trim());
      if (final.trim()) { setListening(false); setTimeout(() => void submit(final.trim(), file), 100); }
    };
    rec.onerror = (event: any) => { setListening(false); if (event.error !== "no-speech" && event.error !== "aborted") setError(`Voice input error: ${event.error}. Check microphone permission.`); };
    rec.onend = () => setListening(false);
    try { rec.start(); } catch { setListening(false); setError("Could not start the microphone. Try again."); }
  }
  function stopListening() { recognitionRef.current?.stop?.(); setListening(false); }

  async function capture(kind: "camera" | "screen") {
    if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.getDisplayMedia) {
      setError("Camera and screen capture require a modern browser and a secure context (HTTPS or localhost)."); return;
    }
    let stream: MediaStream | null = null;
    try {
      if (kind === "camera") { setCameraBusy(true); stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }); }
      else { setScreenBusy(true); stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }); }
      const video = document.createElement("video"); video.srcObject = stream; video.muted = true; video.playsInline = true;
      await video.play();
      await new Promise(resolve => setTimeout(resolve, 300));
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280; canvas.height = video.videoHeight || 720;
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b || new Blob()), "image/jpeg", .86));
      const shot = new File([blob], `${kind}-capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      stream.getTracks().forEach(t => t.stop()); stream = null;
      setFile(shot);
      setDraft(prev => prev || (kind === "camera" ? "Describe this camera image and identify the important details." : "Analyze this screenshot and explain what is shown."));
      setError("");
    } catch (e) {
      if (e instanceof Error && e.name !== "NotAllowedError" && e.name !== "AbortError") setError(`${kind === "camera" ? "Camera" : "Screen"} capture failed: ${e.message}`);
      else if (e instanceof Error && e.name === "NotAllowedError") setError(`${kind === "camera" ? "Camera" : "Screen sharing"} permission was cancelled.`);
    } finally { stream?.getTracks().forEach(t => t.stop()); setCameraBusy(false); setScreenBusy(false); }
  }

  async function copyText(text: string, key: string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1400); }
    catch { setError("Clipboard permission was blocked by the browser."); }
  }
  function saveSettings() {
    const next = settingsDraft.trim().replace(/\/+$/, "");
    if (!/^https?:\/\/.+/i.test(next)) { setError("Enter a valid backend URL, including http:// or https://."); return; }
    localStorage.setItem("aria.backendUrl", next); setBackendUrl(next); setSettingsOpen(false); setStatus("unknown"); setError("");
    setToast("Settings saved on this device.");
  }

  if (!authReady) return <div className="auth-screen"><div className="auth-card"><div className="brand-icon"><Sparkles size={22}/></div><h1>ARIA</h1><p>Preparing your personal workspace…</p></div></div>;
  if (!account) return <div className={`auth-screen ${dark ? "dark" : ""}`} style={{ "--accent": accent, "--accent-soft": `${accent}20` } as React.CSSProperties}>
    <div className="auth-backdrop-orb auth-orb-one"/><div className="auth-backdrop-orb auth-orb-two"/>
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="auth-brand"><div className="brand-icon"><Sparkles size={21}/></div><span>ARIA</span><em>PERSONAL AI</em></div>
      <div className="auth-kicker"><LockKeyhole size={13}/> PRIVATE LOCAL WORKSPACE</div>
      <h1 id="auth-title">{authMode === "signup" ? "Your space. Your ARIA." : "Welcome back."}</h1>
      <p className="auth-description">{authMode === "signup" ? "Create a local profile to keep your conversations and preferences organized on this device." : "Sign in to the local profile stored in this browser."}</p>
      <form onSubmit={handleAuth} className="auth-form">
        <label htmlFor="aria-username">Username</label><input id="aria-username" autoComplete="username" required minLength={3} maxLength={24} value={authUsername} onChange={e => setAuthUsername(e.target.value)} placeholder="your_username"/>
        <label htmlFor="aria-password">Password</label><input id="aria-password" type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} required minLength={8} value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="At least 8 characters"/>
        {authError && <div className="auth-error" role="alert">{authError}</div>}
        <button className="auth-submit" type="submit" disabled={authBusy}>{authBusy ? "Securing your workspace…" : authMode === "signup" ? "Create local account" : "Log in"}<ArrowUp size={16}/></button>
      </form>
      <div className="auth-switch">{authMode === "signup" ? "Already have an account?" : "New to ARIA on this device?"} <button onClick={() => {setAuthMode(authMode === "signup" ? "login" : "signup");setAuthError("");}}>{authMode === "signup" ? "Log in" : "Create account"}</button></div>
      <div className="auth-notice"><ShieldCheck size={15}/><span>Passwords are salted and hashed in this browser. Accounts and chats do not sync to other devices and are not server authentication.</span></div>
      <div className="auth-permission"><Bell size={14}/> Browser notifications may be requested during sign-in. Camera and microphone permissions are requested only when you use those tools.</div>
    </section>
  </div>;

  return <div className={`aria-app ${dark ? "dark" : ""} font-${fontSize} ${compact ? "compact" : ""}`} style={{ "--accent": accent, "--accent-soft": `${accent}20` } as React.CSSProperties}>
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-brand-row">
        <button className="brand" onClick={newChat} aria-label="ARIA new chat"><span className="brand-icon"><Sparkles size={18}/></span><span>ARIA</span><em>AI</em></button>
        <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X size={18}/></button>
      </div>
      <button className="new-chat-btn" onClick={newChat}><Plus size={17}/><span>New chat</span><kbd>Ctrl K</kbd></button>
      <nav className="sidebar-nav">
        <button onClick={() => {setSearchOpen(v => !v);setSearch("");}}><Search size={16}/><span>Search chats</span></button>
        <button onClick={() => {setSettingsDraft(backendUrl);setSettingsOpen(true);}}><Settings2 size={16}/><span>Settings</span></button>
      </nav>
      {searchOpen && <div className="search-input"><Search size={14}/><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a conversation"/><button onClick={() => {setSearchOpen(false);setSearch("");}}><X size={14}/></button></div>}
      <div className="section-label">RECENT</div>
      <div className="chat-history">{filteredChats.length ? filteredChats.map(c => <div key={c.id} className={`history-row ${c.id === activeId ? "active" : ""}`}><button className="history-open" onClick={() => {setActiveId(c.id);setSidebarOpen(false);setError("");}}><MessageSquare size={15}/><span>{c.title}</span></button><button className="history-action" title="Rename chat" aria-label={`Rename ${c.title}`} onClick={() => renameChat(c.id)}><Pencil size={13}/></button><button className="history-remove" title="Delete chat" aria-label={`Delete ${c.title}`} onClick={() => deleteChat(c.id)}><Trash2 size={14}/></button></div>) : <div className="history-empty">{search ? "No matching chats." : "Your conversations will appear here."}</div>}</div>
      <div className="sidebar-status"><span className={`dot ${status}`}/><div><strong>ARIA backend</strong><small>{status === "online" ? "Connected" : status === "offline" ? "Not reachable" : "Checking connection"}</small></div><button className="icon-btn" onClick={() => void pingBackend()} title="Check connection"><Activity size={16}/></button></div>
      <div className="sidebar-profile"><div className="profile-avatar">{account.username.slice(0,1).toUpperCase()}</div><div><strong>{account.username}</strong><small>Local workspace</small></div><button className="icon-btn" onClick={() => setSettingsOpen(true)} title="Account and settings"><MoreHorizontal size={17}/></button><button className="icon-btn logout-btn" onClick={logout} title="Log out"><LogOut size={15}/></button></div>
    </aside>
    {sidebarOpen && <button className="scrim" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}/>}
    <main className="main">
      <header className="topbar">
        <div className="top-left"><button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={20}/></button><span className="mobile-brand"><Sparkles size={17}/> ARIA</span><button className="model-select" onClick={() => {setSettingsDraft(backendUrl);setSettingsOpen(true);}}>ARIA <span>Assistant</span><ChevronDown size={14}/></button></div>
        <div className="top-right"><div className={`connection-label ${status}`}><span className="dot"/>{status === "online" ? "Connected" : status === "offline" ? "Offline" : "Checking"}</div><button className="icon-btn" onClick={() => setDark(v => !v)} title="Toggle theme" aria-label="Toggle theme">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><button className="header-copy" disabled={!active?.messages.length} onClick={() => active && void copyText(active.messages.map(m => `${m.role === "user" ? "You" : "ARIA"}:\n${m.content}`).join("\n\n"), "chat")}><Copy size={14}/><span>{copied === "chat" ? "Copied" : "Copy chat"}</span></button><span className="account-pill"><UserRound size={13}/>{account.username}</span></div>
      </header>
      {updateAvailable && <div className="update-banner"><RefreshCw size={15}/><span>A new ARIA version is ready.</span><button onClick={() => window.location.reload()}>Refresh app</button><button className="update-dismiss" onClick={() => setUpdateAvailable(false)} aria-label="Dismiss update notice"><X size={14}/></button></div>}
      <div className="chat-scroll" ref={listRef}>
        {!active?.messages.length ? <section className="welcome">
          <div className="welcome-orb"><div className="orb-core"><Sparkles size={24}/></div><span className="orb-ring ring-one"/><span className="orb-ring ring-two"/></div>
          <div className="eyebrow">YOUR PERSONAL AI WORKSPACE</div>
          <h1>What can I help you<br/><span>figure out today?</span></h1>
          <p>Ask a question, explore an idea, or work through a challenge. ARIA will route it through your own assistant backend.</p>
          <div className="prompt-grid">{promptCards.map(card => <button className="prompt-card" key={card.title} onClick={() => {setDraft(card.text);inputRef.current?.focus();}}><span className="prompt-symbol">{card.icon}</span><span className="prompt-copy"><strong>{card.title}</strong><small>{card.text}</small></span><ArrowUp size={14} className="prompt-arrow"/></button>)}</div>
          <div className="welcome-foot"><ShieldCheck size={14}/> Your messages go to the configured ARIA backend.</div>
        </section> : <section className="messages">
          {active.messages.map(m => <article key={m.id} className={`message ${m.role}`}>
            <div className={m.role === "assistant" ? "assistant-avatar" : "user-avatar"}>{m.role === "assistant" ? <Sparkles size={15}/> : account.username.slice(0,1).toUpperCase()}</div>
            <div className="message-main"><div className="message-heading"><strong>{m.role === "assistant" ? "ARIA" : "You"}</strong><time>{new Date(m.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</time></div>
              {m.attachment && <div className="file-chip"><FileText size={14}/>{m.attachment}</div>}
              <div className={`markdown ${m.role === "user" ? "user-markdown" : ""}`}><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.role === "assistant" ? displayAnswer(m.content) : m.content}</ReactMarkdown></div>
              {m.role === "assistant" && <div className="message-actions"><button onClick={() => void copyText(m.content, m.id)}>{copied === m.id ? <Check size={14}/> : <Copy size={14}/>}<span>{copied === m.id ? "Copied" : "Copy"}</span></button><button onClick={() => speak(m.content)}><Volume2 size={14}/><span>Read aloud</span></button><button onClick={() => {setDraft(`Please expand on this answer:\n\n${m.content}`);inputRef.current?.focus();}}><MessageSquare size={14}/><span>Follow up</span></button></div>}
            </div>
          </article>)}
          {busy && <article className="message assistant"><div className="assistant-avatar"><Sparkles size={15}/></div><div className="message-main"><div className="message-heading"><strong>ARIA</strong><time>{busyLabel}</time></div><div className="thinking"><i/><i/><i/><span>{busyLabel}…</span></div></div></article>}
          {error && <div className="error-card"><CircleHelp size={18}/><div><strong>Something needs attention</strong><p>{error}</p><button onClick={() => void pingBackend()}>Check connection</button></div><button className="icon-btn" onClick={() => setError("")}><X size={15}/></button></div>}
        </section>}
        {showScroll && <button className="scroll-latest" onClick={() => listRef.current?.scrollTo({top:listRef.current.scrollHeight,behavior:"smooth"})}><ArrowDown size={16}/></button>}
      </div>
      <footer className="composer-area">
        <div className="composer-wrap">
          {file && <div className="pending-file"><FileText size={15}/><span>{file.name}</span><small>{(file.size/1024/1024).toFixed(2)} MB</small><button onClick={() => setFile(null)} aria-label="Remove attachment"><X size={14}/></button></div>}
          <div className="composer"><textarea ref={inputRef} rows={1} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={onKeyDown} placeholder={listening ? "Listening… speak now" : "Message ARIA…"} aria-label="Message ARIA" onInput={e => {const t=e.currentTarget;t.style.height="auto";t.style.height=Math.min(t.scrollHeight,180)+"px";}}/>
            <div className="composer-bottom"><div className="composer-tools">
              <button className="tool-btn" onClick={() => fileRef.current?.click()} title="Attach a document"><Paperclip size={16}/><span>Attach</span></button><input ref={fileRef} type="file" hidden accept=".pdf,.txt,.docx,.pptx,.png,.jpg,.jpeg,.zip" onChange={(e: ChangeEvent<HTMLInputElement>) => {const f=e.target.files?.[0];if(f)setFile(f);e.currentTarget.value="";}}/>
              <span className="tool-divider"/>
              <button className={`tool-btn ${listening ? "active" : ""}`} onClick={listening ? stopListening : startListening} title={listening ? "Stop voice input" : "Speak to ARIA"}>{listening ? <MicOff size={16}/> : <Mic size={16}/>}<span>{listening ? "Stop mic" : "Voice"}</span></button>
              <button className="tool-icon" onClick={() => void capture("camera")} disabled={cameraBusy || screenBusy} title="Capture a camera photo"><Camera size={16}/></button>
              <button className="tool-icon" onClick={() => void capture("screen")} disabled={cameraBusy || screenBusy} title="Capture screen">{screenBusy ? <Monitor size={16}/> : <Monitor size={16}/>}</button>
              <button className={`tool-icon ${voiceEnabled ? "enabled" : ""}`} onClick={() => {setVoiceEnabled(v => {localStorage.setItem("aria.voiceEnabled",String(!v));if(v)stopSpeech();return !v;});}} title={voiceEnabled ? "Turn automatic voice replies off" : "Turn automatic voice replies on"}>{voiceEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>}</button>
              <span className="file-types">PDF · DOCX · PPTX · TXT · images · ZIP</span>
            </div><div className="send-area">{busy ? <button className="stop-btn" onClick={stopRequest}><Square size={10} fill="currentColor"/> Stop</button> : <button className="send-btn" disabled={!draft.trim() && !file} onClick={() => void submit()} aria-label="Send message"><Send size={16}/></button>}</div></div>
          </div>
          <div className="composer-note"><span><AudioLines size={12}/> Browser voice features depend on your device and permissions.</span><span>Enter to send · Shift + Enter for a new line</span></div>
        </div>
      </footer>
    </main>
    {toast && <div className="aria-toast" role="status"><CheckCircle2 size={17}/><span>{toast}</span><button onClick={() => setToast("")} aria-label="Dismiss notification"><X size={14}/></button></div>}
    {settingsOpen && <div className="modal-backdrop" onMouseDown={e => {if(e.target===e.currentTarget)setSettingsOpen(false);}}><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-heading">
      <div className="modal-title"><div className="modal-icon"><Settings2 size={19}/></div><div><h2 id="settings-heading">Settings</h2><p>Connect this app to your ARIA backend.</p></div><button className="icon-btn" onClick={() => setSettingsOpen(false)}><X size={18}/></button></div>
      <label htmlFor="backend-url">Backend base URL</label><input id="backend-url" className="settings-input" value={settingsDraft} onChange={e => setSettingsDraft(e.target.value)} placeholder="https://aria-ai-s5go.onrender.com"/>
      <p className="settings-help">The app calls <code>/chat</code>, <code>/upload</code>, and <code>/health</code>. Do not enter API keys here.</p>
      <div className="customization-panel"><div className="customization-heading"><Palette size={15}/> Appearance</div>
        <label htmlFor="aria-accent">Accent color</label><div className="accent-options">{[{name:"Violet",value:"#7667f5"},{name:"Blue",value:"#2878e8"},{name:"Teal",value:"#168f88"},{name:"Rose",value:"#d64f87"},{name:"Amber",value:"#b7791f"}].map(option => <button key={option.value} className={`accent-swatch ${accent === option.value ? "selected" : ""}`} style={{background:option.value}} title={option.name} aria-label={`${option.name} accent`} onClick={() => setAccent(option.value)}>{accent === option.value && <Check size={14}/>}</button>)}</div>
        <label htmlFor="aria-font-size"><Type size={13}/> Text size</label><select id="aria-font-size" className="settings-input" value={fontSize} onChange={e => setFontSize(e.target.value as "small" | "normal" | "large")}><option value="small">Small</option><option value="normal">Standard</option><option value="large">Large</option></select>
        <label className="setting-check"><input type="checkbox" checked={compact} onChange={e => setCompact(e.target.checked)}/> Compact layout</label>
        <label className="setting-check"><input type="checkbox" checked={notifyResponses} onChange={e => setNotifyResponses(e.target.checked)}/> Notify me when responses finish</label>
        <button className="secondary-btn notification-permission-btn" onClick={() => { if (!("Notification" in window)) { setToast("Browser notifications are not supported here."); return; } void Notification.requestPermission().then(permission => setToast(permission === "granted" ? "Browser notifications enabled." : "Notifications were not enabled. Check browser site permissions.")); }}> <Bell size={13}/> Enable browser notifications</button>
        <label className="setting-check"><input type="checkbox" checked={voiceEnabled} onChange={e => {setVoiceEnabled(e.target.checked);localStorage.setItem("aria.voiceEnabled",String(e.target.checked));if(!e.target.checked)stopSpeech();}}/> Read responses aloud automatically</label>
        <div className="customization-heading"><UserRound size={15}/> Local account</div><p className="settings-help">Signed in as <strong>{account.username}</strong>. Chat history, theme, and preferences are stored in this browser only.</p><button className="secondary-btn" onClick={logout}><LogOut size={13}/> Log out</button>
      </div>
      <div className="settings-status"><span className={`dot ${status}`}/><div><strong>{status === "online" ? "Backend reachable" : status === "offline" ? "Backend not reachable" : "Checking connection"}</strong><small>{backendUrl}</small></div><button className="secondary-btn" onClick={() => void pingBackend()}>Test</button></div>
      <div className="modal-actions"><button className="secondary-btn" onClick={() => setSettingsDraft(DEFAULT_API)}>Reset default</button><button className="primary-btn" onClick={saveSettings}>Save settings</button></div>
    </section></div>}
  </div>;
}
