import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap, Send, Loader2, AlertCircle, CheckCircle, Sparkles, Cpu, Network, Mic, Volume2 } from 'lucide-react';
import { aiService } from '@/services/realAIService';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { VoiceCommand, voiceService } from '@/services/voiceService';

export function AICommandCenter() {
  const [prompt, setPrompt] = useState('');
  const [selectedMode, setSelectedMode] = useState('auto');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedAgent, setSelectedAgent] = useState('researcher');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('command');
  const [lastResponse, setLastResponse] = useState<string>('');
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(true);

  const agents = [
    { id: 'researcher', name: 'Research Agent', description: 'Analyzes topics and provides insights' },
    { id: 'coder', name: 'Code Agent', description: 'Writes clean, efficient code' },
    { id: 'analyst', name: 'Data Analyst', description: 'Analyzes data and provides insights' },
    { id: 'writer', name: 'Content Writer', description: 'Creates engaging content' },
    { id: 'designer', name: 'Design Agent', description: 'Provides design solutions' },
    { id: 'strategist', name: 'Strategy Agent', description: 'Develops business strategies' }
  ];

  const providers = [
    { id: 'openai', name: 'OpenAI GPT-4', available: true },
    { id: 'anthropic', name: 'Claude 3', available: true },
    { id: 'google', name: 'Google Gemini', available: true }
  ];

  useEffect(() => {
    // Load task history on mount
    loadTaskHistory();
  }, []);

  const loadTaskHistory = async () => {
    const history = await aiService.getTaskHistory();
    setTaskHistory(history);
  };

  const handleSubmit = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const response = await aiService.callAI(
        selectedProvider as 'openai' | 'anthropic' | 'google',
        promptToUse
      );
      
      if (response.success && response.data) {
        const content = response.data.content;
        setResults(prev => [{
          id: crypto.randomUUID(),
          type: 'success',
          content: content,
          timestamp: new Date(),
          provider: response.data.provider,
          model: response.data.model
        }, ...prev].slice(0, 10));
        
        // Set last response for voice output
        setLastResponse(content);
      } else {
        throw new Error(response.error || 'AI service failed');
      }
      
      setPrompt('');
      await loadTaskHistory();
      
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process request';
      setResults(prev => [{
        id: crypto.randomUUID(),
        type: 'error',
        content: errorMessage,
        timestamp: new Date(),
        provider: 'system'
      }, ...prev].slice(0, 10));
      
      setLastResponse(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAgentExecution = async (customTask?: string, customAgent?: string) => {
    const taskToUse = customTask || prompt;
    const agentToUse = customAgent || selectedAgent;
    
    if (!taskToUse.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const response = await aiService.executeAgent({
        agentType: agentToUse,
        task: taskToUse,
        provider: selectedProvider as 'openai' | 'anthropic'
      });
      
      if (response.success && response.data) {
        const content = response.data.response;
        setResults(prev => [{
          id: crypto.randomUUID(),
          type: 'success',
          content: content,
          timestamp: new Date(),
          provider: response.data.provider,
          model: response.data.model,
          agent: response.data.agentType
        }, ...prev].slice(0, 10));
        
        // Set last response for voice output
        setLastResponse(content);
      } else {
        throw new Error(response.error || 'Agent execution failed');
      }
      
      setPrompt('');
      await loadTaskHistory();
      
    } catch (error: any) {
      const errorMessage = error.message || 'Agent execution failed';
      setResults(prev => [{
        id: crypto.randomUUID(),
        type: 'error',
        content: errorMessage,
        timestamp: new Date(),
        provider: 'system'
      }, ...prev].slice(0, 10));
      
      setLastResponse(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePipelineExecution = async (pipelineType: 'research-write' | 'code-document') => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const steps = pipelineType === 'research-write' 
        ? [
            { agentType: 'researcher', task: prompt || 'Research AI trends', provider: 'openai' },
            { agentType: 'writer', task: 'Write article based on research', provider: 'anthropic' }
          ]
        : [
            { agentType: 'coder', task: prompt || 'Create a React component', provider: 'openai' },
            { agentType: 'writer', task: 'Document the code', provider: 'anthropic' }
          ];
      
      const workflow = await aiService.runWorkflow(pipelineType, steps);
      
      setResults(prev => [{
        id: crypto.randomUUID(),
        type: 'success',
        content: `Pipeline "${pipelineType}" completed successfully`,
        timestamp: new Date(),
        provider: 'pipeline'
      }, ...prev].slice(0, 10));
      
      setLastResponse(`The ${pipelineType} pipeline has completed successfully.`);
    } catch (error: any) {
      console.error(error);
      setLastResponse(`Pipeline execution failed: ${error.message}`);
    }
    
    setIsProcessing(false);
  };

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    console.log('Voice command received:', command);
    
    switch (command.action) {
      case 'execute':
        if (command.parameters?.prompt) {
          setPrompt(command.parameters.prompt);
          handleSubmit(command.parameters.prompt);
        }
        break;
        
      case 'agent':
        if (command.target) {
          setSelectedAgent(command.target);
          setActiveTab('agents');
          if (command.parameters?.task) {
            setPrompt(command.parameters.task);
            handleAgentExecution(command.parameters.task, command.target);
          } else {
            voiceService.speak(`${command.target} agent selected. What task would you like me to perform?`);
          }
        }
        break;
        
      case 'pipeline':
        setActiveTab('pipeline');
        if (command.target === 'research-write') {
          handlePipelineExecution('research-write');
        } else if (command.target === 'code-document') {
          handlePipelineExecution('code-document');
        } else {
          voiceService.speak('Which pipeline would you like to run? Research and write, or code and document?');
        }
        break;
        
      case 'stop':
        voiceService.stopSpeaking();
        setLastResponse('');
        break;
        
      case 'clear':
        setPrompt('');
        setResults([]);
        setLastResponse('Results cleared.');
        break;
        
      case 'read':
        if (results.length > 0) {
          const latestResult = results[0];
          voiceService.speak(latestResult.content);
        } else {
          voiceService.speak('No results to read.');
        }
        break;
        
      case 'help':
        const helpMessage = `You can say: Execute followed by your prompt, Use researcher agent, Run pipeline, Stop, Clear, or Read results.`;
        voiceService.speak(helpMessage);
        break;
        
      default:
        // Treat unknown commands as prompts
        if (command.rawText) {
          setPrompt(command.rawText);
          handleSubmit(command.rawText);
        }
    }
  }, [selectedAgent, selectedProvider, results]);

  // Handle transcript updates (for real-time display)
  const handleTranscript = useCallback((text: string) => {
    setPrompt(text);
  }, []);

  return (
    <div className="space-y-6">
      {/* Voice Assistant Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-400" />
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Command Center
            </h3>
            <p className="text-sm text-gray-400">Orchestrate multiple AI providers with intelligent routing</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
          className={`${showVoiceAssistant ? 'border-cyan-500 text-cyan-400' : 'border-gray-600 text-gray-400'}`}
        >
          {showVoiceAssistant ? <Volume2 className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
          {showVoiceAssistant ? 'Voice On' : 'Voice Off'}
        </Button>
      </div>

      {/* Voice Assistant Component */}
      {showVoiceAssistant && (
        <VoiceAssistant
          onCommand={handleVoiceCommand}
          onTranscript={handleTranscript}
          lastResponse={lastResponse}
          isProcessing={isProcessing}
        />
      )}

      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20 p-6">
        <Alert className="mb-6 border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            <strong>System Ready:</strong> AI providers are configured and ready. Voice commands enabled for hands-free control.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full bg-gray-900/50">
            <TabsTrigger value="command" className="data-[state=active]:bg-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Command
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-purple-600">
              <Network className="w-4 h-4 mr-2" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-purple-600">
              <Cpu className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="command" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Mode</label>
                <Select value={selectedMode} onValueChange={setSelectedMode}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-Route (Intelligent)</SelectItem>
                    <SelectItem value="manual">Manual Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedMode === 'manual' && (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Provider</label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto Select</SelectItem>
                      <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                      <SelectItem value="anthropic">Claude 3</SelectItem>
                      <SelectItem value="google">Gemini Pro</SelectItem>
                      <SelectItem value="stability">Stable Diffusion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your command or question... or use voice input above"
                className="min-h-[100px] bg-gray-900/50 border-gray-700"
              />
            </div>

            <Button
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Execute Command
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                <strong>Multi-Stage Pipelines:</strong> Chain multiple AI agents together for complex workflows. Say "Run research pipeline" to start.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-3">
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Research & Write Pipeline</h4>
                  <Button
                    size="sm"
                    onClick={() => handlePipelineExecution('research-write')}
                    disabled={isProcessing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                </div>
                <p className="text-xs text-gray-400">Research → Analysis → Content Creation</p>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Code & Document Pipeline</h4>
                  <Button
                    size="sm"
                    onClick={() => handlePipelineExecution('code-document')}
                    disabled={isProcessing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                </div>
                <p className="text-xs text-gray-400">Code Generation → Documentation → Testing</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Select Agent Type (or say "Use [agent name] agent")</label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Task Description</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the task for the selected agent..."
                  className="min-h-[100px] bg-gray-900/50 border-gray-700"
                />
              </div>
              
              <Button
                onClick={() => handleAgentExecution()}
                disabled={!prompt.trim() || isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agent Processing...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 mr-2" />
                    Execute Agent Task
                  </>
                )}
              </Button>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                {agents.map(agent => (
                  <div 
                    key={agent.id} 
                    className={`p-4 bg-gray-900/50 rounded-lg border cursor-pointer transition-all ${
                      selectedAgent === agent.id 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <h4 className="font-semibold mb-1">{agent.name}</h4>
                    <p className="text-xs text-gray-400">{agent.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-400">Recent Results</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (results[0]) {
                    voiceService.speak(results[0].content);
                  }
                }}
                className="text-cyan-400 hover:text-cyan-300"
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Read Aloud
              </Button>
            </div>
            {results.slice(0, 3).map(result => (
              <div key={result.id} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  {result.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xs text-gray-500">
                    {result.provider} • {result.timestamp.toLocaleTimeString()}
                  </span>
                  {result.agent && (
                    <Badge variant="outline" className="text-xs">{result.agent}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {typeof result.content === 'string' ? result.content : JSON.stringify(result.content)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
export default AICommandCenter;
