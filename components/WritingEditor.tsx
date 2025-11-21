import React, { useState, useEffect } from 'react';
import { Save, Wand2, Users, FileText, ChevronLeft, FilePlus, Eye, Target, Trophy } from 'lucide-react';
import { Story, Chapter, Character, OutlinePoint } from '../types';
import { continueStory, extractCharactersFromText, generateOutlineFromText } from '../services/gemini';

interface WritingEditorProps {
  story: Story;
  activeChapterId: string | null;
  chapters: Chapter[];
  characters: Character[];
  onSaveChapter: (chapterId: string, content: string, title: string, povId?: string) => void;
  onCreateChapter: () => void;
  onAddCharacters: (chars: Partial<Character>[]) => void;
  onUpdateOutline: (storyId: string, points: OutlinePoint[]) => void;
  onBack: () => void;
  onSelectChapter: (id: string) => void;
  // Stats props
  dailyGoal: number;
  todayCount: number;
}

const WritingEditor: React.FC<WritingEditorProps> = ({
  story,
  activeChapterId,
  chapters,
  characters,
  onSaveChapter,
  onCreateChapter,
  onAddCharacters,
  onUpdateOutline,
  onBack,
  onSelectChapter,
  dailyGoal,
  todayCount
}) => {
  const activeChapter = chapters.find(c => c.id === activeChapterId);
  
  const [content, setContent] = useState(activeChapter?.content || '');
  const [title, setTitle] = useState(activeChapter?.title || '');
  const [povId, setPovId] = useState(activeChapter?.povCharacterId || '');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  
  // Local session tracking
  const [initialSessionLength, setInitialSessionLength] = useState(0);

  useEffect(() => {
    if (activeChapter) {
      setContent(activeChapter.content);
      setTitle(activeChapter.title);
      setPovId(activeChapter.povCharacterId || '');
      setInitialSessionLength(activeChapter.content.length);
    }
  }, [activeChapterId]); 

  const handleSave = () => {
    if (activeChapterId) {
      onSaveChapter(activeChapterId, content, title, povId);
      // Update reference length after save to avoid double counting if logic were different, 
      // but for now App.tsx handles the delta logic based on its own state.
    }
  };

  const handleAiContinue = async () => {
    setIsAiProcessing(true);
    setAiStatus('AI 正在阅读上下文...');
    try {
      const prevChapter = chapters.find(c => c.order === (activeChapter?.order || 0) - 1);
      const context = (prevChapter?.content || "") + "\n" + content;
      
      setAiStatus('AI 正在构思续写...');
      const continuedText = await continueStory(context, content);
      
      setContent(prev => prev + (prev.endsWith(' ') || prev.endsWith('\n') ? '' : '\n') + continuedText);
    } catch (error) {
      alert("AI 续写失败，请重试");
    } finally {
      setIsAiProcessing(false);
      setAiStatus('');
    }
  };

  const handleExtractCharacters = async () => {
    setIsAiProcessing(true);
    setAiStatus('AI 正在分析人物...');
    try {
      const chars = await extractCharactersFromText(content);
      onAddCharacters(chars);
      alert(`成功提取 ${chars.length} 个人物至资料库！`);
    } catch (error) {
      alert("人物提取失败");
    } finally {
      setIsAiProcessing(false);
      setAiStatus('');
    }
  };

  const handleExtractOutline = async () => {
    setIsAiProcessing(true);
    setAiStatus('AI 正在梳理大纲...');
    try {
      const points = await generateOutlineFromText(content);
      onUpdateOutline(story.id, points);
      alert(`成功提取大纲点至大纲世界！`);
    } catch (error) {
      alert("大纲提取失败");
    } finally {
      setIsAiProcessing(false);
      setAiStatus('');
    }
  };

  if (!activeChapter && chapters.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full bg-white p-10">
              <h2 className="text-xl mb-4">暂无章节</h2>
              <button onClick={onCreateChapter} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  创建第一章
              </button>
          </div>
      )
  }

  const povCharacter = characters.find(c => c.id === povId);
  
  // Calculate estimated progress for THIS session + previously saved today count
  // Note: The accurate count is maintained in App.tsx, but we can estimate visual feedback here
  const progressPercent = Math.min(100, (todayCount / dailyGoal) * 100);

  return (
    <div className="flex h-full bg-slate-50">
      {/* Chapter Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2 text-slate-600 hover:text-indigo-600 cursor-pointer" onClick={onBack}>
          <ChevronLeft size={20} />
          <span className="font-medium truncate">{story.title}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {chapters.map(c => (
            <div 
              key={c.id}
              onClick={() => { handleSave(); onSelectChapter(c.id); }}
              className={`p-3 rounded-lg text-sm cursor-pointer mb-1 transition-colors ${c.id === activeChapterId ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <div className="flex justify-between">
                  <span className="truncate pr-2">{c.title}</span>
                  {c.povCharacterId && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1 rounded self-start flex-shrink-0">POV</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => { handleSave(); onCreateChapter(); }} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors">
            <FilePlus size={16} />
            新建章节
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Toolbar */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 w-1/2">
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold text-lg text-slate-800 bg-transparent border-none focus:ring-0 outline-none flex-1 placeholder-slate-300"
                placeholder="章节标题"
              />
              {/* POV Selector */}
              <div className="relative group hidden md:block">
                  <div className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer bg-slate-50 px-2 py-1 rounded hover:bg-slate-100">
                      <Eye size={14} />
                      {povCharacter ? `POV: ${povCharacter.name}` : '选择视角'}
                  </div>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 shadow-lg rounded-lg p-1 hidden group-hover:block z-10">
                      <div className="text-xs font-bold text-slate-400 px-2 py-1">选择章节视角</div>
                      <div 
                          onClick={() => setPovId('')}
                          className="px-2 py-1.5 hover:bg-indigo-50 rounded text-sm cursor-pointer text-slate-600"
                      >
                          上帝视角 (默认)
                      </div>
                      {characters.filter(c => c.storyId === story.id).map(c => (
                          <div 
                              key={c.id}
                              onClick={() => setPovId(c.id)}
                              className={`px-2 py-1.5 hover:bg-indigo-50 rounded text-sm cursor-pointer ${povId === c.id ? 'text-indigo-600 font-bold' : 'text-slate-700'}`}
                          >
                              {c.name}
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-3">
             {isAiProcessing && (
                 <span className="text-xs text-indigo-600 animate-pulse font-medium mr-2">{aiStatus}</span>
             )}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button onClick={handleAiContinue} disabled={isAiProcessing} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-600 hover:text-indigo-600 transition-all disabled:opacity-50" title="AI 续写">
                <Wand2 size={18} />
              </button>
              <button onClick={handleExtractCharacters} disabled={isAiProcessing} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-600 hover:text-indigo-600 transition-all disabled:opacity-50" title="提取人物设定">
                <Users size={18} />
              </button>
              <button onClick={handleExtractOutline} disabled={isAiProcessing} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-600 hover:text-indigo-600 transition-all disabled:opacity-50" title="提取大纲">
                <FileText size={18} />
              </button>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Save size={16} />
              保存
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8 flex justify-center">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在此开始书写你的故事..."
            className="w-full max-w-3xl h-full min-h-[800px] bg-white shadow-sm border border-slate-100 p-10 text-lg text-slate-800 leading-relaxed resize-none outline-none focus:ring-1 focus:ring-indigo-100"
          />
        </div>

        {/* Footer Info with Goals */}
        <div className="bg-white border-t border-slate-100 px-6 py-3 text-xs text-slate-500 flex justify-between items-center">
          <div className="flex items-center gap-6">
             <span>总字数: {content.length}</span>
             
             {/* Daily Progress */}
             <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 text-indigo-600 font-medium">
                     {progressPercent >= 100 ? <Trophy size={14} /> : <Target size={14} />}
                     今日: {todayCount} / {dailyGoal}
                 </div>
                 <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                        className={`h-full rounded-full transition-all duration-500 ${progressPercent >= 100 ? 'bg-amber-400' : 'bg-indigo-500'}`} 
                        style={{ width: `${progressPercent}%` }}
                     />
                 </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <span>{activeChapterId ? '已同步' : '未保存'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingEditor;
