import { Shield } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="max-w-7xl mx-auto flex">
        <div className="flex-shrink-0">
          <Shield className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-800">
            ⚠️ This platform provides AI-generated legal assistance. It is not a substitute for a licensed attorney.
          </p>
        </div>
      </div>
    </div>
  );
}