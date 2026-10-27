import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import './CartDrawer.css';

export default function CartDrawer() {
  const { state, toggleCart, removeFromCart, updateQuantity, cartTotal, cartCount } = useStore();
  const { isCartOpen, cart } = state;

  const [checkoutState, setCheckoutState] = React.useState<'idle' | 'checkout' | 'demo'>('idle');

  const handleCheckout = () => {
    setCheckoutState('demo');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => toggleCart(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`cart-drawer ${isCartOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={18} />
            <span>MY BAG</span>
            {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
          </div>
          <button
            className="cart-close-btn"
            onClick={() => toggleCart(false)}
            aria-label="Close shopping bag"
            id="cart-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="cart-body">
          <AnimatePresence>
            {checkoutState === 'demo' ? (
              <motion.div
                className="cart-demo-notice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="demo-icon">✦</div>
                <h3>Demo Checkout</h3>
                <p>
                  This is a <strong>demonstration</strong> checkout. No payment has been processed
                  and no order has been placed. To enable real checkout, integrate a payment
                  provider (e.g., Razorpay, Stripe) and connect a backend order API.
                </p>
                <button
                  className="btn-outline"
                  onClick={() => setCheckoutState('idle')}
                  id="back-to-cart-btn"
                >
                  Back to Bag
                </button>
              </motion.div>
            ) : cart.length === 0 ? (
              <motion.div
                className="cart-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ShoppingBag size={48} strokeWidth={1} color="var(--color-grey)" />
                <p>Your bag is empty.</p>
                <span>Explore our collection to discover your signature scent.</span>
                <button
                  className="btn-primary"
                  onClick={() => toggleCart(false)}
                  id="continue-shopping-btn"
                >
                  <span>EXPLORE COLLECTION</span>
                </button>
              </motion.div>
            ) : (
              <motion.ul className="cart-items" role="list" aria-label="Cart items">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.li
                      key={`${item.product.id}-${item.size.ml}`}
                      className="cart-item"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0 }}
                      layout
                    >
                      <div className="cart-item-visual">
                        <div
                          className="cart-item-dot"
                          style={{ background: item.product.liquidColor }}
                        />
                      </div>

                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.product.name}</div>
                        <div className="cart-item-size">{item.size.ml}ml · {item.product.concentration}</div>
                        <div className="cart-item-price">
                          ₹{(item.size.price * item.quantity).toLocaleString()}
                        </div>
                      </div>

                      <div className="cart-item-controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.product.id, item.size.ml, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          id={`qty-minus-${item.product.id}-${item.size.ml}`}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-value" aria-label={`Quantity: ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.product.id, item.size.ml, item.quantity + 1)}
                          aria-label="Increase quantity"
                          id={`qty-plus-${item.product.id}-${item.size.ml}`}
                        >
                          <Plus size={12} />
                        </button>

                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.product.id, item.size.ml)}
                          aria-label={`Remove ${item.product.name} from bag`}
                          id={`remove-${item.product.id}-${item.size.ml}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {cart.length > 0 && checkoutState !== 'demo' && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>SUBTOTAL</span>
              <span className="subtotal-amount">₹{cartTotal.toLocaleString()}</span>
            </div>
            <p className="cart-taxes-note">Taxes and shipping calculated at checkout</p>
            <button
              className="btn-primary checkout-btn"
              onClick={handleCheckout}
              id="checkout-btn"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="btn-outline continue-btn"
              onClick={() => toggleCart(false)}
              id="continue-shopping-btn-2"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>
    </>
  );
}
