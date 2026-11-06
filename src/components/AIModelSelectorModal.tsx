import React from 'react';
import { Cpu, Check, Sparkles, Zap, ShieldCheck, X } from 'lucide-react';

interface AIModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export const AI_MODELS = [
  {
    id: 'auto',
    name: 'Tự động chuyển (Khuyên dùng)',
    badge: 'Khuyến nghị',
    description: 'Tự động xoay tua sang model tốt nhất nếu bị nghẽn mạng hoặc giới hạn.',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    badge: 'Siêu nhanh',
    description: 'Tốc độ phản hồi cực nhanh (1s), trò chuyện mượt mà tức thì.',
    icon: Zap,
    color: 'from-amber-500 to-rose-500',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Sáng tạo',
    description: 'Văn phong tiểu thuyết tinh tế, ngọt ngào sâu sắc.',
    icon: Cpu,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    badge: 'Pro Cao cấp',
    description: 'Trí tuệ cao cấp nhất, thấu hiểu tâm lý và cảm xúc phức tạp.',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-500',
  },
];

export const AIModelSelectorModal: React.FC<AIModelSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-pink-200 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-pink-100 text-pink-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-pink-950">Chọn Model AI Cho Tấn Vũ</h3>
              <p className="text-xs text-pink-600">Thay đổi mô hình trí tuệ nhân tạo đáp lời bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-pink-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Models List */}
        <div className="mt-4 space-y-2.5">
          {AI_MODELS.map((model) => {
            const Icon = model.icon;
            const isSelected = selectedModel === model.id;

            return (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3 relative cursor-pointer ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50/90 ring-2 ring-pink-400/50 shadow-md'
                    : 'border-pink-100 hover:border-pink-300 hover:bg-pink-50/40 bg-white'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${model.color} shadow-sm flex-shrink-0 mt-0.5`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">{model.name}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                      {model.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{model.description}</p>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-5 pt-3 border-t border-pink-100 text-center text-[11px] text-pink-600 italic">
          💡 Bạn có thể tự do đổi Model AI bất kỳ lúc nào để có trải nghiệm tuyệt vời nhất.
        </div>
      </div>
    </div>
  );
};
