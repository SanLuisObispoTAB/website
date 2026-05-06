// Inner pages — Teams, Team Detail, Membership, Events, Watch, Hall of Fame, Impact, About

function PageHeader({ eyebrow, title, kicker, image }) {
  return (
    <section style={{ position: 'relative', paddingTop: 80, paddingBottom: 80, background: 'var(--bg)', borderBottom: '1px solid var(--bone)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: image ? '1.2fr 1fr' : '1fr', gap: 60, alignItems: 'center' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>{eyebrow}</div>
          <h1 className="display" style={{ fontSize: 96, margin: 0, lineHeight: 0.95 }}>{title}</h1>
          {kicker && <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--graphite)', marginTop: 24, maxWidth: 580 }}>{kicker}</p>}
        </div>
        {image && (
          <div style={{ height: 380, background: TIGER.bone, overflow: 'hidden' }}>
            <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          </div>
        )}
      </div>
    </section>
  );
}

function PageWrap({ children, current, onNavigate, donateProminence }) {
  return (
    <>
      <Nav current={current} onNavigate={onNavigate} donateProminence={donateProminence} solid/>
      {children}
      <Footer onNavigate={onNavigate}/>
    </>
  );
}

function TeamsPage({ onNavigate, donateProminence }) {
  const seasons = [
    { name: 'Fall', teams: [
      { name: 'Football', record: '8–3', img: 'assets/photos/football-helmets.jpg' },
      { name: 'Girls Volleyball', record: '21–4', img: 'assets/photos/volleyball-set.jpg' },
      { name: 'Boys Water Polo', record: '14–6', img: 'assets/photos/water-polo-boys-2.jpg' },
      { name: 'Girls Tennis', record: '12–2', img: 'assets/photos/tennis-team.jpg' },
      { name: 'Cross Country', record: 'PAC 7 Champ', img: 'assets/photos/student-section.jpg' },
      { name: 'Cheer', record: 'Active', img: 'assets/photos/student-section.jpg' },
    ]},
    { name: 'Winter', teams: [
      { name: 'Boys Basketball', record: '18–9', img: 'assets/photos/student-section.jpg' },
      { name: 'Girls Basketball', record: '15–11', img: 'assets/photos/student-section.jpg' },
      { name: 'Girls Water Polo', record: '13–5', img: 'assets/photos/water-polo-shot.jpg' },
      { name: 'Boys Soccer', record: '12–4', img: 'assets/photos/student-section.jpg' },
      { name: 'Girls Soccer', record: '14–3', img: 'assets/photos/student-section.jpg' },
      { name: 'Wrestling', record: 'PAC 7 2nd', img: 'assets/photos/student-section.jpg' },
    ]},
    { name: 'Spring', teams: [
      { name: 'Baseball', record: 'Active 9–2', img: 'assets/photos/student-section.jpg' },
      { name: 'Softball', record: 'Active 7–3', img: 'assets/photos/student-section.jpg' },
      { name: 'Boys Volleyball', record: 'Active 8–1', img: 'assets/photos/volleyball-set.jpg' },
      { name: 'Track & Field', record: 'Active', img: 'assets/photos/student-section.jpg' },
      { name: 'Swim & Dive', record: 'Active', img: 'assets/photos/water-polo-boys-2.jpg' },
      { name: 'Beach Volleyball', record: 'Active', img: 'assets/photos/volleyball-set.jpg' },
      { name: 'Boys Tennis', record: 'Active', img: 'assets/photos/tennis-team.jpg' },
      { name: 'Golf', record: 'Active', img: 'assets/photos/student-section.jpg' },
      { name: 'Lacrosse', record: 'Active', img: 'assets/photos/student-section.jpg' },
    ]},
  ];
  return (
    <PageWrap current="teams" onNavigate={onNavigate} donateProminence={donateProminence}>
      <PageHeader eyebrow="22 Teams · 600+ Athletes" title="All Tiger teams." kicker="Every CIF-sanctioned team and cheer squad at SLOHS, supported by the Booster Club." image="assets/photos/football-helmets.jpg"/>
      {seasons.map((s) => (
        <section key={s.name} style={{ padding: '80px 0', borderBottom: '1px solid var(--bone)' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 32 }}>
              <h2 className="display" style={{ fontSize: 56, margin: 0 }}>{s.name}</h2>
              <span className="mono" style={{ fontSize: 12, color: 'var(--pewter)', letterSpacing: '0.16em' }}>{s.teams.length} TEAMS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {s.teams.map((t, i) => (
                <a key={i} href="#" onClick={(e) => { e.preventDefault(); onNavigate('team-detail'); }}
                  className="card-lift" style={{ display: 'block', background: TIGER.black, color: 'white', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: 240, overflow: 'hidden' }}>
                    <img src={t.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </div>
                  <div style={{ padding: '20px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div className="display" style={{ fontSize: 22 }}>{t.name}</div>
                    <div className="mono" style={{ fontSize: 12, color: TIGER.orange }}>{t.record}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      ))}
    </PageWrap>
  );
}

function TeamDetailPage({ onNavigate, donateProminence }) {
  return (
    <PageWrap current="teams" onNavigate={onNavigate} donateProminence={donateProminence}>
      <section style={{ position: 'relative', height: 520, overflow: 'hidden', background: TIGER.black }}>
        <img src="assets/photos/football-helmets.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) saturate(1.05)' }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)' }}/>
        <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0 }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <a href="#teams" onClick={(e) => { e.preventDefault(); onNavigate('teams'); }} className="mono" style={{ fontSize: 11, color: TIGER.orange, letterSpacing: '0.16em' }}>← ALL TEAMS</a>
              <span className="tag" style={{ background: TIGER.orange, color: 'white' }}>FALL</span>
            </div>
            <h1 className="display" style={{ fontSize: 124, margin: 0 }}>Football.</h1>
            <div style={{ display: 'flex', gap: 32, marginTop: 24, fontFamily: TIGER.mono, fontSize: 12, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.85)' }}>
              <span>HEAD COACH · PAT CASEY</span>
              <span>RECORD · 8–3</span>
              <span>HOME · HOLT FIELD</span>
              <span>FOUNDED · 1898</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 80 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>2025 Season Recap</div>
            <h2 className="display" style={{ fontSize: 48, margin: 0 }}>A program built on grit.</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--graphite)', marginTop: 24 }}>
              Tiger Football closed the 2025 regular season 8–3, winning the PAC 7 league championship for the third time in five years. The program has produced 14 collegiate athletes since 2018 and continues to invest deeply in player safety, strength training, and academic support.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--graphite)', marginTop: 18 }}>
              Booster funds in 2024–25 covered new tackling equipment, video analysis software, varsity travel uniforms, and the Holt Field scoreboard refurbishment.
            </p>

            <h3 className="display" style={{ fontSize: 28, marginTop: 60, marginBottom: 24 }}>Recent results</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${TIGER.black}` }}>
                  {['Date', 'Opponent', 'Location', 'Result'].map((h, i) => (
                    <th key={i} className="mono" style={{ textAlign: 'left', padding: '10px 0', fontSize: 11, letterSpacing: '0.16em', color: 'var(--pewter)' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Nov 8', 'Paso Robles', 'Home', 'W 35–14'],
                  ['Nov 1', '@ Atascadero', 'Away', 'W 28–21'],
                  ['Oct 25', 'Mission Prep', 'Home', 'W 42–7'],
                  ['Oct 18', '@ Righetti', 'Away', 'L 14–24'],
                  ['Oct 11', 'Santa Maria', 'Home', 'W 31–17'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--bone)' }}>
                    {r.map((c, j) => (
                      <td key={j} style={{ padding: '14px 0', fontSize: 14, color: j === 3 ? (c.startsWith('W') ? TIGER.orange : 'var(--graphite)') : 'var(--ink)', fontWeight: j === 3 ? 700 : 400 }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside>
            <div style={{ background: 'var(--paper)', padding: 28, borderTop: `2px solid ${TIGER.orange}` }}>
              <h3 className="display" style={{ fontSize: 22, margin: 0 }}>Sponsor Tiger Football</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--graphite)', marginTop: 12 }}>
                Tier-specific sponsorship goes directly to this program — equipment, travel, training resources.
              </p>
              <a href="#membership" onClick={(e) => { e.preventDefault(); onNavigate('membership'); }} className="btn btn-dark btn-arrow" style={{ marginTop: 18, width: '100%', justifyContent: 'space-between' }}>Sponsorship Tiers</a>
            </div>

            <div style={{ marginTop: 32 }}>
              <div className="label" style={{ marginBottom: 14 }}>Coaching Staff</div>
              {[
                ['Pat Casey', 'Head Coach'],
                ['Mike Lerma', 'Offensive Coord.'],
                ['Tom Reyes', 'Defensive Coord.'],
                ['Dani Park', 'Special Teams'],
              ].map(([n, r], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--bone)', fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{n}</span>
                  <span style={{ color: 'var(--pewter)' }}>{r}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </PageWrap>
  );
}

function MembershipPage({ onNavigate, donateProminence }) {
  return (
    <PageWrap current="membership" onNavigate={onNavigate} donateProminence={donateProminence}>
      <PageHeader eyebrow="Become a Booster" title="Memberships & Sponsorships." kicker="Individual and family memberships keep our general fund strong. Business sponsors get visibility across our games, programs, and digital channels."/>

      <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>For Families & Alumni</div>
          <h2 className="display" style={{ fontSize: 48, margin: 0 }}>Individual membership levels.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 48 }}>
            {[
              { name: 'Cub', price: 50, desc: 'Boost the booster fund. Recognition in the program.', perks: ['Email updates', 'Member sticker'] },
              { name: 'Tiger', price: 150, desc: 'Family membership — show up for the season.', perks: ['Cub perks', '2 game-day passes', 'Booster t-shirt'] },
              { name: 'Pride', price: 500, desc: 'Power a sport — fund a season of equipment.', perks: ['Tiger perks', '4 season passes', 'Recognition at games'], featured: true },
              { name: 'Legacy', price: 1500, desc: 'Endow Tiger excellence for years to come.', perks: ['Pride perks', 'Booster Bash table', 'Personal thank-you reel'] },
            ].map((p, i) => (
              <div key={i} style={{
                padding: '32px 28px',
                background: p.featured ? TIGER.black : 'var(--paper)',
                color: p.featured ? 'white' : 'var(--ink)',
                position: 'relative', borderTop: `3px solid ${TIGER.orange}`,
              }}>
                {p.featured && <div className="mono" style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, color: TIGER.orange, letterSpacing: '0.18em' }}>MOST POPULAR</div>}
                <div className="display" style={{ fontSize: 32 }}>{p.name}</div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="display" style={{ fontSize: 56 }}>${p.price}</span>
                  <span style={{ fontSize: 13, color: p.featured ? TIGER.silver : 'var(--graphite)' }}>/year</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: p.featured ? TIGER.silver : 'var(--graphite)', marginTop: 14, minHeight: 56 }}>{p.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 24px' }}>
                  {p.perks.map((perk, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 13 }}>
                      <span style={{ color: TIGER.orange }}>✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <button className={p.featured ? 'btn btn-primary' : 'btn btn-dark'} style={{ width: '100%', justifyContent: 'center' }}>Join · ${p.price}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>For Businesses</div>
          <h2 className="display" style={{ fontSize: 48, margin: 0 }}>Sponsorship tiers.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--graphite)', marginTop: 18, maxWidth: 620 }}>
            Sponsor SLOTAB at the org level, or sponsor a specific Tiger team. All gifts are tax-deductible.
          </p>
          <div style={{ marginTop: 48 }}>
            {[
              { tier: 'Platinum', price: '$10,000', perks: 'Stadium banner · Logo on Booster Bash · Front-row table · Site footer · Public address mention every home game · Annual report inclusion' },
              { tier: 'Gold', price: '$5,000', perks: 'Stadium banner · Booster Bash recognition · Site footer · Quarterly social media spotlight' },
              { tier: 'Silver', price: '$2,500', perks: 'Booster Bash recognition · Site sponsor list · Annual report mention' },
              { tier: 'Bronze', price: '$1,000', perks: 'Site sponsor list · Booster Bash recognition' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '180px 140px 1fr 200px',
                gap: 32, alignItems: 'center',
                padding: '32px 0', borderTop: '1px solid var(--bone)',
                borderBottom: i === 3 ? '1px solid var(--bone)' : 'none',
              }}>
                <div className="display" style={{ fontSize: 36, color: i === 0 ? TIGER.orange : 'var(--ink)' }}>{s.tier}</div>
                <div className="display mono" style={{ fontSize: 22, color: 'var(--ink)' }}>{s.price}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--graphite)' }}>{s.perks}</div>
                <div style={{ textAlign: 'right' }}>
                  <button className="btn btn-dark btn-arrow">Inquire</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full sponsor wall — every business sponsor for 2025-26 */}
      <section style={{ padding: '100px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', gap: 48, marginBottom: 56 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>2025–26 Business Sponsors</div>
              <h2 className="display" style={{ fontSize: 56, margin: 0 }}>Thank you to our <em style={{ color: TIGER.orange, fontStyle: 'italic' }}>sponsors.</em></h2>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--graphite)', marginTop: 20, maxWidth: 640 }}>
                Sixty local businesses fuel SLOHS athletics — from stadium banners on Holt Field to the buses that get our teams to away games. Their continued support of Tiger student-athletes is greatly appreciated.
              </p>
            </div>
            <a href="#membership" onClick={(e) => e.preventDefault()} className="btn btn-primary btn-arrow">Become a Sponsor</a>
          </div>
          <SponsorWall mode="full" onDark={false}/>
        </div>
      </section>
    </PageWrap>
  );
}

function EventsPage({ onNavigate, donateProminence }) {
  return (
    <PageWrap current="events" onNavigate={onNavigate} donateProminence={donateProminence}>
      <PageHeader eyebrow="Upcoming · Spring 2026" title="On the calendar." kicker="Booster meetings, fundraisers, and key athletic events. Open to all Tiger families."/>
      <section style={{ padding: '60px 0 100px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px' }}>
          {[
            { date: 'APR 9', day: 'THU 2026', title: 'Spring Social', meta: '5:30–8:00 PM · The Hub, 1701 Monterey Street', tag: 'Featured', body: 'Drinks, light dinner, and fellowship for our Tiger community. Free for members; $25 at the door.' },
            { date: 'APR 13', day: 'MON 2026', title: 'SLOTAB Monthly Meeting', meta: '6:00 PM · Cannon Boardroom (Zoom available)', body: 'Open to all members. Agenda: Spring fundraiser planning, treasurer report, athletic director update.' },
            { date: 'APR 18', day: 'SAT 2026', title: 'Track & Field Tiger Invitational', meta: '9:00 AM · Holt Field', body: 'Boosters running concessions and apparel. Volunteers needed — 2-hour shifts.' },
            { date: 'MAY 4', day: 'MON 2026', title: 'Final SLOTAB Meeting of the Year', meta: '6:00 PM · Cannon Boardroom', body: 'Wrap-up of the 2025–26 fiscal year and election of incoming board members.' },
            { date: 'MAY 12', day: 'TUE 2026', title: 'Physical Night', meta: '4:00–8:00 PM · SLOHS Gym Lobby', body: 'SLOTAB booth on site for incoming athlete sign-ups. Membership flow and merch available.' },
            { date: 'JUN 6', day: 'SAT 2026', title: 'Booster Bash 2026', meta: '6:00 PM · Madonna Inn', body: 'The annual benefit auction and Hall of Fame induction. Tickets available May 1.' },
          ].map((e, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '120px 1fr auto',
              gap: 32, padding: '32px 0', borderBottom: '1px solid var(--bone)',
            }}>
              <div>
                <div className="display" style={{ fontSize: 32, color: TIGER.orange }}>{e.date}</div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--pewter)', marginTop: 4 }}>{e.day}</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h3 className="display" style={{ fontSize: 26, margin: 0 }}>{e.title}</h3>
                  {e.tag && <span className="tag tag-orange">{e.tag}</span>}
                </div>
                <div style={{ fontSize: 14, color: 'var(--graphite)', marginTop: 6, fontWeight: 600 }}>{e.meta}</div>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--graphite)', marginTop: 12, maxWidth: 640 }}>{e.body}</p>
              </div>
              <div style={{ alignSelf: 'center' }}>
                <button className="btn btn-dark btn-arrow">Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageWrap>
  );
}

function WatchPage({ onNavigate, donateProminence }) {
  const [filter, setFilter] = React.useState('All');
  const sports = ['All', 'Basketball', 'Football', 'Soccer', 'Volleyball', 'Track & Field', 'Wrestling', 'Water Polo'];
  const videos = [
    { sport: 'Basketball', title: 'SLOHS Girls Basketball SHOOT-A-THON 2026', dur: '56:36', views: '199', img: 'assets/photos/student-section.jpg' },
    { sport: 'Basketball', title: 'San Luis Obispo vs Arroyo Grande Girls\' Varsity', dur: '2:06:50', views: '39', img: 'assets/photos/student-section.jpg' },
    { sport: 'Volleyball', title: 'San Luis Obispo vs Playoffs Womens Varsity', dur: '2:23:26', views: '371', img: 'assets/photos/volleyball-set.jpg' },
    { sport: 'Football', title: 'San Luis Obispo vs Paso Robles Flag Football', dur: '2:57:27', views: '50', img: 'assets/photos/football-helmets.jpg' },
    { sport: 'Football', title: 'San Luis Obispo vs Aptos Girls\' Varsity Football', dur: '2:59:42', views: '59', img: 'assets/photos/football-helmets.jpg' },
    { sport: 'Soccer', title: 'San Luis Obispo vs Lindsay Boys\' Varsity Soccer', dur: '1:58:51', views: '157', img: 'assets/photos/student-section.jpg' },
    { sport: 'Water Polo', title: 'Boys Water Polo vs Atascadero', dur: '1:42:18', views: '88', img: 'assets/photos/water-polo-boys-2.jpg' },
    { sport: 'Water Polo', title: 'Girls Water Polo PAC 7 Final', dur: '1:51:07', views: '124', img: 'assets/photos/water-polo-shot.jpg' },
  ];
  const filtered = filter === 'All' ? videos : videos.filter(v => v.sport === filter);
  return (
    <PageWrap current="watch" onNavigate={onNavigate} donateProminence={donateProminence}>
      <PageHeader eyebrow="Live & On-Demand" title="Watch the Tigers." kicker="Live game streams from Hudl, plus full broadcasts from the student-run Tiger News Network."/>
      <section style={{ padding: '40px 0 80px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
            {sports.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                style={{
                  padding: '10px 18px', fontSize: 12, fontFamily: TIGER.mono, letterSpacing: '0.12em', textTransform: 'uppercase',
                  background: filter === s ? TIGER.black : 'transparent',
                  color: filter === s ? 'white' : 'var(--ink)',
                  border: `1px solid ${filter === s ? TIGER.black : TIGER.bone}`,
                }}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {filtered.map((v, i) => (
              <a key={i} href="#" onClick={(e) => e.preventDefault()} className="card-lift" style={{ display: 'block' }}>
                <div style={{ position: 'relative', height: 200, background: TIGER.black, overflow: 'hidden' }}>
                  <img src={v.img} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}/>
                  <div style={{ position: 'absolute', top: 10, left: 10 }}><span className="tag tag-dark">{v.sport}</span></div>
                  <div className="mono" style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.85)', color: 'white', padding: '3px 8px', fontSize: 11 }}>{v.dur}</div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(13,13,13,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>▶</div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 600 }}>{v.title}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--pewter)', marginTop: 6, letterSpacing: '0.1em' }}>{v.views} VIEWS · TNN</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </PageWrap>
  );
}

function HallPage({ onNavigate, donateProminence }) {
  return (
    <PageWrap current="hall" onNavigate={onNavigate} donateProminence={donateProminence}>
      <PageHeader eyebrow="Tigers For Life" title="Hall of Fame." kicker="Honoring the student-athletes, coaches, and contributors whose excellence defines a generation of Tiger athletics."/>
      <section style={{ padding: '60px 0 120px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          {[2024, 2023, 2022, 2021, 2020].map((year) => (
            <div key={year} style={{ marginBottom: 60 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: `2px solid ${TIGER.black}`, paddingBottom: 14, marginBottom: 24 }}>
                <h3 className="display" style={{ fontSize: 64, margin: 0, color: TIGER.orange }}>{year}</h3>
                <span className="mono" style={{ fontSize: 12, color: 'var(--pewter)', letterSpacing: '0.16em', marginLeft: 24 }}>INDUCTION CLASS</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { name: year === 2024 ? 'Coach Mary Cisneros' : year === 2023 ? 'Marcus Hall \'05' : year === 2022 ? '1994 State Championship Team' : year === 2021 ? 'Sarah Whitfield \'08' : 'Coach Ron Foster',
                    sport: year === 2024 ? 'Volleyball · 28 Years' : year === 2023 ? 'Football · NFL' : year === 2022 ? 'Boys Soccer' : year === 2021 ? 'Tennis · D1 All-American' : 'Football · 32 Years',
                    img: 'assets/photos/basketball-girls.jpg' },
                  { name: year === 2024 ? 'David Park \'98' : year === 2023 ? 'Elena Park \'12' : year === 2022 ? 'Dr. Robert Teitge' : year === 2021 ? 'James O\'Brien \'02' : '1989 Volleyball State Champs',
                    sport: year === 2024 ? 'Wrestling · NCAA' : year === 2023 ? 'Track · Olympic Trials' : year === 2022 ? 'Founding Boosters' : year === 2021 ? 'Football · CIF MVP' : 'Girls Volleyball',
                    img: 'assets/photos/basketball-girls.jpg' },
                  { name: year === 2024 ? 'Booster Class of \'82' : year === 2023 ? 'Holt Field Renovation' : year === 2022 ? 'Sue Allen' : year === 2021 ? 'Coach Peggy Lim' : 'Andre Watson \'95',
                    sport: year === 2024 ? 'Founding Donors' : year === 2023 ? '2022 Capital Campaign' : year === 2022 ? 'Athletic Trainer · 25 Yrs' : year === 2021 ? 'Girls Soccer · 18 Yrs' : 'Basketball · NCAA',
                    img: 'assets/photos/basketball-girls.jpg' },
                ].map((h, i) => (
                  <div key={i} className="card-lift" style={{ background: 'var(--paper)', borderTop: `2px solid ${TIGER.orange}` }}>
                    <div style={{ height: 220, background: TIGER.bone, overflow: 'hidden' }}>
                      <img src={h.img} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.4) contrast(1.05)' }}/>
                    </div>
                    <div style={{ padding: '20px 24px 26px' }}>
                      <div className="display" style={{ fontSize: 22, lineHeight: 1.2 }}>{h.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--graphite)', marginTop: 8 }}>{h.sport}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageWrap>
  );
}

function ImpactPage({ onNavigate, donateProminence }) {
  return (
    <PageWrap current="impact" onNavigate={onNavigate} donateProminence={donateProminence}>
      <PageHeader eyebrow="2024–25 Impact Report" title="Where every dollar went." kicker="Every booster purchase, line by line. Receipts available in our annual report."/>
      <section style={{ padding: '60px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: `2px solid ${TIGER.black}`, borderBottom: `2px solid ${TIGER.black}` }}>
            {[
              ['$116,800', 'Total raised'],
              ['600+', 'Athletes supported'],
              ['22', 'Teams funded'],
              ['100%', 'To student-athletes'],
            ].map(([n, l], i) => (
              <div key={i} style={{ padding: '40px 32px', borderRight: i < 3 ? '1px solid var(--bone)' : 'none' }}>
                <div className="display" style={{ fontSize: 56, color: i === 0 ? TIGER.orange : 'var(--ink)' }}>{n}</div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--graphite)', marginTop: 8 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px' }}>
          <h2 className="display" style={{ fontSize: 40, margin: 0 }}>Line-item ledger.</h2>
          <p style={{ fontSize: 15, color: 'var(--graphite)', marginTop: 12 }}>Selected purchases from the 2024–25 fiscal year.</p>
          <div style={{ marginTop: 40 }}>
            {[
              { team: 'Football', item: 'Tackle dummies & sled', amt: 4200 },
              { team: 'Football', item: 'Holt Field scoreboard panels', amt: 12500 },
              { team: 'Volleyball', item: 'Travel uniforms (varsity + JV)', amt: 3800 },
              { team: 'Volleyball', item: 'CIF tournament travel', amt: 5200 },
              { team: 'Track & Field', item: 'Mt. SAC Relays travel', amt: 4400 },
              { team: 'All teams', item: 'Sport-specific shirts (every athlete)', amt: 9100 },
              { team: 'Water Polo', item: 'Pool deck shade structure', amt: 6200 },
              { team: 'Wrestling', item: 'Mat replacement', amt: 7400 },
              { team: 'Cross Country', item: 'Course markers + tent', amt: 1800 },
              { team: 'Basketball', item: 'Big Gym sound system upgrade', amt: 8200 },
              { team: 'All teams', item: 'Post-practice snacks (year-round)', amt: 4800 },
              { team: 'Cheer', item: 'Mat refurbishment', amt: 2600 },
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 140px', gap: 24, padding: '16px 0', borderBottom: '1px solid var(--bone)', alignItems: 'baseline' }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: TIGER.orange }}>{r.team.toUpperCase()}</div>
                <div style={{ fontSize: 15 }}>{r.item}</div>
                <div className="display mono" style={{ fontSize: 18, textAlign: 'right' }}>${r.amt.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageWrap>
  );
}

function AboutPage({ onNavigate, donateProminence }) {
  return (
    <PageWrap current="about" onNavigate={onNavigate} donateProminence={donateProminence}>
      <PageHeader eyebrow="Established 1958" title="About SLOTAB." kicker="A 501(c)(3) charitable organization of parents, guardians, alumni, coaches, and community members supporting Tiger athletics in compliance with Title IX."/>
      <section style={{ padding: '80px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px' }}>
          <h2 className="display" style={{ fontSize: 48, margin: 0 }}>Our mission.</h2>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--graphite)', marginTop: 24 }}>
            The SLO Tiger Athletic Booster Club exists to support student-athletes at San Luis Obispo High School. We raise funds through memberships, sponsorships, and community events — and we deploy those funds in close coordination with the SLOHS Athletic Department to fill gaps that public funding cannot.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--graphite)', marginTop: 18 }}>
            San Luis Obispo High School has a long history of athletic excellence and broad participation. More than 600 students compete on a CIF-sanctioned team each year. We are committed to ensuring no Tiger athlete is excluded from competition due to cost.
          </p>

          <h3 className="display" style={{ fontSize: 32, marginTop: 60, marginBottom: 24 }}>Board of Directors</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, borderTop: `2px solid ${TIGER.black}` }}>
            {[
              ['Jennifer Walsh', 'President'],
              ['Mike Reyes', 'Vice President'],
              ['Sarah Park', 'Treasurer'],
              ['Tom O\'Brien', 'Secretary'],
              ['Dr. Robert Teitge', 'Past President'],
              ['Pat Casey', 'Athletic Director Liaison'],
              ['Maria Cisneros', 'Volunteer Coordinator'],
              ['David Hartford', 'Sponsorship Chair'],
            ].map(([n, r], i) => (
              <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid var(--bone)', display: 'flex', justifyContent: 'space-between', paddingRight: i % 2 === 0 ? 32 : 0, paddingLeft: i % 2 === 1 ? 32 : 0, borderRight: i % 2 === 0 ? '1px solid var(--bone)' : 'none' }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{n}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--graphite)', letterSpacing: '0.1em' }}>{r}</span>
              </div>
            ))}
          </div>

          <h3 className="display" style={{ fontSize: 32, marginTop: 60, marginBottom: 24 }}>Get in touch</h3>
          <div style={{ background: 'var(--paper)', padding: '32px 36px', borderTop: `3px solid ${TIGER.orange}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Email</div>
                <div style={{ fontSize: 16 }}>info@slotab.org</div>
              </div>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Mail</div>
                <div style={{ fontSize: 16 }}>SLOTAB · PO Box 1234<br/>San Luis Obispo, CA 93406</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageWrap>
  );
}

Object.assign(window, { TeamsPage, TeamDetailPage, MembershipPage, EventsPage, WatchPage, HallPage, ImpactPage, AboutPage });
