import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, X, Menu } from 'lucide-react';
import { useStore } from '../store';
import './Navigation.css';

interface NavigationProps {
  onSearchToggle: () => void;
  onSectionNav: (section: string) => void;
}

const NAV_LINKS = [
  { label: 'Home', section: 'home' },
  { label: 'Collection', section: 'collection' },
  { label: 'Our Story', section: 'story' },
  { label: 'Fragrance Finder', section: 'finder' },
];

export default function Navigation({ onSearchToggle, onSectionNav }: NavigationProps) {
  const { cartCount, state, toggleCart } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (section: string) => {
    onSectionNav(section);
    setMobileOpen(false);
  };

  const wishlistCount = state.wishlist.length;

  return (
    <>
      <nav
        className={`nav ${scrolled ? 'nav-scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="nav-inner">
          {/* Logo */}
          <button
            className="nav-logo"
            onClick={() => handleNav('home')}
            aria-label="NOIRÉ — Go to home"
            id="nav-logo-btn"
          >
            NOIRÉ
          </button>

          {/* Desktop Links */}
          <ul className="nav-links" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.section}>
                <button
                  className="nav-link"
                  onClick={() => handleNav(link.section)}
                  id={`nav-${link.section}-btn`}
                >
                  {link.label}
                  <span className="nav-link-underline" aria-hidden="true" />
                </button>
              </li>
            ))}
            <li>
              <a className="nav-link nav-film-link" href="/film.html" id="nav-film-link">
                Fragrance Film
                <span className="nav-link-underline" aria-hidden="true" />
              </a>
            </li>
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            <button
              className="nav-icon-btn"
              onClick={onSearchToggle}
              aria-label="Search fragrances"
              id="nav-search-btn"
            >
              <Search size={18} />
            </button>

            <button
              className="nav-icon-btn"
              onClick={() => handleNav('wishlist')}
              aria-label={`Wishlist (${wishlistCount} items)`}
              id="nav-wishlist-btn"
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="nav-badge" aria-label={`${wishlistCount} wishlist items`}>
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              className="nav-icon-btn nav-cart-btn"
              onClick={() => toggleCart(true)}
              aria-label={`Shopping bag (${cartCount} items)`}
              id="nav-cart-btn"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="nav-badge" aria-label={`${cartCount} items in bag`}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              id="nav-hamburger-btn"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="mobile-menu-header">
              <span className="mobile-menu-logo">NOIRÉ</span>
              <button
                className="nav-icon-btn"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            <ul className="mobile-nav-links" role="list">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.section}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <button
                    className="mobile-nav-link"
                    onClick={() => handleNav(link.section)}
                    id={`mobile-nav-${link.section}-btn`}
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: NAV_LINKS.length * 0.08 }}
              >
                <a
                  className="mobile-nav-link"
                  href="/film.html"
                  onClick={() => setMobileOpen(false)}
                  id="mobile-nav-film-link"
                >
                  Fragrance Film
                </a>
              </motion.li>
            </ul>

            <div className="mobile-menu-actions">
              <button className="mobile-nav-link small" onClick={onSearchToggle} id="mobile-search-btn">
                <Search size={16} /> Search
              </button>
              <button className="mobile-nav-link small" onClick={() => { toggleCart(true); setMobileOpen(false); }} id="mobile-cart-btn">
                <ShoppingBag size={16} /> My Bag {cartCount > 0 && `(${cartCount})`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
