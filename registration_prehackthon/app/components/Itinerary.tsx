'use client';

import React from 'react';

const ITINERARY_DATA = [
    {
        date: '20 Feb, 2026',
        events: [
            { time: '1:30 - 2:00 PM', activity: 'Check In' },
            { time: '2:00 - 2:30 PM', activity: 'Problem Statement Selection' },
            { time: '6:00 PM Onwards', activity: 'Mentoring Round 1' },
            { time: '10:30 - 11:30 PM', activity: 'Jamming' },
        ]
    },
    {
        date: '21 Feb, 2026',
        events: [
            { time: '2:00 AM Onwards', activity: 'Mentoring Round 2' },
            { time: '9:00 AM', activity: 'Final Submission' },
            { time: '12:15 - 12:45 PM', activity: 'Valedictory' },
        ]
    }
];

export default function Itinerary() {
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
                    Event Itinerary
                </h2>
                <p style={{ color: '#a0a0a0', fontSize: '14px', margin: 0 }}>
                    Mark your calendars for the ultimate hacking journey
                </p>
            </div>

            <div style={{
                display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center'
            }}>
                {ITINERARY_DATA.map((day, idx) => (
                    <div key={idx} style={{
                        flex: '1 1 400px', maxWidth: '480px',
                        background: 'rgba(30, 22, 17, 0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(207,157,123,0.2)',
                        borderRadius: '24px',
                        padding: '24px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Header */}
                        <div style={{
                            textAlign: 'center', marginBottom: '24px', paddingBottom: '16px',
                            borderBottom: '1px solid rgba(207,157,123,0.1)'
                        }}>
                            <h3 style={{
                                fontFamily: 'var(--font-orbitron)', fontSize: '20px',
                                fontWeight: 800, color: '#CF9D7B', letterSpacing: '1px'
                            }}>{day.date}</h3>
                        </div>

                        {/* Table */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(207,157,123,0.1)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(207,157,123,0.1)' }}>
                            {day.events.map((event, eIdx) => (
                                <div key={eIdx} style={{
                                    display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 2fr',
                                    background: 'rgba(30, 22, 17, 0.95)', transition: 'background 0.3s ease'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(207,157,123,0.05)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30, 22, 17, 0.95)'; }}
                                >
                                    <div style={{
                                        padding: '16px 20px', borderRight: '1px solid rgba(207,157,123,0.1)',
                                        color: '#9c8578', fontSize: '12.5px', fontWeight: 700,
                                        fontFamily: 'var(--font-orbitron)', display: 'flex', alignItems: 'center'
                                    }}>
                                        {event.time}
                                    </div>
                                    <div style={{
                                        padding: '16px 20px', color: '#ccc', fontSize: '14px', fontWeight: 500,
                                        display: 'flex', alignItems: 'center'
                                    }}>
                                        {event.activity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
