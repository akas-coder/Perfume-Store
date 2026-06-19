import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: FiUser, placeholder: 'Your full name' },
    { name: 'email', label: 'Email Address', type: 'email', icon: FiMail, placeholder: 'you@example.com' },
    { name: 'phone', label: 'Phone Number', type: 'tel', icon: FiPhone, placeholder: '+91 98765 43210' },
  ];

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 py-10"
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
            Join Liorix
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Create your account to start exploring luxury fragrances
          </p>
        </div>

        <div className="p-8 rounded-3xl glass" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                       style={{ color: 'var(--color-muted)' }}>{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-4 top-1/2 -translate-y-1/2" size={16}
                          style={{ color: 'var(--color-muted)' }} />
                  <input
                    name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
                    required={f.name !== 'phone'} placeholder={f.placeholder}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm input-dark"
                    id={`register-${f.name}`}
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                     style={{ color: 'var(--color-muted)' }}>Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2" size={16}
                        style={{ color: 'var(--color-muted)' }} />
                <input
                  name="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} required placeholder="At least 6 characters"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm input-dark"
                  id="register-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-muted)' }}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-2"
                     style={{ color: 'var(--color-muted)' }}>Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2" size={16}
                        style={{ color: 'var(--color-muted)' }} />
                <input
                  name="confirmPassword" type="password" value={form.confirmPassword}
                  onChange={handleChange} required placeholder="Repeat your password"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm input-dark"
                  id="register-confirm-password"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-sm btn-gold disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              id="register-submit">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium" style={{ color: 'var(--color-gold)' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
