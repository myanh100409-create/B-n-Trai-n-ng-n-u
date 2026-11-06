import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  X,
  MessageCircleHeart,
  PhoneCall,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface WelcomeScreenProps {
  character: Character;
  onStart: () => void;
  onEnterAdmin: (passcode: string) => boolean;
  onOpenProfile?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  character,
  onStart,
  onEnterAdmin,
  onOpenProfile,
}) => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
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
      setCodeError('');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked, countdown]);

  const handleStartApp = () => {
    sounds.playSparkle();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fb7185', '#fda4af', '#fecdd3', '#ffffff'],
    });
    onStart();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    if (!adminCodeInput.trim()) {
      setCodeError('Vui lòng tự nhập mã quản trị viên');
      return;
    }

    const success = onEnterAdmin(adminCodeInput.trim());
    if (success) {
      sounds.playChime();
      setShowAdminModal(false);
      setAdminCodeInput('');
      setCodeError('');
      setFailedAttempts(0);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsLocked(true);
        setCountdown(60);
        setCodeError('⚠️ Bạn đã nhập sai 3 lần! Mục quản trị viên bị tạm khóa trong 60 giây.');
      } else {
        const remaining = 3 - newAttempts;
        setCodeError(`Mã không chính xác! Bạn còn ${remaining} lần thử.`);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-pink-100 via-rose-100 to-pink-200 flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
      {/* Decorative cute floating elements */}
      <div className="absolute top-10 left-8 text-pink-300 animate-bounce duration-1000 opacity-60 pointer-events-none text-2xl">
        🌸
      </div>
      <div className="absolute top-24 right-10 text-pink-400 animate-pulse opacity-70 pointer-events-none text-3xl">
        💖
      </div>
      <div className="absolute bottom-28 left-12 text-rose-300 opacity-60 pointer-events-none text-2xl">
        🍓
      </div>
      <div className="absolute bottom-16 right-16 text-pink-400 animate-bounce duration-700 opacity-70 pointer-events-none text-2xl">
        ✨
      </div>

      {/* Top Bar with Discreet Admin Entrance and Pink Bow Profile Button */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-2 px-1">
        {onOpenProfile ? (
          <button
            onClick={() => {
              sounds.playPop();
              onOpenProfile();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-md transition active:scale-95 border border-pink-300 cursor-pointer"
            title="Trang cá nhân của bạn (Nơ màu hồng 🎀)"
          >
            <span className="text-base leading-none">🎀</span>
            <span>Trang cá nhân</span>
          </button>
        ) : <div />}

        <button
          onClick={() => {
            sounds.playPop();
            setShowAdminModal(true);
          }}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-pink-700 hover:text-pink-900 border border-pink-200 shadow-sm text-xs font-semibold transition active:scale-95 backdrop-blur-sm"
        >
          <Lock className="w-3.5 h-3.5 text-pink-500 group-hover:scale-110 transition" />
          <span>Quản trị viên</span>
        </button>
      </div>

      {/* Main Center Content */}
      <div className="flex flex-col items-center text-center my-auto w-full max-w-md z-10 py-4">
        {/* Full Long Vertical Animation Artwork ("để y nguyên hình dài") */}
        <div className="relative mb-4 w-52 sm:w-60 max-w-full">
          <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-pink-300/60 bg-pink-100 ring-4 ring-pink-300/40 relative group">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="px-3 py-1 rounded-full bg-pink-500/90 text-white text-xs font-bold shadow-md backdrop-blur-sm">
                {character.name} • {character.age} tuổi
              </span>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-2.5 rounded-full shadow-lg animate-pulse">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
        </div>

        {/* Big requested Title */}
        <div className="space-y-1 mb-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-pink-700 drop-shadow-sm font-['Comfortaa',sans-serif]">
            bạn trai nũng nịu
          </h1>
          {/* Creator Attribution */}
          <div className="inline-block px-4 py-1 rounded-full bg-white/80 border border-pink-200 shadow-sm mt-1 backdrop-blur-sm">
            <p className="text-xs sm:text-sm font-semibold text-pink-600 tracking-wide">
              nhà sáng tạo <span className="font-bold text-pink-800">'sirynaahn'</span>
            </p>
          </div>
        </div>

        {/* Trạng thái hiển thị ở ngoài: Chỉ hiển thị trạng thái đang đợi bảo bối về ôm, không hiển thị tin nhắn nhân vật */}
        <div className="mt-3 mb-6 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-pink-200 shadow-sm inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-pink-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>{character.moodTag || 'Đang đợi bảo bối về ôm 🥺💕'}</span>
        </div>

        {/* Big Start Button */}
        <button
          onClick={handleStartApp}
          className="group relative w-full max-w-xs py-4 px-8 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-lg sm:text-xl shadow-xl shadow-pink-400/50 hover:shadow-pink-400/80 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 overflow-hidden cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-200 animate-spin duration-3000" />
            <span>Bắt đầu</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>

        {/* Two quick feature hints */}
        <div className="flex items-center justify-center gap-4 mt-5 text-xs font-semibold text-pink-700">
          <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-pink-200 shadow-xs">
            <MessageCircleHeart className="w-3.5 h-3.5 text-pink-500" />
            <span>Nhắn tin tình cảm</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-pink-200 shadow-xs">
            <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
            <span>Gọi thoại trực tiếp</span>
          </div>
        </div>
      </div>

      {/* Footer Attribution note */}
      <div className="w-full text-center text-[11px] text-pink-600/80 py-2">
        Dành riêng cho nhân vật Tấn Vũ • Sáng tạo bởi sirynaahn 💕
      </div>

      {/* Admin Passcode Modal (NO CODE DISPLAYED, MAXIMUM 3 ATTEMPTS) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-sm shadow-2xl border-2 border-pink-200 relative animate-scaleUp">
            <button
              onClick={() => {
                setShowAdminModal(false);
                setCodeError('');
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
                Khu vực bảo mật riêng cho quản trị viên hệ thống
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-pink-800 block mb-1">
                  Nhập mã quản trị viên:
                </label>
                <input
                  type="password"
                  autoFocus
                  disabled={isLocked}
                  value={adminCodeInput}
                  onChange={(e) => {
                    setAdminCodeInput(e.target.value);
                    if (!isLocked) setCodeError('');
                  }}
                  placeholder={isLocked ? `Đang khóa... (${countdown}s)` : 'Tự nhập mã vào...'}
                  className={`w-full px-4 py-3 rounded-2xl border text-center tracking-widest font-mono text-base transition ${
                    isLocked
                      ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                      : 'border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-pink-50/50 uppercase'
                  }`}
                />

                {/* Error / Attempt count / Lockout alert */}
                {codeError && (
                  <div className={`text-xs font-semibold mt-2 text-center p-2 rounded-xl flex items-center justify-center gap-1.5 ${
                    isLocked 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}>
                    {isLocked && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    <span>{codeError}</span>
                  </div>
                )}

                {!isLocked && failedAttempts > 0 && failedAttempts < 3 && (
                  <p className="text-[11px] text-amber-600 font-medium text-center mt-1">
                    Cảnh báo: Nhập sai 3 lần sẽ bị khóa!
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
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
