export interface FruitRecommendation {
  name: string;
  imageUrl: string;
  filter?: string;
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

