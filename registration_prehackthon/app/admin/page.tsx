'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
    name: string;
    email: string;
    whatsApp: string;
    rollNumber: string;
    residency: 'Hosteller' | 'Day Scholar';
    messFood?: boolean;
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
    members: Member[];
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [residencyFilter, setResidencyFilter] = useState('All');
    const [messFoodFilter, setMessFoodFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState('All');
    const [courseFilter, setCourseFilter] = useState('All');

    // Expanded team tracking
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

    // Available years from data
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    useEffect(() => {
        // Check authentication
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (data.success) {
                setTeams(data.data);
                setFilteredTeams(data.data);

                // Extract unique years
                const years = new Set<string>();
                data.data.forEach((team: Team) => {
                    const year = team.leaderRollNumber.substring(0, 4);
                    years.add(year);
                    team.members.forEach(member => {
                        const memberYear = member.rollNumber.substring(0, 4);
                        years.add(memberYear);
                    });
                });
                setAvailableYears(Array.from(years).sort().reverse());
            } else {
                if (res.status === 401) {
                    localStorage.removeItem('adminToken');
                    router.push('/admin/login');
                } else {
                    setError(data.message || 'Failed to fetch registrations');
                }
            }
        } catch (err) {
            setError('Unable to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...teams];

        if (residencyFilter !== 'All') {
            filtered = filtered.filter(team => {
                const leaderMatch = team.leaderResidency === residencyFilter;
                const membersMatch = team.members.every(m => m.residency === residencyFilter);
                return leaderMatch && membersMatch;
            });
        }

        if (messFoodFilter !== 'All') {
            const messFoodBool = messFoodFilter === 'Yes';
            filtered = filtered.filter(team => {
                const leaderMatch = team.leaderMessFood === messFoodBool;
                const membersMatch = team.members.some(m => m.messFood === messFoodBool);
                return leaderMatch || membersMatch;
            });
        }

        if (yearFilter !== 'All') {
            filtered = filtered.filter(team => {
                const leaderYear = team.leaderRollNumber.substring(0, 4);
                const membersHasYear = team.members.some(m => m.rollNumber.substring(0, 4) === yearFilter);
                return leaderYear === yearFilter || membersHasYear;
            });
        }

        if (courseFilter !== 'All') {
            filtered = filtered.filter(team => {
                const extractCourse = (rollNumber: string) => {
                    const match = rollNumber.toLowerCase().match(/\d{4}(btech|bba|bdes)/);
                    return match ? match[1] : '';
                };

                const leaderCourse = extractCourse(team.leaderRollNumber);
                const membersHasCourse = team.members.some(m => extractCourse(m.rollNumber) === courseFilter.toLowerCase());
                return leaderCourse === courseFilter.toLowerCase() || membersHasCourse;
            });
        }

        setFilteredTeams(filtered);
    };

    const clearFilters = () => {
        setResidencyFilter('All');
        setMessFoodFilter('All');
        setYearFilter('All');
        setCourseFilter('All');
        setFilteredTeams(teams);
    };

    const handleDownload = async (filtered: boolean = false) => {
        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            let url = `${API_URL}/api/admin/export?`;

            if (filtered) {
                if (residencyFilter !== 'All') url += `residency=${residencyFilter}&`;
                if (messFoodFilter !== 'All') url += `messFood=${messFoodFilter === 'Yes'}&`;
                if (yearFilter !== 'All') url += `year=${yearFilter}&`;
                if (courseFilter !== 'All') url += `course=${courseFilter}&`;
            }

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
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
        } catch (err) {
            alert('Error downloading CSV');
        }
    };

    const toggleTeam = (teamId: string) => {
        const newExpanded = new Set(expandedTeams);
        if (newExpanded.has(teamId)) {
            newExpanded.delete(teamId);
        } else {
            newExpanded.add(teamId);
        }
        setExpandedTeams(newExpanded);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
    };

    const hasActiveFilters = residencyFilter !== 'All' || messFoodFilter !== 'All' || yearFilter !== 'All' || courseFilter !== 'All';

    // Show loading while checking authentication
    if (isCheckingAuth) {
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
                <div style={{
                    position: 'relative',
                    zIndex: 3,
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
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
            {/* Same gradient background as home page */}
            <div className="gradient-bg">
                <div className="gradients-container">
                    <div className="g1"></div>
                    <div className="g2"></div>
                    <div className="g3"></div>
                    <div className="g4"></div>
                    <div className="g5"></div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 3, padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '40px',
                    flexWrap: 'wrap',
                    gap: '20px',
                }}>
                    <div>
                        <h1 style={{
                            fontFamily: 'OriginTech, sans-serif',
                            fontSize: 'clamp(28px, 5vw, 42px)',
                            fontWeight: 400,
                            margin: '0 0 8px 0',
                            background: 'linear-gradient(135deg, #CF9D7B 0%, #E8C39E 50%, #724B39 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Admin Panel
                        </h1>
                        <p style={{ color: '#a0a0a0', fontSize: '14px', margin: 0 }}>
                            {filteredTeams.length} registration{filteredTeams.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            padding: '12px 24px',
                            background: 'rgba(220, 38, 38, 0.2)',
                            border: '1px solid rgba(220, 38, 38, 0.4)',
                            borderRadius: '12px',
                            color: '#f87171',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Logout
                    </button>
                </div>

                {/* Filters Section */}
                <div style={{
                    background: 'rgba(30, 22, 17, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(207,157,123,0.2)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '32px',
                }}>
                    <h3 style={{
                        fontFamily: 'var(--font-orbitron)',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#CF9D7B',
                        margin: '0 0 20px 0',
                        letterSpacing: '0.5px',
                    }}>
                        Filters
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '20px',
                    }}>
                        {/* Residency Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#a0a0a0',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                            }}>
                                Residency
                            </label>
                            <select
                                value={residencyFilter}
                                onChange={(e) => setResidencyFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(207,157,123,0.2)',
                                    borderRadius: '8px',
                                    color: '#e0e0e0',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="All">All</option>
                                <option value="Hosteller">Hosteller</option>
                                <option value="Day Scholar">Day Scholar</option>
                            </select>
                        </div>

                        {/* Mess Food Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#a0a0a0',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                            }}>
                                Mess Food
                            </label>
                            <select
                                value={messFoodFilter}
                                onChange={(e) => setMessFoodFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(207,157,123,0.2)',
                                    borderRadius: '8px',
                                    color: '#e0e0e0',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="All">All</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#a0a0a0',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                            }}>
                                Year
                            </label>
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(207,157,123,0.2)',
                                    borderRadius: '8px',
                                    color: '#e0e0e0',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="All">All</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Course Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#a0a0a0',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                            }}>
                                Course
                            </label>
                            <select
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(207,157,123,0.2)',
                                    borderRadius: '8px',
                                    color: '#e0e0e0',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="All">All</option>
                                <option value="btech">BTech</option>
                                <option value="bba">BBA</option>
                                <option value="bdes">BDes</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={applyFilters}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #CF9D7B, #724B39)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#121519',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            style={{
                                padding: '12px 24px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(207,157,123,0.2)',
                                borderRadius: '8px',
                                color: '#CF9D7B',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Download Section */}
                <div style={{
                    background: 'rgba(30, 22, 17, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(207,157,123,0.2)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    marginBottom: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                }}>
                    <div>
                        <h3 style={{
                            fontFamily: 'var(--font-orbitron)',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#CF9D7B',
                            margin: '0 0 4px 0',
                        }}>
                            Export Data
                        </h3>
                        <p style={{ color: '#a0a0a0', fontSize: '12px', margin: 0 }}>
                            Download registration data as CSV
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => handleDownload(false)}
                            style={{
                                padding: '12px 24px',
                                background: 'rgba(16, 185, 129, 0.2)',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                borderRadius: '8px',
                                color: '#10b981',
                                fontSize: '14px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            📥 Download All
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={() => handleDownload(true)}
                                style={{
                                    padding: '12px 24px',
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.4)',
                                    borderRadius: '8px',
                                    color: '#3b82f6',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                📥 Download Filtered ({filteredTeams.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                        <p style={{ color: '#a0a0a0', fontSize: '16px' }}>Loading registrations...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{
                        background: 'rgba(220, 38, 38, 0.1)',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        color: '#f87171',
                    }}>
                        ⚠ {error}
                    </div>
                )}

                {/* Teams List */}
                {!isLoading && !error && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredTeams.length === 0 ? (
                            <div style={{
                                background: 'rgba(30, 22, 17, 0.85)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(207,157,123,0.2)',
                                borderRadius: '16px',
                                padding: '40px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
                                    No registrations found matching your filters
                                </p>
                            </div>
                        ) : (
                            filteredTeams.map((team) => (
                                <div
                                    key={team._id}
                                    style={{
                                        background: 'rgba(30, 22, 17, 0.85)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(207,157,123,0.2)',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {/* Team Header */}
                                    <div
                                        onClick={() => toggleTeam(team._id)}
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: expandedTeams.has(team._id) ? '20px' : '0',
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                fontFamily: 'var(--font-orbitron)',
                                                fontSize: '18px',
                                                fontWeight: 700,
                                                color: '#CF9D7B',
                                                margin: '0 0 8px 0',
                                            }}>
                                                {team.teamName}
                                            </h3>
                                            <p style={{ color: '#a0a0a0', fontSize: '13px', margin: '0 0 4px 0' }}>
                                                Leader: {team.leaderName} • {team.leaderEmail}
                                            </p>
                                            <p style={{ color: '#a0a0a0', fontSize: '12px', margin: 0 }}>
                                                Registered: {new Date(team.createdAt).toLocaleDateString()} {new Date(team.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div style={{
                                            transform: expandedTeams.has(team._id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s ease',
                                            fontSize: '20px',
                                            color: '#CF9D7B',
                                        }}>
                                            ▼
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedTeams.has(team._id) && (
                                        <div style={{ marginTop: '20px' }}>
                                            {/* Leader Details */}
                                            <div style={{
                                                background: 'rgba(207,157,123,0.05)',
                                                border: '1px solid rgba(207,157,123,0.15)',
                                                borderRadius: '12px',
                                                padding: '16px',
                                                marginBottom: '16px',
                                            }}>
                                                <h4 style={{
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    color: '#CF9D7B',
                                                    margin: '0 0 12px 0',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.8px',
                                                }}>
                                                    👑 Team Leader
                                                </h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                                                    <div>
                                                        <span style={{ color: '#9c8578', fontWeight: 600 }}>Name:</span>
                                                        <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{team.leaderName}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#9c8578', fontWeight: 600 }}>Email:</span>
                                                        <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{team.leaderEmail}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#9c8578', fontWeight: 600 }}>WhatsApp:</span>
                                                        <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{team.leaderWhatsApp}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#9c8578', fontWeight: 600 }}>Roll Number:</span>
                                                        <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{team.leaderRollNumber}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#9c8578', fontWeight: 600 }}>Residency:</span>
                                                        <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{team.leaderResidency}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#9c8578', fontWeight: 600 }}>Mess Food:</span>
                                                        <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{team.leaderMessFood ? 'Yes' : 'No'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Members */}
                                            {team.members.map((member, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        background: 'rgba(207,157,123,0.03)',
                                                        border: '1px solid rgba(207,157,123,0.1)',
                                                        borderRadius: '12px',
                                                        padding: '16px',
                                                        marginBottom: idx < team.members.length - 1 ? '12px' : '0',
                                                    }}
                                                >
                                                    <h4 style={{
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        color: '#a0a0a0',
                                                        margin: '0 0 12px 0',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.8px',
                                                    }}>
                                                        👤 Member {idx + 1}
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                                                        <div>
                                                            <span style={{ color: '#9c8578', fontWeight: 600 }}>Name:</span>
                                                            <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{member.name}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#9c8578', fontWeight: 600 }}>Email:</span>
                                                            <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{member.email}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#9c8578', fontWeight: 600 }}>WhatsApp:</span>
                                                            <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{member.whatsApp}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#9c8578', fontWeight: 600 }}>Roll Number:</span>
                                                            <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{member.rollNumber}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#9c8578', fontWeight: 600 }}>Residency:</span>
                                                            <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{member.residency}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#9c8578', fontWeight: 600 }}>Mess Food:</span>
                                                            <span style={{ color: '#e0e0e0', marginLeft: '8px' }}>{member.messFood ? 'Yes' : 'No'}</span>
                                                        </div>
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
            </div>
        </div>
    );
}
