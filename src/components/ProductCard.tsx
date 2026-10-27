import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '../types';
import { useStore } from '../store';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  index: number;
}

export default function ProductCard({ product, onView, index }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const inWishlist = isInWishlist(product.id);
  const defaultSize = product.sizes[product.sizes.length - 1];
  const cardRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotY = (x - 0.5) * 22;
    const rotX = -(y - 0.5) * 16;

    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
    card.style.transition = 'transform 0.08s linear';

    // Parallax image shift
    if (imgRef.current) {
      imgRef.current.style.transform = `translate(${(x - 0.5) * -14}px, ${(y - 0.5) * -10}px) scale(1.08)`;
    }

    // Move glow to cursor position
    if (glowRef.current) {
      glowRef.current.style.left = `${x * 100}%`;
      glowRef.current.style.top = `${y * 100}%`;
      glowRef.current.style.opacity = '1';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    if (imgRef.current) {
      imgRef.current.style.transform = 'translate(0,0) scale(1.04)';
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const touch = e.touches[0];
    const rect = card.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;
    const rotY = (x - 0.5) * 18;
    const rotX = -(y - 0.5) * 14;

    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    card.style.transition = 'transform 0.08s linear';
  }, []);

  return (
    <motion.article
      ref={cardRef}
      className="product-card"
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: '-40px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
      aria-label={`${product.name} — ${product.priceFormatted}`}
      style={{ willChange: 'transform' }}
    >
      {/* Cursor glow */}
      <div
        ref={glowRef}
        className="card-cursor-glow"
        style={{ background: `radial-gradient(circle at center, ${product.liquidColor}55 0%, transparent 60%)` }}
      />

      {/* Image section */}
      <div
        className="product-img-wrapper"
        onClick={() => onView(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView(product);
          }
        }}
        aria-label={`View ${product.name} details`}
      >
        <div ref={imgRef} className="product-img-inner">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-img"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="product-img-placeholder" style={{ background: `linear-gradient(135deg, ${product.bottleColor}, ${product.liquidColor})` }} />
          )}
        </div>

        {/* Shimmer overlay */}
        <div className="product-img-shimmer" />

        {/* Bottom gradient fade */}
        <div className="product-img-fade" />

        {/* Color accent bar */}
        <div className="product-accent-bar" style={{ background: `linear-gradient(90deg, ${product.liquidColor}, ${product.capColor})` }} />

        {/* Badges */}
        <div className="product-badges">
          {product.bestSeller && <span className="product-badge badge-bestseller">Bestseller</span>}
          {product.featured && <span className="product-badge badge-featured">Featured</span>}
        </div>

        {/* Wishlist */}
        <button
          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          id={`wishlist-${product.id}-btn`}
        >
          <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Quick-view on hover */}
        <button
          className="product-quickview-btn"
          onClick={(e) => {
            e.stopPropagation();
            onView(product);
          }}
          id={`quickview-${product.id}-btn`}
        >
          <Eye size={14} />
          <span>Quick View</span>
        </button>
      </div>

      {/* Info */}
      <div className="product-info">
        <div className="product-family label">{product.family} · {product.concentration}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-notes">
          {product.notes.slice(0, 3).map((note) => (
            <span key={note} className="note-chip">{note}</span>
          ))}
        </div>

        <div className="product-footer">
          <div className="product-price">
            <span className="price-main">{product.priceFormatted}</span>
            <span className="price-size">{defaultSize.ml}ml</span>
          </div>

          <div className="product-actions-row">
            <button
              className="product-view-btn"
              onClick={() => onView(product)}
              id={`view-${product.id}-btn`}
              aria-label={`View ${product.name} details`}
            >
              <Eye size={14} />
              VIEW
            </button>
            <button
              className="product-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, defaultSize);
              }}
              id={`add-${product.id}-btn`}
              aria-label={`Add ${product.name} to bag`}
            >
              <ShoppingBag size={14} />
              ADD
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
