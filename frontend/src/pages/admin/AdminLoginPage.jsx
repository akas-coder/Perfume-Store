import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { adminAuthAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminAuthAPI.login({ email, password });
      if (res.data.success && res.data.data?.token) {
        localStorage.setItem('perfume_admin_token', res.data.data.token);
      }
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: 'radial-gradient(ellipse at center, #0D0D0D 0%, #000 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
               style={{ background: 'linear-gradient(135deg, #E8C96A, #D4AF37)' }}>
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="22" y="28" width="20" height="24" rx="4" fill="#0A0A0A" opacity="0.8"/>
              <rect x="27" y="20" width="10" height="10" rx="2" fill="#0A0A0A" opacity="0.8"/>
              <rect x="25" y="14" width="14" height="8" rx="3" fill="#0A0A0A" opacity="0.9"/>
              <rect x="38" y="17" width="5" height="3" rx="1.5" fill="#0A0A0A" opacity="0.7"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--color-cream)' }}>
            Admin Panel
          </h1>
          <p className="text-sm mt-2 flex items-center justify-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
            <FiShield size={12} />
            Secure admin access
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl glass" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                     style={{ color: 'var(--color-muted)' }}>Admin Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={16}
                        style={{ color: 'var(--color-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm input-dark"
                  id="admin-email"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                     style={{ color: 'var(--color-muted)' }}>Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={16}
                        style={{ color: 'var(--color-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm input-dark"
                  id="admin-password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-sm btn-gold disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              id="admin-login-submit"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In to Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--color-muted)' }}>
          Not an admin?{' '}
          <a href="/" className="underline underline-offset-2 hover:opacity-70 transition-opacity"
             style={{ color: 'var(--color-gold)' }}>
            Go to Store
          </a>
        </p>
      </motion.div>
    </div>
  );
}
