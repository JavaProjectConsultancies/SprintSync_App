import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { 
  Plus, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Trash2, 
  Edit, 
  RefreshCw,
  GitBranch,
  MessageSquare,
  Cloud,
  FileText,
  Calendar,
  Users,
  Database,
  Zap,
  Shield,
  Globe,
  Link
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'version-control' | 'communication' | 'storage' | 'documentation' | 'calendar' | 'analytics' | 'deployment' | 'monitoring';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: React.ComponentType<any>;
  color: string;
  isEnabled: boolean;
  lastSync?: string;
  syncStatus?: 'success' | 'error' | 'syncing';
  features: string[];
  config?: Record<string, any>;
  usage?: {
    requests: number;
    limit: number;
    period: string;
  };
}

const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Mock integrations data
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect your GitHub repositories to automatically link commits and pull requests to tasks',
      category: 'version-control',
      status: 'connected',
      icon: GitBranch,
      color: 'text-gray-900',
      isEnabled: true,
      lastSync: '2024-02-15T10:30:00Z',
      syncStatus: 'success',
      features: ['Commit linking', 'PR tracking', 'Branch management', 'Issue sync'],
      config: {
        repository: 'company/ecommerce-platform',
        webhook_url: 'https://api.sprintsync.com/webhooks/github',
        auto_link_commits: true,
        sync_issues: true
      },
      usage: {
        requests: 2847,
        limit: 5000,
        period: 'monthly'
      }
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get real-time project notifications and updates in your Slack channels',
      category: 'communication',
      status: 'connected',
      icon: MessageSquare,
      color: 'text-purple-600',
      isEnabled: true,
      lastSync: '2024-02-15T09:45:00Z',
      syncStatus: 'success',
      features: ['Task notifications', 'Sprint updates', 'Mention alerts', 'Status reports'],
      config: {
        workspace: 'company-workspace',
        channel: '#development',
        notify_on_task_complete: true,
        notify_on_sprint_end: true,
        daily_standup_reminder: true
      },
      usage: {
        requests: 1203,
        limit: 10000,
        period: 'monthly'
      }
    },
    {
      id: 'gdrive',
      name: 'Google Drive',
      description: 'Store and share project documents, specifications, and design files',
      category: 'storage',
      status: 'connected',
      icon: Cloud,
      color: 'text-blue-500',
      isEnabled: false,
      lastSync: '2024-02-14T16:20:00Z',
      syncStatus: 'error',
      features: ['Document storage', 'File sharing', 'Version control', 'Collaborative editing'],
      config: {
        folder_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        auto_create_folders: true,
        sync_project_docs: true
      },
      usage: {
        requests: 456,
        limit: 1000,
        period: 'daily'
      }
    },
    {
      id: 'confluence',
      name: 'Confluence',
      description: 'Sync project documentation and maintain knowledge base',
      category: 'documentation',
      status: 'disconnected',
      icon: FileText,
      color: 'text-blue-700',
      isEnabled: false,
      features: ['Documentation sync', 'Knowledge base integration', 'Page templates', 'Team wikis'],
      config: {}
    },
    {
      id: 'gcalendar',
      name: 'Google Calendar',
      description: 'Sync sprint dates, deadlines, and team meetings with your calendar',
      category: 'calendar',
      status: 'pending',
      icon: Calendar,
      color: 'text-green-600',
      isEnabled: false,
      features: ['Event sync', 'Deadline reminders', 'Meeting scheduling', 'Team availability'],
      config: {}
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Collaborate with your team and get project updates in Microsoft Teams',
      category: 'communication',
      status: 'disconnected',
      icon: Users,
      color: 'text-indigo-600',
      isEnabled: false,
      features: ['Team chat', 'Video meetings', 'File sharing', 'Notification bot'],
      config: {}
    },
    {
      id: 'datadog',
      name: 'Datadog',
      description: 'Monitor application performance and track deployment metrics',
      category: 'monitoring',
      status: 'disconnected',
      icon: Database,
      color: 'text-purple-700',
      isEnabled: false,
      features: ['Performance monitoring', 'Error tracking', 'Custom metrics', 'Alerting'],
      config: {}
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Create custom workflows and automate repetitive tasks',
      category: 'analytics',
      status: 'disconnected',
      icon: Zap,
      color: 'text-orange-500',
      isEnabled: false,
      features: ['Workflow automation', 'Custom triggers', 'Multi-app integration', 'Data sync'],
      config: {}
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Integrations', icon: Globe },
    { id: 'version-control', name: 'Version Control', icon: GitBranch },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'storage', name: 'Storage', icon: Cloud },
    { id: 'documentation', name: 'Documentation', icon: FileText },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'monitoring', name: 'Monitoring', icon: Shield },
    { id: 'analytics', name: 'Analytics', icon: Zap }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle2;
      case 'error': return AlertCircle;
      case 'pending': return RefreshCw;
      default: return null;
    }
  };

  const getSyncStatusColor = (syncStatus?: string) => {
    switch (syncStatus) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'syncing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = activeTab === 'all' || integration.category === activeTab;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { ...integration, isEnabled: !integration.isEnabled }
        : integration
    ));
  };

  const connectIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { 
            ...integration, 
            status: 'connected' as const,
            lastSync: new Date().toISOString(),
            syncStatus: 'success' as const
          }
        : integration
    ));
  };

  const disconnectIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { 
            ...integration, 
            status: 'disconnected' as const,
            isEnabled: false,
            lastSync: undefined,
            syncStatus: undefined
          }
        : integration
    ));
  };

  const openConfigModal = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsConfigModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-muted-foreground">Connect SprintSync with your favorite tools and services</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {integrations.filter(i => i.status === 'connected').length} connected
          </Badge>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-600">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
            <div className="text-sm text-muted-foreground">Connected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-blue-600">
              {integrations.filter(i => i.isEnabled).length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-1">
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline text-xs">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map(integration => {
              const Icon = integration.icon;
              const StatusIcon = getStatusIcon(integration.status);
              
              return (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gray-100 ${integration.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className={getStatusColor(integration.status)}>
                              {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                              {integration.status}
                            </Badge>
                            {integration.status === 'connected' && (
                              <Switch
                                checked={integration.isEnabled}
                                onCheckedChange={() => toggleIntegration(integration.id)}
                                className="scale-75"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div>
                      <Label className="text-xs text-muted-foreground">Features</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {integration.features.slice(0, 3).map(feature => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{integration.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Last Sync */}
                    {integration.lastSync && (
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Last sync:</span>
                          <span className={getSyncStatusColor(integration.syncStatus)}>
                            {formatDate(integration.lastSync)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Usage */}
                    {integration.usage && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">API Usage</span>
                          <span>{integration.usage.requests}/{integration.usage.limit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${(integration.usage.requests / integration.usage.limit) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => openConfigModal(integration)}>
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => disconnectIntegration(integration.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => connectIntegration(integration.id)}
                          className="bg-gradient-primary text-white w-full"
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredIntegrations.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground space-y-2">
                  <Link className="w-12 h-12 mx-auto opacity-50" />
                  <p>No integrations found</p>
                  <p className="text-sm">Try adjusting your search or browse different categories</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Configuration Modal */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedIntegration && (
                <>
                  <selectedIntegration.icon className={`w-5 h-5 ${selectedIntegration.color}`} />
                  <span>Configure {selectedIntegration.name}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Customize your integration settings and preferences
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-6 py-4">
              {/* General Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">General Settings</h4>
                
                {selectedIntegration.id === 'github' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Repository</Label>
                      <Input 
                        value={selectedIntegration.config?.repository || ''} 
                        placeholder="owner/repository-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input 
                        value={selectedIntegration.config?.webhook_url || ''} 
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={selectedIntegration.config?.auto_link_commits || false}
                      />
                      <Label>Automatically link commits to tasks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={selectedIntegration.config?.sync_issues || false}
                      />
                      <Label>Sync GitHub issues with tasks</Label>
                    </div>
                  </div>
                )}

                {selectedIntegration.id === 'slack' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Workspace</Label>
                      <Input 
                        value={selectedIntegration.config?.workspace || ''} 
                        placeholder="your-workspace"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Default Channel</Label>
                      <Input 
                        value={selectedIntegration.config?.channel || ''} 
                        placeholder="#general"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Notification Settings</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={selectedIntegration.config?.notify_on_task_complete || false}
                          />
                          <Label>Notify when tasks are completed</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={selectedIntegration.config?.notify_on_sprint_end || false}
                          />
                          <Label>Notify when sprints end</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={selectedIntegration.config?.daily_standup_reminder || false}
                          />
                          <Label>Daily standup reminders</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedIntegration.id === 'gdrive' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Folder ID</Label>
                      <Input 
                        value={selectedIntegration.config?.folder_id || ''} 
                        placeholder="Google Drive folder ID"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={selectedIntegration.config?.auto_create_folders || false}
                      />
                      <Label>Auto-create project folders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={selectedIntegration.config?.sync_project_docs || false}
                      />
                      <Label>Sync project documents</Label>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Usage Stats */}
              {selectedIntegration.usage && (
                <div className="space-y-2">
                  <h4 className="font-medium">Usage Statistics</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Requests</div>
                      <div className="font-medium">{selectedIntegration.usage.requests.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Limit</div>
                      <div className="font-medium">{selectedIntegration.usage.limit.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Period</div>
                      <div className="font-medium">{selectedIntegration.usage.period}</div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Danger Zone</h4>
                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-red-900">Disconnect Integration</div>
                      <div className="text-xs text-red-700">This will remove all configuration and stop syncing</div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        disconnectIntegration(selectedIntegration.id);
                        setIsConfigModalOpen(false);
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsPage;