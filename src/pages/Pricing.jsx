import Icon from '../components/Icon';
import Btn from '../components/Btn';
import Badge from '../components/Badge';
import Divider from '../components/Divider';

const Pricing = ({ go, onAuth }) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: 'forever',
      desc: 'Get started — no credit card required.',
      dark: false,
      cta: 'Get started free',
      action: () => go('upload'),
      features: [
        { t: '1 resume scan / month', on: true },
        { t: 'Overall match score', on: true },
        { t: 'Basic issue list', on: true },
        { t: 'Detailed breakdown', on: false },
        { t: 'Improvement suggestions', on: false },
        { t: 'ATS keyword analysis', on: false },
        { t: 'Interview prep questions', on: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹0',
      period: '/month',
      desc: 'Offer for Initial customers.',
      dark: true,
      cta: 'Upgrade to Pro',
      action: onAuth,
      features: [
        { t: 'Unlimited resume scans', on: true },
        { t: 'Overall match score', on: true },
        { t: 'Full issue breakdown', on: true },
        { t: 'Improvement suggestions', on: true },
        { t: 'ATS keyword analysis', on: true },
        { t: 'Interview prep questions', on: true },
        { t: 'Priority support', on: true },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: 52 }}>

      {/* Header */}
      <div className="pricing-head" style={{ maxWidth: 1120, margin: '0 auto', padding: '84px 28px 60px', textAlign: 'center' }}>
        <p className="eyebrow ru" style={{ marginBottom: 18 }}>Pricing</p>
        <h1 className="ru d1" style={{ fontSize: 'clamp(2rem,5vw,3.6rem)', fontWeight: 700, letterSpacing: '-.05em', marginBottom: 14, lineHeight: 1.06 }}>
          Simple pricing.<br />
          <span style={{ color: 'var(--ts)', fontStyle: 'italic', fontFamily: "'Instrument Serif',serif" }}>No surprises.</span>
        </h1>
        <p className="ru d2" style={{ color: 'var(--ts)', fontSize: 'clamp(.9rem,1.2vw,1.05rem)', maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
          One well-optimized resume can unlock the career you deserve.
        </p>
      </div>

      {/* Plan cards */}
      <div className="plan-grid pricing-grid" style={{ maxWidth: 780, margin: '0 auto', padding: '0 20px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18 }}>
        {plans.map((plan, i) => (
          <div
            key={plan.id}
            className={`ru ${plan.dark ? 'grain' : 'card'}`}
            style={{
              animationDelay: `${i * .13}s`,
              padding: '34px 28px',
              borderRadius: 26,
              position: 'relative',
              background: plan.dark ? 'var(--near-black)' : 'var(--s0)',
              border: plan.dark ? 'none' : '.5px solid var(--bl)',
              overflow: 'hidden',
            }}
          >
            {/* Pro ambient glow */}
            {plan.dark && (
              <div style={{ position: 'absolute', top: '-40%', left: '-20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(94,92,230,.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
            )}

            {/* Offer badge */}
            {plan.dark && (
              <div style={{ position: 'absolute', top: 18, right: 18 }}>
                <Badge type="red">Special Offer!</Badge>
              </div>
            )}

            {/* Plan info */}
            <div style={{ marginBottom: 26, position: 'relative' }}>
              <p style={{ fontWeight: 700, fontSize: '.85rem', marginBottom: 6, color: plan.dark ? 'var(--td)' : 'var(--ts)' }}>
                {plan.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 9 }}>
                <span style={{ fontFamily: "'Instrument Sans'", fontSize: 'clamp(2.2rem,4vw,3rem)', fontWeight: 700, letterSpacing: '-.05em', color: plan.dark ? 'var(--tw)' : 'var(--tp)' }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '.88rem', color: plan.dark ? 'rgba(255,255,255,.28)' : 'var(--tt)' }}>
                  {plan.period}
                </span>
              </div>
              <p style={{ fontSize: '.84rem', color: plan.dark ? 'var(--td)' : 'var(--ts)', lineHeight: 1.55 }}>
                {plan.desc}
              </p>
            </div>

            <Divider dark={plan.dark} m="0 0 22px" />

            {/* Features list */}
            <ul style={{ listStyle: 'none', marginBottom: 26, position: 'relative' }}>
              {plan.features.map((f, j) => (
                <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11, opacity: f.on ? 1 : .3 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0, background: plan.dark ? 'rgba(255,255,255,.1)' : 'var(--s1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon id="check" size={10} color={plan.dark ? 'rgba(255,255,255,.8)' : 'var(--tp)'} sw={2.5} />
                  </div>
                  <span style={{ fontSize: '.85rem', fontWeight: 500, color: plan.dark ? 'rgba(255,255,255,.68)' : 'var(--ts)', textDecoration: f.on ? 'none' : 'line-through' }}>
                    {f.t}
                  </span>
                </li>
              ))}
            </ul>

            <Btn
              v={plan.dark ? 'white' : 'dark'}
              sz="lg" full pill
              onClick={plan.action}
              style={{ position: 'relative' }}
            >
              {plan.cta} {plan.dark && <Icon id="arrow" size={14} />}
            </Btn>
          </div>
        ))}
      </div>

      {/* Fine print */}
      <p style={{ textAlign: 'center', paddingBottom: 72, fontSize: 11, color: 'var(--tt)', lineHeight: 1.7 }}>
        Secure payments · 7-day money-back guarantee · Cancel any time · Prices include GST
      </p>
    </div>
  );
};

export default Pricing;
