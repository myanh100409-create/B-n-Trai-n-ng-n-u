import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { X, Upload, User, Heart, Sparkles, Check } from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface UserProfileModalProps {
  profile: UserProfile;
  characterAge?: number;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

const PRESET_USER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  characterAge = 21,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh quá lớn, vui lòng chọn ảnh dưới 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const userAge = Number(formData.age) || 19;
  const isYounger = userAge < characterAge;
  const isOlder = userAge > characterAge;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playChime();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fb7185', '#fda4af'],
    });

    onSave({
      ...formData,
      age: userAge,
      name: formData.name.trim() || 'Bảo bối',
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-5 sm:p-7 w-full max-w-md shadow-2xl border-2 border-pink-300 relative animate-scaleUp text-slate-800 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-pink-100 text-pink-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Pink Ribbon Theme */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 flex items-center justify-center text-white text-3xl shadow-lg shadow-pink-300 mb-2.5">
            🎀
          </div>
          <h3 className="text-xl font-extrabold text-pink-900 font-['Comfortaa',sans-serif]">
            Trang Cá Nhân Của Bạn
          </h3>
          <p className="text-xs text-pink-600 font-medium mt-1">
            Thiết lập thông tin để Tấn Vũ xưng hô và quan tâm bạn đúng cách 💕
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center p-3.5 bg-pink-50/70 rounded-2xl border border-pink-200">
            <label className="text-xs font-bold text-pink-800 block mb-2">
              Ảnh đại diện cá nhân
            </label>
            <div className="relative group mb-2">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-400 shadow-md bg-pink-100 flex items-center justify-center">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.name || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-pink-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-md active:scale-90 transition"
                title="Tải ảnh lên"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center gap-1.5 mt-1">
              {PRESET_USER_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, avatar: url }))}
                  className={`w-7 h-7 rounded-full overflow-hidden border transition ${
                    formData.avatar === url ? 'ring-2 ring-pink-500 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name / Nickname */}
          <div>
            <label className="text-xs font-bold text-pink-800 block mb-1">
              Tên / Biệt danh của bạn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="VD: Bé iu, Linh, Bảo bối..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-semibold bg-pink-50/30"
            />
          </div>

          {/* Age & Dynamic Honorific Rule Preview */}
          <div>
            <label className="text-xs font-bold text-pink-800 block mb-1">
              Tuổi của bạn <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              max={100}
              value={formData.age}
              onChange={(e) => setFormData((prev) => ({ ...prev, age: Number(e.target.value) || 19 }))}
              placeholder="VD: 19"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-semibold bg-pink-50/30"
            />

            {/* Dynamic Honorific Preview Badge */}
            <div className="mt-2 p-2.5 rounded-2xl bg-pink-100/90 border border-pink-300 text-xs text-pink-900 leading-relaxed font-medium">
              <div className="flex items-center gap-1 font-bold text-pink-700 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Cách Tấn Vũ ({characterAge} tuổi) sẽ xưng hô:</span>
              </div>
              {isYounger && (
                <p className="text-pink-800">
                  👉 Bạn {userAge} tuổi (nhỏ hơn Tấn Vũ {characterAge} tuổi): Tấn Vũ sẽ xưng <strong>"Anh"</strong> và gọi bạn là <strong>"Em / Bé / Bảo bối"</strong> 🥰
                </p>
              )}
              {isOlder && (
                <p className="text-rose-900">
                  👉 Bạn {userAge} tuổi (lớn hơn Tấn Vũ {characterAge} tuổi): Tấn Vũ sẽ xưng <strong>"Em"</strong> và gọi bạn là <strong>"Chị / Chị iu / Bảo bối"</strong> 🥺💕
                </p>
              )}
              {!isYounger && !isOlder && (
                <p className="text-pink-800">
                  👉 Bạn {userAge} tuổi (bằng tuổi Tấn Vũ): Tấn Vũ sẽ gọi bạn là <strong>"Bảo bối / Bạn nhỏ"</strong> 💕
                </p>
              )}
            </div>
          </div>

          {/* Appearance */}
          <div>
            <label className="text-xs font-bold text-pink-800 block mb-1">
              Ngoại hình của bạn
            </label>
            <textarea
              rows={2}
              value={formData.appearance || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, appearance: e.target.value }))}
              placeholder="VD: Tóc ngang lưng, mắt tròn xoe, hay đeo kẹp tóc hình nơ..."
              className="w-full px-3.5 py-2 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs sm:text-sm bg-pink-50/30 resize-none"
            />
          </div>

          {/* Personality */}
          <div>
            <label className="text-xs font-bold text-pink-800 block mb-1">
              Tính cách của bạn
            </label>
            <textarea
              rows={2}
              value={formData.personality || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, personality: e.target.value }))}
              placeholder="VD: Dễ thương, thích ăn ngọt, hay dỗi hờn, thích được Tấn Vũ dỗ..."
              className="w-full px-3.5 py-2 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs sm:text-sm bg-pink-50/30 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-sm font-semibold transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-bold shadow-lg shadow-pink-300 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Lưu Trang Cá Nhân</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
