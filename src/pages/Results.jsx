import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Btn from '../components/Btn';
import Badge from '../components/Badge';
import ScoreRing from '../components/ScoreRing';
import ProgressRow from '../components/ProgressRow';

const LockOverlay = ({ title, sub, action, label }) => (
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r3)', padding: 16 }}>
    <div style={{ background: 'var(--s0)', border: '.5px solid var(--bm)', borderRadius: 18, padding: '24px 28px', textAlign: 'center', boxShadow: '0 12px 36px rgba(0,0,0,.1)', maxWidth: 280 }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 13px' }}>
        <Icon id="lock" size={17} color="var(--ts)" />
      </div>
      <p style={{ fontWeight: 700, marginBottom: 4, fontSize: '.92rem', letterSpacing: '-.03em' }}>{title}</p>
      <p style={{ fontSize: '.82rem', color: 'var(--ts)', marginBottom: 16 }}>{sub}</p>
      <Btn v="dark" sz="sm" pill onClick={action}>{label}</Btn>
    </div>
  </div>
);

const Results = ({ go, user, onAuth, data }) => {
  const [animated, setAnimated] = useState(false);
  
  const score = data?.score || 46;
  const fileName = data?.name || 'resume.pdf';
  
  const breakdown = [
    { label: 'ATS Compatibility', value: data?.ats || 38 },
    { label: 'Keyword Match',      value: data?.keyword || 52 },
    { label: 'Formatting',        value: data?.formatting || 61 },
    { label: 'Impact language',   value: data?.impact || 34 },
  ];

  const issues = data?.issues || [
    { label: 'Structure Issues', sev: 'High', desc: 'Some sections like Skills or Projects might be missing or poorly labeled.' }
  ];

  const improvements = data?.improvements || [
    "Add more specific action verbs like 'Architected' or 'Optimized'",
    "Quantify your achievements with percentages (e.g. 'Increased efficiency by 20%')",
    "Tailor your skill section to match the tech stack mentioned in the target role",
    "Ensure your summary is a unique value proposition, not a generic template",
  ];

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: 'var(--s1)', minHeight: '100vh', paddingTop: 52 }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '44px 20px' }}>

        {/* Header */}
        <div className="ru result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: score < 60 ? 'var(--red)' : 'var(--green)', display: 'inline-block' }} />
                {fileName} · just now
              </span>
            </p>
            <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.1rem)', fontWeight: 700, letterSpacing: '-.05em' }}>Resume Report</h1>
          </div>
          <div className="result-header-btns" style={{ display: 'flex', gap: 10 }}>
            <Btn v="ghost" sz="sm" pill onClick={() => go('upload')}>New upload</Btn>
            <Btn v="dark"  sz="sm" pill onClick={user ? undefined : onAuth}>
              {user ? 'Full report' : 'Unlock report'}
            </Btn>
          </div>
        </div>

        {/* Top grid */}
        <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 13, marginBottom: 13 }}>

          {/* Score */}
          <div className="ru d1 card" style={{ padding: 26 }}>
            <p className="eyebrow" style={{ marginBottom: 18 }}>Overall Score</p>
            <div className="score-row" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <ScoreRing value={score} size={108} run={animated} />
              <div>
                <div style={{ fontSize: '1.55rem', fontWeight: 700, color: score < 60 ? 'var(--red)' : score < 80 ? 'var(--amber)' : 'var(--green)', letterSpacing: '-.04em', marginBottom: 9 }}>
                  {score < 60 ? 'Poor' : score < 80 ? 'Good' : 'Excellent'}
                </div>
                <Badge type={score < 60 ? 'red' : score < 80 ? 'amber' : 'green'}>
                  {score < 60 ? 'High' : score < 80 ? 'Moderate' : 'Low'} Rejection Risk
                </Badge>
                <p style={{ fontSize: '.75rem', color: 'var(--ts)', marginTop: 9, lineHeight: 1.6 }}>
                  Below 80% of top applicants<br />for this role.
                </p>
              </div>
            </div>
            <div style={{ padding: '11px 14px', background: 'rgba(255,59,48,.06)', border: '.5px solid rgba(255,59,48,.12)', borderRadius: 11, display: 'flex', gap: 8 }}>
              <Icon id="warn" size={14} color={score < 80 ? 'var(--red)' : 'var(--green)'} />
              <p style={{ fontSize: '.79rem', color: score < 80 ? '#B91C1C' : '#047857', lineHeight: 1.6, fontWeight: 500 }}>
                {issues.length} issues detected — {issues.filter(i => i.sev === 'Critical').length} are critical for ATS screening.
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="ru d2 card" style={{ padding: 26 }}>
            <p className="eyebrow" style={{ marginBottom: 18 }}>Score Breakdown</p>
            {breakdown.map((b, i) => (
              <ProgressRow key={i} label={b.label} value={b.value} delay={i * 100} />
            ))}
          </div>
        </div>

        {/* Transparency/Proof Section */}
        {data?.score && (
          <div className="ru d2-5 card" style={{ padding: 26, marginBottom: 13, background: 'linear-gradient(135deg, var(--s0) 0%, #FAFAFA 100%)' }}>
            <p className="eyebrow" style={{ marginBottom: 15 }}>Signals Detected</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data?.signals?.action_verbs?.map((k, i) => (
                <Badge key={`v-${i}`} type="dim" style={{ textTransform: 'capitalize' }}>{k}</Badge>
              ))}
              {data?.signals?.tech_keywords?.map((k, i) => (
                <Badge key={`t-${i}`} type="ind" style={{ textTransform: 'capitalize' }}>{k}</Badge>
              ))}
              {data?.signals?.metrics?.map((m, i) => (
                <Badge key={`m-${i}`} type="green">{m}</Badge>
              ))}
            </div>
            <p style={{ fontSize: '.72rem', color: 'var(--tt)', marginTop: 12 }}>
              Our AI identified these specific industry signals in your text to calculate your benchmarks.
            </p>
          </div>
        )}

        {/* Issues */}
        <div className="ru d3" style={{ position: 'relative', marginBottom: 13 }}>
          <div className="card" style={{ padding: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 7 }}>Top Issues</p>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-.04em' }}>{issues.length} issues found · {issues.filter(i => i.sev === 'Critical').length} critical</h3>
              </div>
              {!user && <Badge type="dim"><Icon id="lock" size={10} color="var(--ts)" /> Locked</Badge>}
            </div>
            <div className={user ? '' : 'locked'}>
              {issues.map((iss, i) => (
                <div key={i} style={{ display: 'flex', gap: 13, padding: '15px 0', borderBottom: i < issues.length - 1 ? '.5px solid var(--bl)' : 'none' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: iss.sev === 'Critical' ? 'var(--red)' : iss.sev === 'High' ? 'var(--amber)' : 'var(--s3)' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '.87rem', letterSpacing: '-.02em' }}>{iss.label}</span>
                      <Badge type={iss.sev === 'Critical' ? 'red' : iss.sev === 'High' ? 'amber' : 'dim'}>{iss.sev}</Badge>
                    </div>
                    <p style={{ fontSize: '.82rem', color: 'var(--ts)', lineHeight: 1.65 }}>{iss.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {!user && (
            <LockOverlay
              title="Sign in to view issues"
              sub="Free account · no credit card"
              action={onAuth}
              label="Create free account"
            />
          )}
        </div>

        {/* Improvements */}
        <div className="ru d4" style={{ position: 'relative', marginBottom: 13 }}>
          <div className="card" style={{ padding: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div>
                <p className="eyebrow" style={{ marginBottom: 7 }}>Improvements</p>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-.04em' }}>
                  Could raise your score to <span style={{ color: 'var(--green)' }}>{Math.min(99, score + 18)}%</span>
                </h3>
              </div>
              {!user && <Badge type="ind">Pro</Badge>}
            </div>
            <div className={user ? '' : 'locked'}>
              {improvements.map((imp, i) => (
                <div key={i} style={{ display: 'flex', gap: 11, padding: '11px 0', borderBottom: i < improvements.length - 1 ? '.5px solid var(--bl)' : 'none' }}>
                  <div style={{ width: 19, height: 19, borderRadius: 7, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon id="check" size={10} color="var(--tp)" sw={2.5} />
                  </div>
                  <p style={{ fontSize: '.85rem', color: 'var(--ts)', lineHeight: 1.65 }}>{imp}</p>
                </div>
              ))}
            </div>
          </div>
          {!user && (
            <LockOverlay
              title="Pro feature"
              sub="Unlock personalized improvement plan"
              action={() => go('pricing')}
              label="View plans"
            />
          )}
        </div>

        {/* CTA banner */}
        <div className="ru d5 grain cta-row" style={{ background: 'var(--near-black)', borderRadius: 22, padding: '32px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(94,92,230,.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--td)', marginBottom: 9 }}>Action Required</p>
            <h3 style={{ color: 'var(--tw)', fontSize: 'clamp(1rem,2vw,1.35rem)', fontWeight: 700, letterSpacing: '-.04em', marginBottom: 7 }}>
              {score >= 80 ? "You're in the top tier of candidates!" : "You're below the top 20% of candidates."}
            </h3>
            <p style={{ color: 'var(--td)', fontSize: '.84rem', lineHeight: 1.6 }}>
              {score >= 80 ? `Average users elevate their resume from ${score}% → 95% in one session.` : `Average users go from ${score}% → 72% in one session.`}
            </p>
          </div>
          <div className="cta-btns" style={{ display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-end', flexShrink: 0, position: 'relative' }}>
            <Btn v="white" sz="lg" pill onClick={() => go('pricing')}>
              Unlock full report <Icon id="arrow" size={14} />
            </Btn>
            <Btn v="ghost" sz="sm" pill onClick={() => go('portfoliomaker')} style={{ color: 'var(--tw)', opacity: 0.8 }}>
              Build Personal Portfolio <Icon id="globe" size={14} color="white" />
            </Btn>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.24)', fontWeight: 500 }}>₹149 / month · cancel anytime</span>
          </div>
        </div>

        {/* New Dashboard CTA */}
        <div className="ru d10" style={{ marginTop: 24, padding: '32px', background: 'var(--near-black)', borderRadius: 24, textAlign: 'center', color: 'white', position: 'relative' }}>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-.03em' }}>Ready for the Next Level?</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '.9rem', marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>
            We've saved your analysis! Visit your dashboard to access the AI Career Coach, Cover Letter Generator, and real-time Salary Benchmarks.
          </p>
          <Btn v="white" sz="lg" pill onClick={() => go('dashboard')}>
            View Full Dashboard <Icon id="arrow" size={14} color="var(--near-black)" />
          </Btn>
        </div>

      </div>
    </div>
  );
};

export default Results;
