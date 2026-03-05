import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, ArrowRight } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);
            toast.success('Registration successful! Please wait for administrative approval.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration process failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-6">
            <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black tracking-tighter text-text mb-1">TomatoCafe</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text/30">Workforce Enrollment</p>
                </div>

                <div className="bg-background border border-border rounded-xl shadow-sm p-8">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-text tracking-tight">Create Account</h2>
                        <p className="text-[11px] font-medium text-text/40 mt-1">Register your identity for system access.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm font-medium focus:ring-1 focus:ring-primary outline-none transition-all tracking-tighter"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                    <span>Create Account</span>
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border/50 text-center">
                        <p className="text-[11px] font-medium text-text/40">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-[0.4em] text-text/20 leading-relaxed max-w-[280px] mx-auto">
                    Requests are subject to administrative vetting.<br />
                    Response time typically under 24 hours.
                </p>
            </div>
        </div>
    );
};

export default Signup;
