import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-black)' }}>
      <Navbar />
      <main className={`flex-1 ${isHome ? 'home-layout' : 'subpage-layout'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
