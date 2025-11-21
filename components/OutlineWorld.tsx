import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Outline, Story } from '../types';
import { Plus, Layout, Eye, X } from 'lucide-react';

interface OutlineWorldProps {
  outlines: Outline[];
  stories: Story[];
  onCreateOutline: () => void;
}

const OutlineWorld: React.FC<OutlineWorldProps> = ({ outlines, stories, onCreateOutline }) => {
  const [viewingOutline, setViewingOutline] = useState<Outline | null>(null);

  const getStoryName = (id: string) => stories.find(s => s.id === id)?.title || "未知故事";

  // Transform data for chart
  const renderChart = (outline: Outline, heightClass: string = "h-48") => {
    if (!outline.points || outline.points.length === 0) {
        return <div className={`${heightClass} flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200`}>暂无数据点</div>
    }

    // Add index for X axis continuity
    const data = outline.points.map((p, i) => ({ ...p, index: i + 1 }));

    return (
      <div className={`${heightClass} w-full mt-4`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorTension-${outline.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="stage" hide />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
            />
            <Area 
                type="monotone" 
                dataKey="tension" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#colorTension-${outline.id})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">大纲世界</h1>
          <p className="text-slate-500 text-sm mt-1">可视化你的故事结构与人物成长曲线</p>
        </div>
        <button onClick={onCreateOutline} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
          <Plus size={16} />
          新建大纲
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {outlines.map(outline => (
          <div key={outline.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-slate-800">{outline.title || "未命名大纲"}</h3>
              <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                {getStoryName(outline.storyId)}
              </span>
            </div>
            
            {renderChart(outline)}

            <div className="mt-4 flex-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">关键节点预览</h4>
              <div className="space-y-2">
                {outline.points.slice(0, 3).map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-slate-700 block truncate">{point.stage}</span>
                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{point.description}</p>
                    </div>
                  </div>
                ))}
                {outline.points.length > 3 && (
                   <div className="text-xs text-center text-slate-400 pt-2">...还有 {outline.points.length - 3} 个节点</div>
                )}
              </div>
            </div>

            {/* Detail Button */}
            <div className="mt-4 pt-4 border-t border-slate-100">
                <button 
                    onClick={() => setViewingOutline(outline)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                >
                    <Eye size={16} />
                    查看详情
                </button>
            </div>
          </div>
        ))}
        
        {/* Empty State */}
        {outlines.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Layout size={48} className="mb-4 opacity-50" />
            <p>暂无大纲。从书写界面提取，或点击新建。</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewingOutline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{viewingOutline.title}</h2>
                        <p className="text-slate-500 text-sm mt-1">
                            所属故事: {getStoryName(viewingOutline.storyId)}
                        </p>
                    </div>
                    <button 
                        onClick={() => setViewingOutline(null)}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                        <h3 className="font-bold text-slate-700 mb-4">情绪/张力曲线</h3>
                        {renderChart(viewingOutline, "h-64")}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-700 mb-4">完整大纲节点 ({viewingOutline.points.length})</h3>
                        <div className="space-y-0 divide-y divide-slate-100">
                            {viewingOutline.points.map((point, idx) => (
                                <div key={idx} className="py-4 flex gap-4 hover:bg-slate-50 transition-colors px-2 rounded-lg">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mt-1">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-slate-800 text-lg">{point.stage}</h4>
                                            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                                                张力: {point.tension}%
                                            </span>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed">{point.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OutlineWorld;