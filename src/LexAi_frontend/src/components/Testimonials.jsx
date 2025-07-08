import { Star } from 'lucide-react';

const testimonials = [
  {
    text: "Got my NDA ready in 2 minutes. No lawyer needed.",
    author: "Sarah Chen",
    role: "Freelancer",
    rating: 5
  },
  {
    text: "Saved ₹20,000 in legal fees for my startup.",
    author: "Rahul Sharma",
    role: "Small Business Owner",
    rating: 5
  },
  {
    text: "Finally understand my rental rights clearly.",
    author: "Priya Patel",
    role: "Tenant",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600">Trusted by thousands of professionals</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}