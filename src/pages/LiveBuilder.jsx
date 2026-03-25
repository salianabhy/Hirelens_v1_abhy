import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Btn from '../components/Btn';
import Badge from '../components/Badge';
import ProgressRow from '../components/ProgressRow';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';

const LiveBuilder = ({ go, user, onDataChange }) => {
  const [data, setData] = useState({
    name: 'Nishanth P',
    title: 'Senior Full Stack Engineer',
    email: 'nishanth@example.com',
    location: 'Bangalore, India',
    linkedin: 'linkedin.com/in/nishanth',
    github: 'github.com/nishanth',
    summary: 'High-impact engineer specialized in building scalable reactive systems and AI-driven platforms. Proven track record of reducing latency and optimizing cloud costs.',
    skills: 'React | Node.js | Python | AWS | Docker | PostgreSQL',
    experience: [
      { id: 1, role: 'Senior Developer', company: 'Tech Corp', period: '2021 — Present', desc: 'Spearheaded the development of a real-time analytics engine, serving 50k+ daily active users and reducing data lag by 40%.' },
      { id: 2, role: 'Full Stack Engineer', company: 'Startup Inc', period: '2019 — 2021', desc: 'Engineered a modular frontend architecture that improved page load speeds by 65%. Automated CI/CD pipelines using Jenkins.' }
    ],
    projects: [
      { id: 1, title: 'AI Portfolio Builder', tech: 'React, Gemini, Firebase', desc: 'Developed an automated system to convert resumes into responsive portfolios in under 10 seconds.' }
    ],
    education: [
      { id: 1, school: 'University of Technology', degree: 'B.Tech in Computer Science', year: '2019' }
    ]
  });

  const [activeLayer, setActiveLayer] = useState('personal');
  const [template, setTemplate] = useState('classic');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showATS, setShowATS] = useState(false);
  const [jdBuffer, setJdBuffer] = useState('');

  // Sync data up to App.jsx whenever it changes so Portfolio Maker stays in sync
  useEffect(() => {
    if (onDataChange) onDataChange(data);
  }, [data]);

  const update = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const updateItem = (listKey, id, key, val) => {
    setData(prev => ({
      ...prev,
      [listKey]: prev[listKey].map(item => item.id === id ? { ...item, [key]: val } : item)
    }));
  };

  const addItem = (listKey, schema) => {
    const newItem = { id: Date.now(), ...schema };
    update(listKey, [...data[listKey], newItem]);
  };

  const removeItem = (listKey, id) => {
    update(listKey, data[listKey].filter(item => item.id !== id));
  };

  const moveItem = (listKey, index, direction) => {
    const newList = [...data[listKey]];
    const target = index + direction;
    if (target < 0 || target >= newList.length) return;
    [newList[index], newList[target]] = [newList[target], newList[index]];
    update(listKey, newList);
  };

  const improveBullet = (type, id, currentText) => {
    const verbs = ['Spearheaded', 'Orchestrated', 'Optimized', 'Architected', 'Engineered', 'Pioneered'];
    const metrics = ['40% reduction in latency', '15% increase in conversion', 'saving $20k/month', 'serving 50k+ users', 'achieving 99.9% uptime'];
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const m = metrics[Math.floor(Math.random() * metrics.length)];
    const improved = `${v} the development of critical features, resulting in a ${m} through technical excellence.`;
    
    if (type === 'exp') {
      update('experience', data.experience.map(e => e.id === id ? { ...e, desc: improved } : e));
    } else if (type === 'proj') {
      update('projects', data.projects.map(p => p.id === id ? { ...p, desc: improved } : p));
    } else {
      update('summary', improved);
    }
  };

  const autoOptimize = () => {
    if (!jdBuffer.trim()) return;
    const skills = ['React', 'Node.js', 'Typescript', 'AWS', 'Docker', 'GraphQL', 'System Design'];
    const matched = skills.filter(s => jdBuffer.toLowerCase().includes(s.toLowerCase()));
    if (matched.length > 0) {
       const current = data.skills.split('|').map(s => s.trim());
       const missing = matched.filter(s => !current.includes(s));
       if (missing.length > 0) {
         update('skills', [...current, ...missing].join(' | '));
       }
    }
    setJdBuffer('');
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      const checkPage = (h) => {
        if (y + h > 280) { doc.addPage(); y = 20; }
      };

      const sectionHeader = (txt) => {
        checkPage(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(txt.toUpperCase(), margin, y);
        y += 2;
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      };

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text((data.name || "").toUpperCase(), margin, y);
      y += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(data.title || "", margin, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(`${data.location || ""} | ${data.email || ""} | ${data.linkedin || ""} | ${data.github || ""}`, margin, y);
      y += 15;

      // Experience
      if (data.experience && data.experience.length > 0) {
        sectionHeader("Experience");
        data.experience.forEach(exp => {
          checkPage(20);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text(`${exp.company || ""} — ${exp.role || ""}`, margin, y);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(exp.period || "", pageWidth - margin, y, { align: 'right' });
          y += 6;
          const lines = doc.splitTextToSize(exp.desc || "", pageWidth - (margin * 2) - 8);
          lines.forEach(line => {
            checkPage(6);
            doc.text("• " + line, margin + 2, y);
            y += 5;
          });
          y += 6;
        });
      }

      // Projects
      if (data.projects && data.projects.length > 0) {
        sectionHeader("Projects");
        data.projects.forEach(p => {
          checkPage(15);
          doc.setFont("helvetica", "bold");
          doc.text(`${p.title || ""} | ${p.tech || ""}`, margin, y);
          y += 6;
          doc.setFont("helvetica", "normal");
          const pLines = doc.splitTextToSize(p.desc || "", pageWidth - (margin * 2) - 8);
          pLines.forEach(line => {
            checkPage(6);
            doc.text("• " + line, margin + 2, y);
            y += 5;
          });
          y += 6;
        });
      }

      // Education
      if (data.education && data.education.length > 0) {
        sectionHeader("Education");
        data.education.forEach(edu => {
          checkPage(15);
          doc.setFont("helvetica", "bold");
          doc.text(edu.school || "", margin, y);
          doc.setFont("helvetica", "normal");
          doc.text(edu.year || "", pageWidth - margin, y, { align: 'right' });
          y += 6;
          doc.text(edu.degree || "", margin, y);
          y += 10;
        });
      }

      doc.save(`${(data.name || "Resume").replace(/\s+/g, '_')}_Elite_Resume.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to export PDF.");
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--s1)', paddingTop: 52 }}>
      
      {/* 1. Left Editor Side */}
      <div style={{ width: '42%', borderRight: '.5px solid var(--bl)', background: 'var(--s0)', overflowY: 'auto', padding: '32px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
           <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-.04em' }}>Elite Editor</h1>
           <Btn v="ghost" sz="sm" pill onClick={() => go('dashboard')}>Exit</Btn>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 10 }}>
           {['personal', 'experience', 'projects', 'skills', 'education', 'review'].map(l => (
             <Btn key={l} v={activeLayer === l ? 'dark' : 'ghost'} sz="xs" pill onClick={() => setActiveLayer(l)} style={{ whiteSpace: 'nowrap' }}>
               {l.charAt(0).toUpperCase() + l.slice(1)}
             </Btn>
           ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
           {activeLayer === 'personal' && (
             <div className="rf">
               <div className="rb-form-full" style={{ marginBottom: 24 }}>
                  <label className="rb-label">Auto-Optimize with Job Description</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <textarea className="inp" value={jdBuffer} onChange={e => setJdBuffer(e.target.value)} placeholder="Paste JD here to auto-align skills..." style={{ height: 60, fontSize: '.8rem' }} />
                    <Btn v="ind" sz="sm" pill onClick={autoOptimize} disabled={!jdBuffer.trim()}><Icon id="zap" size={12} color="white" /> Optimize</Btn>
                  </div>
               </div>
               <div className="rb-form-row">
                 <input className="inp" placeholder="Full Name" value={data.name} onChange={e => update('name', e.target.value)} />
                 <input className="inp" placeholder="Role" value={data.title} onChange={e => update('title', e.target.value)} />
               </div>
               <div className="rb-form-row">
                 <input className="inp" placeholder="Email" value={data.email} onChange={e => update('email', e.target.value)} />
                 <input className="inp" placeholder="Location" value={data.location} onChange={e => update('location', e.target.value)} />
               </div>
               <div className="rb-form-full" style={{ marginTop: 12 }}>
                  <label className="rb-label">Executive Summary</label>
                  <div style={{ position: 'relative' }}>
                    <textarea className="inp" style={{ height: 100, lineHeight: 1.6, paddingRight: 40 }} value={data.summary} onChange={e => update('summary', e.target.value)} />
                    <button onClick={() => improveBullet('summary', 0, data.summary)} style={{ position: 'absolute', bottom: 10, right: 10, background: 'var(--ind)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon id="zap" size={12} color="white" /></button>
                  </div>
               </div>
             </div>
           )}

           {activeLayer === 'experience' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {data.experience.map((exp, i) => (
                  <div key={exp.id} className="rb-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                       <Badge type="amber">Position #{i+1}</Badge>
                       <div onClick={() => removeItem('experience', exp.id)} style={{ cursor: 'pointer', color: 'var(--red)' }}><Icon id="x" size={12} /></div>
                    </div>
                    <div className="rb-form-row">
                       <input className="inp" placeholder="Company" value={exp.company} onChange={e => updateItem('experience', exp.id, 'company', e.target.value)} />
                       <input className="inp" placeholder="Period" value={exp.period} onChange={e => updateItem('experience', exp.id, 'period', e.target.value)} />
                    </div>
                    <div style={{ position: 'relative', marginTop: 12 }}>
                       <textarea className="inp" placeholder="Impact..." style={{ height: 100, fontSize: '.84rem', lineHeight: 1.6, paddingRight: 40 }} value={exp.desc} onChange={e => updateItem('experience', exp.id, 'desc', e.target.value)} />
                       <button onClick={() => improveBullet('exp', exp.id, exp.desc)} style={{ position: 'absolute', bottom: 10, right: 10, background: 'var(--ind)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon id="zap" size={12} color="white" /></button>
                    </div>
                    {!exp.desc.match(/\d+/) && exp.desc.length > 10 && (
                      <div className="rf" style={{ fontSize: '.72rem', color: 'var(--amber)', fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Icon id="star" size={10} /> Pro-tip: Adding a metric (e.g. 40%) will lift your Impact score.</div>
                    )}
                  </div>
                ))}
                <Btn v="ghost" sz="sm" pill onClick={() => addItem('experience', { role: 'Engineer', company: '', period: '', desc: '' })}>+ Add Experience</Btn>
             </div>
           )}

           {activeLayer === 'projects' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {data.projects.map((p, i) => (
                  <div key={p.id} className="rb-card" style={{ padding: 20 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Badge type="green">Project #{i+1}</Badge>
                        <div onClick={() => removeItem('projects', p.id)} style={{ cursor: 'pointer', color: 'var(--red)' }}><Icon id="x" size={12} /></div>
                     </div>
                     <div className="rb-form-row">
                       <input className="inp" placeholder="Name" value={p.title} onChange={e => updateItem('projects', p.id, 'title', e.target.value)} />
                       <input className="inp" placeholder="Stack" value={p.tech} onChange={e => updateItem('projects', p.id, 'tech', e.target.value)} />
                     </div>
                     <div style={{ position: 'relative', marginTop: 12 }}>
                        <textarea className="inp" placeholder="Project impact..." style={{ height: 80, fontSize: '.8rem', paddingRight: 40 }} value={p.desc} onChange={e => updateItem('projects', p.id, 'desc', e.target.value)} />
                        <button onClick={() => improveBullet('proj', p.id, p.desc)} style={{ position: 'absolute', bottom: 10, right: 10, background: 'var(--ind)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon id="zap" size={12} color="white" /></button>
                     </div>
                  </div>
                ))}
                <Btn v="ghost" sz="sm" pill onClick={() => addItem('projects', { title: '', tech: '', desc: '' })}>+ Add Project</Btn>
             </div>
           )}

           {activeLayer === 'skills' && (
             <div className="rb-card" style={{ padding: 20 }}>
                <textarea className="inp" placeholder="React | Node | Python..." style={{ height: 120 }} value={data.skills} onChange={e => update('skills', e.target.value)} />
             </div>
           )}

           {activeLayer === 'education' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                 {data.education.map((edu, i) => (
                   <div key={edu.id} className="rb-card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                         <Badge type="dim">Education #{i+1}</Badge>
                         <div onClick={() => removeItem('education', edu.id)} style={{ cursor: 'pointer', color: 'var(--red)' }}><Icon id="x" size={12} /></div>
                      </div>
                      <div className="rb-form-row">
                        <input className="inp" placeholder="School/University" value={edu.school} onChange={e => updateItem('education', edu.id, 'school', e.target.value)} />
                        <input className="inp" placeholder="Year" value={edu.year} onChange={e => updateItem('education', edu.id, 'year', e.target.value)} />
                      </div>
                      <input className="inp" placeholder="Degree" style={{ marginTop: 12 }} value={edu.degree} onChange={e => updateItem('education', edu.id, 'degree', e.target.value)} />
                   </div>
                 ))}
                 <Btn v="ghost" sz="sm" pill onClick={() => addItem('education', { school: '', degree: '', year: '' })}>+ Add Education</Btn>
              </div>
           )}

           {activeLayer === 'review' && (
              <div className="rf" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                 <div className="card-tint" style={{ padding: 24, borderLeft: '4px solid var(--red)', background: 'rgba(255,59,48,.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                       <h4 style={{ fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--red)', letterSpacing: '.05em' }}>Rejection Probability</h4>
                       <Badge type="red">Predictive AI</Badge>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-.05em', marginBottom: 8 }}>{data.experience[0].desc.length < 60 ? '88%' : '18%'}</div>
                    <p style={{ fontSize: '.84rem', color: 'var(--ts)', lineHeight: 1.5 }}>{data.experience[0].desc.length < 60 ? "High Risk: Brief achievements detected. Add metrics to pass ATS filters." : "Low Risk: Excellent depth. Your profile is market-ready."}</p>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h4 className="eyebrow">Score Reasoning</h4>
                    {[
                      { l: 'ATS Formatting', s: 95, r: 'Standard structure detected.' },
                      { l: 'Impact Language', s: 45, r: 'Passive verbs found. Need numbers.' },
                      { l: 'Keyword Sync', s: 72, r: 'Missing some cloud-native keywords.' }
                    ].map(res => (
                      <div key={res.l} className="card" style={{ padding: 16 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontWeight: 800, fontSize: '.85rem' }}>{res.l}</span><span style={{ fontWeight: 800 }}>{res.s}%</span></div>
                         <p style={{ fontSize: '.78rem', color: 'var(--ts)' }}>{res.r}</p>
                      </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* 2. Right Preview Side — The 1% Standard */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', overflowY: 'auto', background: '#f8f9fa' }}>
        <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
           <Btn v="dark" sz="sm" pill onClick={downloadPDF}><Icon id="download" size={14} color="white" /> Export PDF</Btn>
           <Btn v={showATS ? 'ind' : 'light'} sz="sm" pill onClick={() => setShowATS(!showATS)}><Icon id="target" size={14} color={showATS ? 'white' : 'var(--tp)'} /> {showATS ? 'ATS Active' : 'Recruiter Mode'}</Btn>
        </div>

        <div id="resume-preview" style={{ 
          width: '595px', minHeight: '842px', background: 'white', boxShadow: '0 30px 60px rgba(0,0,0,.08)', 
          padding: '50px 65px', display: 'flex', flexDirection: 'column', color: '#000', position: 'relative', fontFamily: "'Inter', sans-serif"
        }}>
           
           {/* ATS Terminal Overlay */}
           {showATS && (
             <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a', color: '#00ff41', padding: '60px 50px', zIndex: 10, fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.5, overflowY: 'auto' }}>
                <div style={{ borderBottom: '1px solid #00ff41', paddingBottom: 10, marginBottom: 20, opacity: 0.8 }}>[ ATS PARSING SIMULATOR v4.2 ]</div>
                <div style={{ marginBottom: 30 }}><div style={{ color: '#fff', fontWeight: 700 }}>[ENTITY_NAME]</div><div>{data.name.toUpperCase()}</div></div>
                <div style={{ marginBottom: 30 }}><div style={{ color: '#fff', fontWeight: 700 }}>[EXTRACTED_SKILLS]</div><div>{data.skills}</div></div>
                <div style={{ marginBottom: 20 }}><div style={{ color: '#fff', fontWeight: 700 }}>[WORK_HISTORY]</div>{data.experience.map(e => <div key={e.id} style={{ marginBottom: 10 }}>{e.company}: {e.desc}</div>)}</div>
             </div>
           )}

           <div style={{ textAlign: 'center', marginBottom: 35 }}>
              <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-.04em' }}>{data.name.toUpperCase()}</h1>
              <div style={{ fontSize: '11px', color: '#666' }}>{data.location} | {data.email} | {data.linkedin}</div>
           </div>

           <section style={{ marginBottom: 28 }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, borderBottom: '1.5px solid #000', paddingBottom: 4, marginBottom: 10 }}>SUMMARY</h4>
              <p style={{ fontSize: '11px', lineHeight: 1.6 }}>{data.summary}</p>
           </section>

           <section style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, borderBottom: '1.5px solid #000', paddingBottom: 4, marginBottom: 14 }}>EXPERIENCE</h4>
              {data.experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: 15 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '12px' }}><span>{exp.company} — {exp.role}</span><span>{exp.period}</span></div>
                   <p style={{ fontSize: '11px', marginTop: 5 }}>• {exp.desc}</p>
                </div>
              ))}
           </section>

           <section style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, borderBottom: '1.5px solid #000', paddingBottom: 4, marginBottom: 12 }}>SKILLS</h4>
              <p style={{ fontSize: '11px' }}>{data.skills}</p>
           </section>

           <section>
              <h4 style={{ fontSize: '12px', fontWeight: 800, borderBottom: '1.5px solid #000', paddingBottom: 4, marginBottom: 12 }}>EDUCATION</h4>
              {data.education.map(edu => (
                <div key={edu.id} style={{ marginBottom: 10 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '11px' }}><span>{edu.school}</span><span>{edu.year}</span></div>
                   <p style={{ fontSize: '11px', marginTop: 2 }}>{edu.degree}</p>
                </div>
              ))}
           </section>
        </div>
      </div>
    </div>
  );
};

export default LiveBuilder;
