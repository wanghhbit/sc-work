import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { mockPosts } from '../data/mock';
import { Heart, MessageCircle, Share2, Plus } from 'lucide-react';
import { useStore } from '../store';

const Community = () => {
  const { user } = useStore();
  const [posts, setPosts] = useState(mockPosts);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: '全部动态' },
    { id: 'en', label: '英语圈' },
    { id: 'jp', label: '日语圈' },
    { id: 'kr', label: '韩语圈' }
  ];

  const filteredPosts = activeTab === 'all' ? posts : posts.filter(p => p.language === activeTab);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">学习社区</h1>
          <p className="text-slate-600 mt-1">与全球学习者分享你的语言之旅</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          <Plus size={20} />
          发布动态
        </button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredPosts.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-full border border-slate-100" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{post.authorName}</h3>
                  <p className="text-xs text-slate-500">{post.createdAt}</p>
                </div>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded uppercase">
                {post.language}
              </span>
            </div>
            
            <p className="text-slate-800 mb-4 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            
            <div className="flex gap-2 mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 border-t border-slate-100 pt-4">
              <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                <Heart size={18} />
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
                <MessageCircle size={18} />
                <span className="text-sm font-medium">{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-500 hover:text-green-500 transition-colors ml-auto">
                <Share2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Community;
