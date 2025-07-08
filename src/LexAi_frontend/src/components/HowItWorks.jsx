import { Brain, FileText, Download } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Simple 3-step process to get your legal needs sorted</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Brain, title: "Ask", description: "Describe your legal need", step: "01" },
            { icon: FileText, title: "Generate", description: "AI creates a legal document or advice", step: "02" },
            { icon: Download, title: "Download", description: "Download or save securely", step: "03" }
          ].map((item, index) => (
            <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto group-hover:shadow-2xl transition-shadow duration-300">
                  <item.icon className="w-10 h-10 text-white group-hover:animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 text-lg">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}