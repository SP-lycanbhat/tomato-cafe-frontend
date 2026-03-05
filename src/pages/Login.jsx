import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Access granted. Welcome back!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-6">
            <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black tracking-tighter text-text mb-1">TomatoCafe</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text/30">Administrative Interface</p>
                </div>

                <div className="bg-background border border-border rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-text tracking-tight">Sign In</h2>
                        <p className="text-[11px] font-medium text-text/40 mt-1">Enter your credentials to access the ledger.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text/40">Password</label>
                                <button type="button" className="text-[10px] font-bold text-primary hover:underline">Forgot password?</button>
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all tracking-tighter"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 bg-text text-background rounded-lg flex items-center justify-center gap-2 font-bold text-xs hover:opacity-90 transition-all shadow-sm mt-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border/50 text-center">
                        <p className="text-[11px] font-medium text-text/40">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary font-bold hover:underline">
                                Request access
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-text/20">
                    &copy; 2024 Tomato Cafe &bull; v2.0
                </p>
            </div>
        </div>
    );
};

export default Login;
