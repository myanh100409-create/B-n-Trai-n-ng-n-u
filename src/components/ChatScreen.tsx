import React, { useState, useRef, useEffect } from 'react';
import { Character, ChatMessage, UserProfile } from '../types';
import { 
  Send, 
  Phone, 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  RotateCcw, 
  Smile, 
  Volume2, 
  VolumeX,
  ShieldCheck,
  CheckCheck,
  Languages,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { sounds, speakChineseMaleVoice, stopTanVuVoice } from '../utils/audio';
import confetti from 'canvas-confetti';
import { AIModelSelectorModal, AI_MODELS } from './AIModelSelectorModal';

interface ChatScreenProps {
  character: Character;
  userProfile?: UserProfile;
  onBack: () => void;
  onStartCall: () => void;
  onOpenAdmin: () => void;
  onOpenProfile?: () => void;
}

const QUICK_ACTIONS = [
  { label: 'Dỗ anh nè', icon: '🥺', prompt: '*xoa xoa má anh* Ngoan nào, em thương anh nhất mà, không được dỗi nữa nha~' },
  { label: 'Ôm một cái', icon: '🤗', prompt: '*chạy lại ôm chặt lấy cổ anh* Em ôm anh nè, người yêu em thơm quá à!' },
  { label: 'Cho kẹo dâu', icon: '🍓', prompt: '*đút cho anh một viên kẹo dâu ngọt ngào* Cho bé bự của em ăn kẹo nè, có ngọt bằng em hông?' },
  { label: 'Hôn má', icon: '😘', prompt: '*kiễng chân thơm một cái chóc lên má anh* Thưởng cho anh nè, yêu anh nhìu!' },
  { label: 'Xoa đầu', icon: '💆', prompt: '*nhẹ nhàng xoa đầu anh* Bé của em ngoan ghê, để em cưng em nựng nè~' },
  { label: 'Bé thương anh nhất', icon: '💖', prompt: 'Anh ơi, trên đời này em thương mỗi một mình anh thôi đó!' },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  character,
  userProfile,
  onBack,
  onStartCall,
  onOpenAdmin,
  onOpenProfile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [affectionScore, setAffectionScore] = useState(88);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('selected_ai_model') || 'auto';
  });
  const [showModelModal, setShowModelModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const storageKey = `chat_history_${character.id}`;

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    try {
      localStorage.setItem('selected_ai_model', modelId);
    } catch {}
  };

  // Load chat history or initialize with opening greeting
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Initial greeting with Chinese text and dedicated Vietnamese translation
        const initialGreeting: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'character',
          text: character.openingGreeting,
          translation: character.openingGreetingTranslation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([initialGreeting]);
      }
    } catch {
      // fallback
    }
  }, [character.id, character.openingGreeting, character.openingGreetingTranslation]);

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {
        // quota exceeded fallback
      }
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    if (!textToSend) {
      setInputText('');
    }

    if (soundEnabled) {
      sounds.playPop();
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    // Increase affection slightly
    setAffectionScore((prev: number) => Math.min(100, prev + 2));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          messages: newMessages,
          userMessage: text,
          userProfile,
          selectedModel,
        }),
      });

      const data = await response.json();
      const reply = data.reply || '“……宝宝，我想你啦，快理理我好不好……”';
      const translation = data.translation || '“...Bảo bối à, anh nhớ em rồi, mau để ý đến anh có được không...”';

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'character',
        text: reply,
        translation: translation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev: ChatMessage[]) => [...prev, botMsg]);

      if (soundEnabled) {
        sounds.playChime();
      }

      // If user unlocked 100% affection, celebrate!
      if (affectionScore >= 98) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f472b6', '#fda4af', '#f43f5e'],
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Fallback
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'character',
        text: `*ôm chặt lấy eo bé* ${character.userNickname || 'Bé iu'} ơi, anh nghe nè... Đừng rời xa anh nha! 🥺💕`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev: ChatMessage[]) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (actionPrompt: string) => {
    sounds.playSparkle();
    handleSendMessage(actionPrompt);
  };

  const handleClearHistory = () => {
    if (window.confirm('Bé có muốn làm mới cuộc trò chuyện với anh không nè?')) {
      const initialGreeting: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'character',
        text: character.openingGreeting,
        translation: character.openingGreetingTranslation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialGreeting]);
      localStorage.removeItem(storageKey);
      setAffectionScore(88);
    }
  };

  // Helper to format actions in italic pastel pills
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        const actionText = part.slice(1, -1);
        return (
          <span
            key={index}
            className="inline-block bg-pink-100/80 text-pink-700 font-medium italic text-xs px-2 py-0.5 rounded-lg mx-1 my-0.5 border border-pink-200/50 shadow-xs"
          >
            ✦ {actionText}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-pink-50/60 overflow-hidden">
      {/* Top Header Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-pink-200 px-3 sm:px-6 py-3 flex items-center justify-between shadow-xs z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 transition active:scale-95"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-10 h-13 rounded-2xl overflow-hidden border-2 border-pink-300 shadow-sm bg-pink-100">
              <img
                src={character.avatar}
                alt={character.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-pink-900 leading-tight">
                {character.name}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold border border-pink-200">
                {character.age} tuổi
              </span>
            </div>
            <p className="text-[11px] text-pink-600 font-medium truncate max-w-[180px] sm:max-w-xs">
              {character.moodTag || 'Đang chờ bé dỗ 🥺'}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Model Selector Button */}
          <button
            onClick={() => {
              sounds.playPop();
              setShowModelModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 shadow-xs transition active:scale-95 cursor-pointer"
            title="Đổi Model AI (Gemini 3.6 / 3.8 / Pro)"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">
              {selectedModel === 'auto'
                ? 'AI Auto'
                : selectedModel.replace('gemini-', '').replace('-preview', '')}
            </span>
          </button>

          {/* Pink Bow Button for User Profile Setup */}
          {onOpenProfile && (
            <button
              onClick={() => {
                sounds.playPop();
                onOpenProfile();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-bold border border-pink-300 shadow-xs transition active:scale-95 cursor-pointer"
              title="Trang cá nhân của bạn (Nơ màu hồng 🎀)"
            >
              <span className="text-base leading-none">🎀</span>
              <span className="hidden md:inline">Trang cá nhân</span>
            </button>
          )}

          {/* Quick Call Button */}
          <button
            onClick={() => {
              sounds.playPop();
              onStartCall();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-300 transition active:scale-95"
            title="Gọi thoại cho Tấn Vũ"
          >
            <Phone className="w-4 h-4 fill-white animate-pulse" />
            <span className="hidden sm:inline">Gọi cho anh</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-2xl hover:bg-pink-100 text-pink-600 transition"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Clear / Reset Chat Button */}
          <button
            onClick={() => {
              sounds.playPop();
              handleClearHistory();
            }}
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-2xl sm:rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold border border-pink-200 transition active:scale-95 cursor-pointer"
            title="Reset toàn bộ tin nhắn trò chuyện"
          >
            <RotateCcw className="w-4 h-4 text-pink-600" />
            <span className="hidden lg:inline">Reset tin nhắn</span>
          </button>
        </div>
      </header>

      {/* Affection Progress Bar */}
      <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 px-4 py-1.5 border-b border-pink-200/60 flex items-center justify-between text-[11px] font-semibold text-pink-700">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 animate-bounce" />
          <span>Độ ngọt ngào: <strong className="text-pink-900">{affectionScore}%</strong></span>
        </div>
        <div className="w-32 sm:w-48 bg-white/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-pink-200 shadow-inner">
          <div
            className="bg-gradient-to-r from-pink-400 to-rose-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${affectionScore}%` }}
          />
        </div>
        <span className="text-[10px] text-pink-500 hidden sm:inline">
          {affectionScore > 90 ? 'Anh nghiện bé quá rồi nè! 💕' : 'Cưng chiều anh thêm xíu nha~'}
        </span>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg: ChatMessage) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-10 rounded-xl overflow-hidden border border-pink-300 shadow-xs flex-shrink-0 mb-1">
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-md flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-pink-200/80 rounded-bl-xs'
                  }`}
                >
                  {/* Chinese text for character / user message */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="whitespace-pre-wrap leading-relaxed font-normal flex-1">
                      {renderMessageContent(msg.text)}
                    </div>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => speakChineseMaleVoice(msg.text)}
                        className="p-1 rounded-full text-pink-400 hover:text-pink-600 hover:bg-pink-50 transition active:scale-90 flex-shrink-0"
                        title="Nghe giọng anh đọc tiếng Trung"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dedicated Vietnamese translation line underneath */}
                  {!isUser && msg.translation && (
                    <div className="mt-3 pt-2.5 border-t border-pink-100 bg-pink-50/80 -mx-1.5 -mb-1.5 p-2.5 rounded-2xl text-xs sm:text-sm text-pink-900 leading-relaxed">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-pink-600 mb-1">
                        <Languages className="w-3.5 h-3.5" />
                        <span>Dịch tiếng Việt:</span>
                      </div>
                      <div className="whitespace-pre-wrap italic">
                        {renderMessageContent(msg.translation)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-pink-400">
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="w-3 h-3 text-pink-400" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2.5 justify-start">
            <div className="w-8 h-10 rounded-xl overflow-hidden border border-pink-300 flex-shrink-0">
              <img
                src={character.avatar}
                alt={character.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="bg-white border border-pink-200 px-4 py-3 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-pink-500 font-medium ml-1">
                {character.name} đang nũng nịu gõ...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Affection Actions Carousel */}
      <div className="bg-white/90 backdrop-blur-md border-t border-pink-100 px-3 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-[11px] font-bold text-pink-600 flex items-center gap-1 whitespace-nowrap pl-1 pr-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            Dỗ anh:
          </span>
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(action.prompt)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 active:scale-95 text-pink-800 text-xs font-semibold whitespace-nowrap border border-pink-200 shadow-xs transition"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Message Input */}
      <div className="bg-white p-3 sm:p-4 border-t border-pink-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Nhắn gì đó ngọt ngào cho ${character.name} đi mà... 💌`}
            className="flex-1 px-4 py-3 rounded-full border border-pink-200 bg-pink-50/40 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-300 disabled:opacity-40 transition active:scale-95 cursor-pointer flex-shrink-0"
            title="Gửi tin nhắn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* AI Model Selector Modal */}
      <AIModelSelectorModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
      />
    </div>
  );
};
