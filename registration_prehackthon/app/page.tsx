'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('./components/Scene3D'), { ssr: false });
import Loader from './components/Loader';

interface MemberData {
  name: string;
  email: string;
  whatsApp: string;
  rollNumber: string;
  residency: 'Hosteller' | 'Day Scholar';
  messFood?: boolean;
  course: 'BTech' | 'BBA' | 'BDes';
  batch: string;
}

interface FormData {
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderWhatsApp: string;
  leaderRollNumber: string;
  leaderResidency: 'Hosteller' | 'Day Scholar';
  leaderMessFood?: boolean;
  leaderCourse: 'BTech' | 'BBA' | 'BDes';
  leaderBatch: string;
  members: MemberData[];
}

const initialMember: MemberData = { name: '', email: '', whatsApp: '', rollNumber: '', residency: 'Hosteller', course: 'BTech', batch: '' };

const initialForm: FormData = {
  teamName: '',
  leaderName: '',
  leaderEmail: '',
  leaderWhatsApp: '',
  leaderRollNumber: '',
  leaderResidency: 'Hosteller',
  leaderCourse: 'BTech',
  leaderBatch: '',
  members: [{ ...initialMember }, { ...initialMember }, { ...initialMember }],
};

// Confetti
function Confetti() {
  const colors = ['#e8621a', '#f59e0b', '#0d9488', '#e11d48', '#f97316', '#8b5cf6'];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 3}s`,
    size: `${6 + Math.random() * 8}px`,
  }));
  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </>
  );
}

// Stat card with SVG icons
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.65)',
        border: '1px solid rgba(232,98,26,0.12)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '20px 24px',
        textAlign: 'center',
        flex: '1 1 130px',
        minWidth: '130px',
        boxShadow: '0 4px 20px rgba(232,98,26,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(232,98,26,0.12)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,98,26,0.06)'; }}
    >
      <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: '#e8621a', fontFamily: 'var(--font-orbitron)' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#9c8578', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>
        {label}
      </div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true); // Default to true for loader
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Loader Effect - Wait for page load
  React.useEffect(() => {
    // Minimum wait time of 2s to prevent flickering
    const minWait = new Promise(resolve => setTimeout(resolve, 2000));

    // Wait for window load event (images, scripts, etc.)
    const windowLoad = new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve(true);
      } else {
        window.addEventListener('load', () => resolve(true));
      }
    });

    Promise.all([minWait, windowLoad]).then(() => {
      setLoading(false);
    });
  }, []);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    leader: true,
    member0: true,
    member1: true,
    member2: true,
  });

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateLeaderField = useCallback((field: string, value: string) => {
    setForm((prev) => {
      if (field === 'leaderMessFood') {
        return { ...prev, leaderMessFood: value === 'true' } as FormData;
      }
      if (field === 'leaderResidency') {
        // Clear messFood when switching residency type
        return { ...prev, leaderResidency: value as 'Hosteller' | 'Day Scholar', leaderMessFood: undefined } as FormData;
      }
      return { ...prev, [field]: value } as FormData;
    });
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  const updateMemberField = useCallback((index: number, field: string, value: string) => {
    setForm((prev) => {
      const members = [...prev.members];
      if (field === 'messFood') {
        members[index] = { ...members[index], messFood: value === 'true' };
      } else if (field === 'residency') {
        // Clear messFood when switching residency type
        members[index] = { ...members[index], residency: value as 'Hosteller' | 'Day Scholar', messFood: undefined };
      } else {
        members[index] = { ...members[index], [field]: value };
      }
      return { ...prev, members };
    });
    setErrors((prev) => { const n = { ...prev }; delete n[`member${index}.${field}`]; return n; });
  }, []);

  const validate = (): boolean => {
    const ne: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@jklu\.edu\.in$/i;

    if (!form.teamName.trim()) ne.teamName = 'Team name is required';
    if (!form.leaderName.trim()) ne.leaderName = 'Name is required';
    if (!form.leaderEmail.trim()) ne.leaderEmail = 'Email is required';
    else if (!emailRegex.test(form.leaderEmail)) ne.leaderEmail = 'Must be a @jklu.edu.in email';
    if (!form.leaderWhatsApp.trim()) ne.leaderWhatsApp = 'WhatsApp number is required';
    else if (!/^\d{10}$/.test(form.leaderWhatsApp.replace(/[\s\-\+]/g, '').slice(-10)))
      ne.leaderWhatsApp = 'Enter a valid 10-digit number';
    if (!form.leaderRollNumber.trim()) ne.leaderRollNumber = 'Roll number is required';

    form.members.forEach((m, i) => {
      if (!m.name.trim()) ne[`member${i}.name`] = 'Name is required';
      if (!m.email.trim()) ne[`member${i}.email`] = 'Email is required';
      else if (!emailRegex.test(m.email)) ne[`member${i}.email`] = 'Must be a @jklu.edu.in email';
      if (!m.whatsApp.trim()) ne[`member${i}.whatsApp`] = 'WhatsApp number is required';
      else if (!/^\d{10}$/.test(m.whatsApp.replace(/[\s\-\+]/g, '').slice(-10)))
        ne[`member${i}.whatsApp`] = 'Enter a valid 10-digit number';
      if (!m.rollNumber.trim()) ne[`member${i}.rollNumber`] = 'Roll number is required';
    });

    const allEmails = [form.leaderEmail, ...form.members.map((m) => m.email)].map((e) => e.toLowerCase().trim()).filter(Boolean);
    const seen = new Set<string>();
    allEmails.forEach((email, idx) => {
      if (seen.has(email)) {
        if (idx === 0) ne.leaderEmail = 'Duplicate email';
        else ne[`member${idx - 1}.email`] = 'Duplicate email';
      }
      seen.add(email);
    });

    setErrors(ne);
    if (Object.keys(ne).some((k) => k.startsWith('leader') || k === 'teamName'))
      setOpenSections((p) => ({ ...p, leader: true }));
    for (let i = 0; i < 3; i++) {
      if (Object.keys(ne).some((k) => k.startsWith(`member${i}`)))
        setOpenSections((p) => ({ ...p, [`member${i}`]: true }));
    }
    return Object.keys(ne).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setSubmitSuccess(true);
      else setSubmitError(data.message || 'Registration failed. Please try again.');
    } catch {
      setSubmitError('Unable to connect to server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const memberConfig = [
    { label: 'Member 1', badge: 'badge-teal', section: 'member-1', icon: '🧑‍💻', color: '#10B981' },
    { label: 'Member 2', badge: 'badge-amber', section: 'member-2', icon: '👨‍💻', color: '#f59e0b' },
    { label: 'Member 3', badge: 'badge-rose', section: 'member-3', icon: '👩‍💻', color: '#e11d48' },
  ];

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    errorKey: string,
    placeholder: string,
    type = 'text',
    icon = ''
  ) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b4c3b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}{label} <span style={{ color: '#e8621a' }}>*</span>
      </label>
      <input
        type={type}
        className={`form-input ${errors[errorKey] ? 'error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {errors[errorKey] && (
        <p style={{ color: '#dc2626', fontSize: '11px', margin: '4px 0 0 0', fontWeight: 500 }}>⚠ {errors[errorKey]}</p>
      )}
    </div>
  );

  const renderSelect = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    errorKey: string,
    options: string[],
    icon = ''
  ) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b4c3b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}{label} <span style={{ color: '#e8621a' }}>*</span>
      </label>
      <select
        className={`form-input ${errors[errorKey] ? 'error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ cursor: 'pointer' }}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {errors[errorKey] && (
        <p style={{ color: '#dc2626', fontSize: '11px', margin: '4px 0 0 0', fontWeight: 500 }}>⚠ {errors[errorKey]}</p>
      )}
    </div>
  );

  // ─── SUCCESS SCREEN ───
  if (submitSuccess) {
    return (
      <div className="success-overlay">
        <Confetti />
        <div className="glass-card" style={{
          padding: '52px 44px', textAlign: 'center', maxWidth: '500px', width: '90%',
          animation: 'scaleIn 0.5s ease', position: 'relative', zIndex: 102, background: 'rgba(255,255,255,0.9)',
        }}>
          <div style={{ fontSize: '72px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontFamily: 'OriginTech, var(--font-orbitron)', fontSize: '28px', margin: '0 0 12px 0', fontWeight: 800 }} className="glow-text">
            Registration Successful!
          </h2>
          <p style={{ color: '#6b4c3b', fontSize: '16px', lineHeight: '1.6', margin: '0 0 8px 0' }}>
            Team <strong style={{ color: '#e8621a' }}>{form.teamName}</strong> has been registered successfully!
          </p>
          <p style={{ color: '#9c8578', fontSize: '15px', margin: '0 0 12px 0', lineHeight: 1.6 }}>
            🚀 Get ready to hack! We&apos;ll reach out to you via email with further details.
          </p>
          <p style={{ color: '#b08968', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>— Council of Technical Affairs</p>
        </div>
      </div>
    );
  }

  // ─── LOADER ───
  if (loading) return <Loader />;

  // ─── MAIN PAGE ───
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#121519', color: '#e0e0e0' }}>
      <div className="gradient-bg">
        <div className="gradients-container">
          <div className="g1"></div>
          <div className="g2"></div>
          <div className="g3"></div>
          <div className="g4"></div>
          <div className="g5"></div>
        </div>
      </div>
      <Scene3D />

      {/* ═══════════════ HERO SECTION — 100vh Dark ═══════════════ */}
      <section style={{
        position: 'relative', zIndex: 3, minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', width: '100%', textAlign: 'center' }}>
          {/* Logos centered with drop shadows - OPTIMIZED FOR MOBILE */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'clamp(20px, 4vw, 60px)', // Smaller gap on mobile
            marginBottom: '32px', flexWrap: 'wrap', width: '100%',
          }}>
            <Image src="/JKLU White.png" alt="JKLU" width={200} height={90}
              style={{ objectFit: 'contain', height: 'clamp(50px, 10vw, 80px)', width: 'auto', maxWidth: '160px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />
            <Image src="/TechnicalAffairs.png" alt="Council of Technical Affairs" width={220} height={110}
              style={{ objectFit: 'contain', height: 'clamp(60px, 12vw, 90px)', width: 'auto', maxWidth: '180px', filter: 'drop-shadow(0 0 12px rgba(207,157,123,0.3))' }} />
            <Image src="/hackjklu.png" alt="HackJKLU" width={200} height={90}
              style={{ objectFit: 'contain', height: 'clamp(50px, 10vw, 80px)', width: 'auto', maxWidth: '160px', filter: 'drop-shadow(0 0 15px rgba(255,100,0,0.3))' }} />
            <Image src="/wscube.jpg" alt="WScube Tech" width={200} height={90}
              style={{ objectFit: 'contain', height: 'clamp(50px, 10vw, 80px)', width: 'auto', maxWidth: '160px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))' }} />
          </div>

          {/* Sponsor badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 22px',
            borderRadius: '30px', background: 'linear-gradient(135deg, rgba(207,157,123,0.1), rgba(114,75,57,0.1))',
            border: '1px solid rgba(207,157,123,0.3)',
            fontSize: '12px', color: '#CF9D7B', fontWeight: 600, marginBottom: '28px',
            letterSpacing: '1px', textTransform: 'uppercase',
            boxShadow: '0 0 15px rgba(207,157,123,0.1)',
          }}>
            ⚡ Powered by WScube Tech
          </div>

          {/* Main title with OriginTech font */}
          <h1 style={{
            fontFamily: 'OriginTech, sans-serif',
            fontSize: 'clamp(38px, 6vw, 82px)',
            fontWeight: 400,
            margin: '0 0 12px 0',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #CF9D7B 0%, #E8C39E 50%, #724B39 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center', letterSpacing: '1px',
            textShadow: '0 0 30px rgba(207,157,123,0.2)',
          }}>
            PRE HACKATHON<br />
            <span style={{ fontSize: '0.6em', color: '#a0a0a0', WebkitTextFillColor: '#a0a0a0' }}>FOR JKLU</span>
          </h1>

          {/* Byline */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            marginBottom: '32px', fontFamily: 'var(--font-orbitron)', fontSize: '14px',
            color: '#CF9D7B', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
          }}>
            <span style={{ width: '40px', height: '1px', background: '#CF9D7B', opacity: 0.5 }}></span>
            BY COUNCIL OF TECHNICAL AFFAIRS
            <span style={{ width: '40px', height: '1px', background: '#CF9D7B', opacity: 0.5 }}></span>
          </div>

          {/* Description */}
          <p style={{
            color: '#a0a0a0',
            fontSize: 'clamp(14px, 2vw, 17px)',
            maxWidth: '580px',
            margin: '0 auto 48px',
            lineHeight: 1.7,
          }}>
            Form your squad, sharpen your skills, and get a taste of what a real hackathon feels like —
            before the main event!
          </p>

          {/* 3D Perks Section */}
          <div style={{
            display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap',
            maxWidth: '900px', margin: '0 auto 48px', perspective: '1000px',
          }}>
            {/* Perk 1: Internships */}
            <div className="perk-card" style={{
              flex: '1 1 200px', padding: '24px', borderRadius: '20px',
              background: 'linear-gradient(145deg, rgba(30, 22, 17, 0.85), rgba(30, 22, 17, 0.6))',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(207,157,123,0.2)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 0 20px rgba(207,157,123,0.05)',
              transformStyle: 'preserve-3d', transition: 'transform 0.3s ease',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '42px', marginBottom: '12px', filter: 'drop-shadow(0 0 15px rgba(207,157,123,0.4))' }}>🎓</div>
              <h3 style={{ fontFamily: 'var(--font-orbitron)', fontSize: '18px', fontWeight: 700, color: '#CF9D7B', marginBottom: '8px' }}>
                5 Internships
              </h3>
              <p style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.5 }}>
                Top performers get exclusive internship opportunities.
              </p>
            </div>

            {/* Perk 2: Mentorship */}
            <div className="perk-card" style={{
              flex: '1 1 200px', padding: '24px', borderRadius: '20px',
              background: 'linear-gradient(145deg, rgba(30, 22, 17, 0.85), rgba(30, 22, 17, 0.6))',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(207,157,123,0.2)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 0 20px rgba(207,157,123,0.05)',
              transformStyle: 'preserve-3d', transition: 'transform 0.3s ease',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '42px', marginBottom: '12px', filter: 'drop-shadow(0 0 15px rgba(207,157,123,0.4))' }}>🤝</div>
              <h3 style={{ fontFamily: 'var(--font-orbitron)', fontSize: '18px', fontWeight: 700, color: '#CF9D7B', marginBottom: '8px' }}>
                Expert Mentorship
              </h3>
              <p style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.5 }}>
                Personal guidance from industry professionals.
              </p>
            </div>

            {/* Perk 3: Prize Pool */}
            <div className="perk-card" style={{
              flex: '1 1 200px', padding: '24px', borderRadius: '20px',
              background: 'linear-gradient(145deg, rgba(30, 22, 17, 0.85), rgba(30, 22, 17, 0.6))',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(207,157,123,0.2)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 0 20px rgba(207,157,123,0.05)',
              transformStyle: 'preserve-3d', transition: 'transform 0.3s ease',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '42px', marginBottom: '12px', filter: 'drop-shadow(0 0 15px rgba(207,157,123,0.4))' }}>🏆</div>
              <h3 style={{ fontFamily: 'var(--font-orbitron)', fontSize: '18px', fontWeight: 700, color: '#CF9D7B', marginBottom: '8px' }}>
                ₹12K Prize Pool
              </h3>
              <p style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.5 }}>
                Cash prizes for top innovative solutions.
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div>
            <a href="#register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 32px', borderRadius: '30px',
              background: 'linear-gradient(135deg, #CF9D7B, #724B39)',
              color: '#121519', fontSize: '14px', fontWeight: 800,
              textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px',
              boxShadow: '0 0 20px rgba(207,157,123,0.3)',
              transition: 'all 0.3s ease',
              border: '1px solid #CF9D7B',
            }}>
              ↓ Register Now
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════ RULES AND REGULATIONS SECTION ═══════════════ */}
      <section style={{
        position: 'relative', zIndex: 3,
        padding: 'clamp(40px, 8vw, 80px) 20px',
        maxWidth: '900px', margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'OriginTech, sans-serif',
            fontSize: 'clamp(32px, 6vw, 48px)',
            fontWeight: 400,
            margin: '0 0 12px 0',
            letterSpacing: '2px',
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #CF9D7B 0%, #E8C39E 50%, #724B39 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(207,157,123,0.3)',
          }}>
            Rules & Regulations
          </h2>
          <p style={{ color: '#a0a0a0', fontSize: '14px', margin: 0 }}>
            Please read carefully before registering
          </p>
        </div>

        <div style={{
          background: 'rgba(30, 22, 17, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(207,157,123,0.2)',
          borderRadius: '24px',
          padding: 'clamp(24px, 4vw, 40px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative top gradient bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #724B39, #CF9D7B, #E8C39E, #CF9D7B)',
          }} />

          {/* Rules List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>

            {/* Rule 1: Team Size */}
            <div style={{
              background: 'rgba(207,157,123,0.05)',
              border: '1px solid rgba(207,157,123,0.15)',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.1)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.05)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.15)'; }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CF9D7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#CF9D7B',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.5px',
                }}>
                  Team Composition
                </h3>
                <p style={{
                  color: '#a0a0a0',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  Teams must consist of exactly 4 members (1 leader + 3 members). All team members must be registered JKLU students with valid college IDs.
                </p>
              </div>
            </div>

            {/* Rule 2: Code of Conduct */}
            <div style={{
              background: 'rgba(207,157,123,0.05)',
              border: '1px solid rgba(207,157,123,0.15)',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.1)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.05)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.15)'; }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CF9D7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#CF9D7B',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.5px',
                }}>
                  Code of Conduct
                </h3>
                <p style={{
                  color: '#a0a0a0',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  All participants must maintain professional behavior. Any form of harassment, discrimination, or misconduct will lead to immediate disqualification.
                </p>
              </div>
            </div>

            {/* Rule 3: No Accommodation */}
            <div style={{
              background: 'rgba(207,157,123,0.05)',
              border: '1px solid rgba(207,157,123,0.15)',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.1)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.05)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.15)'; }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CF9D7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                <line x1="3" y1="9" x2="21" y2="9" stroke="#CF9D7B" strokeWidth="2"></line>
                <line x1="3" y1="9" x2="21" y2="21" stroke="#e11d48" strokeWidth="2.5"></line>
              </svg>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#CF9D7B',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.5px',
                }}>
                  No Accommodation Provided
                </h3>
                <p style={{
                  color: '#a0a0a0',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  Accommodation will not be provided during the Pre-Hackathon. Participants are expected to make their own arrangements.
                </p>
              </div>
            </div>

            {/* Rule 4: Restricted Area Movement */}
            <div style={{
              background: 'rgba(207,157,123,0.05)',
              border: '1px solid rgba(207,157,123,0.15)',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.1)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.05)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.15)'; }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CF9D7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#CF9D7B',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.5px',
                }}>
                  Restricted Area Movement Only
                </h3>
                <p style={{
                  color: '#a0a0a0',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  All participants must remain within designated areas only. Movement outside restricted zones is strictly prohibited for safety and security reasons.
                </p>
              </div>
            </div>

            {/* Rule 5: Day Scholar Mess Payment */}
            <div style={{
              background: 'rgba(207,157,123,0.05)',
              border: '1px solid rgba(207,157,123,0.15)',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.1)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.05)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.15)'; }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CF9D7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#CF9D7B',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.5px',
                }}>
                  Day Scholars - Mess Payment Required
                </h3>
                <p style={{
                  color: '#a0a0a0',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  Day scholars who wish to avail mess facilities during the Pre-Hackathon will be required to pay for the meals separately.
                  Otherwise you have to arrange your own food with cafeteria or somewhere else.
                </p>
              </div>
            </div>

            {/* Rule 6: Punctuality */}
            <div style={{
              background: 'rgba(207,157,123,0.05)',
              border: '1px solid rgba(207,157,123,0.15)',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.1)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.05)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.15)'; }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CF9D7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#CF9D7B',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.5px',
                }}>
                  Punctuality & Attendance
                </h3>
                <p style={{
                  color: '#a0a0a0',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  All team members must be present at the venue at the scheduled time. Late arrivals may result in penalties or disqualification.
                </p>
              </div>
            </div>


            {/* Rule 7: ID Cards Required */}
            <div style={{
              background: 'rgba(207,157,123,0.05)',
              border: '1px solid rgba(207,157,123,0.15)',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.1)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(207,157,123,0.05)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.15)'; }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CF9D7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                <circle cx="9" cy="10" r="2"></circle>
                <path d="M15 9h3"></path>
                <path d="M15 13h3"></path>
                <path d="M6 16c0-1.5 1.34-3 3-3s3 1.5 3 3"></path>
              </svg>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: 'var(--font-orbitron)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#CF9D7B',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.5px',
                }}>
                  Valid ID Cards Mandatory
                </h3>
                <p style={{
                  color: '#a0a0a0',
                  fontSize: '14px',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  All participants must carry their valid JKLU ID cards at all times during the event. Entry will not be permitted without proper identification.
                </p>
              </div>
            </div>

          </div>

          {/* Important Notice */}
          <div style={{
            marginTop: '28px',
            padding: '16px 20px',
            background: 'rgba(232,98,26,0.1)',
            border: '1px solid rgba(232,98,26,0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{ fontSize: '20px' }}>📢</div>
            <p style={{
              color: '#E8C39E',
              fontSize: '13px',
              margin: 0,
              fontWeight: 600,
              lineHeight: 1.5,
            }}>
              <strong>Important:</strong> Violation of any of these rules may result in disqualification from the event. By registering, you agree to adhere to all rules and regulations.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ FORM SECTION ═══════════════ */}
      <div id="register" style={{ position: 'relative', zIndex: 3, scrollMarginTop: '60px' }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: '700px', margin: '0 auto', padding: 'clamp(28px, 5vw, 48px) 16px 72px' }}>

          {/* Section title */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{
              fontFamily: 'OriginTech, sans-serif', fontSize: 'clamp(32px, 6vw, 56px)',
              fontWeight: 400, margin: '0 0 12px 0', letterSpacing: '2px',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #CF9D7B 0%, #E8C39E 50%, #724B39 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(207,157,123,0.3)',
            }}>
              <span className="glow-text">Team Registration</span>
            </h2>
            <p style={{ color: '#a0a0a0', fontSize: '13px', margin: 0 }}>
              All fields are mandatory • Use your JKLU email
            </p>
          </div>

          {/* Main card */}
          <div className="glass-card" style={{
            padding: 'clamp(24px, 4vw, 40px)', overflow: 'hidden', position: 'relative',
            background: 'rgba(30, 22, 17, 0.85)', border: '1px solid rgba(207,157,123,0.2)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)', borderRadius: '24px',
            backdropFilter: 'blur(20px)'
          }}>
            {/* Decorative top gradient bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: 'linear-gradient(90deg, #724B39, #CF9D7B, #E8C39E, #CF9D7B)',
            }} />

            {/* ── TEAM NAME ── */}
            <div style={{ marginBottom: '24px', paddingTop: '8px' }}>
              <h3 style={{
                fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: '#CF9D7B',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: 'var(--font-orbitron)', letterSpacing: '1px'
              }}>
                <span style={{ fontSize: '18px' }}>🏆</span> Team Name
              </h3>
              <input
                type="text"
                className={`form-input ${errors.teamName ? 'error' : ''}`}
                placeholder="Enter your team name"
                value={form.teamName}
                onChange={(e) => updateLeaderField('teamName', e.target.value)}
                style={{
                  fontSize: '16px', padding: '14px 18px', fontWeight: 600,
                  background: 'rgba(18, 21, 25, 0.6)', border: '1px solid rgba(207,157,123,0.3)',
                  color: '#e0e0e0', borderRadius: '12px', width: '100%', outline: 'none'
                }}
              />
              {errors.teamName && <p style={{ color: '#fca5a5', fontSize: '11px', margin: '4px 0 0 0', fontWeight: 500 }}>⚠ {errors.teamName}</p>}
            </div>

            {/* Gradient divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(207,157,123,0.2), transparent)', margin: '0 0 20px 0' }} />

            {/* ── TEAM LEADER ── */}
            <div style={{ marginBottom: '14px' }}>
              <div className="section-header leader" onClick={() => toggleSection('leader')}
                style={{
                  background: 'rgba(207,157,123,0.1)', border: '1px solid rgba(207,157,123,0.2)',
                  borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                  cursor: 'pointer', transition: 'all 0.3s ease'
                }}>
                <span style={{ fontSize: '18px' }}>👑</span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: '14px', color: '#CF9D7B', fontFamily: 'var(--font-orbitron)' }}>Team Leader</span>
                <span style={{
                  background: 'rgba(207,157,123,0.2)', color: '#CF9D7B', fontSize: '10px',
                  padding: '4px 10px', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase'
                }}>Leader</span>
                <span style={{ transition: 'transform 0.3s ease', transform: openSections.leader ? 'rotate(180deg)' : 'rotate(0)', fontSize: '11px', color: '#CF9D7B' }}>▼</span>
              </div>
              {openSections.leader && (
                <div style={{ padding: '18px 4px 4px', animation: 'fadeIn 0.25s ease' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {renderInput('Full Name', form.leaderName, (v) => updateLeaderField('leaderName', v), 'leaderName', 'XYZ', 'text', '👤')}
                    {renderInput('JKLU Email', form.leaderEmail, (v) => updateLeaderField('leaderEmail', v), 'leaderEmail', 'name@jklu.edu.in', 'email', '📧')}
                    {renderInput('WhatsApp Number', form.leaderWhatsApp, (v) => updateLeaderField('leaderWhatsApp', v), 'leaderWhatsApp', '94********', 'tel', '📱')}
                    {renderInput('Roll Number', form.leaderRollNumber, (v) => updateLeaderField('leaderRollNumber', v), 'leaderRollNumber', 'e.g. 202*btech***', 'text', '🎓')}
                    {renderSelect('Course', form.leaderCourse, (v) => updateLeaderField('leaderCourse', v as any), 'leaderCourse', ['BTech', 'BBA', 'BDes'], '📚')}
                    {renderInput('Batch/Year', form.leaderBatch, (v) => updateLeaderField('leaderBatch', v), 'leaderBatch', 'e.g. 2024', 'text', '📅')}
                    {renderSelect('Residence Type', form.leaderResidency, (v) => updateLeaderField('leaderResidency', v as any), 'leaderResidency', ['Hosteller', 'Day Scholar'], '🏠')}
                    {form.leaderResidency === 'Day Scholar' && (
                      <>
                        {renderSelect('Will you take mess food?', form.leaderMessFood === true ? 'Yes' : form.leaderMessFood === false ? 'No' : 'No', (v) => updateLeaderField('leaderMessFood', v === 'Yes' ? 'true' : 'false'), 'leaderMessFood', ['Yes', 'No'], '🍽️')}
                        <div style={{ marginBottom: '14px', padding: '12px 16px', background: 'rgba(232,98,26,0.1)', border: '1px solid rgba(232,98,26,0.25)', borderRadius: '10px', fontSize: '12px', color: '#E8C39E', lineHeight: '1.5' }}>
                          <strong>📢 Note:</strong> No changes will be entered in future and payment is during offline registration if opting for mess.
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── MEMBERS ── */}
            {memberConfig.map((mc, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div className={`section-header ${mc.section}`} onClick={() => toggleSection(`member${i}`)}
                  style={{
                    background: 'rgba(22, 33, 39, 0.4)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: 'pointer', transition: 'all 0.3s ease'
                  }}>
                  <span style={{ fontSize: '18px' }}>{mc.icon}</span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: '14px', color: '#a0a0a0', fontFamily: 'var(--font-orbitron)' }}>Team {mc.label}</span>
                  <span style={{
                    background: 'rgba(255,255,255,0.05)', color: '#888', fontSize: '10px',
                    padding: '4px 10px', borderRadius: '20px', fontWeight: 700, textTransform: 'uppercase'
                  }}>{mc.label}</span>
                  <span style={{ transition: 'transform 0.3s ease', transform: openSections[`member${i}`] ? 'rotate(180deg)' : 'rotate(0)', fontSize: '11px', color: '#9c8578' }}>▼</span>
                </div>
                {openSections[`member${i}`] && (
                  <div style={{ padding: '18px 4px 4px', animation: 'fadeIn 0.25s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      {renderInput('Full Name', form.members[i].name, (v) => updateMemberField(i, 'name', v), `member${i}.name`, 'Full name', 'text', '👤')}
                      {renderInput('JKLU Email', form.members[i].email, (v) => updateMemberField(i, 'email', v), `member${i}.email`, 'name@jklu.edu.in', 'email', '📧')}
                      {renderInput('WhatsApp Number', form.members[i].whatsApp, (v) => updateMemberField(i, 'whatsApp', v), `member${i}.whatsApp`, '94********', 'tel', '📱')}
                      {renderInput('Roll Number', form.members[i].rollNumber, (v) => updateMemberField(i, 'rollNumber', v), `member${i}.rollNumber`, 'e.g. 202*btech***', 'text', '🎓')}
                      {renderSelect('Course', form.members[i].course, (v) => updateMemberField(i, 'course', v as any), `member${i}.course`, ['BTech', 'BBA', 'BDes'], '📚')}
                      {renderInput('Batch/Year', form.members[i].batch, (v) => updateMemberField(i, 'batch', v), `member${i}.batch`, 'e.g. 2024', 'text', '📅')}
                      {renderSelect('Residence Type', form.members[i].residency, (v) => updateMemberField(i, 'residency', v as any), `member${i}.residency`, ['Hosteller', 'Day Scholar'], '🏠')}
                      {form.members[i].residency === 'Day Scholar' && (
                        <>
                          {renderSelect('Will you take mess food?', form.members[i].messFood === true ? 'Yes' : form.members[i].messFood === false ? 'No' : 'No', (v) => updateMemberField(i, 'messFood', v === 'Yes' ? 'true' : 'false'), `member${i}.messFood`, ['Yes', 'No'], '🍽️')}
                          <div style={{ marginBottom: '14px', padding: '12px 16px', background: 'rgba(232,98,26,0.1)', border: '1px solid rgba(232,98,26,0.25)', borderRadius: '10px', fontSize: '12px', color: '#E8C39E', lineHeight: '1.5', gridColumn: '1 / -1' }}>
                            <strong>📢 Note:</strong> No changes will be entered in future and payment is during offline registration if opting for mess.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Error message */}
            {submitError && (
              <div style={{
                marginTop: '14px', padding: '14px 18px', background: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '14px',
                color: '#fca5a5', fontSize: '14px', textAlign: 'center', fontWeight: 500,
              }}>
                ⚠️ {submitError}
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginTop: '28px', textAlign: 'center' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? '#333' : 'linear-gradient(135deg, #CF9D7B, #724B39)',
                  color: isSubmitting ? '#666' : '#121519',
                  padding: '16px 48px', borderRadius: '50px',
                  border: 'none', fontSize: '16px', fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: isSubmitting ? 'none' : '0 10px 30px rgba(207,157,123,0.25), inset 0 2px 5px rgba(255,255,255,0.2)',
                  fontFamily: 'var(--font-orbitron)', letterSpacing: '1.5px', textTransform: 'uppercase',
                  transition: 'all 0.3s ease', transform: isSubmitting ? 'scale(0.98)' : 'scale(1)',
                  width: '100%', maxWidth: '380px', position: 'relative', overflow: 'hidden'
                }}
              >
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span className="spinner" /> ⚡ PROCESSING...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    🚀 CONFIRM REGISTRATION
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Contact for Queries */}
          <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '40px', padding: '0 20px' }}>
            <p style={{
              color: '#a0a0a0', fontSize: '14px', marginBottom: '8px',
              fontFamily: 'var(--font-orbitron)', letterSpacing: '0.5px'
            }}>
              For any queries, please contact us at:
            </p>
            <a href="mailto:counciloftechnicalaffairs@jklu.edu.in"
              className="glow-link"
              style={{
                color: '#CF9D7B', fontWeight: 600, textDecoration: 'none',
                fontSize: 'clamp(14px, 4vw, 16px)', letterSpacing: '0.5px',
                borderBottom: '1px dashed rgba(207,157,123,0.4)', paddingBottom: '2px',
                transition: 'all 0.3s ease'
              }}
            >
              counciloftechnicalaffairs@jklu.edu.in
            </a>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', color: '#724B39', fontSize: '13px', marginTop: '20px', lineHeight: 1.6, fontWeight: 500 }}>
            <p style={{ margin: '0 0 12px 0', fontFamily: 'var(--font-orbitron)', letterSpacing: '1px' }}>
              ORGANIZED BY COUNCIL OF TECHNICAL AFFAIRS
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <div>
                <div style={{ color: '#CF9D7B', fontWeight: 700 }}>Suryaansh Sharma</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>General Secretary</div>
              </div>
              <div>
                <div style={{ color: '#CF9D7B', fontWeight: 700 }}>Aman Pratap Singh</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>Secretary</div>
              </div>
            </div>

            {/* Bottom Logos */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', opacity: 0.8 }}>
              <Image src="/TechnicalAffairs.png" alt="Technical Affairs" width={100} height={50} style={{ objectFit: 'contain', height: '40px', width: 'auto' }} />
              <div style={{ width: '1px', height: '20px', background: '#724B39' }}></div>
              <Image src="/JKLU White.png" alt="JKLU" width={90} height={40} style={{ objectFit: 'contain', height: '32px', width: 'auto' }} />
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        /* GRADIENT BACKGROUND STYLES */
        .gradient-bg {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: #0a0c0f; /* Deep Dark Background */
          z-index: 0; overflow: hidden;
        }
        .gradients-container {
          width: 100%; height: 100%; filter: url(#goo) blur(40px);
        }
        .g1, .g2, .g3, .g4, .g5 {
          position: absolute; mix-blend-mode: hard-light;
          width: 80%; height: 80%; opacity: 0.4;
          animation: move 18s ease infinite;
        }
        .g1 {
          background: radial-gradient(circle at center, rgba(207,157,123, 0.3) 0, rgba(0,0,0,0) 50%);
          top: -10%; left: -10%; animation-delay: 0s; transform-origin: center center;
        }
        .g2 {
          background: radial-gradient(circle at center, rgba(114,75,57, 0.3) 0, rgba(0,0,0,0) 50%);
          top: 20%; right: 20%; animation-delay: -5s; transform-origin: calc(50% - 400px);
        }
        .g3 {
          background: radial-gradient(circle at center, rgba(207,157,123, 0.2) 0, rgba(0,0,0,0) 50%);
          bottom: -20%; left: 20%; animation-delay: -10s; transform-origin: calc(50% + 400px);
        }
        .g4 {
          background: radial-gradient(circle at center, rgba(232,195,158, 0.15) 0, rgba(0,0,0,0) 50%);
          top: 40%; left: 40%; animation-delay: -15s; transform-origin: calc(50% - 200px);
        }
        .g5 {
          background: radial-gradient(circle at center, rgba(114,75,57, 0.3) 0, rgba(0,0,0,0) 50%);
          bottom: 10%; right: 10%; animation-delay: -8s; transform-origin: calc(50% - 800px) calc(50% + 200px);
        }
        @keyframes move {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glow-text {
          text-shadow: 0 0 20px rgba(207,157,123,0.4);
        }
        /* UNIQUE FORM SHAPE - Futuristic Cut Corners */
        .glass-card {
           transition: transform 0.3s ease, box-shadow 0.3s ease;
           clip-path: polygon(
             20px 0, 100% 0, 
             100% calc(100% - 20px), calc(100% - 20px) 100%, 
             0 100%, 0 20px
           );
           border: none !important; /* Clip-path hides borders, so we use a pseudo-element or box-shadow tweak if needed */
           box-shadow: none !important; /* Standard shadow doesn't work well with clip-path, replaced with filter drop-shadow container if needed, or internal glow */
           background: rgba(30, 22, 17, 0.85) !important;
           position: relative;
        }
        /* Add a border effect via a pseudo-element or separate container if needed, 
           but for now, we'll use a subtle internal inset shadow on the container itself 
           or relying on the background contrast */
        
        .perk-card:hover { transform: translateY(-10px) rotateX(5deg); box-shadow: 0 20px 40px -10px rgba(207,157,123,0.2); }
        .spinner {
          width: 18px; height: 18px; border: 2px solid rgba(18,21,25,0.3);
          border-top: 2px solid #121519; border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        /* PREMIUM INPUT STYLES - COFFEE THEME */
        .form-input {
           background: #1E1611 !important; /* Dark Espresso */
           border: 1px solid #3E2C22 !important; /* Roasted Bean Border */
           border-left: 3px solid #8D6E63 !important; /* Warm Cocoa Accent */
           color: #E6CCB2 !important; /* Creamy Latte Text */
           font-family: 'Courier New', monospace; 
           font-size: 16px !important; /* Increased for better readability */
           border-radius: 4px !important;
           transition: all 0.3s ease;
        }
        .form-input:focus {
           border-color: #D4A373 !important; /* Golden Latte Glow */
           border-left-color: #D4A373 !important;
           box-shadow: 0 0 15px rgba(212, 163, 115, 0.25) !important;
           background: #2C201A !important; /* Slightly lighter espresso on focus */
        }
        .form-input::placeholder {
           color: #B08968 !important; /* Lighter cocoa for better visibility */
           opacity: 0.8;
           font-family: sans-serif;
           font-style: italic;
           font-size: 15px !important;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #121519; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #CF9D7B; }
        
        .glow-link:hover {
          color: #E8C39E !important;
          text-shadow: 0 0 10px rgba(207,157,123,0.6);
          border-bottom-color: #E8C39E !important;
        }
      `}</style>
    </div>
  );
}
