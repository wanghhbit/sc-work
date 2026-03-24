import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Mic, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';

const flashcards = [
  { id: 1, term: 'Hello', translation: '你好', phonetic: '/həˈloʊ/', example: 'Hello, how are you?' },
  { id: 2, term: 'World', translation: '世界', phonetic: '/wɜːrld/', example: 'The world is beautiful.' },
  { id: 3, term: 'Language', translation: '语言', phonetic: '/ˈlæŋɡwɪdʒ/', example: 'Learning a new language is fun.' },
];

const Practice = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, updateCourseProgress, addExperience } = useStore();
  
  const course = courses.find(c => c.id === courseId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!course) {
    return <div className="p-8 text-center">Course not found</div>;
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
      updateCourseProgress(course.id, Math.min(course.progress + 10, 100));
      addExperience(50);
    }
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (course.language === 'en') utterance.lang = 'en-US';
    if (course.language === 'jp') utterance.lang = 'ja-JP';
    if (course.language === 'kr') utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">太棒了！</h2>
        <p className="text-lg text-slate-600 mb-8">你已完成本次学习模块，获得 <span className="font-bold text-orange-500">+50 XP</span></p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          返回学习中心
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{course.title}</h1>
          <p className="text-sm text-slate-500">单词记忆 {currentIndex + 1} / {flashcards.length}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full mb-12">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex) / flashcards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="relative h-96 perspective-1000 mb-12 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <AnimatePresence initial={false} mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center justify-center p-8 text-center"
            >
              <h2 className="text-5xl font-bold text-slate-900 mb-6">{currentCard.term}</h2>
              <button 
                onClick={(e) => { e.stopPropagation(); playAudio(currentCard.term); }}
                className="p-4 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                <Volume2 size={32} />
              </button>
              <p className="absolute bottom-6 text-sm text-slate-400">点击卡片翻转</p>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-blue-50 rounded-3xl shadow-lg border border-blue-100 flex flex-col items-center justify-center p-8 text-center"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-2">{currentCard.translation}</h2>
              <p className="text-xl text-blue-600 font-medium mb-8">{currentCard.phonetic}</p>
              
              <div className="bg-white/60 p-6 rounded-2xl w-full">
                <p className="text-slate-700 italic">{currentCard.example}</p>
              </div>
              <p className="absolute bottom-6 text-sm text-slate-400">点击卡片翻转</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-4">
        <button 
          className="flex-1 max-w-xs py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <Mic size={20} /> 跟读
        </button>
        <button 
          onClick={handleNext}
          className="flex-1 max-w-xs py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          {currentIndex === flashcards.length - 1 ? '完成' : '下一个'}
        </button>
      </div>
    </div>
  );
};

export default Practice;
