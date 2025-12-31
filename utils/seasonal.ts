export interface FruitRecommendation {
  name: string;
  imageUrl: string;
  filter?: string;
}

export interface DietRecommendation {
  dish: string;
  ingredients: string[];
  kcal: number;
  durationMin: number;
  rating: number;
  tags: string[];
  imageQuery: string;
}

const MONTH_TO_FRUIT: Record<number, string[]> = {
  1: ['橙子', '橘子', '苹果'],
  2: ['草莓', '橙子', '猕猴桃'],
  3: ['草莓', '枇杷', '菠萝'],
  4: ['枇杷', '樱桃', '菠萝'],
  5: ['樱桃', '西瓜', '桃子'],
  6: ['西瓜', '荔枝', '杨梅'],
  7: ['西瓜', '桃子', '葡萄'],
  8: ['葡萄', '梨', '无花果'],
  9: ['葡萄', '梨', '石榴'],
  10: ['柿子', '苹果', '梨'],
  11: ['橙子', '柚子', '苹果'],
  12: ['橙子', '柚子', '苹果'],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildImageUrl(keyword: string) {
  const q = encodeURIComponent(keyword + ',fruit');
  return `https://source.unsplash.com/featured/?${q}`;
}

export function getTodayFruitRecommendation(): FruitRecommendation {
  const month = new Date().getMonth() + 1;
  const fruits = MONTH_TO_FRUIT[month] || ['苹果'];
  const name = pick(fruits);
  const imageUrl = buildImageUrl(name);
  const warmMonths = [11, 12, 1, 2];
  const isWarm = warmMonths.includes(month);
  const filter = isWarm
    ? 'saturate(0.9) contrast(1.05) sepia(0.08) hue-rotate(-10deg)'
    : 'saturate(0.95) contrast(1.05) hue-rotate(10deg)';
  return { name, imageUrl, filter };
}

const MONTH_TO_DISH: Record<number, DietRecommendation[]> = {
  1: [
    { dish: '羊肉萝卜汤', ingredients: ['羊肉', '白萝卜', '生姜'], kcal: 220, durationMin: 45, rating: 4.7, tags: ['温补', '健脾'], imageQuery: '羊肉萝卜汤' },
    { dish: '红枣桂圆粥', ingredients: ['红枣', '桂圆', '糯米'], kcal: 180, durationMin: 30, rating: 4.6, tags: ['养血', '安神'], imageQuery: '红枣桂圆粥' },
  ],
  2: [
    { dish: '当归生姜羊肉汤', ingredients: ['当归', '生姜', '羊肉'], kcal: 250, durationMin: 50, rating: 4.7, tags: ['温经散寒'], imageQuery: '当归生姜羊肉汤' },
    { dish: '枸杞蒸鱼', ingredients: ['枸杞', '鲈鱼', '姜葱'], kcal: 210, durationMin: 25, rating: 4.5, tags: ['补肝肾'], imageQuery: '枸杞蒸鱼' },
  ],
  3: [
    { dish: '山药莲子排骨汤', ingredients: ['山药', '莲子', '排骨'], kcal: 230, durationMin: 60, rating: 4.6, tags: ['健脾益气'], imageQuery: '山药莲子排骨汤' },
    { dish: '枇杷百合羹', ingredients: ['枇杷', '百合', '冰糖'], kcal: 160, durationMin: 20, rating: 4.4, tags: ['润肺'], imageQuery: '枇杷百合羹' },
  ],
  4: [
    { dish: '菊花枸杞茶', ingredients: ['菊花', '枸杞'], kcal: 20, durationMin: 5, rating: 4.3, tags: ['清肝明目'], imageQuery: '菊花枸杞茶' },
    { dish: '春笋鸡汤', ingredients: ['春笋', '鸡肉', '香菇'], kcal: 240, durationMin: 60, rating: 4.6, tags: ['清鲜补益'], imageQuery: '春笋鸡汤' },
  ],
  5: [
    { dish: '绿豆薏米汤', ingredients: ['绿豆', '薏米'], kcal: 150, durationMin: 40, rating: 4.5, tags: ['祛湿清热'], imageQuery: '绿豆薏米汤' },
    { dish: '樱桃番茄沙拉', ingredients: ['樱桃', '番茄', '生菜'], kcal: 130, durationMin: 15, rating: 4.4, tags: ['清爽', '维生素C'], imageQuery: '樱桃番茄沙拉' },
  ],
  6: [
    { dish: '西瓜薄荷饮', ingredients: ['西瓜', '薄荷', '青柠'], kcal: 90, durationMin: 10, rating: 4.3, tags: ['清暑解渴'], imageQuery: '西瓜薄荷饮' },
    { dish: '冬瓜薏米排骨汤', ingredients: ['冬瓜', '薏米', '排骨'], kcal: 210, durationMin: 70, rating: 4.6, tags: ['祛湿利水'], imageQuery: '冬瓜薏米排骨汤' },
  ],
  7: [
    { dish: '苦瓜炒蛋', ingredients: ['苦瓜', '鸡蛋'], kcal: 190, durationMin: 10, rating: 4.2, tags: ['清心', '降火'], imageQuery: '苦瓜炒蛋' },
    { dish: '桃子酸奶杯', ingredients: ['桃子', '酸奶', '燕麦'], kcal: 220, durationMin: 10, rating: 4.4, tags: ['健脾', '清甜'], imageQuery: '桃子酸奶杯' },
  ],
  8: [
    { dish: '葡萄山楂茶', ingredients: ['葡萄', '山楂'], kcal: 80, durationMin: 8, rating: 4.2, tags: ['健胃消食'], imageQuery: '葡萄山楂茶' },
    { dish: '清蒸梨', ingredients: ['雪梨', '冰糖'], kcal: 140, durationMin: 20, rating: 4.5, tags: ['润肺止咳'], imageQuery: '清蒸梨' },
  ],
  9: [
    { dish: '银耳枸杞羹', ingredients: ['银耳', '枸杞'], kcal: 160, durationMin: 45, rating: 4.6, tags: ['滋阴润燥'], imageQuery: '银耳枸杞羹' },
    { dish: '葡萄能量碗', ingredients: ['葡萄', '坚果', '酸奶'], kcal: 260, durationMin: 12, rating: 4.4, tags: ['抗氧化'], imageQuery: '葡萄酸奶坚果' },
  ],
  10: [
    { dish: '苹果桂皮燕麦粥', ingredients: ['苹果', '桂皮', '燕麦'], kcal: 210, durationMin: 25, rating: 4.5, tags: ['暖脾胃'], imageQuery: '苹果桂皮燕麦粥' },
    { dish: '南瓜小米粥', ingredients: ['南瓜', '小米'], kcal: 190, durationMin: 30, rating: 4.6, tags: ['健脾'], imageQuery: '南瓜小米粥' },
  ],
  11: [
    { dish: '姜枣红糖茶', ingredients: ['生姜', '红枣', '红糖'], kcal: 110, durationMin: 6, rating: 4.4, tags: ['暖身驱寒'], imageQuery: '姜枣红糖茶' },
    { dish: '紫薯牛奶泥', ingredients: ['紫薯', '牛奶'], kcal: 230, durationMin: 20, rating: 4.3, tags: ['补益', '安神'], imageQuery: '紫薯牛奶泥' },
  ],
  12: [
    { dish: '羊肉当归汤', ingredients: ['羊肉', '当归', '枸杞'], kcal: 260, durationMin: 55, rating: 4.7, tags: ['温补血'], imageQuery: '羊肉当归汤' },
    { dish: '陈皮萝卜汤', ingredients: ['陈皮', '白萝卜'], kcal: 120, durationMin: 35, rating: 4.4, tags: ['理气化痰'], imageQuery: '陈皮萝卜汤' },
  ],
};

function hashSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h >>> 0);
}

export function getDailyDietRecommendation(seed?: string): DietRecommendation {
  const month = new Date().getMonth() + 1;
  const list = MONTH_TO_DISH[month] || MONTH_TO_DISH[1];
  const s = seed || new Date().toISOString().slice(0, 10);
  const idx = hashSeed(s) % list.length;
  return list[idx];
}
