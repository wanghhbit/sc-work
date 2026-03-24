import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe2, Sparkles, Target, Users } from 'lucide-react';
import { useStore } from '../store';

const Home = () => {
  const { currentLanguage, setLanguage } = useStore();

  const languages = [
    { code: 'en', name: 'English', greeting: 'Welcome to LinguaMaster', color: 'bg-red-500' },
    { code: 'jp', name: '日本語', greeting: 'LinguaMasterへようこそ', color: 'bg-pink-400' },
    { code: 'kr', name: '한국어', greeting: 'LinguaMaster에 오신 것을 환영합니다', color: 'bg-teal-400' }
  ];

  const currentLangData = languages.find(l => l.code === currentLanguage) || languages[0];

  const features = [
    {
      icon: <Globe2 className="w-8 h-8 text-blue-500" />,
      title: '多语种自由切换',
      description: '英语、日语、韩语一站式学习，满足您不同的语言学习需求。'
    },
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: '分级课程体系',
      description: '根据CEFR标准及各类语言考试大纲，提供科学的学习进阶路线。'
    },
    {
      icon: <Sparkles className="w-8 h-8 text-blue-500" />,
      title: '沉浸式互动练习',
      description: '涵盖单词闪卡、情景听力、口语跟读打分，全方位提升语言能力。'
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: '活跃的交流社区',
      description: '与全球语言爱好者一起打卡、分享心得，组队克服学习惰性。'
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-100 blur-3xl opacity-50" 
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            key={currentLanguage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 mb-8"
          >
            <span className={`w-2 h-2 rounded-full ${currentLangData.color}`} />
            <span className="text-sm font-medium text-slate-600">{currentLangData.name}</span>
          </motion.div>

          <motion.h1 
            key={`title-${currentLanguage}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            {currentLangData.greeting}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-xl text-slate-600 mb-10"
          >
            打破语言障碍，探索世界无限可能。
            <br />
            加入我们，开启你的沉浸式语言学习之旅。
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/courses"
              className="inline-flex justify-center items-center px-8 py-4 text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              开始学习
            </Link>
            <Link 
              to="/dashboard"
              className="inline-flex justify-center items-center px-8 py-4 text-base font-medium rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200"
            >
              了解更多
            </Link>
          </motion.div>

          {/* Language Switcher */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 pt-8 border-t border-slate-200 max-w-lg mx-auto flex justify-center gap-6"
          >
            <span className="text-sm text-slate-500 self-center">切换体验语种:</span>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`text-sm font-medium transition-colors ${
                  currentLanguage === lang.code ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">为什么选择 LinguaMaster？</h2>
          <p className="text-lg text-slate-600">我们为您提供全方位的语言学习解决方案</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
