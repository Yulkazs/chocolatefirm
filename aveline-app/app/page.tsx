"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { QrCode, BookOpen, Leaf, MapPin, ChevronRight } from "lucide-react";

/* ─── Slide data ─────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    icon: QrCode,
    title: "Scan je chocolade",
    body: "Registreer producten via QR-code en ontdek herkomst, ingrediënten en certificeringen van elke reep.",
    bg: "#EFF5EE",
    iconColor: "#304C3A",
  },
  {
    icon: BookOpen,
    title: "Recepten & inspiratie",
    body: "Bekijk recepten, video-tutorials en ontdek nieuwe smaken — voor thuis en in de keuken.",
    bg: "#E8F2E8",
    iconColor: "#304C3A",
  },
  {
    icon: Leaf,
    title: "Duurzaam & transparant",
    body: "Inzicht in Fairtrade-certificeringen, cacaopercentage en de herkomst van elke reep.",
    bg: "#EFF5EE",
    iconColor: "#304C3A",
  },
  {
    icon: MapPin,
    title: "Winkels & evenementen",
    body: "Ontdek verkooppunten, marktkramen en chocoladeworkshops bij jou in de buurt via geolocatie.",
    bg: "#E8F2E8",
    iconColor: "#304C3A",
  },
] as const;

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const isLast = current === SLIDES.length - 1;

  function goTo(index: number) {
    if (animating || index === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 200);
  }

  function next() {
    if (animating) return;
    if (isLast) { router.push("/login"); return; }
    goTo(current + 1);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) next();
    if (diff < -50 && current > 0) goTo(current - 1);
    touchStartX.current = null;
  }

  const slide = SLIDES[current];
  const Icon  = slide.icon;

  return (
    <div className="mobile-shell">
      {/* Skip */}
      <div className="flex justify-end px-6 pt-14">
        <button
          onClick={() => router.push("/login")}
          className="btn-ghost text-sm font-medium"
          style={{ color: "#7a8f82" }}
        >
          Overslaan
        </button>
      </div>

      {/* Slide content */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 text-center select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ opacity: animating ? 0 : 1, transition: "opacity 200ms ease" }}
      >
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center mb-10"
          style={{ backgroundColor: slide.bg }}
        >
          <Icon size={60} strokeWidth={1.25} style={{ color: slide.iconColor }} />
        </div>

        <h2
          className="font-display text-[2.1rem] leading-snug font-semibold mb-4"
          style={{ color: "#122A1A" }}
        >
          {slide.title}
        </h2>

        <p
          className="text-[0.9375rem] leading-relaxed max-w-xs"
          style={{ color: "#5a6e62" }}
        >
          {slide.body}
        </p>
      </div>

      {/* Bottom nav */}
      <div className="px-6 pb-12 flex flex-col items-center gap-6">
        {/* Dots */}
        <div className="flex gap-2" role="tablist" aria-label="Stap indicator">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === current ? "24px" : "8px",
                height:     "8px",
                background: i === current ? "#304C3A" : "#BDD2B7",
              }}
            />
          ))}
        </div>

        <button onClick={next} className="btn-primary flex items-center gap-2">
          {isLast ? (
            "Aan de slag"
          ) : (
            <>
              Volgende
              <ChevronRight size={18} strokeWidth={2} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}