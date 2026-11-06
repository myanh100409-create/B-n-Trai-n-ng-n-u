import React, { useState, useRef, useEffect } from 'react';
import { Character, UserProfile } from '../types';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Heart, 
  Sparkles, 
  Send, 
  RotateCcw,
  Languages,
  Radio,
  Video,
  VideoOff,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Maximize2
} from 'lucide-react';
import { sounds, speakChineseMaleVoice, stopTanVuVoice } from '../utils/audio';

interface CallScreenProps {
  character: Character;
  userProfile?: UserProfile;
  onEndCall: () => void;
}

interface CallDialogue {
  chinese: string;
  pinyin?: string;
  vietnamese: string;
}

const DEFAULT_FIRST_DIALOGUE: CallDialogue = {
  chinese: '“……喂？宝宝？”',
  pinyin: '“...Wèi? Bǎobèi?”',
  vietnamese: '“...Alo? Bảo bối à?”',
};

export const CallScreen: React.FC<CallScreenProps> = ({
  character,
  userProfile,
  onEndCall,
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState<CallDialogue>(DEFAULT_FIRST_DIALOGUE);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [userInputSpeech, setUserInputSpeech] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessingReply, setIsProcessingReply] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true); // Toggle to hide/show translation box anytime

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Initialize Call & Ringing
  useEffect(() => {
    sounds.startRinging();

    const connectTimeout = setTimeout(() => {
      sounds.stopRinging();
      sounds.playCallConnected();
      setCallState('connected');

      // Tấn Vũ speaks first line in Chinese Yunxi Neural voice
      setCurrentDialogue(DEFAULT_FIRST_DIALOGUE);
      setIsSpeaking(true);
      speakChineseMaleVoice(DEFAULT_FIRST_DIALOGUE.chinese, undefined, () => {
        setIsSpeaking(false);
      });
    }, 2500);

    return () => {
      clearTimeout(connectTimeout);
      sounds.stopRinging();
      stopTanVuVoice();
    };
  }, [character]);

  // Timer counter when connected
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev: number) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Setup Web Speech Recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'vi-VN';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleSendCallDialogue(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleMicListening = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt chưa hỗ trợ ghi âm trực tiếp. Bạn có thể bấm các câu nói nhanh hoặc nhập câu nói bên dưới nhé!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleSendCallDialogue = async (speechText: string) => {
    if (!speechText.trim() || isProcessingReply) return;

    setUserInputSpeech('');
    setUserTranscript(speechText);
    setIsProcessingReply(true);

    try {
      const response = await fetch('/api/call-talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          userSpeech: speechText,
          callDurationSeconds: callDuration,
          userProfile,
          selectedModel: typeof window !== 'undefined' ? (localStorage.getItem('selected_ai_model') || 'auto') : 'auto',
        }),
      });

      const data = await response.json();
      if (data.chinese && data.vietnamese) {
        const newDialogue: CallDialogue = {
          chinese: data.chinese,
          pinyin: data.pinyin || '',
          vietnamese: data.vietnamese,
        };
        setCurrentDialogue(newDialogue);
        setIsSpeaking(true);

        if (isSpeakerOn) {
          speakChineseMaleVoice(data.chinese, undefined, () => {
            setIsSpeaking(false);
          });
        } else {
          setTimeout(() => setIsSpeaking(false), 2000);
        }
      }
    } catch {
      // Fallback
      const fallback: CallDialogue = {
        chinese: '喂，小懒虫... 听到你的声音，我都想立刻飞到你身边抱抱你。',
        pinyin: 'Wèi, xiǎo lǎnchóng... tīng dào nǐ de shēngyīn, wǒ dōu xiǎng lìkè fēi dào nǐ shēnbiān bào bao nǐ.',
        vietnamese: 'Alo bé lười... nghe được giọng em là anh muốn bay ngay đến bên cạnh để ôm em một cái rồi.',
      };
      setCurrentDialogue(fallback);
      setIsSpeaking(true);
      if (isSpeakerOn) {
        speakChineseMaleVoice(fallback.chinese, undefined, () => setIsSpeaking(false));
      }
    } finally {
      setIsProcessingReply(false);
    }
  };

  const handleReplayVoice = (customText?: string) => {
    const textToSpeak = customText || currentDialogue.chinese;
    if (!textToSpeak) return;
    setIsSpeaking(true);
    speakChineseMaleVoice(textToSpeak, undefined, () => {
      setIsSpeaking(false);
    });
  };

  const handleHangUp = () => {
    sounds.stopRinging();
    sounds.playCallEnd();
    stopTanVuVoice();
    setCallState('ended');
    setTimeout(() => {
      onEndCall();
    }, 1500);
  };

  const avatarUrl = character.avatar || '/tan-vu.gif';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none">
      {/* 1. FULL-SCREEN RESPONSIVE VIDEO BACKDROP (Rõ nét cả PC lẫn Mobile) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-slate-950 via-pink-950 to-slate-950 flex items-center justify-center">
        {/* Ambient Blur Backdrop for wide PC screens */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${avatarUrl})` }}
        />

        {/* Main Character Image / GIF (Responsive object-fit so head & body are 100% visible) */}
        <img
          src={avatarUrl}
          alt={character.name}
          className={`w-full h-full max-h-screen object-cover object-top sm:object-contain transition-all duration-700 ease-out z-1 relative ${
            isSpeaking ? 'scale-102 brightness-105 contrast-105' : 'scale-100 brightness-95'
          }`}
        />

        {/* Top Vignette Overlay - Keeps controls legible while leaving middle clear */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none z-2" />

        {/* Speaking Ambient Glow */}
        {isSpeaking && (
          <div className="absolute inset-0 bg-pink-500/10 mix-blend-overlay animate-pulse pointer-events-none z-2" />
        )}
      </div>

      {/* 2. USER PIP CAMERA PREVIEW (Hộp camera người dùng gọn gàng ở góc) */}
      {callState === 'connected' && (
        <div className="absolute top-4 right-4 z-30 w-20 sm:w-28 md:w-32 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl bg-slate-900/80 backdrop-blur-md transition-all">
          {isCameraOn ? (
            <div className="relative w-full h-full">
              <img
                src={userProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={userProfile?.name || 'Bạn'}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-medium text-pink-200 border border-white/20 whitespace-nowrap">
                {userProfile?.name || 'Bạn'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-1 p-2 text-center">
              <VideoOff className="w-4 h-4 text-rose-400" />
              <span className="text-[9px]">Camera tắt</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCameraOn(!isCameraOn)}
            className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 backdrop-blur-xs transition"
            title={isCameraOn ? 'Tắt camera của bạn' : 'Bật camera'}
          >
            {isCameraOn ? <Video className="w-3 h-3 text-emerald-400" /> : <VideoOff className="w-3 h-3 text-rose-400" />}
          </button>
        </div>
      )}

      {/* 3. TOP HEADER BAR: Header compact không che mặt */}
      <div className="relative z-20 flex flex-col items-start sm:items-center text-left sm:text-center pt-3 sm:pt-4 px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 shadow-lg text-xs font-medium text-pink-200">
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Cuộc gọi video với</span>
          <span className="font-bold text-white">{character.name}</span>
        </div>

        {/* Timer / Ringing Status */}
        <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-950/70 backdrop-blur-md border border-pink-400/30 text-xs font-mono font-bold text-white shadow-md">
          {callState === 'ringing' && (
            <span className="flex items-center gap-2 text-pink-300">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-ping" />
              Đang đổ chuông cuộc gọi video...
            </span>
          )}
          {callState === 'connected' && (
            <span className="flex items-center gap-2 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              {formatTime(callDuration)}
            </span>
          )}
          {callState === 'ended' && (
            <span className="text-rose-300">Cuộc gọi đã kết thúc</span>
          )}
        </div>
      </div>

      {/* 4. LOWER AREA: Responsive Subtitles & Voice Controls (Đặt sát phía dưới để hoàn toàn THẤY RÕ TẤN VŨ) */}
      <div className="relative z-20 flex flex-col items-center justify-end w-full max-w-2xl mx-auto px-3 sm:px-6 pb-2 mt-auto">
        {/* Speaking Status Badge & Subtitle Toggle Button */}
        {callState === 'connected' && (
          <div className="flex items-center gap-2 mb-2">
            {isSpeaking ? (
              <div className="bg-gradient-to-r from-pink-500/90 to-rose-600/90 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-lg flex items-center gap-2 border border-white/30 animate-bounce">
                <Volume2 className="w-3.5 h-3.5 text-pink-100" />
                <span>Tấn Vũ đang nói tiếng Trung...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleReplayVoice()}
                className="bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-white/20 active:scale-95 transition"
                title="Nghe lại giọng Tấn Vũ"
              >
                <RotateCcw className="w-3 h-3 text-pink-300" />
                <span>Nghe lại giọng anh</span>
              </button>
            )}

            {/* Toggle Button for Subtitles */}
            <button
              type="button"
              onClick={() => setShowSubtitles(!showSubtitles)}
              className="bg-black/50 hover:bg-black/70 backdrop-blur-md text-pink-200 hover:text-white text-xs font-medium px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-white/20 active:scale-95 transition"
              title={showSubtitles ? 'Thu gọn bản dịch để ngắm toàn cảnh' : 'Mở bản dịch tiếng Việt'}
            >
              <Languages className="w-3.5 h-3.5 text-pink-400" />
              <span>{showSubtitles ? 'Thu gọn dịch' : 'Hiện bản dịch'}</span>
              {showSubtitles ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Collapsible Subtitle & Vietnamese Translation Box */}
        {callState === 'connected' && showSubtitles && (
          <div className="w-full bg-black/70 backdrop-blur-xl rounded-2xl border border-pink-400/40 p-3.5 sm:p-4 shadow-2xl space-y-2 text-left max-h-[35vh] overflow-y-auto transition-all duration-300">
            {/* User speech transcript if active */}
            {userTranscript && (
              <div className="text-xs text-pink-300/90 font-medium pb-1 border-b border-white/10 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-pink-500/30 text-[10px] text-pink-200 font-bold uppercase">
                  Bạn
                </span>
                <span className="italic text-white">"{userTranscript}"</span>
              </div>
            )}

            {/* Chinese spoken text */}
            <div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-pink-300 mb-0.5">
                <span className="flex items-center gap-1">
                  <span>🇨🇳</span>
                  <span>Tấn Vũ (Tiếng Trung):</span>
                </span>
                <span className="text-[10px] text-pink-300/80 font-normal">
                  {isSpeaking ? 'Đang nói...' : 'Đã nói'}
                </span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-white tracking-wide leading-relaxed">
                "{currentDialogue.chinese}"
              </p>
              {currentDialogue.pinyin && (
                <p className="text-[11px] text-pink-300/80 font-mono italic mt-0.5">
                  {currentDialogue.pinyin}
                </p>
              )}
            </div>

            {/* Dedicated Vietnamese Translation */}
            <div className="pt-2 border-t border-pink-300/25 bg-pink-950/60 -mx-3.5 sm:-mx-4 -mb-3.5 sm:-mb-4 p-2.5 sm:p-3 rounded-b-2xl">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-rose-300 mb-0.5">
                <Languages className="w-3.5 h-3.5 text-pink-400" />
                <span>Bản dịch tiếng Việt:</span>
              </div>
              <p className="text-xs sm:text-sm text-pink-100 font-medium italic leading-relaxed">
                "{currentDialogue.vietnamese}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. BOTTOM CONTROL BAR (Thanh công cụ cuộc gọi cực kỳ gọn gàng) */}
      <div className="relative z-20 flex flex-col items-center gap-2.5 pb-4 sm:pb-6 px-4">
        {/* Custom text whisper input */}
        {callState === 'connected' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCallDialogue(userInputSpeech);
            }}
            className="w-full max-w-md flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/25 rounded-full px-3.5 py-1.5 shadow-xl"
          >
            <input
              type="text"
              value={userInputSpeech}
              onChange={(e) => setUserInputSpeech(e.target.value)}
              placeholder="Nói hoặc gõ cho anh (Anh sẽ đáp lại bằng tiếng Trung)..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-pink-200/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!userInputSpeech.trim() || isProcessingReply}
              className="p-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-40 text-white transition active:scale-90 shadow-md"
              title="Gửi câu nói"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Main FaceTime Action Buttons (Mute, Mic/Talk, Speaker, Hang Up) */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 sm:p-4 rounded-full transition active:scale-95 shadow-xl backdrop-blur-md ${
              isMuted
                ? 'bg-rose-700 text-white border border-rose-500'
                : 'bg-black/50 hover:bg-black/70 text-white border border-white/20'
            }`}
            title={isMuted ? 'Bật mic lại' : 'Tắt tiếng'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Voice Speech-to-text talk button */}
          <button
            onClick={toggleMicListening}
            className={`p-4 sm:p-5 rounded-full transition active:scale-95 shadow-2xl ${
              isListening
                ? 'bg-pink-500 text-white ring-4 ring-pink-300 animate-pulse'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border border-white/30'
            }`}
            title="Nói trực tiếp cho Tấn Vũ nghe"
          >
            <Mic className="w-6 h-6" />
          </button>

          {/* Speaker toggle */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 sm:p-4 rounded-full transition active:scale-95 shadow-xl backdrop-blur-md ${
              !isSpeakerOn
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : 'bg-black/50 hover:bg-black/70 text-white border border-white/20'
            }`}
            title={isSpeakerOn ? 'Tắt loa' : 'Bật loa'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Hang Up Button */}
          <button
            onClick={handleHangUp}
            className="p-4 sm:p-5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-2xl shadow-red-900/60 transition cursor-pointer border border-red-400/40"
            title="Kết thúc cuộc gọi"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
