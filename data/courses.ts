export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'theory' | 'skill';
  subcategory?: string;
  duration: string;
  level: '初级' | '中级' | '高级';
  views: number;
}

export const courses: Course[] = [
  // 中医课堂 - 基础理论
  {
    id: 't1',
    title: '中医基础理论：阴阳五行',
    description: '深入浅出讲解中医核心思想，理解人体与自然的平衡之道。',
    category: 'theory',
    subcategory: '基础理论',
    duration: '20 分钟',
    level: '初级',
    views: 1250
  },
  {
    id: 't2',
    title: '气血津液：生命的物质基础',
    description: '探索气、血、津液在人体中的作用及其相互关系。',
    category: 'theory',
    subcategory: '基础理论',
    duration: '25 分钟',
    level: '初级',
    views: 980
  },
  {
    id: 't3',
    title: '脏腑经络概论',
    description: '认识五脏六腑的功能以及经络系统的运行规律。',
    category: 'theory',
    subcategory: '基础理论',
    duration: '30 分钟',
    level: '中级',
    views: 850
  },
  
  // 技能教学 - 穴位按摩
  {
    id: 's1',
    title: '常用保健穴位：合谷与足三里',
    description: '学习两个最常用的养生穴位，掌握正确的按摩手法。',
    category: 'skill',
    subcategory: '穴位按摩',
    duration: '10 分钟',
    level: '初级',
    views: 2100
  },
  {
    id: 's2',
    title: '缓解头痛的头部按摩',
    description: '针对紧张性头痛的自我按摩放松技巧。',
    category: 'skill',
    subcategory: '穴位按摩',
    duration: '15 分钟',
    level: '初级',
    views: 1800
  },
  
  // 技能教学 - 食疗制作
  {
    id: 's3',
    title: '四季养生茶饮制作',
    description: '根据季节变化调配适合的养生茶饮，简单易学。',
    category: 'skill',
    subcategory: '食疗制作',
    duration: '12 分钟',
    level: '初级',
    views: 1500
  },
  {
    id: 's4',
    title: '健脾养胃山药粥',
    description: '手把手教你制作一道经典的健脾养胃药膳。',
    category: 'skill',
    subcategory: '食疗制作',
    duration: '18 分钟',
    level: '初级',
    views: 1650
  }
];
