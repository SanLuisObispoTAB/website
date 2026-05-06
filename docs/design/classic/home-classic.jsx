// Homepage Variant A — "Classic Collegiate"
// Full-bleed hero photo, bold serif drop, score ticker, editorial sections.

function HomeClassic({ onNavigate, donateProminence = 'medium' }) {
  const [heroIdx, setHeroIdx] = React.useState(0);
  const heroes = [
    { src: 'assets/photos/tunnel-runout.jpg', sport: 'Football', caption: 'Friday night under the lights · Holt Field' },
    { src: 'assets/photos/football-helmets.jpg', sport: 'Football', caption: 'Tigers helmets up · pre-game ritual' },
    { src: 'assets/photos/water-polo-huddle.jpg', sport: 'Water Polo', caption: 'Girls Water Polo · the huddle' },
    { src: 'assets/photos/student-section.jpg', sport: 'Student Section', caption: 'GO TIGERS · the body-paint section' },
    { src: 'assets/photos/basketball-girls.jpg', sport: 'Basketball', caption: 'Girls Varsity Basketball · #22 Hartford' },
  ];

  React.useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroes.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <SiteBanner onNavigate={onNavigate}/>
      <TopBar items={[
        { tag: 'NEXT UP', text: 'Spring Social · Apr 9 · 5:30 PM at The Hub' },
        { tag: 'RESULT', text: 'V Boys Volleyball vs Righetti', score: 'W 3-1' },
        { tag: 'LIVE FRI', text: 'Varsity Baseball vs Atascadero', score: '7:00 PM' },
        { tag: 'IMPACT', text: 'New scoreboard panels installed at Holt Field' },
        { tag: 'RESULT', text: 'Track & Field @ Mt. SAC Relays', score: '3rd' },
      ]}/>
      <Nav current="home" onNavigate={onNavigate} donateProminence={donateProminence}/>

      {/* HERO */}
      <section style={{ position: 'relative', height: 720, overflow: 'hidden', background: TIGER.black }}>
        {heroes.map((h, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            opacity: i === heroIdx ? 1 : 0,
            transition: 'opacity 1.2s ease',
          }}>
            <img src={h.src} alt={h.sport} style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: i === heroIdx ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 7s ease-out',
              filter: 'contrast(1.05) saturate(1.05)',
            }}/>
          </div>
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)',
        }}/>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)',
        }}/>

        {/* Hero content */}
        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: 1440, margin: '0 auto', padding: '0 40px',
          height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          paddingBottom: 80,
        }}>
          <div style={{ color: 'white', maxWidth: 760 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <span style={{
                fontFamily: TIGER.mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
                background: TIGER.gold, color: TIGER.black, fontWeight: 700, padding: '6px 12px',
              }}>SLO Tiger Athletics</span>
              <span style={{ fontFamily: TIGER.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.85 }}>Est. 1894</span>
            </div>
            <h1 className="display" style={{ fontSize: 124, margin: 0, color: 'white', letterSpacing: '-0.025em' }}>
              Go <em style={{ color: TIGER.orange, fontStyle: 'italic', fontWeight: 800 }}>Tigers.</em>
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.55, marginTop: 24, maxWidth: 560, color: '#f3ede0' }}>
              Raising funds and rallying the community to support every CIF-sanctioned team and cheer squad at San Luis Obispo High School.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap' }}>
              <a href="#membership" onClick={(e) => { e.preventDefault(); onNavigate('membership'); }} className="btn btn-primary btn-arrow">Become a Member</a>
              <a href="#volunteer" onClick={(e) => { e.preventDefault(); onNavigate('volunteer'); }} className="btn btn-ghost" style={{ color: 'white' }}>Volunteer</a>
            </div>
          </div>

          {/* Hero meta strip */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            marginTop: 56, color: 'white',
          }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.85 }}>
              {heroes[heroIdx].caption}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {heroes.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)}
                  style={{
                    width: i === heroIdx ? 36 : 12, height: 3, padding: 0,
                    background: i === heroIdx ? TIGER.orange : 'rgba(255,255,255,0.4)',
                    border: 'none', transition: 'all .3s',
                  }}/>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: TIGER.black, color: TIGER.cream, padding: '36px 0', borderBottom: `1px solid #2a2a2a` }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {[
            ['22', 'CIF-sanctioned teams'],
            ['600+', 'Student-athletes annually'],
            ['$1.4M', 'Raised since 2012'],
            ['501(c)(3)', 'Non-profit · EIN 45-4897120'],
          ].map(([n, l], i) => (
            <div key={i} style={{ borderLeft: i === 0 ? `2px solid ${TIGER.orange}` : '1px solid #2a2a2a', paddingLeft: 24 }}>
              <div className="display" style={{ fontSize: 44, color: 'white' }}>{n}</div>
              <div className="mono" style={{ fontSize: 11, color: TIGER.silver, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* THREE WAYS */}
      <section style={{ padding: '120px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <SectionHead eyebrow="How You Can Help" title="Three ways to support Tiger athletics." kicker="Memberships, sponsorships, and volunteer hours fund equipment, travel, facilities, and the small things that make a season."/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginTop: 56, background: 'var(--bone)', border: '1px solid var(--bone)' }}>
            {[
              { num: '01', title: 'Join SLOTAB', body: 'Individual and family memberships go directly into our general fund — coaches, equipment, travel, facilities.', cta: 'Membership Levels', target: 'membership' },
              { num: '02', title: 'Sponsor a Team', body: 'Local businesses sponsor SLOTAB at Platinum, Gold, Silver, or Bronze tiers — or sponsor a specific team directly.', cta: 'Business Sponsorship', target: 'membership' },
              { num: '03', title: 'Volunteer', body: 'Concession stand, apparel booth, gate, or Booster Bash. Every hour goes straight to the athletes.', cta: 'Volunteer Opportunities', target: 'volunteer' },
            ].map((c, i) => (
              <div key={i} className="card-lift" style={{ background: 'var(--bg)', padding: '48px 36px 40px', position: 'relative' }}>
                <div className="mono" style={{ fontSize: 11, color: TIGER.orange, letterSpacing: '0.18em' }}>{c.num} —</div>
                <h3 className="display" style={{ fontSize: 32, margin: '14px 0 14px' }}>{c.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--graphite)', minHeight: 90 }}>{c.body}</p>
                <a href={`#${c.target}`} onClick={(e) => { e.preventDefault(); onNavigate(c.target); }} className="ulink" style={{ marginTop: 8 }}>{c.cta} →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT / EDITORIAL */}
      <section style={{ padding: '120px 0', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Where Your Dollars Go</div>
            <h2 className="display" style={{ fontSize: 64, margin: 0 }}>
              Every donation funds a real <em style={{ color: TIGER.orange, fontStyle: 'italic' }}>purchase</em> for Tiger athletes.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--graphite)', marginTop: 24, maxWidth: 480 }}>
              From sport-specific shirts for every athlete to tackle dummies, scoreboard panels, tournament travel, and post-practice snacks — see exactly what the booster club bought last season.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, marginTop: 36, borderTop: '1px solid var(--bone)' }}>
              {[
                ['$48,200', 'Equipment & gear'],
                ['$31,500', 'Travel & tournaments'],
                ['$22,800', 'Facility upgrades'],
                ['$14,300', 'Athlete meals & snacks'],
              ].map(([n, l], i) => (
                <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid var(--bone)', borderRight: i % 2 === 0 ? '1px solid var(--bone)' : 'none', paddingLeft: i % 2 === 0 ? 0 : 24 }}>
                  <div className="display" style={{ fontSize: 28 }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'var(--pewter)', letterSpacing: '0.04em', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
            <a href="#impact" onClick={(e) => { e.preventDefault(); onNavigate('impact'); }} className="btn btn-dark btn-arrow" style={{ marginTop: 36 }}>See the Full Impact</a>
          </div>
          <div style={{ position: 'relative' }}>
            <PhotoCaption src="assets/photos/basketball-girls.jpg" caption="Bailey Hartford · Senior Captain" credit="Photo · TNN" height={560}/>
            <div style={{
              position: 'absolute', bottom: 60, left: -40,
              background: TIGER.black, color: 'white', padding: '28px 32px',
              maxWidth: 280, borderTop: `4px solid ${TIGER.gold}`,
            }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: TIGER.gold }}>2024-25 Total</div>
              <div className="display" style={{ fontSize: 48, marginTop: 6 }}>$116,800</div>
              <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>Raised & deployed for Tiger athletes</div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAMS GRID */}
      <section style={{ padding: '120px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
            <SectionHead eyebrow="22 Teams · One Pride" title="Every team. Every season."/>
            <a href="#teams" onClick={(e) => { e.preventDefault(); onNavigate('teams'); }} className="ulink">View all teams →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { name: 'Football', season: 'Fall', img: 'assets/photos/football-helmets.jpg', record: '8–3' },
              { name: 'Girls Volleyball', season: 'Fall', img: 'assets/photos/volleyball-set.jpg', record: '21–4' },
              { name: 'Boys Water Polo', season: 'Fall', img: 'assets/photos/water-polo-boys-2.jpg', record: '14–6' },
              { name: 'Girls Tennis', season: 'Fall', img: 'assets/photos/tennis-team.jpg', record: '12–2' },
            ].map((t, i) => (
              <a key={i} href={`#team-${t.name.toLowerCase().split(' ')[0]}`}
                onClick={(e) => { e.preventDefault(); onNavigate('teams'); }}
                className="card-lift"
                style={{ display: 'block', background: TIGER.black, color: 'white', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: 320, overflow: 'hidden' }}>
                  <img src={t.img} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) saturate(1.05)' }}/>
                </div>
                <div style={{ padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div className="mono" style={{ fontSize: 10, color: TIGER.orange, letterSpacing: '0.16em' }}>{t.season.toUpperCase()}</div>
                    <div className="display" style={{ fontSize: 22, marginTop: 4 }}>{t.name}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 14, color: TIGER.cream }}>{t.record}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CALENDAR + WATCH */}
      <section style={{ padding: '120px 0 100px', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 80 }}>
          <div>
            <SectionHead eyebrow="Upcoming" title="What's on the calendar."/>
            <div style={{ marginTop: 40, borderTop: '1px solid var(--bone)' }}>
              {[
                { date: 'APR 9', day: 'THU', title: 'Spring Social', meta: '5:30–8:00 PM · The Hub, 1701 Monterey St', tag: 'Featured' },
                { date: 'APR 13', day: 'MON', title: 'SLOTAB Monthly Meeting', meta: '6:00 PM · Cannon Boardroom (Zoom available)' },
                { date: 'APR 18', day: 'SAT', title: 'Track & Field — Tiger Invitational', meta: '9:00 AM · Holt Field' },
                { date: 'MAY 4', day: 'MON', title: 'Final SLOTAB Meeting of the Year', meta: '6:00 PM · Cannon Boardroom' },
                { date: 'MAY 12', day: 'TUE', title: 'Physical Night — SLOTAB on site', meta: '4:00–8:00 PM · SLOHS Gym Lobby' },
              ].map((e, i) => (
                <a key={i} href="#events" onClick={(ev) => { ev.preventDefault(); onNavigate('events'); }}
                  style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 24, alignItems: 'center', padding: '22px 0', borderBottom: '1px solid var(--bone)' }}>
                  <div>
                    <div className="display" style={{ fontSize: 24, color: TIGER.orange }}>{e.date}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--pewter)', letterSpacing: '0.16em' }}>{e.day}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{e.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--graphite)', marginTop: 2 }}>{e.meta}</div>
                  </div>
                  <div>
                    {e.tag && <span className="tag tag-orange">{e.tag}</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div>
            <SectionHead eyebrow="Watch the Tigers" title="Live & on-demand."/>
            <div style={{ marginTop: 40 }}>
              <a href="#watch" onClick={(e) => { e.preventDefault(); onNavigate('watch'); }}
                className="card-lift"
                style={{ display: 'block', position: 'relative', overflow: 'hidden', background: TIGER.black, height: 380 }}>
                <img src="assets/photos/volleyball-set.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}/>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)' }}/>
                <div style={{ position: 'absolute', top: 18, left: 18, display: 'flex', gap: 8 }}>
                  <span style={{ background: '#e63946', color: 'white', padding: '5px 10px', fontFamily: TIGER.mono, fontSize: 10, letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }}/>
                    LIVE
                  </span>
                  <span className="tag tag-dark">Beach Volleyball</span>
                </div>
                <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, color: 'white' }}>
                  <div className="display" style={{ fontSize: 28 }}>Girls Beach Volleyball vs Morro Bay</div>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', marginTop: 8, opacity: 0.85 }}>NOW STREAMING ON HUDL · 1,247 watching</div>
                </div>
              </a>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                {[
                  { sport: 'Basketball', title: 'V Girls Basketball vs Arroyo Grande', date: 'Apr 2', img: 'assets/photos/basketball-girls.jpg' },
                  { sport: 'Water Polo', title: 'Boys Water Polo @ SLO', date: 'Apr 2', img: 'assets/photos/water-polo-boys-2.jpg' },
                ].map((v, i) => (
                  <a key={i} href="#watch" onClick={(e) => { e.preventDefault(); onNavigate('watch'); }}
                    style={{ background: TIGER.black, color: 'white', height: 180, position: 'relative', overflow: 'hidden' }}>
                    <img src={v.img} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}/>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85) 100%)' }}/>
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      <span className="tag tag-dark">{v.sport}</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{v.title}</div>
                      <div className="mono" style={{ fontSize: 10, opacity: 0.7, marginTop: 4, letterSpacing: '0.12em' }}>{v.date.toUpperCase()}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPONSORS */}
      <section style={{ padding: '100px 0', background: TIGER.black, color: TIGER.cream }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Powered By Local</div>
              <h2 className="display" style={{ fontSize: 56, margin: 0, color: 'white' }}>Our 2025-26 sponsors.</h2>
            </div>
            <a href="#membership" onClick={(e) => { e.preventDefault(); onNavigate('membership'); }} className="btn btn-primary btn-arrow">Become a Sponsor</a>
          </div>
          <SponsorWall mode="compact" onDark={true}/>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <a href="#membership" onClick={(e) => { e.preventDefault(); onNavigate('membership'); }}
              className="mono" style={{ fontSize: 12, color: TIGER.gold, letterSpacing: '0.18em' }}>
              SEE ALL 60 SPONSORS →
            </a>
          </div>
        </div>
      </section>

      {/* HALL OF FAME */}
      <section style={{ padding: '120px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Tigers For Life</div>
            <h2 className="display" style={{ fontSize: 56, margin: 0 }}>Hall of <em style={{ color: TIGER.orange, fontStyle: 'italic' }}>Fame</em></h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--graphite)', marginTop: 22 }}>
              Honoring the student-athletes, coaches, and contributors whose excellence defines a generation of Tiger athletics. Inductions held annually at the Booster Bash.
            </p>
            <a href="#hall" onClick={(e) => { e.preventDefault(); onNavigate('hall'); }} className="btn btn-dark btn-arrow" style={{ marginTop: 28 }}>Visit the Hall</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { year: '2024', name: 'Coach Mary Cisneros', sport: 'Volleyball · 28 Years' },
              { year: '2023', name: 'Marcus Hall \'05', sport: 'Football · NFL' },
              { year: '2023', name: 'Elena Park \'12', sport: 'Track · Olympic Trials' },
              { year: '2022', name: '1994 State Champions', sport: 'Boys Soccer' },
              { year: '2022', name: 'Dr. Robert Teitge', sport: 'Founding Boosters' },
              { year: '2021', name: 'Sarah Whitfield \'08', sport: 'Tennis · D1 All-American' },
            ].map((h, i) => (
              <div key={i} style={{ background: 'var(--paper)', padding: '24px 22px', borderTop: `2px solid ${TIGER.orange}` }}>
                <div className="mono" style={{ fontSize: 10, color: TIGER.orange, letterSpacing: '0.18em' }}>INDUCTED · {h.year}</div>
                <div className="display" style={{ fontSize: 19, marginTop: 10, lineHeight: 1.2 }}>{h.name}</div>
                <div style={{ fontSize: 12, color: 'var(--graphite)', marginTop: 8 }}>{h.sport}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 0', background: TIGER.gold, color: TIGER.black, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -100, top: -100, opacity: 0.12 }}>
          <PawMark size={500} color={TIGER.black}/>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px', textAlign: 'center', position: 'relative' }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: TIGER.black, opacity: 0.7, marginBottom: 18 }}>— Join The Pride</div>
          <h2 className="display" style={{ fontSize: 88, margin: 0, color: TIGER.black }}>One school. <em style={{ fontStyle: 'italic' }}>One pride.</em></h2>
          <p style={{ fontSize: 19, lineHeight: 1.55, marginTop: 24, maxWidth: 620, margin: '24px auto 40px', color: TIGER.charcoal }}>
            Memberships start at $50. 100% of every dollar goes to SLOHS student-athletes.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#membership" onClick={(e) => { e.preventDefault(); onNavigate('membership'); }} className="btn btn-dark btn-arrow">Become a Member</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="btn btn-ghost" style={{ color: TIGER.black, borderColor: TIGER.black }}>Contact the Board</a>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate}/>
    </>
  );
}

window.HomeClassic = HomeClassic;
