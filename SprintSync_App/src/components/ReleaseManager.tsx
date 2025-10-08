import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Plus,
  Rocket,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  Users,
  Flag,
  Code,
  TestTube,
  Shield,
  BarChart3,
  GitBranch,
  Package
} from 'lucide-react';
import { Release, ReleaseStatus } from '../types';

interface ReleaseManagerProps {
  releases: Release[];
  onAddRelease: (release: Omit<Release, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateRelease: (release: Release) => void;
  onDeleteRelease: (releaseId: string) => void;
  projectId: string;
  currentUserId: string;
}

const ReleaseManager: React.FC<ReleaseManagerProps> = ({
  releases,
  onAddRelease,
  onUpdateRelease,
  onDeleteRelease,
  projectId,
  currentUserId
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReleaseStatus | 'all'>('all');

  // Filter releases based on status
  const filteredReleases = releases.filter(release => {
    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;
    return matchesStatus;
  });

  // Get status icon
  const getStatusIcon = (status: ReleaseStatus) => {
    switch (status) {
      case 'planning': return <Target className="w-4 h-4" />;
      case 'development': return <Code className="w-4 h-4" />;
      case 'testing': return <TestTube className="w-4 h-4" />;
      case 'staging': return <Shield className="w-4 h-4" />;
      case 'ready-for-release': return <CheckCircle2 className="w-4 h-4" />;
      case 'released': return <Rocket className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Calculate release statistics
  const releaseStats = {
    total: releases.length,
    inProgress: releases.filter(r => ['planning', 'development', 'testing', 'staging'].includes(r.status)).length,
    released: releases.filter(r => r.status === 'released').length,
    readyForRelease: releases.filter(r => r.status === 'ready-for-release').length
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-purple-600" />
                <span>Release Management</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage product releases and deployment cycles
              </p>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Release
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{releaseStats.total}</div>
              <div className="text-sm text-gray-600">Total Releases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{releaseStats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{releaseStats.released}</div>
              <div className="text-sm text-gray-600">Released</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{releaseStats.readyForRelease}</div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Label>Filter by Status:</Label>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="ready-for-release">Ready for Release</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Release Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReleases.map((release) => (
          <Card key={release.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-2">{release.name}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {release.version}
                    </Badge>
                    <Badge variant="outline" className={`${getReleaseStatusColor(release.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(release.status)}
                        <span>{release.status.replace('-', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">{release.description}</p>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{release.progress}%</span>
                </div>
                <Progress 
                  value={release.progress} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{release.linkedStories?.length || 0} stories</span>
                  <span>{release.linkedEpics?.length || 0} epics</span>
                  <span>{release.linkedSprints?.length || 0} sprints</span>
                </div>
              </div>

              {/* Quality Gates */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Quality Gates</Label>
                <div className="space-y-1">
                  {release.qualityGates.slice(0, 3).map((gate) => (
                    <div key={gate.id} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">{gate.name}</span>
                      <Badge 
                        variant="outline" 
                        className={`ml-2 ${getQualityGateStatusColor(gate.status)}`}
                      >
                        {gate.status}
                      </Badge>
                    </div>
                  ))}
                  {release.qualityGates.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{release.qualityGates.length - 3} more gates
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(release.targetDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{release.createdBy}</span>
                </div>
              </div>

              {/* Risks */}
              {release.risks.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Risks</Label>
                  <div className="flex flex-wrap gap-1">
                    {release.risks.slice(0, 2).map((risk, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700">
                        {risk}
                      </Badge>
                    ))}
                    {release.risks.length > 2 && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                        +{release.risks.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReleases.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No releases found</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter !== 'all'
                ? 'Try adjusting your filters to see more releases.'
                : 'Create your first release to start managing product deployments.'
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Release
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Release Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Release</DialogTitle>
            <DialogDescription>
              Create a new release to organize and track product deployments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Release Name *</Label>
                <Input id="name" placeholder="e.g., Mobile-First Experience" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version *</Label>
                <Input id="version" placeholder="e.g., v2.0.0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the release objectives..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="ready-for-release">Ready for Release</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Pick a date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>
              Create Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReleaseManager;
