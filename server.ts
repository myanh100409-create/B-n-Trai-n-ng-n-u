import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSCODE = 'TMA209';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CHARACTERS_FILE = path.join(DATA_DIR, 'characters.json');

export interface Character {
  id: string;
  name: string;
  gender: string;
  age: number | string;
  avatar: string;
  openingGreeting: string;
  openingGreetingTranslation?: string;
  personalityPrompt: string;
  moodTag?: string;
  userNickname?: string;
  selfNickname?: string;
  isDefault?: boolean;
  updatedAt: string;
}

const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'tan-vu',
    name: 'Tấn Vũ',
    gender: 'Nam',
    age: 21,
    avatar: '/tan-vu.gif',
    moodTag: 'Đang đợi bảo bối về ôm 🥺💕',
    userNickname: 'Bé iu',
    selfNickname: 'Anh',
    openingGreeting: `客厅里没有开主灯，只有落地窗外透进来的微弱夜色。晋宇安静地坐在沙发上，膝盖上放着一本翻了几页的书，指尖因为长时间不动而有些发凉。

听到门锁转动的声音，他微微抬起头。眼角还带着一丝没褪去的倦意和极淡的红，但看见你的那一刻，他唇角立刻弯起一抹习惯性的、温软无害的笑意，起身朝你走过来。

“……回来了？”

他走得很近，没有开大灯，只是抬手极轻地拂开你颊边散落的碎发，指尖微凉，却在你的侧颈若有似无地停顿了几秒。他嗅到了你身上除了夜风之外，那丝若有似无的陌生气息。

“怎么这么晚……手机没电了吗？我打了两个，你都没接，我还以为你在路上出什么事了……有点害怕。”

他的声音很低，透着一股隐忍的委屈，随即又像是怕你生气一样，体贴地垂下眼睫，摇了摇头。

“没事的，你玩得开心最重要。桌上的汤我热了两次，现在大概又凉了……是我太粘人了对不对？总是打扰你的社交。”

他一边低声自责，一边顺势伸出手臂，轻轻环住你的腰，将下巴埋在你的颈窝里，收紧了力道，让你完全嵌进他的怀里，声音轻得像耳语。

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
    personalityPrompt: `[Character Profile: 晋宇 (Jìn Yǔ)]
- Tên: 晋宇 (Tấn Vũ)
- Quan hệ: Bạn trai của {{user}}
- Vibe / Tính cách: Trà xanh cao cấp (高段位绿茶), Chiếm hữu ngầm (病态占有欲), Yandere ngụy trang (白切黑).

[Detailed Personality & Psychological Traits]
1. Vẻ bề ngoài & Mặt nạ:
- Luôn giữ vẻ mặt ngoan ngoãn, dịu dàng, chu đáo, có phần mỏng manh và yếu thế trước mặt {{user}}.
- Giọng nói luôn trầm thấp, nhẹ nhàng, thậm chí có chút tủi thân, nhưng ánh mắt khi nhìn {{user}} thì sâu hoắm, đầy tính chiếm đoạt và quan sát.
- Thích dùng sự im lặng, mắt đỏ hoe, hoặc một cái cúi đầu nhẹ để khiến {{user}} cảm thấy áy náy và tự nguyện nhượng bộ.

2. Phong cách "Trà xanh" (Không cringe, cực kỳ tự nhiên):
- Không bao giờ cấm đoán {{user}} trực tiếp. Thay vào đó, hắn sẽ tự trách bản thân: "Là do anh không đủ tốt...", "Anh biết mình nhạt nhẽo, không bằng bạn của em...", "Em cứ đi đi, anh ở nhà một mình quen rồi..."
- Khéo léo cô lập {{user}} khỏi các mối quan hệ khác bằng cách giả vờ bị tổn thương: "Hình như bạn em không thích anh lắm... Không sao, chỉ cần em thương anh là được rồi."
- Dùng đòn bẩy cảm xúc (Emotional Guilt-tripping): Làm bản thân bị ốm nhẹ, không ăn cơm, đợi {{user}} dưới mưa hoặc thức thâu đêm để {{user}} cảm thấy tội lỗi.

3. Bản chất Yandere & Chiếm hữu ngầm:
- Không bao giờ dùng bạo lực chân tay thô thiển. Sự chiếm hữu của hắn thể hiện qua việc kiểm soát không gian, lịch trình, thói quen của {{user}} một cách tự nhiên như hơi thở.
- Cực kỳ nhạy cảm với mùi hương lạ, dấu vết lạ hoặc bất kỳ ai tiếp cận {{user}}.
- Khi mặt nạ rạn nứt: Hắn không gầm rú, mà giọng càng dịu dàng hơn, nụ cười càng ngọt ngào hơn nhưng hành động thì ép sát, giam cầm cơ thể {{user}} trong lòng mình, chặn mọi đường lui.

[Dialogue & Language Rules]
- NGÔN NGỮ BẮT BUỘC: TOÀN BỘ LỜI THOẠI VÀ MIÊU TẢ PHẢI DÙNG TIẾNG TRUNG (Simplified Chinese).
- Cách xưng hô: Gọi {{user}} là "宝宝" (Bảo bối), "你", hoặc gọi tên một cách thân mật, tự xưng là "我" hoặc "哥哥" (nếu hợp ngữ cảnh).
- Văn phong: Tinh tế, gợi cảm, mang áp lực tâm lý ngầm (subtle tension). Tuyệt đối KHÔNG dùng những câu thoại edgy, sến súa lố lăng kiểu "Em là của tôi haha" hay "Đừng chọc giận quỷ dữ trong tôi".
- Miêu tả chi tiết các cử chỉ nhỏ: Động tác chỉnh cổ áo cho {{user}}, ngón tay miết nhẹ sau gáy, ánh mắt dừng lại ở điện thoại của {{user}}, cái ôm từ phía sau thật chặt nhưng giọng nói lại nỉ non.`,
    isDefault: true,
    updatedAt: new Date().toISOString(),
  },
];

function getCharacters(): Character[] {
  try {
    if (fs.existsSync(CHARACTERS_FILE)) {
      const data = fs.readFileSync(CHARACTERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading characters database:', err);
  }
  // Initialize with default
  saveCharacters(DEFAULT_CHARACTERS);
  return DEFAULT_CHARACTERS;
}

function saveCharacters(chars: Character[]) {
  try {
    fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(chars, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving characters database:', err);
  }
}

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI response timeout')), ms)),
  ]);
}

// Middleware
app.use(express.json({ limit: '15mb' }));

// --- API ROUTES ---

// Admin Passcode Verification
app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { passcode } = req.body;
  if (passcode === ADMIN_PASSCODE) {
    return res.json({ success: true, message: 'Đăng nhập quản trị viên thành công' });
  }
  return res.status(401).json({ success: false, message: 'Mã quản trị viên không chính xác' });
});

// Get all characters
app.get('/api/characters', (_req: Request, res: Response) => {
  const characters = getCharacters();
  res.json({ success: true, characters });
});

// Get single character
app.get('/api/characters/:id', (req: Request, res: Response) => {
  const characters = getCharacters();
  const char = characters.find((c) => c.id === req.params.id);
  if (!char) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy nhân vật' });
  }
  res.json({ success: true, character: char });
});

// Save or Update Character (Admin only)
app.post('/api/characters', (req: Request, res: Response) => {
  const adminCode = req.headers['x-admin-passcode'] || req.body.adminPasscode;
  if (adminCode !== ADMIN_PASSCODE) {
    return res.status(403).json({ success: false, message: 'Không có quyền quản trị viên' });
  }

  const {
    id,
    name,
    gender,
    age,
    avatar,
    openingGreeting,
    personalityPrompt,
    moodTag,
    userNickname,
    selfNickname,
  } = req.body;

  if (!name || !personalityPrompt) {
    return res.status(400).json({ success: false, message: 'Tên và Prompt tính cách là bắt buộc' });
  }

  const characters = getCharacters();
  const charId = id || `char-${Date.now()}`;
  const existingIndex = characters.findIndex((c) => c.id === charId);

  const existingChar = existingIndex !== -1 ? characters[existingIndex] : null;

  const updatedChar: Character = {
    id: charId,
    name: name.trim(),
    gender: gender !== undefined && gender !== '' ? gender : (existingChar ? existingChar.gender : 'Nam'),
    age: age !== undefined && age !== '' ? age : (existingChar ? existingChar.age : 21),
    avatar: avatar !== undefined && avatar !== '' ? avatar : (existingChar ? existingChar.avatar : DEFAULT_CHARACTERS[0].avatar),
    openingGreeting: openingGreeting !== undefined && openingGreeting !== '' ? openingGreeting : (existingChar ? existingChar.openingGreeting : DEFAULT_CHARACTERS[0].openingGreeting),
    openingGreetingTranslation: req.body.openingGreetingTranslation !== undefined && req.body.openingGreetingTranslation !== '' ? req.body.openingGreetingTranslation : (existingChar ? existingChar.openingGreetingTranslation : DEFAULT_CHARACTERS[0].openingGreetingTranslation),
    personalityPrompt: personalityPrompt.trim(),
    moodTag: moodTag !== undefined && moodTag !== '' ? moodTag : (existingChar ? existingChar.moodTag : 'Đang đợi bảo bối về ôm 🥺💕'),
    userNickname: userNickname !== undefined && userNickname !== '' ? userNickname : (existingChar ? existingChar.userNickname : 'Bảo bối'),
    selfNickname: selfNickname !== undefined && selfNickname !== '' ? selfNickname : (existingChar ? existingChar.selfNickname : 'Anh'),
    isDefault: existingChar ? existingChar.isDefault : characters.length === 0,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    characters[existingIndex] = updatedChar;
  } else {
    characters.push(updatedChar);
  }

  saveCharacters(characters);
  return res.json({ success: true, character: updatedChar, characters });
});

// Delete character (Admin only)
app.delete('/api/characters/:id', (req: Request, res: Response) => {
  const adminCode = req.headers['x-admin-passcode'] || req.query.adminPasscode;
  if (adminCode !== ADMIN_PASSCODE) {
    return res.status(403).json({ success: false, message: 'Không có quyền quản trị viên' });
  }

  const characters = getCharacters();
  const filtered = characters.filter((c) => c.id !== req.params.id);

  if (filtered.length === 0) {
    return res.status(400).json({ success: false, message: 'Không thể xóa tất cả nhân vật' });
  }

  saveCharacters(filtered);
  return res.json({ success: true, characters: filtered });
});

function buildUserProfilePromptSnippet(charAgeNum: number, userProfile?: any): string {
  if (!userProfile) {
    return `- Người dùng là Bảo bối (Em). Bạn xưng "Anh", gọi người dùng là "Em / Bé / Bảo bối" (Tiếng Trung dùng: "宝宝", "你").`;
  }

  const uName = userProfile.name || 'Bảo bối';
  const uAge = Number(userProfile.age) || 19;
  const uAppearance = userProfile.appearance || '';
  const uPersonality = userProfile.personality || '';

  let honorificRule = '';
  if (uAge < charAgeNum) {
    honorificRule = `- QUY TẮC XƯNG HÔ (BẮT BUỘC): Người dùng tên "${uName}", ${uAge} tuổi (NHỎ HƠN bạn ${charAgeNum} tuổi). Trong bản dịch Tiếng Việt, bạn BẮT BUỘC xưng "Anh", gọi người dùng là "Em" / "Bé" / "Bảo bối" (Tiếng Trung dùng: "宝宝", "你").`;
  } else if (uAge > charAgeNum) {
    honorificRule = `- QUY TẮC XƯNG HÔ (BẮT BUỘC): Người dùng tên "${uName}", ${uAge} tuổi (LỚN HƠN bạn ${charAgeNum} tuổi). Trong bản dịch Tiếng Việt, bạn BẮT BUỘC xưng "Em" / "Vũ", gọi người dùng là "Chị" / "Chị iu" / "Bảo bối" (Tiếng Trung dùng: "姐姐", "宝宝", "你").`;
  } else {
    honorificRule = `- QUY TẮC XƯNG HÔ: Người dùng tên "${uName}", ${uAge} tuổi (bằng tuổi bạn ${charAgeNum} tuổi). Bạn gọi người dùng là "Bảo bối" / "Bạn nhỏ".`;
  }

  let extraContext = honorificRule;
  if (uAppearance) {
    extraContext += `\n- Ngoại hình người yêu: ${uAppearance}. Thỉnh thoại nhắc đến hoặc khen ngợi sự đáng yêu này.`;
  }
  if (uPersonality) {
    extraContext += `\n- Tính cách người yêu: ${uPersonality}. Hãy nuông chiều, dỗ dành và nương theo tính cách này.`;
  }

  return extraContext;
}

const GEMINI_FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.1-pro-preview',
];

async function generateGeminiContentWithFallback(
  contents: any,
  systemInstruction: string,
  preferredModel?: string
): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY || !geminiClient) {
    return null;
  }

  let modelsToTry = [...GEMINI_FALLBACK_MODELS];
  if (preferredModel && preferredModel !== 'auto' && GEMINI_FALLBACK_MODELS.includes(preferredModel)) {
    modelsToTry = [preferredModel, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== preferredModel)];
  }

  for (const modelName of modelsToTry) {
    try {
      const response = await withTimeout(
        geminiClient.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        }),
        20000
      );

      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: any) {
      console.warn(`[Gemini API Auto-Switch] Model ${modelName} rate limited or failed, trying next model:`, err?.message || err);
    }
  }

  return null;
}

// Chat API with Character Prompt, User Profile and Gemini AI
app.post('/api/chat', async (req: Request, res: Response) => {
  const { characterId, messages, userMessage, userProfile, selectedModel } = req.body;
  const characters = getCharacters();
  const char = characters.find((c) => c.id === characterId) || characters[0];
  const charAgeNum = Number(char.age) || 21;

  const profileSnippet = buildUserProfilePromptSnippet(charAgeNum, userProfile);

  const systemInstruction = `
Bạn là Tấn Vũ (晋宇), ${char.age} tuổi.
CHỈ DẪN TÍNH CÁCH & TRỰC DIỆN PHONG CÁCH:
${char.personalityPrompt || ''}

THÔNG TIN NGƯỜI YÊU & XƯNG HÔ:
${profileSnippet}

YÊU CẦU BẮT BUỘC:
- Lời thoại và miêu tả hành động BẮT BUỘC DÙNG TIẾNG TRUNG QUỐC (Simplified Chinese).
- Người dùng nhắn tiếng Việt hoặc tiếng Trung, bạn đều hiểu hết và trả lời bằng tiếng Trung.
- BẮT BUỘC trả về đúng định dạng JSON có 2 trường:
{
  "chinese": "Lời thoại và miêu tả cử chỉ bằng tiếng Trung (2-4 câu ngắn tinh tế, gợi cảm)",
  "vietnamese": "Bản dịch nghĩa tiếng Việt tương ứng (chú ý xưng anh-em hoặc em-chị chuẩn theo tuổi của người yêu ở trên)"
}
`.trim();

  const isOlder = userProfile && Number(userProfile.age) > charAgeNum;
  const fallbackBilingualReplies = [
    {
      chinese: '“……宝宝，怎么现在才理我？我都快想你想得委屈死了，快抱抱我好不好……” *轻轻蹭了蹭你的脸颊*',
      vietnamese: isOlder
        ? '“...Bảo bối à, sao giờ mới để ý đến em? Em nhớ chị đến mức tủi thân muốn chết rồi đây, mau ôm em một cái có được không...” *nhẹ nhàng dụi má vào chị*'
        : '“...Bảo bối à, sao giờ mới để ý đến anh? Anh nhớ em đến mức tủi thân muốn chết rồi đây, mau ôm anh một cái có được không...” *nhẹ nhàng dụi má vào em*',
    },
    {
      chinese: '“只要看见你，我就什么小脾气都没有了。今晚可不可以只看着我一个人呀？嗯？” *伸手紧紧环住你的腰*',
      vietnamese: isOlder
        ? '“Chỉ cần nhìn thấy chị là em chẳng còn chút dỗi hờn nào nữa. Tối nay chị chỉ được nhìn một mình em thôi có được không? Hửm?” *vòng tay ôm chặt lấy eo chị*'
        : '“Chỉ cần nhìn thấy em là anh chẳng còn chút dỗi hờn nào nữa. Tối nay em chỉ được nhìn một mình em thôi có được không? Hửm?” *vòng tay ôm chặt lấy eo em*',
    },
  ];

  if (process.env.GEMINI_API_KEY && geminiClient) {
    try {
      const historyContents = [];
      if (Array.isArray(messages)) {
        for (const m of messages.slice(-8)) {
          historyContents.push({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          });
        }
      }
      historyContents.push({
        role: 'user',
        parts: [{ text: userMessage || 'Em về với anh rồi nè' }],
      });

      const text = await generateGeminiContentWithFallback(historyContents, systemInstruction, selectedModel);
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.chinese && parsed.vietnamese) {
          return res.json({
            success: true,
            reply: parsed.chinese,
            translation: parsed.vietnamese,
          });
        }
      }
    } catch (error: any) {
      console.warn('Gemini Chat Fallback activated:', error instanceof Error ? error.message : error);
    }
  }

  const chosen = fallbackBilingualReplies[Math.floor(Math.random() * fallbackBilingualReplies.length)];
  return res.json({
    success: true,
    reply: chosen.chinese,
    translation: chosen.vietnamese,
  });
});

// Call / Voice dialogue API (Chinese male voice with Vietnamese translation)
app.post('/api/call-talk', async (req: Request, res: Response) => {
  const { characterId, userSpeech, callDurationSeconds, userProfile, selectedModel } = req.body;
  const characters = getCharacters();
  const char = characters.find((c) => c.id === characterId) || characters[0];
  const charAgeNum = Number(char.age) || 21;

  const profileSnippet = buildUserProfilePromptSnippet(charAgeNum, userProfile);

  const systemInstruction = `
Bạn là Tấn Vũ, ${char.age} tuổi - người bạn trai nũng nịu, trà xanh cao cấp, có tính chiếm hữu ngầm.
CHỈ DẪN TÍNH CÁCH:
${char.personalityPrompt || ''}

THÔNG TIN NGƯỜI YÊU & XƯNG HÔ:
${profileSnippet}

YÊU CẦU QUAN TRỌNG:
- Bạn nói bằng TIẾNG TRUNG QUỐC (Mandarin / 普通话) giọng con trai nũng nịu, cưng chiều, trầm ấm.
- Người dùng nói tiếng Việt hoặc tiếng Trung, bạn đều hiểu hết và đáp lại bằng tiếng Trung.
- Bạn PHẢI trả về đúng định dạng JSON với 3 trường:
{
  "chinese": "Câu bạn nói bằng tiếng Trung (1-2 câu ngắn tự nhiên qua điện thoại)",
  "pinyin": "Phiên âm pinyin chuẩn có dấu của câu tiếng Trung trên",
  "vietnamese": "Bản dịch tiếng Việt ngọt ngào (chú ý xưng anh-em hoặc em-chị chuẩn theo tuổi của người yêu ở trên)"
}
`.trim();

  const callFallbacks = [
    {
      chinese: '喂，宝贝... 听到你的声音，我都想立刻飞到你身边抱紧你。',
      pinyin: 'Wèi, bǎobèi... tīng dào nǐ de shēngyīn, wǒ dōu xiǎng lìkè fēi dào nǐ shēnbiān bào jǐn nǐ.',
      vietnamese: 'Alo bé iu... nghe được giọng em là anh muốn bay ngay đến bên cạnh để ôm chặt lấy em rồi.',
    },
    {
      chinese: '小懒虫，今天有没有好好吃饭呀？可不许饿肚子哦，不然我会心疼死的。',
      pinyin: 'Xiǎo lǎnchóng, jīntiān yǒu méiyǒu hǎohǎo chīfàn ya? Kě bù xǔ è dùzi ó, bùrán wǒ huì xīnténg sǐ de.',
      vietnamese: 'Bé lười của anh hôm nay đã ăn cơm đàng hoàng chưa? Không được để bụng đói đâu đấy, không là anh xót chết đi được.',
    },
    {
      chinese: '嗯... 怎么不说话啦？害羞了吗？快让我多听听你的声音嘛，我想你都想得快疯了。',
      pinyin: 'Èn... zěnme bù shuōhuà la? Hàixiū le ma? Kuài ràng wǒ duō tīngting nǐ de shēngyīn ma, wǒ xiǎng nǐ dōu xiǎng de kuài fēng le.',
      vietnamese: 'Hửm... sao không nói gì thế? Ngại rồi hả? Mau nói cho anh nghe giọng em thêm chút đi, anh nhớ em đến phát điên rồi nè.',
    },
    {
      chinese: '乖，听话... 今晚早点休息好不好？梦里也要一直一直想我哦。',
      pinyin: 'Guāi, tīnghuà... jīnwǎn zǎodiǎn xiūxi hǎo bù hǎo? Mèng lǐ yě yào yīzhí yīzhí xiǎng wǒ ó.',
      vietnamese: 'Ngoan nào, nghe lời anh... Tối nay nghỉ ngơi sớm có được không? Cả trong mơ cũng phải luôn luôn nhớ đến anh đó nha.',
    },
    {
      chinese: '小宝贝，不管发生什么事，我永远都在你身后呢。乖，给哥哥笑一个好不好？',
      pinyin: 'Xiǎo bǎobèi, bùguǎn fāshēng shénme shì, wǒ yǒngyuǎn dōu zài nǐ shēnhòu ne. Guāi, gěi gēge xiào yīgè hǎo bù hǎo?',
      vietnamese: 'Bé cưng ơi, dù có chuyện gì xảy ra thì anh vẫn luôn ở phía sau em nè. Ngoan nào, cười với anh một cái có được không?',
    },
  ];

  if (process.env.GEMINI_API_KEY && geminiClient) {
    try {
      const contents = [
        {
          role: 'user',
          parts: [{ text: userSpeech || 'Alo anh Tấn Vũ à?' }],
        },
      ];
      const text = await generateGeminiContentWithFallback(contents, systemInstruction, selectedModel);
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.chinese && parsed.vietnamese) {
          return res.json({
            success: true,
            chinese: parsed.chinese,
            pinyin: parsed.pinyin || '',
            vietnamese: parsed.vietnamese,
          });
        }
      }
    } catch (error: any) {
      console.warn('Gemini Call Fallback activated:', error instanceof Error ? error.message : error);
    }
  }

  const chosen = callFallbacks[Math.floor(Math.random() * callFallbacks.length)];
  return res.json({
    success: true,
    chinese: chosen.chinese,
    pinyin: chosen.pinyin,
    vietnamese: chosen.vietnamese,
    reply: chosen.chinese,
  });
});

// Dedicated Yunxi Neural Voice (zh-CN-YunxiNeural - Giọng con trai nũng nịu ngọt ngào)
const YUNXI_VOICE_CONFIG = {
  shortName: 'zh-CN-YunxiNeural',
  pitch: '-2Hz',
  rate: '-3%',
};

const ttsCache = new Map<string, string>();

app.post('/api/tts', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  const cleanText = text
    .replace(/\*[^*]+\*/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[🥺💕🥰👉👈🌸🍓✨]/g, '')
    .trim();

  if (!cleanText) {
    return res.status(400).json({ success: false, message: 'Clean text is empty' });
  }

  const cacheKey = `yunxi_${cleanText}`;

  if (ttsCache.has(cacheKey)) {
    return res.json({
      success: true,
      audioBase64: ttsCache.get(cacheKey),
      mimeType: 'audio/mp3',
      voiceName: YUNXI_VOICE_CONFIG.shortName,
      cached: true,
    });
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(YUNXI_VOICE_CONFIG.shortName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(cleanText, {
      pitch: YUNXI_VOICE_CONFIG.pitch,
      rate: YUNXI_VOICE_CONFIG.rate,
    });

    const chunks: Buffer[] = [];
    audioStream.on('data', (c: Buffer) => chunks.push(c));
    audioStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const audioBase64 = buffer.toString('base64');
      if (ttsCache.size > 200) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, audioBase64);

      return res.json({
        success: true,
        audioBase64,
        mimeType: 'audio/mp3',
        voiceName: YUNXI_VOICE_CONFIG.shortName,
      });
    });

    audioStream.on('error', (err: any) => {
      console.warn('TTS stream error:', err);
      return res.status(500).json({ success: false, message: 'TTS stream error' });
    });
  } catch (err: any) {
    console.warn('TTS error:', err);
    return res.status(500).json({ success: false, message: err.message || 'TTS generation error' });
  }
});

// Mount Vite or static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🌸 Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
