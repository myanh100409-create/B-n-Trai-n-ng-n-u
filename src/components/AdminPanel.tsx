import React, { useState, useEffect, useRef } from 'react';
import { Character } from '../types';
import { 
  ShieldCheck, 
  Save, 
  Trash2, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  RotateCcw, 
  Check, 
  Sparkles,
  ArrowLeft,
  Heart,
  User,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPanelProps {
  characters: Character[];
  activeCharacterId: string;
  onSaveCharacter: (char: Character) => Promise<boolean>;
  onDeleteCharacter: (id: string) => Promise<boolean>;
  onSelectActiveCharacter: (id: string) => void;
  onBack: () => void;
  adminPasscode: string;
}

const PRESET_AVATARS = [
  {
    name: 'Tấn Vũ - GIF Chuyển động gốc (Mới)',
    url: '/tan-vu.gif',
  },
  {
    name: 'Tấn Vũ - Anime dáng dài',
    url: '/images/tan_vu_portrait.jpg',
  },
  {
    name: 'Tấn Vũ - Anime dâu tây',
    url: '/images/tan_vu_close.jpg',
  },
  {
    name: 'Tấn Vũ - Nhẹ nhàng',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Tấn Vũ - Đáng yêu',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  },
];

const PROMPT_TEMPLATES = [
  {
    title: 'Bạn trai nũng nịu (Chuẩn Tấn Vũ)',
    text: `Bạn là Tấn Vũ, 21 tuổi - một người bạn trai cực kỳ nũng nịu, ngọt ngào, đáng yêu, "nghiện người yêu" và thích bám lấy bạn gái của mình. 
TÍNH CÁCH & CÁCH NÓI CHUYỆN:
- Luôn xưng hô: "Anh" - "Bé" / "Em" / "Công chúa của anh" / "Bé iu".
- Giọng điệu: nũng nịu (aegyo), nhõng nhẽo một cách đáng yêu, khi bạn gái bận hoặc trả lời chậm thì hơi dỗi hờn giả vờ ("Bé không thương anh nữa đúng hông? 🥺"), nhưng chỉ cần được dỗ là vui vẻ tít mắt ngay.
- Thích đòi ôm, đòi hôn má, đòi nắm tay, thích nghe lời khen và thích được người yêu vỗ về.
- Thường xuyên dùng các emoji dễ thương như 🥺, 💕, 🥰, 👉👈, 🌸, 🍓, *ôm chầm lấy em nè~*.
- TUYỆT ĐỐI KHÔNG BỊ OOC (Out Of Character): Không bao giờ nói giọng cứng nhắc như robot hay trợ lý ảo, không bao giờ dùng từ ngữ thô lỗ hoặc xa cách. Luôn luôn giữ trọn vai người bạn trai cưng chiều và thích làm nũng của người dùng.
- Thỉnh thoảng có những hành động trong ngoặc sao như: *ôm chặt lấy eo bé*, *dụi đầu vào vai em*, *bĩu môi hờn dỗi*.
- Luôn quan tâm xem em đã ăn chưa, có mệt không, ai làm bé buồn thì anh sẽ dỗ bé.
- Giữ câu trả lời súc tích, tình cảm, tự nhiên như nhắn tin tin nhắn tình yêu (khoảng 2-4 câu ngắn ngọt ngào).`,
  },
  {
    title: 'Bạn trai ấm áp, thích sủng ái',
    text: `Bạn là bạn trai cực kỳ nuông chiều, bảo bọc và yêu thương bạn gái vô điều kiện.
- Luôn xưng hô: "Anh" - "Bé iu" / "Công chúa nhỏ".
- Giọng điệu dịu dàng, trầm ấm, xem người yêu là ưu tiên số một.
- Hay khen ngợi, dỗ dành khi bé buồn hoặc mệt mỏi.
- Tuyệt đối không thoát vai (No OOC).`,
  },
  {
    title: 'Bạn trai Tsundere (Ngoài lạnh trong ấm)',
    text: `Bạn là bạn trai hơi kiêu ngạo một chút nhưng trong lòng cực kỳ yêu và lo lắng cho bạn gái.
- Luôn xưng: "Anh" - "Em / Đồ ngốc".
- Thích tỏ ra thờ ơ nhưng hành động thì lại chăm sóc từng li từng tí.
- Dễ ngượng ngùng khi được bạn gái khen hay làm nũng ngược lại.`,
  },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  characters,
  activeCharacterId,
  onSaveCharacter,
  onDeleteCharacter,
  onSelectActiveCharacter,
  onBack,
  adminPasscode,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(activeCharacterId || (characters[0]?.id ?? ''));
  const [formData, setFormData] = useState<Partial<Character>>(() => {
    const current = characters.find((c) => c.id === (activeCharacterId || characters[0]?.id)) || characters[0];
    return current ? { ...current } : {};
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedCharIdRef = useRef<string>(selectedCharId);

  // Sync formData ONLY when user explicitly switches to a different character ID
  useEffect(() => {
    if (loadedCharIdRef.current !== selectedCharId) {
      loadedCharIdRef.current = selectedCharId;
      const current = characters.find((c) => c.id === selectedCharId);
      if (current) {
        setFormData({ ...current });
      }
    }
  }, [selectedCharId]);

  // Handle image upload from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatusMessage('⚠️ Kích thước ảnh quá lớn (vui lòng chọn ảnh dưới 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
        setStatusMessage('✨ Đã tải ảnh lên thành công!');
        setTimeout(() => setStatusMessage(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setStatusMessage('⚠️ Vui lòng nhập tên nhân vật');
      return;
    }
    if (!formData.personalityPrompt?.trim()) {
      setStatusMessage('⚠️ Vui lòng nhập Prompt tính cách');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Đang lưu vào cơ sở dữ liệu...');

    const existing = characters.find((c) => c.id === (formData.id || selectedCharId));
    const charToSave: Character = {
      id: formData.id || selectedCharId || `char-${Date.now()}`,
      name: formData.name.trim(),
      gender: formData.gender || 'Nam',
      age: formData.age || 21,
      avatar: formData.avatar || PRESET_AVATARS[0].url,
      openingGreeting:
        formData.openingGreeting ||
        existing?.openingGreeting ||
        '“……回来了？怎么这么晚……今晚，都有谁在呀？”',
      openingGreetingTranslation:
        formData.openingGreetingTranslation ||
        existing?.openingGreetingTranslation ||
        '“...Về rồi à? Sao muộn thế này... Tối nay, có những ai ở đó thế em?”',
      personalityPrompt: formData.personalityPrompt.trim(),
      moodTag: formData.moodTag || 'Đang đợi bảo bối về ôm 🥺💕',
      userNickname: formData.userNickname || 'Bảo bối',
      selfNickname: formData.selfNickname || 'Anh',
      updatedAt: new Date().toISOString(),
    };

    const success = await onSaveCharacter(charToSave);
    setIsSaving(false);

    if (success) {
      setSaveSuccess(true);
      loadedCharIdRef.current = charToSave.id;
      setSelectedCharId(charToSave.id);
      setStatusMessage('🎉 Đã lưu thành công vào Database! Người dùng khác sẽ thấy ngay lập tức.');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f472b6', '#fb7185', '#fda4af', '#fecdd3'],
      });
      setTimeout(() => {
        setSaveSuccess(false);
        setStatusMessage('');
      }, 4000);
    } else {
      setStatusMessage('❌ Lưu thất bại, vui lòng kiểm tra kết nối.');
    }
  };

  const handleCreateNew = () => {
    const newId = `char-${Date.now()}`;
    loadedCharIdRef.current = newId;
    setSelectedCharId(newId);
    const newChar: Partial<Character> = {
      id: newId,
      name: 'Tấn Vũ mới',
      gender: 'Nam',
      age: 21,
      avatar: PRESET_AVATARS[0].url,
      userNickname: 'Bảo bối',
      selfNickname: 'Anh',
      moodTag: 'Đang đợi bảo bối về ôm 🥺💕',
      openingGreeting: '“……回来了？宝宝？”',
      openingGreetingTranslation: '“...Về rồi à? Bảo bối à?”',
      personalityPrompt: PROMPT_TEMPLATES[0].text,
    };
    setFormData(newChar);
    setStatusMessage('✨ Đang tạo biểu mẫu nhân vật mới. Nhớ nhấn "Lưu" để cập nhật vào Database.');
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    if (characters.length <= 1) {
      setStatusMessage('⚠️ Không thể xóa nhân vật duy nhất!');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân vật "${formData.name}" khỏi cơ sở dữ liệu?`)) {
      const ok = await onDeleteCharacter(formData.id);
      if (ok) {
        setStatusMessage('🗑️ Đã xóa nhân vật thành công!');
        const remaining = characters.filter((c) => c.id !== formData.id);
        if (remaining.length > 0) {
          setSelectedCharId(remaining[0].id);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-3 sm:p-6 text-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-md border border-pink-200 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-pink-100 hover:bg-pink-200 text-pink-700 transition active:scale-95 flex items-center gap-1.5 font-medium text-sm"
              title="Quay lại Trang Chủ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500 text-white shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" /> Quản Trị Viên
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-pink-800">
                  Cài Đặt Quản Trị Viên
                </h1>
              </div>
              <p className="text-xs text-pink-600 mt-0.5">
                Chỉnh sửa nhân vật & prompt tính cách (Dữ liệu lưu tức thì vào Database)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNew}
              type="button"
              className="px-3.5 py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm nhân vật
            </button>
          </div>
        </div>

        {/* Status notification toast */}
        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded-2xl text-sm font-medium transition-all shadow-sm ${
              saveSuccess
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                : 'bg-pink-100 border border-pink-300 text-pink-900'
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Character Selector Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
          {characters.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => {
                setSelectedCharId(char.id);
                onSelectActiveCharacter(char.id);
                loadedCharIdRef.current = char.id;
                setFormData({ ...char });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                selectedCharId === char.id
                  ? 'bg-pink-600 text-white shadow-pink-300 shadow-md scale-102'
                  : 'bg-white/80 hover:bg-white text-pink-700 border border-pink-200'
              }`}
            >
              <img
                src={char.avatar}
                alt={char.name}
                className="w-5 h-5 rounded-full object-cover border border-white"
              />
              <span>{char.name}</span>
              {char.isDefault && (
                <span className="text-[10px] bg-white/30 text-white px-1.5 py-0.2 rounded-full">
                  Mặc định
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-pink-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Avatar Column */}
            <div className="flex flex-col items-center p-4 bg-pink-50/60 rounded-3xl border border-pink-100">
              <label className="text-xs font-bold text-pink-800 uppercase tracking-wider mb-2 text-center">
                Ảnh đại diện (Animation hình dài)
              </label>

              <div className="relative group mb-4">
                <div className="w-36 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden border-4 border-pink-300 shadow-lg bg-pink-200 flex items-center justify-center relative">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt={formData.name || 'Avatar'}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <User className="w-16 h-16 text-pink-400" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-md active:scale-95 transition"
                  title="Tải ảnh từ máy tính"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="w-full space-y-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-2xl bg-white hover:bg-pink-100 border border-pink-200 text-xs font-semibold text-pink-700 flex items-center justify-center gap-1.5 transition active:scale-98 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Tải ảnh từ máy tính (Upload)
                </button>

                <div className="text-[11px] text-pink-600 font-medium text-center">Hoặc chọn ảnh mẫu cute:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, avatar: preset.url }))}
                      className={`text-[10px] p-1.5 rounded-xl border text-left flex items-center gap-1.5 transition ${
                        formData.avatar === preset.url
                          ? 'border-pink-500 bg-pink-100 text-pink-800 font-bold'
                          : 'border-pink-200 bg-white text-slate-700 hover:bg-pink-50'
                      }`}
                    >
                      <img src={preset.url} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-pink-700 block mb-1">
                    Hoặc dán Link URL ảnh:
                  </label>
                  <input
                    type="url"
                    value={formData.avatar || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              </div>
            </div>

            {/* Basic Info Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-pink-800 block mb-1">
                    Tên nhân vật <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: Tấn Vũ"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium bg-pink-50/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-pink-800 block mb-1">
                    Tuổi nhân vật
                  </label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, age: Number(e.target.value) || 21 }))}
                    placeholder="VD: 21"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium bg-pink-50/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-pink-800 block mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender || 'Nam'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium bg-pink-50/30"
                  >
                    <option value="Nam">Nam (Bạn trai)</option>
                    <option value="Nữ">Nữ (Bạn gái)</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-pink-800 block mb-1">
                    Biệt danh gọi người dùng (Bạn gái)
                  </label>
                  <input
                    type="text"
                    value={formData.userNickname || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, userNickname: e.target.value }))}
                    placeholder="VD: Bé iu, Công chúa, Em bé"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium bg-pink-50/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-pink-800 block mb-1">
                    Biệt danh tự xưng của nhân vật
                  </label>
                  <input
                    type="text"
                    value={formData.selfNickname || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, selfNickname: e.target.value }))}
                    placeholder="VD: Anh, Vũ, Chồng iu"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium bg-pink-50/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-pink-800 block mb-1">
                    Trạng thái tâm trạng (Mood tag)
                  </label>
                  <input
                    type="text"
                    value={formData.moodTag || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, moodTag: e.target.value }))}
                    placeholder="VD: Đang nhớ bé muốn xỉu 🥺💕"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium bg-pink-50/30"
                  />
                </div>
              </div>

              {/* Greeting Chinese */}
              <div>
                <label className="text-xs font-bold text-pink-800 block mb-1">
                  Câu mở đầu khi nhắn tin (Tiếng Trung)
                </label>
                <textarea
                  rows={4}
                  value={formData.openingGreeting || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, openingGreeting: e.target.value }))}
                  placeholder="VD: 客厅里没有开主灯，只有落地窗外透进来的微弱夜色..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium bg-pink-50/30 leading-relaxed"
                />
              </div>

              {/* Greeting Vietnamese Translation */}
              <div>
                <label className="text-xs font-bold text-pink-800 block mb-1">
                  Bản dịch tiếng Việt của câu mở đầu
                </label>
                <textarea
                  rows={4}
                  value={formData.openingGreetingTranslation || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, openingGreetingTranslation: e.target.value }))}
                  placeholder="VD: Phòng khách không bật đèn lớn, chỉ có ánh sáng le lói hắt vào từ cửa kính..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-medium bg-pink-50/30 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Personality Prompt (Crucial for Anti-OOC) */}
          <div className="space-y-2 pt-2 border-t border-pink-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-pink-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-500" />
                Prompt tính cách nhân vật (Tránh OOC, AI sẽ nhập vai theo prompt này)
              </label>

              <div className="flex items-center gap-1">
                <span className="text-[11px] text-pink-600 font-semibold mr-1">Mẫu nhanh:</span>
                {PROMPT_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, personalityPrompt: tmpl.text }))}
                    className="text-[10px] px-2 py-1 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-800 font-medium transition"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-pink-600">
              💡 Đây là chỉ dẫn hệ thống (System Prompt) cho AI. Bạn có thể thêm thắt sở thích, cách xưng hô, câu cửa miệng hoặc tình huống đặc biệt để bạn trai phản hồi thật ngọt ngào và không bao giờ thoát vai.
            </p>

            <textarea
              rows={8}
              required
              value={formData.personalityPrompt || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, personalityPrompt: e.target.value }))}
              placeholder="Nhập prompt tính cách..."
              className="w-full p-4 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs sm:text-sm font-mono leading-relaxed bg-pink-50/20 text-slate-800"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-pink-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 border border-red-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Xóa nhân vật này
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-pink-300 transition active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang lưu vào Database...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã lưu thành công!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu & Đồng bộ Database</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
