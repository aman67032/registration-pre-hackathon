'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success && data.token) {
                // Store token in localStorage
                localStorage.setItem('adminToken', data.token);
                // Redirect to admin dashboard
                router.push('/admin');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Unable to connect to server. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

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

            {/* Login Form */}
            <div style={{
                position: 'relative',
                zIndex: 3,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}>
                <div style={{
                    background: 'rgba(30, 22, 17, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(207,157,123,0.3)',
                    borderRadius: '24px',
                    padding: '48px 40px',
                    maxWidth: '440px',
                    width: '100%',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 style={{
                            fontFamily: 'OriginTech, sans-serif',
                            fontSize: '32px',
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
                            Pre-Hackathon Registration Management
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin}>
                        {/* Email Field */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#CF9D7B',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                            }}>
                                Email
                            </label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="admin@jklu.edu.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(207,157,123,0.2)',
                                    borderRadius: '12px',
                                    color: '#e0e0e0',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#CF9D7B',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(207,157,123,0.2)',
                                    borderRadius: '12px',
                                    color: '#e0e0e0',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                background: 'rgba(220, 38, 38, 0.1)',
                                border: '1px solid rgba(220, 38, 38, 0.3)',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '20px',
                                color: '#f87171',
                                fontSize: '14px',
                            }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: isLoading
                                    ? 'rgba(207,157,123,0.5)'
                                    : 'linear-gradient(135deg, #CF9D7B, #724B39)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#121519',
                                fontSize: '16px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(207,157,123,0.3)',
                            }}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
