"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings, Star, QrCode, Users, LogOut,
  ChevronRight, Check, X, Lock,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  points: number;
  createdAt: Date;
  _count: { scans: number; communityPosts: number; badges: number };
};

type EarnedBadge = {
  id: string;
  earnedAt: string;
  badge: {
    id: string;
    type: string;
    name: string;
    description: string;
  };
};

type Props = { user: User };

/* ─── Constants ─────────────────────────────────────────────────────────── */
const ROLE_LABELS: Record<string, string> = {
  B2C_CLIENT:       "Klant",
  B2B_CLIENT:       "Zakelijke klant",
  CUSTOMER_SERVICE: "Klantenservice",
  MARKETING:        "Marketing",
  ADMIN:            "Beheerder",
};

// All possible badges — shown as locked when not yet earned
const ALL_BADGES: Array<{ type: string; name: string; description: string; emoji: string }> = [
  { type: "FIRST_SCAN",       name: "Eerste scan",       description: "Je eerste product gescand",           emoji: "🔍" },
  { type: "FIRST_COMPLAINT",  name: "Eerste klacht",     description: "Je eerste klacht ingediend",          emoji: "📋" },
  { type: "FIRST_POST",       name: "Community starter", description: "Je eerste community bericht",         emoji: "💬" },
  { type: "PRODUCT_EXPLORER", name: "Product explorer",  description: "10 producten gescand",                emoji: "🏆" },
  { type: "COMMUNITY_STAR",   name: "Community ster",    description: "5 berichten in de community",         emoji: "⭐" },
  { type: "LOYAL_CUSTOMER",   name: "Trouwe klant",      description: "Account meer dan 30 dagen actief",    emoji: "🤝" },
];

/* ─── Avatar ─────────────────────────────────────────────────────────────── */
function Avatar({ name, size = 60 }: { name: string; size?: number }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-semibold"
      style={{ width: size, height: size, background: "#BDD2B7", color: "#304C3A", fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

/* ─── Badge tile ─────────────────────────────────────────────────────────── */
function BadgeTile({ type, name, description, emoji, earned, earnedAt }: {
  type: string; name: string; description: string; emoji: string;
  earned: boolean; earnedAt?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <button
      onClick={() => setShowTooltip((s) => !s)}
      className="relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95"
      style={{ background: earned ? "#EFF5EE" : "#f5f5f5" }}
    >
      {/* Emoji or locked */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: earned ? "#304C3A" : "#e0e0e0", opacity: earned ? 1 : 0.6 }}
      >
        {earned ? (
          <span>{emoji}</span>
        ) : (
          <Lock size={18} color="#aaaaaa" strokeWidth={1.75} />
        )}
      </div>

      <span
        className="text-[10px] font-medium text-center leading-tight"
        style={{ color: earned ? "#304C3A" : "#aaaaaa" }}
      >
        {name}
      </span>

      {/* Tooltip on tap */}
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-44 rounded-xl p-3 text-left shadow-lg"
          style={{ background: "#122A1A", color: "#ffffff" }}
        >
          <p className="text-xs font-semibold mb-0.5">{name}</p>
          <p className="text-[10px] opacity-75 leading-snug">{description}</p>
          {earned && earnedAt && (
            <p className="text-[10px] mt-1.5 opacity-50">
              Verdiend op {new Date(earnedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
          {!earned && (
            <p className="text-[10px] mt-1.5 opacity-50">Nog niet verdiend</p>
          )}
          {/* Arrow */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2"
            style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #122A1A" }}
          />
        </div>
      )}
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ProfielClient({ user }: Props) {
  const router = useRouter();

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0];

  const [editing,   setEditing]   = useState(false);
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName,  setLastName]  = useState(user.lastName  ?? "");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);

  // Load real badges from API
  useEffect(() => {
    fetch("/api/user/badges")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setEarnedBadges(data))
      .catch(() => {})
      .finally(() => setBadgesLoading(false));
  }, []);

  const earnedTypes = new Set(earnedBadges.map((ub) => ub.badge.type));
  const earnedCount = earnedBadges.length;

  async function handleSave() {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Opslaan mislukt.");
      } else {
        setEditing(false);
        router.refresh();
      }
    } catch {
      setError("Er ging iets mis. Controleer je verbinding.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 pt-14 pb-4">
        <h1 className="font-display text-2xl font-semibold" style={{ color: "#122A1A" }}>Profiel</h1>
        <button
          onClick={() => router.push("/dashboard/instellingen")}
          className="p-2 rounded-full"
          style={{ background: "#f5f8f5" }}
          aria-label="Instellingen"
        >
          <Settings size={20} color="#304C3A" />
        </button>
      </div>

      <div className="px-5 pb-8 flex flex-col gap-6">

        {/* ── Identity card ──────────────────────────────────────── */}
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#f5f8f5" }}>
          <Avatar name={fullName} size={60} />
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex flex-col gap-2">
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Voornaam" className="input-field py-2 text-sm" />
                <input value={lastName}  onChange={(e) => setLastName(e.target.value)}  placeholder="Achternaam" className="input-field py-2 text-sm" />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex gap-2 mt-1">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ background: "#304C3A", opacity: saving ? 0.7 : 1 }}>
                    <Check size={12} /> {saving ? "Opslaan…" : "Opslaan"}
                  </button>
                  <button onClick={() => { setEditing(false); setError(null); }} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border" style={{ color: "#304C3A", borderColor: "#c8d9c2" }}>
                    <X size={12} /> Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-semibold text-base truncate" style={{ color: "#122A1A" }}>{fullName}</p>
                <p className="text-sm truncate mt-0.5" style={{ color: "#7a8f82" }}>{user.email}</p>
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1.5" style={{ background: "#e8f0e5", color: "#304C3A" }}>
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </>
            )}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#e8f0e5", color: "#304C3A" }}>
              Bewerken
            </button>
          )}
        </div>

        {/* ── Points banner ──────────────────────────────────────── */}
        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: "#304C3A" }}>
          <div className="flex items-center gap-3">
            <Star size={18} color="#51C675" fill="#51C675" />
            <div>
              <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Totaal punten</p>
              <p className="text-2xl font-semibold font-display" style={{ color: "#ffffff" }}>{user.points}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Badges</p>
            <p className="text-2xl font-semibold font-display" style={{ color: "#BDD2B7" }}>
              {earnedCount}<span className="text-sm">/{ALL_BADGES.length}</span>
            </p>
          </div>
        </div>

        {/* ── Badges grid ────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-base" style={{ color: "#122A1A" }}>Mijn Badges</h2>
            {earnedCount > 0 && (
              <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: "#EFF5EE", color: "#304C3A" }}>
                {earnedCount} verdiend
              </span>
            )}
          </div>

          {badgesLoading ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: "#f5f8f5" }}>
              <p className="text-sm" style={{ color: "#9aada2" }}>Badges laden…</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {ALL_BADGES.map((b) => {
                const earned = earnedTypes.has(b.type);
                const earnedBadge = earnedBadges.find((ub) => ub.badge.type === b.type);
                return (
                  <BadgeTile
                    key={b.type}
                    type={b.type}
                    name={b.name}
                    description={b.description}
                    emoji={b.emoji}
                    earned={earned}
                    earnedAt={earnedBadge?.earnedAt}
                  />
                );
              })}
            </div>
          )}

          {!badgesLoading && earnedCount === 0 && (
            <p className="text-xs text-center mt-3" style={{ color: "#9aada2" }}>
              Scan je eerste product om je eerste badge te verdienen!
            </p>
          )}
        </div>

        {/* ── Statistieken ───────────────────────────────────────── */}
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Statistieken</h2>
          <div className="flex flex-col gap-2">
            {[
              { label: "Producten gescand", value: user._count.scans,          icon: QrCode },
              { label: "Community posts",   value: user._count.communityPosts,  icon: Users  },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: "#f5f8f5" }}>
                <Icon size={16} color="#304C3A" strokeWidth={1.75} />
                <span className="text-sm flex-1" style={{ color: "#304C3A" }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color: "#122A1A" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Account ────────────────────────────────────────────── */}
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Account</h2>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#e8ede9" }}>
            <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: "#e8ede9" }}>
              <span className="text-sm" style={{ color: "#304C3A" }}>E-mailadres</span>
              <span className="text-sm truncate max-w-[55%] text-right" style={{ color: "#7a8f82" }}>{user.email}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm" style={{ color: "#304C3A" }}>Lid sinds</span>
              <span className="text-sm" style={{ color: "#7a8f82" }}>
                {new Date(user.createdAt).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Snelkoppelingen ────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          {[
            { label: "Instellingen",  href: "/dashboard/instellingen" },
            { label: "Notificaties",  href: "/dashboard/notificaties" },
          ].map(({ label, href }) => (
            <button key={href} onClick={() => router.push(href)} className="flex items-center justify-between px-4 py-3.5 rounded-2xl border" style={{ borderColor: "#e8ede9" }}>
              <span className="text-sm font-medium" style={{ color: "#304C3A" }}>{label}</span>
              <ChevronRight size={16} color="#BDD2B7" />
            </button>
          ))}
        </div>

        {/* ── Uitloggen ──────────────────────────────────────────── */}
        <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border font-medium text-sm" style={{ color: "#dc2626", borderColor: "#fecaca", background: "#fff5f5" }}>
          <LogOut size={16} />
          Uitloggen
        </button>
      </div>
    </div>
  );
}