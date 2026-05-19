import { useState, useEffect, useRef } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_MESSAGES = [
  { id: 1, user: "Аноним #4821", avatar: "👾", text: "Кто знает ответ на задание по физике? 😭", time: "14:32", reactions: [{ emoji: "🔥", count: 4 }, { emoji: "😂", count: 2 }], anon: true },
  { id: 2, user: "shadow_wolf", avatar: "🐺", text: "Скину за 50 T-Coins", time: "14:33", reactions: [{ emoji: "💀", count: 7 }], anon: false },
  { id: 3, user: "Аноним #9012", avatar: "🌀", text: "Завтра контрольная по математике, кто хочет сделку? 📝", time: "14:34", reactions: [], anon: true },
  { id: 4, user: "k1r4_dev", avatar: "⚡", text: "Клан NEXUS набирает людей! Топ 1 в рейтинге 🏆", time: "14:35", reactions: [{ emoji: "🔥", count: 12 }, { emoji: "👑", count: 5 }], anon: false },
  { id: 5, user: "Аноним #3377", avatar: "🎭", text: "Да кто эти NEXUS вообще 💀", time: "14:36", reactions: [{ emoji: "😂", count: 9 }], anon: true },
];

const MOCK_CLANS = [
  { id: 1, name: "NEXUS", icon: "⚡", members: 47, rating: 9821, color: "#a78bfa" },
  { id: 2, name: "ShadowOps", icon: "🌑", members: 31, rating: 7340, color: "#34d399" },
  { id: 3, name: "FireStorm", icon: "🔥", members: 28, rating: 6100, color: "#fb923c" },
  { id: 4, name: "IceBlood", icon: "❄️", members: 19, rating: 4200, color: "#38bdf8" },
];

const MOCK_DEALS = [
  { id: 1, from: "shadow_wolf", to: "k1r4_dev", offer: "500 T-Coins", want: "Помощь с алгеброй (2 недели)", status: "active", trust: 4.8 },
  { id: 2, from: "Аноним #4821", to: "Аноним #9012", offer: "300 T-Coins", want: "Объяснить физику (1 урок)", status: "pending", trust: 3.2 },
  { id: 3, from: "k1r4_dev", to: "shadow_wolf", offer: "200 T-Coins", want: "Нарисовать аватарку", status: "completed", trust: 5.0 },
];

const LEADERBOARD = [
  { rank: 1, name: "k1r4_dev", coins: 12400, badge: "👑", level: 42 },
  { rank: 2, name: "shadow_wolf", coins: 9800, badge: "⚡", level: 38 },
  { rank: 3, name: "n3on_girl", coins: 7200, badge: "💜", level: 31 },
  { rank: 4, name: "void_runner", coins: 5500, badge: "🌑", level: 27 },
  { rank: 5, name: "xX_Pro_Xx", coins: 4100, badge: "🔥", level: 22 },
];

// ─── CSS Injection ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #050508;
    --surface: rgba(255,255,255,0.04);
    --surface-hover: rgba(255,255,255,0.07);
    --border: rgba(255,255,255,0.08);
    --border-bright: rgba(255,255,255,0.15);
    --text: #f0f0f8;
    --muted: #6b6b80;
    --accent: #7c5cfc;
    --accent2: #fc5c7d;
    --accent3: #5cf0fc;
    --gold: #fbbf24;
    --green: #34d399;
    --font: 'Syne', sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); }

  .app {
    max-width: 430px;
    margin: 0 auto;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    background: var(--bg);
  }

  /* Ambient glow bg */
  .app::before {
    content: '';
    position: fixed;
    top: -200px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Glass card ── */
  .glass {
    background: var(--surface);
    border: 1px solid var(--border);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 20px;
  }
  .glass-bright {
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border-bright);
    backdrop-filter: blur(20px);
    border-radius: 20px;
  }

  /* ── Scrollable content ── */
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    position: relative;
    z-index: 1;
  }
  .scroll-area::-webkit-scrollbar { display: none; }

  /* ── Nav ── */
  .bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 12px 8px 20px;
    background: rgba(5,5,8,0.92);
    border-top: 1px solid var(--border);
    backdrop-filter: blur(20px);
    position: relative;
    z-index: 10;
  }
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 14px;
    transition: all 0.2s ease;
    background: none;
    border: none;
    color: var(--muted);
    font-family: var(--font);
  }
  .nav-item.active {
    color: var(--accent);
    background: rgba(124,92,252,0.12);
  }
  .nav-item span:first-child { font-size: 22px; }
  .nav-label { font-size: 10px; font-weight: 600; letter-spacing: 0.05em; }

  /* ── Header ── */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 12px;
    position: relative;
    z-index: 2;
  }
  .header-title { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
  .accent-text { color: var(--accent); }
  .header-badge {
    background: rgba(124,92,252,0.15);
    border: 1px solid rgba(124,92,252,0.3);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    font-family: var(--mono);
  }

  /* ── Tabs ── */
  .tabs {
    display: flex;
    gap: 6px;
    padding: 0 20px 14px;
    position: relative;
    z-index: 1;
  }
  .tab {
    padding: 7px 16px;
    border-radius: 30px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--border);
    background: none;
    color: var(--muted);
    font-family: var(--font);
    white-space: nowrap;
  }
  .tab.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
    box-shadow: 0 0 20px rgba(124,92,252,0.4);
  }

  /* ── Messages ── */
  .messages-list { display: flex; flex-direction: column; gap: 2px; padding: 8px 16px 16px; }
  
  .msg-bubble {
    display: flex;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 16px;
    transition: background 0.15s;
    cursor: pointer;
    align-items: flex-start;
  }
  .msg-bubble:hover { background: var(--surface-hover); }
  .msg-bubble.own { flex-direction: row-reverse; }

  .msg-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .msg-content { flex: 1; min-width: 0; }
  .msg-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .msg-name { font-size: 12px; font-weight: 700; color: var(--accent); }
  .msg-name.anon { color: var(--muted); }
  .msg-time { font-size: 10px; color: var(--muted); font-family: var(--mono); }
  .msg-text { font-size: 14px; line-height: 1.5; color: var(--text); }

  .msg-reactions {
    display: flex;
    gap: 6px;
    margin-top: 6px;
    flex-wrap: wrap;
  }
  .reaction {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 3px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .reaction:hover {
    background: rgba(124,92,252,0.15);
    border-color: var(--accent);
  }
  .reaction-count { font-size: 11px; color: var(--muted); font-family: var(--mono); }

  /* ── Input ── */
  .chat-input-wrap {
    padding: 12px 16px;
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: rgba(5,5,8,0.8);
    backdrop-filter: blur(20px);
    border-top: 1px solid var(--border);
    position: relative;
    z-index: 5;
  }
  .anon-toggle {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .anon-toggle.on { border-color: var(--accent); background: rgba(124,92,252,0.15); }

  .chat-input {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 10px 14px;
    color: var(--text);
    font-size: 14px;
    font-family: var(--font);
    outline: none;
    resize: none;
    min-height: 38px;
    max-height: 100px;
    transition: border 0.2s;
  }
  .chat-input:focus { border-color: rgba(124,92,252,0.5); }
  .chat-input::placeholder { color: var(--muted); }

  .send-btn {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: var(--accent);
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
    box-shadow: 0 0 16px rgba(124,92,252,0.4);
  }
  .send-btn:hover { transform: scale(1.05); box-shadow: 0 0 24px rgba(124,92,252,0.6); }
  .send-btn:active { transform: scale(0.95); }

  /* ── Clan cards ── */
  .section { padding: 0 16px 16px; }
  .section-title { font-size: 13px; font-weight: 700; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; padding: 0 4px; }

  .clan-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 18px;
    margin-bottom: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .clan-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--clan-color, var(--accent));
    border-radius: 2px 0 0 2px;
  }
  .clan-card:hover { background: var(--surface-hover); transform: translateX(2px); }

  .clan-icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    flex-shrink: 0;
  }
  .clan-info { flex: 1; min-width: 0; }
  .clan-name { font-size: 16px; font-weight: 800; }
  .clan-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .clan-rating {
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 500;
    color: var(--gold);
  }

  /* ── Deal cards ── */
  .deal-card {
    padding: 16px;
    border-radius: 18px;
    margin-bottom: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.2s;
  }
  .deal-card:hover { background: var(--surface-hover); }
  .deal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .deal-users { font-size: 13px; font-weight: 600; }
  .deal-users span { color: var(--accent); }
  .deal-arrow { color: var(--muted); margin: 0 6px; }
  .deal-status {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--mono);
  }
  .deal-status.active { background: rgba(52,211,153,0.15); color: var(--green); border: 1px solid rgba(52,211,153,0.3); }
  .deal-status.pending { background: rgba(251,191,36,0.12); color: var(--gold); border: 1px solid rgba(251,191,36,0.25); }
  .deal-status.completed { background: rgba(124,92,252,0.12); color: var(--accent); border: 1px solid rgba(124,92,252,0.25); }

  .deal-body { display: flex; gap: 8px; align-items: stretch; }
  .deal-side {
    flex: 1;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px;
  }
  .deal-side-label { font-size: 10px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .deal-side-value { font-size: 13px; font-weight: 600; }
  .deal-coins { color: var(--gold); }
  .deal-divider { display: flex; align-items: center; color: var(--muted); font-size: 18px; }

  /* ── Profile ── */
  .profile-hero {
    margin: 16px;
    padding: 24px;
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(124,92,252,0.15), rgba(252,92,125,0.08));
    border: 1px solid rgba(124,92,252,0.2);
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .profile-hero::after {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(124,92,252,0.2), transparent 70%);
    pointer-events: none;
  }
  .profile-avatar-wrap {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--surface);
    border: 2px solid var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    margin: 0 auto 12px;
    box-shadow: 0 0 30px rgba(124,92,252,0.4);
  }
  .profile-name { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .profile-level { font-size: 13px; color: var(--muted); font-family: var(--mono); }
  .profile-level span { color: var(--accent); }

  .profile-stats {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .stat { text-align: center; }
  .stat-value { font-size: 20px; font-weight: 800; font-family: var(--mono); }
  .stat-value.coins { color: var(--gold); }
  .stat-value.rep { color: var(--green); }
  .stat-label { font-size: 10px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

  .badges-row { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 4px; }
  .badge-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
  }

  /* ── Leaderboard ── */
  .lb-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 16px;
    margin-bottom: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    transition: all 0.2s;
  }
  .lb-row:hover { background: var(--surface-hover); }
  .lb-row.top1 { border-color: rgba(251,191,36,0.3); background: rgba(251,191,36,0.06); }
  .lb-rank { font-size: 14px; font-weight: 800; font-family: var(--mono); color: var(--muted); width: 24px; }
  .lb-rank.gold { color: var(--gold); }
  .lb-avatar { font-size: 24px; }
  .lb-name { flex: 1; font-size: 15px; font-weight: 700; }
  .lb-level { font-size: 11px; color: var(--muted); font-family: var(--mono); margin-top: 2px; }
  .lb-coins { font-family: var(--mono); font-size: 14px; font-weight: 600; color: var(--gold); }

  /* ── Onboarding ── */
  .onboarding {
    position: fixed;
    inset: 0;
    background: var(--bg);
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    text-align: center;
  }
  .onboarding-logo { font-size: 64px; margin-bottom: 24px; filter: drop-shadow(0 0 30px rgba(124,92,252,0.6)); }
  .onboarding-title { font-size: 36px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 8px; }
  .onboarding-sub { font-size: 16px; color: var(--muted); line-height: 1.6; margin-bottom: 40px; max-width: 300px; }
  .onboarding-features { display: flex; flex-direction: column; gap: 12px; width: 100%; margin-bottom: 40px; }
  .feature-row {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 14px 16px;
    text-align: left;
  }
  .feature-icon { font-size: 28px; flex-shrink: 0; }
  .feature-text { font-size: 14px; font-weight: 600; }
  .feature-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .tg-btn {
    width: 100%;
    padding: 16px;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--accent), #5c4cfc);
    border: none;
    color: white;
    font-size: 16px;
    font-weight: 800;
    font-family: var(--font);
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: all 0.2s;
    box-shadow: 0 8px 32px rgba(124,92,252,0.4);
  }
  .tg-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,92,252,0.55); }
  .tg-btn:active { transform: translateY(0); }

  /* ── Coin animation ── */
  @keyframes coinFloat {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-60px) scale(0.5); }
  }
  .coin-float {
    position: fixed;
    font-size: 24px;
    animation: coinFloat 1s ease-out forwards;
    pointer-events: none;
    z-index: 999;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .slide-up { animation: slideUp 0.3s ease-out; }

  @keyframes pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(124,92,252,0.4); }
    70% { box-shadow: 0 0 0 10px rgba(124,92,252,0); }
    100% { box-shadow: 0 0 0 0 rgba(124,92,252,0); }
  }
  .pulse { animation: pulse-ring 2s infinite; }

  /* ── Daily bonus ── */
  .daily-banner {
    margin: 8px 16px 0;
    padding: 14px 16px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(251,191,36,0.1), rgba(252,92,125,0.08));
    border: 1px solid rgba(251,191,36,0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.2s;
  }
  .daily-banner:hover { background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(252,92,125,0.12)); }
  .daily-info { display: flex; align-items: center; gap: 10px; }
  .daily-text { font-size: 13px; font-weight: 700; }
  .daily-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
  .daily-claim-btn {
    padding: 7px 16px;
    border-radius: 20px;
    background: rgba(251,191,36,0.2);
    border: 1px solid rgba(251,191,36,0.4);
    color: var(--gold);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: var(--font);
    transition: all 0.2s;
  }
  .daily-claim-btn:hover { background: rgba(251,191,36,0.3); }
  .daily-claim-btn.claimed { color: var(--muted); border-color: var(--border); background: var(--surface); }

  /* Anon selector */
  .anon-selector {
    display: flex;
    gap: 6px;
    padding: 8px 16px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .anon-selector::-webkit-scrollbar { display: none; }
  .anon-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
    color: var(--muted);
    font-family: var(--font);
  }
  .anon-chip.selected {
    background: rgba(124,92,252,0.15);
    border-color: var(--accent);
    color: var(--accent);
  }

  /* Shop */
  .shop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px 16px; }
  .shop-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .shop-item:hover { background: var(--surface-hover); transform: translateY(-2px); }
  .shop-item-icon { font-size: 36px; margin-bottom: 8px; }
  .shop-item-name { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
  .shop-item-price { font-family: var(--mono); font-size: 12px; color: var(--gold); font-weight: 600; }

  /* Notif dot */
  .notif-dot {
    width: 7px;
    height: 7px;
    background: var(--accent2);
    border-radius: 50%;
    position: absolute;
    top: -1px;
    right: -1px;
  }
`;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function TChat() {
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState("chat");
  const [chatTab, setChatTab] = useState("global");
  const [anonMode, setAnonMode] = useState("anon");
  const [inputVal, setInputVal] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [coins, setCoins] = useState(1240);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [coinFloats, setCoinFloats] = useState([]);
  const [profileTab, setProfileTab] = useState("stats");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!inputVal.trim()) return;
    const newMsg = {
      id: Date.now(),
      user: anonMode === "anon" ? `Аноним #${Math.floor(Math.random() * 9000 + 1000)}` : anonMode === "nick" ? "k1r4_dev" : "k1r4_dev",
      avatar: anonMode === "anon" ? "🎭" : "⚡",
      text: inputVal,
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      reactions: [],
      anon: anonMode === "anon",
    };
    setMessages(prev => [...prev, newMsg]);
    setInputVal("");
  };

  const claimDaily = (e) => {
    if (dailyClaimed) return;
    setDailyClaimed(true);
    setCoins(c => c + 100);
    const rect = e.target.getBoundingClientRect();
    const id = Date.now();
    setCoinFloats(prev => [...prev, { id, x: rect.left, y: rect.top }]);
    setTimeout(() => setCoinFloats(prev => prev.filter(f => f.id !== id)), 1000);
  };

  const addReaction = (msgId, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const existing = m.reactions.find(r => r.emoji === emoji);
      if (existing) {
        return { ...m, reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
      }
      return { ...m, reactions: [...m.reactions, { emoji, count: 1 }] };
    }));
  };

  if (!onboarded) {
    return (
      <div className="app">
        <div className="onboarding">
          <div className="onboarding-logo">💬</div>
          <div className="onboarding-title">T<span style={{ color: "var(--accent)" }}>Chat</span></div>
          <div className="onboarding-sub">Анонимный чат твоей школы. Кланы, сделки и своя валюта.</div>
          <div className="onboarding-features">
            {[
              { icon: "👾", title: "Полная анонимность", sub: "Пиши без страха. Никто не узнает." },
              { icon: "⚔️", title: "Кланы и рейтинги", sub: "Создай свой клан или вступи в лучший." },
              { icon: "🪙", title: "T-Coins", sub: "Зарабатывай и трать внутри школы." },
              { icon: "🤝", title: "Сделки", sub: "Безопасный обмен услугами." },
            ].map(f => (
              <div key={f.title} className="feature-row">
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <div className="feature-text">{f.title}</div>
                  <div className="feature-sub">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="tg-btn" onClick={() => setOnboarded(true)}>
            Войти через Telegram
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Coin floats */}
      {coinFloats.map(f => (
        <div key={f.id} className="coin-float" style={{ left: f.x, top: f.y }}>🪙</div>
      ))}

      {/* ── CHAT ── */}
      {tab === "chat" && (
        <>
          <div className="header">
            <div className="header-title">T<span className="accent-text">Chat</span></div>
            <div className="header-badge">🪙 {coins.toLocaleString()}</div>
          </div>

          {/* Daily banner */}
          <div className="daily-banner" onClick={claimDaily}>
            <div className="daily-info">
              <span style={{ fontSize: 26 }}>🎁</span>
              <div>
                <div className="daily-text">Ежедневный бонус</div>
                <div className="daily-sub">{dailyClaimed ? "Завтра снова" : "+100 T-Coins ждут тебя"}</div>
              </div>
            </div>
            <button className={`daily-claim-btn ${dailyClaimed ? "claimed" : ""}`}>
              {dailyClaimed ? "✓ Получено" : "Забрать"}
            </button>
          </div>

          {/* Chat tabs */}
          <div className="tabs" style={{ marginTop: 12 }}>
            {[["global", "🌐 Школа"], ["class", "📚 Класс"], ["dm", "💬 ЛС"]].map(([id, label]) => (
              <button key={id} className={`tab ${chatTab === id ? "active" : ""}`} onClick={() => setChatTab(id)}>
                {label}
              </button>
            ))}
          </div>

          {/* Anon mode */}
          <div className="anon-selector">
            {[["anon", "👾 Аноним"], ["nick", "🏷 Ник"], ["profile", "⚡ Профиль"]].map(([m, label]) => (
              <button key={m} className={`anon-chip ${anonMode === m ? "selected" : ""}`} onClick={() => setAnonMode(m)}>
                {label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="scroll-area">
            <div className="messages-list">
              {messages.map(msg => (
                <div key={msg.id} className="msg-bubble slide-up">
                  <div className="msg-avatar">{msg.avatar}</div>
                  <div className="msg-content">
                    <div className="msg-meta">
                      <span className={`msg-name ${msg.anon ? "anon" : ""}`}>{msg.user}</span>
                      <span className="msg-time">{msg.time}</span>
                    </div>
                    <div className="msg-text">{msg.text}</div>
                    {msg.reactions.length > 0 && (
                      <div className="msg-reactions">
                        {msg.reactions.map(r => (
                          <div key={r.emoji} className="reaction" onClick={() => addReaction(msg.id, r.emoji)}>
                            {r.emoji} <span className="reaction-count">{r.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="msg-reactions" style={{ marginTop: 4 }}>
                      {["🔥", "😂", "👑", "💀"].map(e => (
                        <div key={e} className="reaction" style={{ opacity: 0.4, fontSize: 11 }}
                          onClick={() => addReaction(msg.id, e)}>
                          {e}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="chat-input-wrap">
            <div className={`anon-toggle ${anonMode === "anon" ? "on" : ""}`} onClick={() => setAnonMode(m => m === "anon" ? "nick" : "anon")}>
              {anonMode === "anon" ? "👾" : "⚡"}
            </div>
            <textarea
              className="chat-input"
              placeholder={anonMode === "anon" ? "Написать анонимно..." : "Написать сообщение..."}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={1}
            />
            <button className="send-btn" onClick={sendMessage}>➤</button>
          </div>
        </>
      )}

      {/* ── CLANS ── */}
      {tab === "clans" && (
        <>
          <div className="header">
            <div className="header-title">⚔️ <span className="accent-text">Кланы</span></div>
            <button style={{ background: "var(--accent)", border: "none", color: "white", borderRadius: 12, padding: "7px 14px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font)", cursor: "pointer" }}>
              + Создать
            </button>
          </div>
          <div className="scroll-area">
            {/* My clan */}
            <div className="section" style={{ paddingTop: 8 }}>
              <div className="section-title">Мой клан</div>
              <div className="clan-card" style={{ "--clan-color": "#a78bfa", background: "rgba(124,92,252,0.08)", borderColor: "rgba(124,92,252,0.25)" }}>
                <div className="clan-icon">⚡</div>
                <div className="clan-info">
                  <div className="clan-name">NEXUS</div>
                  <div className="clan-meta">47 участников • Рейтинг #1</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="clan-rating">9 821</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>очков</div>
                </div>
              </div>
            </div>

            {/* Top clans */}
            <div className="section">
              <div className="section-title">🏆 Топ кланов</div>
              {MOCK_CLANS.map((clan, i) => (
                <div key={clan.id} className="clan-card" style={{ "--clan-color": clan.color }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--muted)", fontFamily: "var(--mono)", width: 20 }}>#{i + 1}</div>
                  <div className="clan-icon">{clan.icon}</div>
                  <div className="clan-info">
                    <div className="clan-name">{clan.name}</div>
                    <div className="clan-meta">{clan.members} участников</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="clan-rating">{clan.rating.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>очков</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clan stats */}
            <div className="section">
              <div className="section-title">📊 Баланс клана NEXUS</div>
              <div className="glass" style={{ padding: 20, margin: "0 0 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Казна клана</div>
                    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--mono)", color: "var(--gold)" }}>🪙 24,500</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Турниры</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--green)" }}>🏆 12</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── DEALS ── */}
      {tab === "deals" && (
        <>
          <div className="header">
            <div className="header-title">🤝 <span className="accent-text">Сделки</span></div>
            <button style={{ background: "var(--accent)", border: "none", color: "white", borderRadius: 12, padding: "7px 14px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font)", cursor: "pointer" }}>
              + Сделка
            </button>
          </div>
          <div className="scroll-area">
            <div className="section" style={{ paddingTop: 8 }}>
              <div className="section-title">Активные сделки</div>
              {MOCK_DEALS.map(deal => (
                <div key={deal.id} className="deal-card slide-up">
                  <div className="deal-header">
                    <div className="deal-users">
                      <span>{deal.from}</span>
                      <span className="deal-arrow">⟷</span>
                      <span>{deal.to}</span>
                    </div>
                    <div className={`deal-status ${deal.status}`}>
                      {deal.status === "active" ? "● Активна" : deal.status === "pending" ? "◌ Ожидание" : "✓ Завершена"}
                    </div>
                  </div>
                  <div className="deal-body">
                    <div className="deal-side">
                      <div className="deal-side-label">Предлагает</div>
                      <div className={`deal-side-value ${deal.offer.includes("T-Coins") ? "deal-coins" : ""}`}>
                        {deal.offer.includes("T-Coins") ? "🪙 " : ""}{deal.offer}
                      </div>
                    </div>
                    <div className="deal-divider">⇄</div>
                    <div className="deal-side">
                      <div className="deal-side-label">Взамен</div>
                      <div className="deal-side-value">{deal.want}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      ⭐ Рейтинг доверия: <span style={{ color: "var(--gold)", fontWeight: 700 }}>{deal.trust}</span>
                    </div>
                    {deal.status === "pending" && (
                      <button style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "var(--green)", borderRadius: 12, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)" }}>
                        Принять
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="section">
              <div className="section-title">Как это работает</div>
              <div className="glass" style={{ padding: 20 }}>
                {[
                  ["1️⃣", "Создай сделку с описанием условий"],
                  ["2️⃣", "Обе стороны подтверждают"],
                  ["3️⃣", "T-Coins замораживаются"],
                  ["4️⃣", "После выполнения — освобождаются"],
                ].map(([num, text]) => (
                  <div key={num} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>{num}</span>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── PROFILE ── */}
      {tab === "profile" && (
        <>
          <div className="header">
            <div className="header-title">👤 <span className="accent-text">Профиль</span></div>
            <div style={{ fontSize: 20, cursor: "pointer" }}>⚙️</div>
          </div>
          <div className="scroll-area">
            {/* Hero */}
            <div className="profile-hero">
              <div className="profile-avatar-wrap pulse">⚡</div>
              <div className="profile-name">k1r4_dev</div>
              <div className="profile-level">Уровень <span>42</span> · Мастер</div>
              <div className="profile-stats">
                <div className="stat">
                  <div className="stat-value coins">🪙 {coins.toLocaleString()}</div>
                  <div className="stat-label">T-Coins</div>
                </div>
                <div className="stat">
                  <div className="stat-value rep">4.9 ⭐</div>
                  <div className="stat-label">Репутация</div>
                </div>
                <div className="stat">
                  <div className="stat-value" style={{ color: "var(--accent)" }}>128</div>
                  <div className="stat-label">Сделок</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ paddingTop: 12 }}>
              {[["stats", "📊 Статы"], ["badges", "🏅 Значки"], ["shop", "🛍 Магазин"]].map(([id, label]) => (
                <button key={id} className={`tab ${profileTab === id ? "active" : ""}`} onClick={() => setProfileTab(id)}>
                  {label}
                </button>
              ))}
            </div>

            {profileTab === "stats" && (
              <div className="section">
                <div className="section-title">Лидерборд</div>
                {LEADERBOARD.map(p => (
                  <div key={p.rank} className={`lb-row ${p.rank === 1 ? "top1" : ""}`}>
                    <div className={`lb-rank ${p.rank === 1 ? "gold" : ""}`}>
                      {p.rank === 1 ? "👑" : `#${p.rank}`}
                    </div>
                    <div className="lb-avatar">{p.badge}</div>
                    <div style={{ flex: 1 }}>
                      <div className="lb-name">{p.name}</div>
                      <div className="lb-level">Ур. {p.level}</div>
                    </div>
                    <div className="lb-coins">🪙 {p.coins.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            {profileTab === "badges" && (
              <div className="section">
                <div className="section-title">Мои значки</div>
                <div className="badges-row">
                  {[["👑", "Клан #1"], ["🏆", "12 побед"], ["🔥", "100 дней"], ["💬", "1000 сообщ."], ["🤝", "Надёжный"], ["⚡", "Быстрый"]].map(([icon, label]) => (
                    <div key={label} className="badge-chip">
                      {icon} {label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTab === "shop" && (
              <div className="shop-grid">
                {[
                  { icon: "🌈", name: "Цвет ника", price: 500 },
                  { icon: "✨", name: "Эффект сообщений", price: 800 },
                  { icon: "🖼", name: "Рамка профиля", price: 1200 },
                  { icon: "💫", name: "Анимация монет", price: 600 },
                  { icon: "🎭", name: "Маска аватара", price: 400 },
                  { icon: "🔮", name: "Статус VIP", price: 2000 },
                ].map(item => (
                  <div key={item.name} className="shop-item">
                    <div className="shop-item-icon">{item.icon}</div>
                    <div className="shop-item-name">{item.name}</div>
                    <div className="shop-item-price">🪙 {item.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── BOTTOM NAV ── */}
      <div className="bottom-nav">
        {[
          ["chat", "💬", "Чат"],
          ["clans", "⚔️", "Кланы"],
          ["deals", "🤝", "Сделки"],
          ["profile", "👤", "Профиль"],
        ].map(([id, icon, label]) => (
          <button key={id} className={`nav-item ${tab === id ? "active" : ""}`} onClick={() => setTab(id)} style={{ position: "relative" }}>
            <span>{icon}</span>
            <span className="nav-label">{label}</span>
            {id === "deals" && <div className="notif-dot" />}
          </button>
        ))}
      </div>
    </div>
  );
}
