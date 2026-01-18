import React, { useState, useEffect } from 'react';
import { 
  Shield, Cpu, Cloud, Server, Lock, Zap, 
  Network, Database, Code, Globe, Activity,
  ChevronRight, CheckCircle, AlertCircle, Play,
  Layers, GitBranch, Terminal, Sparkles, Brain
} from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';
import MultiAgentCollaboration from '@/components/MultiAgentCollaboration';
import SovereigntyStack from '@/components/SovereigntyStack';
import AgentOrchestrator from './AgentOrchestrator';
import AgentAcademy from './AgentAcademy';
import IntegrationHub from './IntegrationHub';
import SecurityFortress from './SecurityFortress';
import DeploymentWizard from './DeploymentWizard';
import WebSocketManager from './WebSocketManager';
import TaskFlowDiagram from './TaskFlowDiagram';
import AICommandCenter from './AICommandCenter';

const AppLayout = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [systemStatus, setSystemStatus] = useState('initializing');
  const [agentMetrics, setAgentMetrics] = useState({
    active: 0,
    processing: 0,
    completed: 0
  });

  useEffect(() => {
    // Simulate system initialization
    const timer = setTimeout(() => {
      setSystemStatus('operational');
      setAgentMetrics({
        active: 8,
        processing: 3,
        completed: 247
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950/20 to-gray-950 text-white">
      {/* Hero Section with Particle Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <ParticleBackground />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
              <div className={`w-2 h-2 rounded-full ${systemStatus === 'operational' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`} />
              <span className="text-sm font-mono text-blue-300">
                System {systemStatus === 'operational' ? 'Operational' : 'Initializing'}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-yellow-400 bg-clip-text text-transparent animate-gradient">
              Franklin OS
            </h1>
            
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Sovereign AI Operating System with Autonomous Agent Orchestration
            </p>

            {/* Metrics Display */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-blue-400">{agentMetrics.active}</div>
                <div className="text-sm text-gray-400 mt-1">Active Agents</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-cyan-400">{agentMetrics.processing}</div>
                <div className="text-sm text-gray-400 mt-1">Processing</div>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-400">{agentMetrics.completed}</div>
                <div className="text-sm text-gray-400 mt-1">Completed</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center mt-12">
              <button 
                onClick={() => scrollToSection('ai-center')}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Launch AI Command Center
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => scrollToSection('sovereignty')}
                className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-700 transition-all duration-300"
              >
                Explore Sovereignty
              </button>
            </div>
          </div>
        </div>

        {/* Animated Network Visualization */}
        <div className="absolute inset-0 pointer-events-none">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68f5dc1b612ea297bc54d841_1760943186912_2402007e.webp"
            alt="AI Network"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        </div>
      </section>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-400" />
              <span className="font-bold text-xl">Franklin OS</span>
            </div>
            <div className="flex gap-8">
              {['AI Center', 'Orchestrator', 'Sovereignty', 'Security', 'Deploy'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  {item === 'AI Center' && <Brain className="w-4 h-4" />}
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      {/* AI Command Center - REAL AI Integration */}
      <section id="ai-center" className="py-20 bg-gradient-to-b from-purple-950/20 to-gray-950">
        <AICommandCenter />
      </section>

      {/* Agent Orchestrator Section */}
      <section id="orchestrator" className="py-20">
        <AgentOrchestrator />
      </section>

      {/* WebSocket Communication Section */}
      <section id="websocket" className="py-20 bg-gradient-to-b from-gray-950 to-cyan-950/10">
        <WebSocketManager />
      </section>

      {/* Task Flow Diagram Section */}
      <section id="taskflow" className="py-20">
        <TaskFlowDiagram />
      </section>

      {/* Sovereignty Stack Section */}
      <section id="sovereignty" className="py-20 bg-gradient-to-b from-gray-950 to-blue-950/10">
        <SovereigntyStack />
      </section>

      {/* Security Fortress Section */}
      <section id="security" className="py-20">
        <SecurityFortress />
      </section>

      {/* Integration Hub Section */}
      <section id="integrations" className="py-20 bg-gradient-to-b from-gray-950 to-purple-950/10">
        <IntegrationHub />
      </section>
      {/* AI Agent Academy Section */}
      <section id="academy" className="py-20 bg-gradient-to-b from-gray-950 to-indigo-950/10">
        <div className="max-w-7xl mx-auto px-6">
          <AgentAcademy />
        </div>
      </section>

      {/* Multi-Agent Collaboration Section */}
      <section id="collaboration" className="py-20 bg-gradient-to-b from-gray-950 to-purple-950/10">
        <div className="max-w-7xl mx-auto px-6">
          <MultiAgentCollaboration />
        </div>
      </section>

      {/* Deployment Wizard Section */}
      <section id="deploy" className="py-20">
        <DeploymentWizard />
      </section>
      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Franklin OS</h3>
              <p className="text-gray-400 text-sm">
                Sovereign AI Operating System for the decentralized future.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Infrastructure</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Bare Metal</li>
                <li>Decentralized Cloud</li>
                <li>Mesh Networks</li>
                <li>IPFS/Arweave</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Security</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Zero Trust</li>
                <li>Quantum Resistant</li>
                <li>DDoS Protection</li>
                <li>E2E Encryption</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community</li>
                <li>Support</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © 2024 Franklin OS. Built for sovereignty. No dependencies. No compromises.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;