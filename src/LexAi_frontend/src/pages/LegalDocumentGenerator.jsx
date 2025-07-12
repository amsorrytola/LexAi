import React, { useState } from 'react';
import { ChevronDown, FileText, Download, Copy, Edit3, Save, Sparkles, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const LegalDocumentGenerator = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        documentType: 'NDA',
        disclosingParty: '',
        receivingParty: '',
        purpose: '',
        duration: '',
        jurisdiction: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDocument, setGeneratedDocument] = useState('');
    const [showDocument, setShowDocument] = useState(false);

    const documentTypes = [
        { value: 'NDA', label: 'Non-Disclosure Agreement' },
        { value: 'Employment', label: 'Employment Agreement' },
        { value: 'Service', label: 'Service Agreement' },
        { value: 'Partnership', label: 'Partnership Agreement' },
        { value: 'Rental', label: 'Rental Agreement' },
        { value: 'Purchase', label: 'Purchase Agreement' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateDocument = async () => {
        setIsGenerating(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        const sampleDocument = `NON-DISCLOSURE AGREEMENT

This Agreement is made between ${formData.disclosingParty || 'Disclosing Party'} (acting "Disclosing Party") and ${formData.receivingParty || 'Receiving Party'} (acting "Receiving Party").

1. Confidential Information

The Receiving Party shall not use or disclose any confidential information for disclosure of Confidential Information.

(i) ${formData.purpose || 'Business collaboration'}

The Receiving Party may exercise or re-use of disclosing containing use of the use of confidential information, as and therein.

Purpose: ${formData.purpose || 'Not specified'}
Duration: ${formData.duration || 'Not specified'}
Jurisdiction: ${formData.jurisdiction || 'Not specified'}

2. Obligations

The Receiving Party agrees to:
- Maintain strict confidentiality of all disclosed information
- Use the information solely for the stated purpose
- Not reproduce or distribute the confidential information
- Return all materials upon request

3. Term

This agreement shall remain in effect for ${formData.duration || 'the specified duration'} from the date of signing.

4. Governing Law

This agreement shall be governed by the laws of ${formData.jurisdiction || 'the specified jurisdiction'}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_________________________     _________________________
${formData.disclosingParty}     ${formData.receivingParty}
Disclosing Party              Receiving Party`;

        setGeneratedDocument(sampleDocument);
        setIsGenerating(false);
        setShowDocument(true);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedDocument);
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const downloadDocument = () => {
        const element = document.createElement('a');
        const file = new Blob([generatedDocument], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${formData.documentType}_Agreement.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const steps = [
        { number: 1, title: 'Select Document Type', active: currentStep >= 1 },
        { number: 2, title: 'Enter Details', active: currentStep >= 2 },
        { number: 3, title: 'Generate Document', active: currentStep >= 3 }
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="flex justify-center mb-4">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full shadow-lg">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
                            Generate Legal Document
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Create professional legal documents with AI assistance in minutes
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="flex justify-center items-center space-x-4 md:space-x-8">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${step.active
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                        : 'bg-white border-gray-300 text-gray-400'
                                        }`}>
                                        {step.active && currentStep > step.number ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <span className="font-semibold">{step.number}</span>
                                        )}
                                    </div>
                                    <div className="ml-3 hidden md:block">
                                        <p className={`text-sm font-medium ${step.active ? 'text-gray-800' : 'text-gray-400'}`}>
                                            {step.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-8 md:w-16 h-0.5 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Form */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 backdrop-blur-sm border border-gray-100">
                            {/* Step 1: Document Type Selection */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                                    Select Document Type
                                </h2>
                                <div className="relative">
                                    <select
                                        value={formData.documentType}
                                        onChange={(e) => {
                                            handleInputChange('documentType', e.target.value);
                                            setCurrentStep(Math.max(currentStep, 2));
                                        }}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 appearance-none bg-white text-gray-800 font-medium shadow-sm hover:shadow-md"
                                    >
                                        {documentTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Step 2: Enter Details */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                                    Enter Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Disclosing Party
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.disclosingParty}
                                            onChange={(e) => {
                                                handleInputChange('disclosingParty', e.target.value);
                                                setCurrentStep(Math.max(currentStep, 2));
                                            }}
                                            placeholder="Enter disclosing party name"
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Receiving Party
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.receivingParty}
                                            onChange={(e) => {
                                                handleInputChange('receivingParty', e.target.value);
                                                setCurrentStep(Math.max(currentStep, 2));
                                            }}
                                            placeholder="Enter receiving party name"
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Purpose
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.purpose}
                                            onChange={(e) => handleInputChange('purpose', e.target.value)}
                                            placeholder="e.g., Business collaboration"
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Duration
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.duration}
                                            onChange={(e) => handleInputChange('duration', e.target.value)}
                                            placeholder="e.g., 2 years"
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Jurisdiction
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.jurisdiction}
                                            onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                                            placeholder="e.g., California"
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        setCurrentStep(3);
                                        generateDocument();
                                    }}
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto min-w-48"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Generate Document
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Generated Document */}
                    {showDocument && (
                        <div className="max-w-4xl mx-auto mt-12 animate-fade-in">
                            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 backdrop-blur-sm border border-gray-100">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                                        Generated Document
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={downloadDocument}
                                            className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-green-700 transition-all duration-200 flex items-center"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-200 flex items-center"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy Text
                                        </button>
                                        <button className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-purple-700 transition-all duration-200 flex items-center">
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Edit
                                        </button>
                                        <button className="bg-gray-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all duration-200 flex items-center">
                                            <Save className="w-4 h-4 mr-2" />
                                            Save to
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border-2 border-gray-100">
                                    <pre className="whitespace-pre-wrap text-sm md:text-base text-gray-800 font-mono leading-relaxed">
                                        {generatedDocument}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
            </div>
        </>
    );
};

export default LegalDocumentGenerator;