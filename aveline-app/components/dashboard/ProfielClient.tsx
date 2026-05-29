"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Star, QrCode, Users, LogOut, ChevronRight, Check, X } from "lucide-react";

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

type Props = { user: User };

const ROLE_LABELS: Record<string, string> = {
  B2C_CLIENT:       "Klant",
  B2B_CLIENT:       "Zakelijke klant",
  CUSTOMER_SERVICE: "Klantenservice",
  MARKETING:        "Marketing",
  ADMIN:            "Beheerder",
};

function Avatar({ name, size = 64 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-semibold"
      style={{
        width: size,
        height: size,
        background: "#BDD2B7",
        color: "#304C3A",
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

export default function ProfielClient({ user }: Props) {
  const router = useRouter();

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0];

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName,  setLastName]  = useState(user.lastName  ?? "");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
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

  const stats = [
    { label: "Producten gescand", value: user._count.scans          },
    { label: "Community posts",   value: user._count.communityPosts  },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* ── Header bar ───────────────────────────────────────────── */}
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
        {/* ── Identity card ────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: "#f5f8f5" }}
        >
          <Avatar name={fullName} size={60} />

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex flex-col gap-2">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Voornaam"
                  className="input-field py-2 text-sm"
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Achternaam"
                  className="input-field py-2 text-sm"
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                    style={{ background: "#304C3A", opacity: saving ? 0.7 : 1 }}
                  >
                    <Check size={12} /> {saving ? "Opslaan…" : "Opslaan"}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setError(null); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border"
                    style={{ color: "#304C3A", borderColor: "#c8d9c2" }}
                  >
                    <X size={12} /> Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-semibold text-base truncate" style={{ color: "#122A1A" }}>{fullName}</p>
                <p className="text-sm truncate mt-0.5" style={{ color: "#7a8f82" }}>{user.email}</p>
                <span
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1.5"
                  style={{ background: "#e8f0e5", color: "#304C3A" }}
                >
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              </>
            )}
          </div>

          {/* Edit name inline — separate from settings */}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex-shrink-0 p-1.5 rounded-lg text-xs font-medium"
              style={{ background: "#e8f0e5", color: "#304C3A" }}
              aria-label="Naam bewerken"
            >
              Bewerken
            </button>
          )}
        </div>

        {/* ── Points ───────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: "#304C3A" }}
        >
          <div className="flex items-center gap-3">
            <Star size={18} color="#51C675" fill="#51C675" />
            <div>
              <p className="text-xs" style={{ color: "rgba(189,210,183,0.8)" }}>Totaal punten</p>
              <p className="text-xl font-semibold font-display" style={{ color: "#ffffff" }}>{user.points}</p>
            </div>
          </div>
          <ChevronRight size={16} color="#BDD2B7" />
        </div>

        {/* ── Badges ───────────────────────────────────────────────── */}
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Mijn Badges</h2>
          {user._count.badges === 0 ? (
            <div className="rounded-2xl p-5 text-center" style={{ background: "#f5f8f5" }}>
              <p className="text-sm" style={{ color: "#7a8f82" }}>
                Nog geen badges — scan je eerste product om te beginnen!
              </p>
            </div>
          ) : (
            <div className="rounded-2xl p-4" style={{ background: "#f5f8f5" }}>
              <p className="text-sm font-medium" style={{ color: "#304C3A" }}>
                {user._count.badges} badge{user._count.badges !== 1 ? "s" : ""} verdiend
              </p>
            </div>
          )}
        </div>

        {/* ── Statistieken ─────────────────────────────────────────── */}
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Statistieken</h2>
          <div className="flex flex-col gap-2">
            {stats.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
                style={{ background: "#f5f8f5" }}
              >
                <span className="text-sm" style={{ color: "#304C3A" }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color: "#122A1A" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Account info ─────────────────────────────────────────── */}
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: "#122A1A" }}>Account</h2>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#e8ede9" }}>
            <div
              className="flex items-center justify-between px-4 py-3.5 border-b"
              style={{ borderColor: "#e8ede9" }}
            >
              <span className="text-sm" style={{ color: "#304C3A" }}>E-mailadres</span>
              <span className="text-sm" style={{ color: "#7a8f82" }}>{user.email}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm" style={{ color: "#304C3A" }}>Lid sinds</span>
              <span className="text-sm" style={{ color: "#7a8f82" }}>
                {new Date(user.createdAt).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Snelkoppelingen ──────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push("/dashboard/instellingen")}
            className="flex items-center justify-between px-4 py-3.5 rounded-2xl border"
            style={{ borderColor: "#e8ede9" }}
          >
            <span className="text-sm font-medium" style={{ color: "#304C3A" }}>Instellingen</span>
            <ChevronRight size={16} color="#BDD2B7" />
          </button>
          <button
            onClick={() => router.push("/dashboard/notificaties")}
            className="flex items-center justify-between px-4 py-3.5 rounded-2xl border"
            style={{ borderColor: "#e8ede9" }}
          >
            <span className="text-sm font-medium" style={{ color: "#304C3A" }}>Notificaties</span>
            <ChevronRight size={16} color="#BDD2B7" />
          </button>
        </div>

        {/* ── Uitloggen ────────────────────────────────────────────── */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border font-medium text-sm"
          style={{ color: "#dc2626", borderColor: "#fecaca", background: "#fff5f5" }}
        >
          <LogOut size={16} />
          Uitloggen
        </button>
      </div>
    </div>
  );
}