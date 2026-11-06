import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import { 
  MessageCircleHeart, 
  PhoneCall, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  KeyRound,
  ArrowLeft,
  X,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface HomeScreenProps {
  characters: Character[];
  activeCharacter: Character;
  onSelectCharacter: (id: string) => void;
  onOpenChat: () => void;
  onOpenCall: () => void;
  onOpenAdmin: (passcode: string) => boolean;
  onBackToWelcome: () => void;
  onOpenProfile?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  characters,
  activeCharacter,
  onSelectCharacter,
  onOpenChat,
  onOpenCall,
  onOpenAdmin,
  onBackToWelcome,
  onOpenProfile,
}) => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Handle countdown when locked out after 3 failed attempts
  useEffect(() => {
    let timer: any = null;
    if (isLocked && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isLocked && countdown <= 0) {
      setIsLocked(false);
      setFailedAttempts(0);
      setCountdown(60);
      setPasscodeError('');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, countdown]);

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    if (!passcodeInput.trim()) {
      setPasscodeError('Vui lòng tự nhập mã quản trị viên');
      return;
    }

    const success = onOpenAdmin(passcodeInput.trim());
    if (success) {
      sounds.playChime();
      setShowAdminModal(false);
      setPasscodeInput('');
      setPasscodeError('');
      setFailedAttempts(0);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLocked(true);
        setCountdown(60);
        setPasscodeError('⚠️ Bạn đã nhập sai 3 lần! Mục quản trị viên bị tạm khóa trong 60 giây.');
      } else {
        const remaining = 3 - newAttempts;
        setPasscodeError(`Mã không chính xác! Bạn còn ${remaining} lần thử.`);
      }
    }
  };

  const handleSendQuickHeart = () => {
    sounds.playSparkle();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fda4af', '#f43f5e'],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 text-slate-800 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Navigation */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pb-3 border-b border-pink-200/60">
        <button
          onClick={onBackToWelcome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-pink-700 text-xs font-semibold shadow-xs transition active:scale-95 border border-pink-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Màn hình mở đầu</span>
        </button>

        {/* Clean Admin & User Profile Bow button */}
        <div className="flex items-center gap-2">
          {onOpenProfile && (
            <button
              onClick={() => {
                sounds.playPop();
                onOpenProfile();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-sm transition active:scale-95 border border-pink-300 cursor-pointer"
              title="Thiết lập trang cá nhân của bạn (Nơ màu hồng 🎀)"
            >
              <span className="text-sm leading-none">🎀</span>
              <span>Trang cá nhân</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playPop();
              setShowAdminModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-pink-800 text-xs font-bold shadow-xs transition active:scale-95 border border-pink-200"
          >
            <Lock className="w-3.5 h-3.5 text-pink-600" />
            <span>Quản trị viên</span>
          </button>
        </div>
      </div>

      {/* Main Character Hub Card */}
      <div className="max-w-xl mx-auto w-full my-auto py-3">
        {/* If multiple characters exist, show tabs */}
        {characters.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <span className="text-[11px] font-bold text-pink-700 whitespace-nowrap">Chọn nhân vật:</span>
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  sounds.playPop();
                  onSelectCharacter(c.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap shadow-xs ${
                  c.id === activeCharacter.id
                    ? 'bg-pink-600 text-white shadow-pink-300'
                    : 'bg-white/80 text-pink-800 hover:bg-white border border-pink-200'
                }`}
              >
                <img src={c.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Hero Card of the Character with Full Long Animation Picture */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-pink-200/90 relative overflow-hidden text-center">
          {/* Subtle gradient banner glow */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-pink-200/60 to-transparent pointer-events-none" />

          {/* Full Vertical Animation Portrait ("để y nguyên hình dài") */}
          <div className="relative inline-block mb-4 z-10 w-56 sm:w-64 max-w-full">
            <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white shadow-xl shadow-pink-300/60 bg-pink-100 mx-auto relative group">
              <img
                src={activeCharacter.avatar}
                alt={activeCharacter.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            </div>

            <button
              onClick={handleSendQuickHeart}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg active:scale-90 transition hover:shadow-pink-400 hover:shadow-xl"
              title="Thả tim cho Tấn Vũ"
            >
              <Heart className="w-5 h-5 fill-white animate-pulse" />
            </button>
          </div>

          {/* Name & Title */}
          <div className="relative z-10 space-y-1 mb-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-900 font-['Comfortaa',sans-serif]">
              {activeCharacter.name}
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200">
              <span>{activeCharacter.gender === 'Nam' ? 'Bạn trai nũng nịu' : 'Người yêu cưng chiều'}</span>
              <span>•</span>
              <span>{activeCharacter.age} tuổi</span>
            </div>
          </div>

          {/* Trạng thái hiển thị ở ngoài: Chỉ hiển thị trạng thái đang đợi bảo bối về ôm, không hiển thị tin nhắn nhân vật */}
          <div className="mt-2 mb-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-50/90 border border-pink-200 text-xs sm:text-sm font-bold text-pink-700 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>{activeCharacter.moodTag || 'Đang đợi bảo bối về ôm 🥺💕'}</span>
          </div>

          {/* Two Main Feature Buttons: Nhắn Tin & Gọi Thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 z-10 relative">
            {/* Nhắn Tin */}
            <button
              onClick={() => {
                sounds.playPop();
                onOpenChat();
              }}
              className="group p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-pink-300 transition active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <MessageCircleHeart className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span>Nhắn Tin Với Anh</span>
            </button>

            {/* Gọi Thoại */}
            <button
              onClick={() => {
                sounds.playPop();
                onOpenCall();
              }}
              className="group p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-300 transition active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <PhoneCall className="w-5 h-5 text-white group-hover:scale-110 transition-transform animate-pulse" />
              <span>Gọi Thoại Cho Anh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-xl mx-auto w-full text-center text-xs text-pink-700/80 pt-2">
        Nhà sáng tạo <strong>'sirynaahn'</strong> • Dành cho nhân vật Tấn Vũ 💕
      </div>

      {/* Admin Passcode Modal (NO CODE DISPLAYED, MAXIMUM 3 ATTEMPTS) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-sm shadow-2xl border-2 border-pink-200 relative animate-scaleUp text-slate-800">
            <button
              onClick={() => {
                setShowAdminModal(false);
                setPasscodeError('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-pink-100 text-pink-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-pink-900">Mục Quản Trị Viên</h3>
              <p className="text-xs text-pink-600 mt-1">
                Khu vực quản lý nhân vật & prompt tính cách
              </p>
            </div>

            <form onSubmit={handleAdminVerify} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-pink-800 block mb-1">
                  Nhập mã quản trị viên:
                </label>
                <input
                  type="password"
                  autoFocus
                  disabled={isLocked}
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    if (!isLocked) setPasscodeError('');
                  }}
                  placeholder={isLocked ? `Đang khóa... (${countdown}s)` : 'Tự nhập mã vào...'}
                  className={`w-full px-4 py-3 rounded-2xl border text-center tracking-widest font-mono text-base transition ${
                    isLocked
                      ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                      : 'border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/50 uppercase'
                  }`}
                />

                {passcodeError && (
                  <div className={`text-xs font-semibold mt-2 text-center p-2 rounded-xl flex items-center justify-center gap-1.5 ${
                    isLocked 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}>
                    {isLocked && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    <span>{passcodeError}</span>
                  </div>
                )}

                {!isLocked && failedAttempts > 0 && failedAttempts < 3 && (
                  <p className="text-[11px] text-amber-600 font-medium text-center mt-1">
                    Cảnh báo: Nhập sai 3 lần sẽ bị khóa!
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-sm font-semibold transition"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isLocked}
                  className={`flex-1 py-2.5 rounded-2xl text-white text-sm font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 ${
                    isLocked
                      ? 'bg-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLocked ? `Khóa (${countdown}s)` : 'Xác nhận'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
