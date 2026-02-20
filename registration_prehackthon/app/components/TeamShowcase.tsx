'use client';
import React, { useState, useEffect, useMemo } from 'react';

interface TeamData {
    _id: string;
    teamName: string;
    leaderName: string;
    allocatedTeamId?: string;
    problemStatement?: string;
    githubRepo?: string;
    roomNumber?: string;
}

export default function TeamShowcase() {
    const [teams, setTeams] = useState<TeamData[]>([]);
    const [rooms, setRooms] = useState<string[]>([]);
    const [activeRoom, setActiveRoom] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        fetch(`${API}/api/admin/teams-public`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setTeams(data.data);
                    setRooms(data.rooms || []);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        if (activeRoom === 'All') return teams;
        return teams.filter(t => t.roomNumber === activeRoom);
    }, [teams, activeRoom]);

    if (loading) {
        return (
            <section style={{ position: 'relative', zIndex: 3, padding: 'clamp(40px,8vw,80px) 20px', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{
                        fontFamily: 'OriginTech, sans-serif', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 400, margin: '0 0 12px',
                        background: 'linear-gradient(135deg, #CF9D7B 0%, #E8C39E 50%, #724B39 100%)',
                        backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>Team Showcase</h2>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ width: '320px', height: '200px', borderRadius: '16px', background: 'rgba(207,157,123,0.08)', animation: 'skeleton-pulse 1.5s infinite' }} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (teams.length === 0) return null;

    return (
        <section id="team-showcase" style={{ position: 'relative', zIndex: 3, padding: 'clamp(40px,8vw,80px) 20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{
                    fontFamily: 'OriginTech, sans-serif', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 400, margin: '0 0 8px',
                    background: 'linear-gradient(135deg, #CF9D7B 0%, #E8C39E 50%, #724B39 100%)',
                    backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 20px rgba(207,157,123,0.3)',
                }}>Team Showcase</h2>
                <p style={{ color: '#a0a0a0', fontSize: '14px', margin: '0 0 4px' }}>
                    {teams.length} teams building amazing projects
                </p>
            </div>

            {/* Room Filter Tabs */}
            <div style={{
                display: 'flex', gap: '8px', justifyContent: 'flex-start', flexWrap: 'nowrap', marginBottom: '28px',
                padding: '4px', background: 'rgba(30,22,17,0.6)', borderRadius: '14px', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(207,157,123,0.12)', maxWidth: '800px', margin: '0 auto 28px',
                overflowX: 'auto', WebkitOverflowScrolling: 'touch',
            }}>
                <button
                    onClick={() => setActiveRoom('All')}
                    style={{
                        padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-orbitron)',
                        letterSpacing: '0.5px', textTransform: 'uppercase', transition: 'all 0.2s', whiteSpace: 'nowrap',
                        background: activeRoom === 'All' ? 'linear-gradient(135deg, #CF9D7B, #724B39)' : 'transparent',
                        color: activeRoom === 'All' ? '#121519' : '#a0a0a0',
                    }}
                >All ({teams.length})</button>
                {rooms.map(room => {
                    const count = teams.filter(t => t.roomNumber === room).length;
                    return (
                        <button
                            key={room}
                            onClick={() => setActiveRoom(room)}
                            style={{
                                padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-orbitron)',
                                letterSpacing: '0.3px', transition: 'all 0.2s', whiteSpace: 'nowrap',
                                background: activeRoom === room ? 'linear-gradient(135deg, #CF9D7B, #724B39)' : 'transparent',
                                color: activeRoom === room ? '#121519' : '#888',
                            }}
                        >{room} ({count})</button>
                    );
                })}
            </div>

            {/* Team Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
                gap: '16px',
            }}>
                {filtered.map((team, idx) => (
                    <div
                        key={team._id}
                        style={{
                            background: 'linear-gradient(145deg, rgba(30,22,17,0.9), rgba(30,22,17,0.7))',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(207,157,123,0.15)',
                            borderRadius: '16px',
                            padding: 'clamp(14px, 3vw, 20px)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            animation: `fadeInUp 0.4s ease ${idx * 0.03}s both`,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'rgba(207,157,123,0.4)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 30px rgba(207,157,123,0.12)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(207,157,123,0.15)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Top-left gradient accent */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
                            background: 'linear-gradient(90deg, #724B39, #CF9D7B, transparent)',
                        }} />

                        {/* Team Number Badge & Room */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {team.allocatedTeamId && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, #CF9D7B, #724B39)',
                                        color: '#121519', fontSize: '11px', fontWeight: 800,
                                        padding: '3px 10px', borderRadius: '6px',
                                        fontFamily: 'var(--font-orbitron)', letterSpacing: '0.5px',
                                    }}>#{team.allocatedTeamId}</span>
                                )}
                                {team.roomNumber && (
                                    <span style={{
                                        background: 'rgba(207,157,123,0.12)',
                                        color: '#CF9D7B', fontSize: '10px', fontWeight: 600,
                                        padding: '3px 8px', borderRadius: '5px',
                                        fontFamily: 'var(--font-orbitron)',
                                    }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '3px', verticalAlign: '-1px' }}>
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        </svg>
                                        {team.roomNumber}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Team Name */}
                        <h3 style={{
                            fontFamily: 'var(--font-orbitron)', fontSize: '15px', fontWeight: 700,
                            color: '#E8C39E', margin: '0 0 4px', letterSpacing: '0.3px',
                            lineHeight: 1.3,
                        }}>{team.teamName}</h3>

                        {/* Leader */}
                        <p style={{ color: '#8a7a6e', fontSize: '12px', margin: '0 0 12px', fontWeight: 500 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CF9D7B" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: '-2px' }}>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            {team.leaderName}
                        </p>

                        {/* Problem Statement */}
                        {team.problemStatement && (
                            <p style={{
                                color: '#b0a090', fontSize: '13px', lineHeight: 1.6, margin: '0 0 14px',
                                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                                overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{team.problemStatement}</p>
                        )}

                        {/* GitHub Link */}
                        {team.githubRepo && (
                            <a
                                href={team.githubRepo}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    color: '#CF9D7B', fontSize: '12px', fontWeight: 600,
                                    textDecoration: 'none', padding: '6px 12px',
                                    background: 'rgba(207,157,123,0.08)',
                                    borderRadius: '8px', border: '1px solid rgba(207,157,123,0.15)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(207,157,123,0.18)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(207,157,123,0.08)'; e.currentTarget.style.borderColor = 'rgba(207,157,123,0.15)'; }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                View Repository
                            </a>
                        )}
                    </div>
                ))}
            </div>

            {/* Fade-in animation + mobile responsive */}
            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; }
        }
        /* Hide scrollbar for room filter tabs */
        #team-showcase > div:nth-child(2)::-webkit-scrollbar { display: none; }
        #team-showcase > div:nth-child(2) { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </section>
    );
}
