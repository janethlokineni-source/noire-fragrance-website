import { motion, type Variants } from 'framer-motion';
import { FRAGRANCE_CATEGORIES } from '../data';
import type { FragranceFamily } from '../types';
import './FragranceCategories.css';

interface FragranceCategoriesProps {
  onCategorySelect: (family: FragranceFamily) => void;
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export default function FragranceCategories({ onCategorySelect }: FragranceCategoriesProps) {
  return (
    <section id="categories" className="section categories-section">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="label">Fragrance Families</span>
          <div className="divider divider-center" />
          <h2 className="section-title">FIND YOUR<br /><em>SIGNATURE.</em></h2>
          <p className="section-subtitle">
            Every fragrance tells a story. Find the one that speaks yours.
          </p>
        </motion.div>

        <motion.div
          className="categories-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {FRAGRANCE_CATEGORIES.map((cat) => (
            <motion.div
              key={cat.id}
              className="category-card glass-card"
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div
                className="category-glow"
                style={{ background: cat.bgGradient }}
                aria-hidden="true"
              />

              {/* Visual accent */}
              <div className="category-accent" style={{ borderColor: cat.accentColor }}>
                <div className="category-orb" style={{ background: cat.accentColor }} />
              </div>

              <div className="category-content">
                <span className="category-mood" style={{ color: cat.accentColor }}>
                  {cat.mood}
                </span>
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-description">{cat.description}</p>

                <button
                  className="category-explore-btn"
                  style={{ '--accent': cat.accentColor } as React.CSSProperties}
                  onClick={() => onCategorySelect(cat.family)}
                  id={`category-${cat.id}-btn`}
                  aria-label={`Explore ${cat.name} fragrances`}
                >
                  EXPLORE
                  <span className="explore-arrow">→</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
