import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { mockAchievements } from '../data/mock';
import { Flame, Target, BookOpen, Mic, Trophy } from 'lucide-react';

const Dashboard = () => {
  const { user, courses } = useStore();

  if (!user) return null;

  const inProgressCourses = courses.filter(c => c.progress > 0 && c.progress < 100);
  const completedCourses = courses.filter(c => c.progress === 100);

  const icons: Record<string, React.ReactNode> = {
    Target: <Target className="w-6 h-6" />,
    Flame: <Flame className="w-6 h-6" />,
    BookOpen: <BookOpen className="w-6 h-6" />,
    Mic: <Mic className="w-6 h-6" />
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Profile Section */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <img src={user.avatar} alt={user.username} className="w-24 h-24 rounded-full border-4 border-white shadow-lg" />
          <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm">
            LV.{user.level}
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{user.username}</h1>
          <p className="text-slate-600">继续保持！今天是你连续学习的第 <span className="font-bold text-blue-600">{user.streakDays}</span> 天</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-50 px-6 py-4 rounded-2xl text-center">
            <div className="text-2xl font-bold text-blue-700">{user.experiencePoints}</div>
            <div className="text-sm text-blue-600 font-medium">总经验值</div>
          </div>
          <div className="bg-orange-50 px-6 py-4 rounded-2xl text-center">
            <div className="text-2xl font-bold text-orange-700">{user.streakDays}</div>
            <div className="text-sm text-orange-600 font-medium">连续打卡</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Progress */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="text-blue-500" />
              正在学习
            </h2>
            <div className="space-y-4">
              {inProgressCourses.length > 0 ? inProgressCourses.map((course, idx) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6"
                >
                  <img src={course.image} alt={course.title} className="w-24 h-24 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-900">{course.title}</h3>
                      <span className="text-sm font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{course.level}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>已完成 {course.progress}%</span>
                      <span>共 {course.modules} 模块</span>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500">
                  暂无正在学习的课程，去课程库看看吧！
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">已完成</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completedCourses.map(course => (
                <div key={course.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 opacity-75">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{course.title}</h3>
                    <p className="text-xs text-slate-500">100% 完成</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Achievements */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              成就徽章
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {mockAchievements.map((ach, idx) => {
                const isUnlocked = !!ach.unlockedAt;
                return (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex flex-col items-center p-4 rounded-2xl border ${
                      isUnlocked ? 'bg-gradient-to-b from-yellow-50 to-white border-yellow-100' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-inner ${
                      isUnlocked ? 'bg-yellow-400 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {icons[ach.icon] || <Trophy />}
                    </div>
                    <h4 className={`text-sm font-bold text-center mb-1 ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                      {ach.title}
                    </h4>
                    <p className="text-[10px] text-center text-slate-500 line-clamp-2">
                      {ach.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
