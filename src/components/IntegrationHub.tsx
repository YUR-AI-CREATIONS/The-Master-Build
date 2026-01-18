import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const IntegrationHub = () => {
  const [filter, setFilter] = useState('all');

  const integrations = [
    { name: 'Slack', category: 'communication', status: 'connected' },
    { name: 'Discord', category: 'communication', status: 'connected' },
    { name: 'AWS S3', category: 'storage', status: 'connected' },
    { name: 'Google Drive', category: 'storage', status: 'available' },
    { name: 'GitHub', category: 'development', status: 'connected' },
    { name: 'GitLab', category: 'development', status: 'available' },
    { name: 'Stripe', category: 'payment', status: 'connected' },
    { name: 'PayPal', category: 'payment', status: 'available' },
    { name: 'PostgreSQL', category: 'database', status: 'connected' },
    { name: 'MongoDB', category: 'database', status: 'connected' },
    { name: 'Redis', category: 'database', status: 'connected' },
    { name: 'Kubernetes', category: 'infrastructure', status: 'connected' },
    { name: 'Docker', category: 'infrastructure', status: 'connected' },
    { name: 'Terraform', category: 'infrastructure', status: 'available' },
    { name: 'OpenAI', category: 'ai', status: 'connected' },
    { name: 'Anthropic', category: 'ai', status: 'pending' }
  ];

  const categories = ['all', 'communication', 'storage', 'development', 'payment', 'database', 'infrastructure', 'ai'];
  
  const filteredIntegrations = filter === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Integration Hub</h2>
        <p className="text-gray-400 text-lg">Connect to any system with sovereign control</p>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg capitalize transition-all ${
              filter === cat 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredIntegrations.map((integration, idx) => (
          <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{integration.name}</span>
              {integration.status === 'connected' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {integration.status === 'pending' && <Clock className="w-4 h-4 text-yellow-400" />}
              {integration.status === 'available' && <AlertCircle className="w-4 h-4 text-gray-400" />}
            </div>
            <div className="text-xs text-gray-500 capitalize">{integration.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationHub;