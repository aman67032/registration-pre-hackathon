'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('./components/Scene3D'), { ssr: false });

interface MemberData {
  name: string;
  email: string;
  whatsApp: string;
  rollNumber: string;
}

interface FormData {
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderWhatsApp: string;
  leaderRollNumber: string;
  members: MemberData[];
}

const initialMember: MemberData = { name: '', email: '', whatsApp: '', rollNumber: '' };

const initialForm: FormData = {
  teamName: '',
  leaderName: '',
  leaderEmail: '',
  leaderWhatsApp: '',
  leaderRollNumber: '',
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
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
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
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  const updateMemberField = useCallback((index: number, field: string, value: string) => {
    setForm((prev) => {
      const members = [...prev.members];
      members[index] = { ...members[index], [field]: value };
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
    { label: 'Member 1', badge: 'badge-teal', section: 'member-1', icon: '🧑‍💻', color: '#0d9488' },
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
          <p style={{ color: '#b08968', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>— Team HackJKLU</p>
        </div>
      </div>
    );
  }

  // ─── MAIN PAGE ───
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#fdf6ee' }}>
      <div className="bg-mesh" />
      <div className="grain-overlay" />
      <Scene3D />



      {/* ═══════════════ HERO SECTION — 100vh Light ═══════════════ */}
      <section style={{
        position: 'relative', zIndex: 3, minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', width: '100%', textAlign: 'center' }}>
          {/* Logos centered with drop shadows */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(24px, 5vw, 60px)',
            marginBottom: '36px', flexWrap: 'wrap', width: '100%',
          }}>
            <Image src="/JKLU White.png" alt="JKLU" width={170} height={72} style={{ objectFit: 'contain', height: '68px', width: 'auto', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <Image src="/hackjklu.png" alt="HackJKLU" width={220} height={85} style={{ objectFit: 'contain', height: '78px', width: 'auto', filter: 'drop-shadow(0 6px 12px rgba(232,98,26,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <Image src="/wscube.jpg" alt="WScube Tech" width={170} height={72} style={{ objectFit: 'contain', height: '68px', width: 'auto', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
          </div>

          {/* Sponsor badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 22px',
            borderRadius: '30px', background: 'linear-gradient(135deg, rgba(232,98,26,0.1), rgba(245,158,11,0.1))',
            border: '1px solid rgba(232, 98, 26, 0.2)',
            fontSize: '12px', color: '#c4530f', fontWeight: 600, marginBottom: '28px',
            letterSpacing: '1px', textTransform: 'uppercase',
            boxShadow: '0 2px 12px rgba(232,98,26,0.06)',
          }}>
            ⚡ Powered by WScube Tech
          </div>

          {/* Main title with OriginTech font */}
          <h1 style={{
            fontFamily: 'OriginTech, sans-serif',
            fontSize: 'clamp(50px, 10vw, 110px)',
            fontWeight: 400,
            margin: '0 0 8px 0',
            lineHeight: 1.05,
            background: 'linear-gradient(135deg, #e8621a 0%, #f59e0b 30%, #e11d48 60%, #0d9488 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '300% 300%',
            animation: 'gradient-shift 6s ease infinite',
            letterSpacing: '3px',
            filter: 'drop-shadow(0 4px 20px rgba(232,98,26,0.15))',
          }}>
            HackJKLU
          </h1>

          {/* Subtitle */}
          <h2 style={{
            fontFamily: 'OriginTech, sans-serif',
            fontSize: 'clamp(20px, 3.5vw, 36px)',
            fontWeight: 400,
            color: '#2d1810',
            margin: '0 0 24px 0',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            opacity: 0.65,
          }}>
            Pre-Hackathon Registration
          </h2>

          {/* Description */}
          <p style={{
            color: '#6b4c3b',
            fontSize: 'clamp(14px, 2vw, 17px)',
            maxWidth: '580px',
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}>
            Form your squad, sharpen your skills, and get a taste of what a real hackathon feels like —
            before the main event!
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap',
            maxWidth: '520px', margin: '0 auto 40px',
          }}>
            <StatCard
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e8621a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
              value="4"
              label="Per Team"
            />
            <StatCard
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
              value="24h"
              label="Duration"
            />
            <StatCard
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" /><path d="M4 22h16" /><path d="M10 22V2h4v20" /><path d="M6 9h12v4a8 8 0 0 1-12 0V9z" /></svg>}
              value="₹12K"
              label="Prize Pool"
            />
          </div>

          {/* Scroll indicator */}
          <div>
            <a href="#register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 28px', borderRadius: '30px',
              background: 'linear-gradient(135deg, #e8621a, #f59e0b)',
              color: '#fff', fontSize: '14px', fontWeight: 700,
              textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px',
              boxShadow: '0 4px 20px rgba(232,98,26,0.3)',
              transition: 'all 0.3s ease',
            }}>
              ↓ Register Now
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════ FORM SECTION ═══════════════ */}
      <div id="register" style={{ position: 'relative', zIndex: 3, scrollMarginTop: '60px' }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: '700px', margin: '0 auto', padding: 'clamp(28px, 5vw, 48px) 16px 72px' }}>

          {/* Section title */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(18px, 3vw, 24px)',
              fontWeight: 700, margin: '0 0 6px 0', color: '#2d1810',
            }}>
              <span className="glow-text">Team Registration</span>
            </h2>
            <p style={{ color: '#9c8578', fontSize: '13px', margin: 0 }}>
              All fields are mandatory • Use your JKLU email
            </p>
          </div>

          {/* Main card */}
          <div className="glass-card" style={{ padding: 'clamp(24px, 4vw, 40px)', overflow: 'hidden', position: 'relative' }}>
            {/* Decorative top gradient bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: 'linear-gradient(90deg, #e8621a, #f59e0b, #0d9488, #e11d48)',
            }} />

            {/* ── TEAM NAME ── */}
            <div style={{ marginBottom: '24px', paddingTop: '8px' }}>
              <h3 style={{
                fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: '#2d1810',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: 'var(--font-orbitron)',
              }}>
                <span style={{ fontSize: '18px' }}>🏆</span> Team Name
              </h3>
              <input
                type="text"
                className={`form-input ${errors.teamName ? 'error' : ''}`}
                placeholder="Enter your team name"
                value={form.teamName}
                onChange={(e) => updateLeaderField('teamName', e.target.value)}
                style={{ fontSize: '16px', padding: '14px 18px', fontWeight: 600 }}
              />
              {errors.teamName && <p style={{ color: '#dc2626', fontSize: '11px', margin: '4px 0 0 0', fontWeight: 500 }}>⚠ {errors.teamName}</p>}
            </div>

            {/* Gradient divider */}
            <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(232,98,26,0.15), rgba(245,158,11,0.15), transparent)', margin: '0 0 20px 0' }} />

            {/* ── TEAM LEADER ── */}
            <div style={{ marginBottom: '14px' }}>
              <div className="section-header leader" onClick={() => toggleSection('leader')}>
                <span style={{ fontSize: '18px' }}>👑</span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: '14px', color: '#2d1810', fontFamily: 'var(--font-orbitron)' }}>Team Leader</span>
                <span className="badge badge-orange">Leader</span>
                <span style={{ transition: 'transform 0.3s ease', transform: openSections.leader ? 'rotate(180deg)' : 'rotate(0)', fontSize: '11px', color: '#9c8578' }}>▼</span>
              </div>
              {openSections.leader && (
                <div style={{ padding: '18px 4px 4px', animation: 'fadeIn 0.25s ease' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0 16px' }}>
                    {renderInput('Full Name', form.leaderName, (v) => updateLeaderField('leaderName', v), 'leaderName', 'XYZ', 'text', '👤')}
                    {renderInput('JKLU Email', form.leaderEmail, (v) => updateLeaderField('leaderEmail', v), 'leaderEmail', 'name@jklu.edu.in', 'email', '📧')}
                    {renderInput('WhatsApp Number', form.leaderWhatsApp, (v) => updateLeaderField('leaderWhatsApp', v), 'leaderWhatsApp', '94********', 'tel', '📱')}
                    {renderInput('Roll Number', form.leaderRollNumber, (v) => updateLeaderField('leaderRollNumber', v), 'leaderRollNumber', 'e.g. 202*btech***', 'text', '🎓')}
                  </div>
                </div>
              )}
            </div>

            {/* ── MEMBERS ── */}
            {memberConfig.map((mc, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div className={`section-header ${mc.section}`} onClick={() => toggleSection(`member${i}`)}>
                  <span style={{ fontSize: '18px' }}>{mc.icon}</span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: '14px', color: '#2d1810', fontFamily: 'var(--font-orbitron)' }}>Team {mc.label}</span>
                  <span className={`badge ${mc.badge}`}>{mc.label}</span>
                  <span style={{ transition: 'transform 0.3s ease', transform: openSections[`member${i}`] ? 'rotate(180deg)' : 'rotate(0)', fontSize: '11px', color: '#9c8578' }}>▼</span>
                </div>
                {openSections[`member${i}`] && (
                  <div style={{ padding: '18px 4px 4px', animation: 'fadeIn 0.25s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0 16px' }}>
                      {renderInput('Full Name', form.members[i].name, (v) => updateMemberField(i, 'name', v), `member${i}.name`, 'Full name', 'text', '👤')}
                      {renderInput('JKLU Email', form.members[i].email, (v) => updateMemberField(i, 'email', v), `member${i}.email`, 'name@jklu.edu.in', 'email', '📧')}
                      {renderInput('WhatsApp Number', form.members[i].whatsApp, (v) => updateMemberField(i, 'whatsApp', v), `member${i}.whatsApp`, '94********', 'tel', '📱')}
                      {renderInput('Roll Number', form.members[i].rollNumber, (v) => updateMemberField(i, 'rollNumber', v), `member${i}.rollNumber`, 'e.g. 202*btech***', 'text', '🎓')}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Error message */}
            {submitError && (
              <div style={{
                marginTop: '14px', padding: '14px 18px', background: 'rgba(220, 38, 38, 0.06)',
                border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: '14px',
                color: '#dc2626', fontSize: '14px', textAlign: 'center', fontWeight: 500,
              }}>
                ⚠️ {submitError}
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginTop: '28px', textAlign: 'center' }}>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span style={{
                      width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Registering...
                  </span>
                ) : (
                  '🚀 Register Team'
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: '#9c8578', fontSize: '12px', marginTop: '24px', lineHeight: 1.5, fontWeight: 450 }}>
            JKLU × WScube Tech — Pre-Hackathon for HackJKLU
          </p>
        </form>
      </div>

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
