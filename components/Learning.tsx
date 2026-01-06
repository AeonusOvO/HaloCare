import React, { useState } from 'react';
import { BookOpen, PlayCircle, Clock, Users, ChevronRight, GraduationCap, Activity } from 'lucide-react';
import { courses, Course } from '../data/courses';

const Learning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'theory' | 'skill'>('all');

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'all') return true;
    return course.category === activeTab;
  });

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 h-full overflow-y-auto bg-stone-50">
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
          <CourseCard key={course.id} course={course} />
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
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const isTheory = course.category === 'theory';
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-stone-100 group cursor-pointer flex flex-col h-full">
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

export default Learning;
