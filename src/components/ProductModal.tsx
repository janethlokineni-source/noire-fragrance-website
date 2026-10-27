import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Environment, AdaptiveDpr, OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Box as BoxIcon } from 'lucide-react';
import PerfumeBottle from './PerfumeBottle';
import type { Product } from '../types';
import { useStore } from '../store';
import './ProductModal.css';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState(0);
  const [viewMode, setViewMode] = useState<'image' | '3d'>('image');

  useEffect(() => {
    setViewMode('image');
    setSelectedSize(0);
  }, [product?.id]);

  if (!product) return null;

  const size = product.sizes[selectedSize];

  const handleAddToCart = () => {
    addToCart(product, size);
    onClose();
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="modal-overlay open"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label={`Product detail: ${product.name}`}
        >
          <motion.div
            className="product-modal glass-card"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close product detail"
              id="product-modal-close-btn"
            >
              <X size={20} />
            </button>

            {/* Media Panel: Photo or 3D Model */}
            <div className="modal-media-panel">
              {/* Mode switch buttons */}
              <div className="modal-view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'image' ? 'active' : ''}`}
                  onClick={() => setViewMode('image')}
                  type="button"
                  id="modal-view-photo-btn"
                >
                  <ImageIcon size={14} />
                  <span>Photo</span>
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === '3d' ? 'active' : ''}`}
                  onClick={() => setViewMode('3d')}
                  type="button"
                  id="modal-view-3d-btn"
                >
                  <BoxIcon size={14} />
                  <span>3D Model</span>
                </button>
              </div>

              <div
                className="modal-glow"
                style={{ background: `radial-gradient(ellipse at center, ${product.liquidColor}35 0%, transparent 70%)` }}
              />

              {viewMode === 'image' ? (
                <div className="modal-image-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="modal-product-img"
                    draggable={false}
                  />
                  <div className="modal-image-hint">
                    Click "3D Model" to rotate in 3D
                  </div>
                </div>
              ) : (
                <div className="modal-3d-panel-inner">
                  <Suspense fallback={<div className="modal-3d-loading"><div className="loading-ring" /></div>}>
                    <Canvas
                      camera={{ position: [0, 0, 6], fov: 40 }}
                      dpr={[1, 2]}
                      gl={{ antialias: true, alpha: true }}
                      style={{ background: 'transparent', width: '100%', height: '100%' }}
                    >
                      <AdaptiveDpr pixelated />
                      <ambientLight intensity={0.4} />
                      <directionalLight position={[3, 5, 3]} intensity={2} color="#E8D5A5" />
                      <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#C8A96B" />
                      <pointLight position={[0, -3, 2]} intensity={0.8} color={product.liquidColor} />

                      <Float speed={1.5} floatIntensity={0.4}>
                        <PerfumeBottle
                          bottleColor={product.bottleColor}
                          liquidColor={product.liquidColor}
                          capColor={product.capColor}
                          autoRotate
                          scale={0.9}
                        />
                      </Float>

                      <OrbitControls
                        enableZoom={true}
                        minDistance={3.5}
                        maxDistance={8.5}
                        rotateSpeed={0.8}
                        enablePan={false}
                      />
                      <Environment preset="night" />
                    </Canvas>
                  </Suspense>
                  <div className="modal-3d-hint">
                    ✦ Drag to rotate 360° · Scroll to zoom
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="modal-details">
              <div className="modal-family label">{product.family} · {product.concentration}</div>
              <h2 className="modal-name">{product.name}</h2>
              <p className="modal-tagline">{product.description}</p>

              <div className="divider" />

              <p className="modal-long-desc">{product.longDescription}</p>

              {/* Notes */}
              <div className="modal-notes-section">
                <span className="modal-section-label label">Fragrance Notes</span>
                <div className="modal-notes">
                  {product.notes.map((note, i) => (
                    <motion.span
                      key={note}
                      className="note-chip-large"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      {note}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="modal-sizes-section">
                <span className="modal-section-label label">Select Size</span>
                <div className="modal-sizes" role="group" aria-label="Select bottle size">
                  {product.sizes.map((s, i) => (
                    <button
                      key={s.ml}
                      className={`size-btn ${selectedSize === i ? 'active' : ''}`}
                      onClick={() => setSelectedSize(i)}
                      id={`size-${product.id}-${s.ml}-btn`}
                      aria-pressed={selectedSize === i}
                      aria-label={`${s.ml}ml — ₹${s.price.toLocaleString()}`}
                    >
                      <span className="size-ml">{s.ml}ml</span>
                      <span className="size-price">₹{s.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Add */}
              <div className="modal-buy">
                <div className="modal-price">
                  <span className="modal-price-amount">₹{size.price.toLocaleString()}</span>
                  <span className="modal-price-ml">{size.ml}ml</span>
                </div>
                <button
                  className="btn-primary modal-add-btn"
                  onClick={handleAddToCart}
                  id={`modal-add-${product.id}-btn`}
                >
                  <span>ADD TO BAG</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
