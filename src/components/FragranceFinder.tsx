import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS } from '../data';
import type { Product, QuizAnswer } from '../types';
import { useStore } from '../store';
import './FragranceFinder.css';

// ---- Recommendation logic ----
function getRecommendations(answers: QuizAnswer): Product[] {
  const scores: Record<string, number> = {};

  PRODUCTS.forEach((p) => { scores[p.id] = 0; });

  // Family preference
  if (answers.family) {
    PRODUCTS.forEach((p) => {
      if (p.family === answers.family) scores[p.id] += 3;
    });
  }

  // Occasion mapping
  if (answers.occasion === 'everyday') {
    PRODUCTS.filter(p => p.family === 'fresh' || p.family === 'floral').forEach(p => (scores[p.id] += 2));
  } else if (answers.occasion === 'office') {
    PRODUCTS.filter(p => p.family === 'fresh' || p.family === 'floral').forEach(p => (scores[p.id] += 2));
    PRODUCTS.filter(p => p.price < 4000).forEach(p => (scores[p.id] += 1));
  } else if (answers.occasion === 'evening') {
    PRODUCTS.filter(p => p.family === 'amber' || p.family === 'woody').forEach(p => (scores[p.id] += 2));
  } else if (answers.occasion === 'special') {
    PRODUCTS.filter(p => p.price >= 4000).forEach(p => (scores[p.id] += 2));
    PRODUCTS.filter(p => p.bestSeller).forEach(p => (scores[p.id] += 1));
  }

  // Atmosphere mapping
  if (answers.atmosphere === 'fresh') {
    PRODUCTS.filter(p => p.family === 'fresh').forEach(p => (scores[p.id] += 2));
  } else if (answers.atmosphere === 'warm') {
    PRODUCTS.filter(p => p.family === 'amber').forEach(p => (scores[p.id] += 2));
  } else if (answers.atmosphere === 'bold') {
    PRODUCTS.filter(p => p.family === 'woody').forEach(p => (scores[p.id] += 2));
  } else if (answers.atmosphere === 'soft') {
    PRODUCTS.filter(p => p.family === 'floral').forEach(p => (scores[p.id] += 2));
  }

  return PRODUCTS
    .slice()
    .sort((a, b) => scores[b.id] - scores[a.id])
    .slice(0, 3);
}

const QUESTIONS = [
  {
    id: 'family',
    question: 'Which fragrance family do you prefer?',
    options: [
      { value: 'woody', label: 'Woody', desc: 'Deep, smoky, resinous' },
      { value: 'floral', label: 'Floral', desc: 'Romantic, blooming, soft' },
      { value: 'fresh', label: 'Fresh', desc: 'Clean, citrus, aquatic' },
      { value: 'amber', label: 'Amber', desc: 'Warm, spiced, sensual' },
    ],
  },
  {
    id: 'occasion',
    question: 'When will you wear it?',
    options: [
      { value: 'everyday', label: 'Everyday', desc: 'Casual, versatile' },
      { value: 'office', label: 'Office', desc: 'Professional, subtle' },
      { value: 'evening', label: 'Evening', desc: 'Elegant, atmospheric' },
      { value: 'special', label: 'Special Occasions', desc: 'Memorable, rare' },
    ],
  },
  {
    id: 'atmosphere',
    question: 'What atmosphere do you prefer?',
    options: [
      { value: 'fresh', label: 'Fresh & Energetic', desc: 'Vibrant, light' },
      { value: 'warm', label: 'Warm & Comforting', desc: 'Cozy, intimate' },
      { value: 'bold', label: 'Bold & Mysterious', desc: 'Powerful, enigmatic' },
      { value: 'soft', label: 'Soft & Elegant', desc: 'Delicate, refined' },
    ],
  },
];

export default function FragranceFinder() {
  const { addToCart } = useStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({ family: null, occasion: null, atmosphere: null });
  const [recommendations, setRecommendations] = useState<Product[] | null>(null);

  const currentQ = QUESTIONS[step];

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQ.id]: value } as QuizAnswer;
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setRecommendations(getRecommendations(newAnswers));
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({ family: null, occasion: null, atmosphere: null });
    setRecommendations(null);
  };

  return (
    <section id="finder" className="section finder-section">
      <div className="finder-bg" aria-hidden="true">
        <div className="finder-glow" />
      </div>

      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="label">Fragrance Finder</span>
          <div className="divider divider-center" />
          <h2 className="section-title">YOUR NEXT<br /><em>SIGNATURE SCENT.</em></h2>
        </motion.div>

        <div className="finder-card glass-card">
          <AnimatePresence mode="wait">
            {recommendations ? (
              <motion.div
                key="results"
                className="finder-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="results-header">
                  <span className="label">Your Matches</span>
                  <h3 className="results-title">We found your signature.</h3>
                  <p className="results-subtitle">Based on your preferences, these fragrances were curated for you.</p>
                </div>

                <div className="results-grid">
                  {recommendations.map((product, i) => (
                    <motion.div
                      key={product.id}
                      className="result-card glass-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="result-orb" style={{ background: product.liquidColor }} />
                      <div className="result-match-badge">
                        {i === 0 ? 'Best Match' : i === 1 ? 'Great Match' : 'Good Match'}
                      </div>
                      <h4 className="result-name">{product.name}</h4>
                      <p className="result-desc">{product.description}</p>
                      <div className="result-notes">
                        {product.notes.slice(0, 2).map(n => (
                          <span key={n} className="note-chip">{n}</span>
                        ))}
                      </div>
                      <div className="result-footer">
                        <span className="result-price">{product.priceFormatted}</span>
                        <button
                          className="btn-primary result-add-btn"
                          onClick={() => addToCart(product, product.sizes[product.sizes.length - 1])}
                          id={`finder-add-${product.id}-btn`}
                        >
                          <span>ADD TO BAG</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  className="btn-outline finder-restart-btn"
                  onClick={handleRestart}
                  id="finder-restart-btn"
                >
                  RETAKE THE QUIZ
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${step}`}
                className="finder-question"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                {/* Progress */}
                <div className="finder-progress" role="progressbar" aria-valuenow={step + 1} aria-valuemax={QUESTIONS.length}>
                  {QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className={`progress-dot ${i <= step ? 'active' : ''}`}
                      aria-label={i < step ? 'Completed' : i === step ? 'Current' : 'Upcoming'}
                    />
                  ))}
                  <span className="progress-label">{step + 1} / {QUESTIONS.length}</span>
                </div>

                <h3 className="question-text">{currentQ.question}</h3>

                <div className="question-options" role="group" aria-label={currentQ.question}>
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt.value}
                      className="option-btn"
                      onClick={() => handleAnswer(opt.value)}
                      id={`finder-${currentQ.id}-${opt.value}-btn`}
                    >
                      <span className="option-label">{opt.label}</span>
                      <span className="option-desc">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
