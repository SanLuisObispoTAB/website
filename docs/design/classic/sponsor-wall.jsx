// Real SLOTAB sponsor logos — keyed by tier.
// Logos pulled from the live preview site and stored in /assets/sponsors/<tier>/.

const SLOTAB_SPONSORS = {
  platinum: [
    { name: 'FiveO Coast', file: 'FiveO_Coast_HorizontalBanner-pdf.jpg' },
    { name: 'Golf and Event Center', file: 'Golf-and-Event-Center.png' },
    { name: 'SLOTAB Banner Sponsor', file: 'SLOTAB-banner-1-pdf.jpg' },
  ],
  gold: [
    { name: 'Cool Cats', file: 'Cool-cats.jpeg' },
    { name: 'ID', file: 'ID-Banner-2-pdf.jpg' },
    { name: 'Engle', file: 'Logo-Engle-grey.png' },
    { name: 'Mr. Pickles', file: 'Mr.Pickles-Banner.jpeg' },
    { name: 'Poor Richards', file: 'Poor-Richards-Banner.png' },
    { name: 'Prime', file: 'Prime-Logo-2-pdf.jpg' },
    { name: 'Quaglino', file: 'Quaglino-Banner.png' },
    { name: 'Red Tail Bikes', file: 'Red_Tail_Bikes-1-pdf.jpg' },
    { name: 'Respect Athletics', file: 'Respect-Athletics-pdf.jpg' },
    { name: 'Tim Riley House & Number', file: 'Tim-Riley-House-and-Number-Logo.jpg' },
    { name: 'Banc of California', file: 'banc-of-california.jpeg' },
    { name: 'Cannon', file: 'cannon.png' },
    { name: 'Ernie Ball', file: 'ernie-ball.png' },
    { name: 'Obispo', file: 'obispo-logo-white.png', dark: true },
  ],
  silver: [
    { name: 'Bravo', file: 'Bravo-Banner.jpeg' },
    { name: 'Central Coast Pediatrics', file: 'Central-Coast-Pediatrics-Logo.png' },
    { name: 'Field Day', file: 'Field_Day-pdf.jpg' },
    { name: 'Hufton', file: 'HuftonHeaderLogo.png.webp' },
    { name: 'Jeremy Engle', file: 'Jeremy-Engle-Banner.jpeg' },
    { name: 'Moody', file: 'Moody-Banner.png' },
    { name: 'Moondoggies', file: 'Moondoggies-Banner.jpg' },
    { name: 'TE', file: 'TE-logo-1x.png' },
    { name: 'Adventist Health', file: 'adventist-health-ah-global-pdf.jpg' },
    { name: 'Central CA School', file: 'central-ca-school-of-continuing-education.png' },
    { name: 'Certified Auto', file: 'certified-auto-repair-car-logo-200x92-1.webp' },
    { name: 'General Atomics', file: 'general-atomics-logo-blue-background.png' },
    { name: 'Gillett Law', file: 'gillettlaw-logo.webp' },
    { name: 'Kramer Events', file: 'kramer-events.png' },
    { name: 'Mercedes', file: 'mercedes-blk-pdf.jpg' },
    { name: 'Primary Eyecare', file: 'primary-eyecare-center-logotop.png' },
  ],
  bronze: [
    { name: 'Angle', file: 'Angle-logo-full-blue-1-e1535999704455.png' },
    { name: 'April Dean', file: 'AprilDean4x6-pdf.jpg' },
    { name: 'Designing Spaces That Sell', file: 'Designing-spaces-that-sell-2-pdf.jpg' },
    { name: 'Hinson', file: 'Hinson-Logo-2-1-pdf.jpg' },
    { name: 'MG', file: 'MG_Logo_Blue_Text_transparent.png' },
    { name: 'SDG', file: 'SDG-logo-reduced.png' },
    { name: 'Stomp Interactive', file: 'StompInteractive-Logo-340-156-300x138-1.jpg' },
    { name: 'Thomson Fiduciary', file: 'Thomson-Fiduciary-Bus-Card-1-pdf.jpg' },
    { name: 'Yoga Movement', file: 'YOGA-MOVEMENT-1-1.png' },
    { name: 'Beta', file: 'beta_logo_black_text-01-smaller_1696629097__65206.original.jpg' },
    { name: 'NT', file: 'cropped-NT_website_logo_2025.jpg.webp' },
    { name: 'Energy Wise Realty', file: 'energy-wise-realty.png' },
    { name: 'JEBL Engineering', file: 'jebl-engineering-Secondary-Logo-2-Ocean.jpeg' },
    { name: 'MAS', file: 'maslogo_horizontal_141121.png.webp' },
    { name: 'Slocum', file: 'slocum.png' },
    { name: 'Untamed Petal', file: 'untamed-petal.png' },
    { name: 'Urology Associates', file: 'urology-cropped-UACC_Logo_121816__2_-removebg-preview.png.webp' },
  ],
};

// A single tile that frames a logo. Renders the logo on a card with white-ish padding so
// dark and light marks both read on either light or dark backgrounds.
function SponsorTile({ tier, sponsor, height = 120, onDark = false }) {
  // Some logos are designed for dark backgrounds (white-on-transparent). Detect those
  // and render them on a black panel instead.
  const wantsDark = sponsor.dark === true;
  const bg = wantsDark ? '#0a0a0a' : '#ffffff';
  return (
    <div
      title={sponsor.name}
      style={{
        background: bg,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 18px',
        boxSizing: 'border-box',
        transition: 'transform .25s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <img
        src={`assets/sponsors/${tier}/${sponsor.file}`}
        alt={sponsor.name}
        style={{
          maxHeight: '100%',
          maxWidth: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
        loading="lazy"
      />
    </div>
  );
}

// Tier row — eyebrow + grid of logo tiles.
function SponsorTier({ tier, label, columns, sponsors, height, onDark, accentColor }) {
  const accent = accentColor || (onDark ? '#f5b800' : '#0a0a0a');
  const dividerColor = onDark ? '#2a2a2a' : '#e8e1cf';
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <span className="mono" style={{
          fontSize: 11, color: accent, letterSpacing: '0.18em',
          textTransform: 'uppercase', fontWeight: 700,
        }}>— {label}</span>
        <span className="mono" style={{
          fontSize: 11, color: onDark ? '#76736b' : '#76736b', letterSpacing: '0.14em',
        }}>{sponsors.length}</span>
        <div style={{ flex: 1, height: 1, background: dividerColor }}/>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 1,
        background: dividerColor,
        border: `1px solid ${dividerColor}`,
      }}>
        {sponsors.map((s, i) => (
          <SponsorTile key={i} tier={tier} sponsor={s} height={height} onDark={onDark}/>
        ))}
      </div>
    </div>
  );
}

// The full sponsor wall — used on the membership page.
// `compact` shows only Platinum + Gold (for homepages), `full` shows all four tiers.
function SponsorWall({ mode = 'full', onDark = false }) {
  const tiers = mode === 'compact'
    ? [
        { key: 'platinum', label: 'Platinum', columns: 3, height: 140 },
        { key: 'gold', label: 'Gold', columns: 7, height: 96 },
      ]
    : [
        { key: 'platinum', label: 'Platinum', columns: 3, height: 160 },
        { key: 'gold', label: 'Gold', columns: 7, height: 110 },
        { key: 'silver', label: 'Silver', columns: 8, height: 92 },
        { key: 'bronze', label: 'Bronze', columns: 9, height: 76 },
      ];
  return (
    <div>
      {tiers.map((t) => (
        <SponsorTier
          key={t.key}
          tier={t.key}
          label={t.label}
          columns={t.columns}
          height={t.height}
          sponsors={SLOTAB_SPONSORS[t.key]}
          onDark={onDark}
        />
      ))}
    </div>
  );
}

Object.assign(window, { SLOTAB_SPONSORS, SponsorTile, SponsorTier, SponsorWall });
