import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect to forgot-password if no token present
  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  const passwordStrength = (pwd) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (pwd.length < 8) return { label: 'Weak', color: '#f97316', width: '40%' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Fair', color: '#eab308', width: '65%' };
    return { label: 'Strong', color: '#22c55e', width: '100%' };
  };

  const strength = passwordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, newPassword);
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div
      className="min-h-screen pt-20 flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at center, #1A1208 0%, #0A0A0A 70%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #E8C96A, #D4AF37)' }}
            >
              <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="22" y="28" width="20" height="24" rx="4" fill="#0A0A0A" opacity="0.8"/>
                <rect x="27" y="20" width="10" height="10" rx="2" fill="#0A0A0A" opacity="0.8"/>
                <rect x="25" y="14" width="14" height="8" rx="3" fill="#0A0A0A" opacity="0.9"/>
                <rect x="38" y="17" width="5" height="3" rx="1.5" fill="#0A0A0A" opacity="0.7"/>
              </svg>
            </div>
            <span className="font-display text-3xl font-semibold text-gold-gradient tracking-widest">
              Liorix
            </span>
          </Link>
          <h1
            className="font-display text-3xl font-semibold mb-2"
            style={{ color: 'var(--color-cream)' }}
          >
            {success ? 'All Done!' : 'Reset Password'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            {success
              ? 'Your password has been updated successfully'
              : 'Choose a strong new password for your account'}
          </p>
        </div>

        <div
          className="p-8 rounded-3xl glass"
          style={{ border: '1px solid rgba(212,175,55,0.2)' }}
        >
          {success ? (
            /* ── Success state ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
                    border: '1px solid rgba(34,197,94,0.3)',
                  }}
                >
                  <FiCheckCircle size={36} style={{ color: '#22c55e' }} />
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                You can now sign in to your account with your new password.
              </p>
              <button
                id="goto-login"
                onClick={() => navigate('/login')}
                className="w-full py-4 rounded-xl font-semibold text-sm btn-gold"
              >
                Sign In Now
              </button>
            </motion.div>
          ) : (
            /* ── Reset form ── */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-muted)' }}
                >
                  New Password
                </label>
                <div className="relative">
                  <FiLock
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    size={16}
                    style={{ color: 'var(--color-muted)' }}
                  />
                  <input
                    id="reset-new-password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm input-dark"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* Password strength bar */}
                {strength && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: strength.width }}
                        transition={{ duration: 0.4 }}
                        className="h-full rounded-full"
                        style={{ background: strength.color }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    size={16}
                    style={{ color: 'var(--color-muted)' }}
                  />
                  <input
                    id="reset-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat your password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm input-dark"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs mt-1.5 flex items-center gap-1"
                    style={{
                      color: newPassword === confirmPassword ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {newPassword === confirmPassword ? (
                      <><FiCheckCircle size={12} /> Passwords match</>
                    ) : (
                      <><FiAlertCircle size={12} /> Passwords do not match</>
                    )}
                  </motion.p>
                )}
              </div>

              <button
                id="reset-submit"
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-sm btn-gold disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              <Link
                to="/forgot-password"
                className="block text-center text-xs mt-2 transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-muted)' }}
              >
                Request a new link
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
