import { useState } from 'react';
import { Scale, Menu, X } from 'lucide-react';
import LoginButton from './LoginButton';
import { Link } from "react-router-dom";


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LexAI
            </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="mr-4">Home</Link>
              <Link to="/ask" className="text-gray-700 hover:text-blue-600">Ask AI</Link>
              <Link to="/generate" className="text-gray-700 hover:text-blue-600">Generate Document</Link>
              <Link to="/profile" className="text-gray-700 hover:text-blue-600">Profile</Link>
              <LoginButton className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" />
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t animate-in slide-in-from-top-2 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#ask" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">Ask AI</a>
            <a href="#generate" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">Generate Document</a>
            <a href="#templates" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md">Templates</a>
            <button className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-md">Login</button>
          </div>
        </div>
      )}
     </div> 
    
  );
}