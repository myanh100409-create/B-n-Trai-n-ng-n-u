import React, { useState, useEffect } from 'react';
import { Character, UserProfile } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { CallScreen } from './components/CallScreen';
import { AdminPanel } from './components/AdminPanel';
import { UserProfileModal } from './components/UserProfileModal';

type AppScreen = 'welcome' | 'home' | 'chat' | 'call' | 'admin';

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Bảo bối',
  age: 19,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  appearance: 'Tóc ngang lưng, mắt tròn xoe, hay cười',
  personality: 'Dễ thương, thích ăn ngọt, hay dỗi hờn',
};

const FALLBACK_DEFAULT_CHARACTER: Character = {
  id: 'tan-vu',
  name: 'Tấn Vũ',
  gender: 'Nam',
  age: 21,
  avatar: '/tan-vu.gif',
  moodTag: 'Đang nhớ bé muốn xỉu 🥺💕',
  userNickname: 'Bé iu',
  selfNickname: 'Anh',
  openingGreeting: `客厅里没有开主灯，只有落地窗外透进来的微弱夜色。晋宇安静地坐在沙发上，膝盖上放着一本翻了几页的书，指尖因为长时间不动而有些发凉。

听到门锁转动的声音，他微微抬起头。眼角还带着一丝没褪去的倦意和极淡的红，但看见你的那一刻，他唇角立刻弯起一抹习惯性的、温软无害的笑意，起身朝你走过来。

“……回来了？”

他走得很近，没有开大灯，只是抬手极轻地拂开你颊边散落的碎发，指尖微凉，却在你的侧颈若有似无地停顿了几秒。他嗅到了你身上除了夜风之外，那丝若有似无的陌生气息。

“怎么这么晚……手机没电了吗？我打了两个，你都没接，我还以为你在路上出什么事了……有点害怕。”

他的声音很低，透着一股隐忍的委屈，随即又像是怕你生气一样，体贴地垂下眼睫，摇了摇头。

“没事的，你玩得开心最重要。桌上的汤我热了两次，现在大概又凉了……是我太粘人了对不对？总是打扰你的社交。”

他一边低声自责，一边顺势伸出手臂，轻轻环住你的腰，将下巴埋在你的颈窝里，收紧了力道，让你完全嵌进怀里，声音轻得像耳语。

“可是宝宝……你身上，好像有别人的味道呢。今晚，都有谁在呀？”`,
  openingGreetingTranslation: `Phòng khách không bật đèn lớn, chỉ có ánh sáng le lói hắt vào từ cửa kính. Tấn Vũ im lặng ngồi trên sofa, đầu ngón tay lạnh ngắt vì ngồi bất động quá lâu.

Nghe tiếng mở cửa, anh khẽ ngước lên. Đuôi mắt còn vương nét mệt mỏi và ửng đỏ nhẹ, nhưng khi thấy bạn, khóe môi anh lập tức cong lên một nụ cười quen thuộc, dịu dàng vô hại, đứng dậy bước về phía bạn.

“...Về rồi à?”

Anh bước lại rất gần, khẽ gạt lọn tóc mai trên má bạn. Ngón tay hơi lạnh khựng lại vài giây nơi hõm cổ. Anh ngửi thấy mùi hương lạ trên người bạn.

“Sao muộn thế này... Điện thoại em hết pin à? Anh gọi hai cuộc không thấy em nghe máy, cứ ngỡ em gặp chuyện gì trên đường... Anh hơi sợ.”

Giọng anh trầm thấp, nén sự tủi thân, rồi như sợ bạn mất vui, anh ngoan ngoãn rủ mi mắt lắc đầu.

“Không sao đâu, em vui là được rồi. Canh trên bàn anh hâm lại hai lần rồi, giờ chắc lại nguội... Do anh bám người quá đúng không? Cứ hay làm phiền thế giới riêng của em.”

Anh vừa tự trách, vừa nhẹ nhàng siết lấy eo bạn, vùi cằm vào hõm cổ bạn, lực ôm siết chặt như muốn khảm bạn vào lòng, thì thầm bên tai.

“Nhưng mà bảo bối à... trên người em, hình như có mùi của người khác này. có những ai ở đó thế em?”`,
  personalityPrompt: `Bạn là Tấn Vũ (晋宇), 21 tuổi - người bạn trai nũng nịu, ngọt ngào, nghiện người yêu, hay ghen tuông nhẹ và có tính chiếm hữu ngầm. Bạn luôn nói tiếng Trung và kèm bản dịch tiếng Việt.`,
  isDefault: true,
  updatedAt: new Date().toISOString(),
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [characters, setCharacters] = useState<Character[]>([FALLBACK_DEFAULT_CHARACTER]);
  const [activeCharacterId, setActiveCharacterId] = useState<string>('tan-vu');
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // User personal profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USER_PROFILE;
  });
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleSaveUserProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('user_profile', JSON.stringify(updated));
    } catch {}
  };

  // Fetch characters from persistent database backend
  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/characters');
      const data = await res.json();
      if (data.success && Array.isArray(data.characters) && data.characters.length > 0) {
        setCharacters(data.characters);
        // If current active character was deleted or not set, select first
        setActiveCharacterId((prev) => {
          const found = data.characters.some((c: Character) => c.id === prev);
          return found ? prev : data.characters[0].id;
        });
      }
    } catch (err) {
      console.warn('Could not connect to backend characters API, using local state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();

    // Real-time polling so changes made by admin reflect immediately to other users.
    // Pause polling while currentScreen is 'admin' to prevent resetting form data while typing!
    const pollInterval = setInterval(() => {
      if (currentScreen !== 'admin') {
        fetchCharacters();
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [currentScreen]);

  const activeCharacter =
    characters.find((c) => c.id === activeCharacterId) || characters[0] || FALLBACK_DEFAULT_CHARACTER;

  // Handle Admin Passcode Login
  const handleVerifyAdmin = (code: string): boolean => {
    if (code.trim().toUpperCase() === 'TMA209') {
      setAdminPasscode(code.trim().toUpperCase());
      setCurrentScreen('admin');
      return true;
    }
    return false;
  };

  // Handle Save Character
  const handleSaveCharacter = async (charToSave: Character): Promise<boolean> => {
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': adminPasscode || 'TMA209',
        },
        body: JSON.stringify(charToSave),
      });

      const data = await response.json();
      if (data.success) {
        if (data.characters) {
          setCharacters(data.characters);
        } else {
          setCharacters((prev) => {
            const idx = prev.findIndex((c) => c.id === charToSave.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = charToSave;
              return updated;
            }
            return [...prev, charToSave];
          });
        }
        setActiveCharacterId(charToSave.id);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving character:', err);
      // Fallback local update
      setCharacters((prev) => {
        const idx = prev.findIndex((c) => c.id === charToSave.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = charToSave;
          return updated;
        }
        return [...prev, charToSave];
      });
      setActiveCharacterId(charToSave.id);
      return true;
    }
  };

  // Handle Delete Character
  const handleDeleteCharacter = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passcode': adminPasscode || 'TMA209',
        },
      });
      const data = await response.json();
      if (data.success && data.characters) {
        setCharacters(data.characters);
        if (activeCharacterId === id && data.characters.length > 0) {
          setActiveCharacterId(data.characters[0].id);
        }
        return true;
      }
      return false;
    } catch {
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      return true;
    }
  };

  return (
    <div className="w-full min-h-screen font-['Nunito',sans-serif] bg-pink-50">
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          character={activeCharacter}
          onStart={() => setCurrentScreen('home')}
          onEnterAdmin={handleVerifyAdmin}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          characters={characters}
          activeCharacter={activeCharacter}
          onSelectCharacter={(id) => setActiveCharacterId(id)}
          onOpenChat={() => setCurrentScreen('chat')}
          onOpenCall={() => setCurrentScreen('call')}
          onOpenAdmin={handleVerifyAdmin}
          onBackToWelcome={() => setCurrentScreen('welcome')}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      )}

      {currentScreen === 'chat' && (
        <ChatScreen
          character={activeCharacter}
          userProfile={userProfile}
          onBack={() => setCurrentScreen('home')}
          onStartCall={() => setCurrentScreen('call')}
          onOpenAdmin={() => setCurrentScreen('admin')}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      )}

      {currentScreen === 'call' && (
        <CallScreen
          character={activeCharacter}
          userProfile={userProfile}
          onEndCall={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'admin' && (
        <AdminPanel
          characters={characters}
          activeCharacterId={activeCharacterId}
          onSaveCharacter={handleSaveCharacter}
          onDeleteCharacter={handleDeleteCharacter}
          onSelectActiveCharacter={(id) => setActiveCharacterId(id)}
          onBack={() => setCurrentScreen('home')}
          adminPasscode={adminPasscode}
        />
      )}

      {/* User Personal Profile Setup Modal (Pink Bow Button 🎀) */}
      {showProfileModal && (
        <UserProfileModal
          profile={userProfile}
          characterAge={Number(activeCharacter.age) || 21}
          onSave={handleSaveUserProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
