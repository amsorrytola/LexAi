
  import { motion } from 'framer-motion';
  import { LightBulbIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

  export default function HowItWorks() {
    const steps = [
      { icon: LightBulbIcon, title: "Ask", description: "Submit your legal query or need", step: "01" },
      { icon: DocumentTextIcon, title: "Generate", description: "AI crafts tailored legal documents or advice", step: "02" },
      { icon: ArrowDownTrayIcon, title: "Download", description: "Securely save or download your results", step: "03" }
    ];

    return (
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16 pb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">How LexAI Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">A seamless 3-step process to address your legal needs instantly</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="relative mb-6">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <item.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-lg max-w-xs mx-auto">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  