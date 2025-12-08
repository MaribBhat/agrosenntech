import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I am your Saffron cultivation assistant. Ask me about soil moisture, nutrient management, growth stages, or any farming concerns.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateResponse(input),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const generateResponse = (query: string): string => {
    const lower = query.toLowerCase();

    if (lower.includes('moisture')) {
      return 'For saffron cultivation, maintain soil moisture between 35-75%. Too low risks wilting, too high causes corm rot. Check both sensors regularly.';
    }
    if (lower.includes('temperature')) {
      return 'Saffron thrives in cool conditions. During vegetative stage (Dec-Apr), maintain 10-20°C. Dormancy (May-Sep) needs 25°C+. Flowering (Oct-Nov) requires <15°C.';
    }
    if (lower.includes('nutrient') || lower.includes('npk')) {
      return 'Optimal ranges for saffron: Nitrogen 10-15 ppm, Phosphorus 8-12 ppm, Potassium 12-18 ppm. Avoid fertilizing during flowering to protect blossoms.';
    }
    if (lower.includes('flower') || lower.includes('bloom')) {
      return 'Flowering stage is critical. Avoid any major disturbances. Do not apply nitrogen-heavy fertilizers. Maintain consistent moisture and protect from temperature extremes.';
    }
    if (lower.includes('irrigation')) {
      return 'Water when moisture drops below 35%. Early morning irrigation is best. Avoid overhead watering during flowering. Monitor both soil sensors.';
    }

    return 'I can help with moisture management, nutrient planning, growth stage identification, irrigation scheduling, and general cultivation advice. What specific aspect would you like to know more about?';
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-24px)] bg-white rounded-lg shadow-xl flex flex-col max-h-96">
          {/* Header */}
          <div className="bg-amber-600 text-white px-4 py-3 rounded-t-lg font-semibold flex items-center justify-between">
            <span>Saffron Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-amber-700 p-1 rounded transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about farming..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
