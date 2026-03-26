import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import Navbar    from './components/Navbar';
import AuthModal from './components/AuthModal';
import Landing   from './pages/Landing';
import Upload    from './pages/Upload';
import Results   from './pages/Results';
import Pricing   from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import LiveBuilder from './pages/LiveBuilder';
import Icon from './components/Icon';
import Btn from './components/Btn';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--s1)', padding: 20 }}>
          <div className="card ru" style={{ maxWidth: 400, padding: 40, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid var(--bl)' }}>
               <Icon id="warn" size={24} color="var(--red)" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>Something went wrong</h2>
            <p style={{ color: 'var(--ts)', fontSize: '.9rem', marginBottom: 24 }}>The app encountered an unexpected error. This usually happens during high traffic.</p>
            <Btn v="dark" pill onClick={() => window.location.reload()}>Reload Hirelens</Btn>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Default structured resume data — used by Portfolio Maker as the live source of truth
const DEFAULT_RESUME = {
  name: '',
  title: '',
  email: '',
  location: '',
  linkedin: '',
  github: '',
  summary: '',
  skills: '',
  experience: [],
  projects: [],
  education: []
};

const App = () => {
  const [page, setPage] = useState(() => localStorage.getItem('hirelens_page') || 'landing');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [results, setResultsState] = useState(() => {
    const cached = localStorage.getItem('hirelens_results');
    return cached ? JSON.parse(cached) : null;
  });
  // Shared structured resume state — LiveBuilder writes, PortfolioMaker reads
  const [resumeData, setResumeDataState] = useState(() => {
    const cached = localStorage.getItem('hirelens_resumeData');
    return cached ? JSON.parse(cached) : DEFAULT_RESUME;
  });
  const [showLogout, setShowLogout] = useState(false);

  const go = p => {
    setPage(p);
    localStorage.setItem('hirelens_page', p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setResults = (data) => {
    setResultsState(data);
    if (data) localStorage.setItem('hirelens_results', JSON.stringify(data));
    else localStorage.removeItem('hirelens_results');
  };

  const setResumeData = (data) => {
    setResumeDataState(data);
    if (data) localStorage.setItem('hirelens_resumeData', JSON.stringify(data));
    else localStorage.removeItem('hirelens_resumeData');
  };

  const login = u => {
    setUser(u);
    setShowAuth(false);
    if (u) checkOnboarding(u.uid);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setShowLogout(false);
      go('landing');
      setResults(null);
      setResumeData(DEFAULT_RESUME);
    } catch(e) { console.error(e); }
  };

  const checkOnboarding = async (uid) => {
    try {
      const q = await getDocs(collection(db, 'users', uid, 'scans'));
      if (q.empty) {
        go('upload');
      } else {
        go('dashboard');
      }
    } catch(e) {
      console.error("Onboarding check failed:", e);
      go('dashboard'); // Fallback
    }
  };

  useEffect(() => {
    const titles = {
      landing: 'Hirelens | AI-powered Resume Intelligence',
      upload: 'Analyze Your Resume | Hirelens',
      results: 'Your Resume Report | Hirelens',
      dashboard: 'Dashboard | Hirelens Career OS',
      livebuilder: 'Expert Resume Builder | Hirelens',
      pricing: 'Pricing & Plans | Hirelens',
    };
    document.title = titles[page] || 'Hirelens';
  }, [page]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email
        };
        setUser(u);
        // If we are on landing and just logged in, check where to go
        if (page === 'landing') {
          checkOnboarding(firebaseUser.uid);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  const openAuth = () => setShowAuth(true);

  const screens = {
    landing:   <Landing   go={go} onAuth={openAuth} />,
    upload:    <Upload    go={go} user={user} onAuth={openAuth} setResults={setResults} />,
    results:   <Results   go={go} user={user} onAuth={openAuth} data={results} />,
    pricing:   <Pricing   go={go} onAuth={openAuth} />,
    dashboard: <Dashboard go={go} user={user} onAuth={openAuth} />,
    resumebuilder: <ResumeBuilder go={go} user={user} />,
    livebuilder: <LiveBuilder go={go} user={user} onDataChange={setResumeData} />,
  };

  const LogoutModal = () => (
    <div className="rf" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }} onClick={() => setShowLogout(false)} />
      <div className="card ru glass" style={{ position: 'relative', width: '100%', maxWidth: 380, padding: 32, textAlign: 'center', borderRadius: 28, border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
         <div style={{ width: 64, height: 64, borderRadius: 22, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid var(--bl)' }}>
            <Icon id="award" size={24} color="var(--ts)" />
         </div>
         <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 10, letterSpacing: '-.03em' }}>Ready to exit?</h2>
         <p style={{ color: 'var(--ts)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 32 }}>You will be signed out of your Hirelens session. All your scans are safe.</p>
         <div style={{ display: 'flex', gap: 12 }}>
            <Btn v="ghost" full sz="lg" pill onClick={() => setShowLogout(false)}>Cancel</Btn>
            <Btn v="dark" full sz="lg" pill onClick={() => handleLogout()}>Sign Out</Btn>
         </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <Navbar page={page} go={go} user={user} onAuth={openAuth} onLogout={() => setShowLogout(true)} />
      {screens[page] || screens.landing}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={login}
        />
      )}
      {showLogout && <LogoutModal />}
    </ErrorBoundary>
  );
};

export default App;
