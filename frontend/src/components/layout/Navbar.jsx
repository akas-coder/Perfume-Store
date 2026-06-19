import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Collections', to: '/products' },
    { label: 'Men', to: '/products?gender=MEN' },
    { label: 'Women', to: '/products?gender=WOMEN' },
    { label: 'Luxury', to: '/products?isLuxury=true' },
    { label: 'Fragrance Quiz', to: '/quiz' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          (scrolled || location.pathname !== '/') ? 'glass-dark shadow-2xl border-b border-white/5' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg, #E8C96A, #D4AF37)' }}>
                <svg width="18" height="18" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="22" y="28" width="20" height="24" rx="4" fill="#0A0A0A" opacity="0.8"/>
                  <rect x="27" y="20" width="10" height="10" rx="2" fill="#0A0A0A" opacity="0.8"/>
                  <rect x="25" y="14" width="14" height="8" rx="3" fill="#0A0A0A" opacity="0.9"/>
                  <rect x="38" y="17" width="5" height="3" rx="1.5" fill="#0A0A0A" opacity="0.7"/>
                </svg>
              </div>
              <span className="font-display text-2xl font-semibold text-gold-gradient tracking-widest">
                Liorix
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium tracking-wider uppercase transition-colors duration-200"
                  style={{ color: location.pathname === link.to ? 'var(--color-gold)' : 'var(--color-cream)', opacity: 0.8 }}
                  onMouseEnter={e => e.target.style.color = 'var(--color-gold)'}
                  onMouseLeave={e => e.target.style.color = location.pathname === link.to ? 'var(--color-gold)' : 'var(--color-cream)'}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full transition-all duration-200 hover:scale-110"
                style={{ color: 'var(--color-cream)' }}
                id="search-btn"
              >
                <FiSearch size={20} />
              </button>

              {/* Wishlist */}
              {isLoggedIn && (
                <Link to="/wishlist" className="p-2 rounded-full transition-all duration-200 hover:scale-110"
                      style={{ color: 'var(--color-cream)' }}>
                  <FiHeart size={20} />
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative p-2 rounded-full transition-all duration-200 hover:scale-110"
                    style={{ color: 'var(--color-cream)' }}>
                <FiShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold badge-gold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full transition-all duration-200 hover:scale-110"
                    style={{ color: 'var(--color-cream)' }}
                    id="user-menu-btn"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                         style={{ background: 'var(--color-gold)', color: 'var(--color-black)' }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden glass"
                        style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}
                      >
                        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-cream)' }}>{user?.name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{user?.email}</p>
                        </div>
                        {[
                          { icon: FiUser, label: 'Profile', to: '/profile' },
                          { icon: FiPackage, label: 'My Orders', to: '/orders' },
                          { icon: FiHeart, label: 'Wishlist', to: '/wishlist' },
                        ].map(item => (
                          <Link key={item.to} to={item.to}
                            className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-white hover:bg-opacity-5"
                            style={{ color: 'var(--color-cream)' }}
                          >
                            <item.icon size={16} style={{ color: 'var(--color-gold)' }} />
                            {item.label}
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-white hover:bg-opacity-5"
                          style={{ color: '#EF4444', borderTop: '1px solid rgba(212,175,55,0.1)' }}
                        >
                          <FiLogOut size={16} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login"
                  className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium btn-outline-gold"
                  id="login-btn"
                >
                  <FiUser size={16} /> Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-full"
                style={{ color: 'var(--color-cream)' }}
              >
                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass-dark"
              style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to}
                    className="block px-4 py-3 rounded-lg text-sm font-medium tracking-wider uppercase transition-colors"
                    style={{ color: 'var(--color-cream)' }}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isLoggedIn && (
                  <div className="flex gap-3 pt-3">
                    <Link to="/login" className="flex-1 py-2 text-center rounded-lg text-sm btn-outline-gold">Login</Link>
                    <Link to="/register" className="flex-1 py-2 text-center rounded-lg text-sm btn-gold">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-36 px-4"
            style={{ background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)' }}
            onClick={() => setSearchOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full glass hover:scale-110 transition-all text-white cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <FiX size={24} />
            </button>

            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl px-4"
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search fragrances, brands..."
                  className="w-full px-6 py-5 pr-16 rounded-2xl text-lg input-dark"
                  style={{ fontSize: '1.1rem' }}
                  id="search-input"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg btn-gold cursor-pointer">
                  <FiSearch size={20} />
                </button>
              </form>
              <p className="text-center mt-4 text-sm animate-pulse" style={{ color: 'var(--color-muted)' }}>
                Press Enter to search or Escape to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
