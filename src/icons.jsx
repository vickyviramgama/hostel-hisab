// HostelKhata — Custom SVG Icon System

export function IconDashboard({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconTeam({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke={color} strokeWidth="1.5"/>
      <path d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="17" cy="8" r="2.5" stroke={color} strokeWidth="1.5"/>
      <path d="M21 20c0-2.761-1.79-5.12-4.5-5.82" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLedger({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M8 8h8M8 12h8M8 16h5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconReports({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 17l4-5 4 2 4-6 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 20h18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconAdvance({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5"/>
      <path d="M12 16V8M9 11l3-3 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconExpense({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5"/>
      <path d="M12 8v8M15 13l-3 3-3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconPlus({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconClose({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function IconArrowRight({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M7 5l5 5-5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconCheck({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 10l4.5 4.5L16 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconWallet({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M2 10h20" stroke={color} strokeWidth="1.5"/>
      <circle cx="17" cy="15" r="1.5" fill={color}/>
      <path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

export function IconLeaf({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M13 3C13 3 10 2 7 4.5S3 10 4 13c0 0 3-1 5-3.5S14 5 13 3z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M4 13l4-4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconBag({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="6" width="12" height="8" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <path d="M5 6V4.5a3 3 0 016 0V6" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconDrop({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2L4.5 7.5A4 4 0 008 14a4 4 0 003.5-6.5L8 2z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconSparkle({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2M4 4l1.5 1.5M10.5 10.5L12 12M12 4l-1.5 1.5M5.5 10.5L4 12" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="2" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

export function IconFlame({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 14c-3 0-5-2.5-4-5.5C5 6 6 5 5 3c2 1 3 2.5 2.5 4C9.5 5.5 10 4 10 3c2.5 2 3.5 5 1.5 7.5C11 12 10 14 8 14z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconWrench({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M10.5 3A3 3 0 007 6l-4.5 4.5a1.5 1.5 0 002 2L9 8a3 3 0 003.5-4l-1.5 1.5-1-1 1.5-1.5z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconDots({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="8" r="1.5" fill={color}/>
      <circle cx="8" cy="8" r="1.5" fill={color}/>
      <circle cx="12" cy="8" r="1.5" fill={color}/>
    </svg>
  );
}

export function IconClock({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.2"/>
      <path d="M8 5v3.5l2 1.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconFilter({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M6 10h8M9 15h2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconSearch({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="5.5" stroke={color} strokeWidth="1.5"/>
      <path d="M16 16l-2.5-2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function IconBell({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 10a6 6 0 1112 0c0 3.5 1 5 2 6H4c1-1 2-2.5 2-6z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 18a2 2 0 004 0" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconChevronDown({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M5 8l5 5 5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconReturn({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M15 5H7a3 3 0 000 6h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13 13l2-2-2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconActivity({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 12h3l3-7 4 14 3-9 2 2h3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── New icons ───────────────────────────────────────────────────────

export function IconStar({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2l2.4 5 5.6.8-4 3.9 1 5.5L10 14.5l-5 2.7 1-5.5L2 7.8l5.6-.8L10 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconShield({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2l6 2.5V10c0 3.5-2.5 6.5-6 8-3.5-1.5-6-4.5-6-8V4.5L10 2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 10l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconHardhat({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 13h14v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 4a6 6 0 016 6H4a6 6 0 016-6z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 4V2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconTrash({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 6h14M8 6V4h4v2M6 6l1 11h6l1-11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconEdit({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M13 3l4 4-9 9H4v-4l9-9z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 5l4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconWarning({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 3L2 17h16L10 3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 9v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="10" cy="15" r="0.8" fill={color}/>
    </svg>
  );
}

export function IconBuilding({ size = 48, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="8" y="10" width="32" height="34" rx="2" stroke={color} strokeWidth="2"/>
      <path d="M16 44V32h8v12M24 10V6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <rect x="13" y="17" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="23" y="17" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="30" y="17" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="13" y="26" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="30" y="26" width="5" height="5" rx="1" stroke={color} strokeWidth="1.5"/>
      <path d="M20 6h8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconInbox({ size = 40, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="4" y="8" width="32" height="24" rx="3" stroke={color} strokeWidth="1.5"/>
      <path d="M4 24h10l3 4h6l3-4h10" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 16h12M14 20h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconBox({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M2 5l6 3 6-3M8 8v5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCalendar({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <path d="M5 2v2M11 2v2M2 7h12" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="5.5" cy="10.5" r="1" fill={color}/>
      <circle cx="8" cy="10.5" r="1" fill={color}/>
      <circle cx="10.5" cy="10.5" r="1" fill={color}/>
    </svg>
  );
}

export function IconUser({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.5" stroke={color} strokeWidth="1.5"/>
      <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCart({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M2 3h2l2.5 9h8l2-6H6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="16" r="1.5" stroke={color} strokeWidth="1.2"/>
      <circle cx="14" cy="16" r="1.5" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

export function IconDownload({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 3v10M6 9l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 15v1a1 1 0 001 1h12a1 1 0 001-1v-1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCelebrate({ size = 40, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M8 32L18 10l12 12L8 32z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M18 10l4-6M30 22l6-2M18 10l6 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="28" cy="10" r="2" stroke={color} strokeWidth="1.2"/>
      <circle cx="12" cy="14" r="1.5" fill={color}/>
    </svg>
  );
}

export function IconClipboard({ size = 40, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="8" y="10" width="24" height="26" rx="3" stroke={color} strokeWidth="1.5"/>
      <path d="M15 10V8a1 1 0 011-1h8a1 1 0 011 1v2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 20h12M14 26h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconElectric({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M9 2L4 9h5l-2 5 7-8H9l2-4z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconTransport({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="5" width="12" height="7" rx="2" stroke={color} strokeWidth="1.2"/>
      <path d="M5 12v1.5M11 12v1.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="5" cy="9" r="1" fill={color}/>
      <circle cx="11" cy="9" r="1" fill={color}/>
      <path d="M2 8h12" stroke={color} strokeWidth="1.2"/>
      <path d="M5 5V3.5a1 1 0 011-1h4a1 1 0 011 1V5" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

export function IconMedical({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke={color} strokeWidth="1.2"/>
      <path d="M8 5v6M5 8h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconMoney({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5"/>
      <path d="M10 6v1.5M10 12.5V14M7.5 8.5C7.5 7.67 8.17 7 9 7h2a1.5 1.5 0 010 3H9a1.5 1.5 0 000 3h2c.83 0 1.5-.67 1.5-1.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Category icon resolver (matches CATEGORIES in data.js) ──────────
export function CategoryIcon({ id, size = 16, color }) {
  const map = {
    food:      IconLeaf,
    grocery:   IconBag,
    cleaning:  IconSparkle,
    electric:  IconElectric,
    repair:    IconWrench,
    transport: IconTransport,
    medical:   IconMedical,
    other:     IconBox,
    // legacy aliases
    dairy:     IconDrop,
    fuel:      IconFlame,
    veg:       IconLeaf,
  };
  const Component = map[id] || IconBox;
  return <Component size={size} color={color} />;
}
