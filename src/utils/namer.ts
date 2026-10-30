import { choose } from './random';

export interface Book {
  content: string;
  title: string;
  author: string;
  book: string;
  dynasty: string;
}

export interface GeneratedName {
  name: string;
  sentence: string;
  content: string;
  title: string;
  author: string;
  book: string;
  dynasty: string;
}

// 文言虚词：随机拼进名字几乎必然违和（如「焉逍」「乎考」「至于」），直接剔除
const FUNCTION_CHARS =
  '之乎者也焉哉兮矣耶欤邪耳汝尔其以于与则且而所已夫盖莫未无弗勿毋匪非不彼此斯然予';
// 语义不宜入名的字，在原有基础上补充
const BAD_CHARS =
  '胸鬼懒禽鸟鸡我邪罪凶丑仇鼠蟋蟀淫秽妹狐鸭蝇悔鱼肉苦犬吠窥血丧饥女搔父母昏狗蟊疾病痛死潦哀痒害蛇牲妇狸鹅穴畜烂兽靡爪氓劫鬣螽毛婚姻匪婆羞辱尸哭魂魄殇坟墓盗贼寇囚奴仆婢妾王';
// 近年新生儿重名高频字（公安部历年姓名报告），降权而非禁用
const TRENDY_CHARS = '梓涵宇轩辰泽宸沐汐玥诺欣怡彤萱嫣熙奕亦伊诗雪若沫琪睿皓昊铭晨';
// 语料中常见、适合入名的字：隔字组名时双方都必须来自这里
const NAME_CHARS =
  '日月星辰云霞霄晖曦虹昀昭旭昊暾山川岳峰峦江河海洋波涛渊泽溪涧泉林野原洲浦谷桐松柏兰芷蕙荃荷莲菡萏薇芃竹梅柳桑葛苇蒲桃李杏棠菱芳芬馨馥菲蓁舜琼瑶璇玑珂琛璧璋珮环瑗瑾瑜琳琅璜珩锦绣缨佩玖琴瑟钟笙磬箫歌谣音律韵鸣籁韶弦仁德义礼智信忠孝廉贞静淑贤哲明睿敏惠温良恭俭诚正雅纯素朴真嘉懿慎笃敬肃毅刚坚卓方端庄厚谦允威志弘远图勋功业成达通济立建树兴邦桢栋梁材器勉勤竞锐进翔腾绍世国光辉耀煌炜炽烨煜熹灿烁熠晓旦凤凰麟骥鸿鹤燕雁驹骏骐鸾鹄鹭鹿安乐宁泰和悦怡欣愉恬适畅怀慕思清澈澄湛泠汀沚渌泓润沛霖露春秋朝岁华年时子君攸令仪修英俊杰彦文章翰书维绥靖定平广博丰茂盛昌隆瑞祥禧祜祺祉祎佑启承继延家楚灼衿舒翼绵永恒久致澹泊雝戬';
// 语料中成词且适合入名的叠词，其余叠词（肃肃、济济、纯纯之类）一律剔除
const REDUP_WORDS = '依依霏霏悠悠蓁蓁呦呦楚楚翩翩湛湛';
// 精选词表：语料实证适合入名的整词，命中者加分（静姝、德音、思成这个级别）
const NAME_WORDS =
  '德音采薇懿德骐骥湛露令德佩玖采菲燕婉秋兰嘉树舜华怀瑾芳洲嘉月琼玖徽音思成安歌汀洲琼琚零露凰翔秉德威仪松茂哲维恬愉继业琳琅原野平原厚德信修忠诚广志诚信忠信采菱秀雅鸾凤贤良璇玑正义琴书溪涧忠贞忠正琴瑟鸿雁凤凰川谷宜修松柏兰芷荃蕙盛德鸿鹄舒志修竹竹柏仁义贞良兰英兰蕙峻茂舒窈荷华清扬琼华朝霞乐康齐光瑶华素华蕙华卓远丰隆淑离婵媛清馨淑清成林朝露瑶光昭明昭华文采贤达音信素琴竹林野鹤竹露野鹿晓露信音鹤立澄川弦桐温润惠思衿悠鹿鸣鹤鸣明昭灵修秋霖怀德思忠怀兰桑林梁燕锦瑟晓钟邦家山川思文芳馨修能年岁平乐愉乐清澈芬芳远志山林英华永年清泠江洲桃李贤哲锦绣恭承菡萏忠良功勋建章琼瑶音书环佩锦书竞秀恒韵灼烁茂林贞信永宁丰年修远延年芳菲思灵芳芷望舒云霏永思云依芳芬采莲素书星文柳依磬音松竹静姝静好攸宁令仪子衿子佩巧倩美盼如英如雪婉如淑慎惠然灼华辰良耿介若英沅芷澧兰陶然';
const NAME_WORD_SET = new Set(NAME_WORDS.match(/.{2}/g));

const FUNCTION_SET = new Set(FUNCTION_CHARS.split(''));
const BAD_SET = new Set(BAD_CHARS.split(''));
const TRENDY_SET = new Set(TRENDY_CHARS.split(''));
const NAME_CHAR_SET = new Set(NAME_CHARS.split(''));
const REDUP_SET = new Set(REDUP_WORDS.split(''));
// 实测高频误产的真实词：是词但不宜做名，直接排除
const JUNK_WORDS = '明星四国钟鼓乐子天子齐子谷维时维留子鼓乐文王';
const JUNK_SET = new Set(JUNK_WORDS.match(/.{2}/g));

const CJK_RE = /[^\u4e00-\u9fff]/g;

interface Candidate {
  name: string;
  sentence: string;
  passage: Book;
  score: number;
}

const SENTENCE_DRAWS = 24;
const MAX_WORD_FREQ = 5;
const RECENT_LIMIT = 40;

export class Namer {
  bookData: Book[] | null = null;
  loading: boolean = false;
  // 全典籍相邻二字的出现次数，用于给「像词」的字组加分（#41 的思路）
  wordFreq: Map<string, number> = new Map();
  // 最近出过的名字：冷却一轮，避免「换一组」总撞出同几个高频词
  recentNames: string[] = [];

  async loadBook(bookName: string): Promise<void> {
    this.loading = true;
    try {
      const response = await fetch(`./json/${bookName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${bookName}`);
      }
      const data = await response.json();
      this.bookData = data;
      this.buildWordFreq(data);
      console.log(`${bookName} loaded`);
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  // 统计每本书里相邻二字组合的频次：反复出现的字组大概率是词
  buildWordFreq(data: Book[]): void {
    this.wordFreq = new Map();
    for (const passage of data) {
      const chars = this.cleanChars(passage.content);
      for (let i = 0; i < chars.length - 1; i++) {
        const word = chars.slice(i, i + 2);
        this.wordFreq.set(word, (this.wordFreq.get(word) || 0) + 1);
      }
    }
  }

  formatStr(str: string): string {
    let res = str.replace(/(\s|\u3000|\u201d|\u201c){1,}|<br>|<p>|<\/p>/g, '');
    res = res.replace(/\(.+\)/g, '');
    return res;
  }

  // 只保留汉字：引号、书名号等符号不再混进名字（#47）
  cleanChars(content: string): string {
    return this.formatStr(content || '')
      .replace(/\(.+?\)/g, '')
      .replace(CJK_RE, '');
  }

  splitSentence(content: string): string[] {
    if (!content) {
      return [];
    }
    let str = this.formatStr(content);
    str = str.replace(/！|。|？|；/g, (s) => `${s}|`);
    str = str.replace(/\|$/g, '');
    const arr = str.split('|');
    return arr.filter((item) => item.length >= 2);
  }

  genName(): GeneratedName | null {
    if (!this.bookData || this.bookData.length === 0) {
      return null;
    }

    try {
      const candidates: Candidate[] = [];
      const seen = new Set<string>();

      for (let i = 0; i < SENTENCE_DRAWS; i++) {
        const passage = choose(this.bookData);
        const sentenceArr = this.splitSentence(passage.content);
        if (sentenceArr.length === 0) {
          continue;
        }
        const sentence = choose(sentenceArr);
        this.collectCandidates(sentence, passage, candidates, seen);
      }

      if (candidates.length === 0) {
        return null;
      }

      candidates.sort((a, b) => b.score - a.score);
      const picked = this.pickCandidate(candidates.slice(0, 3));
      this.recentNames.push(picked.name);
      if (this.recentNames.length > RECENT_LIMIT) {
        this.recentNames.shift();
      }

      return {
        name: picked.name,
        sentence: picked.sentence,
        content: picked.passage.content,
        title: picked.passage.title,
        author: picked.passage.author,
        book: picked.passage.book,
        dynasty: picked.passage.dynasty,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // 从一句诗里收集候选名：相邻二字组（大概率成词）为主，可入名字的隔字组合作补充
  collectCandidates(
    sentence: string,
    passage: Book,
    out: Candidate[],
    seen: Set<string>
  ): void {
    const chars = this.cleanChars(sentence).split('');
    if (chars.length < 2) {
      return;
    }
    for (let i = 0; i < chars.length - 1; i++) {
      this.pushCandidate(chars[i] + chars[i + 1], sentence, passage, 24, out, seen);
      for (let j = i + 2; j <= i + 4 && j < chars.length; j++) {
        if (NAME_CHAR_SET.has(chars[i]) && NAME_CHAR_SET.has(chars[j])) {
          this.pushCandidate(chars[i] + chars[j], sentence, passage, 10, out, seen);
        }
      }
    }
  }

  pushCandidate(
    name: string,
    sentence: string,
    passage: Book,
    base: number,
    out: Candidate[],
    seen: Set<string>
  ): void {
    if (seen.has(name) || this.recentNames.includes(name)) {
      return;
    }
    const chars = name.split('');
    if (
      chars.some((ch) => FUNCTION_SET.has(ch) || BAD_SET.has(ch)) ||
      JUNK_SET.has(name)
    ) {
      return;
    }
    if (chars[0] === chars[1] && !REDUP_SET.has(name)) {
      return;
    }
    const curated = chars.filter((ch) => NAME_CHAR_SET.has(ch)).length;
    const freq = this.wordFreq.get(name) || 0;
    // 相邻字组至少要有词频或可入名字撑腰，纯路人字组直接不要
    if (curated === 0 && freq < 2) {
      return;
    }
    let score = base;
    if (NAME_WORD_SET.has(name)) {
      score += 18;
    }
    score += Math.min(freq, MAX_WORD_FREQ) * 2;
    score += curated * 8;
    score -= chars.filter((ch) => TRENDY_SET.has(ch)).length * 14;
    seen.add(name);
    out.push({ name, sentence, passage, score });
  }

  // 高分候选加权随机：保留「不期而遇」的随机感，但只在好名字里随机
  pickCandidate(top: Candidate[]): Candidate {
    const weights = [5, 2, 1].slice(0, top.length);
    let r = Math.random() * weights.reduce((sum, w) => sum + w, 0);
    for (let i = 0; i < top.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        return top[i];
      }
    }
    return top[top.length - 1];
  }
}
