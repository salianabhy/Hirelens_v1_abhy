import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar    from './components/Navbar';
import AuthModal from './components/AuthModal';
import Landing   from './pages/Landing';
import Upload    from './pages/Upload';
import Results   from './pages/Results';
import Pricing   from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import LiveBuilder from './pages/LiveBuilder';
import PortfolioMaker from './pages/PortfolioMaker';

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
  const [page,        setPage]       = useState('landing');
  const [user,        setUser]       = useState(null);
  const [showAuth,    setShowAuth]   = useState(false);
  const [results,     setResults]    = useState(null);
  // Shared structured resume state — LiveBuilder writes, PortfolioMaker reads
  const [resumeData,  setResumeData] = useState(DEFAULT_RESUME);

  const go = p => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = u => {
    setUser(u);
    setShowAuth(false);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email
        });
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
    portfoliomaker: <PortfolioMaker go={go} user={user} data={resumeData} />,
  };

  return (
    <>
      <Navbar page={page} go={go} user={user} onAuth={openAuth} />
      {screens[page] || screens.landing}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={login}
        />
      )}
    </>
  );
};

export default App;
