import Icon from '../components/Icon';
import Btn from '../components/Btn';
import Badge from '../components/Badge';

const PortfolioMaker = ({ go, user, data }) => {
  const name = data?.name || user?.name || 'Your Name';
  const tagline = data?.title || 'Building the future of software';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--s1)', paddingTop: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', position: 'relative', overflow: 'hidden' }}>

      {/* Blurred background teaser */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, filter: 'blur(18px)', opacity: 0.18, pointerEvents: 'none', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: 16 }}>
        <div style={{ fontSize: '5rem', fontWeight: 900, letterSpacing: '-.05em' }}>{name}</div>
        <div style={{ fontSize: '1.4rem', opacity: 0.5 }}>{tagline}</div>
        <div style={{ display: 'flex', gap: 24, marginTop: 40, opacity: 0.3 }}>
          {['About', 'Projects', 'Skills', 'Contact'].map(l => <span key={l} style={{ fontSize: '1rem', fontWeight: 600 }}>{l}</span>)}
        </div>
      </div>

      {/* Lock Modal */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div className="card ru" style={{ padding: '48px 40px', borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,.14)', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)' }}>

          <div style={{ width: 64, height: 64, borderRadius: 22, background: 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1.5px solid var(--bl)' }}>
            <Icon id="lock" size={26} color="var(--near-black)" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <Badge type="ind">Coming Soon</Badge>
          </div>

          <h1 style={{ fontSize: '1.7rem', fontWeight: 900, letterSpacing: '-.04em', marginBottom: 12 }}>Portfolio Builder</h1>
          <p style={{ color: 'var(--ts)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: 32 }}>
            Turn your resume into a stunning personal website in under 60 seconds. AI-powered, fully responsive, and instantly deployed.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, textAlign: 'left' }}>
            {[
              'AI-Crafted Narrative from your resume',
              '4 Premium Themes: Minimal, Dev, Creative, Code',
              'Custom domain at hirelens.app',
              'One-click publish to global edge network'
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--s1)', borderRadius: 12 }}>
                <Icon id="check" size={14} color="var(--green)" />
                <span style={{ fontSize: '.84rem', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>

          <Btn v="dark" full sz="lg" pill onClick={() => go('dashboard')}>
            ← Back to Dashboard
          </Btn>
          <p style={{ marginTop: 16, fontSize: '.75rem', color: 'var(--tt)' }}>We'll notify you when Portfolio Builder launches.</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioMaker;
