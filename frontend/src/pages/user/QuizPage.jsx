import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { productAPI } from '../../services/api';
import ProductCard from '../../components/ui/ProductCard';

const STEPS = [
  {
    id: 'gender', question: 'Who are you shopping for?',
    subtitle: 'Help us personalize your recommendations',
    options: [
      { value: 'MEN', label: 'Him', icon: '🎩', desc: 'Bold, masculine fragrances' },
      { value: 'WOMEN', label: 'Her', icon: '🌸', desc: 'Elegant, feminine scents' },
      { value: 'UNISEX', label: 'Anyone', icon: '✨', desc: 'Gender-free fragrances' },
    ]
  },
  {
    id: 'family', question: 'What type of scent do you prefer?',
    subtitle: 'Choose the fragrance family that resonates with you',
    options: [
      { value: 'Floral', label: 'Floral', icon: '🌺', desc: 'Rose, jasmine, lily' },
      { value: 'Oriental', label: 'Oriental', icon: '🪔', desc: 'Oud, spice, amber' },
      { value: 'Woody', label: 'Woody', icon: '🌲', desc: 'Sandalwood, cedar, vetiver' },
      { value: 'Fresh', label: 'Fresh', icon: '🌿', desc: 'Clean, citrus, aquatic' },
      { value: 'Gourmand', label: 'Gourmand', icon: '🍮', desc: 'Vanilla, caramel, sweet' },
    ]
  },
  {
    id: 'budget', question: "What's your budget?",
    subtitle: 'We have options for every price point',
    options: [
      { value: '2000', label: 'Under ₹2,000', icon: '💸', desc: 'Great value picks' },
      { value: '5000', label: 'Under ₹5,000', icon: '💰', desc: 'Premium selection' },
      { value: '10000', label: 'Under ₹10,000', icon: '👑', desc: 'Luxury range' },
      { value: '', label: 'No Limit', icon: '🌟', desc: 'The finest collection' },
    ]
  },
];

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({ gender: '', family: '', budget: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const currentAnswer = answers[step?.id];

  const handleSelect = (value) => {
    setAnswers(prev => ({ ...prev, [step.id]: value }));
  };

  const handleNext = async () => {
    if (!currentAnswer && currentAnswer !== '') return;
    if (isLastStep) {
      setLoading(true);
      try {
        const res = await productAPI.getRecommendations(
          answers.gender, answers.family, answers.budget || undefined
        );
        setResults(res.data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleRetake = () => {
    setCurrentStep(0);
    setAnswers({ gender: '', family: '', budget: '' });
    setResults(null);
  };

  if (results !== null) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="text-center mb-10">
            <span className="text-6xl mb-4 block">🎯</span>
            <h1 className="font-display text-4xl font-semibold mb-3" style={{ color: 'var(--color-cream)' }}>
              Your Perfect Fragrances
            </h1>
            <p className="text-base" style={{ color: 'var(--color-muted)' }}>
              Based on your preferences, we recommend these {results.length} fragrances
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-10">
              <p className="mb-4" style={{ color: 'var(--color-muted)' }}>No perfect match found. Try different preferences!</p>
              <button onClick={handleRetake} className="px-6 py-3 rounded-full text-sm btn-gold">Retake Quiz</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
                {results.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={handleRetake} className="px-6 py-3 rounded-full text-sm btn-outline-gold">
                  Retake Quiz
                </button>
                <button onClick={() => navigate('/products')} className="px-6 py-3 rounded-full text-sm btn-gold">
                  Browse All
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 py-10"
         style={{ background: 'radial-gradient(ellipse at center, #1A1208 0%, #0A0A0A 70%)' }}>
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
                 style={{ background: i <= currentStep ? 'var(--color-gold)' : 'var(--color-surface-2)' }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentStep}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}>
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--color-gold)' }}>
                Step {currentStep + 1} of {STEPS.length}
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-2" style={{ color: 'var(--color-cream)' }}>
                {step.question}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{step.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {step.options.map(opt => (
                <button key={opt.value} onClick={() => handleSelect(opt.value)}
                  className="p-5 rounded-2xl text-left transition-all duration-200 card-hover"
                  style={{
                    border: `1px solid ${currentAnswer === opt.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                    background: currentAnswer === opt.value ? 'rgba(212,175,55,0.1)' : 'var(--color-surface)',
                  }}>
                  <div className="flex items-start justify-between">
                    <span className="text-3xl mb-3 block">{opt.icon}</span>
                    {currentAnswer === opt.value && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center"
                           style={{ background: 'var(--color-gold)' }}>
                        <FiCheck size={14} color="#0A0A0A" />
                      </div>
                    )}
                  </div>
                  <p className="font-semibold" style={{ color: currentAnswer === opt.value ? 'var(--color-gold)' : 'var(--color-cream)' }}>
                    {opt.label}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <button onClick={handleBack} disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm btn-outline-gold disabled:opacity-30">
            <FiArrowLeft size={16} /> Back
          </button>
          <button onClick={handleNext} disabled={!currentAnswer && currentAnswer !== '' || loading}
            className="flex items-center gap-2 px-8 py-3 rounded-full text-sm btn-gold disabled:opacity-50">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Finding...</>
            ) : (
              <>{isLastStep ? 'Find My Scent' : 'Next'} <FiArrowRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
