'use client';

import React, { useState } from 'react';

const CATEGORIES = [
    {
        id: 'ai-ml',
        title: 'AI / ML',
        icon: '🤖',
        color: '#CF9D7B',
        statements: [
            "AI Farmer Assistant for Rural India",
            "Fake News Detection for Regional Languages",
            "AI Resume Analyzer for Students",
            "Smart Traffic Prediction System for Tier-2 Cities",
            "AI Healthcare Triage Assistant",
            "Speech-to-Text for Indian Accents",
            "AI Career Guidance Tool for School Students",
            "Automatic Translation Tool for Government Notices",
            "AI-Based Attendance Using Face Recognition",
            "Crop Disease Detection from Images",
            "AI Mental Health Companion for Students",
            "AI Tool to Simplify Legal Documents",
            "Indian Sign Language Recognition",
            "AI Tool to Detect Online Exam Cheating",
            "Disaster Prediction Dashboard Using Data"
        ]
    },
    {
        id: 'blockchain',
        title: 'Blockchain',
        icon: '⛓️',
        color: '#E8C39E',
        statements: [
            "Land Record Management on Blockchain",
            "Blockchain-Based Certificate Verification",
            "Transparent Donation Tracking Platform",
            "Decentralized Voting System for Colleges",
            "Blockchain for the Supply Chain of Medicines",
            "Digital Identity for Rural Citizens",
            "Anti-Counterfeit System for Products",
            "Scholarship Distribution Tracking",
            "Freelancer Payment Escrow via Smart Contracts",
            "Secure Academic Records Wallet",
            "Blockchain-Based Crowdfunding Platform",
            "Transparent NGO Fund Utilization Tracker",
            "Vehicle History Tracking System",
            "Decentralized Marketplace for Farmers",
            "Blockchain-Based Ticketing to Prevent Scalping"
        ]
    },
    {
        id: 'cybersecurity',
        title: 'Cybersecurity',
        icon: '🛡️',
        color: '#A0A0A0',
        statements: [
            "Phishing Detection Tool for Indian Users",
            "Browser Extension for Scam Website Alerts",
            "UPI Fraud Detection System",
            "Password Strength Analyzer for Students",
            "Personal Data Leak Checker",
            "Cyber Awareness Game for School Students",
            "Secure Messaging App Prototype",
            "IoT Device Security Monitor",
            "Deepfake Detection Tool",
            "Social Media Privacy Analyzer",
            "Public WiFi Risk Detector",
            "Email Spam Classifier",
            "Cyberbullying Detection Tool",
            "Secure File Sharing Platform",
            "Digital Safety App for Senior Citizens"
        ]
    },
    {
        id: 'web-dev',
        title: 'Web Development',
        icon: '💻',
        color: '#724B39',
        statements: [
            "Smart Campus Management System",
            "Local Language Learning Platform",
            "Government Scheme Finder for Citizens",
            "Job Portal for Tier-2 & Tier-3 Cities",
            "Skill Exchange Platform for Students",
            "Rural Marketplace Connecting Farmers to Buyers",
            "Volunteer Platform for NGOs",
            "Blood Donation Network",
            "Event Discovery Platform for Cities",
            "Women's Safety Alert Web App",
            "Local Tourism Promotion Portal",
            "Community Problem Reporting Platform",
            "Affordable Housing Finder",
            "Public Transport Tracking Dashboard",
            "Startup Collaboration Platform"
        ]
    }
];

export default function ProblemStatements() {
    const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);

    return (
        <section style={{
            position: 'relative', zIndex: 3,
            padding: 'clamp(40px, 8vw, 80px) 20px',
            maxWidth: '1000px', margin: '0 auto',
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
                    Problem Statements
                </h2>
                <p style={{ color: '#a0a0a0', fontSize: '14px', margin: 0 }}>
                    Choose your track and solve real-world challenges
                </p>
            </div>

            {/* Categories Tabs */}
            <div style={{
                display: 'flex', gap: '10px', justifyContent: 'flex-start', flexWrap: 'nowrap',
                marginBottom: '30px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any,
                padding: '4px 0',
            }}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        style={{
                            padding: 'clamp(8px, 2vw, 12px) clamp(14px, 3vw, 24px)', borderRadius: '30px',
                            background: activeTab === cat.id ? cat.color : 'rgba(255,255,255,0.05)',
                            color: activeTab === cat.id ? '#121519' : '#a0a0a0',
                            border: activeTab === cat.id ? `1px solid ${cat.color}` : '1px solid rgba(255,255,255,0.1)',
                            fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: activeTab === cat.id ? `0 0 20px ${cat.color}44` : 'none',
                            display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' as any,
                            flexShrink: 0,
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                        {cat.title}
                    </button>
                ))}
            </div>

            {/* Statements Grid */}
            <div style={{
                background: 'rgba(30, 22, 17, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(207,157,123,0.2)',
                borderRadius: '24px',
                padding: 'clamp(24px, 4vw, 40px)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '400px'
            }}>
                {/* Animated Background Accent */}
                <div style={{
                    position: 'absolute', top: '-50px', right: '-50px',
                    width: '200px', height: '200px',
                    background: 'radial-gradient(circle, rgba(207,157,123,0.1) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none'
                }} />

                {CATEGORIES.map((cat) => (
                    <div
                        key={cat.id}
                        style={{
                            display: activeTab === cat.id ? 'grid' : 'none',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
                            gap: '16px',
                            animation: 'fadeIn 0.5s ease-out'
                        }}
                    >
                        {cat.statements.map((statement, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: 'rgba(207,157,123,0.03)',
                                    border: '1px solid rgba(207,157,123,0.1)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(207,157,123,0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(207,157,123,0.3)';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(207,157,123,0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(207,157,123,0.1)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: cat.color, boxShadow: `0 0 10px ${cat.color}`
                                }} />
                                <span style={{ color: '#ccc', fontSize: '13.5px', lineHeight: 1.4, fontWeight: 500 }}>
                                    {statement}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Categories specific description if any */}
                <div style={{
                    marginTop: '32px', paddingTop: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <div style={{ fontSize: '20px' }}>ℹ️</div>
                    <p style={{ color: '#888', fontSize: '12px', margin: 0, fontStyle: 'italic' }}>
                        Participants can choose any one problem statement from their preferred track.
                    </p>
                </div>
            </div>
        </section>
    );
}
