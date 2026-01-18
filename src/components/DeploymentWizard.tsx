import React, { useState } from 'react';
import { Rocket, Server, Cloud, Shield, ChevronRight, Check } from 'lucide-react';

const DeploymentWizard = () => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    sovereignty: '',
    infrastructure: '',
    security: ''
  });

  const steps = [
    { id: 1, name: 'Sovereignty Level', icon: Shield },
    { id: 2, name: 'Infrastructure', icon: Server },
    { id: 3, name: 'Security Config', icon: Cloud },
    { id: 4, name: 'Deploy', icon: Rocket }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Deployment Wizard</h2>
        <p className="text-gray-400 text-lg">Configure and launch your sovereign AI system</p>
      </div>

      <div className="flex justify-between mb-12">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-3 ${s.id <= step ? 'text-blue-400' : 'text-gray-600'}`}>
                <div className={`p-3 rounded-full border-2 ${
                  s.id < step ? 'bg-blue-600 border-blue-600' :
                  s.id === step ? 'border-blue-400' : 'border-gray-600'
                }`}>
                  {s.id < step ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className="hidden md:block font-semibold">{s.name}</span>
              </div>
              {s.id < steps.length && (
                <ChevronRight className="w-5 h-5 mx-4 text-gray-600" />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Choose Sovereignty Level</h3>
            {['Full Sovereign (100%)', 'Hybrid Mesh (75%)', 'Managed Cloud (25%)'].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setConfig({...config, sovereignty: level});
                  setStep(2);
                }}
                className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-lg text-left transition-all"
              >
                <div className="font-semibold">{level}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {level.includes('100%') && 'Complete control, no dependencies'}
                  {level.includes('75%') && 'Balance of control and convenience'}
                  {level.includes('25%') && 'Easy setup with some external dependencies'}
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Select Infrastructure</h3>
            {['Bare Metal Servers', 'Decentralized Cloud (Akash)', 'Hybrid Setup'].map((infra) => (
              <button
                key={infra}
                onClick={() => {
                  setConfig({...config, infrastructure: infra});
                  setStep(3);
                }}
                className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-lg text-left transition-all"
              >
                <div className="font-semibold">{infra}</div>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Security Configuration</h3>
            {['Maximum Security', 'Balanced', 'Performance Optimized'].map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setConfig({...config, security: sec});
                  setStep(4);
                }}
                className="w-full p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-lg text-left transition-all"
              >
                <div className="font-semibold">{sec}</div>
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Ready to Deploy</h3>
            <div className="bg-gray-800 rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Sovereignty:</span>
                <span className="font-semibold">{config.sovereignty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Infrastructure:</span>
                <span className="font-semibold">{config.infrastructure}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Security:</span>
                <span className="font-semibold">{config.security}</span>
              </div>
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
              <Rocket className="w-5 h-5" />
              Launch System
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentWizard;