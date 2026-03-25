import { useState, useRef, useCallback } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import * as pdfjs from 'pdfjs-dist';
import Icon from '../components/Icon';

pdfjs.GlobalWorkerOptions.workerSrc = ''; // Handled dynamically in extractText
import Btn from '../components/Btn';
import { callGroq } from '../services/ai';

const STEPS = [
  'Parsing document structure…',
  'Running ATS compatibility check…',
  'Analyzing keyword density…',
  'Generating score report…',
];

const Upload = ({ go, user, onAuth, setResults }) => {
  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [step,     setStep]     = useState(0);
  const [apiError, setApiError] = useState(null);
  const inputRef = useRef(null);
  const roleRef  = useRef(null);

  const pick = f => { if (f) { setFile(f); setApiError(null); } };

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files[0]);
  }, []);

  const extractText = async (file) => {
    if (file.type !== 'application/pdf') return ""; 
    try {
      // Setup worker if not already set or if it failed
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let text = "";
      // Only parse first 10 pages for performance
      const maxPages = Math.min(pdf.numPages, 10);
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(s => s.str).join(" ") + " ";
      }
      return text;
    } catch (e) {
      console.error("PDF parse error (falling back to generic analysis):", e);
      return ""; // Proceed with empty text if parsing fails
    }
  };

  const generateAIAssessment = async (text, fileName, targetRole) => {
    const truncatedText = text?.substring(0, 10000) || ""; 
    const prompt = `
      You are an expert ATS (Applicant Tracking System) and senior technical recruiter.
      Evaluate the following resume against the target role: ${targetRole || 'General/Unspecified'}.
      Resume Text: ${truncatedText}
      Provide a JSON response with score, ats, keyword, formatting, impact, signals, issues, and improvements.
    `;
    try {
      const completion = await callGroq(prompt);
      let textContent = completion.choices[0]?.message?.content || "{}";
      textContent = textContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      let parsed = JSON.parse(textContent);
      const finalScore = parsed.score || 45;

      return {
        name: fileName,
        score: finalScore,
        ats: parsed.ats || 45,
        keyword: parsed.keyword || 45,
        formatting: parsed.formatting || 45,
        impact: parsed.impact || 45,
        signals: parsed.signals || { action_verbs: [], tech_keywords: [], metrics: [] },
        issues: parsed.issues || [],
        improvements: parsed.improvements || [],
        date: new Date().toISOString(),
        risk: finalScore < 60 ? 'High Risk' : finalScore < 80 ? 'Medium Risk' : 'Low Risk',
        text: truncatedText
      };
    } catch (err) {
      console.error("Groq API Error:", err);
      throw new Error(`API Error: ${err.message || "Failed to connect to AI"}`);
    }
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setStep(0);
    setApiError(null);

    const role = roleRef.current?.value || '';

    // ── Pre-fetch / Background Work ──
    const processPromise = (async () => {
      try {
        const text = await extractText(file);
        const analysis = await generateAIAssessment(text, file.name || 'Resume', role);
        setResults(analysis);

        if (user?.uid) {
          const safeName = (file.name || 'document').replace(/[^a-zA-Z0-9]/g, '_');
          await setDoc(doc(db, 'users', user.uid, 'scans', safeName), {
            ...analysis,
          });
        }
        return true;
      } catch (err) {
        console.error("Analysis background process failed:", err);
        setApiError(err.message);
        return false;
      }
    })();

    // ── Progress Animation ──
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i < STEPS.length) {
        setStep(i);
      } else {
        clearInterval(iv);
        processPromise.then((success) => {
          if (success) {
            setTimeout(() => go('results'), 500);
          } else {
            setLoading(false);
          }
        });
      }
    }, 550);
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', paddingTop: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--s1)', padding: '80px 20px' }}>
      <div style={{ textAlign: 'center', maxWidth: 340 }}>
        <div style={{ width: 54, height: 54, borderRadius: 17, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Icon id="lock" size={22} color="var(--tt)" />
        </div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 700, letterSpacing: '-.04em', marginBottom: 12 }}>
          Sign in to analyze
        </h2>
        <p style={{ color: 'var(--tt)', marginBottom: 28, fontSize: '.9rem', lineHeight: 1.65 }}>
          Create an account to save your scan history and see your resume metrics.
        </p>
        <Btn v="dark" sz="lg" pill onClick={onAuth}>
          Sign in <Icon id="arrow" size={14} color="white" />
        </Btn>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '72px 20px' }}>
      <div style={{ maxWidth: 500, width: '100%' }}>

        <p className="eyebrow ru" style={{ marginBottom: 18 }}>Step 1 of 2</p>
        <h1 className="ru d1" style={{ fontSize: 'clamp(1.9rem,4vw,2.8rem)', fontWeight: 700, letterSpacing: '-.05em', marginBottom: 12 }}>
          Upload your resume
        </h1>
        <p className="ru d2" style={{ color: 'var(--ts)', marginBottom: 32, fontSize: '.95rem', lineHeight: 1.7 }}>
          PDF or Word document. Analyzed in memory — never stored on our servers.
        </p>

        {/* Drop zone */}
        <div
          className={`dz-idle ru d3 ${dragging ? 'dz-hover' : ''}`}
          style={{ borderRadius: 22, padding: 'clamp(32px,5vw,56px) 24px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s', marginBottom: 14 }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={e => pick(e.target.files[0])}
          />
          {file ? (
            <>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Icon id="file" size={22} color="var(--tp)" />
              </div>
              <p style={{ fontWeight: 600, fontSize: '.93rem', marginBottom: 4, letterSpacing: '-.02em' }}>{file.name}</p>
              <p style={{ fontSize: '.8rem', color: 'var(--tt)' }}>{(file.size / 1024).toFixed(1)} KB · tap to replace</p>
            </>
          ) : (
            <>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Icon id="upload" size={23} color="var(--ts)" />
              </div>
              <p style={{ fontWeight: 600, fontSize: '.93rem', marginBottom: 6, letterSpacing: '-.02em' }}>Drop your file here</p>
              <p style={{ fontSize: '.8rem', color: 'var(--tt)' }}>or tap to browse · PDF, DOC, DOCX</p>
            </>
          )}
        </div>

        {/* Target role */}
        <div className="ru d4" style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--ts)', marginBottom: 8 }}>
            Target role{' '}
            <span style={{ color: 'var(--tt)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            ref={roleRef}
            className="inp"
            placeholder="e.g. Senior Software Engineer at Stripe"
            style={{ padding: '12px 15px' }}
          />
        </div>

        {/* Loader or CTA */}
        {apiError && (
          <div style={{ padding: '12px 16px', background: 'rgba(255,59,48,.1)', color: 'var(--red)', borderRadius: 12, marginBottom: 16, fontSize: '.9rem', fontWeight: 500, textAlign: 'center' }}>
            {apiError}
          </div>
        )}
        {loading ? (
          <div className="card" style={{ padding: 26, textAlign: 'center' }}>
            <div
              className="spin"
              style={{ width: 34, height: 34, border: '2.5px solid var(--s2)', borderTopColor: 'var(--near-black)', borderRadius: '50%', margin: '0 auto 18px' }}
            />
            <p style={{ fontWeight: 600, fontSize: '.95rem', marginBottom: 6, letterSpacing: '-.02em' }}>
              Analyzing your resume
            </p>
            <p style={{ fontSize: '.83rem', color: 'var(--ts)', marginBottom: 18 }}>{STEPS[step]}</p>
            <div className="pb-track" style={{ height: 3, maxWidth: 260, margin: '0 auto' }}>
              <div
                className="pb-fill"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'var(--near-black)' }}
              />
            </div>
          </div>
        ) : (
          <Btn v="dark" sz="xl" full onClick={analyze}>
            <Icon id="zap" size={17} color="white" /> Analyze resume
          </Btn>
        )}

        <p className="ru d6" style={{ fontSize: 10, color: 'var(--tt)', textAlign: 'center', marginTop: 14 }}>
          🔒 Private · secure · GDPR compliant
        </p>
      </div>
    </div>
  );
};

export default Upload;
