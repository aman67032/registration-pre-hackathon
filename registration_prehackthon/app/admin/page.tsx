'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('../components/Scene3D'), { ssr: false });

interface Member {
    name: string;
    email: string;
    whatsApp: string;
    rollNumber: string;
    residency: 'Hosteller' | 'Day Scholar';
    messFood?: boolean;
    course: 'BTech' | 'BBA' | 'BDes' | 'HSB';
    batch: string;
}

interface Team {
    _id: string;
    teamName: string;
    leaderName: string;
    leaderEmail: string;
    leaderWhatsApp: string;
    leaderRollNumber: string;
    leaderResidency: 'Hosteller' | 'Day Scholar';
    leaderMessFood?: boolean;
    leaderCourse: 'BTech' | 'BBA' | 'BDes' | 'HSB';
    leaderBatch: string;
    members: Member[];
    createdAt: string;
}

interface Person {
    name: string;
    email: string;
    whatsApp: string;
    rollNumber: string;
    residency: 'Hosteller' | 'Day Scholar';
    messFood: boolean;
    course: string;
    batch: string;
    role: 'Leader' | 'Member';
    teamName: string;
    teamId: string;
}

function flattenTeams(teams: Team[]): Person[] {
    const people: Person[] = [];
    for (const team of teams) {
        people.push({
            name: team.leaderName, email: team.leaderEmail, whatsApp: team.leaderWhatsApp,
            rollNumber: team.leaderRollNumber, residency: team.leaderResidency,
            messFood: team.leaderMessFood === true, course: team.leaderCourse || '',
            batch: team.leaderBatch || '', role: 'Leader', teamName: team.teamName, teamId: team._id,
        });
        for (const m of team.members) {
            people.push({
                name: m.name, email: m.email, whatsApp: m.whatsApp,
                rollNumber: m.rollNumber, residency: m.residency,
                messFood: m.messFood === true, course: m.course || '',
                batch: m.batch || '', role: 'Member', teamName: team.teamName, teamId: team._id,
            });
        }
    }
    return people;
}

// Stat Card
function StatCard({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
    return (
        <div style={{
            background: 'rgba(30, 22, 17, 0.85)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(207,157,123,0.15)', borderRadius: '14px',
            padding: '18px 16px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
            <div style={{
                fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, color,
                fontFamily: 'var(--font-orbitron)', lineHeight: 1.2,
            }}>{value}</div>
            <div style={{
                fontSize: '10px', color: '#a0a0a0', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '4px', lineHeight: 1.3,
            }}>{label}</div>
        </div>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [residencyFilter, setResidencyFilter] = useState('All');
    const [messFoodFilter, setMessFoodFilter] = useState('All');
    const [batchFilter, setBatchFilter] = useState('All');
    const [courseFilter, setCourseFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Expanded teams (for default view)
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

    // CSV dropdown
    const [csvDropdownOpen, setCsvDropdownOpen] = useState(false);
    const csvDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (csvDropdownRef.current && !csvDropdownRef.current.contains(e.target as Node)) {
                setCsvDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) { router.push('/admin/login'); return; }
        setIsCheckingAuth(false);
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        setIsLoading(true); setError('');
        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/admin/registrations`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setTeams(data.data);
            } else {
                if (res.status === 401) { localStorage.removeItem('adminToken'); router.push('/admin/login'); }
                else setError(data.message || 'Failed to fetch registrations');
            }
        } catch { setError('Unable to connect to server'); }
        finally { setIsLoading(false); }
    };

    const allPeople = useMemo(() => flattenTeams(teams), [teams]);

    // Stats
    const stats = useMemo(() => {
        const totalPeople = allPeople.length;
        return {
            totalTeams: teams.length,
            totalPeople,
            dayScholars: allPeople.filter(p => p.residency === 'Day Scholar').length,
            hostellers: allPeople.filter(p => p.residency === 'Hosteller').length,
            messOpted: allPeople.filter(p => p.messFood).length,
            batch2024: allPeople.filter(p => p.batch.includes('2024')).length,
            batch2025: allPeople.filter(p => p.batch.includes('2025')).length,
            batchOther: totalPeople - allPeople.filter(p => p.batch.includes('2024')).length - allPeople.filter(p => p.batch.includes('2025')).length,
        };
    }, [allPeople, teams]);

    const availableBatches = useMemo(() => {
        const batches = new Set<string>();
        allPeople.forEach(p => { if (p.batch) batches.add(p.batch); });
        return Array.from(batches).sort();
    }, [allPeople]);

    const hasActiveFilters = residencyFilter !== 'All' || messFoodFilter !== 'All' || batchFilter !== 'All' || courseFilter !== 'All' || searchQuery.trim() !== '';

    // Filtered people (for filtered view)
    const filteredPeople = useMemo(() => {
        let result = [...allPeople];
        if (residencyFilter !== 'All') result = result.filter(p => p.residency === residencyFilter);
        if (messFoodFilter !== 'All') result = result.filter(p => messFoodFilter === 'Yes' ? p.messFood : !p.messFood);
        if (batchFilter !== 'All') result = result.filter(p => p.batch === batchFilter);
        if (courseFilter !== 'All') result = result.filter(p => p.course.toLowerCase() === courseFilter.toLowerCase());
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) ||
                p.rollNumber.toLowerCase().includes(q) || p.teamName.toLowerCase().includes(q)
            );
        }
        return result;
    }, [allPeople, residencyFilter, messFoodFilter, batchFilter, courseFilter, searchQuery]);

    const clearFilters = () => {
        setResidencyFilter('All'); setMessFoodFilter('All');
        setBatchFilter('All'); setCourseFilter('All'); setSearchQuery('');
    };

    const toggleTeam = useCallback((teamId: string) => {
        setExpandedTeams(prev => {
            const n = new Set(prev);
            if (n.has(teamId)) n.delete(teamId); else n.add(teamId);
            return n;
        });
    }, []);

    const handleTeamsCsvDownload = async () => {
        setCsvDropdownOpen(false);
        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/admin/export`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `teams_${Date.now()}.csv`;
                document.body.appendChild(a); a.click(); a.remove();
                window.URL.revokeObjectURL(url);
            } else { alert('Failed to download CSV'); }
        } catch { alert('Error downloading CSV'); }
    };

    const generatePeopleCSV = (people: Person[], filename: string) => {
        setCsvDropdownOpen(false);
        const escapeCSV = (val: any) => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`;
            return str;
        };
        const headers = ['Name', 'Email', 'WhatsApp', 'Roll Number', 'Course', 'Batch', 'Residency', 'Mess Food', 'Role', 'Team Name'];
        const rows = people.map(p => [
            p.name, p.email, p.whatsApp, p.rollNumber, p.course, p.batch,
            p.residency, p.messFood ? 'Yes' : 'No', p.role, p.teamName,
        ].map(escapeCSV).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${filename}_${Date.now()}.csv`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
    };

    const logout = () => { localStorage.removeItem('adminToken'); router.push('/admin/login'); };

    const selectStyle: React.CSSProperties = {
        width: '100%', padding: '10px 12px', background: '#1e1610',
        border: '1px solid rgba(207,157,123,0.2)', borderRadius: '8px',
        color: '#e0e0e0', fontSize: '13px', cursor: 'pointer', outline: 'none',
    };
    const optionStyle: React.CSSProperties = {
        background: '#1e1610', color: '#e0e0e0',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '10px', fontWeight: 700, color: '#a0a0a0',
        marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px',
    };
    const cardBg: React.CSSProperties = {
        background: 'rgba(30, 22, 17, 0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(207,157,123,0.15)', borderRadius: '14px',
    };

    if (isCheckingAuth) {
        return (
            <div style={{ position: 'relative', minHeight: '100vh', background: '#121519', color: '#e0e0e0' }}>
                <div className="gradient-bg"><div className="gradients-container">
                    <div className="g1"></div><div className="g2"></div><div className="g3"></div><div className="g4"></div><div className="g5"></div>
                </div></div>
                <div style={{ position: 'relative', zIndex: 3, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                        <p style={{ color: '#a0a0a0', fontSize: '16px' }}>Verifying authentication...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Person Card (used in filtered view) ───
    const renderPersonCard = (person: Person, idx: number) => (
        <div key={`${person.teamId}-${person.role}-${idx}`} style={{
            ...cardBg, padding: '18px', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: person.role === 'Leader'
                    ? 'linear-gradient(90deg, #CF9D7B, #E8C39E)'
                    : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e0e0e0', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.name}</h3>
                    <p style={{ fontSize: '12px', color: '#9c8578', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Team: <span style={{ color: '#CF9D7B' }}>{person.teamName}</span>
                    </p>
                </div>
                <span style={{
                    padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
                    background: person.role === 'Leader' ? 'rgba(207,157,123,0.2)' : 'rgba(59,130,246,0.15)',
                    color: person.role === 'Leader' ? '#CF9D7B' : '#60a5fa',
                    border: `1px solid ${person.role === 'Leader' ? 'rgba(207,157,123,0.3)' : 'rgba(59,130,246,0.3)'}`,
                }}>
                    {person.role === 'Leader' ? '👑 Leader' : '👤 Member'}
                </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: '#7a6b5d', fontWeight: 600 }}>Email: </span>
                    <span style={{ color: '#c0c0c0', wordBreak: 'break-all' }}>{person.email}</span>
                </div>
                <div><span style={{ color: '#7a6b5d', fontWeight: 600 }}>WhatsApp: </span><span style={{ color: '#c0c0c0' }}>{person.whatsApp}</span></div>
                <div><span style={{ color: '#7a6b5d', fontWeight: 600 }}>Roll No: </span><span style={{ color: '#c0c0c0' }}>{person.rollNumber}</span></div>
                <div><span style={{ color: '#7a6b5d', fontWeight: 600 }}>Course: </span><span style={{ color: '#c0c0c0' }}>{person.course}</span></div>
                <div><span style={{ color: '#7a6b5d', fontWeight: 600 }}>Batch: </span><span style={{ color: '#c0c0c0' }}>{person.batch}</span></div>
                <div><span style={{ color: '#7a6b5d', fontWeight: 600 }}>Residency: </span><span style={{ color: person.residency === 'Hosteller' ? '#a78bfa' : '#60a5fa', fontWeight: 600 }}>{person.residency}</span></div>
                <div><span style={{ color: '#7a6b5d', fontWeight: 600 }}>Mess: </span><span style={{ color: person.messFood ? '#34d399' : '#9c8578', fontWeight: 600 }}>{person.messFood ? '✅ Yes' : 'No'}</span></div>
            </div>
        </div>
    );

    // ─── Member Detail Row (used in team expanded view) ───
    const renderMemberDetail = (label: string, value: string, highlight?: string) => (
        <div>
            <span style={{ color: '#9c8578', fontWeight: 600, fontSize: '13px' }}>{label}: </span>
            <span style={{ color: highlight || '#e0e0e0', marginLeft: '6px', fontSize: '13px' }}>{value}</span>
        </div>
    );

    return (
        <div style={{ position: 'relative', minHeight: '100vh', background: '#121519', color: '#e0e0e0' }}>
            <div className="gradient-bg"><div className="gradients-container">
                <div className="g1"></div><div className="g2"></div><div className="g3"></div><div className="g4"></div><div className="g5"></div>
            </div></div>
            <Scene3D />

            <div style={{ position: 'relative', zIndex: 3, padding: 'clamp(16px, 3vw, 40px) clamp(12px, 2vw, 20px)', maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{
                            fontFamily: 'OriginTech, sans-serif', fontSize: 'clamp(24px, 5vw, 42px)',
                            fontWeight: 400, margin: '0 0 4px 0',
                            background: 'linear-gradient(135deg, #CF9D7B 0%, #E8C39E 50%, #724B39 100%)',
                            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>Admin Panel</h1>
                        <p style={{ color: '#a0a0a0', fontSize: '13px', margin: 0 }}>
                            {hasActiveFilters
                                ? `${filteredPeople.length} of ${allPeople.length} people shown`
                                : `${teams.length} team${teams.length !== 1 ? 's' : ''} registered (${allPeople.length} people)`}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* CSV Dropdown */}
                        <div ref={csvDropdownRef} style={{ position: 'relative' }}>
                            <button onClick={() => setCsvDropdownOpen(prev => !prev)} style={{
                                padding: '10px 20px', background: 'rgba(16, 185, 129, 0.2)',
                                border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px',
                                color: '#10b981', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                                📥 CSV <span style={{ fontSize: '10px', transition: 'transform 0.2s', transform: csvDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                            </button>
                            {csvDropdownOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: '220px',
                                    background: 'rgba(30, 22, 17, 0.95)', backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(207,157,123,0.25)', borderRadius: '10px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 50, overflow: 'hidden',
                                }}>
                                    <button onClick={handleTeamsCsvDownload} style={{
                                        width: '100%', padding: '12px 16px', background: 'transparent',
                                        border: 'none', borderBottom: '1px solid rgba(207,157,123,0.1)',
                                        color: '#e0e0e0', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                        textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(207,157,123,0.1)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        📋 Teams CSV
                                    </button>
                                    <button onClick={() => generatePeopleCSV(allPeople, 'all_individuals')} style={{
                                        width: '100%', padding: '12px 16px', background: 'transparent',
                                        border: 'none', borderBottom: hasActiveFilters ? '1px solid rgba(207,157,123,0.1)' : 'none',
                                        color: '#e0e0e0', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                        textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(207,157,123,0.1)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        👥 All Individuals CSV
                                    </button>
                                    {hasActiveFilters && (
                                        <button onClick={() => generatePeopleCSV(filteredPeople, 'filtered_individuals')} style={{
                                            width: '100%', padding: '12px 16px', background: 'transparent',
                                            border: 'none',
                                            color: '#10b981', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                            textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                                        }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            🔍 Filtered ({filteredPeople.length}) CSV
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <button onClick={logout} style={{
                            padding: '10px 20px', background: 'rgba(220, 38, 38, 0.2)',
                            border: '1px solid rgba(220, 38, 38, 0.4)', borderRadius: '10px',
                            color: '#f87171', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        }}>Logout</button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                    <StatCard icon="📋" value={stats.totalTeams} label="Total Teams" color="#CF9D7B" />
                    <StatCard icon="👥" value={stats.totalPeople} label="Total People" color="#E8C39E" />
                    <StatCard icon="🏠" value={stats.dayScholars} label="Day Scholars" color="#3b82f6" />
                    <StatCard icon="🏨" value={stats.hostellers} label="Hostellers" color="#8b5cf6" />
                    <StatCard icon="🍽️" value={stats.messOpted} label="Mess Opted" color="#f59e0b" />
                    <StatCard icon="📅" value={stats.batch2024} label="Batch 2024" color="#10b981" />
                    <StatCard icon="📅" value={stats.batch2025} label="Batch 2025" color="#06b6d4" />
                    <StatCard icon="📅" value={stats.batchOther} label="Other Batch" color="#ec4899" />
                </div>

                {/* Filters */}
                <div style={{ ...cardBg, padding: 'clamp(14px, 2vw, 22px)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ fontFamily: 'var(--font-orbitron)', fontSize: '14px', fontWeight: 700, color: '#CF9D7B', margin: 0 }}>
                            Filters {hasActiveFilters && <span style={{ fontSize: '11px', color: '#a0a0a0', fontWeight: 400, fontFamily: 'inherit' }}> — showing individual people</span>}
                        </h3>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} style={{
                                padding: '6px 14px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(207,157,123,0.2)', borderRadius: '6px',
                                color: '#CF9D7B', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                            }}>Clear All</button>
                        )}
                    </div>

                    {/* Search */}
                    <div style={{ marginBottom: '14px' }}>
                        <input type="text" placeholder="🔍 Search by name, email, roll number, or team..."
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(207,157,123,0.2)',
                                borderRadius: '10px', color: '#e0e0e0', fontSize: '14px', outline: 'none',
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                        <div>
                            <label style={labelStyle}>Residency</label>
                            <select value={residencyFilter} onChange={(e) => setResidencyFilter(e.target.value)} style={selectStyle}>
                                <option value="All" style={optionStyle}>All</option><option value="Hosteller" style={optionStyle}>Hosteller</option><option value="Day Scholar" style={optionStyle}>Day Scholar</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Mess Food</label>
                            <select value={messFoodFilter} onChange={(e) => setMessFoodFilter(e.target.value)} style={selectStyle}>
                                <option value="All" style={optionStyle}>All</option><option value="Yes" style={optionStyle}>Yes</option><option value="No" style={optionStyle}>No</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Batch</label>
                            <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} style={selectStyle}>
                                <option value="All" style={optionStyle}>All</option>
                                {availableBatches.map(b => (<option key={b} value={b} style={optionStyle}>{b}</option>))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Course</label>
                            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} style={selectStyle}>
                                <option value="All" style={optionStyle}>All</option><option value="BTech" style={optionStyle}>BTech</option><option value="BBA" style={optionStyle}>BBA</option><option value="BDes" style={optionStyle}>BDes</option><option value="HSB" style={optionStyle}>HSB</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <p style={{ color: '#a0a0a0', fontSize: '16px' }}>Loading registrations...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#f87171' }}>
                        ⚠ {error}
                    </div>
                )}

                {/* ═══ CONTENT AREA ═══ */}
                {!isLoading && !error && (
                    <>
                        {/* ─── DEFAULT VIEW: Team-based expandable list ─── */}
                        {!hasActiveFilters && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {teams.length === 0 ? (
                                    <div style={{ ...cardBg, padding: '40px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                        <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>No registrations yet</p>
                                    </div>
                                ) : (
                                    teams.map((team) => (
                                        <div key={team._id} style={{ ...cardBg, padding: '22px', transition: 'all 0.3s ease' }}>
                                            {/* Team Header (clickable) */}
                                            <div onClick={() => toggleTeam(team._id)} style={{
                                                cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: expandedTeams.has(team._id) ? '20px' : '0',
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <h3 style={{
                                                        fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(15px, 2.5vw, 18px)',
                                                        fontWeight: 700, color: '#CF9D7B', margin: '0 0 6px 0',
                                                    }}>{team.teamName}</h3>
                                                    <p style={{ color: '#a0a0a0', fontSize: '13px', margin: '0 0 3px 0' }}>
                                                        Leader: {team.leaderName} • {team.leaderEmail}
                                                    </p>
                                                    <p style={{ color: '#777', fontSize: '11px', margin: 0 }}>
                                                        Registered: {new Date(team.createdAt).toLocaleDateString()} {new Date(team.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <div style={{
                                                    transform: expandedTeams.has(team._id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.3s ease', fontSize: '18px', color: '#CF9D7B',
                                                    flexShrink: 0, marginLeft: '12px', marginTop: '4px',
                                                }}>▼</div>
                                            </div>

                                            {/* Expanded Details */}
                                            {expandedTeams.has(team._id) && (
                                                <div>
                                                    {/* Leader */}
                                                    <div style={{
                                                        background: 'rgba(207,157,123,0.05)', border: '1px solid rgba(207,157,123,0.15)',
                                                        borderRadius: '12px', padding: '16px', marginBottom: '12px',
                                                    }}>
                                                        <h4 style={{
                                                            fontSize: '13px', fontWeight: 700, color: '#CF9D7B',
                                                            margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.8px',
                                                        }}>👑 Team Leader</h4>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                                            {renderMemberDetail('Name', team.leaderName)}
                                                            {renderMemberDetail('Email', team.leaderEmail)}
                                                            {renderMemberDetail('WhatsApp', team.leaderWhatsApp)}
                                                            {renderMemberDetail('Roll Number', team.leaderRollNumber)}
                                                            {renderMemberDetail('Course', team.leaderCourse)}
                                                            {renderMemberDetail('Batch', team.leaderBatch)}
                                                            {renderMemberDetail('Residency', team.leaderResidency)}
                                                            {renderMemberDetail('Mess Food', team.leaderMessFood ? 'Yes' : 'No')}
                                                        </div>
                                                    </div>

                                                    {/* Members */}
                                                    {team.members.map((member, idx) => (
                                                        <div key={idx} style={{
                                                            background: 'rgba(207,157,123,0.03)', border: '1px solid rgba(207,157,123,0.1)',
                                                            borderRadius: '12px', padding: '16px',
                                                            marginBottom: idx < team.members.length - 1 ? '10px' : '0',
                                                        }}>
                                                            <h4 style={{
                                                                fontSize: '12px', fontWeight: 700, color: '#a0a0a0',
                                                                margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.8px',
                                                            }}>👤 Member {idx + 1}</h4>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                                                {renderMemberDetail('Name', member.name)}
                                                                {renderMemberDetail('Email', member.email)}
                                                                {renderMemberDetail('WhatsApp', member.whatsApp)}
                                                                {renderMemberDetail('Roll Number', member.rollNumber)}
                                                                {renderMemberDetail('Course', member.course)}
                                                                {renderMemberDetail('Batch', member.batch)}
                                                                {renderMemberDetail('Residency', member.residency)}
                                                                {renderMemberDetail('Mess Food', member.messFood ? 'Yes' : 'No')}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* ─── FILTERED VIEW: Individual person cards ─── */}
                        {hasActiveFilters && (
                            <div>
                                {filteredPeople.length === 0 ? (
                                    <div style={{ ...cardBg, padding: '40px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                        <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>No people found matching your filters</p>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                                        gap: '14px',
                                    }}>
                                        {filteredPeople.map((person, idx) => renderPersonCard(person, idx))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
