// SLOTAB Design System — Classic Collegiate
// Source Serif 4 display + Manrope UI + JetBrains Mono accents
// Orange (#f26b21) + Black (#0d0d0d) on warm cream (#faf6ee)

const TIGER = {
  // Brand — SLOHS Black & Gold (per @slohsblackandgold)
  orange: '#f5b800',     // primary gold (kept var name for compat)
  orangeDeep: '#c89400', // deeper gold for hover/pressed
  orangeLight: '#ffd34d',
  gold: '#f5b800',
  goldDeep: '#c89400',
  black: '#0a0a0a',
  ink: '#161616',
  // Neutrals — warm cream system that complements black + gold
  cream: '#fbf7ec',
  paper: '#f3ecda',
  bone: '#e9e0c8',
  charcoal: '#1f1f1f',
  graphite: '#454340',
  pewter: '#76736b',
  silver: '#b3ada0',
};

// CSS injected once. Provides fonts, base resets, and tokenized vars.
function GlobalStyles({ dark = false }) {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..900;1,8..60,300..900&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Manrope', -apple-system, system-ui, sans-serif;
      color: var(--ink);
      background: var(--bg);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    .ds-root {
      --orange: ${TIGER.orange};
      --orange-deep: ${TIGER.orangeDeep};
      --orange-light: ${TIGER.orangeLight};
      --black: ${TIGER.black};
      --ink: ${dark ? '#f3ede0' : TIGER.ink};
      --bg: ${dark ? '#15140f' : TIGER.cream};
      --paper: ${dark ? '#1f1d17' : TIGER.paper};
      --bone: ${dark ? '#2a2820' : TIGER.bone};
      --charcoal: ${dark ? '#d6d1c5' : TIGER.charcoal};
      --graphite: ${dark ? '#a8a399' : TIGER.graphite};
      --pewter: ${dark ? '#7a7770' : TIGER.pewter};
      --silver: ${dark ? '#3a3830' : TIGER.silver};
      --gold: ${TIGER.gold};
      --serif: 'Source Serif 4', Georgia, serif;
      --sans: 'Manrope', -apple-system, system-ui, sans-serif;
      --mono: 'JetBrains Mono', ui-monospace, monospace;
      color: var(--ink);
      background: var(--bg);
    }
    .serif { font-family: var(--serif); font-optical-sizing: auto; }
    .mono { font-family: var(--mono); }
    .display {
      font-family: var(--serif);
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 0.95;
      text-wrap: balance;
    }
    .eyebrow {
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--orange);
    }
    .label {
      font-family: var(--sans);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; cursor: pointer; }
    img { display: block; max-width: 100%; }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 14px 24px;
      font-family: var(--sans); font-size: 13px; font-weight: 700;
      letter-spacing: 0.08em; text-transform: uppercase;
      border: none; border-radius: 0;
      transition: transform .15s ease, background .2s ease, color .2s ease;
      cursor: pointer; text-decoration: none;
    }
    .btn:hover { transform: translateY(-1px); }
    .btn-primary { background: var(--orange); color: white; }
    .btn-primary:hover { background: var(--orange-deep); }
    .btn-dark { background: var(--black); color: var(--gold); }
    .btn-dark:hover { background: var(--gold); color: var(--black); }
    .btn-ghost { background: transparent; color: var(--ink); border: 1.5px solid currentColor; }
    .btn-ghost:hover { background: var(--ink); color: var(--bg); }
    .btn-arrow::after { content: '→'; transition: transform .2s; }
    .btn-arrow:hover::after { transform: translateX(4px); }

    /* Tag/pill */
    .tag {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 10px; font-family: var(--mono); font-size: 10px;
      letter-spacing: 0.12em; text-transform: uppercase;
      background: var(--bone); color: var(--graphite);
    }
    .tag-orange { background: var(--orange); color: white; }
    .tag-dark { background: var(--black); color: var(--bg); }

    /* Hairlines */
    .hr { height: 1px; background: var(--bone); border: none; margin: 0; }
    .hr-dark { background: var(--charcoal); opacity: .15; }

    /* Underline link */
    .ulink {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: var(--sans); font-weight: 600; font-size: 13px;
      letter-spacing: 0.04em;
      border-bottom: 1.5px solid var(--orange);
      padding-bottom: 2px;
    }
    .ulink:hover { color: var(--orange); }

    /* Marquee/ticker */
    @keyframes marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    .marquee {
      display: flex; width: max-content; animation: marquee 40s linear infinite;
    }
    .marquee:hover { animation-play-state: paused; }

    /* Photo treatment */
    .photo-frame {
      position: relative; overflow: hidden; background: var(--bone);
    }
    .photo-frame img {
      width: 100%; height: 100%; object-fit: cover;
      filter: contrast(1.05) saturate(1.05);
    }
    .duotone img {
      filter: contrast(1.1) saturate(0.4) sepia(0.15);
    }

    /* Card hover */
    .card-lift { transition: transform .25s ease, box-shadow .25s ease; }
    .card-lift:hover { transform: translateY(-3px); }

    /* Focus */
    button:focus-visible, a:focus-visible {
      outline: 2px solid var(--orange); outline-offset: 3px;
    }

    /* Scrollbar inside artboards */
    .scroll-area { overflow-y: auto; scrollbar-width: thin; }
    .scroll-area::-webkit-scrollbar { width: 8px; }
    .scroll-area::-webkit-scrollbar-thumb { background: var(--silver); }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

// Official SLOTAB booster club roundel — render the real PNG
function Logo({ size = 44 }) {
  return (
    <img src="assets/logo.png" alt="SLOTAB — SLO Tiger Athletic Booster Club"
      width={size} height={size}
      style={{ display: 'block', width: size, height: size, flexShrink: 0, borderRadius: '50%' }}/>
  );
}

// Tiger paw / claw mark — minimal geometric ornament
function PawMark({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <ellipse cx="12" cy="15" rx="5" ry="4" />
      <ellipse cx="5" cy="9" rx="2" ry="2.5" />
      <ellipse cx="12" cy="6" rx="2" ry="2.5" />
      <ellipse cx="19" cy="9" rx="2" ry="2.5" />
    </svg>
  );
}

// Simple chevron
function Chevron({ dir = 'down', size = 12 }) {
  const rot = { down: 0, up: 180, left: 90, right: -90 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 12 8" style={{ transform: `rotate(${rot}deg)`, transition: 'transform .2s' }}>
      <path d="M1 1 L6 6 L11 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// Section heading — eyebrow + serif title
function SectionHead({ eyebrow, title, kicker, align = 'left', dark = false }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === 'center' ? 720 : 'none', margin: align === 'center' ? '0 auto' : 0 }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>}
      <h2 className="display" style={{ fontSize: 48, margin: 0, color: dark ? TIGER.cream : 'var(--ink)' }}>{title}</h2>
      {kicker && <p style={{ marginTop: 14, fontSize: 17, lineHeight: 1.55, color: 'var(--graphite)', maxWidth: 560 }}>{kicker}</p>}
    </div>
  );
}

// Original-site wordmark banner — "SLO | TAB"
function SiteBanner({ onNavigate }) {
  return (
    <div style={{
      background: TIGER.black,
      borderBottom: `3px solid ${TIGER.orange}`,
      textAlign: 'center',
    }}>
      <a
        href="#home"
        onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}
        style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10,
          padding: '22px 32px', textDecoration: 'none',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <span className="display" style={{
            fontSize: 56, fontWeight: 800, letterSpacing: '0.08em',
            color: 'white', lineHeight: 1,
          }}>SLO</span>
          <span style={{
            width: 2, height: 44, background: TIGER.orange, display: 'inline-block',
          }}/>
          <span className="display" style={{
            fontSize: 56, fontWeight: 800, letterSpacing: '0.08em',
            color: TIGER.gold, lineHeight: 1,
          }}>TAB</span>
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          fontFamily: TIGER.mono, fontSize: 12, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: TIGER.cream,
        }}>
          <span>San Luis Obispo</span>
          <span style={{
            width: 5, height: 5, borderRadius: '50%', background: TIGER.orange, display: 'inline-block',
          }}/>
          <span>Tiger Athletic Boosters</span>
        </span>
      </a>
    </div>
  );
}

// Top utility bar — score ticker / next event
function TopBar({ items }) {
  return (
    <div style={{
      background: TIGER.black, color: TIGER.cream,
      fontFamily: TIGER.mono, fontSize: 11, letterSpacing: '0.08em',
      overflow: 'hidden', borderBottom: `2px solid ${TIGER.orange}`,
    }}>
      <div className="marquee" style={{ padding: '8px 0' }}>
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 24px', borderRight: '1px solid #333' }}>
            {it.tag && <span style={{ color: TIGER.orange, fontWeight: 700 }}>{it.tag}</span>}
            <span style={{ textTransform: 'uppercase' }}>{it.text}</span>
            {it.score && <span style={{ color: TIGER.orange, fontWeight: 700 }}>{it.score}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

// Main navigation
function Nav({ current = 'home', onNavigate, donateProminence = 'medium', solid = false }) {
  const [open, setOpen] = React.useState(null);
  const items = [
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About', children: [
      { key: 'about', label: 'About SLOTAB' },
      { key: 'impact', label: 'Impact' },
      { key: 'contact', label: 'Board & Contact' },
    ]},
    { key: 'membership', label: 'Get Involved', children: [
      { key: 'membership', label: 'Membership & Sponsors' },
      { key: 'season-passes', label: 'Season Passes' },
      { key: 'merch', label: 'Merch' },
      { key: 'volunteer', label: 'Volunteer' },
    ]},
    { key: 'events', label: 'Events' },
    { key: 'teams', label: 'Teams', children: [
      { key: 'teams', label: 'All Teams' },
      { key: 'team-football', label: 'Football' },
      { key: 'team-volleyball', label: 'Girls Volleyball' },
      { key: 'team-baseball', label: 'Baseball' },
      { key: 'team-track', label: 'Track & Field' },
    ]},
    { key: 'watch', label: 'Watch' },
    { key: 'hall', label: 'Hall of Fame' },
  ];

  const donateBtnClass =
    donateProminence === 'high' ? 'btn btn-primary' :
    donateProminence === 'low' ? 'btn btn-ghost' :
    'btn btn-dark';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: solid ? 'var(--bg)' : 'rgba(250, 246, 238, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--bone)',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto', padding: '14px 40px',
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={42} />
          <div style={{ lineHeight: 1.05 }}>
            <div className="display" style={{ fontSize: 18, fontWeight: 800 }}>SLOTAB</div>
            <div style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--graphite)', fontWeight: 600 }}>Tiger Athletic Boosters</div>
          </div>
        </a>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 24, flex: 1 }}>
          {items.map((it) => (
            <div key={it.key} style={{ position: 'relative' }}
              onMouseEnter={() => it.children && setOpen(it.key)}
              onMouseLeave={() => setOpen(null)}>
              <a href={`#${it.key}`} onClick={(e) => { e.preventDefault(); onNavigate(it.key); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '10px 14px',
                  fontSize: 13, fontWeight: 600,
                  color: current === it.key || (it.children && it.children.some(c => c.key === current)) ? 'var(--ink)' : 'var(--graphite)',
                  borderBottom: current === it.key ? `2px solid ${TIGER.orange}` : '2px solid transparent',
                }}>
                {it.label}
                {it.children && <Chevron size={9} />}
              </a>
              {it.children && open === it.key && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, minWidth: 220,
                  background: 'var(--bg)', border: '1px solid var(--bone)',
                  borderTop: `2px solid ${TIGER.orange}`,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                  padding: '8px 0',
                }}>
                  {it.children.map((c) => (
                    <a key={c.key} href={`#${c.key}`}
                      onClick={(e) => { e.preventDefault(); onNavigate(c.key); setOpen(null); }}
                      style={{
                        display: 'block', padding: '10px 18px',
                        fontSize: 13, fontWeight: 500,
                        color: current === c.key ? TIGER.orange : 'var(--ink)',
                      }}>
                      {c.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <a href="#membership" onClick={(e) => { e.preventDefault(); onNavigate('membership'); }} className={donateBtnClass + ' btn-arrow'}>
          {donateProminence === 'high' ? 'Donate Today' : 'Join'}
        </a>
      </div>
    </header>
  );
}

// Footer
function Footer({ onNavigate }) {
  return (
    <footer style={{ background: TIGER.black, color: TIGER.cream, paddingTop: 80 }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, paddingBottom: 60 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <Logo size={56} />
              <div>
                <div className="display" style={{ fontSize: 22 }}>SLOTAB</div>
                <div style={{ fontSize: 11, letterSpacing: '0.16em', color: TIGER.silver, textTransform: 'uppercase' }}>Est. 1894 · San Luis Obispo</div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: TIGER.silver, maxWidth: 380 }}>
              The San Luis Obispo Tiger Athletic Booster Club is a 501(c)(3) non-profit supporting every CIF-sanctioned team and cheer squad at SLOHS.
            </p>
            <div className="mono" style={{ fontSize: 11, marginTop: 20, color: TIGER.pewter, letterSpacing: '0.08em' }}>EIN # 45-4897120</div>
          </div>

          <div>
            <div className="label" style={{ color: TIGER.orange, marginBottom: 18 }}>Get Involved</div>
            {[['membership', 'Become a Member'], ['membership', 'Sponsorship'], ['volunteer', 'Volunteer'], ['season-passes', 'Season Passes'], ['merch', 'Tiger Merch']].map(([k, l], i) => (
              <a key={i} href={`#${k}`} onClick={(e) => { e.preventDefault(); onNavigate(k); }}
                style={{ display: 'block', fontSize: 14, padding: '6px 0', color: TIGER.cream }}>{l}</a>
            ))}
          </div>

          <div>
            <div className="label" style={{ color: TIGER.orange, marginBottom: 18 }}>Explore</div>
            {[['teams', 'All Teams'], ['watch', 'Watch'], ['events', 'Events'], ['hall', 'Hall of Fame'], ['impact', 'Impact']].map(([k, l], i) => (
              <a key={i} href={`#${k}`} onClick={(e) => { e.preventDefault(); onNavigate(k); }}
                style={{ display: 'block', fontSize: 14, padding: '6px 0', color: TIGER.cream }}>{l}</a>
            ))}
          </div>

          <div>
            <div className="label" style={{ color: TIGER.orange, marginBottom: 18 }}>Connect</div>
            {[['contact', 'Board & Contact'], ['about', 'About'], ['#', 'Newsletter']].map(([k, l], i) => (
              <a key={i} href={`#${k}`} onClick={(e) => { e.preventDefault(); k !== '#' && onNavigate(k); }}
                style={{ display: 'block', fontSize: 14, padding: '6px 0', color: TIGER.cream }}>{l}</a>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {['IG', 'FB', 'YT'].map((s) => (
                <a key={s} href="#" onClick={(e) => e.preventDefault()}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                  }}>{s}</a>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #2a2a2a',
          padding: '24px 0', display: 'flex', justifyContent: 'space-between',
          fontSize: 11, color: TIGER.pewter, fontFamily: TIGER.mono, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <div>© 2026 SLOTAB · All Rights Reserved</div>
          <div>Title IX Compliant · Privacy · Terms</div>
        </div>
      </div>
    </footer>
  );
}

// Photo with caption credit
function PhotoCaption({ src, caption, credit, height = 480, duotone = false }) {
  return (
    <figure style={{ margin: 0 }}>
      <div className={'photo-frame ' + (duotone ? 'duotone' : '')} style={{ height }}>
        <img src={src} alt={caption} />
      </div>
      {(caption || credit) && (
        <figcaption style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 10, fontSize: 11, color: 'var(--graphite)',
          fontFamily: TIGER.mono, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          <span>{caption}</span>
          {credit && <span style={{ color: 'var(--pewter)' }}>{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}

Object.assign(window, { TIGER, GlobalStyles, Logo, PawMark, Chevron, SectionHead, TopBar, Nav, Footer, PhotoCaption });
