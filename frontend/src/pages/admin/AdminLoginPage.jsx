import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
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
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'radial-gradient(ellipse at center, #0D0D0D 0%, #000 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
               style={{ background: 'linear-gradient(135deg, #E8C96A, #D4AF37)' }}>
            <span className="text-2xl font-bold text-black">P</span>
          </div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--color-cream)' }}>Admin Panel</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>Sign in to manage your store</p>
        </div>
        <div className="p-8 rounded-3xl glass" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-muted)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="Enter your email" className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm input-dark"
                  id="admin-email" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--color-muted)' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Password" className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm input-dark"
                  id="admin-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-sm btn-gold disabled:opacity-50 flex items-center justify-center gap-2"
              id="admin-login-submit">
              {loading ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Signing in...</> : 'Sign In to Admin'}
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
