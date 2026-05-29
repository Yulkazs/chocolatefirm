"use client";

import { useRouter } from "next/navigation";
import {
  QrCode,
  BookOpen,
  MapPin,
  ShoppingBag,
  MessageCircle,
  Bell,
  Users,
  ChevronRight,
  LogOut,
  Star,
} from "lucide-react";
import type { UserRole } from "./BottomNav";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Props = { userId: string; email: string; role: string };

/* ─── Greeting helper ────────────────────────────────────────────────────── */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

/* ─── Quick-action tiles (B2C only on home) ─────────────────────────────── */
const ACTIONS = [
  { icon: QrCode,        label: "Scan product",  href: "/dashboard/scan",      bg: "#EFF5EE" },
  { icon: BookOpen,      label: "Recepten",      href: "/dashboard/content",   bg: "#E8F2E8" },
  { icon: ShoppingBag,   label: "Bestellen",     href: "/dashboard/orders",    bg: "#EFF5EE" },
  { icon: MapPin,        label: "Winkels",       href: "/dashboard/winkel",    bg: "#E8F2E8" },
  { icon: MessageCircle, label: "Support",       href: "/dashboard/chat",      bg: "#EFF5EE" },
  { icon: Users,         label: "Community",     href: "/dashboard/community", bg: "#E8F2E8" },
] as const;

/* ─── Mock recent products ───────────────────────────────────────────────── */
const RECENT = [
  { name: "Pure Madagascar 72%", cert: "Fairtrade",   color: "#304C3A" },
  { name: "Melk Hazelnoot",      cert: "Rainforest",  color: "#51C675" },
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function DashboardClient({ email, role }: Props) {
  const router = useRouter();

  // Derive display name from email until we pass firstName from DB
  const firstName = email.split("@")[0].split(".")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const isB2C = role === "B2C_CLIENT";

  return (
    /* No mobile-shell here — the layout wraps it */
    <div className="flex flex-col h-full">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-6 pt-14 pb-5"
        style={{ background: "linear-gradient(160deg, #1e3d2c 0%, #304C3A 100%)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <span
            className="font-display text-2xl font-semibold"
            style={{ color: "#BDD2B7", letterSpacing: "0.04em" }}
          >
            Avéline
          </span>

          <div className="flex items-center gap-3">
            <button
              className="relative p-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.10)" }}
              aria-label="Notificaties"
            >
              <Bell size={18} color="#BDD2B7" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "#51C675" }}
              />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.10)" }}
              aria-label="Uitloggen"
            >
              <LogOut size={18} color="#BDD2B7" />
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm mb-0.5" style={{ color: "rgba(189,210,183,0.7)" }}>
            {greeting()},
          </p>
          <h1 className="font-display text-3xl font-semibold" style={{ color: "#ffffff" }}>
            {displayName} 👋
          </h1>
        </div>

        <div
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <Star size={14} color="#51C675" fill="#51C675" />
          <span className="text-sm font-medium" style={{ color: "#BDD2B7" }}>0 punten</span>
          <ChevronRight size={14} color="#BDD2B7" />
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 flex flex-col gap-8">

          {/* Quick actions — only for B2C */}
          {isB2C && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#7a8f82" }}>
                Snelle acties
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {ACTIONS.map(({ icon: Icon, label, href, bg }) => (
                  <button
                    key={label}
                    onClick={() => router.push(href)}
                    className="flex flex-col items-center gap-2 rounded-2xl py-4 px-2 transition-all active:scale-95"
                    style={{ background: bg }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(48,76,58,0.12)" }}
                    >
                      <Icon size={20} color="#304C3A" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight" style={{ color: "#304C3A" }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Scan CTA banner */}
          <button
            onClick={() => router.push("/dashboard/scan")}
            className="w-full rounded-2xl p-5 text-left flex items-center justify-between active:scale-[0.99] transition-transform"
            style={{ background: "linear-gradient(135deg, #304C3A 0%, #1e3d2c 100%)" }}
          >
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "#BDD2B7" }}>Nieuw product?</p>
              <p className="font-display text-xl font-semibold" style={{ color: "#ffffff" }}>
                Scan de QR-code
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(189,210,183,0.7)" }}>
                Ontdek herkomst & certificeringen
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <QrCode size={28} color="#51C675" strokeWidth={1.5} />
            </div>
          </button>

          {/* Recente scans */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#7a8f82" }}>
                Recente scans
              </h2>
              <button className="text-xs font-medium" style={{ color: "#304C3A" }}>
                Alles zien
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {RECENT.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-4 rounded-2xl p-4"
                  style={{ background: "#f5f8f5" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: p.color }}
                  >
                    <span className="text-base">🍫</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#122A1A" }}>{p.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#7a8f82" }}>{p.cert}</p>
                  </div>
                  <ChevronRight size={16} color="#BDD2B7" />
                </div>
              ))}
            </div>
          </section>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}