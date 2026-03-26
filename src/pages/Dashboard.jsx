import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Btn from '../components/Btn';
import Badge from '../components/Badge';
import ScoreRing from '../components/ScoreRing';
import ProgressRow from '../components/ProgressRow';
import AICoach from '../components/AICoach';
import JobMatcher from '../components/JobMatcher';
import AnimatedNumber from '../components/AnimatedNumber';
import CoverLetter from '../components/CoverLetter';
import InterviewPrep from '../components/InterviewPrep';
import SalaryEstimator from '../components/SalaryEstimator';
import { db, auth } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { callGroq } from '../services/ai';

const SIDE_NAV = [
  { id: 'overview', l: 'Overview', ic: 'grid' },
  { id: 'scans', l: 'Scans', ic: 'file' },
  { id: 'matcher', l: 'Job Matcher', ic: 'target', neu: true },
  { id: 'coach', l: 'AI Coach', ic: 'brain', neu: true },
  { id: 'cover', l: 'Cover Letter', ic: 'file', neu: true },
  { id: 'interview', l: 'Interview Prep', ic: 'award', neu: true },
  { id: 'builder', l: 'Expert Builder', ic: 'zap', neu: true },
];

const Dashboard = ({ go, user, onAuth }) => {
  const [tab, setTab] = useState('overview');
  const [scans, setScans] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [profileData, setProfileData] = useState({ name: user?.name || '', bio: user?.bio || 'Career Explorer' });
  // Settings functionality removed
  const [loadingAI, setLoadingAI] = useState(false);
  const [roastContent, setRoastContent] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'scans'), orderBy('date', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setScans(docs);
      setLoaded(true);
    }, (error) => {
      console.error("Error fetching scans:", error);
      setLoaded(true);
    });

    return () => unsub();
  }, [user]);

  const latest = scans[0];
  const total = scans.length;
  const avg = total > 0 ? Math.round(scans.reduce((a, b) => a + b.score, 0) / total) : 0;

  const KPIS = [
    { label: 'Current Score', val: latest?.score || 0, sub: 'Latest scan', suffix: '%' },
    { label: 'Improvement', val: total > 1 ? Math.max(0, latest.score - scans[total - 1].score) : 0, sub: 'Since first scan', suffix: '%' },
    { label: 'Total Scans', val: total, sub: 'Versions created', suffix: '' },
    { label: 'Avg Persistence', val: avg, sub: 'Quality stability', suffix: '%' },
  ];

  /* ── Not Signed In ── */
  if (!user) return (
    <div style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--s1)', minHeight: 'calc(100vh - 52px)' }}>
      <div className="ru card" style={{ maxWidth: 440, margin: '0 auto', padding: 40 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Icon id="lock" size={20} color="var(--ts)" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 10, letterSpacing: '-.03em' }}>
          Unlock Your Career OS
        </h2>
        <p style={{ color: 'var(--ts)', marginBottom: 28, fontSize: '.9rem', lineHeight: 1.65 }}>
          Track your resume score history and improvements over time.
        </p>
        <Btn v="dark" sz="lg" pill onClick={onAuth}>
          Sign in <Icon id="arrow" size={14} color="white" />
        </Btn>
      </div>
    </div>
  );

  const handleDeleteScan = async (scanId) => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'scans', scanId));
      setScans(scans.filter(s => s.id !== scanId));
      setSelectedScan(null);
    } catch (err) {
      console.error("Failed to delete scan", err);
    }
    setDeleting(false);
  };

  const handleAIRename = async (scan) => {
    if (!user || loadingAI) return;
    setLoadingAI(true);
    try {
      const prompt = `Based on this resume text, suggest a very short, professional filename (3-4 words max). Output ONLY the filename, nothing else. Text: ${scan.text?.substring(0, 4000) || scan.name}`;
      const completion = await callGroq(prompt);
      const newName = completion.choices[0]?.message?.content?.replace(/["']/g, '').trim() || scan.name;
      await updateDoc(doc(db, 'users', user.uid, 'scans', scan.id), { name: newName });
      setSelectedScan({ ...scan, name: newName });
    } catch (e) { console.error(e); }
    setLoadingAI(false);
  };

  const handleAIRoast = async (scan) => {
    if (!user || loadingAI) return;
    setLoadingAI(true);
    try {
      const prompt = `You are a brutally honest, witty, and high-standard senior recruiter. Roast this resume text in 3 short, punchy, but actually helpful bullet points. Be funny but professional. Text: ${scan.text?.substring(0, 4000) || scan.name}`;
      const completion = await callGroq(prompt);
      setRoastContent(completion.choices[0]?.message?.content || "Your resume is so generic even I can't roast it.");
    } catch (e) { console.error(e); }
    setLoadingAI(false);
  };

  const ScanModal = () => {
    if (!selectedScan) return null;
    const s = selectedScan;
    const rc = s.risk === 'High Risk' ? 'red' : s.risk === 'Medium Risk' ? 'amber' : 'green';

    return (
      <div className="rf" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }} onClick={() => setSelectedScan(null)} />
        <div className="card ru glass" style={{ position: 'relative', width: '100%', maxWidth: 740, maxHeight: '90vh', overflowY: 'auto', padding: 'clamp(20px, 5vw, 36px)', borderRadius: 28, border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 8 }}>{new Date(s.date).toLocaleDateString()}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-.04em' }}>{s.name}</h2>
                <button
                  onClick={() => handleAIRename(s)}
                  disabled={loadingAI}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: loadingAI ? 0.5 : 1 }}
                  title="AI Auto-Rename"
                >
                  <Icon id="zap" size={14} color="var(--ind)" />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge type={rc}>{s.risk}</Badge>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: `var(--${rc})` }}>{s.score}%</div>
              <button onClick={() => { setSelectedScan(null); setRoastContent(null); }} style={{ background: 'var(--s1)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>
          </div>

          {/* Roast Section */}
          <div style={{ marginBottom: 24, padding: 20, background: 'linear-gradient(135deg, #FFF5F5 0%, #FFF 100%)', borderRadius: 20, border: '1px solid #FFEBEB', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}><Icon id="award" size={80} color="var(--red)" /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.05em' }}>🔥 The AI Resume Roast</h4>
              {!roastContent && <Btn v="red-dim" sz="xs" pill onClick={() => handleAIRoast(s)} disabled={loadingAI}>{loadingAI ? 'Roasting...' : 'Roast Me'}</Btn>}
            </div>
            {roastContent ? (
              <div style={{ fontSize: '.88rem', color: '#852d2d', lineHeight: 1.6, fontWeight: 500, whiteSpace: 'pre-line' }}>
                {roastContent}
              </div>
            ) : (
              <p style={{ fontSize: '.82rem', color: 'var(--ts)' }}>Ready to hear the truth? Get a brutally honest AI critique.</p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            <div style={{ padding: 16, background: 'var(--s1)', borderRadius: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--ts)', textTransform: 'uppercase', marginBottom: 4 }}>ATS</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.ats || 0}%</p>
            </div>
            <div style={{ padding: 16, background: 'var(--s1)', borderRadius: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--ts)', textTransform: 'uppercase', marginBottom: 4 }}>Keywords</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.keyword || 0}%</p>
            </div>
            <div style={{ padding: 16, background: 'var(--s1)', borderRadius: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--ts)', textTransform: 'uppercase', marginBottom: 4 }}>Format</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.formatting || 0}%</p>
            </div>
            <div style={{ padding: 16, background: 'var(--s1)', borderRadius: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--ts)', textTransform: 'uppercase', marginBottom: 4 }}>Impact</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.impact || 0}%</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h4 style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: 12 }}>Top Issues</h4>
              {s.issues?.length > 0 ? s.issues.map((iss, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: iss.sev === 'Critical' ? 'var(--red)' : 'var(--amber)', marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '.85rem', fontWeight: 600 }}>{iss.label}</p>
                    <p style={{ fontSize: '.8rem', color: 'var(--ts)', lineHeight: 1.5 }}>{iss.desc}</p>
                  </div>
                </div>
              )) : <p style={{ fontSize: '.8rem', color: 'var(--ts)' }}>No issues found!</p>}
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              <h4 style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: 12 }}>Improvements</h4>
              {s.improvements?.length > 0 ? s.improvements.map((imp, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <Icon id="check" size={14} color="var(--green)" />
                  <p style={{ fontSize: '.85rem', color: 'var(--ts)', lineHeight: 1.5 }}>{imp}</p>
                </div>
              )) : <p style={{ fontSize: '.8rem', color: 'var(--ts)' }}>No improvements suggested.</p>}
            </div>
          </div>

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '.5px solid var(--bl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '.8rem', color: 'var(--ts)' }}>The original PDF is never stored on our servers for your privacy.</p>
            <Btn v="ghost" sz="sm" onClick={() => handleDeleteScan(s.id)} style={{ color: 'var(--red)' }}>
              {deleting ? 'Discarding...' : 'Discard Resume Version'}
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (tab === 'overview') {
      return (
        <>
          <div className="ru" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 'clamp(1.4rem,2.8vw,1.8rem)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 8, color: 'var(--near-black)' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Hero'}!
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge type="ind">Step {total + 1} of your journey</Badge>
              <p style={{ fontSize: '.88rem', fontWeight: 500, color: 'var(--ts)' }}>You're {latest?.score || 0}% toward resume perfection.</p>
            </div>
          </div>

          <div id="dash-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 11, marginBottom: 11 }}>
            {KPIS.map((k, i) => (
              <div key={i} className={`ru d${i} card`} style={{ padding: '22px 24px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--tt)', marginBottom: 12 }}>{k.label}</p>
                {loaded
                  ? <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 6, color: 'var(--near-black)' }}>
                    <AnimatedNumber value={k.val} suffix={k.suffix} />
                  </div>
                  : <div className="skel" style={{ height: 32, width: 80, marginBottom: 6 }} />
                }
                <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--ts)' }}>{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="chart-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 11, marginBottom: 11 }}>
            <div className="ru d2 card" style={{ padding: 22 }}>
              <p className="eyebrow" style={{ marginBottom: 5 }}>Score Progress</p>
              <h3 style={{ fontSize: '.93rem', fontWeight: 700, letterSpacing: '-.03em', marginBottom: 22 }}>Last {Math.min(4, scans.length)} scans</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, height: 100 }}>
                {scans.length > 0 ? [...scans].reverse().slice(-4).map((s, i) => {
                  const v = s.score;
                  const color = v < 40 ? 'var(--red)' : v < 60 ? 'var(--amber)' : 'var(--green)';
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: '100%', borderRadius: '5px 5px 0 0', background: color, height: loaded ? `${(v / 100) * 80}px` : '3px', transition: 'all .9s ease' }} />
                      <span style={{ fontSize: 9, color: 'var(--tt)', fontWeight: 600 }}>{s.name ? s.name.substring(0, 3) : 'W' + (i + 1)}</span>
                    </div>
                  );
                }) : <div style={{ fontSize: 10, color: 'var(--ts)' }}>No scans yet</div>}
              </div>
            </div>

            <div className="ru d3 card" style={{ padding: 22 }}>
              <p className="eyebrow" style={{ marginBottom: 5 }}>Latest Insights</p>
              <h3 style={{ fontSize: '.93rem', fontWeight: 700, letterSpacing: '-.03em', marginBottom: 20 }}>From your recent upload</h3>
              {loaded ? (
                <>
                  <ProgressRow label="ATS Compatibility" value={latest?.ats || 0} delay={0} />
                  <ProgressRow label="Keyword Density" value={latest?.keyword || 0} delay={80} />
                </>
              ) : [1, 2].map(i => <div key={i} className="skel" style={{ height: 10, marginBottom: 16 }} />)}
            </div>
          </div>
        </>
      );
    }

    if (tab === 'scans') {
      return (
        <div className="ru card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '.5px solid var(--bl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Version History</h2>
            <Btn v="dark" sz="sm" pill onClick={() => go('upload')}>+ New Version</Btn>
          </div>
          {scans.length > 0 ? scans.map((sc, i) => {
            const rc = sc.risk === 'High Risk' ? 'red' : sc.risk === 'Medium Risk' ? 'amber' : 'green';
            const ver = `v1.${scans.length - i}`;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScan(sc)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: i < scans.length - 1 ? '.5px solid var(--bl)' : 'none', cursor: 'pointer', transition: 'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--s1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.75rem', color: 'var(--ind)' }}>{ver}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{sc.name}</p>
                    <span style={{ fontSize: 11, color: 'var(--tt)' }}>{new Date(sc.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <Badge type={rc}>{sc.risk}</Badge>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: `var(--${rc})` }}>{sc.score}%</span>
                </div>
              </div>
            );
          }) : <div style={{ padding: 40, textAlign: 'center', color: 'var(--ts)' }}>No versions found.</div>}
        </div>
      );
    }


    const renderSubHeader = (title) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button 
          onClick={() => setTab('overview')}
          style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--s0)', border: '.5px solid var(--bl)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--s1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--s0)'}
        >
          <Icon id="arrow" size={14} style={{ transform: 'rotate(180deg)' }} color="var(--ts)" />
        </button>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-.03em' }}>{title}</h2>
      </div>
    );

    if (tab === 'matcher') return <div className="ru"> {renderSubHeader('Job Matcher')} <JobMatcher resumeText={latest?.extractedText || latest?.text || latest?.name || ""} /> </div>;
    if (tab === 'coach') return <div className="ru"> {renderSubHeader('AI Career Coach')} <AICoach scans={scans} /> </div>;
    if (tab === 'cover') return <div className="ru"> {renderSubHeader('Cover Letter')} <CoverLetter scans={scans} /> </div>;
    if (tab === 'interview') return <div className="ru"> {renderSubHeader('Interview Prep')} <InterviewPrep scans={scans} /> </div>;

    // Settings tab removed

    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--ts)' }}>Content mapping in progress...</div>;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 52, background: 'var(--s1)' }}>
      <aside className="sidebar-panel" style={{ width: 220, borderRight: '.5px solid var(--bl)', background: 'var(--s0)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 52, height: 'calc(100vh - 52px)', overflowY: 'auto' }}>
        <div style={{ padding: '8px 12px 24px', borderBottom: '.5px solid var(--bl)', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <div
              style={{ width: 38, height: 38, borderRadius: 14, background: 'linear-gradient(135deg, #1D1D1F 0%, #434347 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
              {user.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 800, fontSize: '.9rem', letterSpacing: '-0.02em', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(90deg, #1b1b1c 0%, #3a3a3c 100%)', color: '#e5e5ea', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: 100, letterSpacing: '0.04em', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>Pro Pilot</span>
            </div>
          </div>
        </div>
        {SIDE_NAV.map(n => (
          <div key={n.id} className={`slink ${tab === n.id ? 'active' : ''}`} onClick={() => { if (n.id === 'builder') go('livebuilder'); else setTab(n.id); }}>
            <div style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: tab === n.id ? 1 : 0.7 }}>
              <Icon id={n.ic} size={15} color={tab === n.id ? 'var(--near-black)' : 'var(--ts)'} />
            </div>
            <span style={{ flex: 1, letterSpacing: '-0.01em', pointerEvents: 'none' }}>{n.l}</span>
            {n.neu && (
              <span style={{
                background: tab === n.id ? 'linear-gradient(135deg, #5E5CE6 0%, #8E8DFA 100%)' : 'rgba(94,92,230,0.08)',
                color: tab === n.id ? 'white' : 'var(--ind)',
                fontSize: 9, padding: '2px 7px', borderRadius: 12, fontWeight: 800, boxShadow: tab === n.id ? '0 2px 8px rgba(94,92,230,0.25)' : 'none',
                transition: 'all .2s'
              }}>
                AI
              </span>
            )}
          </div>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '.5px solid var(--bl)' }}>
          <Btn v="dark" sz="sm" full pill onClick={() => go('upload')} style={{ marginBottom: 8 }}><Icon id="plus" size={14} color="white" /> New Analysis</Btn>

          <div className="slink" onClick={() => signOut(auth)}>
            <Icon id="logout" size={18} />
            <span>Log out</span>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        {/* Mobile Tab Nav */}
        <div className="hide-desktop" style={{ position: 'sticky', top: 52, zIndex: 99, background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '.5px solid var(--bl)', padding: '12px 16px', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
          {SIDE_NAV.map(n => (
            <div key={n.id} onClick={() => { if (n.id === 'builder') go('livebuilder'); else setTab(n.id); }} style={{ padding: '8px 16px', background: tab === n.id ? 'var(--near-black)' : 'var(--s1)', color: tab === n.id ? 'white' : 'var(--tp)', borderRadius: 100, fontSize: '.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0, transition: 'all .2s' }}>
              <Icon id={n.ic} size={13} color={tab === n.id ? 'white' : 'var(--tt)'} /> {n.l}
              {n.neu && <span style={{ background: 'var(--ind)', color: 'white', fontSize: 7, padding: '1px 5px', borderRadius: 4, fontWeight: 900 }}>AI</span>}
            </div>
          ))}
        </div>

        <main className="dash-main" style={{ flex: 1, padding: 'clamp(20px, 4vw, 40px) clamp(12px, 3vw, 32px)' }}>
          {renderContent()}
        </main>
      </div>
      <ScanModal />
    </div>
  );
};

export default Dashboard;
