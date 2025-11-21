import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, User, Shield, Zap, Flag, Activity, Heart, Smile } from 'lucide-react';
import { Character, CharacterRole } from '../types';

interface CharacterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Character) => void;
  onDelete: (id: string) => void;
  initialData?: Character | null;
  storyId: string; // Required for new characters
}

const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  storyId
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'core' | 'deep'>('basic');
  const [formData, setFormData] = useState<Character>({
    id: '',
    storyId: storyId,
    name: '',
    role: '配角',
    conflict: '',
    obstacle: '',
    action: '',
    ending: '',
    description: '',
    appearance: '',
    relationships: '',
    growthArc: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        // Reset for new character
        setFormData({
          id: Math.random().toString(36).substr(2, 9),
          storyId: storyId,
          name: '',
          role: '配角',
          conflict: '',
          obstacle: '',
          action: '',
          ending: '',
          description: '',
          appearance: '',
          relationships: '',
          growthArc: ''
        });
      }
      setActiveTab('basic');
    }
  }, [isOpen, initialData, storyId]);

  if (!isOpen) return null;

  const handleChange = (field: keyof Character, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const roleOptions: CharacterRole[] = ['主角', '反派', '配角', '路人'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {initialData ? '编辑人物' : '新建人物'}
              </h2>
              <p className="text-xs text-slate-400">完善人物小传与核心驱动力</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {initialData && (
              <button 
                onClick={() => { 
                  if(window.confirm('确定要删除这个人物吗？')) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                title="删除人物"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'basic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            基本信息
          </button>
          <button
            onClick={() => setActiveTab('core')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'core' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            核心驱动 (故事四要素)
          </button>
          <button
            onClick={() => setActiveTab('deep')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'deep' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            深度设定 (外貌/成长)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          
          {/* --- BASIC INFO --- */}
          {activeTab === 'basic' && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">姓名</label>
                  <input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="人物名称"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">角色定位</label>
                  <div className="flex gap-2">
                    {roleOptions.map(role => (
                      <button
                        key={role}
                        onClick={() => handleChange('role', role)}
                        className={`flex-1 py-2.5 rounded-lg text-sm border transition-all ${
                          formData.role === role 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">简要描述 / 身份</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] resize-none"
                  placeholder="一句话描述这个人物是谁..."
                />
              </div>
            </div>
          )}

          {/* --- CORE DRIVERS --- */}
          {activeTab === 'core' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-amber-600">
                  <Shield size={18} />
                  <h3 className="font-bold">冲突 (Conflict)</h3>
                </div>
                <p className="text-xs text-slate-400 mb-2">内心的纠结或外部的矛盾，推动故事发展的核心动力。</p>
                <textarea
                  value={formData.conflict}
                  onChange={(e) => handleChange('conflict', e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-1 focus:ring-indigo-500 text-sm min-h-[120px] resize-none"
                  placeholder="例如：想要自由但必须照顾生病的母亲..."
                />
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-red-600">
                  <Zap size={18} />
                  <h3 className="font-bold">阻碍 (Obstacle)</h3>
                </div>
                <p className="text-xs text-slate-400 mb-2">阻止人物达成目标的具体力量或反派。</p>
                <textarea
                  value={formData.obstacle}
                  onChange={(e) => handleChange('obstacle', e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-1 focus:ring-indigo-500 text-sm min-h-[120px] resize-none"
                  placeholder="例如：强大的帝国军队，严酷的自然环境..."
                />
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                  <Activity size={18} />
                  <h3 className="font-bold">行动 (Action)</h3>
                </div>
                <p className="text-xs text-slate-400 mb-2">人物为了克服阻碍所采取的具体做法。</p>
                <textarea
                  value={formData.action}
                  onChange={(e) => handleChange('action', e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-1 focus:ring-indigo-500 text-sm min-h-[120px] resize-none"
                  placeholder="例如：潜入敌营，寻找传说中的神器..."
                />
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-green-600">
                  <Flag size={18} />
                  <h3 className="font-bold">结局 (Ending)</h3>
                </div>
                <p className="text-xs text-slate-400 mb-2">人物最终的命运或状态。</p>
                <textarea
                  value={formData.ending}
                  onChange={(e) => handleChange('ending', e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-1 focus:ring-indigo-500 text-sm min-h-[120px] resize-none"
                  placeholder="例如：牺牲自己拯救了世界，获得了内心的平静..."
                />
              </div>
            </div>
          )}

          {/* --- DEEP SETTINGS --- */}
          {activeTab === 'deep' && (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-purple-600">
                        <Smile size={20} />
                        <h3 className="font-bold">外貌与特征 (Appearance)</h3>
                    </div>
                    <textarea
                        value={formData.appearance || ''}
                        onChange={(e) => handleChange('appearance', e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-lg border-none focus:ring-1 focus:ring-indigo-500 min-h-[100px]"
                        placeholder="身高、体型、衣着风格、标志性物品..."
                    />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-pink-600">
                        <Heart size={20} />
                        <h3 className="font-bold">人物关系 (Relationships)</h3>
                    </div>
                    <textarea
                        value={formData.relationships || ''}
                        onChange={(e) => handleChange('relationships', e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-lg border-none focus:ring-1 focus:ring-indigo-500 min-h-[100px]"
                        placeholder="与主角的关系、家庭背景、盟友与敌人..."
                    />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-emerald-600">
                        <Activity size={20} />
                        <h3 className="font-bold">成长曲线 (Growth Arc)</h3>
                    </div>
                    <textarea
                        value={formData.growthArc || ''}
                        onChange={(e) => handleChange('growthArc', e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-lg border-none focus:ring-1 focus:ring-indigo-500 min-h-[100px]"
                        placeholder="人物从故事开始到结束的心理变化轨迹..."
                    />
                </div>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-200 font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={() => { onSave(formData); onClose(); }}
            disabled={!formData.name}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
          >
            <Save size={18} />
            保存设定
          </button>
        </div>

      </div>
    </div>
  );
};

export default CharacterDetailModal;