import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Disclaimer() {
  return (
    <motion.div
      className="bg-yellow-50 border-l-4 border-yellow-400 p-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex-shrink-0">
          <ShieldCheckIcon className="h-6 w-6 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ LexAI provides AI-generated legal assistance. It is not a substitute for professional legal advice from a licensed attorney.
          </p>
        </div>
      </div>
    </motion.div>
  );
}