import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCopy, FiCheck, FiKey } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      setResetUrl(res.data.data);
      toast.success('Reset link generated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resetUrl) return;
    navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

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
              <span className="text-black font-bold text-sm">P</span>
            </div>
            <span className="font-display text-3xl font-semibold text-gold-gradient tracking-widest">
              PERfume
            </span>
          </Link>
          <h1
            className="font-display text-3xl font-semibold mb-2"
            style={{ color: 'var(--color-cream)' }}
          >
            Forgot Password
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Enter your email and we'll generate a reset link for you
          </p>
        </div>

        <div
          className="p-8 rounded-3xl glass"
          style={{ border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <AnimatePresence mode="wait">
            {!resetUrl ? (
              /* ── Step 1: Email form ── */
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      size={16}
                      style={{ color: 'var(--color-muted)' }}
                    />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm input-dark"
                    />
                  </div>
                </div>

                <button
                  id="forgot-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-semibold text-sm btn-gold disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Generating link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </motion.form>
            ) : (
              /* ── Step 2: Show reset link ── */
              <motion.div
                key="reset-link"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(232,201,106,0.1))', border: '1px solid rgba(212,175,55,0.3)' }}
                  >
                    <FiKey size={28} style={{ color: 'var(--color-gold)' }} />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-cream)' }}>
                    Reset Link Generated!
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Copy the link below and open it in your browser to reset your password.
                    This link expires in <span style={{ color: 'var(--color-gold)' }}>30 minutes</span>.
                  </p>
                </div>

                {/* Reset URL box */}
                <div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}
                >
                  <p
                    className="text-xs flex-1 break-all font-mono leading-relaxed"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    {resetUrl}
                  </p>
                  <button
                    id="copy-reset-link"
                    type="button"
                    onClick={handleCopy}
                    className="flex-shrink-0 p-2 rounded-lg transition-all duration-200"
                    style={{
                      background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(212,175,55,0.15)',
                      color: copied ? '#22c55e' : 'var(--color-gold)',
                      border: copied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(212,175,55,0.3)',
                    }}
                    title="Copy to clipboard"
                  >
                    {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                  </button>
                </div>

                {/* Quick navigate button */}
                <a
                  href={resetUrl}
                  id="open-reset-link"
                  className="w-full py-4 rounded-xl font-semibold text-sm btn-gold flex items-center justify-center gap-2"
                >
                  Open Reset Page
                </a>

                <button
                  type="button"
                  onClick={() => { setResetUrl(null); setEmail(''); }}
                  className="w-full py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Try a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to login */}
          {!resetUrl && (
            <div className="mt-6">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-muted)' }}
              >
                <FiArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
