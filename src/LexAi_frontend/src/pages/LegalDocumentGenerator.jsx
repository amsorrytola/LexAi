import React, { useState, useEffect } from 'react';
import { ChevronDown, FileText, Download, Copy, Edit3, Save, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { useUserStore } from '../store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LegalDocumentGenerator = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        documentType: '',
        disclosingParty: '',
        receivingParty: '',
        purpose: '',
        duration: '',
        jurisdiction: '',
        effectiveDate: '',
        confidentialInformation: '',
        nonCompete: '',
        remedies: '',
        employer: '',
        employee: '',
        position: '',
        salary: '',
        startDate: '',
        benefits: '',
        termination: '',
        serviceProvider: '',
        client: '',
        serviceDescription: '',
        paymentTerms: '',
        deliverables: '',
        partner1: '',
        partner2: '',
        profitSharing: '',
        responsibilities: '',
        disputeResolution: '',
        landlord: '',
        tenant: '',
        propertyAddress: '',
        rentAmount: '',
        securityDeposit: '',
        maintenance: '',
        seller: '',
        buyer: '',
        itemService: '',
        purchasePrice: '',
        deliveryDate: '',
        warranties: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDocument, setGeneratedDocument] = useState('');
    const [showDocument, setShowDocument] = useState(false);
    const [documentTypes, setDocumentTypes] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

    const { actor, isAuthenticated } = useUserStore();

    // Define fields for each document type with user-friendly labels
    const documentFields = {
        NDA: [
            { key: 'disclosingParty', label: 'Disclosing Party', placeholder: 'Enter disclosing party name', type: 'text' },
            { key: 'receivingParty', label: 'Receiving Party', placeholder: 'Enter receiving party name', type: 'text' },
            { key: 'purpose', label: 'Purpose', placeholder: 'e.g., Business collaboration', type: 'text' },
            { key: 'duration', label: 'Duration', placeholder: 'e.g., 2 years', type: 'text' },
            { key: 'jurisdiction', label: 'Jurisdiction', placeholder: 'e.g., California', type: 'text' },
            { key: 'effectiveDate', label: 'Effective Date', placeholder: 'e.g., 2025-07-13', type: 'date' },
            { key: 'confidentialInformation', label: 'Confidential Information', placeholder: 'e.g., Trade secrets, financial data', type: 'textarea' },
            { key: 'nonCompete', label: 'Non-Compete Clause', placeholder: 'e.g., 1 year post-termination', type: 'text' },
            { key: 'remedies', label: 'Remedies', placeholder: 'e.g., Injunction, damages', type: 'text' }
        ],
        Employment: [
            { key: 'employer', label: 'Employer', placeholder: 'Enter employer name', type: 'text' },
            { key: 'employee', label: 'Employee', placeholder: 'Enter employee name', type: 'text' },
            { key: 'position', label: 'Position', placeholder: 'e.g., Software Engineer', type: 'text' },
            { key: 'duration', label: 'Duration', placeholder: 'e.g., Permanent', type: 'text' },
            { key: 'jurisdiction', label: 'Jurisdiction', placeholder: 'e.g., California', type: 'text' },
            { key: 'salary', label: 'Salary', placeholder: 'e.g., $100,000/year', type: 'text' },
            { key: 'startDate', label: 'Start Date', placeholder: 'e.g., 2025-07-13', type: 'date' },
            { key: 'benefits', label: 'Benefits', placeholder: 'e.g., Health insurance, 401(k)', type: 'textarea' },
            { key: 'termination', label: 'Termination Conditions', placeholder: 'e.g., 30 days notice', type: 'text' }
        ],
        Service: [
            { key: 'serviceProvider', label: 'Service Provider', placeholder: 'Enter service provider name', type: 'text' },
            { key: 'client', label: 'Client', placeholder: 'Enter client name', type: 'text' },
            { key: 'serviceDescription', label: 'Service Description', placeholder: 'e.g., Web development services', type: 'textarea' },
            { key: 'duration', label: 'Duration', placeholder: 'e.g., 6 months', type: 'text' },
            { key: 'jurisdiction', label: 'Jurisdiction', placeholder: 'e.g., California', type: 'text' },
            { key: 'paymentTerms', label: 'Payment Terms', placeholder: 'e.g., $5000 upon completion', type: 'text' },
            { key: 'startDate', label: 'Start Date', placeholder: 'e.g., 2025-07-13', type: 'date' },
            { key: 'deliverables', label: 'Deliverables', placeholder: 'e.g., Website, documentation', type: 'textarea' },
            { key: 'termination', label: 'Termination Clause', placeholder: 'e.g., 14 days notice', type: 'text' }
        ],
        Partnership: [
            { key: 'partner1', label: 'Partner 1', placeholder: 'Enter first partner name', type: 'text' },
            { key: 'partner2', label: 'Partner 2', placeholder: 'Enter second partner name', type: 'text' },
            { key: 'purpose', label: 'Purpose', placeholder: 'e.g., Joint venture', type: 'text' },
            { key: 'duration', label: 'Duration', placeholder: 'e.g., 5 years', type: 'text' },
            { key: 'jurisdiction', label: 'Jurisdiction', placeholder: 'e.g., India', type: 'text' },
            { key: 'profitSharing', label: 'Profit Sharing', placeholder: 'e.g., 70/30 split (Partner 1/Partner 2)', type: 'text' },
            { key: 'effectiveDate', label: 'Effective Date', placeholder: 'e.g., 2025-07-13', type: 'date' },
            { key: 'responsibilities', label: 'Responsibilities', placeholder: 'e.g., Partner 1: Operations, Partner 2: Finance', type: 'textarea' },
            { key: 'disputeResolution', label: 'Dispute Resolution', placeholder: 'e.g., Arbitration', type: 'text' }
        ],
        Rental: [
            { key: 'landlord', label: 'Landlord', placeholder: 'Enter landlord name', type: 'text' },
            { key: 'tenant', label: 'Tenant', placeholder: 'Enter tenant name', type: 'text' },
            { key: 'propertyAddress', label: 'Property Address', placeholder: 'e.g., 123 Main St, CA', type: 'text' },
            { key: 'duration', label: 'Duration', placeholder: 'e.g., 1 year', type: 'text' },
            { key: 'jurisdiction', label: 'Jurisdiction', placeholder: 'e.g., California', type: 'text' },
            { key: 'rentAmount', label: 'Rent Amount', placeholder: 'e.g., $2000/month', type: 'text' },
            { key: 'startDate', label: 'Start Date', placeholder: 'e.g., 2025-07-13', type: 'date' },
            { key: 'securityDeposit', label: 'Security Deposit', placeholder: 'e.g., $4000', type: 'text' },
            { key: 'maintenance', label: 'Maintenance Terms', placeholder: 'e.g., Tenant responsible for utilities', type: 'textarea' }
        ],
        Purchase: [
            { key: 'seller', label: 'Seller', placeholder: 'Enter seller name', type: 'text' },
            { key: 'buyer', label: 'Buyer', placeholder: 'Enter buyer name', type: 'text' },
            { key: 'itemService', label: 'Item/Service', placeholder: 'e.g., Office equipment', type: 'text' },
            { key: 'duration', label: 'Duration', placeholder: 'e.g., One-time purchase', type: 'text' },
            { key: 'jurisdiction', label: 'Jurisdiction', placeholder: 'e.g., California', type: 'text' },
            { key: 'purchasePrice', label: 'Purchase Price', placeholder: 'e.g., $10,000', type: 'text' },
            { key: 'deliveryDate', label: 'Delivery Date', placeholder: 'e.g., 2025-07-20', type: 'date' },
            { key: 'paymentTerms', label: 'Payment Terms', placeholder: 'e.g., Full payment on delivery', type: 'text' },
            { key: 'warranties', label: 'Warranties', placeholder: 'e.g., 1-year warranty', type: 'text' }
        ]
    };

    // User-friendly labels for dropdown
    const documentTypeLabels = {
        NDA: 'Non-Disclosure Agreement',
        Employment: 'Employment Contract',
        Service: 'Service Agreement',
        Partnership: 'Partnership Agreement',
        Rental: 'Rental Agreement',
        Purchase: 'Purchase Agreement'
    };

    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoadingTemplates(true);
            setErrorMessage('');
            console.log('Actor:', actor);
            console.log('isAuthenticated:', isAuthenticated);

            // Fallback to local document types if not authenticated
            if (!actor || !isAuthenticated) {
                console.log('Actor or authentication not available:', { actor, isAuthenticated });
                setErrorMessage('Please log in to access document generation.');
                const fallbackTypes = Object.keys(documentFields).map(key => ({
                    value: key,
                    label: documentTypeLabels[key] || key
                }));
                setDocumentTypes(fallbackTypes);
                setFormData(prev => ({ ...prev, documentType: fallbackTypes[0]?.value || '' }));
                setIsLoadingTemplates(false);
                return;
            }

            try {
                console.log('Fetching templates...');
                const templates = await Promise.race([
                    actor.list_templates(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Template fetch timeout')), 5000))
                ]);
                console.log('Templates received:', templates);

                // Validate templates format
                if (!Array.isArray(templates) || templates.some(([id, name]) => typeof id !== 'string' || typeof name !== 'string')) {
                    throw new Error('Invalid template format received from backend');
                }

                const mappedTemplates = templates.map(([id, name]) => ({ value: id, label: name }));
                console.log('Mapped templates:', mappedTemplates);

                setDocumentTypes(mappedTemplates.length > 0
                    ? mappedTemplates
                    : Object.keys(documentFields).map(key => ({
                        value: key,
                        label: documentTypeLabels[key] || key
                    }))
                );

                if (mappedTemplates.length > 0) {
                    setFormData(prev => ({ ...prev, documentType: mappedTemplates[0].value }));
                } else {
                    setErrorMessage('No templates available from backend. Using default types.');
                    setFormData(prev => ({ ...prev, documentType: Object.keys(documentFields)[0] || '' }));
                }
            } catch (error) {
                console.error('Error fetching templates:', error);
                setErrorMessage('Failed to load document types. Using default types. Please refresh or contact support.');
                setDocumentTypes(Object.keys(documentFields).map(key => ({
                    value: key,
                    label: documentTypeLabels[key] || key
                })));
                setFormData(prev => ({ ...prev, documentType: Object.keys(documentFields)[0] || '' }));
            } finally {
                setIsLoadingTemplates(false);
            }
        };

        fetchTemplates();
    }, [actor, isAuthenticated]);

    // Validate formData.documentType
    useEffect(() => {
        console.log('Current documentTypes:', documentTypes);
        console.log('Current formData.documentType:', formData.documentType);
        if (documentTypes.length > 0 && !documentTypes.some(type => type.value === formData.documentType)) {
            console.log('Resetting documentType to:', documentTypes[0]?.value || '');
            setFormData(prev => ({ ...prev, documentType: documentTypes[0]?.value || '' }));
        }
    }, [documentTypes, formData.documentType]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateDocument = async () => {
        if (!actor || !isAuthenticated) {
            console.error('Not authenticated or actor not available');
            setErrorMessage('Please log in to generate a document.');
            return;
        }

        setIsGenerating(true);
        setErrorMessage('');
        try {
            const requiredFields = documentFields[formData.documentType] || [];
            for (const field of requiredFields) {
                if (!formData[field.key]) {
                    setErrorMessage(`Please fill in ${field.label}.`);
                    setIsGenerating(false);
                    return;
                }
            }

            const fields = requiredFields.map(field => [field.key, formData[field.key]]);
            console.log('Generating document with template:', formData.documentType, 'fields:', fields);
            const documentId = await actor.generate_document(formData.documentType, fields);
            console.log('Document ID received:', documentId);

            if (documentId && typeof documentId === 'string' && documentId.startsWith('doc_')) {
                const documentText = await actor.get_document(documentId);
                console.log('Document text received:', documentText);
                let text = documentText;
                if (Array.isArray(documentText)) {
                    text = documentText[0] || '';
                }
                if (text && typeof text === 'string') {
                    if (text.includes('[Specify]') || text.includes('Error')) {
                        setErrorMessage('Generated document is incomplete. Please try again or contact support.');
                        setIsGenerating(false);
                        return;
                    }
                    setGeneratedDocument(text);
                    setShowDocument(true);
                } else {
                    console.error('Document text is invalid or not found:', documentText);
                    setErrorMessage('Failed to retrieve the generated document. Please try again.');
                }
            } else {
                console.error('Invalid document ID or generation failed:', documentId);
                setErrorMessage('Failed to generate document. Template may not exist.');
            }
        } catch (error) {
            console.error('Error generating document:', error);
            setErrorMessage('An error occurred while generating the document. Please try again.');
        }
        setIsGenerating(false);
    };

    const copyToClipboard = async () => {
        if (!generatedDocument || typeof generatedDocument !== 'string') {
            setErrorMessage('No document available to copy.');
            return;
        }
        try {
            await navigator.clipboard.writeText(generatedDocument);
            setErrorMessage('Document copied to clipboard!');
            setTimeout(() => setErrorMessage(''), 5000);
        } catch (err) {
            console.error('Failed to copy:', err);
            setErrorMessage('Failed to copy document. Please try again.');
        }
    };

    const downloadDocument = () => {
        if (!generatedDocument || typeof generatedDocument !== 'string') {
            setErrorMessage('No document available to download.');
            return;
        }
    
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
    
        // Colors and margins
        const primaryColor = [0, 51, 102]; // Dark blue
        const secondaryColor = [100, 100, 100]; // Gray
        const margin = 20;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const maxWidth = pageWidth - 2 * margin;
    
        // Cover Page
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(...primaryColor);
        const title = `${formData.documentType || 'Legal'} Agreement`.toUpperCase();
        doc.text(title, pageWidth / 2, 40, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(...primaryColor);
        doc.line(margin, 45, pageWidth - margin, 45); // Horizontal rule
    
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Effective Date: ${formData.effectiveDate || today}`, margin, 60);
    
        // Parties table on cover page
        const parties = Object.entries(formData)
            .filter(([key]) => key.includes('partner') || key.includes('party') || key.includes('employer') || key.includes('employee') || key.includes('landlord') || key.includes('tenant') || key.includes('seller') || key.includes('buyer'))
            .map(([key, value]) => ({ key: key.charAt(0).toUpperCase() + key.slice(1), value }))
            .filter(({ value }) => value);
    
        if (parties.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('Parties Involved:', margin, 80);
            try {
                autoTable(doc, {
                    startY: 85,
                    head: [['Role', 'Name']],
                    body: parties.map(({ key, value }) => [key, value]),
                    theme: 'grid',
                    styles: { font: 'times', fontSize: 12, textColor: [0, 0, 0], cellPadding: 2 },
                    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
                    margin: { left: margin, right: margin }
                });
            } catch (error) {
                console.error('Error rendering table:', error);
                setErrorMessage('Failed to render parties table in PDF. Rendering as text instead.');
                let y = 85;
                doc.setFont('times', 'normal');
                doc.setFontSize(12);
                parties.forEach(({ key, value }) => {
                    doc.text(`${key}: ${value}`, margin, y);
                    y += 6;
                });
            }
        }
    
        // Watermark on cover page
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        doc.text('Generated by LexAI', pageWidth / 2, pageHeight - 20, { align: 'center', angle: 45 });
    
        doc.addPage();
    
        // Document Content
        let y = margin;
        const sections = generatedDocument.split('\n\n').filter(section => section.trim());
    
        sections.forEach((section, index) => {
            const isHeading = section.match(/^\d+\.\s/) || section.match(/^[A-Z\s]+$/);
            const isSignature = section.includes('Signature') || section.includes('Partner') || section.includes('Printed Name') || section.toLowerCase().includes('witness');
    
            if (isHeading) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(...primaryColor);
                const cleanSection = section.replace(/\*\*/g, '').trim();
                doc.text(cleanSection, margin, y, { maxWidth });
                doc.line(margin, y + 1, margin + doc.getTextWidth(cleanSection), y + 1); // Underline
                y += 12;
            } else if (isSignature) {
                // Add extra space before signature section
                if (y > pageHeight - 50) {
                    doc.addPage();
                    y = margin;
                } else {
                    y += 10; // Extra spacing
                }
                doc.setFont('courier', 'normal');
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                const lines = doc.splitTextToSize(section, maxWidth);
                lines.forEach(line => {
                    if (y > pageHeight - margin - 15) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(line, margin, y);
                    y += 8;
                });
                // Enhanced signature block
                if (section.includes('Signature')) {
                    doc.setLineWidth(0.3);
                    doc.line(margin, y, margin + 50, y);
                    doc.text('Signature', margin, y + 5);
                    doc.line(margin + 60, y, margin + 110, y);
                    doc.text('Date', margin + 60, y + 5);
                    y += 15;
                }
            } else {
                doc.setFont('times', 'normal');
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                const lines = doc.splitTextToSize(section, maxWidth);
                lines.forEach(line => {
                    if (y > pageHeight - margin - 15) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text(line, margin, y, { lineHeightFactor: 1.15 });
                    y += 6;
                });
                y += 6;
            }
        });
    
        // Add header, footer, and watermark to all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            // Header
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(...primaryColor);
            doc.text(title, margin, 10);
            doc.setLineWidth(0.3);
            doc.line(margin, 12, pageWidth - margin, 12);
    
            // Footer
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(...secondaryColor);
            const pageNum = i === 1 ? 'I' : i - 1;
            doc.text(`Page ${pageNum} of ${pageCount - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text('Generated by LexAI', margin, pageHeight - 10);
    
            // Watermark
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(200, 200, 200);
            doc.text('Generated by LexAI', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
        }
    
        doc.save(`${formData.documentType || 'Document'}_Agreement.pdf`);
    };

    const steps = [
        { number: 1, title: 'Select Document Type', active: currentStep >= 1 },
        { number: 2, title: 'Enter Details', active: currentStep >= 2 },
        { number: 3, title: 'Generate Document', active: currentStep >= 3 }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-5xl">
                {/* Header */}
                <div className="text-center mb-12 animate-slide-in-top">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                            <div className="relative bg-white p-4 rounded-full shadow-2xl ring-2 ring-indigo-200">
                                <FileText className="w-10 h-10 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight animate-fade-in">
                        Create Legal Documents
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
                        Effortlessly generate professional legal documents with AI-powered precision in just a few clicks.
                    </p>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 text-red-800 rounded-2xl shadow-md animate-slide-in-top">
                        <span className="font-medium">{errorMessage}</span>
                    </div>
                )}

                {/* Stepper */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="flex justify-center items-center space-x-4 sm:space-x-8">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center animate-slide-in-left" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 transform hover:scale-110 ${step.active
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-indigo-600 text-white shadow-lg'
                                    : 'bg-white border-gray-300 text-gray-400'
                                    }`}>
                                    {step.active && currentStep > step.number ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : (
                                        <span className="font-semibold">{step.number}</span>
                                    )}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-30 rounded-full transition-opacity duration-300"></div>
                                </div>
                                <div className="ml-3 hidden sm:block">
                                    <p className={`text-sm font-semibold ${step.active ? 'text-gray-900' : 'text-gray-400'} transition-colors duration-300`}>
                                        {step.title}
                                    </p>
                                </div>
                                {step.number < steps.length && (
                                    <div className={`w-8 sm:w-16 h-1 mx-4 transition-all duration-500 ${currentStep > step.number ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="max-w-4xl mx-auto animate-slide-in-bottom">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 backdrop-blur-lg border border-gray-100/50">
                        {/* Document Type Selection */}
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
                                    disabled={!isAuthenticated || !actor}
                                >
                                    {documentTypes.length === 0 && (
                                        <option value="" disabled>Loading templates...</option>
                                    )}
                                    
                                    {documentTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                                Enter Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {(documentFields[formData.documentType] || []).map((field, index) => (
                                    <div key={field.key} className={`${field.type === 'textarea' ? 'sm:col-span-2' : ''} group animate-slide-in-bottom`} style={{ animationDelay: `${index * 0.05}s` }}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                            {field.label}
                                            <span className="text-red-500 ml-1">*</span>
                                            <span className="ml-2 text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {field.placeholder}
                                            </span>
                                        </label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                value={formData[field.key] || ''}
                                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="w-full p-4 bg-gradient-to-br from-white to-blue-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 shadow-sm hover:shadow-lg resize-y min-h-[120px] text-gray-800"
                                                required
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={formData[field.key] || ''}
                                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="w-full p-4 bg-gradient-to-br from-white to-blue-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 shadow-sm hover:shadow-lg text-gray-800"
                                                required
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="text-center">
                            <button
                                onClick={() => {
                                    setCurrentStep(3);
                                    generateDocument();
                                }}
                                disabled={isGenerating || !formData.documentType}
                                className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto min-w-48 group"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                                        Generate Document
                                    </>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300"></div>
                            </button>
                        </div>

                        
                    </div>
                </div>

                {/* Generated Document */}
                {showDocument && (
                    <div className="max-w-4xl mx-auto mt-12 animate-slide-in-bottom">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 backdrop-blur-lg border border-gray-100/50">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                                    Generated Document
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={downloadDocument}
                                        className="relative bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-green-700 hover:to-teal-700 transform hover:-translate-y-1 transition-all duration-300 group flex items-center"
                                    >
                                        <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                                        Download PDF
                                        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Save as PDF
                                        </span>
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-1 transition-all duration-300 group flex items-center"
                                    >
                                        <Copy className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                                        Copy Text
                                        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Copy to Clipboard
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDocument(false);
                                            setCurrentStep(2);
                                        }}
                                        className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-1 transition-all duration-300 group flex items-center"
                                    >
                                        <Edit3 className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                                        Edit
                                        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Edit Details
                                        </span>
                                    </button>
                                    <button
                                        className="relative bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-900 transform hover:-translate-y-1 transition-all duration-300 group flex items-center"
                                    >
                                        <Save className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                                        Save to Profile
                                        <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Save Document
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border-2 border-gray-100 shadow-inner">
                                <pre className="whitespace-pre-wrap text-sm sm:text-base text-gray-800 font-serif leading-relaxed">
                                    {generatedDocument}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slide-in-top {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-in-bottom {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-in-left {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slide-in-top {
                    animation: slide-in-top 0.6s ease-out forwards;
                }

                .animate-slide-in-bottom {
                    animation: slide-in-bottom 0.6s ease-out forwards;
                }

                .animate-slide-in-left {
                    animation: slide-in-left 0.6s ease-out forwards;
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }

                .animate-fade-in-delay {
                    animation: fade-in 0.8s ease-out 0.2s forwards;
                }
            `}</style>
        </div>
    );
};

export default LegalDocumentGenerator;