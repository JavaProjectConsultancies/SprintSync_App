import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { timeEntryApiService } from '../services/api/entities/timeEntryApi';
import { taskApiService } from '../services/api/entities/taskApi';
import { issueApiService } from '../services/api/entities/issueApi';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Badge } from '../components/ui/badge';
import { cn } from '../components/ui/utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Info, Timer, Users, Briefcase } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select';
import { userApiService } from '../services/api/entities/userApi';
import { projectApiService } from '../services/api/entities/projectApi';
import { teamMemberApi } from '../services/api/entities/teamMemberApi';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { TimeEntry, Task, Issue, User, Project } from '../types/api';

const UserCalendarPage: React.FC = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());

    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<string>(user?.id || '');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'qa_manager';

    useEffect(() => {
        const fetchProjects = async () => {
            if (!isManagerOrAdmin) return;
            try {
                const projectsRes = await projectApiService.getAccessibleProjects();
                setProjects(projectsRes.data || []);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            }
        };
        fetchProjects();
    }, [isManagerOrAdmin]);

    // Fetch members based on selected project
    useEffect(() => {
        const fetchMembers = async () => {
            if (!isManagerOrAdmin || !selectedProjectId) {
                if (!selectedProjectId) setMembers([]);
                return;
            }
            try {
                const projectMembers = await teamMemberApi.getTeamMembersByProject(selectedProjectId);
                // Map TeamMember to User type structure for the Picker
                const mappedMembers: User[] = projectMembers.map(m => ({
                    id: m.userId || m.id,
                    name: m.name,
                    email: m.email || '',
                    passwordHash: '', // Required by the User interface
                    role: m.role as any,
                    isActive: true,
                    createdAt: '',
                    updatedAt: ''
                }));
                setMembers(mappedMembers);

                // Reset selected member if not in the new list
                if (!mappedMembers.find(m => m.id === selectedMemberId) && selectedMemberId !== user?.id) {
                    // Keep current user selected if they are the one viewing, otherwise default to first member or current user
                    const isUserInProject = mappedMembers.find(m => m.id === user?.id);
                    if (!isUserInProject && mappedMembers.length > 0) {
                        // If user is not in project, maybe don't force change yet, but user might want to see someone's data.
                        // For now, let's just keep the selection unless it's explicitly invalid for the list.
                    }
                }
            } catch (error) {
                console.error('Failed to fetch filter data:', error);
            }
        };
        fetchMembers();
    }, [isManagerOrAdmin, selectedProjectId]);

    // Update selectedMemberId when user changes (initial load)
    useEffect(() => {
        if (user?.id && !selectedMemberId) {
            setSelectedMemberId(user.id);
        }
    }, [user?.id, selectedMemberId]);

    // Fetch data with useEffect instead of react-query
    useEffect(() => {
        const fetchData = async () => {
            const targetUserId = selectedMemberId || user?.id;
            if (!targetUserId) return;

            setIsLoading(true);
            try {
                const [entriesRes, tasksRes, issuesRes] = await Promise.all([
                    timeEntryApiService.getTimeEntriesByUser(targetUserId),
                    taskApiService.getTasksByAssignee(targetUserId),
                    issueApiService.getIssuesByAssignee(targetUserId)
                ]);

                setTimeEntries(entriesRes.data || []);
                setTasks(tasksRes.data || []);
                setIssues(issuesRes.data || []);
            } catch (error) {
                console.error('Failed to fetch calendar data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedMemberId, user?.id]);

    // Calendar logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    // Data processing logic
    const dayDataMap = useMemo(() => {
        const map = new Map<string, { logged: number, estimated: number, items: any[] }>();

        // For developers, show all entries. For managers, filter by project selection.
        const filteredEntries = !isManagerOrAdmin
            ? timeEntries
            : (selectedProjectId ? timeEntries.filter(e => e.projectId === selectedProjectId) : []);

        const filteredTasks = !isManagerOrAdmin
            ? tasks
            : (selectedProjectId ? tasks.filter(t => (t as any).projectId === selectedProjectId) : []);

        const filteredIssues = !isManagerOrAdmin
            ? issues
            : (selectedProjectId ? issues.filter(i => (i as any).projectId === selectedProjectId) : []);

        // Process time entries for logged hours
        filteredEntries.forEach(entry => {
            if (!entry.workDate) return;
            const dateStr = format(new Date(entry.workDate), 'yyyy-MM-dd');
            const current = map.get(dateStr) || { logged: 0, estimated: 0, items: [] };
            current.logged += entry.hoursWorked || 0;
            current.items.push({ type: 'entry', ...entry });
            map.set(dateStr, current);
        });

        // Process tasks for estimates
        filteredTasks.forEach(task => {
            if (!task.dueDate) return;
            const dateStr = format(new Date(task.dueDate), 'yyyy-MM-dd');
            const current = map.get(dateStr) || { logged: 0, estimated: 0, items: [] };
            current.estimated += task.estimatedHours || 0;
            current.items.push({ type: 'task', ...task });
            map.set(dateStr, current);
        });

        // Process issues for estimates
        filteredIssues.forEach(issue => {
            if (!issue.dueDate) return;
            const dateStr = format(new Date(issue.dueDate), 'yyyy-MM-dd');
            const current = map.get(dateStr) || { logged: 0, estimated: 0, items: [] };
            current.estimated += issue.estimatedHours || 0;
            current.items.push({ type: 'issue', ...issue });
            map.set(dateStr, current);
        });

        return map;
    }, [timeEntries, tasks, issues, selectedProjectId]);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-green-600" />
                        My Work Calendar
                    </h1>
                    <p className="text-muted-foreground">Track your allocated estimates and logged hours across the month.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {isManagerOrAdmin && (
                        <>
                            <div className="flex items-center gap-2">
                                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                    <SelectTrigger className="w-[180px] h-9 bg-white shadow-sm border-green-100 focus:ring-green-500">
                                        <Briefcase className="w-4 h-4 mr-2 text-green-600" />
                                        <SelectValue placeholder="Select Project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(project => (
                                            <SelectItem key={project.id} value={project.id}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Select
                                    value={selectedMemberId}
                                    onValueChange={setSelectedMemberId}
                                    disabled={!selectedProjectId}
                                >
                                    <SelectTrigger className={cn(
                                        "w-[180px] h-9 bg-white shadow-sm border-green-100 focus:ring-green-500",
                                        !selectedProjectId && "opacity-50 cursor-not-allowed bg-gray-50"
                                    )}>
                                        <Users className="w-4 h-4 mr-2 text-green-600" />
                                        <SelectValue placeholder={selectedProjectId ? "Select Member" : "Choose Project First"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={user?.id || 'me'}>My Calendar</SelectItem>
                                        {members.filter(m => m.id !== user?.id).map(member => (
                                            <SelectItem key={member.id} value={member.id}>
                                                {member.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />
                        </>
                    )}

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleToday} className="h-9 border-green-100 hover:bg-green-50">Today</Button>
                        <div className="flex items-center gap-1 bg-white border border-green-100 rounded-md shadow-sm h-9 px-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-green-50" onClick={handlePrevMonth}>
                                <ChevronLeft className="w-4 h-4 text-green-600" />
                            </Button>
                            <span className="text-sm font-bold min-w-[110px] text-center text-gray-700">
                                {format(currentDate, 'MMM yyyy')}
                            </span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-green-50" onClick={handleNextMonth}>
                                <ChevronRight className="w-4 h-4 text-green-600" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-green-100 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 border-b bg-gray-50/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r last:border-r-0">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 grid-rows-5 md:grid-rows-6 min-h-[600px]">
                        {days.map((day, idx) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const data = dayDataMap.get(dateStr) || { logged: 0, estimated: 0, items: [] };
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isTodayDate = isSameDay(day, new Date());
                            const DAILY_TARGET = 8;
                            const totalPotentialHours = data.logged + data.estimated;
                            const isCompleted = data.logged >= DAILY_TARGET;
                            const isOverloaded = totalPotentialHours > DAILY_TARGET;
                            const remainingHours = Math.max(0, DAILY_TARGET - data.logged);

                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        "min-h-[110px] p-2 border-r border-b relative group transition-all duration-300",
                                        !isCurrentMonth ? "bg-gray-50/20 text-gray-300" : "bg-white",
                                        isCompleted && isCurrentMonth && "bg-green-50/30",
                                        idx % 7 === 6 && "border-r-0"
                                    )}
                                >
                                    {/* Overload Indicator */}
                                    {isOverloaded && isCurrentMonth && (
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
                                    )}

                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={cn(
                                                    "text-sm font-semibold flex items-center justify-center w-7 h-7 rounded-full transition-transform group-hover:scale-110",
                                                    isTodayDate ? "bg-green-600 text-white shadow-sm" : "",
                                                    !isCurrentMonth ? "opacity-30" : "text-gray-700",
                                                    isCompleted && !isTodayDate && isCurrentMonth ? "text-green-700 bg-green-100/50" : ""
                                                )}
                                            >
                                                {format(day, 'd')}
                                            </span>
                                            {isOverloaded && isCurrentMonth && (
                                                <Badge variant="destructive" className="h-4 px-1 text-[8px] animate-in zoom-in">
                                                    +{(totalPotentialHours - DAILY_TARGET).toFixed(1)}h
                                                </Badge>
                                            )}
                                        </div>

                                        {data.items.length > 0 && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100">
                                                            <Info className="w-3.5 h-3.5 text-gray-400" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="p-0 overflow-hidden w-72 bg-white border shadow-2xl rounded-xl">
                                                        <div className="bg-gray-900 text-white p-3 text-xs flex justify-between items-center">
                                                            <span className="font-bold">{format(day, 'PPPP')}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="opacity-70">Total:</span>
                                                                <span className="font-mono font-bold text-green-400">{totalPotentialHours.toFixed(1)}h</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                            {data.items.map((item, i) => (
                                                                <div key={i} className="flex items-center justify-between gap-3 text-[11px] hover:bg-gray-50 p-1 rounded transition-colors group/item">
                                                                    <div className="flex items-center gap-2 truncate flex-1">
                                                                        <div className={cn(
                                                                            "w-1.5 h-1.5 rounded-full shrink-0",
                                                                            item.type === 'entry' ? "bg-green-500" : "bg-blue-500"
                                                                        )} />
                                                                        <span className="truncate text-gray-700 group-hover/item:text-black">
                                                                            {item.type === 'entry' ? (item.description || 'Logged Work') :
                                                                                item.type === 'task' ? `TASK: ${item.title}` : `ISSUE: ${item.title}`}
                                                                        </span>
                                                                    </div>
                                                                    <span className="font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                        {(item.hoursWorked || item.estimatedHours || 0).toFixed(1)}h
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {(isOverloaded || remainingHours > 0) && (
                                                            <div className={cn(
                                                                "p-2 text-center text-[10px] font-bold uppercase tracking-wider",
                                                                isOverloaded ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                                                            )}>
                                                                {isOverloaded ?
                                                                    `⚠️ Overloaded by ${(totalPotentialHours - DAILY_TARGET).toFixed(1)} hours` :
                                                                    `🕒 ${remainingHours.toFixed(1)} hours remaining to goal`}
                                                            </div>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>

                                    {isCurrentMonth && (
                                        <div className="space-y-1.5 mt-1">
                                            {data.logged > 0 && (
                                                <div className={cn(
                                                    "flex items-center justify-between px-2 py-1 rounded-md text-[10px] shadow-sm transition-all",
                                                    isCompleted ? "bg-green-600 text-white font-bold" : "bg-green-50 border border-green-100 text-green-700 font-medium"
                                                )}>
                                                    <span>Logged</span>
                                                    <span>{data.logged.toFixed(1)}h</span>
                                                </div>
                                            )}

                                            {data.estimated > 0 && (
                                                <div className="flex items-center justify-between px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-medium shadow-sm">
                                                    <span>Allocated</span>
                                                    <span className="font-bold">{data.estimated.toFixed(1)}h</span>
                                                </div>
                                            )}

                                            {!isCompleted && remainingHours > 0 && isCurrentMonth && (
                                                <div className="mt-1 px-1 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <Timer className="w-2.5 h-2.5 text-orange-500" />
                                                    <span className="text-[9px] text-orange-600 font-semibold italic">
                                                        {remainingHours.toFixed(1)}h left
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2 p-4 bg-white border rounded-xl shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Legend</span>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px]">
                            <div className="w-4 h-4 rounded bg-green-600 shadow-sm" />
                            <span className="text-gray-600">8h+ Goal Reached (Logged)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                            <div className="w-4 h-4 rounded bg-red-500 animate-pulse shadow-sm" />
                            <span className="text-gray-600">Daily Capacity Overloaded (&gt;8h)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200" />
                            <span className="text-gray-600">Estimated Work (Tasks/Issues)</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 p-4 bg-green-50/50 border border-green-100 rounded-xl flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <Info className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-green-800">Dynamic Capacity Tracking</h4>
                        <p className="text-xs text-green-700/80 leading-relaxed mt-1">
                            The calendar automatically calculates your daily remaining hours based on a <strong>8-hour workday</strong>.
                            Days turn solid green when you meet the target. Red indicators appear if your total logs and pending estimates exceed 8 hours.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCalendarPage;
