import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function DemoPreview() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-800 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Experience LexAI</h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">See how our AI delivers instant legal solutions</p>
        </motion.div>
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-500 text-sm ml-4 font-medium">LexAI Legal Advisor</span>
          </div>
          <div className="space-y-4">
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-indigo-600 text-white rounded-2xl rounded-br-sm px-6 py-3 max-w-xs shadow">
                Can you help me create a basic NDA for my freelance work?
              </div>
            </motion.div>
            <motion.div
              className="flex items-start space-x-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-6 py-3 max-w-md shadow">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  I'll help you create a comprehensive NDA for your freelance work, including confidentiality clauses, term duration, and scope definitions...
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}