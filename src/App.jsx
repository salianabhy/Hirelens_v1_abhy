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

const App = () => {
  const [page,     setPage]     = useState('landing');
  const [user,     setUser]     = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [results,  setResults]  = useState(null); // Dynamic scan results

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
    livebuilder: <LiveBuilder go={go} user={user} />,
    portfoliomaker: <PortfolioMaker go={go} user={user} data={results} />,
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
