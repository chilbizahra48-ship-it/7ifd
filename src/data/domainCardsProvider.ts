import { CEFRLevel, LanguageCode } from '../types';
import { BundledCard, BundledDeck } from './contentPacks';

export interface MultilingualVocabItem {
  key: string;
  terms: Record<LanguageCode, string>;
  examples: Record<LanguageCode, string>;
  transliterations?: Partial<Record<LanguageCode, string>>;
  pronunciations?: Partial<Record<LanguageCode, string>>;
  tags: string[];
}

import { DOMAIN_1_ESSENTIALS } from './domains/domain1_essentials';
import { DOMAIN_2_GREETINGS } from './domains/domain2_greetings';
import { DOMAIN_3_TRAVEL } from './domains/domain3_travel';
import { DOMAIN_4_FOOD } from './domains/domain4_food';
import { DOMAIN_5_HOME } from './domains/domain5_home';
import { DOMAIN_6_WORK } from './domains/domain6_work';
import { DOMAIN_7_HEALTH } from './domains/domain7_health';
import { DOMAIN_8_CULTURE } from './domains/domain8_culture';

export const DOMAIN_DATA_MAP: Record<string, MultilingualVocabItem[]> = {
  'everyday-essentials': DOMAIN_1_ESSENTIALS,
  'greetings-social': DOMAIN_2_GREETINGS,
  'travel-transportation': DOMAIN_3_TRAVEL,
  'food-shopping': DOMAIN_4_FOOD,
  'home-city': DOMAIN_5_HOME,
  'work-business': DOMAIN_6_WORK,
  'health-emergencies': DOMAIN_7_HEALTH,
  'culture-entertainment': DOMAIN_8_CULTURE,
};

/**
 * Universal high-frequency vocabulary pool across all 11 languages
 * to guarantee every single level in all 8 domains has exactly 50 cards with genuine translations.
 */
export const CORE_LANGUAGE_PACK: MultilingualVocabItem[] = [
  {
    key: 'learn',
    terms: { en: 'learn', ar: 'يتعلم', fr: 'apprendre', es: 'aprender', de: 'lernen', pt: 'aprender', 'zh-CN': '学习', ja: '学ぶ / 習う', ko: '배우다', th: 'เรียนรู้', hi: 'सीखना' },
    examples: {
      en: 'I love to learn new languages every day.',
      ar: 'أحب أن أتعلم لغات جديدة كل يوم.',
      fr: 'J’adore apprendre de nouvelles langues chaque jour.',
      es: 'Me encanta aprender nuevos idiomas todos los días.',
      de: 'Ich lerne jeden Tag gerne neue Sprachen.',
      pt: 'Eu adoro aprender novos idiomas todos os dias.',
      'zh-CN': '我喜欢每天学习新的语言。',
      ja: '私は毎日新しい言語を学ぶのが大好きです。',
      ko: '저는 매일 새로운 언어를 배우는 것을 아주 좋아합니다.',
      th: 'ฉันชอบเรียนรู้ภาษาใหม่ๆ ในทุกๆ วัน',
      hi: 'मुझे हर दिन नई भाषाएँ सीखना बहुत पसंद है।',
    },
    transliterations: { ar: 'Yata\'allam', ja: 'manabu', ko: 'baeuda', th: 'rian-roo', hi: 'seekhna' },
    tags: ['core', 'study'],
  },
  {
    key: 'speak',
    terms: { en: 'speak', ar: 'يتحدث / يتكلم', fr: 'parler', es: 'hablar', de: 'sprechen', pt: 'falar', 'zh-CN': '说话 / 讲', ja: '話す', ko: '말하다', th: 'พูด', hi: 'बोलना' },
    examples: {
      en: 'She speaks three languages fluently.',
      ar: 'هي تتحدث ثلاث لغات بطلاقة ويسر.',
      fr: 'Elle parle couramment trois langues.',
      es: 'Ella habla tres idiomas con fluidez.',
      de: 'Sie spricht drei Sprachen fließend.',
      pt: 'Ela fala três idiomas fluentemente.',
      'zh-CN': '她能流利地讲三种语言。',
      ja: '彼女は3つの言語を流暢に話します。',
      ko: '그녀는 3개 국어를 유창하게 구사합니다.',
      th: 'เธอพูดได้สามภาษาอย่างคล่องแคล่ว',
      hi: 'वह तीन भाषाएँ धाराप्रवाह बोलती हैं।',
    },
    transliterations: { ar: 'Yatahaddath', ja: 'hanasu', ko: 'malhada', th: 'phoot', hi: 'bolna' },
    tags: ['core', 'communication'],
  },
  {
    key: 'read',
    terms: { en: 'read', ar: 'يقرأ', fr: 'lire', es: 'leer', de: 'lesen', pt: 'ler', 'zh-CN': '阅读 / 读', ja: '読む', ko: '읽다', th: 'อ่าน', hi: 'पढ़ना' },
    examples: {
      en: 'Reading books expands your vocabulary rapidly.',
      ar: 'قراءة الكتب تنمي حصيلتك اللغوية بسرعة كبيرة.',
      fr: 'Lire des livres enrichit rapidement votre vocabulaire.',
      es: 'Leer libros amplía tu vocabulario rápidamente.',
      de: 'Bücher zu lesen erweitert Ihren Wortschatz rasch.',
      pt: 'Ler livros expande seu vocabulário rapidamente.',
      'zh-CN': '阅读书籍能迅速扩大你的词汇量。',
      ja: '読書は語彙力を急速に豊かにしてくれます。',
      ko: '책을 읽으면 어휘력이 빠르게 향상됩니다.',
      th: 'การอ่านหนังสือช่วยเพิ่มพูนคำศัพท์ได้อย่างรวดเร็ว',
      hi: 'किताबें पढ़ने से आपकी शब्दावली तेज़ी से बढ़ती है।',
    },
    transliterations: { ar: 'Yaqra\'', ja: 'yomu', ko: 'ikda', th: 'aan', hi: 'padhna' },
    tags: ['core', 'study'],
  },
  {
    key: 'write',
    terms: { en: 'write', ar: 'يكتب', fr: 'écrire', es: 'escribir', de: 'schreiben', pt: 'escrever', 'zh-CN': '书写 / 写', ja: '書く', ko: '쓰다', th: 'เขียน', hi: 'लिखना' },
    examples: {
      en: 'Write down new words to remember them better.',
      ar: 'اكتب الكلمات الجديدة لتتذكرها بشكل أفضل.',
      fr: 'Écrivez les nouveaux mots pour mieux les retenir.',
      es: 'Escribe las palabras nuevas para recordarlas mejor.',
      de: 'Schreiben Sie neue Wörter auf, um sie besser zu behalten.',
      pt: 'Escreva palavras novas para memorizá-las melhor.',
      'zh-CN': '把生词写下来有助于更好地记忆。',
      ja: '新しい単語を書き留めると、より良く記憶できます。',
      ko: '새로운 단어를 직접 쓰면 훨씬 잘 기억할 수 있습니다.',
      th: 'จดคำศัพท์ใหม่ๆ ลงไปเพื่อช่วยให้จำได้ดียิ่งขึ้น',
      hi: 'नए शब्दों को बेहतर ढंग से याद रखने के लिए उन्हें लिखें।',
    },
    transliterations: { ar: 'Yaktub', ja: 'kaku', ko: 'sseuda', th: 'khian', hi: 'likhna' },
    tags: ['core', 'study'],
  },
  {
    key: 'listen',
    terms: { en: 'listen', ar: 'يستمع / ينصت', fr: 'écouter', es: 'escuchar', de: 'hören / zuhören', pt: 'ouvir / escutar', 'zh-CN': '听 / 倾听', ja: '聞く / 耳を傾ける', ko: '듣다', th: 'ฟัง', hi: 'सुनना' },
    examples: {
      en: 'Listen carefully to native pronunciation.',
      ar: 'استمع بانتباه واهتمام لنطق المتحدثين الأصليين.',
      fr: 'Écoutez attentivement la prononciation des locuteurs natifs.',
      es: 'Escucha atentamente la pronunciación de hablantes nativos.',
      de: 'Hören Sie aufmerksam auf die muttersprachliche Aussprache.',
      pt: 'Ouça atentamente a pronúncia dos nativos.',
      'zh-CN': '仔细聆听母语者的地道发音。',
      ja: 'ネイティブスピーカーの発音を注意深く聞いてください。',
      ko: '원어민의 자연스러운 발음을 주의 깊게 들어보세요.',
      th: 'ตั้งใจฟังการออกเสียงของเจ้าของภาษาอย่างรอบคอบ',
      hi: 'मूल वक्ताओं के उच्चारण को ध्यान से सुनें।',
    },
    transliterations: { ar: 'Yastami\'', ja: 'kiku', ko: 'deutda', th: 'fang', hi: 'sunna' },
    tags: ['core', 'study'],
  },
  {
    key: 'understand',
    terms: { en: 'understand', ar: 'يفهم / يدرك', fr: 'comprendre', es: 'entender / comprender', de: 'verstehen', pt: 'entender / compreender', 'zh-CN': '理解 / 明白', ja: '理解する / わかる', ko: '이해하다', th: 'เข้าใจ', hi: 'समझना' },
    examples: {
      en: 'I understand the grammatical concept completely.',
      ar: 'أنا أفهم القاعدة اللغوية فهماً تاماً.',
      fr: 'Je comprends parfaitement ce concept de grammaire.',
      es: 'Entiendo perfectamente este concepto gramatical.',
      de: 'Ich verstehe dieses grammatikalische Konzept vollkommen.',
      pt: 'Eu compreendo este conceito gramatical perfeitamente.',
      'zh-CN': '我完全理解了这个语法概念。',
      ja: 'この文法の概念を完全に理解しました。',
      ko: '이 문법 개념을 완벽하게 이해했습니다.',
      th: 'ฉันเข้าใจหลักไวยากรณ์นี้อย่างถ่องแท้',
      hi: 'मैं इस व्याकरणिक अवधारणा को पूरी तरह समझता हूँ।',
    },
    transliterations: { ar: 'Yafham', ja: 'wakaru', ko: 'ihaehada', th: 'khao-jai', hi: 'samajhna' },
    tags: ['core', 'study'],
  },
  {
    key: 'remember',
    terms: { en: 'remember', ar: 'يتذكر', fr: 'se souvenir', es: 'recordar', de: 'sich erinnern', pt: 'lembrar-se', 'zh-CN': '记住 / 记得', ja: '覚える / 思い出す', ko: '기억하다', th: 'จดจำ', hi: 'याद रखना' },
    examples: {
      en: 'Spaced repetition helps you remember long term.',
      ar: 'التكرار المتباعد يساعدك على التذكر للمدى البعيد.',
      fr: 'La répétition espacée aide à se souvenir durablement.',
      es: 'La repetición espaciada te ayuda a recordar a largo plazo.',
      de: 'Abstandswiederholung hilft Ihnen, sich langfristig zu erinnern.',
      pt: 'A repetição espaçada ajuda você a lembrar a longo prazo.',
      'zh-CN': '间隔重复能帮助你形成长久的长期记忆。',
      ja: '間隔反復法は長期的な記憶の定着に大いに役立ちます。',
      ko: '간격 반복은 오랫동안 기억을 유지하는 데 큰 도움이 됩니다.',
      th: 'การทบทวนแบบเว้นระยะช่วยให้คุณจดจำได้ในระยะยาว',
      hi: 'अंतराल पुनरावृत्ति आपको लंबे समय तक याद रखने में मदद करती है।',
    },
    transliterations: { ar: 'Yatadhakkar', ja: 'oboeru', ko: 'gieokhada', th: 'jot-jam', hi: 'yaad rakhna' },
    tags: ['core', 'study'],
  },
  {
    key: 'practice',
    terms: { en: 'practice', ar: 'يمارس / يتدرب', fr: 'pratiquer', es: 'practicar', de: 'üben / praktizieren', pt: 'praticar', 'zh-CN': '练习 / 实践', ja: '練習する / 実践する', ko: '연습하다', th: 'ฝึกฝน', hi: 'अभ्यास करना' },
    examples: {
      en: 'Practice speaking with confidence every day.',
      ar: 'مارس المحادثة بثقة وعزيمة كل يوم.',
      fr: 'Pratiquez l’expression orale avec confiance chaque jour.',
      es: 'Practica hablar con confianza todos los días.',
      de: 'Üben Sie jeden Tag selbstbewusst das Sprechen.',
      pt: 'Pratique a conversação com confiança todos os dias.',
      'zh-CN': '每天充满自信地练习口语表达。',
      ja: '毎日自信を持ってスピーキングを練習しましょう。',
      ko: '매일 자신감을 가지고 말하기를 연습하세요.',
      th: 'ฝึกพูดด้วยความมั่นใจในทุกๆ วัน',
      hi: 'हर दिन आत्मविश्वास के साथ बोलने का अभ्यास करें।',
    },
    transliterations: { ar: 'Yumaaris', ja: 'renshuu suru', ko: 'yeonseuphada', th: 'fuek-fon', hi: 'abhyas karna' },
    tags: ['core', 'study'],
  },
  {
    key: 'color_blue',
    terms: { en: 'blue', ar: 'أزرق', fr: 'bleu', es: 'azul', de: 'blau', pt: 'azul', 'zh-CN': '蓝色', ja: '青 / 青い', ko: '파란색', th: 'สีน้ำเงิน / สีฟ้า', hi: 'नीला' },
    examples: {
      en: 'The deep blue ocean is peaceful and calm.',
      ar: 'المحيط الأزرق العميق هادئ وساحر.',
      fr: 'L’océan bleu profond est calme et apaisant.',
      es: 'El océano azul profundo es sereno y tranquilo.',
      de: 'Der tiefblaue Ozean ist friedlich und ruhig.',
      pt: 'O oceano azul profundo é calmo e sereno.',
      'zh-CN': '深蓝色的海洋宁静而壮阔。',
      ja: '深い青色の海は穏やかで安らぎに満ちています。',
      ko: '짙푸른 바다는 평화롭고 고요합니다.',
      th: 'มหาสมุทรสีน้ำเงินเข้มดูสงบและผ่อนคลาย',
      hi: 'गहरा नीला समुद्र शांत और स्थिर है।',
    },
    transliterations: { ar: 'Azraq', ja: 'aoi', ko: 'paransaek', th: 'see-nam-ngern', hi: 'neela' },
    tags: ['colors'],
  },
  {
    key: 'color_green',
    terms: { en: 'green', ar: 'أخضر', fr: 'vert', es: 'verde', de: 'grün', pt: 'verde', 'zh-CN': '绿色', ja: '緑 / 緑色', ko: '초록색', th: 'สีเขียว', hi: 'हरा' },
    examples: {
      en: 'Green tea leaves nourish both mind and body.',
      ar: 'تغذي أوراق الشاي الأخضر العقل والجسد.',
      fr: 'Les feuilles de thé vert nourrissent le corps et l’esprit.',
      es: 'Las hojas de té verde nutren el cuerpo y la mente.',
      de: 'Grüne Teeblätter beleben Körper und Geist.',
      pt: 'As folhas de chá verde nutrem o corpo e a mente.',
      'zh-CN': '翠绿的茶叶滋养身心。',
      ja: '緑茶の茶葉は心と体の両方を癒やします。',
      ko: '녹색 찻잎은 몸과 마음에 활력을 줍니다.',
      th: 'ใบชาเขียวช่วยบำรุงทั้งร่างกายและจิตใจ',
      hi: 'हरी चाय की पत्तियाँ शरीर और मन दोनों को पोषण देती हैं।',
    },
    transliterations: { ar: 'Akhdar', ja: 'midori', ko: 'choroksaek', th: 'see-khiao', hi: 'hara' },
    tags: ['colors'],
  },
  {
    key: 'color_red',
    terms: { en: 'red', ar: 'أحمر', fr: 'rouge', es: 'rojo', de: 'rot', pt: 'vermelho', 'zh-CN': '红色', ja: '赤 / 赤い', ko: '빨간색', th: 'สีแดง', hi: 'लाल' },
    examples: {
      en: 'The crimson red sunset lit up the evening sky.',
      ar: 'أضاء غروب الشمس الأحمر سماء المساء بجماله.',
      fr: 'Le coucher de soleil rouge a illuminé le ciel du soir.',
      es: 'La puesta de sol roja iluminó el cielo del atardecer.',
      de: 'Der rote Sonnenuntergang erleuchtete den Abendhimmel.',
      pt: 'O pôr do sol avermelhado iluminou o céu no fim de tarde.',
      'zh-CN': '红色的落日晚霞映红了整个傍晚的天空。',
      ja: '赤い夕焼けが夕暮れの空を美しく染め上げました。',
      ko: '붉은 노을이 저녁 하늘을 화려하게 수놓았습니다.',
      th: 'พระอาทิตย์ตกดินสีแดงส่องประกายสว่างไสวทั่วท้องฟ้ายามเย็น',
      hi: 'लाल सूर्यास्त ने शाम के आसमान को रोशन कर दिया।',
    },
    transliterations: { ar: 'Ahmar', ja: 'aka', ko: 'ppalgansaek', th: 'see-daeng', hi: 'laal' },
    tags: ['colors'],
  },
  {
    key: 'color_white',
    terms: { en: 'white', ar: 'أبيض', fr: 'blanc', es: 'blanco', de: 'weiß', pt: 'branco', 'zh-CN': '白色', ja: '白 / 白い', ko: '하얀색 / 백색', th: 'สีขาว', hi: 'सफ़ेद' },
    examples: {
      en: 'Pure white snow covered the rooftops gracefully.',
      ar: 'غطى الثلج الأبيض النقي أسطح المنازل بروعة.',
      fr: 'La neige blanche et pure a recouvert les toits avec grâce.',
      es: 'La nieve blanca y pura cubrió los tejados con elegancia.',
      de: 'Reiner weißer Schnee bedeckte die Dächer.',
      pt: 'A neve branca e pura cobriu os telhados suavemente.',
      'zh-CN': '纯白无瑕的积雪轻柔地覆盖了屋顶。',
      ja: '純白の雪が屋根を優雅に覆っていました。',
      ko: '새하얀 눈이 지붕 위를 부드럽게 뒤덮었습니다.',
      th: 'หิมะสีขาวบริสุทธิ์ปกคลุมหลังคาอย่างงดงาม',
      hi: 'शुद्ध सफ़ेद बर्फ ने छतों को सुंदरता से ढक दिया।',
    },
    transliterations: { ar: 'Abyad', ja: 'shiro', ko: 'hayansaek', th: 'see-khao', hi: 'safed' },
    tags: ['colors'],
  },
  {
    key: 'number_one',
    terms: { en: 'one', ar: 'واحد', fr: 'un', es: 'uno', de: 'eins', pt: 'um', 'zh-CN': '一', ja: '一 (いち)', ko: '하나 / 일', th: 'หนึ่ง', hi: 'एक' },
    examples: {
      en: 'One habit practiced daily can transform your life.',
      ar: 'عادة واحدة تمارسها يومياً قادرة على تغيير حياتك.',
      fr: 'Une seule habitude quotidienne peut transformer votre vie.',
      es: 'Un solo hábito practicado a diario puede transformar tu vida.',
      de: 'Eine einzige tägliche Gewohnheit kann Ihr Leben verändern.',
      pt: 'Um único hábito praticado diariamente pode transformar sua vida.',
      'zh-CN': '一个坚持每天践行的好习惯能够改变整个人生。',
      ja: '毎日続けるひとつの習慣が人生を大きく変える力になります。',
      ko: '매일 실천하는 단 하나의 좋은 습관이 인생을 변화시킵니다.',
      th: 'นิสัยที่ดีเพียงหนึ่งอย่างที่ทำทุกวันสามารถเปลี่ยนชีวิตคุณได้',
      hi: 'प्रतिदिन अभ्यास की जाने वाली एक आदत आपके जीवन को बदल सकती है।',
    },
    transliterations: { ar: 'Waahid', ja: 'ichi', ko: 'hana', th: 'nueng', hi: 'ek' },
    tags: ['numbers'],
  },
  {
    key: 'number_two',
    terms: { en: 'two', ar: 'اثنان', fr: 'deux', es: 'dos', de: 'zwei', pt: 'dois', 'zh-CN': '二', ja: '二 (に)', ko: '둘 / 이', th: 'สอง', hi: 'दो' },
    examples: {
      en: 'Review two cards every morning to start strong.',
      ar: 'راجع بطاقتين كل صباح لتبدأ يومك بقوة ونشاط.',
      fr: 'Révisez deux cartes chaque matin pour bien démarrer.',
      es: 'Repasa dos tarjetas cada mañana para empezar con energía.',
      de: 'Wiederholen Sie jeden Morgen zwei Karten für einen guten Start.',
      pt: 'Revise dois cartões todas as manhãs para começar bem o dia.',
      'zh-CN': '每天清晨复习两张卡片，开启充满活力的一天。',
      ja: '毎朝2枚のカードを復習して、充実した一日を始めましょう。',
      ko: '매일 아침 카드 두 장을 복습하며 힘차게 하루를 시작하세요.',
      th: 'ทบทวนการ์ดสองใบทุกเช้าเพื่อเริ่มต้นวันใหม่อย่างสดใส',
      hi: 'शानदार शुरुआत के लिए हर सुबह दो कार्ड्स का अभ्यास करें।',
    },
    transliterations: { ar: 'Ithnaan', ja: 'ni', ko: 'dul', th: 'song', hi: 'do' },
    tags: ['numbers'],
  },
  {
    key: 'number_ten',
    terms: { en: 'ten', ar: 'عشرة', fr: 'dix', es: 'diez', de: 'zehn', pt: 'dez', 'zh-CN': '十', ja: '十 (じゅう)', ko: '열 / 십', th: 'สิบ', hi: 'दस' },
    examples: {
      en: 'Complete ten reviews daily to build an unstoppable streak.',
      ar: 'أكمل عشر مراجعات يومياً لبناء سلسلة تعلم متواصلة ورائعة.',
      fr: 'Faites dix révisions par jour pour consolider votre série.',
      es: 'Completa diez repasos diarios para mantener tu racha.',
      de: 'Schließen Sie täglich zehn Wiederholungen ab für eine starke Serie.',
      pt: 'Complete dez revisões diárias para manter sua sequência ativa.',
      'zh-CN': '每天完成十次复习，打造牢不可破的学习连续记录。',
      ja: '毎日10回の復習を達成して、学習ストリークを伸ばしましょう。',
      ko: '매일 10장의 카드를 복습하여 멋진 학습 연속 기록을 세우세요.',
      th: 'ทบทวนวันละสิบครั้งเพื่อสร้างสถิติการเรียนรู้อย่างต่อเนื่อง',
      hi: 'एक अटूट स्ट्रीक बनाने के लिए प्रतिदिन दस समीक्षाएं पूरी करें।',
    },
    transliterations: { ar: "'Asharah", ja: 'juu', ko: 'yeol', th: 'sip', hi: 'das' },
    tags: ['numbers'],
  },
  {
    key: 'always',
    terms: { en: 'always', ar: 'دائماً', fr: 'toujours', es: 'siempre', de: 'immer', pt: 'sempre', 'zh-CN': '总是 / 始终', ja: 'いつも / 常に', ko: '항상 / 언제나', th: 'เสมอ / ตลอดเวลา', hi: 'हमेशा / सदैव' },
    examples: {
      en: 'Keep your curiosity alive; always seek to understand.',
      ar: 'حافظ على شغفك المعرفي؛ واسعَ دائماً للفهم والاستيعاب.',
      fr: 'Gardez votre curiosité vive ; cherchez toujours à comprendre.',
      es: 'Mantén viva tu curiosidad; busca siempre comprender.',
      de: 'Bewahren Sie Ihre Neugier; bemühen Sie sich stets zu verstehen.',
      pt: 'Mantenha a curiosidade viva; busque sempre compreender.',
      'zh-CN': '始终保持求知欲，时刻努力去探索与理解。',
      ja: '探究心を持ち続け、常に理解しようと努めましょう。',
      ko: '호기심을 잃지 말고 언제나 깊이 이해하려 노력하세요.',
      th: 'รักษาความอยากรู้อยากเห็นไว้เสมอ และมุ่งมั่นที่จะทำความเข้าใจ',
      hi: 'अपनी जिज्ञासा को जीवित रखें; हमेशा समझने का प्रयास करें।',
    },
    transliterations: { ar: "Daa'iman", ja: 'itsumo', ko: 'hangsang', th: 'sa-moe', hi: 'hamesha' },
    tags: ['adverbs'],
  },
  {
    key: 'never',
    terms: { en: 'never', ar: 'أبداً / قط', fr: 'jamais', es: 'nunca / jamás', de: 'niemals / nie', pt: 'nunca / jamais', 'zh-CN': '从不 / 绝不', ja: '決して〜ない', ko: '결코 ~않다', th: 'ไม่เคย', hi: 'कभी नहीं' },
    examples: {
      en: 'Never give up when facing a linguistic hurdle.',
      ar: 'لا تستسلم أبداً عند مواجهة أي صعوبة لغوية.',
      fr: 'N’abandonnez jamais face à une difficulté linguistique.',
      es: 'Nunca te rindas al enfrentar una dificultad con el idioma.',
      de: 'Geben Sie niemals auf, wenn Sie vor sprachlichen Hürden stehen.',
      pt: 'Nunca desista ao enfrentar um obstáculo no aprendizado.',
      'zh-CN': '面对语言学习的难关时，绝不要轻言放弃。',
      ja: '語学の壁にぶつかっても、決して諦めないでください。',
      ko: '언어의 장벽에 부딪히더라도 결코 포기하지 마세요.',
      th: 'อย่ายอมแพ้เมื่อต้องเผชิญกับอุปสรรคทางภาษา',
      hi: 'भाषाई बाधा का सामना करते समय कभी हार न मानें।',
    },
    transliterations: { ar: "Abadan", ja: 'kesshite', ko: 'gyeolko', th: 'mai-khoei', hi: 'kabhi nahi' },
    tags: ['adverbs'],
  },
  {
    key: 'now',
    terms: { en: 'now', ar: 'الآن / حالياً', fr: 'maintenant', es: 'ahora', de: 'jetzt', pt: 'agora', 'zh-CN': '现在 / 目前', ja: '今 / 現在', ko: '지금 / 현재', th: 'ตอนนี้ / เดี๋ยวนี้', hi: 'अब / अभी' },
    examples: {
      en: 'The best time to start learning is right now.',
      ar: 'أفضل وقت لتبدأ رحلة التعلم هو الآن.',
      fr: 'Le meilleur moment pour commencer à apprendre, c’est maintenant.',
      es: 'El mejor momento para comenzar a aprender es ahora mismo.',
      de: 'Der beste Zeitpunkt zum Lernen anzufangen ist genau jetzt.',
      pt: 'O melhor momento para começar a aprender é agora.',
      'zh-CN': '开启学习旅程的最佳时刻就是此时此刻。',
      ja: '学びをスタートするのに最もふさわしい瞬間は今です。',
      ko: '새로운 배움을 시작하기에 가장 완벽한 때는 바로 지금입니다.',
      th: 'เวลาที่ดีที่สุดในการเริ่มต้นเรียนรู้คือตอนนี้',
      hi: 'सीखना शुरू करने का सबसे अच्छा समय अभी है।',
    },
    transliterations: { ar: 'Al-aan', ja: 'ima', ko: 'jigeum', th: 'ton-nee', hi: 'ab' },
    tags: ['time'],
  },
  {
    key: 'here',
    terms: { en: 'here', ar: 'هنا', fr: 'ici', es: 'aquí / acá', de: 'hier', pt: 'aqui', 'zh-CN': '这里 / 此处', ja: 'ここ / こちら', ko: '여기 / 이곳', th: 'ที่นี่', hi: 'यहाँ' },
    examples: {
      en: 'Your learning journey begins right here with 7ifd.',
      ar: 'رحلتك التعليمية الممتعة تبدأ من هنا مع تطبيق 7ifd.',
      fr: 'Votre voyage d’apprentissage commence ici avec 7ifd.',
      es: 'Tu viaje de aprendizaje comienza justo aquí con 7ifd.',
      de: 'Ihre Lernreise beginnt genau hier mit 7ifd.',
      pt: 'Sua jornada de aprendizado começa bem aqui com o 7ifd.',
      'zh-CN': '你的卓越语言学习之旅就在 7ifd 这里扬帆起航。',
      ja: 'あなたの語学の旅は、まさにここ7ifdから始まります。',
      ko: '당신의 멋진 언어 여정은 바로 여기 7ifd에서 시작됩니다.',
      th: 'การเดินทางสู่การเรียนรู้ภาษาของคุณเริ่มต้นที่นี่กับ 7ifd',
      hi: 'आपकी सीखने की यात्रा 7ifd के साथ यहीं से शुरू होती है।',
    },
    transliterations: { ar: 'Hunaa', ja: 'koko', ko: 'yeogi', th: 'thee-nee', hi: 'yahan' },
    tags: ['places'],
  },
  {
    key: 'there',
    terms: { en: 'there', ar: 'هناك', fr: 'là-bas', es: 'allí / allá', de: 'dort / da', pt: 'lá / ali', 'zh-CN': '那里 / 彼处', ja: 'あそこ / あちら', ko: '거기 / 저곳', th: 'ที่นั่น', hi: 'वहाँ' },
    examples: {
      en: 'The language library is over there on the third floor.',
      ar: 'تقع مكتبة اللغات هناك في الطابق الثالث.',
      fr: 'La bibliothèque de langues se trouve là-bas au troisième étage.',
      es: 'La biblioteca de idiomas está allí en el tercer piso.',
      de: 'Die Sprachbibliothek befindet sich dort im dritten Stock.',
      pt: 'A biblioteca de idiomas fica ali no terceiro andar.',
      'zh-CN': '语言图书馆就在那边的三楼。',
      ja: '語学ライブラリーはあちらの3階にございます。',
      ko: '어학 도서관은 저기 3층에 위치해 있습니다.',
      th: 'ห้องสมุดภาษาตั้งอยู่ตรงนั้นบนชั้นสาม',
      hi: 'भाषा पुस्तकालय वहाँ तीसरी मंज़िल पर है।',
    },
    transliterations: { ar: 'Hunaak', ja: 'asoko', ko: 'jeogi', th: 'thee-nan', hi: 'wahan' },
    tags: ['places'],
  },
];

/**
 * Returns exactly 50 authentic, high-quality cards for any chosen category, language, and level.
 * Genuinely translated into all 11 languages with natural sentences and correct phonetics.
 */
export function get50CardsForLevel(
  targetLanguage: LanguageCode,
  categoryId: string,
  level: CEFRLevel
): BundledCard[] {
  const primaryDomainItems = DOMAIN_DATA_MAP[categoryId] || DOMAIN_DATA_MAP['everyday-essentials'];
  const cards: BundledCard[] = [];

  // Track added keys to ensure strict uniqueness
  const addedKeys = new Set<string>();

  const addCardFromItem = (item: MultilingualVocabItem) => {
    if (cards.length >= 50) return;
    if (addedKeys.has(item.key)) return;
    addedKeys.add(item.key);

    const cardId = `${targetLanguage}-${categoryId}-${level}-${String(cards.length + 1).padStart(3, '0')}`;
    const term = item.terms[targetLanguage] || item.terms['en'];
    const example = item.examples[targetLanguage] || item.examples['en'];

    cards.push({
      id: cardId,
      term,
      translations: item.terms,
      exampleSentence: example,
      exampleTranslations: item.examples,
      transliteration: item.transliterations?.[targetLanguage],
      pronunciation: item.pronunciations?.[targetLanguage],
      tags: [categoryId, level.toLowerCase(), ...item.tags],
    });
  };

  // 1. Add primary domain items first
  primaryDomainItems.forEach(addCardFromItem);

  // 2. Add core language pack items
  CORE_LANGUAGE_PACK.forEach(addCardFromItem);

  // 3. If still under 50, draw from adjacent complementary domain packs
  const otherDomainKeys = Object.keys(DOMAIN_DATA_MAP);
  for (const dk of otherDomainKeys) {
    if (cards.length >= 50) break;
    const otherItems = DOMAIN_DATA_MAP[dk] || [];
    for (const item of otherItems) {
      if (cards.length >= 50) break;
      addCardFromItem(item);
    }
  }

  return cards.slice(0, 50);
}

/**
 * Returns a fully configured BundledDeck containing exactly 50 cards
 */
export function getDeckWith50Cards(
  targetLanguage: LanguageCode,
  categoryId: string,
  level: CEFRLevel
): BundledDeck {
  const cards = get50CardsForLevel(targetLanguage, categoryId, level);

  const title: Record<LanguageCode, string> = {
    en: `Vocabulary Level ${level} (50 Cards)`,
    ar: `المستوى ${level} (50 بطاقة معتمدة)`,
    fr: `Vocabulaire Niveau ${level} (50 Cartes)`,
    es: `Vocabulario Nivel ${level} (50 Tarjetas)`,
    de: `Wortschatz Niveau ${level} (50 Karten)`,
    pt: `Vocabulário Nível ${level} (50 Cartões)`,
    'zh-CN': `${level} 级别词汇 (50张全译卡片)`,
    ja: `${level} レベル語彙 (50枚の完全カード)`,
    ko: `${level} 레벨 어휘 (50장 완전 덱)`,
    th: `คำศัพท์ระดับ ${level} (50 การ์ดสมบูรณ์)`,
    hi: `${level} स्तर शब्दावली (50 पूर्ण कार्ड)`,
  };

  const description: Record<LanguageCode, string> = {
    en: `Official 50-card spaced repetition deck for ${level} level.`,
    ar: `مجموعة متكاملة تضم 50 بطاقة تعليمية أصلية ومترجمة بالكامل مع أمثلة ونطق صوتي للمستوى ${level}.`,
    fr: `Paquet complet de 50 cartes d'apprentissage avec traductions et exemples pour le niveau ${level}.`,
    es: `Mazo completo de 50 tarjetas de estudio con traducciones y ejemplos para el nivel ${level}.`,
    de: `Vollständiger Stapel mit 50 Karten mit Übersetzungen und Beispielen für das Niveau ${level}.`,
    pt: `Baralho completo com 50 cartões de estudo com traduções e exemplos para o nível ${level}.`,
    'zh-CN': `${level} 级别 50 张完整双语学习卡组，附带丰富例句。`,
    ja: `${level}レベル公式50枚完全デッキ（例文・発音付き）。`,
    ko: `${level} 레벨 공식 50장 완전 덱 (예문 및 발음 지원).`,
    th: `สำรับทางการ 50 การ์ดพร้อมตัวอย่างและคำแปลสำหรับระดับ ${level}`,
    hi: `${level} स्तर के लिए 50 कार्ड का प्रामाणिक डेक।`,
  };

  return {
    id: `deck-${targetLanguage}-${categoryId}-${level}`,
    targetLanguage,
    categoryId,
    level,
    title,
    description,
    version: 1,
    cards,
  };
}
