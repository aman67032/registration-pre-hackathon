'use client';
import React from 'react';

interface WinnerMember {
    name: string;
    role?: string;
}

interface WinnerData {
    rank: 1 | 2;
    teamName: string;
    teamId: string;
    leader: string;
    members: WinnerMember[];
    problemStatement: string;
    cashPrize: string;
}

const winners: WinnerData[] = [
    {
        rank: 1,
        teamName: 'XLNC',
        teamId: 'T-12',
        leader: 'Vaibhav Sharma',
        members: [
            { name: 'Vaishnavi Shukla' },
            { name: 'Agamya Singh Chauhan' },
            { name: 'Mohit Khurana' },
        ],
        problemStatement: "Women's Safety Alert Web App",
        cashPrize: '₹8,000',
    },
    {
        rank: 2,
        teamName: 'team',
        teamId: 'T-11',
        leader: 'Aayan Gohar',
        members: [
            { name: 'Naman Goyal' },
            { name: 'Udit Yadav' },
            { name: 'Tia Sukhnanni' },
        ],
        problemStatement: 'Local Language Learning Platform',
        cashPrize: '₹4,000',
    },
];

export default function Winners() {
    return (
        <section
            id="winners"
            style={{
                position: 'relative',
                zIndex: 3,
                padding: 'clamp(40px, 8vw, 80px) 20px',
                maxWidth: '1000px',
                margin: '0 auto',
            }}
        >
            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 6vw, 56px)' }}>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px',
                        fontSize: 'clamp(36px, 6vw, 52px)',
                    }}
                >
                    🏆
                </div>
                <h2
                    style={{
                        fontFamily: 'OriginTech, sans-serif',
                        fontSize: 'clamp(32px, 6vw, 56px)',
                        fontWeight: 400,
                        margin: '0 0 12px 0',
                        letterSpacing: '3px',
                        lineHeight: 1.1,
                        background: 'linear-gradient(135deg, #CF9D7B 0%, #E8C39E 40%, #FFD700 60%, #CF9D7B 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 40px rgba(207,157,123,0.3)',
                    }}
                >
                    WINNERS
                </h2>
                <p style={{ color: '#a0a0a0', fontSize: '14px', margin: 0, letterSpacing: '0.5px' }}>
                    Congratulations to our Pre-Hackathon champions!
                </p>
            </div>

            {/* Winners Cards Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))',
                    gap: 'clamp(20px, 4vw, 32px)',
                    alignItems: 'start',
                }}
            >
                {winners.map((winner) => (
                    <WinnerCard key={winner.rank} winner={winner} />
                ))}
            </div>

            {/* Inline styles for animations */}
            <style>{`
        @keyframes winnerDotMove {
          0%, 100% { top: 8%; right: 8%; }
          25% { top: 8%; right: calc(100% - 28px); }
          50% { top: calc(100% - 24px); right: calc(100% - 28px); }
          75% { top: calc(100% - 24px); right: 8%; }
        }
        @keyframes winnerRayPulse {
          0%, 100% { opacity: 0.25; transform: rotate(40deg) scale(1); }
          50% { opacity: 0.45; transform: rotate(42deg) scale(1.05); }
        }
        @keyframes winnerShine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes winnerFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes winnerGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
        </section>
    );
}

function WinnerCard({ winner }: { winner: WinnerData }) {
    const isFirst = winner.rank === 1;
    const accentGradient = isFirst
        ? 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)'
        : 'linear-gradient(135deg, #C0C0C0, #E8E8E8, #A0A0A0)';
    const borderGlow = isFirst
        ? 'rgba(255, 215, 0, 0.3)'
        : 'rgba(192, 192, 192, 0.2)';
    const dotColor = isFirst ? '#FFD700' : '#C0C0C0';
    const dotShadow = isFirst ? '0 0 12px #FFD700, 0 0 24px rgba(255,215,0,0.4)' : '0 0 10px #C0C0C0, 0 0 20px rgba(192,192,192,0.3)';

    return (
        <div
            style={{
                position: 'relative',
                borderRadius: '16px',
                padding: '2px',
                background: `radial-gradient(circle 300px at 0% 0%, ${isFirst ? 'rgba(255,215,0,0.25)' : 'rgba(192,192,192,0.2)'}, #0c0d0d)`,
                animation: 'winnerFloat 4s ease-in-out infinite',
                animationDelay: isFirst ? '0s' : '0.5s',
            }}
        >
            {/* Orbiting Dot */}
            <div
                style={{
                    width: '6px',
                    height: '6px',
                    position: 'absolute',
                    backgroundColor: dotColor,
                    boxShadow: dotShadow,
                    borderRadius: '50%',
                    zIndex: 4,
                    animation: 'winnerDotMove 6s linear infinite',
                    animationDelay: isFirst ? '0s' : '3s',
                }}
            />

            {/* Card inner */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    borderRadius: '14px',
                    border: `1px solid ${isFirst ? 'rgba(255,215,0,0.15)' : 'rgba(192,192,192,0.1)'}`,
                    background: `radial-gradient(circle 350px at 0% 0%, ${isFirst ? 'rgba(60,50,20,0.6)' : 'rgba(50,50,55,0.5)'}, #0c0d0d)`,
                    padding: 'clamp(24px, 4vw, 36px)',
                    overflow: 'hidden',
                }}
            >
                {/* Ray effect */}
                <div
                    style={{
                        position: 'absolute',
                        width: '200px',
                        height: '40px',
                        borderRadius: '100px',
                        backgroundColor: isFirst ? '#FFD700' : '#C0C0C0',
                        opacity: 0.3,
                        boxShadow: `0 0 40px ${isFirst ? '#FFD700' : '#ccc'}`,
                        filter: 'blur(12px)',
                        transformOrigin: '10%',
                        top: '0%',
                        left: '0',
                        transform: 'rotate(40deg)',
                        animation: 'winnerRayPulse 4s ease-in-out infinite',
                        zIndex: 0,
                    }}
                />

                {/* Decorative grid lines */}
                <div style={{ position: 'absolute', top: '10%', left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, ${isFirst ? 'rgba(255,215,0,0.2)' : 'rgba(192,192,192,0.15)'} 30%, transparent 70%)`, zIndex: 0 }} />
                <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, height: '1px', background: `rgba(${isFirst ? '255,215,0' : '192,192,192'}, 0.06)`, zIndex: 0 }} />
                <div style={{ position: 'absolute', left: '8%', top: 0, bottom: 0, width: '1px', background: `linear-gradient(180deg, ${isFirst ? 'rgba(255,215,0,0.18)' : 'rgba(192,192,192,0.12)'} 30%, transparent 70%)`, zIndex: 0 }} />
                <div style={{ position: 'absolute', right: '8%', top: 0, bottom: 0, width: '1px', background: `rgba(${isFirst ? '255,215,0' : '192,192,192'}, 0.04)`, zIndex: 0 }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                    {/* Rank badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 16px',
                                borderRadius: '10px',
                                background: accentGradient,
                                boxShadow: `0 4px 16px ${borderGlow}`,
                                fontSize: '13px',
                                fontWeight: 800,
                                color: '#121519',
                                fontFamily: 'var(--font-orbitron)',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                            }}
                        >
                            {isFirst ? '🥇' : '🥈'} {isFirst ? '1st Place' : '2nd Place'}
                        </div>
                        <span
                            style={{
                                fontSize: '10px',
                                padding: '3px 10px',
                                borderRadius: '6px',
                                background: `rgba(${isFirst ? '255,215,0' : '192,192,192'}, 0.1)`,
                                color: isFirst ? '#FFD700' : '#C0C0C0',
                                fontWeight: 700,
                                border: `1px solid rgba(${isFirst ? '255,215,0' : '192,192,192'}, 0.2)`,
                                fontFamily: 'var(--font-orbitron)',
                            }}
                        >
                            {winner.teamId}
                        </span>
                    </div>

                    {/* Team name - large animated gradient text */}
                    <h3
                        style={{
                            fontFamily: 'OriginTech, var(--font-orbitron)',
                            fontSize: 'clamp(22px, 3.5vw, 30px)',
                            fontWeight: 400,
                            margin: '0 0 20px 0',
                            lineHeight: 1.2,
                            background: isFirst
                                ? 'linear-gradient(45deg, #1a1a1a 4%, #FFD700, #FFA500, #1a1a1a)'
                                : 'linear-gradient(45deg, #1a1a1a 4%, #E8E8E8, #C0C0C0, #1a1a1a)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundSize: '300% 100%',
                            animation: 'winnerGradient 4s ease infinite',
                        }}
                    >
                        {winner.teamName}
                    </h3>

                    {/* Divider */}
                    <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${isFirst ? 'rgba(255,215,0,0.3)' : 'rgba(192,192,192,0.2)'}, transparent)`, marginBottom: '20px' }} />

                    {/* Team Leader */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '16px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: `rgba(${isFirst ? '255,215,0' : '192,192,192'}, 0.06)`,
                            border: `1px solid rgba(${isFirst ? '255,215,0' : '192,192,192'}, 0.1)`,
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>👑</span>
                        <div>
                            <div style={{ fontSize: '10px', color: isFirst ? '#FFD700' : '#C0C0C0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', fontFamily: 'var(--font-orbitron)' }}>
                                Team Leader
                            </div>
                            <div style={{ fontSize: '15px', color: '#e0e0e0', fontWeight: 600 }}>
                                {winner.leader}
                            </div>
                        </div>
                    </div>

                    {/* Members */}
                    <div style={{ marginBottom: '18px' }}>
                        <div style={{ fontSize: '10px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontFamily: 'var(--font-orbitron)' }}>
                            Team Members
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {winner.members.map((member, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isFirst ? '#FFD700' : '#C0C0C0'} strokeWidth="2" style={{ flexShrink: 0, opacity: 0.7 }}>
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    <span style={{ color: '#c0c0c0', fontSize: '13px', fontWeight: 500 }}>
                                        {member.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Problem Statement */}
                    <div
                        style={{
                            marginBottom: '20px',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            borderLeft: `3px solid ${isFirst ? '#FFD700' : '#C0C0C0'}`,
                            background: 'rgba(255,255,255,0.03)',
                        }}
                    >
                        <div style={{ fontSize: '10px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontFamily: 'var(--font-orbitron)' }}>
                            Problem Statement
                        </div>
                        <div style={{ color: '#b0b0b0', fontSize: '14px', lineHeight: 1.6 }}>
                            {winner.problemStatement}
                        </div>
                    </div>

                    {/* Cash Prize */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            padding: '14px',
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, rgba(${isFirst ? '255,215,0' : '192,192,192'}, 0.08), rgba(${isFirst ? '255,165,0' : '160,160,160'}, 0.04))`,
                            border: `1px solid rgba(${isFirst ? '255,215,0' : '192,192,192'}, 0.15)`,
                        }}
                    >
                        <span style={{ fontSize: '22px' }}>💰</span>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', fontFamily: 'var(--font-orbitron)' }}>
                                Cash Prize
                            </div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-orbitron)',
                                    fontSize: 'clamp(20px, 3vw, 28px)',
                                    fontWeight: 800,
                                    background: accentGradient,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {winner.cashPrize}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
