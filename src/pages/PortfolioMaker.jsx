import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Btn from '../components/Btn';
import Badge from '../components/Badge';

const STEPS = [
  { id: 'style',     l: 'Choose Style',  ic: 'grid' },
  { id: 'custom',    l: 'Customize',     ic: 'settings' },
  { id: 'ai',        l: 'AI Storytelling', ic: 'brain' },
  { id: 'preview',   l: 'Review',        ic: 'eye' },
  { id: 'publish',   l: 'Launch',        ic: 'globe' }
];

const THEMES = [
  { id: 'modern',  l: 'Digital Nomad', cat: 'Developer', bg: '#080808', text: '#fff', accent: '#6366f1', font: 'Inter' },
  { id: 'minimal', l: 'The Architect', cat: 'Minimal',  bg: '#ffffff', text: '#000', accent: '#000', font: 'Playfair Display' },
  { id: 'aurora',  l: 'Creative Pulse', cat: 'Creative', bg: 'linear-gradient(135deg, #0f172a, #1e293b)', text: '#fff', accent: '#38bdf8', font: 'Inter' },
  { id: 'code',    l: 'Binary Dev',    cat: 'Popular',  bg: '#000', text: '#0f0', accent: '#0f0', font: 'Fira Code' }
];

const PortfolioMaker = ({ go, user, data }) => {
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState('modern');
  const [config, setConfig] = useState({
     primary: '#6366f1',
     font: 'Inter',
     layout: 'centered',
     mode: 'dark',
     tone: 'Professional'
  });
  const [viewport, setViewport] = useState('desktop');
  const [deploying, setDeploying] = useState(false);
  const [isLinked, setIsLinked] = useState(true);

  // Core Portfolio Data (Synced from Resume or Edited)
  const [portfolioData, setPortfolioData] = useState({
     name: data?.name || user?.name || '',
     tagline: data?.title || 'Building the future of software',
     summary: data?.summary || '',
     skills: data?.skills || '',
     experience: data?.experience || [],
     projects: data?.projects || []
  });
  const [storyMode, setStoryMode] = useState({});

  // Typing Effect for Tagline
  const [typedTagline, setTypedTagline] = useState('');
  useEffect(() => {
     let i = 0;
     const fullText = portfolioData.tagline;
     const timer = setInterval(() => {
        setTypedTagline(fullText.slice(0, i));
        i++;
        if (i > fullText.length) clearInterval(timer);
     }, 40);
     return () => clearInterval(timer);
  }, [portfolioData.tagline]);

  useEffect(() => {
    if (isLinked && data) {
      setPortfolioData({
        name: data?.name || user?.name || '',
        tagline: data?.title || 'Software Engineer & Builder',
        summary: data?.summary || '',
        skills: data?.skills || '',
        experience: data?.experience || [],
        projects: data?.projects || []
      });
    }
  }, [data, isLinked, user]);

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  /* ───── AI ENGINE ───── */
  const generateNarrative = () => {
    setPortfolioData(prev => ({
       ...prev,
       summary: `Passionate engineer with a focus on ${data?.skills?.split('|')[0] || 'innovative solutions'}. Throughout my tenure at ${data?.experience?.[0]?.company || 'various top-tier firms'}, I have specialized in bridging the gap between complex requirements and high-performance execution. I lead with empathy, code with precision, and scale with purpose.`,
       tagline: `${data?.title || 'Software Architect'} | ${config.tone} Influencer`
    }));
  };

  const publishSite = () => {
    setDeploying(true);
    setTimeout(() => {
       setDeploying(false);
       window.alert(`🚀 Portfolio LIVE! Your custom URL: ${user?.name?.toLowerCase().replace(' ', '-')}.hirelens.app`);
    }, 2800);
  };

  /* ───── UI RENDERERS ───── */
  const renderStepContent = () => {
    switch(STEPS[step].id) {
      case 'style':
        return (
          <div className="ru">
            <h3 style={{ fontWeight: 800, marginBottom: 24 }}>Choose your visual identity</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
               {THEMES.map(t => (
                 <div key={t.id} onClick={() => setTheme(t.id)} style={{ cursor: 'pointer', border: theme === t.id ? '2.5px solid var(--ind)' : '1px solid var(--bl)', borderRadius: 20, overflow: 'hidden', background: 'var(--s1)', transition: 'all .2s ease' }} className="theme-card">
                    <div style={{ padding: 12, background: t.bg, borderBottom: '1px solid var(--bl)' }}>
                       <div style={{ padding: 20, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}>
                          <div style={{ width: 24, height: 2, background: t.accent, marginBottom: 8 }} />
                          <div style={{ width: 40, height: 6, background: t.text, opacity: 0.1, borderRadius: 2 }} />
                       </div>
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div><p style={{ fontSize: '.8rem', fontWeight: 800 }}>{t.l}</p><span style={{ fontSize: '.65rem', color: 'var(--ts)' }}>{t.cat}</span></div>
                       {theme === t.id && <Icon id="check" size={14} color="var(--ind)" />}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        );
      case 'custom':
        return (
          <div className="ru">
             <h3 style={{ fontWeight: 800, marginBottom: 24 }}>Polishing the details</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                   <label style={{ fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ts)', marginBottom: 12, display: 'block' }}>Primary Accent</label>
                   <div style={{ display: 'flex', gap: 10 }}>
                      {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#000'].map(c => (
                        <div key={c} onClick={() => setConfig({...config, primary: c})} style={{ width: 32, height: 32, borderRadius: 32, background: c, border: config.primary === c ? '3px solid white' : 'none', cursor: 'pointer', outline: config.primary === c ? '2px solid var(--ind)' : 'none' }} />
                      ))}
                   </div>
                </div>
                <div>
                   <label style={{ fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ts)', marginBottom: 12, display: 'block' }}>Typography</label>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {['Inter', 'Playfair Display', 'Fira Code'].map(f => (
                        <div key={f} onClick={() => setConfig({...config, font: f})} style={{ padding: '12px 16px', borderRadius: 12, border: config.font === f ? '2px solid var(--ind)' : '1px solid var(--bl)', cursor: 'pointer', background: 'var(--s1)', fontFamily: f }}>{f} Style</div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        );
      case 'ai':
        return (
          <div className="ru">
             <div className="card-tint" style={{ padding: 24, borderRadius: 24, textAlign: 'center', marginBottom: 24 }}>
                <Icon id="brain" size={24} color="var(--ind)" style={{ marginBottom: 12 }} />
                <h4 style={{ fontWeight: 800, marginBottom: 8 }}>AI Narrative Generator</h4>
                <p style={{ fontSize: '.8rem', color: 'var(--ts)', lineHeight: 1.5, marginBottom: 20 }}>Let our AI synthesize your resume into a compelling personal journey.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                   {['Professional', 'Bold', 'Creative'].map(t => (
                     <Badge key={t} type={config.tone === t ? 'ind' : 'dim'} style={{ cursor: 'pointer' }} onClick={() => setConfig({...config, tone: t})}>{t}</Badge>
                   ))}
                </div>
                <Btn v="dark" full sz="lg" pill onClick={generateNarrative}>Generate My Story</Btn>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="card" style={{ padding: 16 }}>
                   <p style={{ fontSize: '.75rem', fontWeight: 800, marginBottom: 8, color: 'var(--ts)' }}>Tagline Preview</p>
                   <p style={{ fontSize: '.9rem', fontWeight: 600 }}>{portfolioData.tagline}</p>
                </div>
             </div>
          </div>
        );
      case 'preview':
        return (
          <div className="ru">
             <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Portfolio Resonance</h3>
             <div className="card-tint" style={{ padding: 20, borderRadius: 20, marginBottom: 24 }}>
                <p style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--ts)', marginBottom: 12 }}>RECRUITER TARGETING (BETA)</p>
                <input type="text" placeholder="Paste Job Description..." style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--bl)', background: 'var(--s1)', fontSize: '.85rem', marginBottom: 16 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '.8rem', fontWeight: 700 }}>Alignment Score</span>
                   <span style={{ color: 'var(--ind)', fontWeight: 900 }}>88%</span>
                </div>
             </div>
             <p style={{ fontSize: '.85rem', color: 'var(--ts)', lineHeight: 1.6, marginBottom: 32 }}>Your portfolio is optimized for {portfolioData.experience.length} roles and {portfolioData.projects.length} projects.</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--s1)', borderRadius: 16 }}>
                   <Icon id="check" size={16} color="var(--green)" />
                   <span style={{ fontSize: '.85rem', fontWeight: 700 }}>Resume Synced ({isLinked ? 'Auto' : 'Manual'})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--s1)', borderRadius: 16 }}>
                   <Icon id="check" size={16} color="var(--green)" />
                   <span style={{ fontSize: '.85rem', fontWeight: 700 }}>AI Enhancements Applied</span>
                </div>
             </div>
          </div>
        );
      case 'publish':
        return (
          <div className="ru">
             <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 24, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                   <Icon id="globe" size={32} color="var(--ind)" />
                </div>
                <h3 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: 12 }}>Ready to launch?</h3>
                <p style={{ color: 'var(--ts)', fontSize: '.85rem', marginBottom: 32 }}>Your personal site will be instantly deployed to our global edge network.</p>
                
                <div style={{ background: 'var(--s1)', padding: 16, borderRadius: 16, border: '1px dashed var(--bl)', marginBottom: 32 }}>
                   <p style={{ fontSize: '.7rem', textTransform: 'uppercase', color: 'var(--tt)', fontWeight: 800, marginBottom: 4 }}>Predicted URL</p>
                   <p style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--ind)' }}>{user?.name?.toLowerCase().replace(' ', '-')}.hirelens.app</p>
                </div>

                <Btn v="dark" full sz="lg" pill onClick={publishSite} disabled={deploying}>
                  {deploying ? 'Linking Assets...' : 'Launch Website'}
                </Btn>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--s1)', paddingTop: 52 }}>
      
      <style>{`
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .revealUp { animation: revealUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .theme-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.2); }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        @keyframes blink { 50% { opacity: 0; } }
        .cursor { animation: blink 1s step-end infinite; }
      `}</style>

      {/* ───── TOP PROGRESS INDICATOR ───── */}
      <div style={{ width: '100%', background: 'var(--s0)', borderBottom: '1px solid var(--bl)', padding: '24px 0', position: 'sticky', top: 52, zIndex: 100 }}>
         <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', gap: 40 }}>
                {STEPS.map((s, i) => (
                   <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: step >= i ? 1 : 0.3, transition: 'all .3s ease' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 10, background: step === i ? 'var(--ind)' : step > i ? 'var(--near-black)' : 'var(--bl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 13 }}>{i + 1}</div>
                      <span style={{ fontSize: '.85rem', fontWeight: 700, display: step === i ? 'block' : 'none' }}>{s.l}</span>
                   </div>
                ))}
             </div>
             <Btn v="ghost" sz="sm" pill onClick={() => go('dashboard')}>Exit Designer</Btn>
         </div>
      </div>

      {/* ───── MAIN BUILDER INTERFACE ───── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px' }}>
         <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 60, alignItems: 'start' }}>
            
            {/* Left: Component-based Editor */}
            <div style={{ position: 'sticky', top: 160 }}>
               {renderStepContent()}
               
               <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--bl)', display: 'flex', justifyContent: 'space-between' }}>
                  <Btn v="light" sz="md" pill onClick={prevStep} disabled={step === 0}>Back</Btn>
                  <Btn v="ind"   sz="md" pill onClick={nextStep} disabled={step === STEPS.length - 1}>Continue</Btn>
               </div>
            </div>

            {/* Right: Device-aware Live Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  {['mobile', 'tablet', 'desktop'].map(v => (
                    <div key={v} onClick={() => setViewport(v)} style={{ padding: '8px 12px', background: viewport === v ? 'var(--near-black)' : 'var(--s0)', borderRadius: 10, cursor: 'pointer', transition: 'all .2s' }}>
                       <Icon id={v === 'desktop' ? 'grid' : v === 'mobile' ? 'target' : 'file'} size={14} color={viewport === v ? 'white' : 'var(--ts)'} />
                    </div>
                  ))}
               </div>

               <div className="card" style={{ padding: 12, background: '#e5e7eb', borderRadius: 40, border: '8px solid #374151', height: 740, width: viewport === 'mobile' ? 380 : viewport === 'tablet' ? 640 : '100%', margin: '0 auto', overflow: 'hidden', position: 'relative', transition: 'all .5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  {deploying && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                       <div className="pulse" style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--ind)', marginBottom: 24 }} />
                       <h3 style={{ fontWeight: 800 }}>Optimizing Assets...</h3>
                    </div>
                  )}

                  <div style={{ 
                    height: '100%', width: '100%', overflowY: 'auto', 
                    background: currentTheme.bg, color: currentTheme.text, 
                    borderRadius: 24, fontStyle: config.font 
                  }} className="no-scroll">
                     
                     <div style={{ padding: '60px 40px', fontFamily: config.font }}>
                         
                         {/* Preview Header */}
                         <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 80 }}>
                            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: config.primary }}>{portfolioData.name[0]}L</div>
                            <div style={{ display: 'flex', gap: 20, fontSize: '.75rem', fontWeight: 600, opacity: 0.6 }}>
                               <span>About</span><span>Projects</span><span>Connect</span>
                            </div>
                         </nav>

                         {/* Hero Section */}
                         <section style={{ marginBottom: 120, textAlign: config.layout === 'centered' ? 'center' : 'left' }}>
                            <div className="revealUp" style={{ padding: '2px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)', display: 'inline-block', fontSize: '.7rem', fontWeight: 800, marginBottom: 24, color: config.primary }}>AVAILABLE FOR ROLES</div>
                            <h1 className="revealUp" style={{ fontSize: viewport === 'mobile' ? '2.4rem' : '4.5rem', fontWeight: 900, letterSpacing: '-.05em', marginBottom: 20, lineHeight: 1 }}>{portfolioData.name || 'Your Name'}</h1>
                            <p className="revealUp" style={{ fontSize: '1.3rem', opacity: 0.6, fontWeight: 500, maxWidth: 600, margin: config.layout === 'centered' ? '0 auto' : '0' }}>
                               <span style={{ color: config.primary }}>{typedTagline}</span><span className="cursor" style={{ borderLeft: `2px solid ${config.primary}`, marginLeft: 4, animation: 'blink 1s infinite' }} />
                            </p>
                         </section>

                         {/* About Section */}
                         <section style={{ marginBottom: 100 }} className="revealUp">
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 32, opacity: 0.4 }}>THE STORY</h2>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.8, opacity: 0.9 }}>{portfolioData.summary || 'Summary placeholder...'}</p>
                         </section>

                         {/* Projects Grid */}
                         <section className="revealUp">
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 32, opacity: 0.4 }}>SELECTED WORKS</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                               {(portfolioData.projects || []).slice(0, 3).map((p, i) => (
                                 <div key={i} style={{ padding: 40, borderRadius: 32, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all .3s ease' }} className="theme-card">
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>{p.title}</h3>
                                    <p style={{ opacity: 0.6, fontSize: '.95rem', lineHeight: 1.6 }}>{p.desc}</p>
                                 </div>
                               ))}
                            </div>
                         </section>

                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default PortfolioMaker;
