import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp, Target, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
  remaining: number;
  completed: number;
}

interface BurndownChartProps {
  sprintName?: string;
  sprintGoal?: string;
  startDate?: string;
  endDate?: string;
  totalStoryPoints?: number;
  completedStoryPoints?: number;
  data?: BurndownData[];
}

const BurndownChart: React.FC<BurndownChartProps> = ({
  sprintName = "Sprint 3",
  sprintGoal = "Complete user authentication system and payment integration",
  startDate = "2024-02-05",
  endDate = "2024-02-19",
  totalStoryPoints = 40,
  completedStoryPoints = 28,
  data = [
    { date: '2024-02-05', ideal: 40, actual: 40, remaining: 40, completed: 0 },
    { date: '2024-02-06', ideal: 37, actual: 40, remaining: 40, completed: 0 },
    { date: '2024-02-07', ideal: 34, actual: 38, remaining: 38, completed: 2 },
    { date: '2024-02-08', ideal: 31, actual: 35, remaining: 35, completed: 5 },
    { date: '2024-02-09', ideal: 28, actual: 30, remaining: 30, completed: 10 },
    { date: '2024-02-10', ideal: 25, actual: 30, remaining: 30, completed: 10 },
    { date: '2024-02-11', ideal: 22, actual: 30, remaining: 30, completed: 10 },
    { date: '2024-02-12', ideal: 19, actual: 25, remaining: 25, completed: 15 },
    { date: '2024-02-13', ideal: 16, actual: 20, remaining: 20, completed: 20 },
    { date: '2024-02-14', ideal: 13, actual: 15, remaining: 15, completed: 25 },
    { date: '2024-02-15', ideal: 10, actual: 12, remaining: 12, completed: 28 },
    { date: '2024-02-16', ideal: 7, actual: 12, remaining: 12, completed: 28 },
    { date: '2024-02-17', ideal: 4, actual: 12, remaining: 12, completed: 28 },
    { date: '2024-02-18', ideal: 1, actual: 12, remaining: 12, completed: 28 },
    { date: '2024-02-19', ideal: 0, actual: 12, remaining: 12, completed: 28 }
  ]
}) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const sprintProgress = (completedStoryPoints / totalStoryPoints) * 100;
  const remainingDays = Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - remainingDays;
  
  const currentActual = data.find(d => d.date === currentDate)?.actual || data[data.length - 1]?.actual || 0;
  const currentIdeal = data.find(d => d.date === currentDate)?.ideal || data[data.length - 1]?.ideal || 0;
  
  const isAheadOfSchedule = currentActual < currentIdeal;
  const variance = Math.abs(currentActual - currentIdeal);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} points
            </p>
          ))}
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
              <TrendingDown className="w-5 h-5 text-blue-600" />
              <span>Sprint Burndown Chart</span>
            </CardTitle>
            <CardDescription>{sprintName} • {sprintGoal}</CardDescription>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sprint Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-semibold text-blue-600">{totalStoryPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-semibold text-green-600">{completedStoryPoints}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-semibold text-orange-600">{totalStoryPoints - completedStoryPoints}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-semibold text-purple-600">{remainingDays}</div>
            <div className="text-sm text-muted-foreground">Days Left</div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Sprint Progress</span>
            <div className="flex items-center space-x-2">
              {isAheadOfSchedule ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Ahead by {variance} points</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <TrendingDown className="w-4 h-4" />
                  <span>Behind by {variance} points</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                sprintProgress >= 90 ? 'bg-green-500' : 
                sprintProgress >= 70 ? 'bg-blue-500' : 
                sprintProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(sprintProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium">{sprintProgress.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Burndown Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                stroke="#666"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
                stroke="#666"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Ideal burndown line */}
              <Line 
                type="linear" 
                dataKey="ideal" 
                stroke="#10b981" 
                strokeWidth={2} 
                strokeDasharray="8 4"
                dot={false}
                name="Ideal Burndown"
              />
              
              {/* Actual burndown line */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                name="Actual Burndown"
              />
              
              {/* Current date line */}
              <ReferenceLine 
                x={currentDate} 
                stroke="#ef4444" 
                strokeDasharray="4 4" 
                strokeWidth={2}
                label={{ value: "Today", position: "top" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Analysis and Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-light rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              {isAheadOfSchedule ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className="font-medium text-sm">Sprint Status</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {isAheadOfSchedule 
                ? "The team is performing well and is ahead of the ideal burndown rate."
                : "The team is behind schedule and may need to adjust scope or increase velocity."
              }
            </p>
            <div className="text-xs text-muted-foreground">
              Current velocity: {((completedStoryPoints / daysElapsed) || 0).toFixed(1)} points/day
            </div>
          </div>

          <div className="p-4 bg-gradient-light rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Forecast</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {remainingDays > 0 
                ? `At current pace, ${Math.round((totalStoryPoints - completedStoryPoints) / ((completedStoryPoints / daysElapsed) || 1))} more days needed to complete remaining work.`
                : "Sprint has ended. Review completed work and plan next sprint."
              }
            </p>
            <div className="text-xs text-muted-foreground">
              Projected completion: {sprintProgress >= 100 ? 'Completed' : `${Math.round(sprintProgress + ((completedStoryPoints / daysElapsed) * remainingDays / totalStoryPoints) * 100)}%`}
            </div>
          </div>
        </div>

        {/* Action Items */}
        {!isAheadOfSchedule && remainingDays > 0 && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-sm text-red-900">Recommended Actions</span>
            </div>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Review sprint scope and consider removing low-priority items</li>
              <li>• Identify and resolve blockers affecting team velocity</li>
              <li>• Consider adding more team members or extending work hours</li>
              <li>• Schedule daily standups to track progress more closely</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BurndownChart;