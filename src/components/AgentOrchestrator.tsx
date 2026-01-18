import React, { useState } from 'react';
import { Cpu, Activity, GitBranch, Zap, Database, Shield, Code, Globe } from 'lucide-react';

const AgentOrchestrator = () => {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  const agents = [
    {
      id: 1,
      name: 'Master Controller',
      role: 'Orchestration',
      status: 'active',
      tasks: 47,
      icon: Cpu,
      image: 'https://d64gsuwffb70l.cloudfront.net/68f5dc1b612ea297bc54d841_1760943196019_9dabf6b8.webp'
    },
    {
      id: 2,
      name: 'Data Processor',
      role: 'Analytics',
      status: 'processing',
      tasks: 23,
      icon: Database,
      image: 'https://d64gsuwffb70l.cloudfront.net/68f5dc1b612ea297bc54d841_1760943197709_78336972.webp'
    },
    {
      id: 3,
      name: 'Security Guard',
      role: 'Protection',
      status: 'active',
      tasks: 12,
      icon: Shield,
      image: 'https://d64gsuwffb70l.cloudfront.net/68f5dc1b612ea297bc54d841_1760943199497_6e7c2315.webp'
    },
    {
      id: 4,
      name: 'API Gateway',
      role: 'Integration',
      status: 'active',
      tasks: 89,
      icon: GitBranch,
      image: 'https://d64gsuwffb70l.cloudfront.net/68f5dc1b612ea297bc54d841_1760943201356_ac36eeb3.webp'
    },
    {
      id: 5,
      name: 'Code Generator',
      role: 'Development',
      status: 'idle',
      tasks: 5,
      icon: Code,
      image: 'https://d64gsuwffb70l.cloudfront.net/68f5dc1b612ea297bc54d841_1760943203114_f7d536d3.webp'
    },
    {
      id: 6,
      name: 'Network Monitor',
      role: 'Infrastructure',
      status: 'active',
      tasks: 31,
      icon: Activity,
      image: 'https://d64gsuwffb70l.cloudfront.net/68f5dc1b612ea297bc54d841_1760943204843_b7c58242.webp'
    },
    {
      id: 7,
      name: 'Task Scheduler',
      role: 'Automation',
      status: 'processing',
      tasks: 67,
      icon: Zap,
      image: 'https://d64gsuwffb70l.cloudfront.net/68f5dc1b612ea297bc54d841_1760943206589_4ff966f8.webp'
    },
    {
      id: 8,
      name: 'Edge Deployer',
      role: 'Distribution',
      status: 'active',
      tasks: 15,
      icon: Globe,
      image: 'https://d64gsuwffb70l.cloudfront.net/68f5dc1b612ea297bc54d841_1760943208364_7ee22f00.webp'
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'idle': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Agent Orchestration Center</h2>
        <p className="text-gray-400 text-lg">Autonomous AI agents working in perfect harmony</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                selectedAgent === agent.id ? 'scale-105' : ''
              }`}
            >
              <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                <div className="relative mb-4">
                  <img 
                    src={agent.image} 
                    alt={agent.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent rounded-lg" />
                  <Icon className="absolute bottom-2 right-2 w-6 h-6 text-blue-400" />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)} animate-pulse`} />
                </div>
                
                <p className="text-gray-400 text-sm mb-3">{agent.role}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Tasks</span>
                  <span className="text-sm font-mono text-blue-400">{agent.tasks}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Status</span>
                    <span className={`capitalize ${
                      agent.status === 'active' ? 'text-green-400' :
                      agent.status === 'processing' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-6">System Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-blue-400">Frontend Layer</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• React + TypeScript</li>
              <li>• WebSocket connections</li>
              <li>• Real-time dashboards</li>
              <li>• Progressive Web App</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-cyan-400">Backend Layer</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Distributed microservices</li>
              <li>• Event-driven architecture</li>
              <li>• GraphQL + REST APIs</li>
              <li>• Message queue system</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-yellow-400">Data Layer</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Distributed storage</li>
              <li>• IPFS/Arweave integration</li>
              <li>• Encrypted databases</li>
              <li>• Real-time sync</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOrchestrator;