
  import { motion } from 'framer-motion';
  import { StarIcon } from '@heroicons/react/24/solid';

  const testimonials = [
    {
      text: "Created an NDA in just 2 minutes, no lawyer needed!",
      author: "Sarah Chen",
      role: "Freelancer",
      rating: 5
    },
    {
      text: "Saved ₹20,000 in legal fees for my startup's contracts.",
      author: "Rahul Sharma",
      role: "Small Business Owner",
      rating: 5
    },
    {
      text: "Finally clarified my rental rights with ease.",
      author: "Priya Patel",
      role: "Tenant",
      rating: 5
    }
  ];

  export default function Testimonials() {
    return (
      <section className="py-20 bg-gradient-to-r from-indigo-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Trusted by Thousands</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Hear from professionals who rely on LexAI</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  