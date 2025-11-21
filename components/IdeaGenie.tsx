
import React, { useState } from 'react';
import { Lightbulb, Sparkles, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { generateStoryConcept } from '../services/gemini';
import { StoryConcept } from '../types';

interface IdeaGenieProps {
  onCreateStory: (concept: StoryConcept) => void;
}

const IdeaGenie: React.FC<IdeaGenieProps> = ({ onCreateStory }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState({
    genre: '',
    theme: '',
    hero: '',
    setting: ''
  });
  const [result, setResult] = useState<StoryConcept | null>(null);

  const handleGenerate = async () => {
    if (!inputs.genre && !inputs.theme) {
        alert("请至少填写类型和核心点子！");
        return;
    }
    
    setIsLoading(true);
    try {
      const concept = await generateStoryConcept(inputs);
      setResult(concept);
    } catch (e) {
      alert("生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4 shadow-inner">
            <Lightbulb size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">点子精灵</h1>
          <p className="text-slate-500 mt-2">回答几个简单的问题，AI 为你构筑下一个宏大世界。</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" /> 灵感参数
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">故事类型 (Genre)</label>
                <input 
                  type="text" 
                  placeholder="例如：赛博朋克、修仙、维多利亚悬疑..."
                  value={inputs.genre}
                  onChange={e => setInputs({...inputs, genre: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">核心点子 / 梗概 (Theme)</label>
                <textarea 
                  placeholder="一句话描述你想写什么。例如：一个不会魔法的人在魔法世界成了救世主。"
                  value={inputs.theme}
                  onChange={e => setInputs({...inputs, theme: e.target.value})}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">主角特征 (Protagonist)</label>
                <input 
                  type="text" 
                  placeholder="例如：落魄侦探、失忆的机器人..."
                  value={inputs.hero}
                  onChange={e => setInputs({...inputs, hero: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">故事背景 (Setting)</label>
                <input 
                  type="text" 
                  placeholder="例如：2077年的新东京、被迷雾笼罩的孤岛..."
                  value={inputs.setting}
                  onChange={e => setInputs({...inputs, setting: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {isLoading ? '正在构思...' : '激发灵感'}
              </button>
            </div>
          </div>

          {/* Output Result */}
          <div className={`transition-all duration-500 ${result ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
            {result ? (
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{result.title}</h2>
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full mb-6">
                  AI 构思方案
                </span>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">故事简介</h3>
                    <p className="text-slate-700 leading-relaxed text-sm">{result.synopsis}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">核心人物: {result.characterName}</h3>
                    <div className="space-y-2 text-sm">
                       <p><span className="font-medium text-slate-700">身份:</span> <span className="text-slate-600">{result.characterRole}</span></p>
                       <p><span className="font-medium text-slate-700">描述:</span> <span className="text-slate-600">{result.characterDesc}</span></p>
                       <p><span className="font-medium text-slate-700">冲突:</span> <span className="text-slate-600">{result.characterConflict}</span></p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onCreateStory(result)}
                    className="w-full py-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen size={20} />
                    以此创建故事
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Lightbulb size={48} className="mb-4 opacity-20" />
                <p>你的灵感将在这里显现...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaGenie;
