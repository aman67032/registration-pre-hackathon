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
    isCheckedIn: boolean;
    extensionBoardGiven: boolean; // Added for extension board
    roomNumber?: string;
    allocatedTeamId?: string;
    problemStatement?: string;
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
    isCheckedIn: boolean;
    extensionBoardGiven: boolean; // Added
    roomNumber: string;
}

function flattenTeams(teams: Team[]): Person[] {
    const people: Person[] = [];
    for (const team of teams) {
        people.push({
            name: team.leaderName, email: team.leaderEmail, whatsApp: team.leaderWhatsApp,
            rollNumber: team.leaderRollNumber, residency: team.leaderResidency,
            messFood: team.leaderMessFood === true, course: team.leaderCourse || '',
            batch: team.leaderBatch || '', role: 'Leader', teamName: team.teamName, teamId: team._id,
            isCheckedIn: team.isCheckedIn || false,
            extensionBoardGiven: team.extensionBoardGiven || false,
            roomNumber: team.roomNumber || '',
        });
        for (const m of team.members) {
            people.push({
                name: m.name, email: m.email, whatsApp: m.whatsApp,
                rollNumber: m.rollNumber, residency: m.residency,
                messFood: m.messFood === true, course: m.course || '',
                batch: m.batch || '', role: 'Member', teamName: team.teamName, teamId: team._id,
                isCheckedIn: team.isCheckedIn || false,
                extensionBoardGiven: team.extensionBoardGiven || false,
                roomNumber: team.roomNumber || '',
            });
        }
    }
    return people;
}

// Stat Card
function StatCard({ icon, value, label, color, onClick }: { icon: React.ReactNode; value: string | number; label: string; color: string; onClick?: () => void }) {
    return (
        <div onClick={onClick} style={{
            background: 'rgba(30, 22, 17, 0.85)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(207,157,123,0.15)', borderRadius: '14px',
            padding: 'clamp(12px, 2vw, 18px) clamp(10px, 1.5vw, 16px)', textAlign: 'center', position: 'relative', overflow: 'hidden',
            cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s ease',
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />
            <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
            <div style={{
                fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800, color,
                fontFamily: 'var(--font-orbitron)', lineHeight: 1.2,
            }}>{value}</div>
            <div style={{
                fontSize: 'clamp(8px, 1.2vw, 10px)', color: '#a0a0a0', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '4px', lineHeight: 1.3,
            }}>{label}{onClick && ' ▾'}</div>
        </div>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [error, setError] = useState('');

    // Registration Mode State
    const [isRegistrationMode, setIsRegistrationMode] = useState(false);

    // View State
    const [activeView, setActiveView] = useState<'dashboard' | 'on-spot' | 'swap' | 'assign-ps'>('dashboard');

    // Filters
    const [residencyFilter, setResidencyFilter] = useState('All');
    const [messFoodFilter, setMessFoodFilter] = useState('All');
    const [batchFilter, setBatchFilter] = useState('All');
    const [courseFilter, setCourseFilter] = useState('All');
    const [roomFilter, setRoomFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Expanded teams (for default view)
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

    // CSV dropdown
    const [csvDropdownOpen, setCsvDropdownOpen] = useState(false);
    const csvDropdownRef = useRef<HTMLDivElement>(null);

    // Boards Given list toggle
    const [showBoardsList, setShowBoardsList] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (csvDropdownRef.current && !csvDropdownRef.current.contains(e.target as Node)) {
                setCsvDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // On-Spot Registration State
    const initialMemberState = { name: '', email: '', whatsApp: '', rollNumber: '', residency: 'Day Scholar', messFood: false, course: 'BTech', batch: '2024' };
    const [onSpotData, setOnSpotData] = useState({
        teamName: '',
        leaderName: '', leaderEmail: '', leaderWhatsApp: '', leaderRollNumber: '',
        leaderResidency: 'Day Scholar', leaderMessFood: false, leaderCourse: 'BTech', leaderBatch: '2024',
        leaderGender: 'Male', // Default or handle if needed
        members: [
            { ...initialMemberState },
            { ...initialMemberState },
            { ...initialMemberState }
        ]
    });

    // Swap Members State
    const [swapData, setSwapData] = useState({
        team1Id: '', member1Email: '',
        team2Id: '', member2Email: ''
    });

    // Assign Problem Statement State
    const [psData, setPsData] = useState({ boardNumber: '', problemStatement: '' });
    const [psMessage, setPsMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isSubmittingPS, setIsSubmittingPS] = useState(false);

    // Check-in Modal State
    const [checkInModal, setCheckInModal] = useState<{ teamId: string; teamName: string } | null>(null);
    const [checkInDetails, setCheckInDetails] = useState({ roomNumber: '', allocatedTeamId: '' });
    const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);

    const handleOnSpotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('Confirm On-Spot Registration?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/admin/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(onSpotData)
            });
            const data = await res.json();
            if (data.success) {
                alert('Team Registered Successfully');
                fetchRegistrations();
                setActiveView('dashboard');
                // Reset form optionally
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error registering team');
        }
    };

    const handleSwapSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('Confirm Member Swap?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/admin/swap-members`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(swapData)
            });
            const data = await res.json();
            if (data.success) {
                alert('Members Swapped Successfully');
                fetchRegistrations();
                setActiveView('dashboard');
                setSwapData({ team1Id: '', member1Email: '', team2Id: '', member2Email: '' });
            } else {
                alert(data.message || 'Swap failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error swapping members');
        }
    };

    const handleAssignPS = async (e: React.FormEvent) => {
        e.preventDefault();
        setPsMessage(null);
        setIsSubmittingPS(true);
        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/admin/assign-ps`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(psData),
            });
            const data = await res.json();
            if (data.success) {
                setPsMessage({ text: data.message, type: 'success' });
                setPsData({ boardNumber: '', problemStatement: '' });
                fetchRegistrations();
            } else {
                setPsMessage({ text: data.message || 'Failed to assign', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setPsMessage({ text: 'Error connecting to server', type: 'error' });
        } finally {
            setIsSubmittingPS(false);
        }
    };

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
            boardsGiven: teams.filter(t => t.extensionBoardGiven).length,
        };
    }, [allPeople, teams]);

    const availableBatches = useMemo(() => {
        const batches = new Set<string>();
        allPeople.forEach(p => { if (p.batch) batches.add(p.batch); });
        return Array.from(batches).sort();
    }, [allPeople]);

    const availableRooms = useMemo(() => {
        const rooms = new Set<string>();
        teams.forEach(t => { if (t.roomNumber) rooms.add(t.roomNumber); });
        return Array.from(rooms).sort();
    }, [teams]);


    // Filtered people (for filtered view)
    const filteredPeople = useMemo(() => {
        if (isRegistrationMode) return []; // Don't filter people in reg mode
        let result = [...allPeople];
        if (residencyFilter !== 'All') result = result.filter(p => p.residency === residencyFilter);
        if (messFoodFilter !== 'All') result = result.filter(p => messFoodFilter === 'Yes' ? p.messFood : !p.messFood);
        if (batchFilter !== 'All') result = result.filter(p => p.batch === batchFilter);
        if (courseFilter !== 'All') result = result.filter(p => p.course.toLowerCase() === courseFilter.toLowerCase());
        if (roomFilter !== 'All') result = result.filter(p => p.roomNumber === roomFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) ||
                p.rollNumber.toLowerCase().includes(q) || p.teamName.toLowerCase().includes(q)
            );
        }
        return result;
    }, [allPeople, residencyFilter, messFoodFilter, batchFilter, courseFilter, roomFilter, searchQuery, isRegistrationMode]);

    // Filtered Teams (for Registration Mode search)
    const filteredTeams = useMemo(() => {
        let result = [...teams];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(t =>
                t.teamName.toLowerCase().includes(q) ||
                t.leaderName.toLowerCase().includes(q) ||
                t.leaderEmail.toLowerCase().includes(q) ||
                t.leaderRollNumber.toLowerCase().includes(q) ||
                t.members.some(m =>
                    m.name.toLowerCase().includes(q) ||
                    m.email.toLowerCase().includes(q) ||
                    m.rollNumber.toLowerCase().includes(q)
                )
            );
        }
        // Apply room filter to teams
        if (roomFilter !== 'All') {
            result = result.filter(t => t.roomNumber === roomFilter);
        }
        return result;
    }, [teams, searchQuery, roomFilter]);

    const hasActiveFilters = !isRegistrationMode && (residencyFilter !== 'All' || messFoodFilter !== 'All' || batchFilter !== 'All' || courseFilter !== 'All' || searchQuery.trim() !== '');

    const clearFilters = () => {
        setResidencyFilter('All'); setMessFoodFilter('All');
        setBatchFilter('All'); setCourseFilter('All'); setRoomFilter('All'); setSearchQuery('');
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

    const toggleCheckIn = async (teamId: string, currentStatus: boolean | undefined) => {
        if (!currentStatus) {
            const team = teams.find(t => t._id === teamId);
            setCheckInModal({ teamId, teamName: team?.teamName || '' });
            setCheckInDetails({ roomNumber: '', allocatedTeamId: '' });
            return;
        }

        if (!confirm('Undo check-in for this team?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            setTeams(prev => prev.map(t => t._id === teamId ? { ...t, isCheckedIn: false } : t));

            const res = await fetch(`${API_URL}/api/admin/checkin/${teamId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: false }),
            });

            const data = await res.json();
            if (!data.success) {
                setTeams(prev => prev.map(t => t._id === teamId ? { ...t, isCheckedIn: true } : t));
                alert(data.message || 'Failed to update check-in status');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating check-in status');
        }
    };

    const handleConfirmCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkInModal) return;

        setIsSubmittingCheckIn(true);
        try {
            const token = localStorage.getItem('adminToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const res = await fetch(`${API_URL}/api/admin/checkin/${checkInModal.teamId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    status: true,
                    roomNumber: checkInDetails.roomNumber,
                    allocatedTeamId: checkInDetails.allocatedTeamId
                }),
            });

            const data = await res.json();
            if (data.success) {
                setTeams(prev => prev.map(t => t._id === checkInModal.teamId ? {
                    ...t,
                    isCheckedIn: true,
                    roomNumber: checkInDetails.roomNumber,
                    allocatedTeamId: checkInDetails.allocatedTeamId
                } : t));
                setCheckInModal(null);
            } else {
                alert(data.message || 'Check-in failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error during check-in');
        } finally {
            setIsSubmittingCheckIn(false);
        }
    };

    const toggleExtensionBoard = async (teamId: string, currentStatus: boolean | undefined) => {
        try {
            const token = localStorage.getItem('adminToken');
            const newStatus = !currentStatus;
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            setTeams(prev => prev.map(t => t._id === teamId ? { ...t, extensionBoardGiven: newStatus } : t));

            const res = await fetch(`${API_URL}/api/admin/extension-board/${teamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();
            if (!data.success) {
                setTeams(prev => prev.map(t => t._id === teamId ? { ...t, extensionBoardGiven: !!currentStatus } : t));
                alert(data.message || 'Failed to update extension board status');
            }
        } catch (error) {
            console.error("Extension Board Error Details:", error);
            alert('Error updating extension board status.');
        }
    };

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
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(207,157,123,0.2)', borderRadius: '8px',
        color: '#e0e0e0', fontSize: '14px', outline: 'none',
    };
    const buttonStyle: React.CSSProperties = {
        padding: '12px 24px', borderRadius: '10px', border: 'none',
        fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease',
        fontSize: '14px',
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '8px', fontSize: '12px' }}>
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

            <div style={{ position: 'relative', zIndex: 3, padding: 'clamp(12px, 3vw, 40px) clamp(8px, 2vw, 20px)', maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(16px, 3vw, 24px)', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <h1 style={{
                            fontFamily: 'OriginTech, sans-serif', fontSize: 'clamp(24px, 5vw, 42px)',
                            fontWeight: 400, margin: '0 0 4px 0',
                            background: 'linear-gradient(135deg, #CF9D7B 0%, #E8C39E 50%, #724B39 100%)',
                            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>Admin Panel</h1>
                        <p style={{ color: '#a0a0a0', fontSize: '13px', margin: 0 }}>
                            {activeView === 'dashboard' ? (hasActiveFilters
                                ? `${filteredPeople.length} of ${allPeople.length} people shown`
                                : `${teams.length} team${teams.length !== 1 ? 's' : ''} registered (${allPeople.length} people)`) :
                                activeView === 'on-spot' ? 'On-Spot Registration' : 'Swap Members'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* View Tabs */}
                        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
                            {['dashboard', 'on-spot', 'swap', 'assign-ps'].map(view => (
                                <button key={view} onClick={() => setActiveView(view as any)} style={{
                                    padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    background: activeView === view ? '#CF9D7B' : 'transparent',
                                    color: activeView === view ? '#121519' : '#a0a0a0',
                                    fontWeight: 700, fontSize: '12px', textTransform: 'capitalize', transition: 'all 0.2s'
                                }}>
                                    {view === 'assign-ps' ? 'Assign PS' : view.replace('-', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Registration Mode Toggle (Only in Dashboard) */}
                        {activeView === 'dashboard' && (
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                background: isRegistrationMode ? 'rgba(232, 98, 26, 0.2)' : 'rgba(255,255,255,0.05)',
                                padding: '8px 16px', borderRadius: '10px',
                                border: `1px solid ${isRegistrationMode ? '#E8621A' : 'rgba(255,255,255,0.1)'}`,
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{
                                    width: '36px', height: '20px', background: isRegistrationMode ? '#E8621A' : '#444',
                                    borderRadius: '20px', position: 'relative', transition: 'background 0.3s'
                                }}>
                                    <div style={{
                                        width: '16px', height: '16px', background: '#fff', borderRadius: '50%',
                                        position: 'absolute', top: '2px', left: isRegistrationMode ? '18px' : '2px',
                                        transition: 'left 0.3s'
                                    }} />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: isRegistrationMode ? '#E8621A' : '#a0a0a0' }}>
                                    Registration Mode
                                </span>
                                <input type="checkbox" checked={isRegistrationMode} onChange={() => setIsRegistrationMode(!isRegistrationMode)} style={{ display: 'none' }} />
                            </label>
                        )}

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

                {/* Dashboard View */}
                {activeView === 'dashboard' && (
                    <>
                        {/* Stats Bar */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100px, 100%), 1fr))', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(16px, 3vw, 24px)' }}>
                            <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CF9D7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>} value={stats.totalTeams} label="Total Teams" color="#CF9D7B" />
                            <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8621A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>} value={allPeople.filter(p => p.isCheckedIn && p.role === 'Leader').length} label="Checked In" color="#E8621A" />
                            <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8C39E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} value={stats.totalPeople} label="Total People" color="#E8C39E" />
                            <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2b6ace" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>} value={stats.dayScholars} label="Day Scholars" color="#2b6aceff" />
                            <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" /><path d="M12 18h.01" /><path d="M8 6h8" /><path d="M8 10h8" /><path d="M8 14h4" /></svg>} value={stats.hostellers} label="Hostellers" color="#8b5cf6" />
                            <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>} value={stats.messOpted} label="Mess Opted" color="#f59e0b" />
                            <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /></svg>} value={stats.batch2024} label="Batch 2024" color="#10b981" />
                            <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>} value={stats.batch2025} label="Batch 2025" color="#06b6d4" />
                            <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M9 16l2 2 4-4" /></svg>} value={stats.batchOther} label="Batch 2023" color="#ec4899" />
                            <StatCard icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6" /><path d="M5 10h14" /><rect x="7" y="10" width="10" height="8" rx="1" /><path d="M9 18v4" /><path d="M15 18v4" /></svg>} value={stats.boardsGiven} label="Boards Given" color="#14b8a6" onClick={() => setShowBoardsList(prev => !prev)} />
                        </div>

                        {/* Boards Given List */}
                        {showBoardsList && (
                            <div style={{ ...cardBg, padding: 'clamp(14px, 2vw, 22px)', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <h3 style={{ fontFamily: 'var(--font-orbitron)', fontSize: '14px', fontWeight: 700, color: '#14b8a6', margin: 0 }}>
                                        🔌 Extension Boards Given ({teams.filter(t => t.extensionBoardGiven).length})
                                    </h3>
                                    <button onClick={() => setShowBoardsList(false)} style={{
                                        padding: '4px 10px', background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(207,157,123,0.2)', borderRadius: '6px',
                                        color: '#a0a0a0', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                    }}>✕ Close</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '10px', maxHeight: '400px', overflow: 'auto' }}>
                                    {teams.filter(t => t.extensionBoardGiven).map(t => (
                                        <div key={t._id} style={{
                                            padding: '12px 16px', background: 'rgba(20, 184, 166, 0.05)',
                                            border: '1px solid rgba(20, 184, 166, 0.15)', borderRadius: '10px',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <span style={{ color: '#e0e0e0', fontWeight: 700, fontSize: '14px' }}>{t.teamName}</span>
                                                {t.allocatedTeamId && <span style={{ color: '#14b8a6', fontSize: '11px', fontWeight: 700, background: 'rgba(20,184,166,0.15)', padding: '2px 6px', borderRadius: '4px' }}>{t.allocatedTeamId}</span>}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                                                <span>Leader: {t.leaderName}</span>
                                                {t.roomNumber && <span style={{ marginLeft: '10px' }}>Room: <span style={{ color: '#CF9D7B' }}>{t.roomNumber}</span></span>}
                                            </div>
                                        </div>
                                    ))}
                                    {teams.filter(t => t.extensionBoardGiven).length === 0 && (
                                        <p style={{ color: '#666', fontSize: '14px', margin: '10px 0' }}>No extension boards have been given yet.</p>
                                    )}
                                </div>
                            </div>
                        )}

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

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: '10px' }}>
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
                                <div>
                                    <label style={labelStyle}>Room Number</label>
                                    <select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} style={selectStyle}>
                                        <option value="All" style={optionStyle}>All</option>
                                        {availableRooms.map(r => (<option key={r} value={r} style={optionStyle}>{r}</option>))}
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
                                {/* ─── TEAM VIEW (Default or Registration Mode Search) ─── */}
                                {(!hasActiveFilters) && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {(isRegistrationMode ? filteredTeams : (roomFilter !== 'All' ? teams.filter(t => t.roomNumber === roomFilter) : teams)).length === 0 ? (
                                            <div style={{ ...cardBg, padding: '40px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                                <p style={{ color: '#a0a0a0', fontSize: '16px', margin: 0 }}>
                                                    {searchQuery ? 'No teams found matching your search' : roomFilter !== 'All' ? `No teams in room ${roomFilter}` : 'No registrations yet'}
                                                </p>
                                            </div>
                                        ) : (
                                            (isRegistrationMode ? filteredTeams : (roomFilter !== 'All' ? teams.filter(t => t.roomNumber === roomFilter) : teams)).map((team) => (
                                                <div key={team._id} style={{ ...cardBg, padding: 'clamp(14px, 2.5vw, 22px)', transition: 'all 0.3s ease' }}>
                                                    {/* Team Header (clickable) */}
                                                    <div onClick={() => toggleTeam(team._id)} style={{
                                                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        marginBottom: expandedTeams.has(team._id) ? '20px' : '0',
                                                    }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <h3 style={{
                                                                    fontFamily: 'var(--font-orbitron)', fontSize: 'clamp(15px, 2.5vw, 18px)',
                                                                    fontWeight: 700, color: team.isCheckedIn ? '#10B981' : '#CF9D7B', margin: '0 0 6px 0',
                                                                }}>{team.teamName}</h3>
                                                                {team.isCheckedIn && (
                                                                    <span style={{
                                                                        background: 'rgba(16,185,129,0.2)', color: '#10B981',
                                                                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                                                                        fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)'
                                                                    }}>CHECKED IN</span>
                                                                )}
                                                            </div>
                                                            <p style={{ color: '#a0a0a0', fontSize: 'clamp(11px, 1.5vw, 13px)', margin: '0 0 3px 0', wordBreak: 'break-word' }}>
                                                                Leader: {team.leaderName} • {team.leaderEmail}
                                                            </p>
                                                            <p style={{ color: '#777', fontSize: '11px', margin: 0 }}>
                                                                Registered: {new Date(team.createdAt).toLocaleDateString()} {new Date(team.createdAt).toLocaleTimeString()}
                                                            </p>
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            {isRegistrationMode && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); toggleExtensionBoard(team._id, team.extensionBoardGiven); }}
                                                                        style={{
                                                                            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                                                            background: team.extensionBoardGiven ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                                            border: `1px solid ${team.extensionBoardGiven ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                                                                            color: team.extensionBoardGiven ? '#60a5fa' : '#a0a0a0',
                                                                            transition: 'all 0.3s ease'
                                                                        }}
                                                                    >
                                                                        {team.extensionBoardGiven ? '🔌 Given' : '🔌 Give Board'}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); toggleCheckIn(team._id, team.isCheckedIn); }}
                                                                        style={{
                                                                            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                                                                            background: team.isCheckedIn ? 'rgba(16, 185, 129, 0.2)' : 'rgba(232, 98, 26, 0.2)',
                                                                            border: `1px solid ${team.isCheckedIn ? 'rgba(16, 185, 129, 0.4)' : 'rgba(232, 98, 26, 0.4)'}`,
                                                                            color: team.isCheckedIn ? '#10B981' : '#E8621A',
                                                                            transition: 'all 0.3s ease'
                                                                        }}
                                                                    >
                                                                        {team.isCheckedIn ? '✅ Checked In' : 'Click to Check In'}
                                                                    </button>
                                                                </>
                                                            )}
                                                            <div style={{
                                                                transform: expandedTeams.has(team._id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.3s ease', fontSize: '18px', color: '#CF9D7B',
                                                                flexShrink: 0, marginTop: '4px',
                                                            }}>▼</div>
                                                        </div>
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
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: '8px' }}>
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
                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: '8px' }}>
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
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                                                gap: 'clamp(10px, 2vw, 14px)',
                                            }}>
                                                {filteredPeople.map((person, idx) => renderPersonCard(person, idx))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* ─── ON-SPOT REGISTRATION VIEW ─── */}
                {activeView === 'on-spot' && (
                    <div style={{ ...cardBg, padding: 'clamp(20px, 4vw, 40px)' }}>
                        <h2 style={{ color: '#CF9D7B', marginBottom: '24px', fontFamily: 'var(--font-orbitron)' }}>On-Spot Registration</h2>
                        <form onSubmit={handleOnSpotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Team Info */}
                            <div>
                                <label style={labelStyle}>Team Name</label>
                                <input type="text" required value={onSpotData.teamName}
                                    onChange={e => setOnSpotData({ ...onSpotData, teamName: e.target.value })}
                                    style={inputStyle} placeholder="Enter unique team name" />
                            </div>

                            {/* Leader Info */}
                            <div style={{ border: '1px solid rgba(232, 98, 26, 0.3)', padding: '20px', borderRadius: '12px', background: 'rgba(232, 98, 26, 0.05)' }}>
                                <h3 style={{ color: '#E8621A', marginTop: 0 }}>Leader Details</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                    <input type="text" placeholder="Name" required value={onSpotData.leaderName} onChange={e => setOnSpotData({ ...onSpotData, leaderName: e.target.value })} style={inputStyle} />
                                    <input type="email" placeholder="Email" required value={onSpotData.leaderEmail} onChange={e => setOnSpotData({ ...onSpotData, leaderEmail: e.target.value })} style={inputStyle} />
                                    <input type="text" placeholder="WhatsApp" required value={onSpotData.leaderWhatsApp} onChange={e => setOnSpotData({ ...onSpotData, leaderWhatsApp: e.target.value })} style={inputStyle} />
                                    <input type="text" placeholder="Roll No" required value={onSpotData.leaderRollNumber} onChange={e => setOnSpotData({ ...onSpotData, leaderRollNumber: e.target.value })} style={inputStyle} />
                                    <select value={onSpotData.leaderCourse} onChange={e => setOnSpotData({ ...onSpotData, leaderCourse: e.target.value })} style={inputStyle}>
                                        <option value="BTech">BTech</option><option value="BBA">BBA</option><option value="BDes">BDes</option><option value="HSB">HSB</option>
                                    </select>
                                    <input type="text" placeholder="Batch (e.g. 2024)" required value={onSpotData.leaderBatch} onChange={e => setOnSpotData({ ...onSpotData, leaderBatch: e.target.value })} style={inputStyle} />
                                    <select value={onSpotData.leaderResidency} onChange={e => setOnSpotData({ ...onSpotData, leaderResidency: e.target.value })} style={inputStyle}>
                                        <option value="Hosteller">Hosteller</option><option value="Day Scholar">Day Scholar</option>
                                    </select>
                                </div>
                            </div>

                            {/* Members Info */}
                            {onSpotData.members.map((member, idx) => (
                                <div key={idx} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                                    <h3 style={{ color: '#a0a0a0', marginTop: 0 }}>Member {idx + 1}</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                        <input type="text" placeholder="Name" required value={member.name}
                                            onChange={e => {
                                                const newMembers = [...onSpotData.members];
                                                newMembers[idx].name = e.target.value;
                                                setOnSpotData({ ...onSpotData, members: newMembers });
                                            }} style={inputStyle} />
                                        <input type="email" placeholder="Email" required value={member.email}
                                            onChange={e => {
                                                const newMembers = [...onSpotData.members];
                                                newMembers[idx].email = e.target.value;
                                                setOnSpotData({ ...onSpotData, members: newMembers });
                                            }} style={inputStyle} />
                                        <input type="text" placeholder="WhatsApp" required value={member.whatsApp}
                                            onChange={e => {
                                                const newMembers = [...onSpotData.members];
                                                newMembers[idx].whatsApp = e.target.value;
                                                setOnSpotData({ ...onSpotData, members: newMembers });
                                            }} style={inputStyle} />
                                        <input type="text" placeholder="Roll No" required value={member.rollNumber}
                                            onChange={e => {
                                                const newMembers = [...onSpotData.members];
                                                newMembers[idx].rollNumber = e.target.value;
                                                setOnSpotData({ ...onSpotData, members: newMembers });
                                            }} style={inputStyle} />
                                        <select value={member.course}
                                            onChange={e => {
                                                const newMembers = [...onSpotData.members];
                                                newMembers[idx].course = e.target.value;
                                                setOnSpotData({ ...onSpotData, members: newMembers });
                                            }} style={inputStyle}>
                                            <option value="BTech">BTech</option><option value="BBA">BBA</option><option value="BDes">BDes</option><option value="HSB">HSB</option>
                                        </select>
                                        <input type="text" placeholder="Batch" required value={member.batch}
                                            onChange={e => {
                                                const newMembers = [...onSpotData.members];
                                                newMembers[idx].batch = e.target.value;
                                                setOnSpotData({ ...onSpotData, members: newMembers });
                                            }} style={inputStyle} />
                                        <select value={member.residency}
                                            onChange={e => {
                                                const newMembers = [...onSpotData.members];
                                                newMembers[idx].residency = e.target.value;
                                                setOnSpotData({ ...onSpotData, members: newMembers });
                                            }} style={inputStyle}>
                                            <option value="Hosteller">Hosteller</option><option value="Day Scholar">Day Scholar</option>
                                        </select>
                                    </div>
                                </div>
                            ))}

                            <button type="submit" style={{ ...buttonStyle, background: '#E8621A', color: '#fff', marginTop: '10px' }}>Register Team</button>
                        </form>
                    </div>
                )}

                {/* ─── MEMBER SWAP VIEW ─── */}
                {activeView === 'swap' && (
                    <div style={{ ...cardBg, padding: 'clamp(20px, 4vw, 40px)' }}>
                        <h2 style={{ color: '#CF9D7B', marginBottom: '24px', fontFamily: 'var(--font-orbitron)' }}>Swap Members</h2>
                        <form onSubmit={handleSwapSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* Team 1 */}
                                <div style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                    <h3 style={{ color: '#a0a0a0', marginTop: 0 }}>Team 1</h3>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={labelStyle}>Select Team</label>
                                        <select value={swapData.team1Id} onChange={e => setSwapData({ ...swapData, team1Id: e.target.value, member1Email: '' })} style={inputStyle}>
                                            <option value="">Select Team</option>
                                            {teams.map(t => <option key={t._id} value={t._id}>{t.teamName}</option>)}
                                        </select>
                                    </div>
                                    {swapData.team1Id && (
                                        <div>
                                            <label style={labelStyle}>Select Member to Swap Out</label>
                                            <select value={swapData.member1Email} onChange={e => setSwapData({ ...swapData, member1Email: e.target.value })} style={inputStyle}>
                                                <option value="">Select Member</option>
                                                {teams.find(t => t._id === swapData.team1Id)?.members.map(m => (
                                                    <option key={m.email} value={m.email}>{m.name} ({m.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Team 2 */}
                                <div style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                    <h3 style={{ color: '#a0a0a0', marginTop: 0 }}>Team 2</h3>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={labelStyle}>Select Team</label>
                                        <select value={swapData.team2Id} onChange={e => setSwapData({ ...swapData, team2Id: e.target.value, member2Email: '' })} style={inputStyle}>
                                            <option value="">Select Team</option>
                                            {teams.filter(t => t._id !== swapData.team1Id).map(t => <option key={t._id} value={t._id}>{t.teamName}</option>)}
                                        </select>
                                    </div>
                                    {swapData.team2Id && (
                                        <div>
                                            <label style={labelStyle}>Select Member to Swap Out</label>
                                            <select value={swapData.member2Email} onChange={e => setSwapData({ ...swapData, member2Email: e.target.value })} style={inputStyle}>
                                                <option value="">Select Member</option>
                                                {teams.find(t => t._id === swapData.team2Id)?.members.map(m => (
                                                    <option key={m.email} value={m.email}>{m.name} ({m.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button type="submit" style={{ ...buttonStyle, background: '#E8621A', color: '#fff' }} disabled={!swapData.team1Id || !swapData.member1Email || !swapData.team2Id || !swapData.member2Email}>
                                Swap Members
                            </button>
                        </form>
                    </div>
                )}

                {/* ─── ASSIGN PROBLEM STATEMENT VIEW ─── */}
                {activeView === 'assign-ps' && (
                    <div style={{ ...cardBg, padding: 'clamp(20px, 4vw, 40px)' }}>
                        <h2 style={{ color: '#CF9D7B', marginBottom: '8px', fontFamily: 'var(--font-orbitron)' }}>Assign Problem Statement</h2>
                        <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '24px' }}>Enter the board number (e.g. T-10) and the problem statement to assign.</p>

                        {psMessage && (
                            <div style={{
                                padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
                                background: psMessage.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)',
                                border: `1px solid ${psMessage.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(220,38,38,0.3)'}`,
                                color: psMessage.type === 'success' ? '#10b981' : '#f87171',
                                fontSize: '14px', fontWeight: 600,
                            }}>
                                {psMessage.type === 'success' ? '✅' : '⚠'} {psMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleAssignPS} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Board Number (Allocated Team ID)</label>
                                <input type="text" required value={psData.boardNumber}
                                    onChange={e => setPsData({ ...psData, boardNumber: e.target.value })}
                                    placeholder="e.g. T-10" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Problem Statement</label>
                                <textarea required value={psData.problemStatement}
                                    onChange={e => setPsData({ ...psData, problemStatement: e.target.value })}
                                    placeholder="Enter the problem statement..."
                                    rows={4}
                                    style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                            </div>
                            <button type="submit" disabled={isSubmittingPS || !psData.boardNumber.trim() || !psData.problemStatement.trim()}
                                style={{
                                    ...buttonStyle, background: '#CF9D7B', color: '#121519',
                                    opacity: (isSubmittingPS || !psData.boardNumber.trim() || !psData.problemStatement.trim()) ? 0.5 : 1,
                                }}>
                                {isSubmittingPS ? 'Assigning...' : '📝 Assign Problem Statement'}
                            </button>
                        </form>

                        {/* Quick reference: teams with board numbers */}
                        <div style={{ marginTop: '30px', borderTop: '1px solid rgba(207,157,123,0.15)', paddingTop: '20px' }}>
                            <h3 style={{ color: '#a0a0a0', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>Teams with Board Numbers</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: '8px', maxHeight: '300px', overflow: 'auto' }}>
                                {teams.filter(t => t.allocatedTeamId).sort((a, b) => (a.allocatedTeamId || '').localeCompare(b.allocatedTeamId || '')).map(t => (
                                    <div key={t._id} style={{
                                        padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(207,157,123,0.1)', borderRadius: '8px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px',
                                        cursor: 'pointer',
                                    }} onClick={() => setPsData({ ...psData, boardNumber: t.allocatedTeamId || '' })}>
                                        <div>
                                            <span style={{ color: '#CF9D7B', fontWeight: 700, fontSize: '14px' }}>{t.allocatedTeamId}</span>
                                            <span style={{ color: '#a0a0a0', fontSize: '12px', marginLeft: '8px' }}>{t.teamName}</span>
                                        </div>
                                        {t.problemStatement ? (
                                            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>HAS PS</span>
                                        ) : (
                                            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: '#666', fontWeight: 700 }}>NO PS</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Check-in Modal */}
                {checkInModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
                        padding: '20px'
                    }}>
                        <div style={{
                            ...cardBg, width: '100%', maxWidth: '450px', padding: '30px',
                            border: '1px solid #CF9D7B', boxShadow: '0 0 50px rgba(207,157,123,0.2)'
                        }}>
                            <h2 style={{ color: '#CF9D7B', margin: '0 0 20px 0', fontFamily: 'var(--font-orbitron)' }}>Check-in Team</h2>
                            <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>Entering details for <strong>{checkInModal.teamName}</strong></p>

                            <form onSubmit={handleConfirmCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Room Number</label>
                                    <input type="text" required value={checkInDetails.roomNumber}
                                        onChange={e => setCheckInDetails({ ...checkInDetails, roomNumber: e.target.value })}
                                        placeholder="e.g. 102 (or N/A)" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Allocated Team ID / Table No</label>
                                    <input type="text" required value={checkInDetails.allocatedTeamId}
                                        onChange={e => setCheckInDetails({ ...checkInDetails, allocatedTeamId: e.target.value })}
                                        placeholder="e.g. T-42" style={inputStyle} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setCheckInModal(null)}
                                        style={{ ...buttonStyle, flex: 1, background: 'rgba(255,255,255,0.05)', color: '#a0a0a0' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmittingCheckIn}
                                        style={{ ...buttonStyle, flex: 2, background: '#E8621A', color: '#fff' }}>
                                        {isSubmittingCheckIn ? 'Updating...' : 'Confirm Check-in'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
