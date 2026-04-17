import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogPortal } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { format, parseISO, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, X, Save, AlertCircle, RefreshCw, Search, Folder, Activity, BookOpen, ChevronRight, Layers } from "lucide-react";
import { toast } from "sonner";
import { cn } from "./ui/utils";

import { useProjects } from "../hooks/api/useProjects";
import { useSprintsByProject } from "../hooks/api/useSprints";
import { useStoriesBySprint } from "../hooks/api/useStories";
import { useTasksByStory } from "../hooks/api/useTasks";
import { useIssuesByStory } from "../hooks/api/useIssues";
import { taskApiService } from "../services/api/entities/taskApi";
import { issueApiService } from "../services/api/entities/issueApi";
import { Task, Issue, Story, Sprint } from "../types/api";

interface BulkDueDateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkDueDateManager({ isOpen, onClose, onSuccess }: BulkDueDateManagerProps) {
  const { data: projectsData, loading: projectsLoading } = useProjects();
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const { data: sprintsData, loading: sprintsLoading } = useSprintsByProject(selectedProjectId || "");
  const sprints = Array.isArray(sprintsData) ? sprintsData : [];

  const { data: storiesData, loading: storiesLoading } = useStoriesBySprint(selectedSprintId || "");
  const stories = Array.isArray(storiesData) ? storiesData : [];

  const { data: tasksData, loading: tasksLoading, refetch: refetchTasks } = useTasksByStory(selectedStoryId || "");
  const systemTasks = Array.isArray(tasksData) ? tasksData : [];

  const { data: issuesData, loading: issuesLoading, refetch: refetchIssues } = useIssuesByStory(selectedStoryId || "");
  const systemIssues = Array.isArray(issuesData) ? issuesData : [];

  // State maps
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());

  const [taskDueDates, setTaskDueDates] = useState<Record<string, string>>({});
  const [issueDueDates, setIssueDueDates] = useState<Record<string, string>>({});

  const [taskBulkDate, setTaskBulkDate] = useState<Date | undefined>(undefined);
  const [issueBulkDate, setIssueBulkDate] = useState<Date | undefined>(undefined);

  const [taskSearch, setTaskSearch] = useState("");
  const [issueSearch, setIssueSearch] = useState("");

  const [isSavingTasks, setIsSavingTasks] = useState(false);
  const [isSavingIssues, setIsSavingIssues] = useState(false);

  // Search filtering
  const filteredTasks = useMemo(() => {
    if (!taskSearch.trim()) return systemTasks;
    const lowerQ = taskSearch.toLowerCase();
    return systemTasks.filter((t: Task) => t.title.toLowerCase().includes(lowerQ));
  }, [systemTasks, taskSearch]);

  const filteredIssues = useMemo(() => {
    if (!issueSearch.trim()) return systemIssues;
    const lowerQ = issueSearch.toLowerCase();
    return systemIssues.filter((i: Issue) => i.title.toLowerCase().includes(lowerQ));
  }, [systemIssues, issueSearch]);

  // Determine boundaries
  const activeSprint = useMemo(() => sprints.find(s => s.id === selectedSprintId) as Sprint | undefined, [sprints, selectedSprintId]);
  const activeStory = useMemo(() => stories.find(s => s.id === selectedStoryId) as Story | undefined, [stories, selectedStoryId]);

  const minDateLimit = activeSprint?.startDate ? parseISO(activeSprint.startDate) : undefined;
  const maxDateLimit = activeStory?.dueDate ? parseISO(activeStory.dueDate) : (activeSprint?.endDate ? parseISO(activeSprint.endDate) : undefined);

  // Reset downstream selections when upstream changes
  useEffect(() => {
    setSelectedSprintId(null);
    setSelectedStoryId(null);
  }, [selectedProjectId]);

  useEffect(() => {
    setSelectedStoryId(null);
  }, [selectedSprintId]);

  useEffect(() => {
    setSelectedTaskIds(new Set());
    setSelectedIssueIds(new Set());
    setTaskDueDates({});
    setIssueDueDates({});
    setTaskBulkDate(undefined);
    setIssueBulkDate(undefined);
    setTaskSearch("");
    setIssueSearch("");
  }, [selectedStoryId]);

  // Bulk Handlers for TASKS
  const handleSelectAllTasks = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)));
    } else {
      setSelectedTaskIds(new Set());
    }
  };

  const handleSelectTask = (id: string, checked: boolean) => {
    const newSet = new Set(selectedTaskIds);
    checked ? newSet.add(id) : newSet.delete(id);
    setSelectedTaskIds(newSet);
  };

  const applyTaskBulkDate = (date: Date | undefined) => {
    setTaskBulkDate(date);
    if (!date) return;

    const dateString = format(date, "yyyy-MM-dd");
    const updatedDates = { ...taskDueDates };
    selectedTaskIds.forEach(id => {
      updatedDates[id] = dateString;
    });
    setTaskDueDates(updatedDates);
  };

  const handleSingleTaskDateChange = (id: string, date: Date | undefined) => {
    const updatedDates = { ...taskDueDates };
    if (date) {
      updatedDates[id] = format(date, "yyyy-MM-dd");
    } else {
      delete updatedDates[id];
    }
    setTaskDueDates(updatedDates);
  };

  const handleSaveTasks = async () => {
    const changes = Object.entries(taskDueDates);
    if (changes.length === 0) return toast("No task changes to save");

    setIsSavingTasks(true);
    try {
      const promises = changes.map(([id, newDate]) => taskApiService.updateTaskDueDate(id, newDate));
      await Promise.all(promises);
      toast.success(`Successfully updated ${changes.length} task due dates`);
      if (onSuccess) onSuccess();

      // Update local modal UI seamlessly
      if (refetchTasks) refetchTasks();

      // Only clear the pending changes that were saved successfully, reset bulk state
      setTaskDueDates({});
      setTaskBulkDate(undefined);
      setSelectedTaskIds(new Set());
    } catch (error) {
      console.error("Failed to save tasks", error);
      toast.error("Failed to save task due dates");
    } finally {
      setIsSavingTasks(false);
    }
  };

  // Bulk Handlers for ISSUES
  const handleSelectAllIssues = (checked: boolean) => {
    if (checked) {
      setSelectedIssueIds(new Set(filteredIssues.map(i => i.id)));
    } else {
      setSelectedIssueIds(new Set());
    }
  };

  const handleSelectIssue = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIssueIds);
    checked ? newSet.add(id) : newSet.delete(id);
    setSelectedIssueIds(newSet);
  };

  const applyIssueBulkDate = (date: Date | undefined) => {
    setIssueBulkDate(date);
    if (!date) return;

    const dateString = format(date, "yyyy-MM-dd");
    const updatedDates = { ...issueDueDates };
    selectedIssueIds.forEach(id => {
      updatedDates[id] = dateString;
    });
    setIssueDueDates(updatedDates);
  };

  const handleSingleIssueDateChange = (id: string, date: Date | undefined) => {
    const updatedDates = { ...issueDueDates };
    if (date) {
      updatedDates[id] = format(date, "yyyy-MM-dd");
    } else {
      delete updatedDates[id];
    }
    setIssueDueDates(updatedDates);
  };

  const handleSaveIssues = async () => {
    const changes = Object.entries(issueDueDates);
    if (changes.length === 0) return toast("No issue changes to save");

    setIsSavingIssues(true);
    try {
      const promises = changes.map(([id, newDate]) => issueApiService.updateIssueDueDate(id, newDate));
      await Promise.all(promises);
      toast.success(`Successfully updated ${changes.length} issue due dates`);
      if (onSuccess) onSuccess();

      // Update local modal UI seamlessly
      if (refetchIssues) refetchIssues();

      // Clear specific changes
      setIssueDueDates({});
      setIssueBulkDate(undefined);
      setSelectedIssueIds(new Set());
    } catch (error) {
      console.error("Failed to save issues", error);
      toast.error("Failed to save issue due dates");
    } finally {
      setIsSavingIssues(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    if (minDateLimit && isBefore(startOfDay(date), startOfDay(minDateLimit))) return true;
    if (maxDateLimit && isAfter(startOfDay(date), startOfDay(maxDateLimit))) return true;
    return false;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="!max-w-none p-0 flex flex-col bg-white overflow-hidden gap-0 border-0 shadow-2xl [&>button]:right-6 [&>button]:top-6 [&>button]:text-gray-500 [&>button]:z-50"
        style={{ width: '95vw', maxWidth: '95vw', height: '90vh', maxHeight: '90vh' }}
      >
        {/* Enhanced Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-slate-50 to-white shrink-0 pr-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full bg-linear-to-l from-blue-50/50 to-transparent pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-blue-100/80 rounded-xl flex items-center justify-center border border-blue-200 shadow-sm text-blue-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 tracking-tight">Split View Due Date Manager</h2>
              <p className="text-sm text-gray-500 font-medium mt-0.5">Define your workflow path to securely pull task and issue data side-by-side.</p>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Row - Visual Path */}
        <div className="px-8 py-5 bg-white border-b border-gray-100 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.03)] flex flex-wrap items-center gap-4 shrink-0 relative z-20">

          {/* Step 1: Project */}
          <div className="flex-1 min-w-[250px] relative group">
            <div className="flex items-center gap-1.5 mb-2">
              <Folder className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">1. Select Project</label>
            </div>
            <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full bg-white border-gray-200 shadow-xs hover:border-blue-400 focus:ring-blue-100 focus:border-blue-500 transition-all h-10 rounded-lg">
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 shadow-lg rounded-lg">
                {projects.map((p: any) => (
                  <SelectItem key={p.id} value={p.id} className="cursor-pointer">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ChevronRight className="w-6 h-6 text-gray-300 shrink-0 hidden md:block mt-6" strokeWidth={1.5} />

          {/* Step 2: Sprint */}
          <div className="flex-1 min-w-[250px]">
            <div className={cn("flex items-center gap-1.5 mb-2 transition-colors", selectedProjectId ? "text-blue-600" : "text-gray-400")}>
              <Activity className="w-4 h-4" />
              <label className="text-xs font-bold uppercase tracking-widest text-gray-700">2. Select Sprint</label>
            </div>
            <Select value={selectedSprintId || ""} onValueChange={setSelectedSprintId} disabled={!selectedProjectId}>
              <SelectTrigger className={cn("w-full bg-white shadow-xs transition-all h-10 rounded-lg", selectedProjectId ? "border-gray-200 hover:border-blue-400 focus:ring-blue-100 focus:border-blue-500" : "border-dashed border-gray-200 bg-gray-50/50 cursor-not-allowed")}>
                <SelectValue placeholder={sprintsLoading ? "Loading..." : "Choose a sprint..."} />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 shadow-lg rounded-lg">
                {sprints.map((s: any) => (
                  <SelectItem key={s.id} value={s.id} className="cursor-pointer">{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ChevronRight className="w-6 h-6 text-gray-300 shrink-0 hidden md:block mt-6" strokeWidth={1.5} />

          {/* Step 3: Story */}
          <div className="flex-1 min-w-[250px]">
            <div className={cn("flex items-center gap-1.5 mb-2 transition-colors", selectedSprintId ? "text-blue-600" : "text-gray-400")}>
              <BookOpen className="w-4 h-4" />
              <label className="text-xs font-bold uppercase tracking-widest text-gray-700">3. Select Story</label>
            </div>
            <Select value={selectedStoryId || ""} onValueChange={setSelectedStoryId} disabled={!selectedSprintId}>
              <SelectTrigger className={cn("w-full bg-white shadow-xs transition-all h-10 rounded-lg", selectedSprintId ? "border-gray-200 hover:border-blue-400 focus:ring-blue-100 focus:border-blue-500" : "border-dashed border-gray-200 bg-gray-50/50 cursor-not-allowed")}>
                <SelectValue placeholder={storiesLoading ? "Loading..." : "Choose a story..."} />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-100 shadow-lg rounded-lg">
                {stories.map((s: any) => (
                  <SelectItem key={s.id} value={s.id} className="cursor-pointer">
                    <span className="font-medium mr-2">{s.title}</span>
                    {s.dueDate && <span className="text-xs text-gray-500 whitespace-nowrap">(Due: {format(parseISO(s.dueDate), 'MMM d, yyyy')})</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Split Main Content Area */}
        <div className="flex-1 overflow-hidden bg-slate-100 flex p-4 gap-6 min-h-0">

          {!selectedStoryId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white rounded-lg border border-gray-200">
              <AlertCircle className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600">No Story Selected</h3>
              <p>Please complete your selection above.</p>
            </div>
          ) : tasksLoading || issuesLoading ? (
            <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-gray-200">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* LEFT COLUMN - TASKS */}
              <div className="flex-1 flex flex-col min-w-0 bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-blue-50/50 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">Tasks</span>
                    <span className="text-sm text-gray-500 font-medium">({filteredTasks.length} found)</span>
                  </div>

                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tasks..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="pl-9 h-9 bg-white border-gray-300"
                    />
                  </div>
                </div>

                {/* Toolbar */}
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="selectAllTasks"
                      checked={filteredTasks.length > 0 && selectedTaskIds.size === filteredTasks.length}
                      onCheckedChange={handleSelectAllTasks}
                      className="border-gray-400"
                    />
                    <label htmlFor="selectAllTasks" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Select All ({selectedTaskIds.size})
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Bulk Apply:</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={selectedTaskIds.size === 0}
                          className={cn("h-8 w-[140px] text-xs justify-start text-left font-normal border-gray-300 bg-white", !taskBulkDate && "text-gray-500")}
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                          {taskBulkDate ? format(taskBulkDate, "MMM d, yyyy") : <span>Set Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border border-gray-200" align="end">
                        <Calendar mode="single" selected={taskBulkDate} onSelect={(d) => applyTaskBulkDate(d)} disabled={isDateDisabled} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* List Table */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
                  <div className="grid grid-cols-12 gap-2 p-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0 z-10 w-full">
                    <div className="col-span-1 flex items-center justify-center font-semibold">Select</div>
                    <div className="col-span-8 flex items-center font-semibold">Task Details & Current Date</div>
                    <div className="col-span-3 flex items-center font-semibold">New Date</div>
                  </div>

                  {filteredTasks.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No tasks match your search.</div>
                  ) : (
                    <div className="p-1 space-y-0.5">
                      {filteredTasks.map((task: Task) => (
                        <div key={task.id} className={cn(
                          "grid grid-cols-12 gap-2 p-2.5 rounded hover:bg-gray-50 border border-transparent items-center",
                          selectedTaskIds.has(task.id) && "bg-blue-50/50 hover:bg-blue-50 border-blue-100"
                        )}>
                          <div className="col-span-1 flex justify-center">
                            <Checkbox
                              checked={selectedTaskIds.has(task.id)}
                              onCheckedChange={(c) => handleSelectTask(task.id, c as boolean)}
                            />
                          </div>
                          <div className="col-span-8 overflow-hidden pr-2">
                            <div className="text-sm font-medium text-gray-800 truncate">{task.title}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                              <span>{task.id.substring(0, 8)}</span>
                              <span>•</span>
                              <span className={cn("font-medium", !task.dueDate && "italic")}>
                                {task.dueDate ? format(parseISO(task.dueDate), "MMM d, yyyy") : "No Current Date"}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-3 min-w-0 pr-1">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-8 text-xs justify-start text-left font-normal border-gray-200 px-2 overflow-hidden",
                                    taskDueDates[task.id] ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" : "text-gray-400"
                                  )}
                                >
                                  <CalendarIcon className="mr-1.5 h-3 w-3 shrink-0" />
                                  <span className="truncate">{taskDueDates[task.id] ? format(parseISO(taskDueDates[task.id]), "MMM d, yy") : "Select"}</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-white" align="end">
                                <Calendar mode="single" selected={taskDueDates[task.id] ? parseISO(taskDueDates[task.id]) : undefined} onSelect={(d) => handleSingleTaskDateChange(task.id, d)} disabled={isDateDisabled} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer / Save Tasks */}
                <div className="px-4 py-3 bg-white border-t border-gray-200 flex justify-between items-center shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.05)] shrink-0 z-20">
                  <span className="text-sm font-medium text-blue-600">
                    {Object.keys(taskDueDates).length} changes
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSaveTasks}
                    disabled={isSavingTasks}
                    className={cn(
                      "min-w-[120px] shadow-sm transition-all text-black",
                      Object.keys(taskDueDates).length > 0 ? "bg-blue-600 hover:bg-blue-700 hover:shadow-md" : "bg-blue-400 hover:bg-blue-500"
                    )}
                  >
                    {isSavingTasks ? <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
                    Save Tasks
                  </Button>
                </div>
              </div>

              {/* RIGHT COLUMN - ISSUES */}
              <div className="flex-1 flex flex-col min-w-0 bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-red-50/50 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">Issues</span>
                    <span className="text-sm text-gray-500 font-medium">({filteredIssues.length} found)</span>
                  </div>

                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search issues..."
                      value={issueSearch}
                      onChange={(e) => setIssueSearch(e.target.value)}
                      className="pl-9 h-9 bg-white border-gray-300"
                    />
                  </div>
                </div>

                {/* Toolbar */}
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="selectAllIssues"
                      checked={filteredIssues.length > 0 && selectedIssueIds.size === filteredIssues.length}
                      onCheckedChange={handleSelectAllIssues}
                      className="border-gray-400"
                    />
                    <label htmlFor="selectAllIssues" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Select All ({selectedIssueIds.size})
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Bulk Apply:</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={selectedIssueIds.size === 0}
                          className={cn("h-8 w-[140px] text-xs justify-start text-left font-normal border-gray-300 bg-white", !issueBulkDate && "text-gray-500")}
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                          {issueBulkDate ? format(issueBulkDate, "MMM d, yyyy") : <span>Set Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border border-gray-200" align="end">
                        <Calendar mode="single" selected={issueBulkDate} onSelect={(d) => applyIssueBulkDate(d)} disabled={isDateDisabled} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* List Table */}
                <div className="flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
                  <div className="grid grid-cols-12 gap-2 p-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase sticky top-0 z-10 w-full">
                    <div className="col-span-1 flex items-center justify-center font-semibold">Select</div>
                    <div className="col-span-8 flex items-center font-semibold">Issue Details & Current Date</div>
                    <div className="col-span-3 flex items-center font-semibold">New Date</div>
                  </div>

                  {filteredIssues.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No issues match your search.</div>
                  ) : (
                    <div className="p-1 space-y-0.5">
                      {filteredIssues.map((issue: Issue) => (
                        <div key={issue.id} className={cn(
                          "grid grid-cols-12 gap-2 p-2.5 rounded hover:bg-gray-50 border border-transparent items-center",
                          selectedIssueIds.has(issue.id) && "bg-red-50/50 hover:bg-red-50 border-red-100"
                        )}>
                          <div className="col-span-1 flex justify-center">
                            <Checkbox
                              checked={selectedIssueIds.has(issue.id)}
                              onCheckedChange={(c) => handleSelectIssue(issue.id, c as boolean)}
                            />
                          </div>
                          <div className="col-span-8 overflow-hidden pr-2">
                            <div className="text-sm font-medium text-gray-800 truncate">{issue.title}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                              <span>{issue.id.substring(0, 8)}</span>
                              <span>•</span>
                              <span className={cn("font-medium", !issue.dueDate && "italic")}>
                                {issue.dueDate ? format(parseISO(issue.dueDate), "MMM d, yyyy") : "No Current Date"}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-3 min-w-0 pr-1">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-8 text-xs justify-start text-left font-normal border-gray-200 px-2 overflow-hidden",
                                    issueDueDates[issue.id] ? "bg-red-50 border-red-200 text-red-700 font-medium" : "text-gray-400"
                                  )}
                                >
                                  <CalendarIcon className="mr-1.5 h-3 w-3 shrink-0" />
                                  <span className="truncate">{issueDueDates[issue.id] ? format(parseISO(issueDueDates[issue.id]), "MMM d, yy") : "Select"}</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-white" align="end">
                                <Calendar mode="single" selected={issueDueDates[issue.id] ? parseISO(issueDueDates[issue.id]) : undefined} onSelect={(d) => handleSingleIssueDateChange(issue.id, d)} disabled={isDateDisabled} initialFocus />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer / Save Issues */}
                <div className="px-4 py-3 bg-white border-t border-gray-200 flex justify-between items-center shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.05)] shrink-0 z-20">
                  <span className="text-sm font-medium text-red-600">
                    {Object.keys(issueDueDates).length} changes
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSaveIssues}
                    disabled={isSavingIssues}
                    className={cn(
                      "min-w-[120px] shadow-sm transition-all text-black",
                      Object.keys(issueDueDates).length > 0 ? "bg-red-600 hover:bg-red-700 hover:shadow-md" : "bg-red-400 hover:bg-red-500"
                    )}
                  >
                    {isSavingIssues ? <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
                    Save Issues
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
