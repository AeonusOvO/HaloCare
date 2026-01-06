export interface Chapter {
  id: string;
  title: string;
  duration: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  content: string;
  date: string;
}

export interface Instructor {
  name: string;
  title: string;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'theory' | 'skill';
  subcategory?: string;
  duration: string;
  level: '初级' | '中级' | '高级';
  views: number;
  imageUrl?: string;
  instructor: Instructor;
  rating: number;
  chapters: Chapter[];
  reviews: Review[];
}

export const courses: Course[] = [
  // 中医课堂 - 基础理论
  {
    id: 't1',
    title: '中医基础理论：阴阳五行',
    description: '深入浅出讲解中医核心思想，理解人体与自然的平衡之道。本课程将带你领略古老东方的智慧，学会用阴阳五行的视角看待身体健康。',
    category: 'theory',
    subcategory: '基础理论',
    duration: '20 分钟',
    level: '初级',
    views: 1250,
    rating: 4.8,
    instructor: {
      name: '张医师',
      title: '资深中医师'
    },
    chapters: [
      { id: 'c1', title: '什么是阴阳？', duration: '05:30' },
      { id: 'c2', title: '五行相生相克', duration: '08:45' },
      { id: 'c3', title: '生活中的阴阳智慧', duration: '05:45' }
    ],
    reviews: [
      { id: 'r1', user: '李大爷', rating: 5, content: '讲得很透彻，容易懂！', date: '2023-10-01' },
      { id: 'r2', user: '养生达人', rating: 4, content: '内容不错，声音稍微有点小。', date: '2023-10-05' }
    ]
  },
  {
    id: 't2',
    title: '气血津液：生命的物质基础',
    description: '探索气、血、津液在人体中的作用及其相互关系。了解这些物质如何滋养我们的脏腑，维持生命活动。',
    category: 'theory',
    subcategory: '基础理论',
    duration: '25 分钟',
    level: '初级',
    views: 980,
    rating: 4.7,
    instructor: {
      name: '王教授',
      title: '中医学院教授'
    },
    chapters: [
      { id: 'c1', title: '气的概念与功能', duration: '08:00' },
      { id: 'c2', title: '血的生成与运行', duration: '09:30' },
      { id: 'c3', title: '津液的代谢', duration: '07:30' }
    ],
    reviews: [
      { id: 'r1', user: '健康每一天', rating: 5, content: '非常有用的知识，受益匪浅。', date: '2023-09-20' }
    ]
  },
  {
    id: 't3',
    title: '脏腑经络概论',
    description: '认识五脏六腑的功能以及经络系统的运行规律。掌握脏腑之间的联系，理解经络如何沟通内外。',
    category: 'theory',
    subcategory: '基础理论',
    duration: '30 分钟',
    level: '中级',
    views: 850,
    rating: 4.9,
    instructor: {
      name: '赵主任',
      title: '主任医师'
    },
    chapters: [
      { id: 'c1', title: '五脏的功能', duration: '10:00' },
      { id: 'c2', title: '六腑的职能', duration: '08:00' },
      { id: 'c3', title: '经络系统的构成', duration: '12:00' }
    ],
    reviews: []
  },
  
  // 技能教学 - 穴位按摩
  {
    id: 's1',
    title: '常用保健穴位：合谷与足三里',
    description: '学习两个最常用的养生穴位，掌握正确的按摩手法。长期坚持按摩，有助于增强体质，预防疾病。',
    category: 'skill',
    subcategory: '穴位按摩',
    duration: '10 分钟',
    level: '初级',
    views: 2100,
    rating: 4.9,
    instructor: {
      name: '孙技师',
      title: '高级推拿师'
    },
    chapters: [
      { id: 'c1', title: '寻找合谷穴', duration: '03:00' },
      { id: 'c2', title: '合谷穴按摩手法', duration: '02:00' },
      { id: 'c3', title: '足三里的定位', duration: '02:30' },
      { id: 'c4', title: '足三里保健功效', duration: '02:30' }
    ],
    reviews: [
      { id: 'r1', user: '王阿姨', rating: 5, content: '照着做感觉身体舒服多了。', date: '2023-11-12' },
      { id: 'r2', user: '小张', rating: 5, content: '简单易学，推荐！', date: '2023-11-15' }
    ]
  },
  {
    id: 's2',
    title: '缓解头痛的头部按摩',
    description: '针对紧张性头痛的自我按摩放松技巧。通过按揉太阳穴、风池穴等，快速缓解头部不适。',
    category: 'skill',
    subcategory: '穴位按摩',
    duration: '15 分钟',
    level: '初级',
    views: 1800,
    rating: 4.6,
    instructor: {
      name: '孙技师',
      title: '高级推拿师'
    },
    chapters: [
      { id: 'c1', title: '头部放松预备', duration: '03:00' },
      { id: 'c2', title: '太阳穴按揉', duration: '05:00' },
      { id: 'c3', title: '风池穴按揉', duration: '07:00' }
    ],
    reviews: [
      { id: 'r1', user: '加班狗', rating: 4, content: '对缓解疲劳很有帮助。', date: '2023-10-22' }
    ]
  },
  
  // 技能教学 - 食疗制作
  {
    id: 's3',
    title: '四季养生茶饮制作',
    description: '根据季节变化调配适合的养生茶饮，简单易学。春季养肝、夏季清心、秋季润肺、冬季补肾。',
    category: 'skill',
    subcategory: '食疗制作',
    duration: '12 分钟',
    level: '初级',
    views: 1500,
    rating: 4.8,
    instructor: {
      name: '陈营养师',
      title: '执业营养师'
    },
    chapters: [
      { id: 'c1', title: '春季玫瑰花茶', duration: '03:00' },
      { id: 'c2', title: '夏季荷叶茶', duration: '03:00' },
      { id: 'c3', title: '秋季菊花茶', duration: '03:00' },
      { id: 'c4', title: '冬季枸杞红枣茶', duration: '03:00' }
    ],
    reviews: [
      { id: 'r1', user: '花花', rating: 5, content: '好喝又养生，爱了爱了。', date: '2023-09-10' }
    ]
  },
  {
    id: 's4',
    title: '健脾养胃山药粥',
    description: '手把手教你制作一道经典的健脾养胃药膳。选用优质铁棍山药，搭配大米、小米，营养丰富。',
    category: 'skill',
    subcategory: '食疗制作',
    duration: '18 分钟',
    level: '初级',
    views: 1650,
    rating: 4.7,
    instructor: {
      name: '陈营养师',
      title: '执业营养师'
    },
    chapters: [
      { id: 'c1', title: '食材准备与挑选', duration: '05:00' },
      { id: 'c2', title: '熬粥技巧', duration: '08:00' },
      { id: 'c3', title: '出锅与品尝', duration: '05:00' }
    ],
    reviews: [
      { id: 'r1', user: '妈妈的味道', rating: 5, content: '孩子很喜欢吃，做法也简单。', date: '2023-11-01' }
    ]
  }
];
