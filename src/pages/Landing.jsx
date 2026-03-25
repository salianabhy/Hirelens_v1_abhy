import Icon from '../components/Icon';
import Btn from '../components/Btn';
import Badge from '../components/Badge';

const Landing = ({ go, onAuth }) => {
  const stats = [
    { val: '94%',  sub: 'Prediction accuracy' },
    { val: '2.8s', sub: 'Analysis time'       },
    { val: '50K+', sub: 'Resumes analyzed'    },
  ];

  const steps = [
    { n: '01', ic: 'upload', t: 'Upload resume',     b: 'PDF or Word. Processed instantly — never stored.' },
    { n: '02', ic: 'zap',    t: 'AI analysis',       b: 'ATS scoring, keyword density & impact evaluation.' },
    { n: '03', ic: 'chart',  t: 'Review your score', b: 'See your match score and which areas need work.' },
    { n: '04', ic: 'trend',  t: 'Fix & re-scan',     b: 'Follow the improvement plan and rescan to grow.' },
  ];

  return (
    <div style={{ paddingTop: 52 }}>

      {/* ── HERO ── */}
      <section className="grain" style={{ background: 'var(--near-black)', position: 'relative', overflow: 'hidden', paddingBottom: 80 }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(94,92,230,.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div className="hero-grid" style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 28px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Left — copy */}
          <div>
            <div className="ru" style={{ marginBottom: 22 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.07)', border: '.5px solid rgba(255,255,255,.1)', borderRadius: 100, padding: '5px 14px 5px 9px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--td)', letterSpacing: '.06em', textTransform: 'uppercase' }}>AI Resume Intelligence</span>
              </span>
            </div>

            <h1 className="ru d1 hero-headline" style={{ fontFamily: "'Instrument Sans'", fontSize: 'clamp(2.8rem,5.5vw,5rem)', fontWeight: 700, letterSpacing: '-.05em', lineHeight: .97, color: 'var(--tw)', marginBottom: 24 }}>
              Know before<br />
              <span style={{ color: 'rgba(255,255,255,.32)', fontStyle: 'italic', fontFamily: "'Instrument Serif',serif" }}>you apply.</span>
            </h1>

            <p className="ru d2 hero-sub" style={{ fontSize: 'clamp(.95rem,1.4vw,1.15rem)', color: 'var(--td)', maxWidth: 460, marginBottom: 36, lineHeight: 1.7, fontWeight: 400 }}>
              HireLens scores your resume against real hiring signals — ATS compatibility, keyword density, and recruiter benchmarks — in seconds.
            </p>

            <div className="ru d3 cta-group" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 56 }}>
              <Btn v="white" sz="xl" pill onClick={() => go('upload')}>
                Analyze my resume <Icon id="arrow" size={16} />
              </Btn>
              <Btn v="ghost-dark" sz="xl" pill onClick={() => go('results')}>
                See sample report
              </Btn>
            </div>

            {/* Stats */}
            <div className="ru d4 stats-row" style={{ display: 'flex', gap: 0, paddingTop: 36, borderTop: '.5px solid var(--bd)' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ padding: '0 32px', borderRight: i < stats.length - 1 ? '.5px solid var(--bd)' : 'none', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Instrument Sans'", fontSize: 'clamp(1.4rem,2.5vw,2rem)', fontWeight: 700, color: 'var(--tw)', letterSpacing: '-.04em', marginBottom: 3 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--td)', fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — preview card */}
          <div className="ru d3 flt">
            <div className="card-glass" style={{ padding: 26 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--td)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Resume Score</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: "'Instrument Sans'", fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 700, color: 'var(--red)', letterSpacing: '-.06em', lineHeight: 1 }}>46</span>
                    <span style={{ color: 'var(--red)', fontWeight: 600, fontSize: '1.1rem' }}>%</span>
                  </div>
                </div>
                <Badge type="white">High Risk</Badge>
              </div>
              <div className="div-dark" style={{ margin: '0 0 18px' }} />
              {[['ATS Parsing','38%','var(--red)'],['Keywords','52%','var(--amber)'],['Format','61%','var(--amber)'],['Impact','34%','var(--red)']].map(([l, v, c], i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--td)', fontWeight: 500 }}>{l}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{v}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,.1)', borderRadius: 100 }}>
                    <div style={{ height: '100%', borderRadius: 100, background: c, width: v }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: '11px 14px', background: 'rgba(255,255,255,.05)', border: '.5px solid rgba(255,255,255,.07)', borderRadius: 11, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Icon id="lock" size={13} color="rgba(255,255,255,.35)" />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>3 critical issues — sign in to unlock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ── */}
      <div style={{ borderBottom: '.5px solid var(--bl)', background: 'var(--s0)' }}>
        <div className="proof-bar" style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--tt)', whiteSpace: 'nowrap' }}>Trusted by candidates at</span>
          {['Google','Amazon','Stripe','Notion','Linear','Figma'].map(c => (
            <span key={c} style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--s3)', letterSpacing: '-.02em', whiteSpace: 'nowrap' }}>{c}</span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 28px' }}>
        <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 72, alignItems: 'start' }}>
          <div>
            <p className="eyebrow ru" style={{ marginBottom: 16 }}>How it works</p>
            <h2 className="ru d1" style={{ fontSize: 'clamp(1.9rem,3.2vw,2.6rem)', fontWeight: 700, letterSpacing: '-.05em', lineHeight: 1.1, marginBottom: 14 }}>
              From upload<br />to insight.
            </h2>
            <p className="ru d2" style={{ fontSize: '.93rem', color: 'var(--ts)', lineHeight: 1.7 }}>
              Our AI parses your document, simulates ATS screening, and scores you against real hiring benchmarks.
            </p>
          </div>
          <div className="how-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            {steps.map((s, i) => (
              <div key={i} className="card-tint ru" style={{ padding: '22px 20px', animationDelay: `${i * .09}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--tt)', letterSpacing: '.06em' }}>{s.n}</span>
                  <div style={{ flex: 1, height: .5, background: 'var(--bl)' }} />
                  <Icon id={s.ic} size={14} color="var(--ts)" />
                </div>
                <h3 style={{ fontSize: '.93rem', fontWeight: 700, letterSpacing: '-.03em', marginBottom: 7 }}>{s.t}</h3>
                <p style={{ fontSize: '.82rem', color: 'var(--ts)', lineHeight: 1.65 }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px 80px' }}>
        <div className="card" style={{ padding: '28px 30px' }}>
          <p style={{ fontSize: 'clamp(.95rem,1.5vw,1.1rem)', lineHeight: 1.7, color: 'var(--tp)', fontStyle: 'italic', marginBottom: 18, fontFamily: "'Instrument Serif',serif" }}>
            "HireLens identified exactly why I wasn't getting callbacks. After fixing the 3 critical issues, I had 4 interviews in the same week."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>P</div>
            <div>
              <p style={{ fontSize: '.85rem', fontWeight: 600 }}>Priya Sharma</p>
              <p style={{ fontSize: '.75rem', color: 'var(--tt)' }}>Software Engineer at Stripe</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
              {[1,2,3,4,5].map(s => <Icon key={s} id="star" size={13} color="var(--amber)" sw={0} />)}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <section className="grain" style={{ background: 'var(--near-black)', padding: '88px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(94,92,230,.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative' }}>
          <p className="eyebrow-light eyebrow ru" style={{ marginBottom: 18 }}>Start today</p>
          <h2 className="ru d1" style={{ fontFamily: "'Instrument Sans'", fontSize: 'clamp(2rem,5vw,3.6rem)', fontWeight: 700, letterSpacing: '-.05em', color: 'var(--tw)', marginBottom: 16, lineHeight: 1.08 }}>
            Stop guessing.<br />
            <span style={{ color: 'rgba(255,255,255,.28)', fontStyle: 'italic', fontFamily: "'Instrument Serif',serif" }}>Start winning.</span>
          </h2>
          <p className="ru d2" style={{ color: 'var(--td)', fontSize: 'clamp(.95rem,1.3vw,1.1rem)', marginBottom: 36, lineHeight: 1.7 }}>
            Average users improve their score by 26 points in one session.
          </p>
          <div className="ru d3 cta-group" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Btn v="white" sz="xl" pill onClick={() => go('upload')}>
              Analyze for free <Icon id="arrow" size={16} />
            </Btn>
            <Btn v="ghost-dark" sz="xl" pill onClick={() => go('pricing')}>
              View pricing
            </Btn>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
