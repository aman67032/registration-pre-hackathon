'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
    name: string;
    email: string;
    whatsApp: string;
    rollNumber: string;
    residency: 'Hosteller' | 'Day Scholar';
    messFood?: boolean;
    course: 'BTech' | 'BBA' | 'BDes';
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
    leaderCourse: 'BTech' | 'BBA' | 'BDes';
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

// Flatten teams into individual people
function flattenTeams(teams: Team[]): Person[] {
    const people: Person[] = [];
    for (const team of teams) {
        people.push({
            name: team.leaderName,
            email: team.leaderEmail,
            whatsApp: team.leaderWhatsApp,
            rollNumber: team.leaderRollNumber,
            residency: team.leaderResidency,
            messFood: team.leaderMessFood === true,
            course: team.leaderCourse || '',
            batch: team.leaderBatch || '',
            role: 'Leader',
            teamName: team.teamName,
            teamId: team._id,
        });
        for (const m of team.members) {
            people.push({
                name: m.name,
                email: m.email,
                whatsApp: m.whatsApp,
                rollNumber: m.rollNumber,
                residency: m.residency,
                messFood: m.messFood === true,
                course: m.course || '',
                batch: m.batch || '',
                role: 'Member',
                teamName: team.teamName,
                teamId: team._id,
            });
        }
    }
    return people;
}

// Stat Card Component
function StatCard({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
    return (
        <div style={{
            background: 'rgba(30, 22, 17, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(207,157,123,0.15)',
            borderRadius: '14px',
            padding: '18px 16px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: color,
            }} />
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
            <div style={{
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 800,
                color: color,
                fontFamily: 'var(--font-orbitron)',
                lineHeight: 1.2,
            }}>{value}</div>
            <div style={{
                fontSize: '10px',
                color: '#a0a0a0',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginTop: '4px',
                lineHeight: 1.3,
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

    // Filter states
    const [residencyFilter, setResidencyFilter] = useState('All');
    const [messFoodFilter, setMessFoodFilter] = useState('All');
    const [batchFilter, setBatchFilter] = useState('All');
    const [courseFilter, setCourseFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        setIsCheckingAuth(false);
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        setIsLoading(true);
        setError('');
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
                if (res.status === 401) {
                    localStorage.removeItem('adminToken');
                    router.push('/admin/login');
                } else {
                    setError(data.message || 'Failed to fetch registrations');
                }
            }
        } catch {
            setError('Unable to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    // All people flattened
    const allPeople = useMemo(() => flattenTeams(teams), [teams]);

    // Compute stats from ALL people (unfiltered)
    const stats = useMemo(() => {
        const totalTeams = teams.length;
        const totalPeople = allPeople.length;
        const dayScholars = allPeople.filter(p => p.residency === 'Day Scholar').length;
        const hostellers = allPeople.filter(p => p.residency === 'Hosteller').length;
        const messOpted = allPeople.filter(p => p.messFood).length;
        const batch2024 = allPeople.filter(p => p.batch.includes('2024')).length;
        const batch2025 = allPeople.filter(p => p.batch.includes('2025')).length;
        const batchOther = totalPeople - batch2024 - batch2025;
        return { totalTeams, totalPeople, dayScholars, hostellers, messOpted, batch2024, batch2025, batchOther };
    }, [allPeople, teams]);

    // Available batches
    const availableBatches = useMemo(() => {
        const batches = new Set<string>();
        allPeople.forEach(p => { if (p.batch) batches.add(p.batch); });
        return Array.from(batches).sort();
    }, [allPeople]);

    // Filtered people
    const filteredPeople = useMemo(() => {
        let result = [...allPeople];

        if (residencyFilter !== 'All') {
            result = result.filter(p => p.residency === residencyFilter);
        }
        if (messFoodFilter !== 'All') {
            result = result.filter(p => messFoodFilter === 'Yes' ? p.messFood : !p.messFood);
        }
        if (batchFilter !== 'All') {
            result = result.filter(p => p.batch === batchFilter);
        }
        if (courseFilter !== 'All') {
            result = result.filter(p => p.course.toLowerCase() === courseFilter.toLowerCase());
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.email.toLowerCase().includes(q) ||
                p.rollNumber.toLowerCase().includes(q) ||
                p.teamName.toLowerCase().includes(q)
            );
        }

        return result;
    }, [allPeople, residencyFilter, messFoodFilter, batchFilter, courseFilter, searchQuery]);

    const clearFilters = () => {
        setResidencyFilter('All');
        setMessFoodFilter('All');
        setBatchFilter('All');
        setCourseFilter('All');
        setSearchQuery('');
    };

    const hasActiveFilters = residencyFilter !== 'All' || messFoodFilter !== 'All' || batchFilter !== 'All' || courseFilter !== 'All' || searchQuery.trim() !== '';

    const handleDownload = async (filtered: boolean = false) => {
        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const url = `${API_URL}/api/admin/export`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                const blob = await res.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `registrations_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(downloadUrl);
            } else {
                alert('Failed to download CSV');
            }
        } catch {
            alert('Error downloading CSV');
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
    };

    // Select styles
    const selectStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(207,157,123,0.2)',
        borderRadius: '8px',
        color: '#e0e0e0',
        fontSize: '13px',
        cursor: 'pointer',
        outline: 'none',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '10px',
        fontWeight: 700,
        color: '#a0a0a0',
        marginBottom: '5px',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
    };

    // Auth loading
    if (isCheckingAuth) {
        return (
            <div style={{ position: 'relative', minHeight: '100vh', background: '#121519', color: '#e0e0e0' }}>
                <div className="gradient-bg">
                    <div className="gradients-container">
                        <div className="g1"></div><div className="g2"></div><div className="g3"></div><div className="g4"></div><div className="g5"></div>
                    </div>
                </div>
                <div style={{ position: 'relative', zIndex: 3, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                        <p style={{ color: '#a0a0a0', fontSize: '16px' }}>Verifying authentication...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', minHeight: '100vh', background: '#121519', color: '#e0e0e0' }}>
            {/* Gradient Background */}
            <div className="gradient-bg">
                <div className="gradients-container">
                    <div className="g1"></div><div className="g2"></div><div className="g3"></div><div className="g4"></div><div className="g5"></div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 3, padding: 'clamp(16px, 3vw, 40px) clamp(12px, 2vw, 20px)', maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
                }}>
                    <div>
                        <h1 style={{
                            fontFamily: 'OriginTech, sans-serif',
                            fontSize: 'clamp(24px, 5vw, 42px)',
                            fontWeight: 400, margin: '0 0 4px 0',
                            background: 'linear-gradient(135deg, #CF9D7B 0%, #E8C39E 50%, #724B39 100%)',
                            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>Admin Panel</h1>
                        <p style={{ color: '#a0a0a0', fontSize: '13px', margin: 0 }}>
                            {filteredPeople.length} of {allPeople.length} people shown
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleDownload(false)} style={{
                            padding: '10px 20px', background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px',
                            color: '#10b981', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        }}>📥 CSV</button>
                        <button onClick={logout} style={{
                            padding: '10px 20px', background: 'rgba(220, 38, 38, 0.2)',
                            border: '1px solid rgba(220, 38, 38, 0.4)', borderRadius: '10px',
                            color: '#f87171', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        }}>Logout</button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px',
                }}>
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
                <div style={{
                    background: 'rgba(30, 22, 17, 0.85)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(207,157,123,0.2)', borderRadius: '14px',
                    padding: 'clamp(14px, 2vw, 22px)', marginBottom: '24px',
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '14px', flexWrap: 'wrap', gap: '8px',
                    }}>
                        <h3 style={{
                            fontFamily: 'var(--font-orbitron)', fontSize: '14px', fontWeight: 700,
                            color: '#CF9D7B', margin: 0, letterSpacing: '0.5px',
                        }}>Filters</h3>
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
                        <input
                            type="text"
                            placeholder="🔍 Search by name, email, roll number, or team..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px', boxSizing: 'border-box',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(207,157,123,0.2)',
                                borderRadius: '10px', color: '#e0e0e0', fontSize: '14px', outline: 'none',
                            }}
                        />
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '12px',
                    }}>
                        <div>
                            <label style={labelStyle}>Residency</label>
                            <select value={residencyFilter} onChange={(e) => setResidencyFilter(e.target.value)} style={selectStyle}>
                                <option value="All">All</option>
                                <option value="Hosteller">Hosteller</option>
                                <option value="Day Scholar">Day Scholar</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Mess Food</label>
                            <select value={messFoodFilter} onChange={(e) => setMessFoodFilter(e.target.value)} style={selectStyle}>
                                <option value="All">All</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Batch</label>
                            <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} style={selectStyle}>
                                <option value="All">All</option>
                                {availableBatches.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Course</label>
                            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} style={selectStyle}>
                                <option value="All">All</option>
                                <option value="BTech">BTech</option>
                                <option value="BBA">BBA</option>
                                <option value="BDes">BDes</option>
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
                    <div style={{
                        background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)',
                        borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#f87171',
                    }}>
                        ⚠ {error}
                    </div>
                )}

                {/* People List */}
                {!isLoading && !error && (
                    <div>
                        {filteredPeople.length === 0 ? (
                            <div style={{
                                background: 'rgba(30, 22, 17, 0.85)', backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(207,157,123,0.2)', borderRadius: '16px',
                                padding: '40px', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
                                    No people found matching your filters
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                                gap: '14px',
                            }}>
                                {filteredPeople.map((person, idx) => (
                                    <div key={`${person.teamId}-${person.role}-${idx}`} style={{
                                        background: 'rgba(30, 22, 17, 0.85)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(207,157,123,0.15)',
                                        borderRadius: '14px',
                                        padding: '18px',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}>
                                        {/* Top color bar based on role */}
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                            background: person.role === 'Leader'
                                                ? 'linear-gradient(90deg, #CF9D7B, #E8C39E)'
                                                : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                                        }} />

                                        {/* Header: Name + Badges */}
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'flex-start', marginBottom: '14px', gap: '8px',
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{
                                                    fontSize: '16px', fontWeight: 700, color: '#e0e0e0',
                                                    margin: '0 0 4px 0', lineHeight: 1.3,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>{person.name}</h3>
                                                <p style={{
                                                    fontSize: '12px', color: '#9c8578', margin: 0,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    Team: <span style={{ color: '#CF9D7B' }}>{person.teamName}</span>
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                                <span style={{
                                                    padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                                                    textTransform: 'uppercase', letterSpacing: '0.5px',
                                                    background: person.role === 'Leader' ? 'rgba(207,157,123,0.2)' : 'rgba(59,130,246,0.15)',
                                                    color: person.role === 'Leader' ? '#CF9D7B' : '#60a5fa',
                                                    border: `1px solid ${person.role === 'Leader' ? 'rgba(207,157,123,0.3)' : 'rgba(59,130,246,0.3)'}`,
                                                }}>
                                                    {person.role === 'Leader' ? '👑 Leader' : '👤 Member'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <span style={{ color: '#7a6b5d', fontWeight: 600 }}>Email: </span>
                                                <span style={{ color: '#c0c0c0', wordBreak: 'break-all' }}>{person.email}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: '#7a6b5d', fontWeight: 600 }}>WhatsApp: </span>
                                                <span style={{ color: '#c0c0c0' }}>{person.whatsApp}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: '#7a6b5d', fontWeight: 600 }}>Roll No: </span>
                                                <span style={{ color: '#c0c0c0' }}>{person.rollNumber}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: '#7a6b5d', fontWeight: 600 }}>Course: </span>
                                                <span style={{ color: '#c0c0c0' }}>{person.course}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: '#7a6b5d', fontWeight: 600 }}>Batch: </span>
                                                <span style={{ color: '#c0c0c0' }}>{person.batch}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: '#7a6b5d', fontWeight: 600 }}>Residency: </span>
                                                <span style={{
                                                    color: person.residency === 'Hosteller' ? '#a78bfa' : '#60a5fa',
                                                    fontWeight: 600,
                                                }}>{person.residency}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: '#7a6b5d', fontWeight: 600 }}>Mess: </span>
                                                <span style={{
                                                    color: person.messFood ? '#34d399' : '#9c8578',
                                                    fontWeight: 600,
                                                }}>{person.messFood ? '✅ Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
