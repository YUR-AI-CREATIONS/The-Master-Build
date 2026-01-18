import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, GitBranch, MessageSquare, Zap, Shield, Target } from 'lucide-react';

const MultiAgentCollaboration = () => {
  const [activeTeam, setActiveTeam] = useState('alpha');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const teams = [
    { id: 'alpha', name: 'Alpha Team', agents: 5, status: 'active', efficiency: 92 },
    { id: 'beta', name: 'Beta Squad', agents: 3, status: 'idle', efficiency: 87 },
    { id: 'gamma', name: 'Gamma Force', agents: 4, status: 'executing', efficiency: 95 }
  ];

  const agents = [
    { id: 'a1', name: 'DataMiner-01', skills: ['analysis', 'extraction'], status: 'available' },
    { id: 'a2', name: 'Processor-X', skills: ['computation', 'optimization'], status: 'busy' },
    { id: 'a3', name: 'Guardian-7', skills: ['security', 'validation'], status: 'available' },
    { id: 'a4', name: 'Orchestrator-Z', skills: ['coordination', 'planning'], status: 'available' }
  ];

  const resources = [
    { type: 'CPU', allocated: 75, total: 100, unit: 'cores' },
    { type: 'Memory', allocated: 120, total: 256, unit: 'GB' },
    { type: 'Storage', allocated: 2.5, total: 5, unit: 'TB' },
    { type: 'Bandwidth', allocated: 800, total: 1000, unit: 'Mbps' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Multi-Agent Collaboration Hub
          </CardTitle>
          <CardDescription>Coordinate teams, allocate resources, and execute complex tasks</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="teams">Team Formation</TabsTrigger>
          <TabsTrigger value="resources">Resource Manager</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="execution">Task Execution</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {teams.map(team => (
                  <div key={team.id} 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      activeTeam === team.id ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700'
                    }`}
                    onClick={() => setActiveTeam(team.id)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{team.name}</h4>
                        <p className="text-sm text-gray-400">{team.agents} agents</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                          {team.status}
                        </Badge>
                        <p className="text-sm mt-1">{team.efficiency}% efficiency</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Formation Wizard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Agents</label>
                  {agents.map(agent => (
                    <div key={agent.id} className="flex items-center justify-between p-2 border border-gray-700 rounded">
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <div className="flex gap-1 mt-1">
                          {agent.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedAgents.includes(agent.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAgents([...selectedAgents, agent.id]);
                          } else {
                            setSelectedAgents(selectedAgents.filter(id => id !== agent.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </div>
                  ))}
                </div>
                <Button className="w-full" disabled={selectedAgents.length < 2}>
                  Create Team ({selectedAgents.length} agents)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources.map(resource => (
                <div key={resource.type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{resource.type}</span>
                    <span>{resource.allocated}/{resource.total} {resource.unit}</span>
                  </div>
                  <Progress value={(resource.allocated / resource.total) * 100} className="h-2" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline">Optimize Allocation</Button>
                <Button>Request More Resources</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inter-Agent Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border border-blue-500/30 rounded bg-blue-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Protocol: WebSocket</span>
                  </div>
                  <p className="text-sm text-gray-400">Real-time bidirectional communication</p>
                </div>
                <div className="p-3 border border-green-500/30 rounded bg-green-900/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium">Encryption: AES-256</span>
                  </div>
                  <p className="text-sm text-gray-400">End-to-end encrypted messages</p>
                </div>
                <Button className="w-full">Configure Protocols</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collaborative Task Execution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-yellow-500/30 rounded bg-yellow-900/10">
                  <h4 className="font-semibold mb-2">Active Task: Data Pipeline Optimization</h4>
                  <Progress value={67} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>3 agents collaborating</span>
                    <span>67% complete</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Conflict Resolution</h4>
                  <div className="p-3 border border-red-500/30 rounded">
                    <p className="text-sm">Resource conflict detected</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">Auto-Resolve</Button>
                      <Button size="sm">Manual Override</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiAgentCollaboration;