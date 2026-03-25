import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Btn from '../components/Btn';
import Badge from '../components/Badge';
import ScoreRing from '../components/ScoreRing';
import ProgressRow from '../components/ProgressRow';
import AICoach from '../components/AICoach';
import JobMatcher from '../components/JobMatcher';
import AnimatedNumber from '../components/AnimatedNumber';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const SIDE_NAV = [
  { id: 'overview', l: 'Overview', ic: 'grid' },
  { id: 'scans',    l: 'Scans',    ic: 'file' },
  { id: 'matcher',  l: 'Job Matcher', ic: 'target', neu: true },
  { id: 'coach',    l: 'AI Coach',   ic: 'brain', neu: true },
  { id: 'insights', l: 'Insights',  ic: 'trend', neu: true },
  { id: 'progress', l: 'Progress', ic: 'award' },
  { id: 'builder',  l: 'Expert Builder', ic: 'zap', neu: true },
  { id: 'portfolio', l: 'Portfolio Builder', ic: 'globe', neu: true },
  { id: 'settings', l: 'Settings', ic: 'settings' },
];

const Dashboard = ({ go, user, onAuth }) => {
  const [tab, setTab] = useState('overview');
  const [scans, setScans] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchScans = async () => {
       try {
         const q = query(collection(db, 'scans'), orderBy('date', 'desc'));
         const snap = await getDocs(q);
         const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
         setScans(list);
         setTimeout(() => setLoaded(true), 800);
       } catch (err) {
         console.error(err);
         setLoaded(true);
       }
    };
    fetchScans();
  }, [user]);

  const latest = scans[0];
  const total = scans.length;
  const avg = total > 0 ? Math.round(scans.reduce((a, b) => a + b.score, 0) / total) : 0;

  const KPIS = [
    { label: 'Current Score', val: latest?.score || 0,  sub: 'Latest scan', suffix: '%' },
    { label: 'Improvement',  val: total > 1 ? Math.max(0, latest.score - scans[total-1].score) : 0, sub: 'Since first scan', suffix: '%' },
    { label: 'Total Scans',  val: total, sub: 'Versions created', suffix: '' },
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

  const renderContent = () => {
    if (tab === 'overview') {
      return (
        <>
          <div className="ru" style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 'clamp(1.4rem,2.8vw,1.8rem)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 8, color: 'var(--near-black)' }}>
              Welcome back, {latest?.title?.split(' ')[0] || 'Hero'}!
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
               <Badge type="ind">Step {total + 1} of your journey</Badge>
               <p style={{ fontSize: '.88rem', fontWeight: 500, color: 'var(--ts)' }}>You're {latest?.score || 0}% toward resume perfection.</p>
            </div>
          </div>

          <div className="ru card-tint flt" style={{ padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16, borderLeft: '4px solid var(--ind)' }}>
             <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--ind)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon id="brain" size={20} color="white" />
             </div>
             <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '.95rem', fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                   AI Suggestion: Ready for the web?
                </h4>
                <p style={{ fontSize: '.84rem', color: 'var(--ts)', lineHeight: 1.5 }}>
                   Your resume impact is currently in the top 5%. It's the perfect time to sync this data with a high-fidelity portfolio website.
                </p>
             </div>
             <Btn v="light" sz="sm" pill onClick={() => go('portfoliomaker')}>
                <Icon id="globe" size={14} /> Generate Portfolio
             </Btn>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 11, marginBottom: 11 }}>
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
               <h3 style={{ fontSize: '.93rem', fontWeight: 700, letterSpacing: '-.03em', marginBottom: 22 }}>Last 4 scans</h3>
               <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, height: 100 }}>
                 {[72, 84, 91, 95].map((v, i) => { // Simulated trend
                   const color = v < 40 ? 'var(--red)' : v < 60 ? 'var(--amber)' : 'var(--green)';
                   return (
                     <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: '100%', borderRadius: '5px 5px 0 0', background: color, height: loaded ? `${(v / 100) * 80}px` : '3px', transition: 'all .9s ease' }} />
                        <span style={{ fontSize: 9, color: 'var(--tt)', fontWeight: 600 }}>W{i + 1}</span>
                     </div>
                   );
                 })}
               </div>
            </div>
            
            <div className="ru d3 card" style={{ padding: 22 }}>
               <p className="eyebrow" style={{ marginBottom: 5 }}>Latest Insights</p>
               <h3 style={{ fontSize: '.93rem', fontWeight: 700, letterSpacing: '-.03em', marginBottom: 20 }}>Ready for Portfolio Sync</h3>
               {loaded ? (
                 <>
                   <ProgressRow label="Sync Readiness"   value={95} delay={0} />
                   <ProgressRow label="Brand Authority"  value={88} delay={80} />
                 </>
               ) : [1,2].map(i => <div key={i} className="skel" style={{ height: 10, marginBottom: 16 }} />)}
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
              <div key={sc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: i < scans.length - 1 ? '.5px solid var(--bl)' : 'none' }}>
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

    if (tab === 'insights') {
      return (
        <div className="ru" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
           <div style={{ display: 'flex', gap: 16 }}>
              <div className="card" style={{ flex: 1, padding: 24, borderLeft: '4px solid var(--ind)' }}>
                <h4 className="eyebrow" style={{ marginBottom: 16 }}>Weekly Performance Growth</h4>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-.05em' }}>+12%</div>
                <p style={{ fontSize: '.8rem', color: 'var(--ts)', marginTop: 8 }}>Your resume impact has improved significantly this week.</p>
              </div>
              <div className="card" style={{ flex: 1, padding: 24 }}>
                <h4 className="eyebrow" style={{ marginBottom: 16 }}>Industry Percentile</h4>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-.05em' }}>Top 5%</div>
                <p style={{ fontSize: '.8rem', color: 'var(--ts)', marginTop: 8 }}>Competing among the best in the software industry.</p>
              </div>
           </div>
        </div>
      );
    }

    if (tab === 'matcher') return <JobMatcher resumeText={latest?.extractedText || latest?.name || ""} />;
    if (tab === 'coach') return <AICoach scans={scans} />;
    
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--ts)' }}>Content mapping in progress...</div>;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 52, background: 'var(--s1)' }}>
      <aside className="sidebar-panel" style={{ width: 220, borderRight: '.5px solid var(--bl)', background: 'var(--s0)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 52, height: 'calc(100vh - 52px)', overflowY: 'auto' }}>
        <div style={{ padding: '4px 12px 20px', borderBottom: '.5px solid var(--bl)', marginBottom: 16 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 12, background: 'var(--near-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12 }}>{user.name[0]}</div>
              <div><p style={{ fontWeight: 800, fontSize: '.85rem' }}>{user.name}</p><Badge type="dim">Pro Pilot</Badge></div>
           </div>
        </div>
        {SIDE_NAV.map(n => (
          <div key={n.id} className={`slink ${tab === n.id ? 'active' : ''}`} onClick={() => { if (n.id === 'builder') go('livebuilder'); else if (n.id === 'portfolio') go('portfoliomaker'); else setTab(n.id); }}>
            <Icon id={n.ic} size={15} color={tab === n.id ? 'var(--tp)' : 'var(--tt)'} />
            <span style={{ fontSize: '.84rem', fontWeight: 600 }}>{n.l}</span>
            {n.neu && <span style={{ marginLeft: 'auto', background: 'var(--ind)', color: 'white', fontSize: 8, padding: '2px 6px', borderRadius: 6, fontWeight: 900 }}>AI</span>}
          </div>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <Btn v="dark" sz="sm" full pill onClick={() => go('upload')}><Icon id="plus" size={14} color="white" /> New Analysis</Btn>
        </div>
      </aside>
      <main className="dash-main" style={{ flex: 1, padding: '40px 32px', minWidth: 0 }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
