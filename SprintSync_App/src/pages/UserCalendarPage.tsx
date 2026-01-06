import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { timeEntryApiService } from '../services/api/entities/timeEntryApi';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Badge } from '../components/ui/badge';
import { cn } from '../components/ui/utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Info, Timer, Users, Briefcase, RotateCcw } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select';
import { projectApiService } from '../services/api/entities/projectApi';
import { teamMemberApi } from '../services/api/entities/teamMemberApi';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { TimeEntry, User, Project } from '../types/api';

// Helper to resolve Project ID from complex TimeEntry objects (similar to TimeTrackingPage)
const getProjectIdFromEntry = (entry: any): string | undefined => {
    const projectObj =
        entry?.project ??
        entry?.projectDetails ??
        entry?.projectDto ??
        entry?.projectInfo ??
        entry?.projectResponse ??
        entry?.projectData;

    const candidateIds = [
        entry?.projectId,
        entry?.projectID,
        entry?.project_id,
        projectObj?.id,
        projectObj?.projectId,
        projectObj?.projectID,
        projectObj?.project_id,
    ];

    return candidateIds
        .map(id => id ? String(id) : undefined)
        .find(id => !!id);
};

const UserCalendarPage: React.FC = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());

    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

    // Removed metadata states to fetch directly from time entries table
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
                // Fetch ONLY time entries from the table as requested
                const entriesRes = await timeEntryApiService.getTimeEntriesByUser(targetUserId);
                setTimeEntries(entriesRes.data || []);
            } catch (error) {
                console.error('Failed to fetch calendar data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedMemberId, user?.id, isManagerOrAdmin, selectedProjectId]); // Added isManagerOrAdmin, selectedProjectId to dependencies

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
        const map = new Map<string, { logged: number, items: any[] }>();

        // For developers, show all entries.
        // For managers: The user request "fetch and display actual hours... as per in tester developers calendar view"
        // implies they want to see the FULL actual hours for the selected employee, not filtered by the valid project ID.
        // The Project Selector helps FIND the user (via team membership), but once a user is selected, 
        // we should show ALL their work (Actual Hours) to reflect their true availability/productivity,
        // especially since many subtask entries might lack project IDs.
        const filteredEntries = timeEntries;

        // Process time entries for logged hours
        filteredEntries.forEach(entry => {
            if (!entry.workDate) return;
            // Fix: Use substring to get the date part directly from ISO string "YYYY-MM-DD..." to avoid timezone shifts
            // This assumes workDate comes as "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss"
            const dateStr = String(entry.workDate).substring(0, 10);

            const current = map.get(dateStr) || { logged: 0, items: [] };
            current.logged += entry.hoursWorked || 0;
            current.items.push({ type: 'entry', ...entry });
            map.set(dateStr, current);
        });

        // Removed Task and Issue processing loops as we don't want to show allocated/estimated hours

        return map;
    }, [timeEntries, selectedProjectId, isManagerOrAdmin]);

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
                        My Work Calendar (Actuals)
                    </h1>
                    <p className="text-muted-foreground">Track your actual logged hours across the month.</p>
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
                        {isManagerOrAdmin && (selectedProjectId || selectedMemberId !== user?.id) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedProjectId('');
                                    setSelectedMemberId(user?.id || '');
                                }}
                                className="h-9 text-muted-foreground hover:text-foreground hover:bg-green-50"
                            >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Reset
                            </Button>
                        )}
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
                            const data = dayDataMap.get(dateStr) || { logged: 0, items: [] };
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isTodayDate = isSameDay(day, new Date());
                            // const DAILY_TARGET = 8; // Removing strict target visualization for now as we focus on actuals
                            // const totalPotentialHours = data.logged + data.estimated;
                            const isCompleted = data.logged >= 8;

                            // Simple style for filtered view
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
                                    {/* Overload Indicator Removed */}

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
                                                                <span className="opacity-70">Logged:</span>
                                                                <span className="font-mono font-bold text-green-400">{data.logged.toFixed(1)}h</span>
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
                                                                                (item.taskName || item.storyName || 'Activity')}
                                                                        </span>
                                                                    </div>
                                                                    <span className="font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                        {(item.hoursWorked || 0).toFixed(1)}h
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
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
                    </div>
                </div>

                <div className="md:col-span-2 p-4 bg-green-50/50 border border-green-100 rounded-xl flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <Info className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-green-800">Actual Hours Tracking</h4>
                        <p className="text-xs text-green-700/80 leading-relaxed mt-1">
                            The calendar displays your actual logged hours.
                            Days turn solid green when you meet the 8-hour daily target.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCalendarPage;
