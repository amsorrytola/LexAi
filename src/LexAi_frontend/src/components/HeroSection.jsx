
  import { motion } from 'framer-motion';
  import { ShieldCheckIcon, ScaleIcon, CheckCircleIcon, LightBulbIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
  import { useNavigate } from 'react-router-dom';

  export default function HeroSection() {
    const navigate = useNavigate();

    const handleGoToAsk = () => navigate('/ask');
    const handleGenerateClick = () => navigate('/generate');

    return (
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-200/30 z-0"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-6 shadow-sm">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Powered by Secure Blockchain
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                Instant Legal Solutions{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  Secure. Smart. Simple.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                Access AI-driven legal advice and generate secure contracts in seconds, all protected by blockchain technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={handleGoToAsk}
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 255, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg flex items-center justify-center"
                >
                  <LightBulbIcon className="w-5 h-5 mr-2" />
                  Ask Legal Questions
                </motion.button>
                <motion.button
                  onClick={handleGenerateClick}
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0, 0, 255, 0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-indigo-300 hover:border-indigo-600 text-indigo-600 hover:text-indigo-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Generate Documents
                </motion.button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 transform hover:scale-105 transition-transform duration-500">
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative">
                      <ScaleIcon className="w-28 h-28 text-indigo-600 animate-pulse" />
                      <motion.div
                        className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 6.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {['AI-Powered Insights', 'Blockchain Security', 'Instant Document Creation'].map((text, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        <span className="text-gray-700 font-medium">{text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }
  