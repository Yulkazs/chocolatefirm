import Link from "next/link";

/* ─── Aveline monogram SVG ───────────────────────────────────────────────── */
function AvelineMark() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stylised "A" with flourishes — matches the wireframe monogram */}
      <text
        x="50%"
        y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="68"
        fontWeight="300"
        fill="#BDD2B7"
        letterSpacing="-2"
      >
        𝒜
      </text>
    </svg>
  );
}

export default function WelcomePage() {
  return (
    <div className="mobile-shell">
      {/* ── Brand mark + copy ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Logo mark */}
        <div className="mb-8">
          <AvelineMark />
        </div>

        {/* Headline */}
        <h1
          className="font-display font-semibold leading-tight mb-3"
          style={{ fontSize: "clamp(2rem, 7vw, 2.6rem)", color: "#122A1A" }}
        >
          Welkom bij Avéline
        </h1>

        {/* Tagline */}
        <p
          className="leading-relaxed max-w-xs"
          style={{ fontSize: "clamp(0.875rem, 3.5vw, 1rem)", color: "#5a6e62" }}
        >
          Ontdek de wereld van premium chocolade
        </p>
      </div>

      {/* ── Bottom actions ─────────────────────────────────────────── */}
      <div
        className="flex flex-col px-6 flex-shrink-0"
        style={{ paddingBottom: "clamp(2rem, 8vw, 3.5rem)", gap: "0.875rem" }}
      >
        <Link href="/register" className="btn-primary">
          Account aanmaken
        </Link>

        <Link href="/login" className="btn-secondary">
          Inloggen
        </Link>
      </div>
    </div>
  );
}