import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { TrendingDown, TrendingUp, Target, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BurndownData {
  day: number;
  date: string;
  remainingStoryPoints: number;
  idealRemaining: number;
  workRemainingPerDay?: number;
}

interface BurndownChartProps {
  sprintName?: string;
  sprintGoal?: string;
  startDate?: string;
  endDate?: string;
  // Burndown Velocity Parameters
  sprintLengthDays?: number; // Sprint Length (Duration) - in Days
  storyPointsCommitted?: number; // Story Points (Or Hours) Committed (Total Planned efforts for sprint)
  storyPointsCompleted?: number; // Story Points (Or Hours) Completed (Actual Completed Work)
  teamCapacity?: number; // Team Capacity (Available efforts from capacity planning)
  workRemainingPerDay?: number[]; // Work Remaining per Day (Sum of remaining points per day)
  numberOfSprints?: number; // Number of Sprints (Total completed sprints for average velocity)
  data?: BurndownData[];
  useHours?: boolean; // Flag to use Hours instead of Story Points
}

const BurndownChart: React.FC<BurndownChartProps> = ({
  sprintName = "Sprint 3",
  sprintGoal = "Complete user authentication system and payment integration",
  startDate = "2024-02-05",
  endDate = "2024-02-19",
  sprintLengthDays,
  storyPointsCommitted = 40,
  storyPointsCompleted = 28,
  teamCapacity,
  workRemainingPerDay = [],
  numberOfSprints,
  data,
  useHours = false
}) => {
  // Calculate sprint length if not provided
  const calculatedSprintLength = sprintLengthDays || Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate remaining story points
  const remainingStoryPoints = storyPointsCommitted - storyPointsCompleted;
  
  // Calculate current date and day
  const currentDate = new Date().toISOString().split('T')[0];
  const start = new Date(startDate);
  const current = new Date();
  const currentDay = Math.max(0, Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, calculatedSprintLength - currentDay);
  
  // Generate burndown data if not provided
  const burndownData: BurndownData[] = data || (() => {
    const dataPoints: BurndownData[] = [];
    const idealBurnRate = storyPointsCommitted / calculatedSprintLength;
    
    for (let day = 0; day <= calculatedSprintLength; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      const idealRemaining = Math.max(0, storyPointsCommitted - (day * idealBurnRate));
      
      // Use workRemainingPerDay if provided, otherwise calculate based on completion
      let actualRemaining = storyPointsCommitted;
      if (day === 0) {
        actualRemaining = storyPointsCommitted;
      } else if (day <= currentDay) {
        // For past days, calculate based on completion rate
        const completionRate = storyPointsCompleted / Math.max(1, currentDay);
        actualRemaining = Math.max(0, storyPointsCommitted - (day * completionRate));
      } else {
        // For future days, use remaining points
        actualRemaining = remainingStoryPoints;
      }
      
      // If workRemainingPerDay is provided, use it
      if (workRemainingPerDay.length > day) {
        actualRemaining = workRemainingPerDay[day];
      }
      
      dataPoints.push({
        day,
        date: date.toISOString().split('T')[0],
        remainingStoryPoints: actualRemaining,
        idealRemaining,
        workRemainingPerDay: workRemainingPerDay[day] || undefined
      });
    }
    return dataPoints;
  })();
  
  // Calculate velocity metrics
  const averageVelocity = numberOfSprints && numberOfSprints > 0 
    ? storyPointsCompleted / numberOfSprints 
    : storyPointsCompleted / Math.max(1, currentDay);
  
  const currentRemaining = burndownData.find(d => d.day === currentDay)?.remainingStoryPoints || remainingStoryPoints;
  const currentIdeal = burndownData.find(d => d.day === currentDay)?.idealRemaining || (storyPointsCommitted - (currentDay * (storyPointsCommitted / calculatedSprintLength)));
  
  const isAheadOfSchedule = currentRemaining < currentIdeal;
  const variance = Math.abs(currentRemaining - currentIdeal);
  
  const sprintProgress = (storyPointsCompleted / storyPointsCommitted) * 100;
  const unitLabel = useHours ? 'Hours' : 'Story Points';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDay = (day: number) => {
    return `Day ${day}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = burndownData.find(d => d.date === label || d.day === parseInt(label));
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-2">
            {dataPoint ? `Day ${dataPoint.day}` : formatDate(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)} {unitLabel.toLowerCase()}
            </p>
          ))}
          {dataPoint && (
            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
              <p>Ideal: {dataPoint.idealRemaining.toFixed(1)} {unitLabel.toLowerCase()}</p>
              <p>Actual: {dataPoint.remainingStoryPoints.toFixed(1)} {unitLabel.toLowerCase()}</p>
            </div>
          )}
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
              <span>Burndown Velocity Chart</span>
            </CardTitle>
            <CardDescription>
              {sprintName} • {sprintGoal}
              {numberOfSprints && numberOfSprints > 0 && (
                <span className="ml-2">• Avg Velocity: {averageVelocity.toFixed(1)} {unitLabel.toLowerCase()}/sprint</span>
              )}
            </CardDescription>
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
        {/* Burndown Velocity Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-2xl font-semibold text-blue-600">{calculatedSprintLength}</div>
            <div className="text-xs text-muted-foreground">Sprint Length (Days)</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-2xl font-semibold text-purple-600">{storyPointsCommitted}</div>
            <div className="text-xs text-muted-foreground">{unitLabel} Committed</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-2xl font-semibold text-green-600">{storyPointsCompleted}</div>
            <div className="text-xs text-muted-foreground">{unitLabel} Completed</div>
          </div>
          {teamCapacity !== undefined && (
            <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="text-2xl font-semibold text-indigo-600">{teamCapacity}</div>
              <div className="text-xs text-muted-foreground">Team Capacity</div>
            </div>
          )}
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-2xl font-semibold text-orange-600">{remainingStoryPoints.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Remaining {unitLabel}</div>
          </div>
          {numberOfSprints !== undefined && numberOfSprints > 0 && (
            <div className="text-center p-3 bg-cyan-50 rounded-lg border border-cyan-100">
              <div className="text-2xl font-semibold text-cyan-600">{numberOfSprints}</div>
              <div className="text-xs text-muted-foreground">Completed Sprints</div>
            </div>
          )}
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

        {/* Burndown Velocity Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={burndownData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                tickFormatter={formatDay}
                label={{ value: 'Sprint Days', position: 'insideBottom', offset: -10 }}
                stroke="#666"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                label={{ value: `Remaining ${unitLabel}`, angle: -90, position: 'insideLeft' }}
                stroke="#666"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Ideal burndown line */}
              <Line 
                type="linear" 
                dataKey="idealRemaining" 
                stroke="#10b981" 
                strokeWidth={2} 
                strokeDasharray="8 4"
                dot={false}
                name="Ideal Burndown"
              />
              
              {/* Actual burndown line */}
              <Line 
                type="monotone" 
                dataKey="remainingStoryPoints" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
                name="Actual Burndown"
              />
              
              {/* Current day line */}
              <ReferenceLine 
                x={currentDay} 
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
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Current velocity: {((storyPointsCompleted / Math.max(1, currentDay)) || 0).toFixed(1)} {unitLabel.toLowerCase()}/day</div>
              {numberOfSprints && numberOfSprints > 0 && (
                <div>Average velocity: {averageVelocity.toFixed(1)} {unitLabel.toLowerCase()}/sprint</div>
              )}
            </div>
          </div>

          <div className="p-4 bg-gradient-light rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Forecast</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {remainingDays > 0 
                ? `At current pace, ${Math.round(remainingStoryPoints / ((storyPointsCompleted / Math.max(1, currentDay)) || 1))} more days needed to complete remaining work.`
                : "Sprint has ended. Review completed work and plan next sprint."
              }
            </p>
            <div className="text-xs text-muted-foreground">
              Projected completion: {sprintProgress >= 100 ? 'Completed' : `${Math.round(sprintProgress + ((storyPointsCompleted / Math.max(1, currentDay)) * remainingDays / storyPointsCommitted) * 100)}%`}
            </div>
            {teamCapacity && (
              <div className="text-xs text-muted-foreground mt-1">
                Team capacity utilization: {((storyPointsCompleted / teamCapacity) * 100).toFixed(1)}%
              </div>
            )}
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