import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Target, BarChart3, Users, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface VelocityData {
  sprint: string;
  planned: number;
  completed: number;
  teamSize: number;
  avgVelocity: number;
  sprintDays: number;
}

interface VelocityChartProps {
  data?: VelocityData[];
}

const VelocityChart: React.FC<VelocityChartProps> = ({
  data = [
    { sprint: 'Sprint 1', planned: 35, completed: 28, teamSize: 6, avgVelocity: 28, sprintDays: 14 },
    { sprint: 'Sprint 2', planned: 40, completed: 38, teamSize: 7, avgVelocity: 33, sprintDays: 14 },
    { sprint: 'Sprint 3', planned: 42, completed: 40, teamSize: 7, avgVelocity: 35.3, sprintDays: 14 },
    { sprint: 'Sprint 4', planned: 45, completed: 35, teamSize: 8, avgVelocity: 35.3, sprintDays: 14 },
    { sprint: 'Sprint 5', planned: 38, completed: 42, teamSize: 8, avgVelocity: 36.6, sprintDays: 14 },
    { sprint: 'Sprint 6', planned: 44, completed: 41, teamSize: 8, avgVelocity: 37.3, sprintDays: 14 },
    { sprint: 'Sprint 7', planned: 46, completed: 44, teamSize: 8, avgVelocity: 38.3, sprintDays: 14 },
    { sprint: 'Sprint 8', planned: 48, completed: 45, teamSize: 9, avgVelocity: 39.0, sprintDays: 14 }
  ]
}) => {
  const totalSprints = data.length;
  const avgVelocity = data.reduce((sum, sprint) => sum + sprint.completed, 0) / totalSprints;
  const lastSprintVelocity = data[data.length - 1]?.completed || 0;
  const previousSprintVelocity = data[data.length - 2]?.completed || 0;
  const velocityTrend = lastSprintVelocity - previousSprintVelocity;
  const avgCommitmentAccuracy = data.reduce((sum, sprint) => sum + (sprint.completed / sprint.planned), 0) / totalSprints;
  
  // Calculate velocity per team member
  const dataWithVelocityPerMember = data.map(sprint => ({
    ...sprint,
    velocityPerMember: sprint.completed / sprint.teamSize
  }));

  const predictedNextSprintVelocity = Math.round(avgVelocity + (velocityTrend * 0.3));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sprintData = data.find(d => d.sprint === label);
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p style={{ color: '#3b82f6' }}>Planned: {payload.find((p: any) => p.dataKey === 'planned')?.value} points</p>
            <p style={{ color: '#10b981' }}>Completed: {payload.find((p: any) => p.dataKey === 'completed')?.value} points</p>
            {sprintData && (
              <>
                <p className="text-muted-foreground">Team Size: {sprintData.teamSize} members</p>
                <p className="text-muted-foreground">Velocity/Member: {(sprintData.completed / sprintData.teamSize).toFixed(1)} points</p>
                <p className="text-muted-foreground">Commitment: {((sprintData.completed / sprintData.planned) * 100).toFixed(1)}%</p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Team Velocity Report</span>
            </CardTitle>
            <CardDescription>Track team performance and sprint commitment accuracy over time</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Target className="w-3 h-3" />
              <span>{totalSprints} Sprints</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-semibold text-blue-600">{avgVelocity.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg Velocity</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-semibold text-green-600">{lastSprintVelocity}</div>
            <div className="text-sm text-muted-foreground">Last Sprint</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-semibold text-purple-600">{(avgCommitmentAccuracy * 100).toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Commitment Accuracy</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-semibold text-orange-600">
              {velocityTrend > 0 ? '+' : ''}{velocityTrend}
            </div>
            <div className="text-sm text-muted-foreground">Trend</div>
          </div>
        </div>

        {/* Velocity Trend */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Velocity Trend</span>
            <div className="flex items-center space-x-2">
              {velocityTrend > 0 ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Improving</span>
                </div>
              ) : velocityTrend < 0 ? (
                <div className="flex items-center space-x-1 text-red-600">
                  <TrendingDown className="w-4 h-4" />
                  <span>Declining</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-blue-600">
                  <Target className="w-4 h-4" />
                  <span>Stable</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Velocity Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="sprint" 
                stroke="#666"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
                stroke="#666"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Planned vs Completed Bars */}
              <Bar 
                dataKey="planned" 
                fill="#93c5fd" 
                name="Planned"
                opacity={0.7}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="completed" 
                fill="#3b82f6" 
                name="Completed"
                radius={[2, 2, 0, 0]}
              />
              
              {/* Average velocity line */}
              <Line 
                type="monotone" 
                dataKey="avgVelocity" 
                stroke="#10b981" 
                strokeWidth={2} 
                strokeDasharray="8 4"
                dot={false}
                name="Running Average"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Velocity per Team Member */}
        <div>
          <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Velocity per Team Member</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataWithVelocityPerMember} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="sprint" 
                  stroke="#666"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  label={{ value: 'Points per Member', angle: -90, position: 'insideLeft' }}
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(1)} points`, 'Velocity per Member']}
                  labelFormatter={(label) => `${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="velocityPerMember" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis and Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-light rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Performance Analysis</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Team velocity has {velocityTrend > 0 ? 'improved' : velocityTrend < 0 ? 'declined' : 'remained stable'} by {Math.abs(velocityTrend)} points since last sprint.
              </p>
              <p>
                Average commitment accuracy of {(avgCommitmentAccuracy * 100).toFixed(0)}% indicates {avgCommitmentAccuracy > 0.9 ? 'excellent' : avgCommitmentAccuracy > 0.8 ? 'good' : 'needs improvement'} sprint planning.
              </p>
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                <strong>Predicted next sprint velocity:</strong> {predictedNextSprintVelocity} points
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-light rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="font-medium text-sm">Recommendations</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {avgCommitmentAccuracy < 0.8 && (
                <li>• Improve sprint planning to increase commitment accuracy</li>
              )}
              {velocityTrend < -2 && (
                <li>• Investigate factors causing velocity decline</li>
              )}
              {dataWithVelocityPerMember[dataWithVelocityPerMember.length - 1]?.velocityPerMember < 5 && (
                <li>• Consider team training or process improvements</li>
              )}
              <li>• Use {avgVelocity.toFixed(0)} points as baseline for future sprint planning</li>
              <li>• Monitor team capacity and adjust commitments accordingly</li>
            </ul>
          </div>
        </div>

        {/* Sprint Planning Helper */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="font-medium text-sm text-green-900">Sprint Planning Insights</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-green-800 font-medium">Recommended Capacity</div>
              <div className="text-green-700">{Math.round(avgVelocity * 0.9)}-{Math.round(avgVelocity * 1.1)} points</div>
            </div>
            <div>
              <div className="text-green-800 font-medium">Team Efficiency</div>
              <div className="text-green-700">
                {(dataWithVelocityPerMember[dataWithVelocityPerMember.length - 1]?.velocityPerMember || 0).toFixed(1)} points/member
              </div>
            </div>
            <div>
              <div className="text-green-800 font-medium">Predictability</div>
              <div className="text-green-700">
                {avgCommitmentAccuracy > 0.9 ? 'High' : avgCommitmentAccuracy > 0.8 ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>
        </div>

        {/* Warning for declining velocity */}
        {velocityTrend < -3 && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-sm text-red-900">Velocity Alert</span>
            </div>
            <p className="text-sm text-red-800 mb-2">
              Team velocity has declined significantly. Consider the following actions:
            </p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Review and address team blockers or impediments</li>
              <li>• Assess if the team is overcommitted or scope is too ambitious</li>
              <li>• Check for team member availability or skill gaps</li>
              <li>• Consider technical debt or infrastructure issues</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VelocityChart;