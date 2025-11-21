import React, { useState, useEffect } from 'react';
import { ViewState, Story, Chapter, Character, Outline, TrashItem, OutlinePoint, StoryConcept, CharacterRole, Relationship, UserSettings, DailyRecord } from './types';
import { BookOpen, PenTool, Map, Database, Trash2, Plus, Search, FileText, User, Lightbulb, Filter, Settings, Share2, Grid, Calendar, Award, CheckCircle } from 'lucide-react';
import WritingEditor from './components/WritingEditor';
import OutlineWorld from './components/OutlineWorld';
import AiAssistant from './components/AiAssistant';
import IdeaGenie from './components/IdeaGenie';
import CharacterDetailModal from './components/CharacterDetailModal';
import RelationshipMap from './components/RelationshipMap';

// --- Mock Data Generators ---
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to get date string YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
  // --- Global State ---
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [stories, setStories] = useState<Story[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]); 
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  
  // Stats & Goals
  const [userSettings, setUserSettings] = useState<UserSettings>({ dailyGoal: 1000 });
  const [writingHistory, setWritingHistory] = useState<DailyRecord[]>([]);

  // Selection State
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Character UI State
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [charSearch, setCharSearch] = useState('');
  const [charRoleFilter, setCharRoleFilter] = useState<string>('ALL');
  const [dataViewMode, setDataViewMode] = useState<'list' | 'map'>('list'); 

  // --- Initial Load (Mock) ---
  useEffect(() => {
    // Pre-populate if empty
    if (stories.length === 0) {
        const demoStoryId = generateId();
        setStories([{
            id: demoStoryId,
            title: "星际迷航：遗忘",
            synopsis: "在银河系边缘，一个被遗忘的殖民地...",
            coverColor: "bg-indigo-500",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }]);
        const c1 = generateId();
        setChapters([{
            id: c1,
            storyId: demoStoryId,
            title: "第一章：觉醒",
            content: "冷冻舱的玻璃上结满了霜。艾伦睁开眼睛，呼吸着稀薄的空气。警报声在空旷的舱室里回荡...",
            order: 1
        }]);
        const char1Id = generateId();
        const char2Id = generateId();
        setCharacters([
            {
                id: char1Id,
                storyId: demoStoryId,
                name: "艾伦",
                role: "主角",
                bio: "艾伦是一个沉默寡言的生物工程师...",
                conflict: "生存与寻找真相",
                obstacle: "系统故障与异形生物",
                action: "逃离冷冻舱",
                ending: "未知",
                description: "飞船上的生物工程师，性格沉稳。",
                appearance: "黑色短发，穿着破损的蓝色制服，左臂有机械义肢。",
                growthArc: "从迷茫的幸存者成长为坚定的领袖。"
            },
            {
                id: char2Id,
                storyId: demoStoryId,
                name: "K-9",
                role: "配角",
                bio: "忠诚的机器狗",
                conflict: "服从指令与保护主人的冲突",
                obstacle: "程序限制",
                action: "协助艾伦",
                ending: "牺牲自我",
                description: "安保型机器狗",
            }
        ]);
        setRelationships([
            {
                id: generateId(),
                storyId: demoStoryId,
                sourceCharacterId: char1Id,
                targetCharacterId: char2Id,
                type: "伙伴",
                description: "从废墟中修复的伙伴"
            }
        ]);
        setOutlines([{
            id: generateId(),
            storyId: demoStoryId,
            title: "主线剧情",
            points: [
                { stage: "开端", tension: 20, description: "主角醒来，发现飞船异常" },
                { stage: "发展", tension: 45, description: "探索飞船，发现船员失踪" },
                { stage: "高潮", tension: 90, description: "遭遇不明生物袭击" },
                { stage: "结局", tension: 30, description: "成功发送求救信号" }
            ]
        }]);
        
        // Mock History for Calendar Demo
        const today = new Date();
        const mockHistory: DailyRecord[] = [];
        for(let i = 0; i < 10; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            mockHistory.push({
                date: d.toISOString().split('T')[0],
                wordCount: Math.floor(Math.random() * 1500)
            });
        }
        setWritingHistory(mockHistory);
    }
  }, []);

  // --- Handlers ---

  const handleCreateStory = (isDocumentOnly: boolean = false) => {
    const newStory: Story = {
      id: generateId(),
      title: isDocumentOnly ? "未命名文档" : "新故事",
      synopsis: "",
      coverColor: "bg-slate-400",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setStories([newStory, ...stories]);
    setSelectedStoryId(newStory.id);
    
    // Auto create first chapter
    const newChapter: Chapter = {
        id: generateId(),
        storyId: newStory.id,
        title: isDocumentOnly ? "正文" : "第一章",
        content: "",
        order: 1
    };
    setChapters([newChapter, ...chapters]);
    setActiveChapterId(newChapter.id);

    setCurrentView(ViewState.WRITING_DESK);
  };

  const handleCreateStoryFromIdea = (concept: StoryConcept) => {
      const newStoryId = generateId();
      const newStory: Story = {
          id: newStoryId,
          title: concept.title,
          synopsis: concept.synopsis,
          coverColor: "bg-purple-500",
          createdAt: Date.now(),
          updatedAt: Date.now()
      };

      const newChar: Character = {
          id: generateId(),
          storyId: newStoryId,
          name: concept.characterName,
          role: concept.characterRole as CharacterRole,
          description: concept.characterDesc,
          conflict: concept.characterConflict,
          obstacle: "待发展",
          action: "待发展",
          ending: "待发展"
      };

      const firstChapter: Chapter = {
          id: generateId(),
          storyId: newStoryId,
          title: "第一章",
          content: "",
          order: 1
      };

      setStories([newStory, ...stories]);
      setCharacters([newChar, ...characters]);
      setChapters([firstChapter, ...chapters]);

      setSelectedStoryId(newStoryId);
      setActiveChapterId(firstChapter.id);
      setCurrentView(ViewState.WRITING_DESK);
  };

  const handleDeleteStory = (id: string) => {
    const s = stories.find(x => x.id === id);
    if (s) {
        const trashItem: TrashItem = {
            id: generateId(),
            originalId: id,
            type: 'STORY',
            data: s,
            deletedAt: Date.now(),
            title: s.title
        };
        setTrash([trashItem, ...trash]);
        setStories(stories.filter(x => x.id !== id));
    }
  };

  const handleRestore = (item: TrashItem) => {
      if (item.type === 'STORY') {
          setStories([item.data, ...stories]);
      } else if (item.type === 'CHARACTER') {
          setCharacters([...characters, item.data]);
      }
      setTrash(trash.filter(t => t.id !== item.id));
  };

  const handleSaveChapter = (id: string, content: string, title: string, povId?: string) => {
      setChapters(prev => {
          const oldChapter = prev.find(c => c.id === id);
          const newChapters = prev.map(c => c.id === id ? { ...c, content, title, povCharacterId: povId } : c);
          
          // Calculate Word Count Delta
          if (oldChapter) {
              const delta = content.length - oldChapter.content.length;
              if (delta > 0) {
                  updateDailyStats(delta);
              }
          } else {
              // New chapter scenario
              if (content.length > 0) {
                  updateDailyStats(content.length);
              }
          }
          return newChapters;
      });
      
      // Update story updated_at
      const chapter = chapters.find(c => c.id === id);
      if (chapter) {
          setStories(prev => prev.map(s => s.id === chapter.storyId ? { ...s, updatedAt: Date.now() } : s));
      }
  };

  const updateDailyStats = (wordsAdded: number) => {
      const todayStr = getTodayString();
      setWritingHistory(prev => {
          const existingEntry = prev.find(r => r.date === todayStr);
          if (existingEntry) {
              return prev.map(r => r.date === todayStr ? { ...r, wordCount: r.wordCount + wordsAdded } : r);
          } else {
              return [...prev, { date: todayStr, wordCount: wordsAdded }];
          }
      });
  };

  const handleAddCharacters = (chars: Partial<Character>[]) => {
      if (!selectedStoryId) return;
      const newChars = chars.map(c => ({
          id: generateId(),
          storyId: selectedStoryId,
          name: c.name || "未知",
          conflict: c.conflict || "",
          obstacle: c.obstacle || "",
          action: c.action || "",
          ending: c.ending || "",
          role: (c.role as CharacterRole) || "配角",
          description: c.description || "",
      } as Character));
      setCharacters([...characters, ...newChars]);
  };

  const handleSaveCharacter = (char: Character, charRelationships: Relationship[]) => {
      // Save Character
      const existing = characters.find(c => c.id === char.id);
      if (existing) {
          setCharacters(characters.map(c => c.id === char.id ? char : c));
      } else {
          setCharacters([...characters, char]);
      }

      // Save Relationships
      // 1. Remove all existing relationships where source is this char
      const filteredRels = relationships.filter(r => r.sourceCharacterId !== char.id);
      // 2. Add new ones
      setRelationships([...filteredRels, ...charRelationships]);
  };

  const handleDeleteCharacter = (id: string) => {
      const c = characters.find(x => x.id === id);
      if (c) {
        const trashItem: TrashItem = {
            id: generateId(),
            originalId: id,
            type: 'CHARACTER',
            data: c,
            deletedAt: Date.now(),
            title: c.name
        };
        setTrash([trashItem, ...trash]);
        setCharacters(characters.filter(x => x.id !== id));
        setRelationships(relationships.filter(r => r.sourceCharacterId !== id && r.targetCharacterId !== id));
      }
  };

  const handleUpdateOutline = (storyId: string, points: OutlinePoint[]) => {
      const newOutline: Outline = {
          id: generateId(),
          storyId,
          title: "自动生成大纲 " + new Date().toLocaleDateString(),
          points
      };
      setOutlines([...outlines, newOutline]);
  };

  // --- Render Helpers ---
  
  const renderSidebarItem = (view: ViewState, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-sm' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  const renderDashboard = () => {
    // Calculate calendar days (last 14 days)
    const today = new Date();
    const calendarDays = [];
    for(let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const record = writingHistory.find(r => r.date === dateStr);
        calendarDays.push({
            date: d,
            dateStr: dateStr,
            count: record ? record.wordCount : 0
        });
    }
    
    const todayStats = writingHistory.find(r => r.date === getTodayString())?.wordCount || 0;
    const isGoalMet = todayStats >= userSettings.dailyGoal;

    return (
    <div className="p-8 max-w-6xl mx-auto overflow-y-auto h-full">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">欢迎回来, 作家</h1>
      <p className="text-slate-500 mb-10">准备好编织下一个精彩的世界了吗？</p>

      {/* Stats & Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Goal Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 p-6 opacity-5">
                  <Award size={120} className="text-indigo-600" />
              </div>
              <div>
                  <h3 className="text-slate-500 font-medium mb-1">今日目标</h3>
                  <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-indigo-600">{todayStats}</span>
                      <span className="text-slate-400">/ {userSettings.dailyGoal} 字</span>
                  </div>
              </div>
              <div className="mt-4">
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isGoalMet ? 'bg-amber-400' : 'bg-indigo-600'}`} 
                        style={{ width: `${Math.min(100, (todayStats / userSettings.dailyGoal) * 100)}%` }}
                      ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                      <span>{isGoalMet ? '目标达成！🎉' : '加油，还差一点！'}</span>
                      <button onClick={() => {
                          const newGoal = prompt("设置新的每日字数目标:", userSettings.dailyGoal.toString());
                          if(newGoal && !isNaN(parseInt(newGoal))) setUserSettings({...userSettings, dailyGoal: parseInt(newGoal)});
                      }} className="hover:text-indigo-600">修改目标</button>
                  </div>
              </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <Calendar size={18} className="text-indigo-500"/> 创作日历 (打卡)
                   </h3>
                   <span className="text-xs text-slate-400">最近14天</span>
               </div>
               <div className="flex justify-between items-end gap-2">
                   {calendarDays.map((day, idx) => {
                       const intensity = Math.min(1, day.count / userSettings.dailyGoal);
                       let colorClass = 'bg-slate-100';
                       if (day.count > 0) {
                           if (intensity < 0.3) colorClass = 'bg-indigo-200';
                           else if (intensity < 0.7) colorClass = 'bg-indigo-400';
                           else colorClass = 'bg-indigo-600';
                       }
                       if (day.count >= userSettings.dailyGoal) colorClass = 'bg-amber-400'; // Goal met

                       return (
                           <div key={idx} className="flex flex-col items-center gap-2 flex-1 group relative">
                               {/* Tooltip */}
                               <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                   {day.dateStr}: {day.count} 字
                               </div>
                               
                               <div className={`w-full rounded-t-md transition-all duration-500 ${colorClass}`} style={{ height: `${Math.max(15, (day.count / userSettings.dailyGoal) * 60)}px` }}></div>
                               <span className="text-[10px] text-slate-400 font-medium">{day.date.getDate()}</span>
                           </div>
                       )
                   })}
               </div>
          </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <button 
          onClick={() => handleCreateStory(false)}
          className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all text-left"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <BookOpen size={120} />
          </div>
          <h2 className="text-2xl font-bold mb-2">创建新故事</h2>
          <p className="text-indigo-100">开始一部新的长篇小说，规划章节与人物。</p>
          <div className="mt-6 inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
            开始创作 <Plus size={16} className="ml-2" />
          </div>
        </button>

        <button 
          onClick={() => handleCreateStory(true)}
          className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-8 text-slate-800 shadow-sm hover:shadow-md transition-all text-left"
        >
          <div className="absolute top-0 right-0 p-8 text-slate-100 group-hover:scale-110 transition-transform">
            <FileText size={120} />
          </div>
          <h2 className="text-2xl font-bold mb-2">快速文档</h2>
          <p className="text-slate-500">仅仅想要记录灵感？创建一个纯文档，稍后整理。</p>
          <div className="mt-6 inline-flex items-center bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 group-hover:bg-slate-200">
            新建文档 <Plus size={16} className="ml-2" />
          </div>
        </button>
        
        <button 
          onClick={() => setCurrentView(ViewState.IDEA_GENIE)}
          className="group relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all text-left md:col-span-2"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Lightbulb size={120} />
          </div>
          <h2 className="text-2xl font-bold mb-2">点子精灵</h2>
          <p className="text-amber-50">不知道写什么？回答几个问题，让 AI 为你构思下一个宏大故事。</p>
          <div className="mt-6 inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
            寻找灵感 <Lightbulb size={16} className="ml-2" />
          </div>
        </button>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-4">最近编辑</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.slice(0, 3).map(story => (
          <div 
             key={story.id} 
             onClick={() => { setSelectedStoryId(story.id); setActiveChapterId(chapters.find(c => c.storyId === story.id)?.id || null); setCurrentView(ViewState.WRITING_DESK); }}
             className="bg-white border border-slate-200 p-4 rounded-xl hover:border-indigo-300 cursor-pointer transition-colors flex items-center gap-4"
          >
            <div className={`w-12 h-16 rounded ${story.coverColor} flex-shrink-0 shadow-sm`}></div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 truncate">{story.title}</h4>
                <p className="text-xs text-slate-500 mt-1 truncate">{story.synopsis || "暂无简介"}</p>
                <span className="text-xs text-slate-400 mt-2 block">上次修改: {new Date(story.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {stories.length === 0 && <div className="text-slate-400 text-sm">暂无最近记录</div>}
      </div>
    </div>
  );
  } // End renderDashboard

  const renderStoryLibrary = () => (
    <div className="p-8 h-full overflow-y-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">故事库</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stories.map(story => (
                <div key={story.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                    <div className={`h-32 ${story.coverColor} relative`}>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }} className="bg-white/20 hover:bg-white/40 p-1.5 rounded text-white"><Trash2 size={16}/></button>
                        </div>
                    </div>
                    <div className="p-5">
                        <h3 className="font-bold text-lg text-slate-900 mb-2">{story.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-3 mb-4">{story.synopsis || "这里将会是故事的简介..."}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                             <span className="text-xs text-slate-400">{chapters.filter(c => c.storyId === story.id).length} 个章节</span>
                             <button 
                                onClick={() => { setSelectedStoryId(story.id); setActiveChapterId(chapters.find(c => c.storyId === story.id)?.id || null); setCurrentView(ViewState.WRITING_DESK); }}
                                className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
                             >
                                 继续书写
                             </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderDataLibrary = () => {
      // Filter Logic
      const filteredCharacters = characters.filter(c => {
          const matchText = (c.name + c.description + c.role).toLowerCase().includes(charSearch.toLowerCase());
          const matchRole = charRoleFilter === 'ALL' || c.role === charRoleFilter;
          const matchStory = !selectedStoryId || c.storyId === selectedStoryId; // Optional: Limit to active story if inside one, but Global Lib shows all usually.
          return matchText && matchRole;
      });

      const filteredRelationships = relationships.filter(r => 
          filteredCharacters.some(c => c.id === r.sourceCharacterId) && 
          filteredCharacters.some(c => c.id === r.targetCharacterId)
      );

      const roleColors: Record<string, string> = {
          '主角': 'bg-indigo-100 text-indigo-700',
          '反派': 'bg-red-100 text-red-700',
          '配角': 'bg-amber-100 text-amber-700',
          '路人': 'bg-slate-100 text-slate-600'
      };

      return (
        <div className="p-8 h-full overflow-y-auto bg-slate-50 flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">资料库</h1>
                    <p className="text-slate-500 mt-1">管理所有故事的人物设定与世界观。</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                     {/* View Toggle */}
                     <div className="bg-white p-1 border border-slate-200 rounded-lg flex">
                        <button 
                            onClick={() => setDataViewMode('list')}
                            className={`p-1.5 rounded transition-colors ${dataViewMode === 'list' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid size={16} />
                        </button>
                        <button 
                            onClick={() => setDataViewMode('map')}
                            className={`p-1.5 rounded transition-colors ${dataViewMode === 'map' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Share2 size={16} />
                        </button>
                     </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="搜索人物..."
                            value={charSearch}
                            onChange={(e) => setCharSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative">
                         <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                             <Filter size={14} />
                         </div>
                         <select 
                            value={charRoleFilter}
                            onChange={(e) => setCharRoleFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                         >
                             <option value="ALL">所有角色</option>
                             <option value="主角">主角</option>
                             <option value="反派">反派</option>
                             <option value="配角">配角</option>
                         </select>
                    </div>

                    {/* Create Button */}
                    <button 
                        onClick={() => {
                            setEditingCharacter(null);
                            setIsCharModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200"
                    >
                        <Plus size={16} />
                        添加人物
                    </button>
                </div>
            </div>

            <div className="flex-1">
                {filteredCharacters.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <User size={48} className="mb-4 opacity-20" />
                        <p>未找到匹配的人物。</p>
                    </div>
                )}

                {dataViewMode === 'map' ? (
                     <div className="h-[600px]">
                        <RelationshipMap 
                            characters={filteredCharacters}
                            relationships={filteredRelationships}
                            onNodeClick={(char) => {
                                setEditingCharacter(char);
                                setIsCharModalOpen(true);
                            }}
                        />
                     </div>
                ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredCharacters.map(char => (
                            <div 
                                key={char.id} 
                                onClick={() => {
                                    setEditingCharacter(char);
                                    setIsCharModalOpen(true);
                                }}
                                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                            {char.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{char.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[char.role] || roleColors['路人']}`}>
                                                {char.role}
                                            </span>
                                        </div>
                                    </div>
                                    <Settings size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                
                                <div className="space-y-2 text-xs text-slate-500 mt-3 flex-1">
                                    {char.description && (
                                        <p className="line-clamp-2 italic text-slate-400 mb-2">{char.description}</p>
                                    )}
                                    <div className="flex gap-2">
                                        <span className="font-bold text-slate-300 w-8 flex-shrink-0">冲突</span> 
                                        <span className="truncate">{char.conflict || "-"}</span>
                                    </div>
                                </div>
                                
                                {/* Shows relation count */}
                                <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400 flex gap-2">
                                     <Share2 size={12} />
                                     <span>{relationships.filter(r => r.sourceCharacterId === char.id || r.targetCharacterId === char.id).length} 个关系</span>
                                </div>
                            </div>
                        ))}
                     </div>
                )}
            </div>

            {/* Modal */}
            <CharacterDetailModal 
                isOpen={isCharModalOpen}
                onClose={() => setIsCharModalOpen(false)}
                onSave={handleSaveCharacter}
                onDelete={handleDeleteCharacter}
                initialData={editingCharacter}
                storyId={editingCharacter?.storyId || stories[0]?.id || ""}
                allCharacters={characters}
                existingRelationships={relationships}
            />
        </div>
      );
  };

  const renderRecycleBin = () => (
    <div className="p-8 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">回收站</h1>
            <button 
                onClick={() => setTrash([])}
                className="text-red-500 text-sm hover:text-red-600 font-medium"
            >
                清空回收站
            </button>
        </div>
        <div className="space-y-2">
            {trash.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded mr-3">{item.type}</span>
                        <span className="font-medium text-slate-700">{item.title}</span>
                        <span className="text-xs text-slate-400 ml-3">删除于 {new Date(item.deletedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleRestore(item)} className="text-sm text-indigo-600 hover:underline">复原</button>
                        <button onClick={() => setTrash(trash.filter(t => t.id !== item.id))} className="text-sm text-red-500 hover:underline">永久删除</button>
                    </div>
                </div>
            ))}
            {trash.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    回收站是空的
                </div>
            )}
        </div>
    </div>
  );

  // --- Main Render ---

  const renderContent = () => {
    switch (currentView) {
      case ViewState.STORY_LIBRARY: return renderStoryLibrary();
      case ViewState.IDEA_GENIE: return <IdeaGenie onCreateStory={handleCreateStoryFromIdea} />;
      case ViewState.WRITING_DESK: 
        if (!selectedStoryId) return renderStoryLibrary();
        const story = stories.find(s => s.id === selectedStoryId);
        if (!story) return <div>Story not found</div>;
        return (
          <WritingEditor
            story={story}
            activeChapterId={activeChapterId}
            chapters={chapters.filter(c => c.storyId === selectedStoryId).sort((a,b) => a.order - b.order)}
            characters={characters.filter(c => c.storyId === selectedStoryId)}
            onSaveChapter={handleSaveChapter}
            onCreateChapter={() => {
                const newChapter: Chapter = {
                    id: generateId(),
                    storyId: story.id,
                    title: `第 ${chapters.filter(c => c.storyId === story.id).length + 1} 章`,
                    content: "",
                    order: chapters.filter(c => c.storyId === story.id).length + 1
                };
                setChapters([...chapters, newChapter]);
                setActiveChapterId(newChapter.id);
            }}
            onAddCharacters={handleAddCharacters}
            onUpdateOutline={handleUpdateOutline}
            onBack={() => setCurrentView(ViewState.STORY_LIBRARY)}
            onSelectChapter={setActiveChapterId}
            // Stats
            dailyGoal={userSettings.dailyGoal}
            todayCount={writingHistory.find(r => r.date === getTodayString())?.wordCount || 0}
          />
        );
      case ViewState.OUTLINE_WORLD: return <OutlineWorld outlines={outlines} stories={stories} onCreateOutline={() => alert('请在书写界面使用 AI 提取功能生成大纲')} />;
      case ViewState.DATA_LIBRARY: return renderDataLibrary();
      case ViewState.RECYCLE_BIN: return renderRecycleBin();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between z-10">
        <div>
          <div className="p-6 flex items-center gap-3 mb-4">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
             <span className="font-bold text-xl text-slate-800 tracking-tight">StoryWeaver</span>
          </div>
          <nav className="px-3 space-y-1">
            {renderSidebarItem(ViewState.DASHBOARD, <Plus size={18} />, '开始')}
            {renderSidebarItem(ViewState.STORY_LIBRARY, <BookOpen size={18} />, '故事库')}
            {renderSidebarItem(ViewState.IDEA_GENIE, <Lightbulb size={18} />, '点子精灵')}
            {renderSidebarItem(ViewState.OUTLINE_WORLD, <Map size={18} />, '大纲世界')}
            {renderSidebarItem(ViewState.DATA_LIBRARY, <Database size={18} />, '资料库')}
            <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">工作区</div>
            {selectedStoryId && (
                <button onClick={() => setCurrentView(ViewState.WRITING_DESK)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${currentView === ViewState.WRITING_DESK ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <PenTool size={18} />
                    <span className="font-medium text-sm truncate max-w-[150px]">{stories.find(s => s.id === selectedStoryId)?.title || "当前故事"}</span>
                </button>
            )}
          </nav>
        </div>
        <div className="p-3">
            {renderSidebarItem(ViewState.RECYCLE_BIN, <Trash2 size={18} />, '回收站')}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full relative overflow-hidden">
        {renderContent()}
      </div>

      {/* Global AI Assistant */}
      <AiAssistant />
    </div>
  );
};

export default App;
