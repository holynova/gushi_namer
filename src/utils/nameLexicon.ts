const toCharSet = (value: string): Set<string> =>
  new Set(Array.from(value.replace(/\s+/g, '')))

export const FORBIDDEN_NAME_CHARS = toCharSet(`
  胸鬼懒禽鸡邪罪凶丑仇鼠蟋蟀淫秽狐鸭蝇悔肉苦犬吠窥血丧饥搔
  昏狗蟊疾病痛死潦哀痒害蛇牲妇狸鹅穴畜烂兽靡爪氓劫鬣螽
  匪婆羞辱恶怨恨毒祸灾殃亡悲哭愁忧惧恐贪偷盗抢骗杀屠尸
  坟墓残败破腐臭脏污饿穷贫困奴婢妓赌疯痴傻蠢笨蚊蟑蟆蝎
  屁尿屎痰癌瘤疮疤伤
`)

export const HARD_FUNCTION_CHARS = toCharSet('的了呢吗啊吧呀么者乎矣焉哉而于以乃则所')
export const SOFT_FUNCTION_CHARS = toCharSet('之其兮子与为及又亦犹尚')
export const RESTRICTED_COMBINATION_CHARS = toCharSet('如若然可乐欢')

export const HIGH_FREQUENCY_NAME_CHARS = toCharSet(`
  安柏博辰宸晨成诚承澄楚春淳丹恩凡飞霏丰枫峰凤芙光涵翰航昊浩和
  恒弘宏鸿华欢晖辉惠慧嘉洁杰瑾锦景靖静君俊康可兰岚朗乐礼丽莲良
  亮林琳霖灵玲凌柳曼梅美梦妙明鸣铭沐慕南楠宁佩鹏琪祺启谦倩清
  卿庆秋泉然仁荣容柔如瑞睿润若山善舒姝淑思松颂泰棠涛天婷庭桐
  童维文雯熙溪曦霞夏贤翔晓欣新信星修秀旭轩宣雪雅言妍彦燕扬阳
  洋尧瑶依怡宜毅逸奕懿音英莹盈颖悠友佑瑜宇羽雨玉煜元远岳云芸
  韵泽昭哲真珍臻正知智致舟洲竹卓
`)

export const COMMON_NAME_CHARS = toCharSet(`
  艾爱昂奥白邦保宝贝蓓碧彬斌冰秉才灿策昌畅超驰纯慈聪翠达岱道德
  笛冬栋芳芬刚歌格庚功恭谷广桂国果海含寒豪赫洪焕桓佳健江捷晋炯
  菊筠峻凯柯克宽坤蕾廉梁璐露洛萌敏木诺萍璞齐强乔琴勤青韶深升生
  声胜诗时实书树舜素穗韬甜万望威微薇巍武舞玄笑心兴岩耀叶晔一仪
  益吟勇优媛育振中忠姿梓宗志温悦敬令攸邦苏扶怀行闻章希念朝归长
  达甫简典朴绍康田牧原易同初映照凝烟寻语墨砚
`)

export const POETIC_NAME_CHARS = toCharSet(`
  苍沧川池潮澈澜浦渊渚汀汐湘河湖霄霁霜雷风虹晴暄暮闲
  荷芷蕙菲桃榆琼璧珏琅珩璇珠雁鹤翎陶旗均月日星
`)

export const KNOWN_POETIC_PAIRS = new Set([
  '清扬', '静姝', '思远', '嘉树', '维桢', '怀瑾', '景行', '子衿',
  '扶苏', '令仪', '柔嘉', '舒窈', '攸宁', '邦彦', '翰飞', '乔木',
  '如云', '德音', '其琛', '明哲', '敬之', '凯风', '南乔', '琼华',
  '清婉', '清芬', '若华', '若英', '望舒', '陆离', '云旗', '辰良',
  '安歌', '怀信', '修远', '灵均', '正则', '秉德', '宜修', '杜若',
  '木兰', '扬灵', '飞扬', '承宇', '既明', '嘉月', '妙仪', '清和',
  '昭华', '景明', '疏影', '暗香', '星河', '云舒', '知许', '知意',
  '念远', '思齐', '言笑', '朝雨', '新雨', '清秋', '春华', '秋实',
  '青云', '凌云', '长风', '浩然', '明月', '江雪', '归鸿', '云帆',
  '海若', '沧澜', '清欢', '锦书', '疏桐', '梦泽', '清浅', '含章',
  '时雨', '令闻', '嘉言', '乐成', '安之', '希言', '如玉', '如梦',
  '如意', '如初', '若兰', '若水', '若溪', '若晴', '若宁', '若安',
  '安然', '悠然', '燕然', '自然', '可欣', '可心', '乐安', '乐宁',
  '欢悦', '子安', '子清', '子宁', '子墨', '子轩', '子佩', '静言',
])

const KNOWN_PAIR_CHARS = new Set(
  Array.from(KNOWN_POETIC_PAIRS).flatMap((pair) => Array.from(pair))
)

export const ALLOWED_NAME_CHARS = new Set([
  ...HIGH_FREQUENCY_NAME_CHARS,
  ...COMMON_NAME_CHARS,
  ...POETIC_NAME_CHARS,
  ...SOFT_FUNCTION_CHARS,
  ...KNOWN_PAIR_CHARS,
])

export const SEMANTIC_GROUPS = {
  清朗: toCharSet('清澄朗明昭晖辉曦晴霁景洁纯'),
  品德: toCharSet('德仁义礼信诚谦善贤惠慧淑慈恭廉毅敬'),
  从容: toCharSet('安宁静和泰舒然悠逸乐欢悦闲'),
  山水: toCharSet('山川海江河湖泉溪澜泽洲云雨雪霜风岚汐渊'),
  草木: toCharSet('松柏梅兰竹菊荷莲芷蕙芳菲芸薇棠桃柳桐桂榆'),
  才思: toCharSet('文思知智哲睿敏聪诗书言博墨砚'),
  志远: toCharSet('弘宏远翔鹏鸿凌峰岳卓超凯胜志航'),
  温润: toCharSet('温润柔如玉瑾瑜琼瑶琳琪珩璇'),
} as const

export const UNLUCKY_HOMOPHONE_PATTERNS = new Set([
  'shabi', 'baichi', 'shadan', 'gundan', 'erhuo', 'fantong', 'yangwei',
  'weishengjin', 'shenjingbing', 'duziteng', 'hulijing', 'shizhenxiang',
  'zhuyiqun',
])

export type NameCharTier = 'high' | 'common' | 'poetic' | 'soft-function'

export const getNameCharTier = (char: string): NameCharTier | null => {
  if (HIGH_FREQUENCY_NAME_CHARS.has(char)) return 'high'
  if (COMMON_NAME_CHARS.has(char)) return 'common'
  if (POETIC_NAME_CHARS.has(char)) return 'poetic'
  if (SOFT_FUNCTION_CHARS.has(char)) return 'soft-function'
  if (KNOWN_PAIR_CHARS.has(char)) return 'poetic'
  return null
}

export const getSemanticGroups = (char: string): string[] =>
  Object.entries(SEMANTIC_GROUPS)
    .filter(([, chars]) => chars.has(char))
    .map(([label]) => label)

export const isEligibleNameChar = (char: string): boolean =>
  /^\p{Script=Han}$/u.test(char) &&
  ALLOWED_NAME_CHARS.has(char) &&
  !FORBIDDEN_NAME_CHARS.has(char) &&
  !HARD_FUNCTION_CHARS.has(char)
