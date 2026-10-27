import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, Send, MessageCircle, Play } from 'lucide-react';
import { StoreProvider, useStore } from './store';
import Navigation from './components/Navigation';
import HeroScene from './components/HeroScene';
import FragranceCategories from './components/FragranceCategories';
import ProductCollection from './components/ProductCollection';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import FragranceFinder from './components/FragranceFinder';
import Background3DScene from './components/Background3DScene';
import { PRODUCTS } from './data';
import type { Product, FragranceFamily } from './types';
import './App.css';

// ---- Loading Screen ----
function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const intervals = [
      setTimeout(() => setProgress(30), 200),
      setTimeout(() => setProgress(65), 600),
      setTimeout(() => setProgress(90), 1000),
      setTimeout(() => { setProgress(100); setTimeout(onDone, 400); }, 1400),
    ];
    return () => intervals.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      className="loading-screen"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="loading-logo"
        initial={{ opacity: 0, letterSpacing: '0.1em' }}
        animate={{ opacity: 1, letterSpacing: '0.4em' }}
        transition={{ duration: 1.2 }}
      >
        NOIRĚ
      </motion.div>
      <div className="loading-bar" style={{ width: 200 }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-gold), var(--color-champagne))',
            width: `${progress}%`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <motion.p
        className="loading-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        The Art of Fragrance
      </motion.p>
    </motion.div>
  );
}

// ---- Search Overlay ----
function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const results = query.length > 1
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.notes.some(n => n.toLowerCase().includes(query.toLowerCase())) ||
        p.family.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Search fragrances"
        >
          <motion.div
            className="search-panel"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="search-header">
              <Search size={18} color="var(--color-gold)" />
              <input
                ref={inputRef}
                className="search-input"
                type="search"
                placeholder="Search fragrances, notes, families..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search fragrances"
                id="search-input"
              />
              <button className="search-close" onClick={onClose} aria-label="Close search" id="search-close-btn">
                <X size={20} />
              </button>
            </div>

            {results.length > 0 && (
              <div className="search-results" role="list" aria-label="Search results">
                {results.map((p) => (
                  <div key={p.id} className="search-result-item" role="listitem">
                    <div className="search-result-dot" style={{ background: p.liquidColor }} />
                    <div>
                      <div className="search-result-name">{p.name}</div>
                      <div className="search-result-meta">{p.family} · {p.priceFormatted}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.length > 1 && results.length === 0 && (
              <p className="search-no-results">No fragrances found for "{query}"</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---- Our Story Section ----
function OurStorySection() {
  return (
    <section id="story" className="section story-section">
      <div className="story-bg" aria-hidden="true">
        <div className="story-glow" />
      </div>
      <div className="container">
        <div className="story-layout">
          <motion.div
            className="story-text"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true }}
          >
            <span className="label">Our Story</span>
            <div className="divider" />
            <h2 className="story-title">
              BORN FROM<br />
              <em>OBSESSION.</em>
            </h2>
            <p className="story-body">
              NOIRĚ was born in the shadow of ancient trade routes, where rare resins
              and precious botanicals crossed paths with the obsessions of master perfumers.
              We believe fragrance is the most intimate form of expression — invisible yet
              unforgettable.
            </p>
            <p className="story-body">
              Every bottle in our collection is the result of years of refinement,
              sourced from the world's most extraordinary ingredients. From the agarwood
              forests of Southeast Asia to the rose fields of Bulgaria, we leave no
              stone unturned in our pursuit of olfactory perfection.
            </p>
            <div className="story-stats">
              {[
                { value: '12+', label: 'Years of Craft' },
                { value: '40+', label: 'Rare Ingredients' },
                { value: '6', label: 'Signature Scents' },
              ].map((stat) => (
                <div key={stat.label} className="story-stat">
                  <span className="stat-value gold-text">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="story-visual"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="story-visual-card glass-card">
              <div className="story-orb story-orb-1" />
              <div className="story-orb story-orb-2" />
              <div className="story-orb story-orb-3" />
              <div className="story-quote">
                <Sparkles size={28} color="var(--color-gold)" />
                <blockquote className="quote-text">
                  "A great perfume is the invisible part of your personality — the most powerful
                  form of memory and desire."
                </blockquote>
                <cite className="quote-author">— The NOIRĚ Philosophy</cite>
              </div>
              <div className="story-pillars">
                {['Rarity', 'Authenticity', 'Longevity', 'Emotion'].map((pillar) => (
                  <div key={pillar} className="story-pillar">
                    <div className="pillar-dot" />
                    <span>{pillar}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---- Footer ----
function Footer({ onNav }: { onNav: (section: string) => void }) {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">NOIRĚ</div>
            <p className="footer-tagline">The Art of Fragrance</p>
            <div className="footer-social">
              {[
                { icon: <MessageCircle size={16} />, label: 'Instagram', href: '#' },
                { icon: <Send size={16} />, label: 'Twitter', href: '#' },
                { icon: <Play size={16} />, label: 'YouTube', href: '#' },
              ].map((s) => (
                <a key={s.label} href={s.href} className="footer-social-link" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4 className="footer-col-title">Explore</h4>
              <ul>
                {[
                  { label: 'Collection', id: 'collection' },
                  { label: 'Our Story', id: 'story' },
                  { label: 'Fragrance Finder', id: 'finder' },
                ].map((item) => (
                  <li key={item.id}>
                    <button className="footer-link" onClick={() => onNav(item.id)}>
                      {item.label}
                    </button>
                  </li>
                ))}
                <li>
                  <a href="/film.html" className="footer-link">Fragrance Film</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Support</h4>
              <ul>
                {['Shipping Policy', 'Returns', 'FAQ', 'Contact Us'].map((item) => (
                  <li key={item}>
                    <a href="#" className="footer-link">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Newsletter</h4>
              <p className="footer-newsletter-text">
                Join the NOIRĚ circle for exclusive drops and fragrance notes.
              </p>
              <div className="footer-newsletter">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="footer-email-input"
                  aria-label="Newsletter email"
                  id="newsletter-email"
                />
                <button className="footer-subscribe-btn" id="newsletter-subscribe-btn">
                  JOIN
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 NOIRĚ. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <a href="#" className="footer-legal-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---- Toast ----
function Toast() {
  const { state } = useStore();
  return (
    <div className={`toast ${state.toastMessage ? 'show' : ''}`} role="status" aria-live="polite">
      <span className="toast-icon">✦</span>
      {state.toastMessage}
    </div>
  );
}

// ---- Wishlist Section ----
function WishlistSection({ onProductView }: { onProductView: (product: Product) => void }) {
  const { state, toggleWishlist } = useStore();
  const wishlistProducts = PRODUCTS.filter(p => state.wishlist.includes(p.id));

  if (wishlistProducts.length === 0) return null;

  return (
    <section id="wishlist" className="section wishlist-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="label">Your Wishlist</span>
          <div className="divider divider-center" />
          <h2 className="section-title">SAVED<br /><em>DESIRES.</em></h2>
        </motion.div>
        <div className="wishlist-grid">
          {wishlistProducts.map((product) => (
            <motion.div
              key={product.id}
              className="wishlist-item glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="wishlist-dot" style={{ background: product.liquidColor }} />
              <div className="wishlist-info">
                <span className="wishlist-name">{product.name}</span>
                <span className="wishlist-price">{product.priceFormatted}</span>
              </div>
              <div className="wishlist-actions">
                <button className="btn-primary wishlist-view-btn" onClick={() => onProductView(product)} id={`wishlist-view-${product.id}-btn`}>
                  <span>VIEW</span>
                </button>
                <button className="wishlist-remove-btn" onClick={() => toggleWishlist(product.id)} aria-label={`Remove ${product.name} from wishlist`} id={`wishlist-remove-${product.id}-btn`}>
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Main App Inner ----
function AppInner() {
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterFamily, setFilterFamily] = useState<FragranceFamily>('all');

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleSectionNav = useCallback((section: string) => {
    scrollTo(section);
  }, [scrollTo]);

  const handleCategorySelect = useCallback((family: FragranceFamily) => {
    setFilterFamily(family);
    setTimeout(() => scrollTo('collection'), 50);
  }, [scrollTo]);

  return (
    <div className="app">
      <AnimatePresence>
        {loading && <LoadingScreen onDone={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <>
          <Background3DScene />
          <Navigation
            onSearchToggle={() => setSearchOpen(true)}
            onSectionNav={handleSectionNav}
          />

          <main id="main-content">
            <HeroScene
              onExploreClick={() => scrollTo('collection')}
              onDiscoverClick={() => scrollTo('story')}
            />

            <FragranceCategories onCategorySelect={handleCategorySelect} />

            <ProductCollection
              filterFamily={filterFamily}
              onProductView={setSelectedProduct}
            />

            <OurStorySection />

            <FragranceFinder />

            <WishlistSection onProductView={setSelectedProduct} />
          </main>

          <Footer onNav={handleSectionNav} />

          <CartDrawer />

          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />

          <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

          <Toast />
        </>
      )}
    </div>
  );
}

// ---- Root App ----
export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
