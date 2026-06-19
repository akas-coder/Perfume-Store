import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    shop: [
      { label: "Men's Fragrances", to: '/products?gender=MEN' },
      { label: "Women's Fragrances", to: '/products?gender=WOMEN' },
      { label: 'Luxury Collection', to: '/products?isLuxury=true' },
      { label: 'New Arrivals', to: '/products?sort=newest' },
      { label: 'Gift Sets', to: '/products?category=gift-sets' },
    ],
    help: [
      { label: 'Track Order', to: '/orders' },
      { label: 'Return Policy', to: '#' },
      { label: 'Shipping Info', to: '#' },
      { label: 'FAQ', to: '#' },
      { label: 'Contact Us', to: '#' },
    ],
  };

  return (
    <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
      {/* Newsletter Strip */}
      <div style={{ background: 'linear-gradient(135deg, #D4AF37, #B8941F)', padding: '40px 0' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-semibold text-black">Join the Fragrance Circle</h3>
            <p className="text-black text-opacity-70 text-sm mt-1">Get exclusive offers, new arrivals & fragrance tips.</p>
          </div>
          <form className="flex gap-3 w-full md:w-auto" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 rounded-lg flex-1 md:w-72 text-sm"
              style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: '#000', outline: 'none' }}
              id="newsletter-email"
            />
            <button type="submit"
              className="px-6 py-3 rounded-lg font-semibold text-sm tracking-wider"
              style={{ background: '#0A0A0A', color: '#D4AF37' }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg, #E8C96A, #D4AF37)' }}>
                <svg width="18" height="18" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="22" y="28" width="20" height="24" rx="4" fill="#0A0A0A" opacity="0.8"/>
                  <rect x="27" y="20" width="10" height="10" rx="2" fill="#0A0A0A" opacity="0.8"/>
                  <rect x="25" y="14" width="14" height="8" rx="3" fill="#0A0A0A" opacity="0.9"/>
                  <rect x="38" y="17" width="5" height="3" rx="1.5" fill="#0A0A0A" opacity="0.7"/>
                </svg>
              </div>
              <span className="font-display text-2xl font-semibold text-gold-gradient tracking-widest">Liorix</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>
              Curating the world's finest fragrances for discerning connoisseurs. 
              Every scent tells a story — find yours.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: FiInstagram, href: "https://www.instagram.com/liorixofficial/" },
                { Icon: FiTwitter, href: "#" },
                { Icon: FiFacebook, href: "#" }
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center gold-border transition-all hover:scale-110"
                   style={{ color: 'var(--color-gold)' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--color-cream)' }}>Shop</h4>
            <ul className="space-y-3">
              {links.shop.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm transition-colors hover:text-yellow-400"
                        style={{ color: 'var(--color-muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--color-cream)' }}>Help</h4>
            <ul className="space-y-3">
              {links.help.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm transition-colors hover:text-yellow-400"
                        style={{ color: 'var(--color-muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--color-cream)' }}>Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-gold)' }} />
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Kadivihar D-block KadiPur Delhi 110036
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone size={16} style={{ color: 'var(--color-gold)' }} />
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>+91 9319232037</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail size={16} style={{ color: 'var(--color-gold)' }} />
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>liorixparfums@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
             style={{ borderTop: '1px solid var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            © {year} Liorix. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" className="text-xs transition-colors hover:text-yellow-400"
                 style={{ color: 'var(--color-muted)' }}>{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
