// Homepage Variant B — "Editorial Split"
// Asymmetric grid hero, oversized type, scoreboard module, magazine-style sections.

function HomeBroadcast({ onNavigate, donateProminence = 'medium' }) {
  return (
    <>
      <SiteBanner onNavigate={onNavigate}/>
      <TopBar items={[
        { tag: 'NEXT UP', text: 'Spring Social · Apr 9 · 5:30 PM at The Hub' },
        { tag: 'RESULT', text: 'V Boys Volleyball vs Righetti', score: 'W 3-1' },
        { tag: 'LIVE FRI', text: 'Varsity Baseball vs Atascadero', score: '7:00 PM' },
        { tag: 'IMPACT', text: 'New scoreboard panels installed at Holt Field' },
      ]}/>
      <Nav current="home" onNavigate={onNavigate} donateProminence={donateProminence}/>

      {/* HERO — split editorial */}
      <section style={{ background: 'var(--bg)', padding: '40px 0 0' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'stretch' }}>
          <div style={{ paddingTop: 40, paddingBottom: 60 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: TIGER.orange, marginBottom: 28 }}>— SAN LUIS OBISPO HIGH · EST. 1894</div>
            <h1 className="display" style={{ fontSize: 156, margin: 0, lineHeight: 0.88, letterSpacing: '-0.03em' }}>
              For the<br/>love of<br/><em style={{ color: TIGER.orange, fontStyle: 'italic' }}>the Tigers.</em>
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.55, marginTop: 36, maxWidth: 520, color: 'var(--graphite)' }}>
              The SLO Tiger Athletic Booster Club has supported every CIF-sanctioned team and cheer squad at SLOHS since 1958. Parents, alumni, and neighbors keeping Tiger athletics — and Tiger excellence — strong.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 40, flexWrap: 'wrap' }}>
              <a href="#membership" onClick={(e) => { e.preventDefault(); onNavigate('membership'); }} className="btn btn-primary btn-arrow">Become a Member</a>
              <a href="#impact" onClick={(e) => { e.preventDefault(); onNavigate('impact'); }} className="btn btn-ghost btn-arrow">See Our Impact</a>
            </div>
          </div>
          <div style={{ position: 'relative', minHeight: 720 }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '70%', overflow: 'hidden', background: TIGER.black }}>
              <img src="assets/photos/tunnel-runout.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) saturate(1.05)' }}/>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '60%', height: '45%', overflow: 'hidden', background: TIGER.bone, border: `8px solid ${TIGER.cream}` }}>
              <img src="assets/photos/water-polo-huddle.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </div>
            <div style={{
              position: 'absolute', bottom: 24, right: 24,
              background: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(10px)',
              color: 'white', padding: '20px 24px', maxWidth: 260,
            }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: TIGER.orange }}>NOW</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6, lineHeight: 1.3 }}>Spring sports in full swing — 11 teams competing this season.</div>
            </div>
          </div>
        </div>
      </section>

      {/* SCOREBOARD STRIP */}
      <section style={{ background: TIGER.black, color: 'white', padding: '32px 0', borderTop: `2px solid ${TIGER.orange}` }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            <div className="eyebrow" style={{ color: TIGER.orange }}>— SCOREBOARD</div>
            <div className="hr" style={{ flex: 1, background: '#2a2a2a' }}/>
            <a href="#teams" onClick={(e) => { e.preventDefault(); onNavigate('teams'); }} className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: TIGER.silver }}>ALL RESULTS →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#222' }}>
            {[
              { sport: 'BASEBALL', status: 'FINAL', us: 'SLO', usScore: 7, them: 'ATS', themScore: 4, win: true },
              { sport: 'GIRLS V-BALL', status: 'FINAL', us: 'SLO', usScore: 3, them: 'RGT', themScore: 1, win: true },
              { sport: 'TRACK & FIELD', status: 'MT. SAC', us: 'SLO', usScore: '3rd', them: '— —', themScore: '', win: true },
              { sport: 'GIRLS WP', status: 'LIVE Q3', us: 'SLO', usScore: 8, them: 'AG', themScore: 6, live: true },
            ].map((g, i) => (
              <div key={i} style={{ background: TIGER.black, padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: TIGER.silver }}>{g.sport}</span>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: g.live ? '#e63946' : (g.win ? TIGER.orange : TIGER.silver) }}>
                    {g.live && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#e63946', marginRight: 6 }}/>}
                    {g.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
                  <span style={{ fontFamily: TIGER.serif, fontSize: 20, fontWeight: 700 }}>{g.us}</span>
                  <span className="display" style={{ fontSize: 32, color: g.win ? TIGER.orange : 'white' }}>{g.usScore}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6, opacity: 0.7 }}>
                  <span style={{ fontFamily: TIGER.serif, fontSize: 16 }}>{g.them}</span>
                  <span className="display" style={{ fontSize: 24 }}>{g.themScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE WAYS — broadcast version, vertical with big numbers */}
      <section style={{ padding: '120px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 2fr', gap: 80 }}>
            <div style={{ position: 'sticky', top: 100, alignSelf: 'flex-start' }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>How You Can Help</div>
              <h2 className="display" style={{ fontSize: 56, margin: 0 }}>Three ways<br/>to <em style={{ color: TIGER.orange, fontStyle: 'italic' }}>support.</em></h2>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--graphite)', marginTop: 22 }}>Choose the lane that fits — every contribution funds Tiger athletics directly.</p>
            </div>
            <div>
              {[
                { num: '01', title: 'Join SLOTAB', body: 'Individual and family memberships go directly into our general fund — coaches, equipment, travel, facilities. Tax-deductible at every level.', cta: 'See membership levels', target: 'membership', amt: 'From $50' },
                { num: '02', title: 'Sponsor a Team', body: 'Local businesses sponsor SLOTAB at Platinum, Gold, Silver, or Bronze tiers — or sponsor a specific Tiger team directly.', cta: 'Business sponsorship', target: 'membership', amt: '$500–$10,000' },
                { num: '03', title: 'Volunteer', body: 'Concession stand, apparel booth, gate, or Booster Bash. Every hour goes straight to the athletes.', cta: 'Volunteer opportunities', target: 'volunteer', amt: '2 hrs / season' },
              ].map((c, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '120px 1fr 200px', gap: 32,
                  padding: '36px 0', borderTop: '1px solid var(--bone)',
                  borderBottom: i === 2 ? '1px solid var(--bone)' : 'none',
                }}>
                  <div className="display" style={{ fontSize: 56, color: TIGER.orange, lineHeight: 1 }}>{c.num}</div>
                  <div>
                    <h3 className="display" style={{ fontSize: 30, margin: 0 }}>{c.title}</h3>
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--graphite)', marginTop: 10 }}>{c.body}</p>
                    <a href={`#${c.target}`} onClick={(e) => { e.preventDefault(); onNavigate(c.target); }} className="ulink" style={{ marginTop: 14, display: 'inline-flex' }}>{c.cta} →</a>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--pewter)' }}>STARTING</div>
                    <div className="display" style={{ fontSize: 24, marginTop: 6 }}>{c.amt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SPOTLIGHT — magazine */}
      <section style={{ padding: '0 0 0', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ paddingRight: 60 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Athlete Spotlight · Spring 2026</div>
            <h2 className="display" style={{ fontSize: 64, margin: 0, lineHeight: 0.95 }}>
              "The boosters bought us our travel uniforms — now we're going to <em style={{ color: TIGER.orange, fontStyle: 'italic' }}>state.</em>"
            </h2>
            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: TIGER.bone, overflow: 'hidden' }}>
                <img src="assets/photos/basketball-girls.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}/>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Bailey Hartford</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--graphite)', letterSpacing: '0.1em', marginTop: 2 }}>SENIOR CAPTAIN · GIRLS TRACK</div>
              </div>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--graphite)', marginTop: 28, maxWidth: 480 }}>
              Bailey is one of three Tigers headed to CIF State Championships this May. Booster funds covered uniforms, hotels, and registration for the entire travel squad — no athlete left behind for cost.
            </p>
            <a href="#impact" onClick={(e) => { e.preventDefault(); onNavigate('impact'); }} className="ulink" style={{ marginTop: 24 }}>Read the full impact report →</a>
          </div>
          <div style={{ position: 'relative' }}>
            <PhotoCaption src="assets/photos/student-section.jpg" caption="Body-paint section · GO TIGERS" credit="© SLOTAB 2026" height={620}/>
          </div>
        </div>
      </section>

      {/* TEAMS — list view */}
      <section style={{ padding: '120px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
            <SectionHead eyebrow="22 Teams · Three Seasons" title="The pride, by team."/>
            <a href="#teams" onClick={(e) => { e.preventDefault(); onNavigate('teams'); }} className="ulink">All teams →</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48 }}>
            {[
              { season: 'Fall', teams: ['Football', 'Girls Volleyball', 'Boys Water Polo', 'Cross Country', 'Girls Tennis', 'Cheer'] },
              { season: 'Winter', teams: ['Boys Basketball', 'Girls Basketball', 'Girls Water Polo', 'Boys Soccer', 'Girls Soccer', 'Wrestling', 'Stunt'] },
              { season: 'Spring', teams: ['Baseball', 'Softball', 'Boys Volleyball', 'Boys Tennis', 'Track & Field', 'Swim & Dive', 'Beach Volleyball', 'Golf', 'Lacrosse'] },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `2px solid ${TIGER.black}`, paddingBottom: 12 }}>
                  <span className="display" style={{ fontSize: 26 }}>{s.season}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--pewter)', letterSpacing: '0.16em' }}>{s.teams.length} TEAMS</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {s.teams.map((t, j) => (
                    <li key={j}>
                      <a href="#teams" onClick={(e) => { e.preventDefault(); onNavigate('teams'); }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--bone)', fontSize: 16 }}>
                        <span>{t}</span>
                        <span style={{ color: 'var(--pewter)' }}>→</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WATCH + EVENTS combo */}
      <section style={{ padding: '120px 0', background: TIGER.black, color: TIGER.cream }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 60 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Watch the Tigers</div>
              <h2 className="display" style={{ fontSize: 56, margin: 0, color: 'white' }}>Live & on-demand.</h2>
              <p style={{ fontSize: 16, color: TIGER.silver, marginTop: 16, maxWidth: 480 }}>
                SLOHS streams home games from Holt Field and the Big Gym. Catch a game live or watch the replay on Hudl and the Tiger News Network.
              </p>

              <a href="#watch" onClick={(e) => { e.preventDefault(); onNavigate('watch'); }}
                className="card-lift"
                style={{ display: 'block', position: 'relative', overflow: 'hidden', marginTop: 32, height: 380, background: '#222' }}>
                <img src="assets/photos/volleyball-set.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}/>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.9) 100%)' }}/>
                <div style={{ position: 'absolute', top: 18, left: 18, display: 'flex', gap: 8 }}>
                  <span style={{ background: '#e63946', color: 'white', padding: '5px 10px', fontFamily: TIGER.mono, fontSize: 10, letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }}/>
                    LIVE
                  </span>
                </div>
                <div style={{ position: 'absolute', bottom: 26, left: 26, right: 26, color: 'white' }}>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: TIGER.orange, marginBottom: 8 }}>BEACH VOLLEYBALL</div>
                  <div className="display" style={{ fontSize: 36 }}>Girls Beach Volleyball vs Morro Bay</div>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', marginTop: 10, opacity: 0.85 }}>STREAMING NOW · 1,247 WATCHING</div>
                </div>
              </a>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>Upcoming</div>
              <h2 className="display" style={{ fontSize: 36, margin: 0, color: 'white' }}>This week.</h2>
              <div style={{ marginTop: 28, borderTop: '1px solid #2a2a2a' }}>
                {[
                  { date: 'APR 9', title: 'Spring Social', meta: '5:30 PM · The Hub' },
                  { date: 'APR 11', title: 'V Baseball vs SLO Eagles', meta: '4:00 PM · Sinsheimer Park' },
                  { date: 'APR 13', title: 'SLOTAB Monthly Meeting', meta: '6:00 PM · Cannon' },
                  { date: 'APR 15', title: 'Track Tiger Invitational', meta: '9:00 AM · Holt Field' },
                  { date: 'APR 18', title: 'Beach Volleyball Tournament', meta: 'All Day · Pismo' },
                ].map((e, i) => (
                  <a key={i} href="#events" onClick={(ev) => { ev.preventDefault(); onNavigate('events'); }}
                    style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 16, padding: '18px 0', borderBottom: '1px solid #2a2a2a' }}>
                    <div className="mono" style={{ fontSize: 12, color: TIGER.orange, letterSpacing: '0.1em' }}>{e.date}</div>
                    <div>
                      <div style={{ fontSize: 15, color: 'white', fontWeight: 600 }}>{e.title}</div>
                      <div style={{ fontSize: 12, color: TIGER.silver, marginTop: 3 }}>{e.meta}</div>
                    </div>
                  </a>
                ))}
              </div>
              <a href="#events" onClick={(e) => { e.preventDefault(); onNavigate('events'); }} className="btn btn-primary btn-arrow" style={{ marginTop: 28 }}>Full Calendar</a>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT EDITORIAL */}
      <section style={{ padding: '120px 0', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>2024–25 Impact</div>
          <h2 className="display" style={{ fontSize: 88, margin: 0, lineHeight: 0.95 }}>
            <em style={{ color: TIGER.orange, fontStyle: 'italic' }}>$116,800</em><br/>back to the Tigers.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--graphite)', marginTop: 28, maxWidth: 620, margin: '28px auto 0' }}>
            Across 22 CIF-sanctioned teams and cheer squads. Every dollar accounted for, every purchase documented.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, marginTop: 60 }}>
            {[
              ['1,847', 'Pieces of equipment'],
              ['64', 'Tournament trips funded'],
              ['12', 'Facility upgrades'],
              ['600+', 'Athletes supported'],
            ].map(([n, l], i) => (
              <div key={i} style={{ borderTop: `2px solid ${TIGER.orange}`, paddingTop: 18, textAlign: 'left' }}>
                <div className="display" style={{ fontSize: 44 }}>{n}</div>
                <div style={{ fontSize: 13, color: 'var(--graphite)', marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
          <a href="#impact" onClick={(e) => { e.preventDefault(); onNavigate('impact'); }} className="btn btn-dark btn-arrow" style={{ marginTop: 56 }}>Read the Full Report</a>
        </div>
      </section>

      {/* SPONSORS */}
      <section style={{ padding: '100px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
            <SectionHead eyebrow="Powered By Local" title="Our 2025–26 sponsors."/>
            <a href="#membership" onClick={(e) => { e.preventDefault(); onNavigate('membership'); }} className="btn btn-primary btn-arrow">Become a Sponsor</a>
          </div>
          <SponsorWall mode="compact" onDark={false}/>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <a href="#membership" onClick={(e) => { e.preventDefault(); onNavigate('membership'); }}
              className="mono" style={{ fontSize: 12, color: TIGER.orange, letterSpacing: '0.18em' }}>
              SEE ALL 60 SPONSORS →
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '140px 0', background: TIGER.black, color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: TIGER.orange, letterSpacing: '0.2em' }}>— JOIN THE PRIDE</div>
            <h2 className="display" style={{ fontSize: 96, margin: '20px 0 0', color: 'white', lineHeight: 0.95 }}>
              <em style={{ color: TIGER.orange, fontStyle: 'italic' }}>Be</em> a booster.
            </h2>
            <p style={{ fontSize: 18, lineHeight: 1.6, marginTop: 24, color: TIGER.silver, maxWidth: 480 }}>
              Memberships start at $50. 100% of every dollar goes to SLOHS student-athletes. Tax-deductible — EIN 45-4897120.
            </p>
            <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
              <a href="#membership" onClick={(e) => { e.preventDefault(); onNavigate('membership'); }} className="btn btn-primary btn-arrow">Become a Member</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="btn btn-ghost" style={{ color: 'white', borderColor: 'white' }}>Contact the Board</a>
            </div>
          </div>
          <div>
            <div style={{ borderLeft: `2px solid ${TIGER.orange}`, paddingLeft: 32 }}>
              <div className="display serif" style={{ fontSize: 32, fontStyle: 'italic', lineHeight: 1.35, color: 'white' }}>
                "Tiger athletics shaped me as much as anything else at SLOHS. I'm a booster because I want every kid to have what we had."
              </div>
              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: TIGER.bone, overflow: 'hidden' }}>
                  <img src="assets/photos/water-polo-boys-2.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Dr. Robert Teitge</div>
                  <div className="mono" style={{ fontSize: 11, color: TIGER.silver, letterSpacing: '0.1em', marginTop: 2 }}>SLOHS '78 · BOARD MEMBER</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate}/>
    </>
  );
}

window.HomeBroadcast = HomeBroadcast;
