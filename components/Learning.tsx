import React, { useState } from 'react';
import { 
  BookOpen, PlayCircle, Clock, Users, ChevronRight, GraduationCap, Activity, 
  ArrowLeft, Heart, Star, Share2, Play, MessageCircle, Send, ThumbsUp
} from 'lucide-react';
import { courses, Course } from '../data/courses';

const Learning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'theory' | 'skill'>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'all') return true;
    return course.category === activeTab;
  });

  if (selectedCourse) {
    return (
      <CourseDetail 
        course={selectedCourse} 
        onBack={() => setSelectedCourseId(null)} 
      />
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 h-full overflow-y-auto bg-stone-50 animate-in fade-in duration-300">
      <header className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-emerald-900 mb-2">中医讲堂</h1>
        <p className="text-stone-500 text-sm">传承经典，科学养生。探索中医智慧，守护家人健康。</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <TabButton 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')} 
          label="全部课程" 
        />
        <TabButton 
          active={activeTab === 'theory'} 
          onClick={() => setActiveTab('theory')} 
          label="中医课堂" 
          icon={<BookOpen size={16} />}
        />
        <TabButton 
          active={activeTab === 'skill'} 
          onClick={() => setActiveTab('skill')} 
          label="技能教学" 
          icon={<Activity size={16} />}
        />
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onClick={() => setSelectedCourseId(course.id)}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20 text-stone-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无相关课程</p>
        </div>
      )}
    </div>
  );
};

// --- Sub-Components ---

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
      ${active 
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const isTheory = course.category === 'theory';
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-stone-100 group cursor-pointer flex flex-col h-full"
    >
      {/* Card Header / Image Placeholder */}
      <div className={`h-32 w-full flex items-center justify-center relative overflow-hidden ${isTheory ? 'bg-emerald-50' : 'bg-orange-50'}`}>
        <div className={`absolute inset-0 opacity-10 ${isTheory ? 'bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 to-transparent' : 'bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-400 to-transparent'}`} />
        
        {isTheory ? (
          <GraduationCap size={48} className="text-emerald-300 group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <Activity size={48} className="text-orange-300 group-hover:scale-110 transition-transform duration-500" />
        )}
        
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-stone-600 shadow-sm">
          {course.subcategory}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            course.level === '初级' ? 'bg-green-100 text-green-700' :
            course.level === '中级' ? 'bg-blue-100 text-blue-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {course.level}
          </span>
          <div className="flex items-center text-stone-400 text-xs space-x-1">
            <Users size={12} />
            <span>{course.views}</span>
          </div>
        </div>

        <h3 className="font-bold text-stone-800 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {course.title}
        </h3>
        <p className="text-stone-500 text-sm mb-4 line-clamp-2 flex-1">
          {course.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-auto">
          <div className="flex items-center text-stone-400 text-xs space-x-1">
            <Clock size={14} />
            <span>{course.duration}</span>
          </div>
          <button className="flex items-center space-x-1 text-emerald-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
            <span>开始学习</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Detail Component ---

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState<'intro' | 'chapters' | 'reviews'>('intro');
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeChapter, setActiveChapter] = useState<string>(course.chapters[0]?.id);

  return (
    <div className="h-full bg-stone-50 overflow-y-auto pb-24 animate-in slide-in-from-right duration-300">
      {/* Navbar */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-bold text-stone-800 truncate max-w-[200px]">{course.title}</span>
        <button className="p-2 -mr-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
          <Share2 size={20} />
        </button>
      </div>

      {/* Video Placeholder */}
      <div className="aspect-video bg-black relative group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
          <div className="text-white/80 text-sm mb-1">正在播放: {course.chapters.find(c => c.id === activeChapter)?.title}</div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Play size={32} className="text-white ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-white p-4 mb-2">
        <h1 className="text-xl font-bold text-stone-900 mb-2">{course.title}</h1>
        <div className="flex items-center justify-between text-sm text-stone-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><Users size={14} className="mr-1"/> {course.views}</span>
            <span className="flex items-center text-yellow-500"><Star size={14} className="mr-1" fill="currentColor"/> {course.rating}</span>
          </div>
          <span>{course.category === 'theory' ? '中医课堂' : '技能教学'} · {course.level}</span>
        </div>

        <div className="flex space-x-4 border-t border-stone-100 pt-3">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`flex-1 py-2 flex items-center justify-center space-x-2 rounded-lg transition-colors ${isLiked ? 'bg-pink-50 text-pink-500' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}
          >
            <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
            <span>点赞</span>
          </button>
          <button 
            onClick={() => setIsFavorited(!isFavorited)}
            className={`flex-1 py-2 flex items-center justify-center space-x-2 rounded-lg transition-colors ${isFavorited ? 'bg-yellow-50 text-yellow-500' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}
          >
            <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
            <span>收藏</span>
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="bg-white border-b border-stone-100 sticky top-[56px] z-10">
        <div className="flex">
          {['intro', 'chapters', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 text-sm font-medium relative ${
                activeTab === tab 
                  ? 'text-emerald-600' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab === 'intro' && '简介'}
              {tab === 'chapters' && '目录'}
              {tab === 'reviews' && '评价'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-white min-h-[300px]">
        {activeTab === 'intro' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="font-bold text-stone-800 mb-2">课程介绍</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{course.description}</p>
            </div>
            
            <div className="flex items-center p-4 bg-stone-50 rounded-xl">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg mr-4">
                {course.instructor.name[0]}
              </div>
              <div>
                <div className="font-bold text-stone-800">{course.instructor.name}</div>
                <div className="text-xs text-stone-500">{course.instructor.title}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="space-y-2 animate-in fade-in duration-300">
            {course.chapters.map((chapter, index) => (
              <div 
                key={chapter.id}
                onClick={() => setActiveChapter(chapter.id)}
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                  activeChapter === chapter.id 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium w-6 ${activeChapter === chapter.id ? 'text-emerald-500' : 'text-stone-400'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{chapter.title}</span>
                    <span className="text-xs opacity-60 flex items-center mt-0.5">
                      {activeChapter === chapter.id && <PlayCircle size={10} className="mr-1" />}
                      {chapter.duration}
                    </span>
                  </div>
                </div>
                {activeChapter === chapter.id && (
                  <Activity size={16} className="text-emerald-500 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             {/* Mock Comment Input */}
             <div className="flex space-x-2 mb-6">
              <div className="flex-1 bg-stone-100 rounded-full px-4 py-2 flex items-center text-stone-400 text-sm">
                <MessageCircle size={16} className="mr-2" />
                <span>写下你的评价...</span>
              </div>
              <button className="bg-emerald-600 text-white p-2 rounded-full shadow-sm hover:bg-emerald-700 transition-colors">
                <Send size={18} className="ml-0.5" />
              </button>
            </div>

            {course.reviews.length > 0 ? (
              course.reviews.map(review => (
                <div key={review.id} className="border-b border-stone-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 text-xs font-bold">
                        {review.user[0]}
                      </div>
                      <span className="text-sm font-medium text-stone-700">{review.user}</span>
                    </div>
                    <span className="text-xs text-stone-400">{review.date}</span>
                  </div>
                  <div className="pl-10">
                    <div className="flex mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < review.rating ? "text-yellow-400" : "text-stone-200"} 
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-stone-600">{review.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-stone-400 text-sm">
                暂无评价，快来抢沙发吧~
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;
