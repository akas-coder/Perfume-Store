import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4"
         style={{ background: 'radial-gradient(ellipse at center, #1A1208 0%, #0A0A0A 70%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #E8C96A, #D4AF37)' }}>
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="22" y="28" width="20" height="24" rx="4" fill="#0A0A0A" opacity="0.8"/>
                <rect x="27" y="20" width="10" height="10" rx="2" fill="#0A0A0A" opacity="0.8"/>
                <rect x="25" y="14" width="14" height="8" rx="3" fill="#0A0A0A" opacity="0.9"/>
                <rect x="38" y="17" width="5" height="3" rx="1.5" fill="#0A0A0A" opacity="0.7"/>
              </svg>
            </div>
            <span className="font-display text-3xl font-semibold text-gold-gradient tracking-widest">Liorix</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold mb-2" style={{ color: 'var(--color-cream)' }}>
            Welcome Back
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Sign in to your account to continue
          </p>
        </div>

        <div className="p-8 rounded-3xl glass" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                     style={{ color: 'var(--color-muted)' }}>Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2" size={16}
                        style={{ color: 'var(--color-muted)' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm input-dark"
                  id="login-email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium uppercase tracking-wider"
                       style={{ color: 'var(--color-muted)' }}>Password</label>
                <Link to="/forgot-password" className="text-xs font-medium hover:underline transition-opacity hover:opacity-80"
                      style={{ color: 'var(--color-gold)' }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2" size={16}
                        style={{ color: 'var(--color-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  placeholder="Your password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm input-dark"
                  id="login-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-muted)' }}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-sm btn-gold disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              id="login-submit">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium" style={{ color: 'var(--color-gold)' }}>
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-muted)' }}>
          Are you an admin?{' '}
          <Link to="/admin/login" className="underline" style={{ color: 'var(--color-gold)' }}>Admin Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
