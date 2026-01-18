import React from 'react';
import { Shield, Lock, Eye, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const SecurityFortress = () => {
  const securityLayers = [
    {
      name: 'Quantum Encryption',
      description: 'Post-quantum cryptography ready',
      status: 'active',
      strength: 100,
      icon: Lock
    },
    {
      name: 'DDoS Protection',
      description: 'Multi-layer traffic filtering',
      status: 'active',
      strength: 95,
      icon: Shield
    },
    {
      name: 'Zero Trust Network',
      description: 'Never trust, always verify',
      status: 'active',
      strength: 98,
      icon: Eye
    },
    {
      name: 'Failover System',
      description: 'Automatic redundancy switching',
      status: 'active',
      strength: 92,
      icon: Zap
    },
    {
      name: 'Threat Detection',
      description: 'AI-powered anomaly detection',
      status: 'monitoring',
      strength: 88,
      icon: AlertTriangle
    },
    {
      name: 'E2E Encryption',
      description: 'Full data protection pipeline',
      status: 'active',
      strength: 100,
      icon: CheckCircle
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Security Fortress</h2>
        <p className="text-gray-400 text-lg">Military-grade protection for sovereign operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {securityLayers.map((layer, idx) => {
          const Icon = layer.icon;
          return (
            <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  layer.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {layer.status}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{layer.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{layer.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Strength</span>
                  <span className="text-blue-400">{layer.strength}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${layer.strength}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-red-950/20 border border-red-500/30 rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-4 text-red-400">Active Threat Monitoring</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-white">0</div>
            <div className="text-sm text-gray-400">Active Threats</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400">2,847</div>
            <div className="text-sm text-gray-400">Blocked Today</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">99.99%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-400">12ms</div>
            <div className="text-sm text-gray-400">Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityFortress;