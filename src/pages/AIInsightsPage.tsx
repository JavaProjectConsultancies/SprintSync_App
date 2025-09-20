import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Brain, 
  Sparkles, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Users,
  Calendar,
  Zap,
  Lightbulb,
  BarChart3,
  RefreshCw,
  Bell
} from 'lucide-react';

const AIInsightsPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const insights = [
    {
      id: 1,
      type: 'risk_alert',
      priority: 'high',
      title: 'Sprint Velocity Decline Detected',
      description: 'Team velocity has decreased by 23% compared to last sprint. Consider reviewing sprint capacity and task complexity.',
      impact: 'Project E-Commerce Platform may be delayed by 3-5 days',
      recommendation: 'Redistribute tasks or extend sprint timeline',
      confidence: 87,
      timestamp: '2 hours ago',
      category: 'Performance'
    },
    {
      id: 2,
      type: 'opportunity',
      priority: 'medium',
      title: 'Resource Optimization Opportunity',
      description: 'Arjun Patel has 15% spare capacity this sprint while Sneha Reddy is at 105% utilization.',
      impact: 'Better workload distribution could improve delivery by 2 days',
      recommendation: 'Reassign 2 medium complexity tasks from Sneha to Arjun',
      confidence: 94,
      timestamp: '4 hours ago',
      category: 'Resource Management'
    },
    {
      id: 3,
      type: 'prediction',
      priority: 'low',
      title: 'Quality Trend Analysis',
      description: 'Bug discovery rate is 40% lower than historical average, indicating improved code quality.',
      impact: 'Reduced testing phase duration by estimated 1.5 days',
      recommendation: 'Maintain current code review practices',
      confidence: 76,
      timestamp: '6 hours ago',
      category: 'Quality'
    },
    {
      id: 4,
      type: 'burndown_alert',
      priority: 'high',
      title: 'Burndown Chart Anomaly',
      description: 'Current sprint burndown indicates potential scope creep. Story points increased by 18% mid-sprint.',
      impact: 'Sprint goal achievement at risk (42% probability)',
      recommendation: 'Review and prioritize remaining stories, consider moving non-critical items to backlog',
      confidence: 91,
      timestamp: '8 hours ago',
      category: 'Sprint Management'
    }
  ];

  const predictions = [
    {
      title: 'Sprint 16 Completion',
      prediction: '94% likely to complete on time',
      confidence: 94,
      trend: 'up',
      details: 'Based on current velocity and remaining work'
    },
    {
      title: 'Project Delivery',
      prediction: '2-3 days delay expected',
      confidence: 78,
      trend: 'down',
      details: 'Current trend suggests minor delay in final delivery'
    },
    {
      title: 'Team Burnout Risk',
      prediction: 'Low risk detected',
      confidence: 85,
      trend: 'neutral',
      details: 'Current utilization levels are sustainable'
    },
    {
      title: 'Budget Utilization',
      prediction: '12% under budget',
      confidence: 89,
      trend: 'up',
      details: 'Efficient resource allocation and reduced overhead'
    }
  ];

  const recommendations = [
    {
      id: 1,
      category: 'Sprint Planning',
      title: 'Optimize Story Point Distribution',
      description: 'Current sprint has uneven story point distribution. Consider breaking down large stories.',
      impact: 'Medium',
      effort: 'Low',
      aiConfidence: 92
    },
    {
      id: 2,
      category: 'Team Management',
      title: 'Pair Programming Session',
      description: 'Arjun and Sneha would benefit from pair programming on complex authentication module.',
      impact: 'High',
      effort: 'Medium',
      aiConfidence: 87
    },
    {
      id: 3,
      category: 'Process Improvement',
      title: 'Daily Standup Optimization',
      description: 'Standups are averaging 18 minutes. Focus on blockers and progress only.',
      impact: 'Low',
      effort: 'Low',
      aiConfidence: 74
    },
    {
      id: 4,
      category: 'Risk Mitigation',
      title: 'Backup Developer Assignment',
      description: 'Payment integration has single point of failure. Assign backup developer.',
      impact: 'High',
      effort: 'High',
      aiConfidence: 96
    }
  ];

  const getInsightColor = (type: string, priority: string) => {
    if (type === 'risk_alert' || priority === 'high') return 'bg-red-100 text-red-800 border-red-200';
    if (type === 'opportunity' || priority === 'medium') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type === 'prediction' || priority === 'low') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk_alert': return AlertTriangle;
      case 'opportunity': return Lightbulb;
      case 'prediction': return TrendingUp;
      case 'burndown_alert': return BarChart3;
      default: return Brain;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const generateInsights = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-foreground">AI Insights</h1>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 animate-sparkle">
              <Sparkles className="w-3 h-3 mr-1" />
              NEW
            </Badge>
          </div>
          <p className="text-muted-foreground">AI-powered project intelligence and recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={generateInsights}
            disabled={isGenerating}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Analyzing...' : 'Refresh Insights'}
          </Button>
          <Button className="bg-gradient-primary border-0 text-white hover:opacity-90">
            <Bell className="w-4 h-4 mr-2" />
            Setup Alerts
          </Button>
        </div>
      </div>

      {/* AI Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-light border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Insights</p>
                <p className="text-2xl font-semibold text-green-700">{insights.length}</p>
              </div>
              <Brain className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predictions</p>
                <p className="text-2xl font-semibold">{predictions.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-semibold">87%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Alerts</p>
                <p className="text-2xl font-semibold text-red-600">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Current Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4 mt-6">
          <div className="space-y-4">
            {insights.map((insight) => {
              const IconComponent = getInsightIcon(insight.type);
              return (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getInsightColor(insight.type, insight.priority)} bg-opacity-20`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{insight.title}</h3>
                              <Badge variant="outline" className={getInsightColor(insight.type, insight.priority)}>
                                {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {insight.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-xs text-muted-foreground">{insight.timestamp}</div>
                          <div className="flex items-center space-x-1">
                            <div className="text-xs text-muted-foreground">Confidence:</div>
                            <div className="text-xs font-medium">{insight.confidence}%</div>
                          </div>
                        </div>
                      </div>

                      {/* Impact & Recommendation */}
                      <div className="pl-14 space-y-3">
                        <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                          <p className="text-sm font-medium text-orange-900">Impact</p>
                          <p className="text-sm text-orange-800">{insight.impact}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm font-medium text-blue-900">AI Recommendation</p>
                          <p className="text-sm text-blue-800">{insight.recommendation}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pl-14 flex items-center space-x-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Take Action
                        </Button>
                        <Button size="sm" variant="outline">
                          Dismiss
                        </Button>
                        <Button size="sm" variant="ghost">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>{prediction.title}</span>
                    {getTrendIcon(prediction.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-green-700">{prediction.prediction}</p>
                    <p className="text-sm text-muted-foreground">{prediction.details}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Confidence</span>
                      <span className="font-medium">{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                  </div>
                  
                  <div className="pt-2">
                    <Button size="sm" variant="outline" className="w-full">
                      View Detailed Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4 mt-6">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          <h3 className="font-semibold">{rec.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground pl-7">{rec.description}</p>
                      </div>

                      <div className="flex items-center space-x-6 pl-7">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Impact:</span>
                          <Badge variant="outline" className={getImpactColor(rec.impact)}>
                            {rec.impact}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Effort:</span>
                          <Badge variant="outline" className={getImpactColor(rec.effort)}>
                            {rec.effort}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">AI Confidence:</span>
                          <span className="text-sm font-medium">{rec.aiConfidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" className="bg-gradient-primary border-0 text-white hover:opacity-90">
                        Apply
                      </Button>
                      <Button size="sm" variant="outline">
                        Later
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsightsPage;