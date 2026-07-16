/**
 * PadelStore mark: stylized pala + pelota.
 * `variant="light"` for dark backgrounds (admin sidebar).
 */
export function Logo({ className = "h-8 w-8", variant = "default", showWordmark = true }) {
  const racket = variant === "light" ? "#ffffff" : "#0f3d2e";
  const hole = variant === "light" ? "#214a35" : "#f7f7f5";
  const ball = "#C8E600";

  return (
    <span className="inline-flex items-center gap-2">
      <svg
        className={`shrink-0 ${className}`}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Lime ball peeking behind the pala */}
        <circle cx="16.5" cy="23" r="13" fill={ball} />

        {/* Pala head */}
        <ellipse cx="36" cy="24" rx="16" ry="17.5" fill={racket} />

        {/* Bridge / throat */}
        <path d="M30 40c2 4 4.5 7 6 9 1.5-2 4-5 6-9H30z" fill={racket} />

        {/* Throat window */}
        <path d="M32.5 41.2 36 48.2 39.5 41.2Z" fill={hole} />

        {/* Handle */}
        <rect x="33.2" y="47.5" width="5.6" height="13" rx="2.4" fill={racket} />
        <path
          d="M33.6 51.2h4.8M33.6 54.4h4.8M33.6 57.6h4.8"
          stroke={hole}
          strokeWidth="1.15"
          strokeLinecap="round"
        />

        {/* Honeycomb face */}
        {[
          [30, 13],
          [36, 13],
          [42, 13],
          [27, 18.5],
          [33, 18.5],
          [39, 18.5],
          [45, 18.5],
          [30, 24],
          [36, 24],
          [42, 24],
          [27, 29.5],
          [33, 29.5],
          [39, 29.5],
          [45, 29.5],
          [30, 35],
          [36, 35],
          [42, 35]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.75" fill={hole} />
        ))}
      </svg>
      {showWordmark && (
        <span className={`text-sm font-extrabold tracking-tight ${variant === "light" ? "text-white" : "text-ink"}`}>
          PadelStore
        </span>
      )}
    </span>
  );
}
