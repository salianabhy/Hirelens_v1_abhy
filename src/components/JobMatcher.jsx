import { useState } from 'react';
import Groq from 'groq-sdk';
import Icon from './Icon';
import Btn from './Btn';
import Badge from './Badge';

const JobMatcher = ({ resumeText = "" }) => {
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const performMatch = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("Missing VITE_GROQ_API_KEY in .env.local");
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      
      const prompt = `
        You are an expert technical recruiter matching a resume to a job description.
        Job Description:
        ${jd}

        Resume:
        ${resumeText}

        Evaluate the resume strictly against the JD. Respond ONLY with a JSON object in this exact format:
        {
          "score": number (0-100 match percentage),
          "match_analysis": "Detailed string explaining exactly why the resume matches or falls short, and overall strategic thoughts",
          "matched_skills": ["List of core skills found in both"],
          "missing_skills": ["List of critical skills missing from resume"],
          "action_plan": [
            { "step": "Short action title", "reason": "Detailed explanation of what to do" }
          ],
          "what_to_learn": ["Specific tech 1", "Specific tech 2"],
          "roadmap_slug": "A valid slug from roadmap.sh (e.g. frontend, backend, devops, python, react, full-stack, computer-science) that best fits the missing skills"
        }
        Return ONLY valid JSON.
      `;

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
      });

      const textContent = completion.choices[0]?.message?.content || "{}";
      const cleanJson = textContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      setResult(JSON.parse(cleanJson));
    } catch (err) {
      console.error(err);
      alert("Failed to connect to AI match engine: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="ru card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--ind)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon id="target" size={20} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Job Match v2.0</h2>
          <p style={{ fontSize: '.8rem', color: 'var(--ts)' }}>Enterprise-grade JD analysis and skill gap reporting.</p>
        </div>
      </div>

      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <textarea 
            className="inp" 
            placeholder="Paste the Job Description here..." 
            style={{ height: 220, fontSize: '.85rem', lineHeight: 1.6 }}
            value={jd}
            onChange={e => setJd(e.target.value)}
          />
          <Btn v="dark" sz="lg" pill full onClick={performMatch} disabled={loading || !jd.trim()}>
            {loading ? 'Analyzing Talent-JD Intersection...' : 'Analyze Skill Gaps'}
          </Btn>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, animation: 'fadeIn .4s ease' }}>
          
          {/* Score Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 24, background: 'var(--near-black)', borderRadius: 24, color: 'white' }}>
             <div style={{ position: 'relative', width: 90, height: 90 }}>
                <svg width="90" height="90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--ind)" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * result.score / 100)} transform="rotate(-90 50 50)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem' }}>{result.score}%</div>
             </div>
             <div>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{result.score > 75 ? 'Ready to Apply' : 'Skill Gap Detected'}</h3>
               <p style={{ fontSize: '.84rem', color: 'rgba(255,255,255,.6)', marginTop: 4 }}>
                 {result.score > 75 ? "Your profile is a top-tier match for this role." : "A few critical keywords are missing to clear the ATS threshold."}
               </p>
               <Btn v="white" sz="xs" pill onClick={() => setResult(null)} style={{ marginTop: 12 }}>Check Another Role</Btn>
             </div>
          </div>

          {/* Detailed Match Analysis */}
          <div className="card-tint" style={{ padding: 24 }}>
             <h4 style={{ fontSize: '.9rem', fontWeight: 800, marginBottom: 12 }}>Match Analysis</h4>
             <p style={{ fontSize: '.85rem', color: 'var(--ts)', lineHeight: 1.6 }}>{result.match_analysis}</p>
          </div>

          {/* Skills Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
             <div className="card" style={{ padding: 16, borderTop: '4px solid var(--green)' }}>
                <h4 style={{ fontSize: '.8rem', fontWeight: 800, marginBottom: 12, color: 'var(--green)' }}>Matched Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.matched_skills?.map(s => <Badge key={s} type="green">{s}</Badge>)}
                </div>
             </div>
             <div className="card" style={{ padding: 16, borderTop: '4px solid var(--red)' }}>
                <h4 style={{ fontSize: '.8rem', fontWeight: 800, marginBottom: 12, color: 'var(--red)' }}>Missing Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.missing_skills?.map(s => <Badge key={s} type="dim">{s}</Badge>)}
                </div>
             </div>
          </div>

          {/* Actionable Recommendations & Learning Path */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
             <div className="card" style={{ padding: 24, gridColumn: 'span 2' }}>
                <h4 className="eyebrow" style={{ marginBottom: 16 }}>What to Do First</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   {result.action_plan?.map((act, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12 }}>
                         <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--s1)', color: 'var(--ts)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{i+1}</div>
                         <div>
                            <h5 style={{ fontSize: '.85rem', fontWeight: 700 }}>{act.step}</h5>
                            <p style={{ fontSize: '.75rem', color: 'var(--ts)', marginTop: 4, lineHeight: 1.5 }}>{act.reason}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="card" style={{ padding: 24, background: 'var(--ind)', color: 'white', gridColumn: '1 / -1' }}>
                <h4 className="eyebrow" style={{ marginBottom: 16, color: 'rgba(255,255,255,.7)' }}>What to Learn</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  {result.what_to_learn?.map(l => (
                     <span key={l} style={{ background: 'rgba(0,0,0,.2)', padding: '6px 12px', borderRadius: 8, fontSize: '.75rem', fontWeight: 600 }}>{l}</span>
                  ))}
                </div>
                
                {result.roadmap_slug && (
                  <Btn v="white" sz="lg" full onClick={() => window.open(`https://roadmap.sh/${result.roadmap_slug?.toLowerCase()}`, '_blank')}>
                    View {result.roadmap_slug} Roadmap <Icon id="arrow" size={14} color="var(--ind)" />
                  </Btn>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobMatcher;
