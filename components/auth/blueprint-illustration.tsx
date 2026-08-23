export function BlueprintIllustration() {
  return (
    <svg
      viewBox="0 0 420 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full max-w-[380px]"
      aria-label="Architectural blueprint illustration"
    >
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1="20"
          y1={40 + i * 44}
          x2="400"
          y2={40 + i * 44}
          stroke="#0FA8A0"
          strokeOpacity="0.12"
          strokeWidth="0.8"
        />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={20 + i * 42}
          y1="40"
          x2={20 + i * 42}
          y2="480"
          stroke="#0FA8A0"
          strokeOpacity="0.12"
          strokeWidth="0.8"
        />
      ))}

      <rect
        x="50"
        y="60"
        width="320"
        height="220"
        rx="2"
        stroke="#0FA8A0"
        strokeWidth="1.8"
        strokeOpacity="0.9"
      />

      <line x1="170" y1="60" x2="170" y2="280" stroke="#0FA8A0" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="170" y1="160" x2="370" y2="160" stroke="#0FA8A0" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="270" y1="60" x2="270" y2="160" stroke="#0FA8A0" strokeWidth="1.5" strokeOpacity="0.7" />

      <path
        d="M170 110 A30 30 0 0 1 200 110"
        stroke="#0FA8A0"
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeDasharray="2 2"
      />
      <line x1="170" y1="110" x2="200" y2="80" stroke="#0FA8A0" strokeWidth="1" strokeOpacity="0.5" />
      <path
        d="M270 110 A30 30 0 0 0 240 110"
        stroke="#0FA8A0"
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeDasharray="2 2"
      />
      <line x1="270" y1="110" x2="240" y2="80" stroke="#0FA8A0" strokeWidth="1" strokeOpacity="0.5" />

      <line x1="80" y1="60" x2="130" y2="60" stroke="#0FA8A0" strokeWidth="3" strokeOpacity="0.6" />
      <line x1="220" y1="60" x2="260" y2="60" stroke="#0FA8A0" strokeWidth="3" strokeOpacity="0.6" />
      <line x1="300" y1="60" x2="350" y2="60" stroke="#0FA8A0" strokeWidth="3" strokeOpacity="0.6" />
      <line x1="50" y1="100" x2="50" y2="150" stroke="#0FA8A0" strokeWidth="3" strokeOpacity="0.6" />
      <line x1="50" y1="180" x2="50" y2="230" stroke="#0FA8A0" strokeWidth="3" strokeOpacity="0.6" />
      <line x1="370" y1="80" x2="370" y2="130" stroke="#0FA8A0" strokeWidth="3" strokeOpacity="0.6" />

      <line x1="50" y1="300" x2="370" y2="300" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="50" y1="295" x2="50" y2="305" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="370" y1="295" x2="370" y2="305" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.5" />
      <text
        x="210"
        y="316"
        textAnchor="middle"
        fill="#0FA8A0"
        fillOpacity="0.5"
        fontSize="9"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      >
        12 800
      </text>

      <line x1="400" y1="60" x2="400" y2="280" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="395" y1="60" x2="405" y2="60" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="395" y1="280" x2="405" y2="280" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.5" />
      <text
        x="414"
        y="175"
        textAnchor="middle"
        fill="#0FA8A0"
        fillOpacity="0.5"
        fontSize="9"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        transform="rotate(90, 414, 175)"
      >
        8 800
      </text>

      <text
        x="100"
        y="200"
        textAnchor="middle"
        fill="#0FA8A0"
        fillOpacity="0.55"
        fontSize="8.5"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        letterSpacing="0.08em"
      >
        LIVING
      </text>
      <text
        x="270"
        y="118"
        textAnchor="middle"
        fill="#0FA8A0"
        fillOpacity="0.55"
        fontSize="8.5"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        letterSpacing="0.08em"
      >
        BED
      </text>
      <text
        x="270"
        y="228"
        textAnchor="middle"
        fill="#0FA8A0"
        fillOpacity="0.55"
        fontSize="8.5"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        letterSpacing="0.08em"
      >
        KITCHEN
      </text>
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fill="#0FA8A0"
        fillOpacity="0.55"
        fontSize="8.5"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        letterSpacing="0.08em"
      >
        ENTRY
      </text>

      <line x1="40" y1="340" x2="380" y2="340" stroke="#0FA8A0" strokeWidth="1" strokeOpacity="0.35" />
      <rect x="60" y="370" width="80" height="60" rx="1" stroke="#0FA8A0" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
      <rect x="160" y="350" width="100" height="80" rx="1" stroke="#0FA8A0" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
      <rect x="280" y="365" width="70" height="65" rx="1" stroke="#0FA8A0" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
      <rect x="75" y="382" width="20" height="16" rx="1" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
      <rect x="115" y="382" width="15" height="16" rx="1" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
      <rect x="173" y="362" width="30" height="22" rx="1" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
      <rect x="215" y="362" width="30" height="22" rx="1" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
      <line x1="75" y1="390" x2="95" y2="390" stroke="#0FA8A0" strokeWidth="0.6" strokeOpacity="0.3" />
      <line x1="85" y1="382" x2="85" y2="398" stroke="#0FA8A0" strokeWidth="0.6" strokeOpacity="0.3" />

      <circle cx="355" cy="455" r="18" stroke="#0FA8A0" strokeWidth="1" strokeOpacity="0.4" fill="none" />
      <line x1="355" y1="445" x2="355" y2="437" stroke="#0FA8A0" strokeWidth="1.5" strokeOpacity="0.6" />
      <polygon points="355,437 350,447 355,444 360,447" fill="#0FA8A0" fillOpacity="0.5" />
      <text
        x="355"
        y="471"
        textAnchor="middle"
        fill="#0FA8A0"
        fillOpacity="0.5"
        fontSize="8"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      >
        N
      </text>

      <line x1="60" y1="460" x2="160" y2="460" stroke="#0FA8A0" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="60" y1="455" x2="60" y2="465" stroke="#0FA8A0" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="160" y1="455" x2="160" y2="465" stroke="#0FA8A0" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="110" y1="455" x2="110" y2="465" stroke="#0FA8A0" strokeWidth="0.8" strokeOpacity="0.3" />
      <text
        x="110"
        y="476"
        textAnchor="middle"
        fill="#0FA8A0"
        fillOpacity="0.45"
        fontSize="8"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      >
        1 : 100
      </text>

      <path
        d="M180 480 Q190 470 200 480 Q210 470 220 480 Q230 470 240 480 Q240 492 230 492 Q220 500 210 492 Q200 500 190 492 Q180 492 180 480Z"
        stroke="#0FA8A0"
        strokeWidth="0.8"
        strokeOpacity="0.3"
        fill="none"
        strokeDasharray="3 2"
      />
    </svg>
  );
}
