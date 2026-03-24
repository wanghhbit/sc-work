import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { PlayCircle, Filter } from 'lucide-react';

const Courses = () => {
  const { courses } = useStore();
  const navigate = useNavigate();
  const [filterLang, setFilterLang] = useState('all');

  const filteredCourses = filterLang === 'all' ? courses : courses.filter(c => c.language === filterLang);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">课程库</h1>
          <p className="text-slate-600 mt-1">找到适合你的专属进阶路线</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400" size={20} />
          <select 
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
          >
            <option value="all">全部语种</option>
            <option value="en">英语 (English)</option>
            <option value="jp">日语 (日本語)</option>
            <option value="kr">韩语 (한국어)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                {course.level}
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{course.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-2 mb-6 flex-1">
                {course.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm text-slate-500">{course.modules} 个模块</span>
                <button 
                  onClick={() => navigate(`/practice/${course.id}`)}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <PlayCircle size={18} />
                  进入学习
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
