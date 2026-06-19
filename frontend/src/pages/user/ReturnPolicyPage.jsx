import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShield, FiRotateCcw, FiTruck, FiMail, FiChevronLeft } from 'react-icons/fi';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'radial-gradient(ellipse at center, #1A1208 0%, #0A0A0A 70%)' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back navigation */}
        <Link to="/" className="flex items-center gap-2 text-sm mb-8 hover:text-yellow-400 transition-colors w-fit"
              style={{ color: 'var(--color-muted)' }}>
          <FiChevronLeft size={16} /> Back to Home
        </Link>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--color-gold)' }}>Returns & Refunds</span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold mt-2" style={{ color: 'var(--color-cream)' }}>
            Return Policy
          </h1>
          <p className="text-sm mt-3 max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            At Liorix, we craft luxury scents to delight your senses. If you are not completely satisfied, here is how we can help.
          </p>
        </motion.div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: 7-Day Returns */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl gold-border space-y-3"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold/10" style={{ color: 'var(--color-gold)' }}>
              <FiRotateCcw size={20} />
            </div>
            <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>7-Day Returns</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              We accept returns or replacements within **7 days** of delivery. To be eligible, your request must be initiated within this period.
            </p>
          </motion.div>

          {/* Card 2: Hygiene & Seal */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl gold-border space-y-3"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold/10" style={{ color: 'var(--color-gold)' }}>
              <FiShield size={20} />
            </div>
            <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>Hygiene & Seal Policy</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Due to hygiene and the bespoke nature of luxury fragrances, products must be returned **unopened, unused, and in their original sealed cellophane packaging**.
            </p>
          </motion.div>

          {/* Card 3: Transit Damages */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl gold-border space-y-3"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold/10" style={{ color: 'var(--color-gold)' }}>
              <FiTruck size={20} />
            </div>
            <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>Damages & Wrong Items</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              If your perfume is damaged in transit or you receive the wrong product, we offer a **100% free replacement or full refund**. Please share clear photos of the package upon receipt.
            </p>
          </motion.div>

          {/* Card 4: Refund Timelines */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl gold-border space-y-3"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold/10" style={{ color: 'var(--color-gold)' }}>
              <FiMail size={20} />
            </div>
            <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--color-cream)' }}>Fast Refund Process</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Once your return is received at our facility and passes inspection, refunds are processed within **3-5 business days** back to your original payment method.
            </p>
          </motion.div>
        </div>

        {/* Process Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-8 rounded-3xl gold-border space-y-4"
          style={{ background: 'var(--color-surface)' }}
        >
          <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--color-cream)' }}>How to Return</h2>
          <ol className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            <li className="flex gap-3">
              <span className="font-bold font-mono text-base" style={{ color: 'var(--color-gold)' }}>01.</span>
              <span>Send an email to <a href="mailto:liorixparfums@gmail.com" className="font-semibold underline hover:text-yellow-400" style={{ color: 'var(--color-cream)' }}>liorixparfums@gmail.com</a> containing your Order Number and details of the items you wish to return.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold font-mono text-base" style={{ color: 'var(--color-gold)' }}>02.</span>
              <span>Wait for return approval and instructions from our support team (typically within 24 hours).</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold font-mono text-base" style={{ color: 'var(--color-gold)' }}>03.</span>
              <span>
                Securely pack the sealed item in its original box and ship it back to our warehouse:
                <br />
                <strong className="block mt-1 font-semibold" style={{ color: 'var(--color-cream)' }}>
                  Liorix Warehouse, Kadivihar D-block, KadiPur, Delhi - 110036
                </strong>
              </span>
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}
