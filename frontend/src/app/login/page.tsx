'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Loader2, CheckCircle, LogIn, Shield } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // If already logged in, redirect away
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            const redirect = searchParams.get('redirect') || '/admin-panel';
            router.push(redirect);
        }
    }, [router, searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Invalid email or password');
                setLoading(false);
                return;
            }

            // Store real JWT token + user info
            localStorage.setItem('admin_token', data.token);
            const userObj = data.user || {
                id: data.userId || 1,
                email: email,
                userRole: data.role || 'ADMIN',
                department: data.department || null
            };
            localStorage.setItem('admin_user', JSON.stringify(userObj));
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', userObj.userRole);
            localStorage.setItem('userName', userObj.email.split('@')[0]);

            // Set cookie for middleware
            document.cookie = `admin_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;

            setSuccess(true);

            // Role-based redirect
            const redirect = searchParams.get('redirect');
            setTimeout(() => {
                if (redirect) {
                    router.push(redirect);
                    return;
                }
                switch (userObj?.userRole) {
                    case 'ADMIN': router.push('/admin-panel'); break;
                    case 'OFFICER': router.push('/officer'); break;
                    case 'AUDITOR': router.push('/auditor'); break;
                    case 'CITIZEN': router.push('/citizen'); break;
                    default: router.push('/dashboard');
                }
            }, 800);

        } catch {
            setError('Cannot connect to server. Is the backend running?');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1e1b4b_50%,#0f172a_100%)]">

            {/* Decorative glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none bg-[radial-gradient(circle,#6366f1,transparent_70%)]" />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Back link */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition">
                    ← Back to Home
                </Link>

                <div className="p-8 rounded-2xl border border-white/10 bg-[rgba(30,27,75,0.5)] backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <div className={`p-4 rounded-full inline-block mb-4 transition-all duration-500 ${success
                            ? 'bg-emerald-500/20 text-emerald-400 scale-110'
                            : 'bg-[linear-gradient(135deg,#6366f1,#8b5cf6)]'
                            }`}>
                            {success ? <CheckCircle size={32} /> : <Shield size={32} className="text-white" />}
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            {success ? 'Access Granted ✅' : 'CityMind AI'}
                        </h1>
                        {!success && <p className="text-slate-400 mt-2 text-sm">Sign in to your account</p>}

                        {success && (
                            <div className="mt-4 p-4 rounded-xl border border-emerald-500/20 bg-[rgba(16,185,129,0.1)]">
                                <p className="text-emerald-400 font-bold mb-2">Redirecting...</p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="px-4 py-3 rounded-xl mb-4 text-sm font-medium text-red-400 border border-red-500/20 bg-[rgba(239,68,68,0.1)]">
                            ❌ {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-white transition border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 placeholder:text-slate-500 bg-[rgba(15,23,42,0.6)]"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@city.gov"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-300 block mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-white transition border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 placeholder:text-slate-500 bg-[rgba(15,23,42,0.6)]"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`w-full text-white font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${success
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : 'bg-[linear-gradient(135deg,#6366f1,#8b5cf6)] hover:opacity-90 shadow-[0_8px_32px_rgba(99,102,241,0.25)]'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading
                                ? (success ? <><CheckCircle size={20} /> Success!</> : <><Loader2 className="animate-spin" size={20} /> Verifying...</>)
                                : <><LogIn size={20} /> Sign In</>
                            }
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 p-3 rounded-xl border border-white/10 text-xs text-slate-400 bg-[rgba(15,23,42,0.4)]">
                        <p className="font-bold text-slate-300 mb-1.5">🧪 Demo Credentials:</p>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                            <span>👑 Admin: admin@city.gov</span><span className="text-right">admin123</span>
                            <span>🔧 Officer: roads@city.gov</span><span className="text-right">123</span>
                            <span>🔒 Auditor: audit@city.gov</span><span className="text-right">auditor123</span>
                            <span>👤 Citizen: citizen@test.com</span><span className="text-right">123</span>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-500">
                            ℹ️ Powered by JWT Authentication + RBAC
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(160deg,#0f172a_0%,#1e1b4b_50%,#0f172a_100%)]">
                <Loader2 className="animate-spin text-indigo-400" size={32} />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
