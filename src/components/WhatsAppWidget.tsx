// src/components/WhatsAppWidget.tsx
import { useState, useEffect, useRef } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
    const widgetRef = useRef<HTMLDivElement>(null);

    // WhatsApp agents data
    const agents = [
        {
            id: 1,
            name: 'Sales Agent',
            number: '237XXXXXXXXX', // Cameroon
            description: 'For product inquiries and orders',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        {
            id: 2,
            name: 'Support Agent',
            number: '237YYYYYYYYY', // Cameroon
            description: 'For technical support and issues',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        {
            id: 3,
            name: 'International Agent',
            number: '336XXXXXXXX', // France
            description: 'For international customers',
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
        },
        {
            id: 4,
            name: 'Delivery Agent',
            number: '237ZZZZZZZZZ', // Cameroon
            description: 'For delivery questions',
            avatar: 'https://randomuser.me/api/portraits/men/75.jpg'
        }
    ];

    const defaultMessage = 'Hello, I have a question about Son Cadeau';

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAgent === null) return;

        const agent = agents.find(a => a.id === selectedAgent);
        if (!agent) return;

        const encodedMessage = encodeURIComponent(message || defaultMessage);
        window.open(`https://wa.me/${agent.number}?text=${encodedMessage}`, '_blank');
        setIsOpen(false);
        setMessage('');
    };

    const handleAgentSelect = (agentId: number) => {
        setSelectedAgent(agentId);
    };

    return (
        <div
            ref={widgetRef}
            className="fixed bottom-6 right-6 z-50"
        >
            {/* Widget button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen ? 'rotate-45' : 'rotate-0'
                    }`}
                aria-label="Chat on WhatsApp"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </button>

            {/* Chat box */}
            <div className={`absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
                }`}>
                <div className="bg-green-500 text-white p-4">
                    <h3 className="font-bold text-lg">Chat with our team</h3>
                    <p className="text-sm">Select an agent to help you</p>
                </div>

                {/* Agent selection */}
                {selectedAgent === null ? (
                    <div className="p-4 space-y-3">
                        {agents.map((agent) => (
                            <button
                                key={agent.id}
                                onClick={() => handleAgentSelect(agent.id)}
                                className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                            >
                                <img
                                    src={agent.avatar}
                                    alt={agent.name}
                                    className="w-10 h-10 rounded-full object-cover mr-3"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">{agent.name}</p>
                                    <p className="text-xs text-gray-500">{agent.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="flex items-center mb-4">
                            <button
                                type="button"
                                onClick={() => setSelectedAgent(null)}
                                className="mr-2 text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {agents.find(a => a.id === selectedAgent)?.name}
                                </p>
                                <p className="text-xs text-gray-500">WhatsApp</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="whatsapp-message" className="block text-sm font-medium text-gray-700 mb-2">
                                Your message
                            </label>
                            <textarea
                                id="whatsapp-message"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder={defaultMessage}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Send Message
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default WhatsAppWidget;