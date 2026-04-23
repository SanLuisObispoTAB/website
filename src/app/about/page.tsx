import PageHeader from "../components/PageHeader";

export default function AboutPage() {
  return (
    <>
      <PageHeader kicker="Our Mission" title="About SLOTAB" />
      <section className="slotab-section">
        <div className="slotab-container slotab-prose">
          <h2>Who is SLOTAB?</h2>
          <p>
            The SLOHS Tiger Athletic Booster Club is a non-profit 501(c)(3)
            charitable organization created to support all CIF-sanctioned teams
            and cheer at San Luis Obispo High School. Members include parents,
            guardians, grandparents, alumni, coaches, faculty, staff, school
            administrators, and community members.
          </p>
          <p>
            <strong>EIN# 45-4897120</strong>
          </p>

          <h2>What does SLOTAB do?</h2>
          <p>
            The primary goals of SLOTAB are to raise funds through membership,
            special events, and activities to enhance and improve the athletic
            programs and facilities at San Luis Obispo High School. We also
            provide support in the advancement of student-athletes, gain
            overall support from the community, increase the number of
            participants in athletics, and promote school spirit.
          </p>

          <h2>How is SLOTAB structured?</h2>
          <p>
            SLOTAB is governed by a volunteer board of parents and community
            members. Monthly meetings are open to anyone who wants to attend
            and get involved.
          </p>

          <h2>Where does the money go?</h2>
          <p>
            When donations and proceeds from memberships, sponsors, and
            fundraising events are collected, the SLOTAB board — in compliance
            with SLCUSD policy — appropriates funds directly to the SLOHS
            Athletic Department, who then disperses funds in accordance with
            Title IX of the educational code. Our SLOTAB Treasurer presents a
            financial statement at each general meeting.
          </p>
          <p>
            Additionally, a minimum of twenty percent (20%) of money raised
            each year by the club — less operating costs — is allocated in
            accordance with our governing documents and board policy.
          </p>

          <h2>How can I get involved?</h2>
          <p>
            Join as an individual or family member, sponsor at a business
            level, volunteer at games and events, or attend a monthly meeting.
            Every bit of help keeps Tiger athletics strong.
          </p>
        </div>
      </section>
    </>
  );
}
