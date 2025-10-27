import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Filter, X, RefreshCw, Save, Settings, Eye, EyeOff, Layout } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { useFilters } from '../contexts/FilterContext';

// Import the interface from FilterContext to ensure consistency
import { DashboardFilters, DashboardComponentVisibility } from '../contexts/FilterContext';

interface DashboardFiltersProps {
  availableProjects: any[];
  availableUsers: any[];
  availableDepartments: any[];
  availableDomains: any[];
  availableTeams: any[];
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  availableProjects,
  availableUsers,
  availableDepartments,
  availableDomains,
  availableTeams
}) => {
  const { user, hasPermission } = useAuth();
  const { filters: contextFilters, updateFilter, updateComponentVisibility, resetFilters, resetComponentVisibility, saveFilters } = useFilters();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [showComponentVisibility, setShowComponentVisibility] = useState(false);

  // Ensure we have data to work with - add mock data if arrays are empty
  const mockProjects = [
    { id: 'project-1', name: 'Data Analytics Platform' },
    { id: 'project-2', name: 'E-commerce Platform' },
    { id: 'project-3', name: 'Mobile Banking App' },
    { id: 'project-4', name: 'Sprint Sync' }
  ];

  const mockUsers = [
    { id: 'user-1', name: 'John Doe' },
    { id: 'user-2', name: 'Jane Smith' },
    { id: 'user-3', name: 'Mike Johnson' },
    { id: 'user-4', name: 'Sarah Wilson' }
  ];

  const mockTeams = [
    { id: 'team-1', name: 'Development Team' },
    { id: 'team-2', name: 'QA Team' },
    { id: 'team-3', name: 'Design Team' },
    { id: 'team-4', name: 'DevOps Team' }
  ];

  const mockDepartments = [
    { id: 'dept-1', name: 'Engineering' },
    { id: 'dept-2', name: 'Product' },
    { id: 'dept-3', name: 'Design' },
    { id: 'dept-4', name: 'QA' }
  ];

  const mockDomains = [
    { id: 'domain-1', name: 'E-commerce' },
    { id: 'domain-2', name: 'Banking' },
    { id: 'domain-3', name: 'Healthcare' },
    { id: 'domain-4', name: 'Education' }
  ];

  // Use provided data or fall back to mock data
  const projects = availableProjects.length > 0 ? availableProjects : mockProjects;
  const users = availableUsers.length > 0 ? availableUsers : mockUsers;
  const teams = availableTeams.length > 0 ? availableTeams : mockTeams;
  const departments = availableDepartments.length > 0 ? availableDepartments : mockDepartments;
  const domains = availableDomains.length > 0 ? availableDomains : mockDomains;

  // Calculate active filter count
  useEffect(() => {
    let count = 0;
    if (contextFilters.projectIds.length > 0) count++;
    if (contextFilters.projectStatus.length > 0) count++;
    if (contextFilters.projectPriority.length > 0) count++;
    if (contextFilters.sprintIds.length > 0) count++;
    if (contextFilters.sprintStatus.length > 0) count++;
    if (contextFilters.taskStatus.length > 0) count++;
    if (contextFilters.taskPriority.length > 0) count++;
    if (contextFilters.assigneeIds.length > 0) count++;
    if (contextFilters.teamIds.length > 0) count++;
    if (contextFilters.departmentIds.length > 0) count++;
    if (contextFilters.domainIds.length > 0) count++;
    if (contextFilters.timeRange !== 'all') count++;
    if (contextFilters.dataSource !== 'all') count++;
    if (contextFilters.viewMode !== 'overview') count++;
    if (contextFilters.showOnlyMyProjects) count++;
    if (contextFilters.showOnlyMyTasks) count++;
    if (contextFilters.showOnlyActiveItems) count++;
    if (contextFilters.showOverdueItems) count++;
    
    setActiveFilterCount(count);
  }, [contextFilters]);

  const handleUpdateFilter = (key: keyof DashboardFilters, value: any) => {
    updateFilter(key, value);
  };

  const toggleArrayFilter = (key: keyof DashboardFilters, value: string) => {
    const currentArray = contextFilters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    handleUpdateFilter(key, newArray);
  };

  const resetFilter = (key: keyof DashboardFilters) => {
    const defaultValue = getDefaultFilterValue(key);
    handleUpdateFilter(key, defaultValue);
  };

  const getDefaultFilterValue = (key: keyof DashboardFilters): any => {
    const defaults: DashboardFilters = {
      projectIds: [],
      projectStatus: [],
      projectPriority: [],
      sprintIds: [],
      sprintStatus: [],
      sprintDateRange: { start: null, end: null },
      taskStatus: [],
      taskPriority: [],
      assigneeIds: [],
      dueDateRange: { start: null, end: null },
      teamIds: [],
      departmentIds: [],
      domainIds: [],
      timeRange: 'all',
      customDateRange: { start: null, end: null },
      dataSource: 'all',
      refreshInterval: 30000,
      viewMode: 'overview',
      chartType: 'bar',
      showOnlyMyProjects: false,
      showOnlyMyTasks: false,
      showOnlyActiveItems: false,
      showOverdueItems: false
    };
    return defaults[key];
  };

  const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      {children}
    </div>
  );

  const MultiSelectFilter: React.FC<{
    label: string;
    options: Array<{ value: string; label: string }>;
    selected: string[];
    onChange: (value: string[]) => void;
    onReset: () => void;
  }> = ({ label, options, selected, onChange, onReset }) => {
    return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-6 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${label}-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => {
                const newSelected = checked
                  ? [...selected, option.value]
                  : selected.filter(item => item !== option.value);
                onChange(newSelected);
              }}
            />
            <Label
              htmlFor={`${label}-${option.value}`}
              className="text-xs cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((value) => (
            <Badge key={value} variant="secondary" className="text-xs">
              {options.find(opt => opt.value === value)?.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
    );
  };

  const DateRangeFilter: React.FC<{
    label: string;
    startDate: Date | null;
    endDate: Date | null;
    onStartDateChange: (date: Date | null) => void;
    onEndDateChange: (date: Date | null) => void;
    onReset: () => void;
  }> = ({ label, startDate, endDate, onStartDateChange, onEndDateChange, onReset }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        {(startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-6 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal h-8">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "MMM dd") : "Start"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate || undefined}
              onSelect={(date) => onStartDateChange(date || null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal h-8">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "MMM dd") : "End"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate || undefined}
              onSelect={(date) => onEndDateChange(date || null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Dashboard Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings className="w-4 h-4 mr-1" />
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={saveFilters}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Filters */}
            <FilterSection title="Project Filters">
              <MultiSelectFilter
                label="Projects"
                options={projects.map(p => ({ value: p.id, label: p.name }))}
                selected={contextFilters.projectIds}
                onChange={(value) => handleUpdateFilter('projectIds', value)}
                onReset={() => resetFilter('projectIds')}
              />
              <MultiSelectFilter
                label="Status"
                options={[
                  { value: 'planning', label: 'Planning' },
                  { value: 'active', label: 'Active' },
                  { value: 'on-hold', label: 'On Hold' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                selected={contextFilters.projectStatus}
                onChange={(value) => handleUpdateFilter('projectStatus', value)}
                onReset={() => resetFilter('projectStatus')}
              />
              <MultiSelectFilter
                label="Priority"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' }
                ]}
                selected={contextFilters.projectPriority}
                onChange={(value) => handleUpdateFilter('projectPriority', value)}
                onReset={() => resetFilter('projectPriority')}
              />
            </FilterSection>

            {/* Sprint Filters */}
            <FilterSection title="Sprint Filters">
              <MultiSelectFilter
                label="Sprint Status"
                options={[
                  { value: 'planning', label: 'Planning' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                selected={contextFilters.sprintStatus}
                onChange={(value) => handleUpdateFilter('sprintStatus', value)}
                onReset={() => resetFilter('sprintStatus')}
              />
              <DateRangeFilter
                label="Sprint Date Range"
                startDate={contextFilters.sprintDateRange.start}
                endDate={contextFilters.sprintDateRange.end}
                onStartDateChange={(date) => handleUpdateFilter('sprintDateRange', { ...contextFilters.sprintDateRange, start: date })}
                onEndDateChange={(date) => handleUpdateFilter('sprintDateRange', { ...contextFilters.sprintDateRange, end: date })}
                onReset={() => handleUpdateFilter('sprintDateRange', { start: null, end: null })}
              />
            </FilterSection>

            {/* Task Filters */}
            <FilterSection title="Task Filters">
              <MultiSelectFilter
                label="Task Status"
                options={[
                  { value: 'todo', label: 'To Do' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'review', label: 'Review' },
                  { value: 'done', label: 'Done' },
                  { value: 'blocked', label: 'Blocked' }
                ]}
                selected={contextFilters.taskStatus}
                onChange={(value) => handleUpdateFilter('taskStatus', value)}
                onReset={() => resetFilter('taskStatus')}
              />
              <MultiSelectFilter
                label="Task Priority"
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' }
                ]}
                selected={contextFilters.taskPriority}
                onChange={(value) => handleUpdateFilter('taskPriority', value)}
                onReset={() => resetFilter('taskPriority')}
              />
              <MultiSelectFilter
                label="Assignees"
                options={users.map(u => ({ value: u.id, label: u.name }))}
                selected={contextFilters.assigneeIds}
                onChange={(value) => handleUpdateFilter('assigneeIds', value)}
                onReset={() => resetFilter('assigneeIds')}
              />
              <DateRangeFilter
                label="Due Date Range"
                startDate={contextFilters.dueDateRange.start}
                endDate={contextFilters.dueDateRange.end}
                onStartDateChange={(date) => handleUpdateFilter('dueDateRange', { ...contextFilters.dueDateRange, start: date })}
                onEndDateChange={(date) => handleUpdateFilter('dueDateRange', { ...contextFilters.dueDateRange, end: date })}
                onReset={() => handleUpdateFilter('dueDateRange', { start: null, end: null })}
              />
            </FilterSection>

            {/* Team Filters */}
            <FilterSection title="Team Filters">
              <MultiSelectFilter
                label="Teams"
                options={teams.map(t => ({ value: t.id, label: t.name }))}
                selected={contextFilters.teamIds}
                onChange={(value) => handleUpdateFilter('teamIds', value)}
                onReset={() => resetFilter('teamIds')}
              />
              <MultiSelectFilter
                label="Departments"
                options={departments.map(d => ({ value: d.id, label: d.name }))}
                selected={contextFilters.departmentIds}
                onChange={(value) => handleUpdateFilter('departmentIds', value)}
                onReset={() => resetFilter('departmentIds')}
              />
              <MultiSelectFilter
                label="Domains"
                options={domains.map(d => ({ value: d.id, label: d.name }))}
                selected={contextFilters.domainIds}
                onChange={(value) => handleUpdateFilter('domainIds', value)}
                onReset={() => resetFilter('domainIds')}
              />
            </FilterSection>

            {/* Time & Data Filters */}
            <FilterSection title="Time & Data Filters">
              <div className="space-y-2">
                <Label className="text-sm">Time Range</Label>
                <Select value={contextFilters.timeRange} onValueChange={(value) => handleUpdateFilter('timeRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {contextFilters.timeRange === 'custom' && (
                <DateRangeFilter
                  label="Custom Date Range"
                  startDate={contextFilters.customDateRange.start}
                  endDate={contextFilters.customDateRange.end}
                  onStartDateChange={(date) => handleUpdateFilter('customDateRange', { ...contextFilters.customDateRange, start: date })}
                  onEndDateChange={(date) => handleUpdateFilter('customDateRange', { ...contextFilters.customDateRange, end: date })}
                  onReset={() => handleUpdateFilter('customDateRange', { start: null, end: null })}
                />
              )}

              <div className="space-y-2">
                <Label className="text-sm">Data Source</Label>
                <Select value={contextFilters.dataSource} onValueChange={(value) => handleUpdateFilter('dataSource', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="api">API Data Only</SelectItem>
                    <SelectItem value="mock">Mock Data Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Refresh Interval: {contextFilters.refreshInterval / 1000}s</Label>
                <Slider
                  value={[contextFilters.refreshInterval / 1000]}
                  onValueChange={([value]) => handleUpdateFilter('refreshInterval', value * 1000)}
                  min={5}
                  max={300}
                  step={5}
                  className="w-full"
                />
              </div>
            </FilterSection>

            {/* View & Display Filters */}
            <FilterSection title="View & Display Filters">
              <div className="space-y-2">
                <Label className="text-sm">View Mode</Label>
                <Select value={contextFilters.viewMode} onValueChange={(value) => handleUpdateFilter('viewMode', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Chart Type</Label>
                <Select value={contextFilters.chartType} onValueChange={(value) => handleUpdateFilter('chartType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FilterSection>

            {/* User-Specific Filters */}
            <FilterSection title="Personal Filters">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showOnlyMyProjects"
                    checked={contextFilters.showOnlyMyProjects}
                    onCheckedChange={(checked) => handleUpdateFilter('showOnlyMyProjects', checked)}
                  />
                  <Label htmlFor="showOnlyMyProjects" className="text-sm">
                    Show only my projects
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showOnlyMyTasks"
                    checked={contextFilters.showOnlyMyTasks}
                    onCheckedChange={(checked) => handleUpdateFilter('showOnlyMyTasks', checked)}
                  />
                  <Label htmlFor="showOnlyMyTasks" className="text-sm">
                    Show only my tasks
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showOnlyActiveItems"
                    checked={contextFilters.showOnlyActiveItems}
                    onCheckedChange={(checked) => handleUpdateFilter('showOnlyActiveItems', checked)}
                  />
                  <Label htmlFor="showOnlyActiveItems" className="text-sm">
                    Show only active items
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showOverdueItems"
                    checked={contextFilters.showOverdueItems}
                    onCheckedChange={(checked) => handleUpdateFilter('showOverdueItems', checked)}
                  />
                  <Label htmlFor="showOverdueItems" className="text-sm">
                    Show overdue items
                  </Label>
                </div>
              </div>
            </FilterSection>

            {/* Component Visibility - NEW SECTION */}
            <FilterSection title="Dashboard Components">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Layout className="w-4 h-4 text-gray-600" />
                    <Label className="text-sm font-medium">Component Visibility</Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComponentVisibility(!showComponentVisibility)}
                    className="h-6 px-2 text-xs"
                  >
                    {showComponentVisibility ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {showComponentVisibility ? 'Hide' : 'Show'}
                  </Button>
                </div>
                
                {showComponentVisibility && (
                  <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showApiStatusIndicators"
                            checked={contextFilters.componentVisibility.showApiStatusIndicators}
                            onCheckedChange={(checked) => updateComponentVisibility('showApiStatusIndicators', checked as boolean)}
                          />
                          <Label htmlFor="showApiStatusIndicators" className="text-xs cursor-pointer">
                            API Status Indicators
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showApiStatusIndicators ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showApiErrorAlert"
                            checked={contextFilters.componentVisibility.showApiErrorAlert}
                            onCheckedChange={(checked) => updateComponentVisibility('showApiErrorAlert', checked as boolean)}
                          />
                          <Label htmlFor="showApiErrorAlert" className="text-xs cursor-pointer">
                            API Error Alerts
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showApiErrorAlert ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showPerformanceAlert"
                            checked={contextFilters.componentVisibility.showPerformanceAlert}
                            onCheckedChange={(checked) => updateComponentVisibility('showPerformanceAlert', checked as boolean)}
                          />
                          <Label htmlFor="showPerformanceAlert" className="text-xs cursor-pointer">
                            Performance Alerts
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showPerformanceAlert ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showAiInsights"
                            checked={contextFilters.componentVisibility.showAiInsights}
                            onCheckedChange={(checked) => updateComponentVisibility('showAiInsights', checked as boolean)}
                          />
                          <Label htmlFor="showAiInsights" className="text-xs cursor-pointer">
                            AI Insights Panel
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showAiInsights ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showUserTasks"
                            checked={contextFilters.componentVisibility.showUserTasks}
                            onCheckedChange={(checked) => updateComponentVisibility('showUserTasks', checked as boolean)}
                          />
                          <Label htmlFor="showUserTasks" className="text-xs cursor-pointer">
                            User Tasks & Pending Work
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showUserTasks ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showMetricsCards"
                            checked={contextFilters.componentVisibility.showMetricsCards}
                            onCheckedChange={(checked) => updateComponentVisibility('showMetricsCards', checked as boolean)}
                          />
                          <Label htmlFor="showMetricsCards" className="text-xs cursor-pointer">
                            Metrics Cards (Active Projects, Tasks, Team, Velocity)
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showMetricsCards ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showTeamPerformanceAlerts"
                            checked={contextFilters.componentVisibility.showTeamPerformanceAlerts}
                            onCheckedChange={(checked) => updateComponentVisibility('showTeamPerformanceAlerts', checked as boolean)}
                          />
                          <Label htmlFor="showTeamPerformanceAlerts" className="text-xs cursor-pointer">
                            Team Performance Alerts
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showTeamPerformanceAlerts ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showChartsAndAnalytics"
                            checked={contextFilters.componentVisibility.showChartsAndAnalytics}
                            onCheckedChange={(checked) => updateComponentVisibility('showChartsAndAnalytics', checked as boolean)}
                          />
                          <Label htmlFor="showChartsAndAnalytics" className="text-xs cursor-pointer">
                            Charts & Analytics (Sprint Performance, Task Distribution)
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showChartsAndAnalytics ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showRecentProjects"
                            checked={contextFilters.componentVisibility.showRecentProjects}
                            onCheckedChange={(checked) => updateComponentVisibility('showRecentProjects', checked as boolean)}
                          />
                          <Label htmlFor="showRecentProjects" className="text-xs cursor-pointer">
                            Recent Projects
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showRecentProjects ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showQuickActions"
                            checked={contextFilters.componentVisibility.showQuickActions}
                            onCheckedChange={(checked) => updateComponentVisibility('showQuickActions', checked as boolean)}
                          />
                          <Label htmlFor="showQuickActions" className="text-xs cursor-pointer">
                            Quick Actions
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showQuickActions ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showLiveStatusDashboard"
                            checked={contextFilters.componentVisibility.showLiveStatusDashboard}
                            onCheckedChange={(checked) => updateComponentVisibility('showLiveStatusDashboard', checked as boolean)}
                          />
                          <Label htmlFor="showLiveStatusDashboard" className="text-xs cursor-pointer">
                            Live Status Dashboard
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showLiveStatusDashboard ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showTeamAllocationDemo"
                            checked={contextFilters.componentVisibility.showTeamAllocationDemo}
                            onCheckedChange={(checked) => updateComponentVisibility('showTeamAllocationDemo', checked as boolean)}
                          />
                          <Label htmlFor="showTeamAllocationDemo" className="text-xs cursor-pointer">
                            Team Allocation Demo
                          </Label>
                        </div>
                        {contextFilters.componentVisibility.showTeamAllocationDemo ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetComponentVisibility}
                        className="w-full h-7 text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reset All to Visible
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </FilterSection>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default DashboardFilters;
