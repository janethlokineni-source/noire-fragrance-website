import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { PRODUCTS } from '../data';
import type { Product, FragranceFamily, SortOption } from '../types';
import ProductCard from './ProductCard';
import './ProductCollection.css';

interface ProductCollectionProps {
  filterFamily?: FragranceFamily;
  onProductView: (product: Product) => void;
}

const FAMILIES: { value: FragranceFamily; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'woody', label: 'Woody' },
  { value: 'floral', label: 'Floral' },
  { value: 'fresh', label: 'Fresh' },
  { value: 'amber', label: 'Amber' },
];

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Alphabetical' },
];

export default function ProductCollection({ filterFamily, onProductView }: ProductCollectionProps) {
  const [activeFamily, setActiveFamily] = useState<FragranceFamily>(filterFamily ?? 'all');
  const [sort, setSort] = useState<SortOption>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(6000);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];

    if (activeFamily !== 'all') {
      list = list.filter((p) => p.family === activeFamily);
    }

    list = list.filter((p) => p.price <= maxPrice);

    switch (sort) {
      case 'featured': list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
      case 'price-low': list.sort((a, b) => a.price - b.price); break;
      case 'price-high': list.sort((a, b) => b.price - a.price); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return list;
  }, [activeFamily, sort, maxPrice]);

  return (
    <section id="collection" className="section collection-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="label">Our Fragrances</span>
          <div className="divider divider-center" />
          <h2 className="section-title">THE ART OF<br /><em>PERFUMERY</em></h2>
          <p className="section-subtitle">
            Six extraordinary compositions. Each a world unto itself.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="collection-filters">
          <div className="filter-families" role="group" aria-label="Filter by fragrance family">
            {FAMILIES.map((fam) => (
              <button
                key={fam.value}
                className={`filter-btn ${activeFamily === fam.value ? 'active' : ''}`}
                onClick={() => setActiveFamily(fam.value)}
                id={`filter-${fam.value}-btn`}
                aria-pressed={activeFamily === fam.value}
              >
                {fam.label}
              </button>
            ))}
          </div>

          <div className="filter-controls">
            {/* Price range */}
            <div className="filter-price">
              <label htmlFor="price-range" className="filter-label">
                Max: ₹{maxPrice.toLocaleString()}
              </label>
              <input
                id="price-range"
                type="range"
                min={2000}
                max={6000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="price-range-input"
                aria-label="Maximum price filter"
              />
            </div>

            {/* Sort */}
            <div className="filter-sort">
              <SlidersHorizontal size={14} color="var(--color-grey)" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="sort-select"
                id="sort-select"
                aria-label="Sort products"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown size={12} color="var(--color-grey)" />
            </div>
          </div>
        </div>

        {/* Result count */}
        <div className="collection-meta">
          <span className="collection-count">
            {filtered.length} {filtered.length === 1 ? 'fragrance' : 'fragrances'}
          </span>
        </div>

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="product-grid" role="list" aria-label="Fragrance collection">
            {filtered.map((product, i) => (
              <div key={product.id} role="listitem">
                <ProductCard
                  product={product}
                  onView={onProductView}
                  index={i}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="collection-empty">
            <p>No fragrances match your filters.</p>
            <button
              className="btn-outline"
              onClick={() => { setActiveFamily('all'); setMaxPrice(6000); }}
              id="reset-filters-btn"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
