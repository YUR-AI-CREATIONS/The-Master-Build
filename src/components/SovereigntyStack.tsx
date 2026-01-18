import React, { useState } from 'react';
import { Server, Cloud, Network, Database, Shield, DollarSign } from 'lucide-react';

const SovereigntyStack = () => {
  const [selectedOption, setSelectedOption] = useState('hybrid');

  const hostingOptions = [
    {
      id: 'sovereign',
      name: 'Full Sovereignty',
      description: 'Complete control, zero dependencies',
      cost: '$50-100/mo',
      features: ['100% control', 'No deplatforming', 'Custom hardware', 'Maximum privacy'],
      stack: ['Bare metal servers', 'Self-hosted DNS', 'Local storage', 'Own IP space']
    },
    {
      id: 'decentralized',
      name: 'Decentralized Cloud',
      description: 'Distributed, censorship-resistant',
      cost: '$20-50/mo',
      features: ['No single point of failure', 'Blockchain-based', 'Immutable storage', 'Global redundancy'],
      stack: ['Akash Network', 'IPFS/Filecoin', 'Arweave storage', 'ENS domains']
    },
    {
      id: 'hybrid',
      name: 'Hybrid Mesh',
      description: 'Best of both worlds',
      cost: '$30-80/mo',
      features: ['Flexible scaling', 'Fallback options', 'Cost-effective', 'Progressive decentralization'],
      stack: ['Home nodes + VPS', 'Cloudflare tunnels', 'IPFS pinning', 'Dynamic DNS']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Sovereignty Infrastructure</h2>
        <p className="text-gray-400 text-lg">Host without compromise. Scale without permission.</p>
      </div>

      <div className="mb-12">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68f5dc1b612ea297bc54d841_1760943217895_8efc667d.webp"
          alt="Network Topology"
          className="w-full rounded-xl border border-gray-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {hostingOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`cursor-pointer border rounded-xl p-6 transition-all ${
              selectedOption === option.id
                ? 'bg-blue-950/30 border-blue-500'
                : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{option.name}</h3>
              <span className="text-green-400 font-mono">{option.cost}</span>
            </div>
            
            <p className="text-gray-400 mb-6">{option.description}</p>
            
            <div className="space-y-3 mb-6">
              {option.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-semibold mb-2 text-gray-400">Tech Stack</h4>
              <ul className="space-y-1">
                {option.stack.map((tech, idx) => (
                  <li key={idx} className="text-xs text-gray-500">• {tech}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 rounded-xl p-8 border border-blue-500/20">
        <h3 className="text-2xl font-bold mb-6">Recommended Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { layer: 'Frontend', solution: 'Fleek + IPFS', icon: Cloud },
            { layer: 'Backend', solution: 'Akash/Home Nodes', icon: Server },
            { layer: 'Data', solution: 'Arweave + IPFS', icon: Database },
            { layer: 'Access', solution: 'Cloudflare ZT', icon: Shield },
            { layer: 'Failover', solution: 'Home Server', icon: Network }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-900/50 rounded-lg p-4 text-center">
              <item.icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-semibold">{item.layer}</div>
              <div className="text-xs text-gray-400 mt-1">{item.solution}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SovereigntyStack;