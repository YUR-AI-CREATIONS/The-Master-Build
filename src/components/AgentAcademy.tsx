import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Award, BookOpen, Users, TrendingUp, Brain, CheckCircle, Clock } from 'lucide-react';

const AgentAcademy = () => {
  const [selectedCourse, setSelectedCourse] = useState(0);

  const curriculum = [
    { name: 'Legal & Governance', progress: 85, level: 'Advanced', skills: 12 },
    { name: 'Construction & Engineering', progress: 72, level: 'Intermediate', skills: 8 },
    { name: 'Blockchain & Crypto', progress: 90, level: 'Expert', skills: 15 },
    { name: 'Finance & Compliance', progress: 68, level: 'Intermediate', skills: 10 },
    { name: 'Security & Fraud Detection', progress: 95, level: 'Expert', skills: 18 }
  ];

  const agents = [
    { name: 'Franklin', role: 'Governor', skills: 45, certs: 8, status: 'Training' },
    { name: 'Opus', role: 'Auditor', skills: 38, certs: 6, status: 'Active' },
    { name: 'Atlas', role: 'Operator', skills: 42, certs: 7, status: 'Training' },
    { name: 'Quill', role: 'Builder', skills: 35, certs: 5, status: 'Active' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          AI Agent Training Academy
        </h2>
        <p className="text-gray-400">Continuous learning and cross-training for sovereign intelligence</p>
      </div>

      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Core Curriculum
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {curriculum.map((course, idx) => (
                  <div key={idx} 
                    className="p-4 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-colors"
                    onClick={() => setSelectedCourse(idx)}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{course.name}</h4>
                      <Badge variant={course.level === 'Expert' ? 'default' : 'secondary'}>
                        {course.level}
                      </Badge>
                    </div>
                    <Progress value={course.progress} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{course.progress}% Complete</span>
                      <span>{course.skills} Skills</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Cross-Training Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.map((agent, idx) => (
                    <div key={idx} className="p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-semibold">{agent.name}</span>
                          <span className="text-gray-400 text-sm ml-2">({agent.role})</span>
                        </div>
                        <Badge variant={agent.status === 'Training' ? 'default' : 'outline'}>
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          <span>{agent.skills} Skills</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span>{agent.certs} Certs</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle>Skill Assessment Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {['Legal Reasoning', 'Cost Estimation', 'Smart Contract Auditing', 
                  'Fraud Detection', 'Compliance Check', 'System Architecture'].map((skill, idx) => (
                  <div key={idx} className="p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="font-semibold mb-2">{skill}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Accuracy</span>
                        <span className="text-green-400">{85 + idx * 2}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Speed</span>
                        <span className="text-blue-400">{92 - idx * 3}%</span>
                      </div>
                      <Button size="sm" className="w-full mt-2">Run Assessment</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Completion</span>
                    <span className="text-2xl font-bold text-green-400">78%</span>
                  </div>
                  <Progress value={78} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-gray-900/50 rounded">
                      <div className="text-2xl font-bold text-purple-400">156</div>
                      <div className="text-sm text-gray-400">Skills Mastered</div>
                    </div>
                    <div className="text-center p-3 bg-gray-900/50 rounded">
                      <div className="text-2xl font-bold text-blue-400">42</div>
                      <div className="text-sm text-gray-400">In Progress</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>Knowledge Base Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Legal Documents</span>
                    </div>
                    <span className="text-sm text-gray-400">12,456 indexed</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Construction Specs</span>
                    </div>
                    <span className="text-sm text-gray-400">8,234 indexed</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span>Market Data</span>
                    </div>
                    <span className="text-sm text-gray-400">Syncing...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Certification System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: 'Legal Expert', level: 'Platinum', date: '2025-10-15', score: 98 },
                  { name: 'Construction Master', level: 'Gold', date: '2025-10-10', score: 92 },
                  { name: 'Blockchain Specialist', level: 'Platinum', date: '2025-10-18', score: 96 },
                  { name: 'Security Sentinel', level: 'Platinum', date: '2025-10-20', score: 99 },
                  { name: 'Finance Auditor', level: 'Gold', date: '2025-10-12', score: 88 },
                  { name: 'Compliance Officer', level: 'Silver', date: '2025-10-08', score: 85 }
                ].map((cert, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <GraduationCap className="w-8 h-8 text-yellow-400" />
                      <Badge variant={cert.level === 'Platinum' ? 'default' : cert.level === 'Gold' ? 'secondary' : 'outline'}>
                        {cert.level}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-1">{cert.name}</h4>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Score: {cert.score}%</div>
                      <div>Issued: {cert.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentAcademy;