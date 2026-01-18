import React, { useState, useEffect } from 'react';
import { GitBranch, Circle, CheckCircle, Clock, AlertCircle, ArrowRight, Zap, Users } from 'lucide-react';

interface TaskNode {
  id: string;
  agent: string;
  task: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dependencies: string[];
  progress: number;
}

const TaskFlowDiagram = () => {
  const [tasks, setTasks] = useState<TaskNode[]>([
    { id: 't1', agent: 'Franklin', task: 'Initialize System', status: 'completed', dependencies: [], progress: 100 },
    { id: 't2', agent: 'Claude', task: 'Legal Analysis', status: 'processing', dependencies: ['t1'], progress: 65 },
    { id: 't3', agent: 'Gemini', task: 'Data Synthesis', status: 'processing', dependencies: ['t1'], progress: 45 },
    { id: 't4', agent: 'GPT-5', task: 'Generate Reports', status: 'pending', dependencies: ['t2', 't3'], progress: 0 },
    { id: 't5', agent: 'Copilot', task: 'Code Review', status: 'pending', dependencies: ['t3'], progress: 0 },
    { id: 't6', agent: 'Brock', task: 'Security Audit', status: 'pending', dependencies: ['t4', 't5'], progress: 0 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status === 'processing' && task.progress < 100) {
          const newProgress = Math.min(task.progress + Math.random() * 10, 100);
          return {
            ...task,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'processing'
          };
        }
        if (task.status === 'pending') {
          const deps = prev.filter(t => task.dependencies.includes(t.id));
          if (deps.every(d => d.status === 'completed')) {
            return { ...task, status: 'processing', progress: 10 };
          }
        }
        return task;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: TaskNode['status']) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing': return <Clock className="w-5 h-5 text-yellow-400 animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Task Delegation Workflow
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Visual representation of task dependencies and agent collaboration in real-time
        </p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div key={task.id} className={`relative p-6 rounded-lg border transition-all ${
              task.status === 'completed' ? 'border-green-500/30 bg-green-500/5' :
              task.status === 'processing' ? 'border-yellow-500/30 bg-yellow-500/5 animate-pulse' :
              task.status === 'failed' ? 'border-red-500/30 bg-red-500/5' :
              'border-gray-700 bg-gray-800/50'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <h3 className="font-semibold">{task.task}</h3>
                    <p className="text-sm text-gray-400">{task.agent}</p>
                  </div>
                </div>
              </div>
              
              {task.status === 'processing' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-yellow-400">{Math.round(task.progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {task.dependencies.length > 0 && (
                <div className="text-xs text-gray-500">
                  Depends on: {task.dependencies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GitBranch className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">Workflow Status</span>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span>Completed: {tasks.filter(t => t.status === 'completed').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                <span>Processing: {tasks.filter(t => t.status === 'processing').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span>Pending: {tasks.filter(t => t.status === 'pending').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFlowDiagram;