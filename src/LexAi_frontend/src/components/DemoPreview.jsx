import { Brain, Zap } from 'lucide-react';

export default function DemoPreview() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">See It In Action</h2>
          <p className="text-xl text-blue-200">Experience the power of AI-driven legal assistance</p>
        </div>
        
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-500 text-sm ml-4">LexAI Legal Advisor</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-6 py-3 max-w-xs">
                Can you help me create a basic NDA for my freelance work?
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-6 py-3 max-w-md">
                <div className="animate-pulse">
                  I'll help you create a comprehensive NDA for your freelance work. Based on standard practices, I'll include confidentiality clauses, term duration, and scope definitions...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}