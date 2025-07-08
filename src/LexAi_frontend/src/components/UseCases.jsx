import { User, Building, Home, Users } from 'lucide-react';

const useCases = [
  {
    icon: User,
    title: "Freelancers",
    description: "Generate contracts for clients quickly",
    color: "bg-blue-500"
  },
  {
    icon: Building,
    title: "Startups",
    description: "Create NDAs and employee agreements",
    color: "bg-purple-500"
  },
  {
    icon: Home,
    title: "Tenants",
    description: "Understand rent rights, draft agreements",
    color: "bg-green-500"
  },
  {
    icon: Users,
    title: "Individuals",
    description: "Get legal advice for personal matters",
    color: "bg-orange-500"
  }
];

export default function UseCases() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Perfect For Everyone</h2>
          <p className="text-xl text-gray-600">Versatile legal assistance across different user types</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:transform group-hover:scale-105">
                <div className={`w-16 h-16 ${useCase.color} rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce`}>
                  <useCase.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}