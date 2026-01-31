import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { useSearchParams } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Badge } from "../components/ui/badge";

import { Button } from "../components/ui/button";

import { Input } from "../components/ui/input";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import BurndownChart from "../components/BurndownChart";

import { Label } from "../components/ui/label";

import { Textarea } from "../components/ui/textarea";

import { Progress } from "../components/ui/progress";

import { useAuth } from "../contexts/AuthContextEnhanced";
import { useRoleSwitcher } from "../contexts/RoleSwitcherContext";
import RoleSwitcherDropdown from "../components/RoleSwitcherDropdown";
import { API_CONFIG } from "../services/api/config";

import { DndProvider, useDrag, useDrop } from "react-dnd";

import { HTML5Backend } from "react-dnd-html5-backend";

import { toast } from "sonner";

import {
  Search,
  Plus,
  Clock,
  Target,
  AlertTriangle,
  AlertCircle,
  User,
  Flag,
  MoreHorizontal,
  CheckCircle2,
  Timer,
  PlayCircle,
  PauseCircle,
  Settings,
  BarChart3,
  Users,
  Shield,
  GripVertical,
  Edit3,
  Trash2,
  History,
  Filter,
  Download,
  FileText,
  CheckSquare,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers3,
  BookOpen,
  CalendarDays,
  GitBranch,
  Zap,
  MapPin,
  Building2,
  Loader2,
  TrendingUp,
  Eye,
  X,
  Paperclip,
  Link,
  MoreVertical,
  SortAsc,
  SortDesc,
  Calculator,
  CalendarIcon,
  Save,
} from "lucide-react";

import { Checkbox } from "../components/ui/checkbox";

import { Calendar } from "../components/ui/calendar";

import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";

// Import API hooks

import {
  useSprintsByProject,
  useCurrentSprint,
  useCreateSprint,
  useUpdateSprint,
  useUpdateSprintStatus,
  useSprintBurndown,
  useAllSprints,
} from "../hooks/api/useSprints";

import { normalizeApiData } from "../hooks/api/cacheUtils";

import {
  useStoriesBySprint,
  useStoriesByProject,
  useCreateStory,
  useUpdateStory,
  useUpdateStoryStatus,
  useMoveStoryToSprint,
} from "../hooks/api/useStories";

import { storyApiService } from "../services/api/entities/storyApi";
import { sprintApiService } from "../services/api/entities/sprintApi";

import {
  useTasksByStory,
  useCreateTask,
  useUpdateTask,
  useUpdateTaskStatus,
} from "../hooks/api/useTasks";

import {
  useIssuesByStory,
  useCreateIssue,
  useUpdateIssue,
  useUpdateIssueStatus,
} from "../hooks/api/useIssues";

import { subtaskApiService } from "../services/api/entities/subtaskApi";

import { taskApiService } from "../services/api/entities/taskApi";

import { issueApiService } from "../services/api/entities/issueApi";

import { timeEntryApiService } from "../services/api/entities/timeEntryApi";

import { activityLogApiService } from "../services/api/entities/activityLogApi";

import { attachmentApiService } from "../services/api/entities/attachmentApi";

import { emitProjectBudgetUpdated } from "../utils/projectBudgetEvents";

import { useRecentActivityByEntity } from "../hooks/api/useActivityLogs";

import { useProjectById } from "../hooks/api/useProjectById";

import { useProjects } from "../hooks/api/useProjects";

import { useEpics } from "../hooks/api/useEpics";

import { useReleases } from "../hooks/api/useReleases";

import {
  Sprint,
  Story,
  Task,
  Issue,
  Subtask,
  TimeEntry,
  ActivityLog,
  Priority,
  SprintStatus,
  StoryStatus,
  TaskStatus,
  Notification,
} from "../types/api";

import AddTaskDialog from "../components/AddTaskDialog";

import AddIssueDialog from "../components/AddIssueDialog";

import LaneConfigurationModal from "../components/LaneConfigurationModal";

import EffortManager from "../components/EffortManager";

import TaskDetailsFullDialog from "../components/TaskDetailsFullDialog";
import ChatSection from "../components/ChatSection";
import { notificationApiService } from "../services/api/entities/notificationApi";

import LoadingSpinner from "../components/LoadingSpinner";
import AttachmentViewer from "../components/AttachmentViewer";

// import CreateSprintDialog from "../components/CreateSprintDialog";

import TeamCapacityCalculator from "../components/TeamCapacityCalculator";

import {
  useWorkflowLanesByProject,
  useCreateWorkflowLane,
  useUpdateWorkflowLane,
  useDeleteWorkflowLane,
} from "../hooks/api/useWorkflowLanes";

import { WorkflowLane, workflowLaneApiService } from "../services/api/entities/workflowLaneApi";

import {
  useBoardsByProject,
  useCreateBoardFromDefault,
  useDeleteBoard,
} from "../hooks/api/useBoards";

import { Board } from "../services/api/entities/boardApi";

// Drag item types

const ItemTypes = {
  STORY: "story",

  TASK: "task",

  ISSUE: "issue",
};

const ScrumPage: React.FC = () => {
  const { user } = useAuth();
  const { activeRole, resetToOriginalRole, getRoleForProject, switchRole } = useRoleSwitcher();

  // Reset to original role when navigating away from this page
  useEffect(() => {
    return () => {
      // Cleanup: Reset to user's original login role when leaving ScrumPage
      resetToOriginalRole();
    };
  }, [resetToOriginalRole]);

  // Use activeRole for permission checks - admin and master_admin stay as their roles, others use activeRole
  const effectiveRole = user?.role === 'admin' ? 'admin' : (user?.role === 'master_admin' ? 'master_admin' : activeRole);
  const [searchParams] = useSearchParams();

  const [selectedProject, setSelectedProject] = useState("");

  // Auto-switch role to user's role for the selected project
  useEffect(() => {
    if (selectedProject) {
      const projectRole = getRoleForProject(selectedProject);
      if (projectRole && projectRole !== activeRole) {
        switchRole(projectRole);
      }
    }
  }, [selectedProject, getRoleForProject, switchRole, activeRole]);

  const notifyProjectBudgetUpdate = useCallback(
    (reason?: string) => {
      if (!selectedProject) return;
      emitProjectBudgetUpdated(selectedProject, reason);
    },
    [selectedProject],
  );

  const projectInitializedRef = useRef(false);

  const [selectedSprint, setSelectedSprint] = useState("");

  const [activeView, setActiveView] = useState("scrum-board");

  // Attachment viewer state
  const [viewingAttachment, setViewingAttachment] = useState<any | null>(null);
  const [isAttachmentViewerOpen, setIsAttachmentViewerOpen] = useState(false);

  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);

  // const [isCreateSprintDialogOpen, setIsCreateSprintDialogOpen] = useState(false);

  const [isCapacityCalculatorOpen, setIsCapacityCalculatorOpen] = useState(false);

  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);

  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  const [isAddIssueDialogOpen, setIsAddIssueDialogOpen] = useState(false);

  const [customLaneNameForDialog, setCustomLaneNameForDialog] = useState<string | undefined>(undefined);

  const [selectedStoryForIssue, setSelectedStoryForIssue] = useState<
    string | null
  >(null);

  const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);
  const [isEditSubtaskDialogOpen, setIsEditSubtaskDialogOpen] = useState(false);
  const [selectedSubtaskForEdit, setSelectedSubtaskForEdit] = useState<Subtask | null>(null);

  const [selectedTaskForSubtask, setSelectedTaskForSubtask] =
    useState<Task | null>(null);

  const [selectedIssueForSubtask, setSelectedIssueForSubtask] =
    useState<Issue | null>(null);

  // State for task logs/time entries
  const [taskLogs, setTaskLogs] = useState<TimeEntry[]>([]);
  const [loadingTaskLogs, setLoadingTaskLogs] = useState(false);
  // State for issue logs/time entries
  const [issueLogs, setIssueLogs] = useState<TimeEntry[]>([]);
  const [loadingIssueLogs, setLoadingIssueLogs] = useState(false);
  const [selectedLogForEdit, setSelectedLogForEdit] = useState<TimeEntry | null>(null);
  const [isEditLogDialogOpen, setIsEditLogDialogOpen] = useState(false);
  const [editLogData, setEditLogData] = useState({
    hoursWorked: 0,
    description: "",
    workDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
  });

  // Subtask log effort state
  const [isSubtaskLogEffortOpen, setIsSubtaskLogEffortOpen] = useState(false);
  const [selectedSubtaskForLog, setSelectedSubtaskForLog] = useState<Subtask | null>(null);
  const [isLoggingSubtaskEffort, setIsLoggingSubtaskEffort] = useState(false);
  const [subtaskLogEffort, setSubtaskLogEffort] = useState({
    hours: 0,
    description: "",
    workDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
  });
  const [subtaskLogAttachments, setSubtaskLogAttachments] = useState<File[]>([]);

  const [dashboardProject, setDashboardProject] = useState("all");
  const [dashboardSprint, setDashboardSprint] = useState("all");
  const [dashboardMember, setDashboardMember] = useState("all");
  const [dashboardTasks, setDashboardTasks] = useState<Task[]>([]);
  const [dashboardStories, setDashboardStories] = useState<Story[]>([]);
  const [dashboardSprints, setDashboardSprints] = useState<Sprint[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardDataLoaded, setDashboardDataLoaded] = useState(false);

  // Filtered tasks based on selected project, sprint, and member
  const filteredTasks = useMemo(() => {
    return dashboardTasks.filter((task) => {
      const story = dashboardStories.find((s) => s.id === task.storyId);
      if (!story) {
        // If strict filtering is needed, we might exclude tasks without stories found in the current set
        // But if filtering by "all" we might want to be lenient.
        // For now, if we can't find the story, we can't filter by project/sprint accurately,
        // so we exclude it to be safe, or include if filters are "all"?
        // Let's assume strict filtering requires story to be present to know projectId/sprintId.
        return false;
      }

      const projectMatch = dashboardProject === "all" || story.projectId === dashboardProject;
      const sprintMatch = dashboardSprint === "all" || story.sprintId === dashboardSprint;
      const memberMatch = dashboardMember === "all" || task.assigneeId === dashboardMember;

      return projectMatch && sprintMatch && memberMatch;
    });
  }, [dashboardTasks, dashboardStories, dashboardProject, dashboardSprint, dashboardMember]);

  // Fetch dashboard data when tab is active
  useEffect(() => {
    if (activeView === "dashboard" && !dashboardDataLoaded && !dashboardLoading) {
      const fetchDashboardData = async () => {
        setDashboardLoading(true);
        try {
          // Fetch all tasks and stories for client-side filtering
          const [tasksRes, storiesRes, sprintsRes] = await Promise.all([
            taskApiService.getAllTasks(),
            storyApiService.getAllStories(),
            sprintApiService.getSprints()
          ]);

          const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : ((tasksRes.data as any)?.content || []);
          const stories = Array.isArray(storiesRes.data) ? storiesRes.data : ((storiesRes.data as any)?.content || []);
          const sprints = Array.isArray(sprintsRes.data) ? sprintsRes.data : ((sprintsRes.data as any)?.content || []);

          setDashboardTasks(tasks);
          setDashboardStories(stories);
          setDashboardSprints(sprints);
          setDashboardDataLoaded(true);
        } catch (error) {
          console.error("Failed to fetch dashboard data", error);
          toast.error("Failed to load dashboard data");
        } finally {
          setDashboardLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [activeView, dashboardDataLoaded, dashboardLoading]);

  const [isStoryDetailsOpen, setIsStoryDetailsOpen] = useState(false);

  const [selectedStoryForDetails, setSelectedStoryForDetails] =
    useState<Story | null>(null);

  const [storyAttachmentsList, setStoryAttachmentsList] = useState<any[]>([]);

  const [loadingAttachments, setLoadingAttachments] = useState(false);

  const [isSprintDetailsOpen, setIsSprintDetailsOpen] = useState(false);

  const [selectedSprintForDetails, setSelectedSprintForDetails] =
    useState<Sprint | null>(null);

  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);

  const [selectedTaskForDetails, setSelectedTaskForDetails] =
    useState<Task | null>(null);

  const [isIssueDetailsOpen, setIsIssueDetailsOpen] = useState(false);

  const [selectedIssueForDetails, setSelectedIssueForDetails] =
    useState<Issue | null>(null);

  const [issueDetailsTab, setIssueDetailsTab] = useState<
    "details" | "activities" | "subtasks" | "due-dates" | "linked-issues"
  >("details");

  const [parentStoryAttachments, setParentStoryAttachments] = useState<any[]>(
    [],
  );

  const [loadingParentStoryAttachments, setLoadingParentStoryAttachments] =
    useState(false);

  const [issueAttachments, setIssueAttachments] = useState<any[]>([]);

  const [loadingIssueAttachments, setLoadingIssueAttachments] = useState(false);

  // Board state

  const [selectedBoard, setSelectedBoard] = useState<string | null>(null); // null = default board

  // Workflow lanes state

  const [isLaneConfigModalOpen, setIsLaneConfigModalOpen] = useState(false);

  const [selectedLaneForEdit, setSelectedLaneForEdit] =
    useState<WorkflowLane | null>(null);

  const [laneCreationSource, setLaneCreationSource] = useState<
    "inprogress" | "qa" | null
  >(null);

  // Board dialogs

  const [isCreateBoardDialogOpen, setIsCreateBoardDialogOpen] = useState(false);

  const [newBoardName, setNewBoardName] = useState("");

  // Epics state and dialogs (local epics list for bottom section)

  const [projectEpics, setProjectEpics] = useState<any[]>([]);

  const [isEpicTemplateDialogOpen, setIsEpicTemplateDialogOpen] =
    useState(false);

  const [isAddEpicDialogOpen, setIsAddEpicDialogOpen] = useState(false);

  const [newEpic, setNewEpic] = useState({
    title: "",

    description: "",

    priority: "MEDIUM" as Priority,

    status: "PLANNING" as any,

    startDate: "",

    endDate: "",
  });

  // Effort logging state (JIRA-style: log on subtasks, tasks, and issues)

  const [isLogEffortDialogOpen, setIsLogEffortDialogOpen] = useState(false);

  const [selectedSubtaskForEffort, setSelectedSubtaskForEffort] =
    useState<Subtask | null>(null);

  const [selectedTaskForEffort, setSelectedTaskForEffort] =
    useState<Task | null>(null);

  const [selectedIssueForEffort, setSelectedIssueForEffort] =
    useState<Issue | null>(null);

  const [effortLog, setEffortLog] = useState({
    hours: 0,

    description: "",

    workDate: "",

    startTime: "",

    endTime: "",
  });

  // State for effort log attachments
  const [effortLogAttachments, setEffortLogAttachments] = useState<File[]>([]);

  // Task details modal state (JIRA-style)

  const [taskDetailsTab, setTaskDetailsTab] = useState<
    "details" | "activities" | "subtasks" | "due-dates" | "linked-issues"
  >("details");

  const [taskComment, setTaskComment] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // Scrum board search - filters tasks and issues by title or UUID (prefixed with T) or I))
  const [scrumBoardSearch, setScrumBoardSearch] = useState("");

  const [backlogFilter, setBacklogFilter] = useState("all");

  // Backlog page functionality state
  const [backlogStatusFilter, setBacklogStatusFilter] = useState("all");
  const [backlogPriorityFilter, setBacklogPriorityFilter] = useState("all");
  const [backlogAssigneeFilter, setBacklogAssigneeFilter] = useState("all");
  const [backlogSortBy, setBacklogSortBy] = useState("priority");
  const [backlogSortOrder, setBacklogSortOrder] = useState<"asc" | "desc">(
    "desc",
  );
  const [backlogStoriesWithTasks, setBacklogStoriesWithTasks] = useState<
    Array<Story & { tasks: Task[]; issues: Issue[] }>
  >([]);
  const [allBacklogStoriesWithTasks, setAllBacklogStoriesWithTasks] = useState<Array<Story & { tasks: Task[]; issues: Issue[] }>>([]);  // Unfiltered for stats
  const [backlogTasksLoading, setBacklogTasksLoading] = useState(false);
  const [expandedBacklogStories, setExpandedBacklogStories] = useState<
    Set<string>
  >(new Set());
  const [isBacklogEffortManagerOpen, setIsBacklogEffortManagerOpen] =
    useState(false);
  const [selectedBacklogTaskForEffort, setSelectedBacklogTaskForEffort] =
    useState<Task | null>(null);
  const [isBacklogTaskDialogOpen, setIsBacklogTaskDialogOpen] = useState(false);
  const [backlogTaskToView, setBacklogTaskToView] = useState<Task | null>(null);
  const [selectedBacklogTasks, setSelectedBacklogTasks] = useState<string[]>([]);
  const [isLoggingEffort, setIsLoggingEffort] = useState(false);

  // Edit Story Dialog State
  const [isEditStoryDialogOpen, setIsEditStoryDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editStoryForm, setEditStoryForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as Priority,
    storyPoints: 1,
    dueDate: "",
    assigneeId: "",
    sprintId: "",
    epicId: "",
    releaseId: "",
    acceptanceCriteria: "",
    labels: "",
  });

  const [unreadMentions, setUnreadMentions] = useState<Notification[]>([]);

  useEffect(() => {
    if (user?.id) {
      const fetchMentions = async () => {
        try {
          const res = await notificationApiService.getUnreadNotificationsByUserId(user.id);
          const allUnread = Array.isArray(res.data)
            ? res.data
            : ((res.data as any)?.data || (res.data as any)?.content || []);
          setUnreadMentions(allUnread.filter((n: any) => {
            const type = (n.type || '').toUpperCase();
            return type === 'MENTION' || type === 'TEAM_MENTION';
          }));
        } catch (err) {
          console.error("Failed to fetch unread mentions", err);
        }
      };

      fetchMentions();
      const interval = setInterval(fetchMentions, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Description editing state (added for inline editing in details dialogs)
  const [isEditingTaskDescription, setIsEditingTaskDescription] = useState(false);
  const [isEditingIssueDescription, setIsEditingIssueDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState("");

  // Role-based permissions - using effectiveRole for dynamic role switching

  // Role checks for different user types - using effectiveRole to support role switching
  const isManager = effectiveRole?.toUpperCase() === "MANAGER";
  const isQAManager = effectiveRole?.toUpperCase() === "QA_MANAGER";
  const isQADeveloper = effectiveRole?.toUpperCase() === "QA_DEVELOPER";
  const isAdmin = effectiveRole?.toUpperCase() === "ADMIN";
  const isMasterAdmin = effectiveRole?.toUpperCase() === "MASTER_ADMIN";
  const isRegularDeveloper = effectiveRole?.toUpperCase() === "DEVELOPER"; // Regular developer only (not QA Developer)

  // Master Admin has VIEW-ONLY access - can see everything like manager but cannot add/edit/log
  const isViewOnly = isMasterAdmin;

  // Check original user role for QA permissions (even when role is switched to developer_review)
  const isOriginalQAManager = user?.role?.toUpperCase() === "QA_MANAGER";
  const isOriginalQADeveloper = user?.role?.toUpperCase() === "QA_DEVELOPER";

  // QA Developers should be treated like developers but with extra permissions (view all, drag to Done)
  const isDeveloper = isRegularDeveloper || isQADeveloper;

  // Managers, QA (deprecated), and QA Managers can manage sprints, stories, and boards
  // Master Admin has view-only access, so excluded from management permissions
  const canManageSprintsAndStories =
    !isViewOnly && (
      isManager ||
      isQAManager ||
      effectiveRole?.toUpperCase() === "QA"
    );

  // Managers and QA Managers can create tasks (Master Admin cannot - view only)
  const canAddTasks = !isViewOnly && (isManager || isOriginalQAManager);

  // Managers, QA Managers, and QA Developers can create issues (Master Admin cannot - view only)
  const canAddIssues = !isViewOnly && (isManager || isQAManager || isQADeveloper || isOriginalQAManager || isOriginalQADeveloper);

  // Managers, QA (deprecated), and QA Managers can create boards (Master Admin cannot - view only)
  const canCreateBoards = canManageSprintsAndStories;

  // Master Admin cannot log effort (view only)
  const canLogEffort = !isViewOnly;
  // QA Manager and QA Developer CANNOT log effort on TASKS (only on issues)
  const canLogEffortOnTasks = !isViewOnly && !isQAManager && !isQADeveloper;
  // QA Manager and QA Developer can log effort on OTHER users' tasks (like managers)
  const canLogEffortForOthers = !isViewOnly && (canManageSprintsAndStories || isQADeveloper);

  // Master Admin cannot drag items (view only), but QA Developer and QA Manager can
  const canDragToDone = !isViewOnly && (isManager || isQAManager || isQADeveloper || isOriginalQAManager || isOriginalQADeveloper);

  // Master Admin CAN view all tasks and issues (like managers) - this is their primary access
  // QA Developer and QA Manager can see ALL tasks AND issues (like managers)
  // Regular Developer sees only their assigned tasks AND issues
  const canViewAllTasks = isMasterAdmin || canManageSprintsAndStories || isQADeveloper || isOriginalQAManager || isOriginalQADeveloper;
  const canViewAllIssues = isMasterAdmin || canManageSprintsAndStories || isQADeveloper || isOriginalQAManager || isOriginalQADeveloper;

  // All users can create subtasks (checked individually where needed)

  // New sprint form state

  const [newSprint, setNewSprint] = useState({
    name: "",

    goal: "",

    startDate: "",

    endDate: "",

    capacityHours: "",
  });

  // New story form state

  const [newStory, setNewStory] = useState({
    title: "",

    description: "",

    acceptanceCriteria: "",

    storyPoints: 0,

    priority: "MEDIUM" as Priority,

    epicId: "",

    releaseId: "",

    sprintId: selectedSprint || "", // Default to current sprint

    assigneeId: "",

    reporterId: "",

    dueDate: undefined as string | undefined,

    labels: [] as string[],
  });

  // Attachment state for new story

  const [storyAttachments, setStoryAttachments] = useState<File[]>([]);

  // State to control due date popover
  const [isDueDatePopoverOpen, setIsDueDatePopoverOpen] = useState(false);
  const [isIssueDueDatePopoverOpen, setIsIssueDueDatePopoverOpen] = useState(false);

  // State for lane deletion with migration
  const [laneMigrationDialogOpen, setLaneMigrationDialogOpen] = useState(false);
  const [laneToDelete, setLaneToDelete] = useState<string | null>(null);
  const [targetMigrationLane, setTargetMigrationLane] = useState<string>("");
  const [laneItemsCount, setLaneItemsCount] = useState<{ tasks: number; issues: number }>({ tasks: 0, issues: 0 });

  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  // Update sprint in newStory when selectedSprint changes

  useEffect(() => {
    if (selectedSprint && !newStory.sprintId) {
      setNewStory((prev) => ({ ...prev, sprintId: selectedSprint }));
    }
  }, [selectedSprint]);

  // Fetch attachments when story details dialog opens

  useEffect(() => {
    const fetchStoryAttachments = async () => {
      if (selectedStoryForDetails?.id && isStoryDetailsOpen) {
        setLoadingAttachments(true);

        try {
          const response = await attachmentApiService.getAttachmentsByEntity(
            "story",
            selectedStoryForDetails.id,
          );

          setStoryAttachmentsList(response.data || []);
        } catch (error) {
          console.error("Error fetching story attachments:", error);

          setStoryAttachmentsList([]);
        } finally {
          setLoadingAttachments(false);
        }
      } else {
        setStoryAttachmentsList([]);
      }
    };

    fetchStoryAttachments();
  }, [selectedStoryForDetails?.id, isStoryDetailsOpen]);

  // Fetch task logs when task details dialog opens
  useEffect(() => {
    const fetchTaskLogs = async () => {
      if (selectedTaskForDetails?.id && isTaskDetailsOpen) {
        setLoadingTaskLogs(true);
        try {
          const response = await timeEntryApiService.getTimeEntriesByTask(selectedTaskForDetails.id);
          const logs = Array.isArray(response.data)
            ? response.data
            : (Array.isArray(response) ? response : []);
          setTaskLogs(logs);
        } catch (error) {
          console.error("Error fetching task logs:", error);
          setTaskLogs([]);
        } finally {
          setLoadingTaskLogs(false);
        }
      } else {
        setTaskLogs([]);
      }
    };

    fetchTaskLogs();
  }, [selectedTaskForDetails?.id, isTaskDetailsOpen]);

  // Fetch issue logs when issue details dialog opens
  useEffect(() => {
    const fetchIssueLogs = async () => {
      if (selectedIssueForDetails?.id && isIssueDetailsOpen) {
        setLoadingIssueLogs(true);
        try {
          const response = await timeEntryApiService.getTimeEntriesByIssue(selectedIssueForDetails.id);
          const logs = Array.isArray(response.data)
            ? response.data
            : (Array.isArray(response) ? response : []);
          setIssueLogs(logs);
        } catch (error) {
          console.error("Error fetching issue logs:", error);
          setIssueLogs([]);
        } finally {
          setLoadingIssueLogs(false);
        }
      } else {
        setIssueLogs([]);
      }
    };

    fetchIssueLogs();
  }, [selectedIssueForDetails?.id, isIssueDetailsOpen]);

  // Fetch parent story attachments when task details dialog opens

  useEffect(() => {
    const fetchParentStoryAttachments = async () => {
      if (selectedTaskForDetails?.storyId && isTaskDetailsOpen) {
        setLoadingParentStoryAttachments(true);

        try {
          const response = await attachmentApiService.getAttachmentsByEntity(
            "story",
            selectedTaskForDetails.storyId,
          );

          setParentStoryAttachments(response.data || []);
        } catch (error) {
          console.error("Error fetching parent story attachments:", error);

          setParentStoryAttachments([]);
        } finally {
          setLoadingParentStoryAttachments(false);
        }
      } else if (selectedIssueForDetails?.storyId && isIssueDetailsOpen) {
        // Also fetch for issues

        setLoadingParentStoryAttachments(true);

        try {
          const response = await attachmentApiService.getAttachmentsByEntity(
            "story",
            selectedIssueForDetails.storyId,
          );

          setParentStoryAttachments(response.data || []);
        } catch (error) {
          console.error(
            "Error fetching parent story attachments for issue:",
            error,
          );

          setParentStoryAttachments([]);
        } finally {
          setLoadingParentStoryAttachments(false);
        }
      } else {
        setParentStoryAttachments([]);
      }
    };

    fetchParentStoryAttachments();
  }, [
    selectedTaskForDetails?.storyId,
    isTaskDetailsOpen,
    selectedIssueForDetails?.storyId,
    isIssueDetailsOpen,
  ]);

  // Fetch issue-specific attachments when viewing issue details

  useEffect(() => {
    const fetchIssueAttachments = async () => {
      if (selectedIssueForDetails?.id && isIssueDetailsOpen) {
        setLoadingIssueAttachments(true);

        try {
          const response = await attachmentApiService.getAttachmentsByEntity(
            "issue",
            selectedIssueForDetails.id,
          );

          setIssueAttachments(response.data || []);
        } catch (error) {
          console.error("Error fetching issue attachments:", error);

          setIssueAttachments([]);
        } finally {
          setLoadingIssueAttachments(false);
        }
      } else {
        setIssueAttachments([]);
      }
    };

    fetchIssueAttachments();
  }, [selectedIssueForDetails?.id, isIssueDetailsOpen]);

  // Fetch subtasks for the selected issue when viewing issue details

  useEffect(() => {
    const fetchIssueSubtasks = async () => {
      if (selectedIssueForDetails?.id && isIssueDetailsOpen) {
        try {
          const response = await subtaskApiService.getSubtasksByIssue(
            selectedIssueForDetails.id,
          );

          const fetchedSubtasks = response.data || [];

          if (fetchedSubtasks.length > 0) {
            setAllSubtasks((prev) => {
              // Remove any existing subtasks for this issue (in case of duplicates)

              const otherSubtasks = prev.filter(
                (st) => st.issueId !== selectedIssueForDetails.id,
              );

              return [...otherSubtasks, ...fetchedSubtasks];
            });
          }
        } catch (error) {
          console.error("Error fetching issue subtasks:", error);
        }
      }
    };

    fetchIssueSubtasks();
  }, [selectedIssueForDetails?.id, isIssueDetailsOpen]);

  // New task form state

  const [newTask, setNewTask] = useState({
    title: "",

    description: "",

    storyId: "",

    priority: "MEDIUM" as Priority,

    assigneeId: "",

    estimatedHours: 0,

    dueDate: "",
  });

  // New subtask form state

  const [newSubtask, setNewSubtask] = useState({
    title: "",

    description: "",

    taskId: "",

    assigneeId: "",

    estimatedHours: 0,

    category: "",

    dueDate: "",
  });

  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);

  // Fetch epics for selected project

  useEffect(() => {
    const fetchEpicsForProject = async () => {
      try {
        if (!selectedProject) {
          setProjectEpics([]);

          return;
        }

        const { epicApiService } = await import(
          "../services/api/entities/epicApi"
        );

        const res = await epicApiService.getEpicsByProject(selectedProject);

        // apiClient returns {data}, handle both shapes

        setProjectEpics((res as any).data ?? (Array.isArray(res) ? res : []));
      } catch (e) {
        console.error("Failed to fetch epics by project", e);

        setProjectEpics([]);
      }
    };

    fetchEpicsForProject();
  }, [selectedProject]);

  // API Hooks - Projects

  const { data: projectsData, loading: projectsLoading } = useProjects();
  const { data: apiSprints } = useAllSprints();

  const {
    project: currentProject,
    loading: projectLoading,
    refetch: refetchProject,
  } = useProjectById(selectedProject || "SKIP");

  // API Hooks - Boards

  const {
    data: boardsData,
    loading: boardsLoading,
    refetch: refetchBoards,
  } = useBoardsByProject(selectedProject || "SKIP");

  const createBoardFromDefaultMutation = useCreateBoardFromDefault();

  const deleteBoardMutation = useDeleteBoard();

  // API Hooks - Workflow Lanes

  const {
    data: workflowLanesData,
    loading: workflowLanesLoading,
    refetch: refetchWorkflowLanes,
  } = useWorkflowLanesByProject(selectedProject || "SKIP");

  const createWorkflowLaneMutation = useCreateWorkflowLane();

  const updateWorkflowLaneMutation = useUpdateWorkflowLane();

  const deleteWorkflowLaneMutation = useDeleteWorkflowLane();

  // Extract projects list

  const projects = projectsData || [];

  // Extract boards from API response

  const boards = useMemo(() => {
    return selectedProject
      ? Array.isArray(boardsData)
        ? boardsData
        : (boardsData as any)?.data || []
      : [];
  }, [selectedProject, boardsData]);

  // Check for project in URL query params or sessionStorage, then ensure a project is selected

  // Extract project ID from query params (as string) for stable dependency

  const projectFromQuery = searchParams.get("project");
  const sprintFromQuery = searchParams.get("sprint");

  useEffect(() => {
    // Only run if we have projects loaded and haven't initialized yet

    if (!projects || projects.length === 0 || projectInitializedRef.current) {
      return;
    }

    // First check URL query parameter

    if (projectFromQuery) {
      setSelectedProject(projectFromQuery);

      projectInitializedRef.current = true;

      // Clean up sessionStorage after using it

      try {
        sessionStorage.removeItem("openProjectId");
      } catch { }

      return;
    }

    // Fallback to sessionStorage

    try {
      const projectFromStorage = sessionStorage.getItem("openProjectId");

      if (projectFromStorage) {
        setSelectedProject(projectFromStorage);

        projectInitializedRef.current = true;

        sessionStorage.removeItem("openProjectId");

        return;
      }
    } catch { }

    // If no project specified anywhere, select first available project

    if (projects && projects.length > 0) {
      const firstProjectId = (projects[0] as any).id || "";

      if (firstProjectId) {
        setSelectedProject(firstProjectId);

        projectInitializedRef.current = true;
      }
    }
  }, [projects, projectFromQuery]);

  // Handle URL query parameter changes (when user navigates with ?project=)

  useEffect(() => {
    if (projectFromQuery && projectFromQuery !== selectedProject) {
      setSelectedProject(projectFromQuery);

      try {
        sessionStorage.removeItem("openProjectId");
      } catch { }
    }
  }, [projectFromQuery, selectedProject]);


  // API Hooks - Epics and Releases

  const { data: epicsData, loading: epicsLoading } = useEpics();

  const { data: releasesData, loading: releasesLoading } = useReleases();

  // Extract epics and releases for the selected project

  // Handle both array and object responses

  const epicsArray = Array.isArray(epicsData)
    ? epicsData
    : (epicsData as any)?.data || (epicsData as any)?.content || [];

  const releasesArray = Array.isArray(releasesData)
    ? releasesData
    : (releasesData as any)?.data || (releasesData as any)?.content || [];

  const epics = epicsArray.filter(
    (epic: any) => epic.projectId === selectedProject,
  );

  const releases = releasesArray.filter(
    (release: any) => release.projectId === selectedProject,
  );

  // API Hooks - Sprints (only fetch if project is selected)

  const {
    data: sprintsData,
    loading: sprintsLoading,
    refetch: refetchSprints,
  } = useSprintsByProject(selectedProject || "SKIP");

  const { data: burndownData, loading: burndownLoading } = useSprintBurndown(
    selectedSprint || "SKIP",
  );

  const { mutate: createSprintMutate, loading: createSprintLoading } =
    useCreateSprint();

  const { mutate: updateSprintMutate, loading: updateSprintLoading } =
    useUpdateSprint();

  const { mutate: updateSprintStatusMutate } = useUpdateSprintStatus();

  // API Hooks - Stories (only fetch if project/sprint is selected)

  const {
    data: sprintStoriesData,
    loading: sprintStoriesLoading,
    refetch: refetchSprintStories,
  } = useStoriesBySprint(selectedSprint || "SKIP");

  const {
    data: backlogStoriesData,
    loading: backlogStoriesLoading,
    refetch: refetchBacklogStories,
  } = useStoriesByProject(selectedProject || "SKIP");

  const { mutate: createStoryMutate, loading: createStoryLoading } =
    useCreateStory();

  const { mutate: updateStoryMutate } = useUpdateStory();

  const { mutate: updateStoryStatusMutate } = useUpdateStoryStatus();

  const { mutate: moveStoryToSprintMutate } = useMoveStoryToSprint();

  // API Hooks - Tasks

  const { mutate: createTaskMutate, loading: createTaskLoading } =
    useCreateTask();

  const { mutate: createIssueMutate, loading: createIssueLoading } =
    useCreateIssue();

  const { mutate: updateTaskMutate } = useUpdateTask();

  const { mutate: updateTaskStatusMutate } = useUpdateTaskStatus();

  const { mutate: updateIssueStatusMutate } = useUpdateIssueStatus();

  const { mutate: updateIssueMutate } = useUpdateIssue();

  // Fetch all tasks for all stories in the current sprint

  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const [tasksLoading, setTasksLoading] = useState(false);

  // Fetch all issues for all stories in the current sprint

  const [allIssues, setAllIssues] = useState<Issue[]>([]);

  const [issuesLoading, setIssuesLoading] = useState(false);

  // Handle taskId and issueId from query params (Deep linking)
  useEffect(() => {
    const taskId = searchParams.get("taskId");
    const issueId = searchParams.get("issueId");

    if (taskId && allTasks.length > 0) {
      const task = allTasks.find((t) => t.id === taskId);
      if (task && (!selectedTaskForDetails || selectedTaskForDetails.id !== taskId)) {
        setSelectedTaskForDetails(task);
        setIsTaskDetailsOpen(true);
      }
    }

    if (issueId && allIssues.length > 0) {
      const issue = allIssues.find((i) => i.id === issueId);
      if (issue && (!selectedIssueForDetails || selectedIssueForDetails.id !== issueId)) {
        setSelectedIssueForDetails(issue);
        setIsIssueDetailsOpen(true);
      }
    }
  }, [searchParams, allTasks, allIssues, selectedTaskForDetails, selectedIssueForDetails]);

  // State for all subtasks

  const [allSubtasks, setAllSubtasks] = useState<Subtask[]>([]);

  // Use ref to track previous task IDs to prevent infinite loops

  const previousTaskIdsRef = useRef<string>("");

  // Use ref to track previous issue IDs to prevent infinite loops

  const previousIssueIdsRef = useRef<string>("");

  // Fetch subtasks when tasks change

  useEffect(() => {
    // Create a stable string representation of task IDs for comparison

    const currentTaskIds = allTasks
      .map((task) => task.id)
      .sort()
      .join(",");

    // Only fetch if task IDs actually changed

    if (currentTaskIds === previousTaskIdsRef.current) {
      return;
    }

    // Update ref before async operation

    previousTaskIdsRef.current = currentTaskIds;

    const fetchSubtasks = async () => {
      if (allTasks.length === 0) {
        // Don't clear allSubtasks here, as issues might have subtasks too

        return;
      }

      try {
        const subtasksPromises = allTasks.map((task) =>
          subtaskApiService
            .getSubtasksByTask(task.id)

            .then((response) => response.data)

            .catch((error) => {
              console.error(
                `Error fetching subtasks for task ${task.id}:`,
                error,
              );

              return [];
            }),
        );

        const subtasksArrays = await Promise.all(subtasksPromises);

        const taskSubtasks = subtasksArrays.flat();

        // Merge with existing subtasks (preserve issue subtasks)

        setAllSubtasks((prev) => {
          const issueSubtasks = prev.filter((st) => st.issueId);

          return [...issueSubtasks, ...taskSubtasks];
        });
      } catch (error) {
        console.error("Error fetching subtasks:", error);
      }
    };

    fetchSubtasks();
  }, [allTasks]);

  // Fetch subtasks when issues change

  useEffect(() => {
    // Create a stable string representation of issue IDs for comparison

    const currentIssueIds = allIssues
      .map((issue) => issue.id)
      .sort()
      .join(",");

    // Only fetch if issue IDs actually changed

    if (currentIssueIds === previousIssueIdsRef.current) {
      return;
    }

    // Update ref before async operation

    previousIssueIdsRef.current = currentIssueIds;

    const fetchSubtasks = async () => {
      if (allIssues.length === 0) {
        // Don't clear allSubtasks here, as tasks might have subtasks too

        return;
      }

      try {
        const subtasksPromises = allIssues.map((issue) =>
          subtaskApiService
            .getSubtasksByIssue(issue.id)

            .then((response) => response.data)

            .catch((error) => {
              console.error(
                `Error fetching subtasks for issue ${issue.id}:`,
                error,
              );

              return [];
            }),
        );

        const subtasksArrays = await Promise.all(subtasksPromises);

        const issueSubtasks = subtasksArrays.flat();

        // Merge with existing subtasks (preserve task subtasks)

        setAllSubtasks((prev) => {
          const taskSubtasks = prev.filter((st) => st.taskId);

          return [...taskSubtasks, ...issueSubtasks];
        });
      } catch (error) {
        console.error("Error fetching issue subtasks:", error);
      }
    };

    fetchSubtasks();
  }, [allIssues]);

  // Handlers for Description Editing
  const handleSaveTaskDescription = async () => {
    if (!selectedTaskForDetails) return;
    try {
      // Sanitize ID in case it comes from a Draggable with index suffix (e.g. TASK...:0)
      const cleanId = selectedTaskForDetails.id.split(':')[0];

      // Map UI status to Backend valid Enum (names)
      // The backend expects: TO_DO, IN_PROGRESS, QA_REVIEW, DONE, BLOCKED, CANCELLED
      const statusMap: Record<string, string> = {
        'todo': 'TO_DO',
        'to_do': 'TO_DO',
        'inprogress': 'IN_PROGRESS',
        'in_progress': 'IN_PROGRESS',
        'qa': 'QA_REVIEW',
        'qa_review': 'QA_REVIEW',
        'done': 'DONE',
        'blocked': 'BLOCKED',
        'cancelled': 'CANCELLED'
      };

      const currentStatus = (selectedTaskForDetails.status || '').toLowerCase();
      const validStatus = (statusMap[currentStatus] || selectedTaskForDetails.status.toUpperCase()) as any;

      // Priority mapping: LOW, MEDIUM, HIGH, CRITICAL
      const validPriority = (selectedTaskForDetails.priority || 'MEDIUM').toUpperCase() as any;

      // Ensure we send the full object as required by the backend PUT validation
      const updatedTask = {
        ...selectedTaskForDetails,
        id: cleanId,
        description: tempDescription,
        status: validStatus,
        priority: validPriority
      };

      await taskApiService.updateTask(cleanId, updatedTask as any);

      // Update local state
      setSelectedTaskForDetails(prev => prev ? { ...prev, description: tempDescription } : prev);
      setAllTasks(prev => prev.map(t => t.id === selectedTaskForDetails.id ? { ...t, description: tempDescription } : t));

      setIsEditingTaskDescription(false);
      toast.success("Description updated successfully");
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error("Failed to update description");
    }
  };

  const handleSaveIssueDescription = async () => {
    if (!selectedIssueForDetails) return;
    try {
      // Sanitize ID in case it comes from a Draggable with index suffix
      const cleanId = selectedIssueForDetails.id.split(':')[0];

      // Map UI status to Backend valid Enum (names)
      // The backend Issue entity uses TaskStatus enum: TO_DO, IN_PROGRESS, QA_REVIEW, DONE, BLOCKED, CANCELLED
      const statusMap: Record<string, string> = {
        'todo': 'TO_DO',
        'to_do': 'TO_DO',
        'inprogress': 'IN_PROGRESS',
        'in_progress': 'IN_PROGRESS',
        'qa': 'QA_REVIEW',
        'qa_review': 'QA_REVIEW',
        'done': 'DONE',
        'blocked': 'BLOCKED',
        'cancelled': 'CANCELLED'
      };

      const currentStatus = (selectedIssueForDetails.status || '').toLowerCase();
      const validStatus = (statusMap[currentStatus] || selectedIssueForDetails.status.toUpperCase()) as any;

      // Priority mapping: LOW, MEDIUM, HIGH, CRITICAL
      const validPriority = (selectedIssueForDetails.priority || 'MEDIUM').toUpperCase() as any;

      // Ensure we send the full object as required by the backend PUT validation
      const updatedIssue = {
        ...selectedIssueForDetails,
        id: cleanId,
        description: tempDescription,
        status: validStatus,
        priority: validPriority
      };

      await issueApiService.updateIssue(cleanId, updatedIssue as any);

      // Update local state
      setSelectedIssueForDetails(prev => prev ? { ...prev, description: tempDescription } : prev);
      setAllIssues(prev => prev.map(i => i.id === selectedIssueForDetails.id ? { ...i, description: tempDescription } : i));

      setIsEditingIssueDescription(false);
      toast.success("Description updated successfully");
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error("Failed to update description");
    }
  };

  // User data for displaying names instead of IDs

  const [users, setUsers] = useState<any[]>([]);

  const [usersLoading, setUsersLoading] = useState(false);

  // Project team members for filtering assignees
  const [projectTeamMembers, setProjectTeamMembers] = useState<any[]>([]);
  const [projectTeamMembersLoading, setProjectTeamMembersLoading] = useState(false);

  // Function to fetch all tasks for all stories in the sprint

  // Use ref to track if we're currently fetching to prevent duplicate calls

  const isFetchingTasksRef = useRef(false);

  const fetchAllTasks = useCallback(
    async (stories: Story[], includeBacklog: boolean = false) => {
      // Prevent concurrent fetches

      if (isFetchingTasksRef.current) {
        return;
      }

      if (!selectedProject || (!selectedSprint && !includeBacklog)) {
        setAllTasks([]);

        return;
      }

      isFetchingTasksRef.current = true;

      setTasksLoading(true);

      try {
        const token =
          localStorage.getItem("authToken") ||
          "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJkb21haW4iOiJET01OMDAwMDAwMDAwMDAwMSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZGVwYXJ0bWVudCI6IkRFUFQwMDAwMDAwMDAwMDEiLCJ1c2VySWQiOiJVU0VSMDAwMDAwMDAwMDAxIiwic3ViIjoiYWRtaW5Ac3ByaW50c3luYy5jb20iLCJpYXQiOjE3NTk3NDg0NjUsImV4cCI6MTc1OTgzNDg2NX0.QdwUhiS_AvtqzTefTe14N7TKWB1jzrQg01Sz_lNOGBleAPqfVAgTHf97-JmCUQKZyXtAqkhYD-HN3YAMDywxRg";

        // Get backlog stories for the current project

        const currentBacklogStories = selectedProject
          ? (Array.isArray(backlogStoriesData)
            ? backlogStoriesData
            : (backlogStoriesData as any)?.data || []
          ).filter((s: Story) => s.status === "BACKLOG")
          : [];

        // Get all stories to fetch tasks from (sprint stories + backlog stories)

        const allStoriesToFetch = includeBacklog
          ? [...stories, ...currentBacklogStories]
          : stories;

        if (allStoriesToFetch.length === 0) {
          setAllTasks([]);

          return;
        }

        const taskPromises = allStoriesToFetch.map(async (story: Story) => {
          try {
            const response = await fetch(
              `${API_CONFIG.BASE_URL}/tasks/story/${story.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,

                  "Content-Type": "application/json",
                },
              },
            );

            if (response.ok) {
              const data = await response.json();

              const tasks = Array.isArray(data) ? data : (data as any)?.data || [];

              return tasks;
            }

            return [];
          } catch (error) {
            console.error(`Error fetching tasks for story ${story.id}:`, error);

            return [];
          }
        });

        const taskArrays = await Promise.all(taskPromises);

        let allTasksFlat = taskArrays.flat();

        // Fetch issues for all stories

        const issuePromises = allStoriesToFetch.map(async (story: Story) => {
          try {
            const response = await fetch(
              `${API_CONFIG.BASE_URL}/issues/story/${story.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,

                  "Content-Type": "application/json",
                },
              },
            );

            if (response.ok) {
              const data = await response.json();

              const issues = Array.isArray(data) ? data : (data as any)?.data || [];

              return issues;
            }

            return [];
          } catch (error) {
            console.error(
              `Error fetching issues for story ${story.id}:`,
              error,
            );

            return [];
          }
        });

        const issueArrays = await Promise.all(issuePromises);

        let allIssuesFlat = issueArrays.flat();

        // Role-based filtering for ISSUES:
        // - Managers/QA Managers see all issues
        // - QA Developer sees ONLY their assigned issues (like regular developer)
        // - Developer sees only their assigned issues

        if (!canViewAllIssues && user) {
          allIssuesFlat = allIssuesFlat.filter(
            (issue) => issue.assigneeId === user.id,
          );

          console.log(
            `Filtered issues for user ${user.name}: showing ${allIssuesFlat.length} assigned issues`,
          );
        }

        // Role-based filtering for TASKS:
        // - Managers/QA Managers see all tasks
        // - QA Developer sees ALL tasks (different from regular developer)
        // - Developer sees only their assigned tasks

        if (!canViewAllTasks && user) {
          allTasksFlat = allTasksFlat.filter(
            (task) => task.assigneeId === user.id,
          );

          console.log(
            `Filtered tasks for user ${user.name}: showing ${allTasksFlat.length} assigned tasks`,
          );
        }

        console.log(
          `Fetched ${allTasksFlat.length} tasks and ${allIssuesFlat.length} issues from ${allStoriesToFetch.length} stories`,
        );

        setAllTasks(allTasksFlat);

        setAllIssues(allIssuesFlat);

        setIssuesLoading(false);
      } catch (error) {
        console.error("Error fetching tasks and issues:", error);

        setAllTasks([]);

        setAllIssues([]);

        setIssuesLoading(false);
      } finally {
        setTasksLoading(false);

        isFetchingTasksRef.current = false;
      }
    },
    [
      selectedSprint,
      selectedProject,
      canViewAllTasks,
      canViewAllIssues,
      user,
      backlogStoriesData,
    ],
  );

  const [storiesScope, setStoriesScope] = useState<
    "sprint" | "backlog" | "all" | "custom"
  >("sprint");
  const [isPullStoriesDialogOpen, setIsPullStoriesDialogOpen] = useState(false);
  const [selectedBacklogStoryIds, setSelectedBacklogStoryIds] = useState<
    string[]
  >([]);
  const [pendingBacklogStoryIds, setPendingBacklogStoryIds] = useState<
    string[]
  >([]);

  const handlePullStories = useCallback(
    async (scope: "sprint" | "backlog" | "all") => {
      if (!selectedProject) {
        toast.error("Select a project before pulling stories.");

        return;
      }

      if ((scope === "sprint" || scope === "all") && !selectedSprint) {
        toast.error("Select a sprint before pulling sprint stories.");

        return;
      }

      try {
        const actions: Promise<unknown>[] = [];

        if (scope === "sprint" || scope === "all") {
          actions.push(refetchSprintStories());
        }

        if (scope === "backlog" || scope === "all") {
          actions.push(refetchBacklogStories());
        }

        if (actions.length === 0) {
          return;
        }

        await Promise.all(actions);

        setStoriesScope(scope);
        setSelectedBacklogStoryIds([]);
        setPendingBacklogStoryIds([]);

        const scopeLabel =
          scope === "all"
            ? "Sprint and backlog stories"
            : scope === "sprint"
              ? "Sprint stories"
              : "Backlog stories";

        toast.success(`${scopeLabel} pulled successfully.`);
      } catch (error) {
        console.error("Error pulling stories:", error);

        toast.error("Failed to pull stories. Please try again.");
      }
    },
    [
      selectedProject,
      selectedSprint,
      refetchSprintStories,
      refetchBacklogStories,
    ],
  );

  // Function to fetch users for displaying names

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);

    try {
      const token =
        localStorage.getItem("authToken") ||
        "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJkb21haW4iOiJET01OMDAwMDAwMDAwMDAwMSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZGVwYXJ0bWVudCI6IkRFUFQwMDAwMDAwMDAwMDEiLCJ1c2VySWQiOiJVU0VSMDAwMDAwMDAwMDAxIiwic3ViIjoiYWRtaW5Ac3ByaW50c3luYy5jb20iLCJpYXQiOjE3NTk3NDg0NjUsImV4cCI6MTc1OTgzNDg2NX0.QdwUhiS_AvtqzTefTe14N7TKWB1jzrQg01Sz_lNOGBleAPqfVAgTHf97-JmCUQKZyXtAqkhYD-HN3YAMDywxRg";

      // Use /api/users/all to get all users without pagination
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Handle different response formats
        let usersArray: any[] = [];

        if (Array.isArray(data)) {
          // Direct array response
          usersArray = data;
        } else if (data?.content && Array.isArray(data.content)) {
          // Page response with content array
          usersArray = data.content;
        } else if (data?.data && Array.isArray(data.data)) {
          // Wrapped response
          usersArray = data.data;
        } else if (data && typeof data === 'object') {
          // Single object, wrap in array
          usersArray = [data];
        }

        console.log(`[fetchUsers] Fetched ${usersArray.length} users. Sample user:`,
          usersArray.length > 0 ? {
            id: usersArray[0].id,
            name: usersArray[0].name,
            email: usersArray[0].email
          } : 'No users found'
        );

        setUsers(usersArray);
      } else {
        console.error(`[fetchUsers] Failed to fetch users: ${response.status} ${response.statusText}`);
        // Try fallback to paginated endpoint with large page size
        const fallbackResponse = await fetch(`${API_CONFIG.BASE_URL}/users?page=0&size=1000`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const usersArray = Array.isArray(fallbackData)
            ? fallbackData
            : fallbackData?.content || fallbackData?.data || [];
          console.log(`[fetchUsers] Fetched ${usersArray.length} users via fallback endpoint`);
          setUsers(usersArray);
        }
      }
    } catch (error) {
      console.error("[fetchUsers] Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Fetch users on mount
  useEffect(() => {
    console.log("[useEffect] Component mounted, fetching users...");
    fetchUsers();
  }, []); // Only run on mount

  // Also refetch if users array becomes empty (e.g., after an error)
  useEffect(() => {
    if (users.length === 0 && !usersLoading) {
      console.log("[useEffect] Users array is empty, refetching...");
      fetchUsers();
    }
  }, [users.length, usersLoading, fetchUsers]);

  // Function to fetch project team members
  const fetchProjectTeamMembers = useCallback(async () => {
    if (!selectedProject) {
      setProjectTeamMembers([]);
      return;
    }

    setProjectTeamMembersLoading(true);
    try {
      const { teamMemberApi } = await import("../services/api/entities/teamMemberApi");
      const members = await teamMemberApi.getTeamMembersByProject(selectedProject);
      setProjectTeamMembers(members || []);
    } catch (error) {
      console.error("Error fetching project team members:", error);
      setProjectTeamMembers([]);
    } finally {
      setProjectTeamMembersLoading(false);
    }
  }, [selectedProject]);

  // Fetch project team members when project changes
  useEffect(() => {
    fetchProjectTeamMembers();
  }, [fetchProjectTeamMembers]);

  // Filter users to only show project team members for assignee/reporter selects
  const availableUsersForAssignment = useMemo(() => {
    if (!selectedProject || projectTeamMembers.length === 0) {
      return users; // Fall back to all users if no project selected or no team members
    }

    // Map team members to user IDs
    const teamMemberUserIds = new Set(
      projectTeamMembers.map(member => member.userId || member.id)
    );

    // Filter users to only include those in the project team
    return users.filter(user => teamMemberUserIds.has(user.id));
  }, [selectedProject, projectTeamMembers, users]);

  // Extract data from API responses (only use data if valid project/sprint selected)

  // Note: useApi hook returns data directly (not wrapped in .data property)

  // Memoize arrays to prevent infinite loops from new references on every render

  const sprints = useMemo(() => {
    const sprintsArray = selectedProject
      ? Array.isArray(sprintsData)
        ? sprintsData
        : (sprintsData as any)?.data || []
      : [];

    // Sort sprints by startDate in descending order (newest first)
    return sprintsArray.sort((a: any, b: any) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    });
  }, [selectedProject, sprintsData]);

  const currentSprint = useMemo(() => {
    if (!selectedSprint || !selectedProject) return undefined;

    const sprint = sprints.find((s: Sprint) => s.id === selectedSprint);

    // Validate that the sprint belongs to the selected project

    if (sprint && sprint.projectId !== selectedProject) {
      console.warn(
        `Sprint ${sprint.id} does not belong to project ${selectedProject}`,
      );

      return undefined;
    }

    return sprint;
  }, [sprints, selectedSprint, selectedProject]);

  // Check if sprint has ended
  const isSprintEnded = useMemo(() => {
    if (!currentSprint || !currentSprint.endDate) {
      return false;
    }

    const endDate = new Date(currentSprint.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    endDate.setHours(0, 0, 0, 0);

    return endDate < today;
  }, [currentSprint]);

  const sprintStories = useMemo(() => {
    // If no sprint is selected or no sprint exists for the project, return empty array

    if (!selectedSprint || !selectedProject || !currentSprint) {
      return [];
    }

    // Get stories from the API response

    const stories = Array.isArray(sprintStoriesData)
      ? sprintStoriesData
      : (sprintStoriesData as any)?.data || [];

    // Filter stories to ensure they belong to the selected project's sprint

    // Additional validation: ensure story's projectId matches selected project

    // Filter stories - trust the API that useStoriesBySprint returns correct stories
    // Only filter by project, not by sprintId (API should handle sprint filtering)
    // This prevents issues where sprintId might be null or not yet updated in the response
    let filteredStories = stories.filter((story: Story) => {
      // Ensure story belongs to the selected project
      if (story.projectId !== selectedProject) {
        console.warn(
          `Story ${story.id} does not belong to project ${selectedProject}`,
        );
        return false;
      }

      // If sprintId is set, it should match - but don't filter out if it's null/undefined
      // The API endpoint /stories/sprint/{sprintId} should only return stories for that sprint
      if (story.sprintId && story.sprintId !== selectedSprint) {
        // Log as debug info, not warning - this can happen during data synchronization
        console.debug(
          `Story ${story.id} has sprintId ${story.sprintId} but API returned it for sprint ${selectedSprint}. Including it as API is authoritative.`,
        );
        // Don't filter out - trust the API. The sprintId might not be updated yet in the response
        // but the story is in the sprint according to the backend. We'll verify and fix if needed.
      }

      return true;
    });

    // Don't filter stories here based on allTasks - that creates a timing issue
    // Stories will be filtered for display after tasks are fetched
    return filteredStories;
  }, [selectedSprint, selectedProject, sprintStoriesData, currentSprint]);

  // Filter sprint stories for display (after tasks are loaded)
  const filteredSprintStories = useMemo(() => {
    if (!sprintStories || sprintStories.length === 0) {
      return [];
    }

    // Role-based filtering: Non-managers/admins see only stories with tasks or issues assigned to them
    // QA Developer can see ALL stories (has canViewAllTasks = true)
    if (!canViewAllTasks && user) {
      // Filter stories to show only those that have at least one task or issue assigned to the current user
      const filtered = sprintStories.filter((story: Story) => {
        // Check if this story has any tasks assigned to the current user
        const hasUserTask = allTasks.some(
          (task) => task.storyId === story.id && task.assigneeId === user.id
        );

        // Check if this story has any issues assigned to the current user
        const hasUserIssue = allIssues.some(
          (issue) => issue.storyId === story.id && issue.assigneeId === user.id
        );

        return hasUserTask || hasUserIssue;
      });

      console.log(
        `Filtered sprint stories for user ${user.name}: showing ${filtered.length} stories with assigned tasks/issues out of ${sprintStories.length} total`
      );

      return filtered;
    }

    // Managers/admins/QA Developers see all stories
    return sprintStories;
  }, [sprintStories, allTasks, canViewAllTasks, user]);

  const backlogStories = useMemo(() => {
    if (!selectedProject) return [];

    const stories = Array.isArray(backlogStoriesData)
      ? backlogStoriesData
      : (backlogStoriesData as any)?.data || [];

    // Filter stories to ensure they belong to the selected project
    // Show ALL stories for the project (like BacklogPage does), not just those with status 'BACKLOG'

    return stories.filter((s: Story) => {
      // Ensure story belongs to the selected project

      if (s.projectId !== selectedProject) {
        console.warn(
          `Story ${s.id} does not belong to project ${selectedProject}`,
        );

        return false;
      }

      // Return all stories for the project (not filtering by status)

      return true;
    });
  }, [selectedProject, backlogStoriesData]);


  // Workflow lanes - filter by selected board and separate into lanes after In Progress and lanes after QA

  const workflowLanes = useMemo(() => {
    const allLanes = selectedProject
      ? Array.isArray(workflowLanesData)
        ? workflowLanesData
        : (workflowLanesData as any)?.data || []
      : [];

    // Filter lanes by selected board (null = default board, which has boardId === null)

    const filteredLanes = allLanes.filter((lane) => {
      if (selectedBoard === null) {
        // Default board: show lanes with boardId === null or undefined

        return !lane.boardId;
      } else {
        // Specific board: show lanes with matching boardId

        return lane.boardId === selectedBoard;
      }
    });

    const sortedLanes = [...filteredLanes].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
    );

    return sortedLanes;
  }, [selectedProject, workflowLanesData, selectedBoard]);

  // Calculate custom lanes count separately

  const customLanesCount = useMemo(() => {
    const defaultOrders = [1, 2, 3, 4, 10, 20, 30, 40];

    const customLanes = workflowLanes.filter((lane) => {
      const order = lane.displayOrder || 0;

      return !defaultOrders.includes(order);
    });

    return customLanes.length;
  }, [workflowLanes]);

  // Separate lanes into those after In Progress and those after QA

  const lanesAfterInProgress = useMemo(() => {
    const defaultOrders = [1, 2, 3, 4, 10, 20, 30, 40];

    const allCustomLanes = workflowLanes.filter((lane) => {
      const order = lane.displayOrder || 0;

      return !defaultOrders.includes(order);
    });

    const filtered = allCustomLanes.filter((lane) => {
      const order = lane.displayOrder || 0;

      return (order > 20 && order < 30) || (order > 2 && order < 3);
    });

    filtered.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return filtered;
  }, [workflowLanes]);

  const lanesAfterQA = useMemo(() => {
    const defaultOrders = [1, 2, 3, 4, 10, 20, 30, 40];

    const allCustomLanes = workflowLanes.filter((lane) => {
      const order = lane.displayOrder || 0;

      return !defaultOrders.includes(order);
    });

    const filtered = allCustomLanes.filter((lane) => {
      const order = lane.displayOrder || 0;

      return (order > 30 && order < 40) || (order > 3 && order < 4);
    });

    filtered.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return filtered;
  }, [workflowLanes]);

  // Log lane count information

  useEffect(() => {
    console.log("=== WORKFLOW LANES COUNT ===");

    console.log("Total lanes fetched:", workflowLanes.length);

    console.log("Custom lanes created:", customLanesCount);

    console.log("Lanes after In Progress:", lanesAfterInProgress.length);

    console.log("Lanes after QA:", lanesAfterQA.length);

    console.log("=== DETAILED LANE INFORMATION ===");

    console.log("Selected Project:", selectedProject);

    console.log(
      "All Lanes:",
      workflowLanes.map((l) => ({
        id: l.id,

        title: l.title,

        color: l.color,

        displayOrder: l.displayOrder,

        statusValue: l.statusValue,
      })),
    );

    console.log(
      `✓ Lanes After In Progress: ${lanesAfterInProgress.length} lane(s)`,
    );

    lanesAfterInProgress.forEach((lane, idx) => {
      console.log(`  ${idx + 1}. ${lane.title} (Order: ${lane.displayOrder})`);
    });

    console.log(`✓ Lanes After QA: ${lanesAfterQA.length} lane(s)`);

    lanesAfterQA.forEach((lane, idx) => {
      console.log(`  ${idx + 1}. ${lane.title} (Order: ${lane.displayOrder})`);
    });
  }, [
    workflowLanes.length,
    customLanesCount,
    lanesAfterInProgress.length,
    lanesAfterQA.length,
    selectedProject,
  ]);

  // Debug logging (removed excessive dependencies that cause re-renders)

  // Only log when key data actually changes, not on every render

  useEffect(() => {
    console.log("=== SCRUM PAGE DEBUG ===");

    console.log("Selected Project:", selectedProject);

    console.log("Sprints Count:", sprints.length);

    console.log("Selected Sprint:", selectedSprint);

    console.log("Sprint Stories Count:", sprintStories.length);

    console.log("All Tasks Count:", allTasks.length);

    if (sprints.length > 0) {
      console.log("✅ Sprints loaded successfully!");
    } else if (selectedProject && !sprintsLoading) {
      console.log("⚠️ No sprints found for project:", selectedProject);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, selectedSprint]); // Reduced dependencies to prevent excessive re-renders

  // Fetch tasks when sprint stories change

  // Use a ref to track previous story IDs to prevent infinite loops

  const previousStoryIdsRef = useRef<string>("");

  useEffect(() => {
    // Only fetch if we have a selected sprint and project
    if (!selectedSprint || !selectedProject) {
      setAllTasks([]);
      return;
    }

    // Create a stable string representation of story IDs for comparison
    const currentStoryIds = sprintStories
      .map((story: Story) => story.id)
      .sort()
      .join(",");

    // Only fetch if story IDs actually changed
    if (currentStoryIds === previousStoryIdsRef.current && currentStoryIds !== "") {
      return;
    }

    // Update ref before async operation
    previousStoryIdsRef.current = currentStoryIds;

    // Filter stories by project - trust the API that useStoriesBySprint returns correct stories
    // Don't filter by sprintId too strictly - the API should handle that
    const validSprintStories = sprintStories.filter(
      (story: Story) => story.projectId === selectedProject
    );

    // Only fetch if we have valid stories
    if (validSprintStories.length > 0) {
      console.log(`Fetching tasks for ${validSprintStories.length} stories in sprint ${selectedSprint} (project ${selectedProject})`);
      fetchAllTasks(validSprintStories, false); // Don't include backlog stories here
    } else if (sprintStories.length === 0 && backlogStories.length > 0) {
      // If no sprint stories but we have backlog stories, fetch those
      fetchAllTasks(backlogStories, true);
    } else {
      // Clear tasks if no stories
      setAllTasks([]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSprint, selectedProject, sprintStories, backlogStories]); // Depend on sprint/project and stories

  // Fetch users when component mounts

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Add window focus/visibility change listener to refresh tasks when user returns to the page
  // This ensures tasks are visible after tab change or refresh

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Refresh tasks when tab becomes visible (user returns to the page)
      if (document.visibilityState === 'visible') {
        if (
          selectedProject &&
          selectedSprint &&
          (sprintStories.length > 0 || backlogStories.length > 0)
        ) {
          console.log("Tab became visible - refreshing tasks for sprint", selectedSprint);

          // Filter stories by project (trust API for sprint filtering)
          const validStories = sprintStories.filter(
            (story: Story) => story.projectId === selectedProject
          );

          if (validStories.length > 0) {
            fetchAllTasks(validStories, false);
          } else if (backlogStories.length > 0) {
            fetchAllTasks(backlogStories, true);
          }
        }
      }
    };

    const handleFocus = () => {
      // Also refresh on window focus
      if (
        selectedProject &&
        selectedSprint &&
        (sprintStories.length > 0 || backlogStories.length > 0)
      ) {
        console.log("Window focused - refreshing tasks for sprint", selectedSprint);

        const validStories = sprintStories.filter(
          (story: Story) => story.projectId === selectedProject
        );

        if (validStories.length > 0) {
          fetchAllTasks(validStories, false);
        } else if (backlogStories.length > 0) {
          fetchAllTasks(backlogStories, true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [selectedProject, selectedSprint, sprintStories, backlogStories, fetchAllTasks]);

  // Also refresh tasks periodically (every 30 seconds) to catch external changes

  useEffect(() => {
    if (
      !selectedProject ||
      !selectedSprint ||
      (sprintStories.length === 0 && backlogStories.length === 0)
    ) {
      return;
    }

    const interval = setInterval(() => {
      console.log("Periodic task refresh for sprint", selectedSprint);

      // Filter stories by project (trust API for sprint filtering)
      const validStories = sprintStories.filter(
        (story: Story) => story.projectId === selectedProject
      );

      if (validStories.length > 0) {
        fetchAllTasks(validStories, false);
      } else if (backlogStories.length > 0) {
        fetchAllTasks(backlogStories, true);
      }
    }, 1110000); // Refresh every 1110 seconds (18.5 minutes)

    return () => clearInterval(interval);
  }, [selectedProject, selectedSprint, sprintStories, backlogStories, fetchAllTasks]);

  // Set initial project selection - Auto-select first ACTIVE project

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      // Find all ACTIVE projects first (case-insensitive)

      const activeProjects = projects.filter(
        (p) =>
          p.status?.toUpperCase() === "ACTIVE" ||
          p.status?.toLowerCase() === "active",
      );

      console.log(
        "📊 Available projects:",
        projects.map((p) => `${p.name} (${p.status})`),
      );

      console.log("✅ Active projects found:", activeProjects.length);

      // Select the first ACTIVE project, or fall back to first project

      const projectToSelect =
        activeProjects.length > 0 ? activeProjects[0] : projects[0];

      if (projectToSelect) {
        console.log(
          "🎯 Auto-selecting project:",
          projectToSelect.name,
          `(${projectToSelect.status})`,
        );

        setSelectedProject(projectToSelect.id);
      }
    }
  }, [projects, selectedProject]);

  // Reset sprint when project changes

  useEffect(() => {
    if (selectedProject) {
      // Clear sprint selection when project changes

      setSelectedSprint("");
    }
  }, [selectedProject]);

  // Set initial sprint selection - Auto-select first ACTIVE sprint

  useEffect(() => {
    if (sprints.length > 0 && !selectedSprint && selectedProject) {
      // Prioritize sprint from query
      if (sprintFromQuery) {
        const found = sprints.find((s: any) => s.id === sprintFromQuery);
        if (found) {
          setSelectedSprint(found.id);
          return;
        }
      }

      // Filter sprints to only include those belonging to the selected project

      const projectSprints = sprints.filter(
        (s) => s.projectId === selectedProject,
      );

      if (projectSprints.length === 0) {
        console.log("⚠️ No sprints found for project:", selectedProject);

        setSelectedSprint(""); // Clear sprint selection if no sprints exist

        return;
      }

      // Find all ACTIVE sprints first (case-insensitive)

      const activeSprints = projectSprints.filter(
        (s) =>
          s.status?.toUpperCase() === "ACTIVE" ||
          s.status?.toLowerCase() === "active",
      );

      console.log(
        "📊 Available sprints for project:",
        projectSprints.map((s) => `${s.name} (${s.status})`),
      );

      console.log("✅ Active sprints found:", activeSprints.length);

      // Prioritize ACTIVE sprints, then fall back to first sprint

      const sprintToSelect =
        activeSprints.length > 0 ? activeSprints[0] : projectSprints[0];

      if (sprintToSelect) {
        console.log(
          "🎯 Auto-selecting sprint:",
          sprintToSelect.name,
          `(${sprintToSelect.status})`,
        );

        setSelectedSprint(sprintToSelect.id);
      }
    } else if (selectedProject && sprints.length === 0) {
      // Clear sprint selection if no sprints exist for the project

      setSelectedSprint("");
    }
  }, [sprints, selectedSprint, selectedProject]);

  // Validate that selected sprint belongs to selected project

  useEffect(() => {
    if (selectedSprint && selectedProject) {
      const sprint = sprints.find((s: Sprint) => s.id === selectedSprint);

      if (sprint && sprint.projectId !== selectedProject) {
        console.warn(
          `Selected sprint ${selectedSprint} does not belong to project ${selectedProject}. Clearing sprint selection.`,
        );

        setSelectedSprint(""); // Clear invalid sprint selection
      }
    }
  }, [selectedSprint, selectedProject, sprints]);

  // Helper functions

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "BLOCKER":
        return "bg-purple-100 text-purple-800 border-purple-200";

      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";

      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";

      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";

      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";

      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    const s = (status || "").toString().toLowerCase().trim();
    switch (s) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";

      case "planning":
        return "bg-blue-100 text-blue-800 border-blue-200";

      case "on-hold":
      case "onhold":
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";

      case "completed":
      case "done":
        return "bg-gray-100 text-gray-800 border-gray-200";

      case "cancelled":
      case "canceled":
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";

      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const computeDerivedStatus = (project: any): string => {
    const now = new Date();
    const start = project.startDate ? new Date(project.startDate) : null;
    const end = project.endDate ? new Date(project.endDate) : null;

    if (start && now < start) return "planning";
    if (start && end && now >= start && now <= end) return "active";

    // After end date: decide between completed vs overdue using sprint completion
    if (end && now > end) {
      const normalizedSprints = normalizeApiData(apiSprints);
      const projectSprints = normalizedSprints.filter((s) => {
        const sprintProjectId = (s as any).projectId || (s as any).project?.id;
        return String(sprintProjectId) === String(project.id);
      });

      if (projectSprints.length === 0) return "overdue";

      const allCompleted = projectSprints.every((s: any) => {
        const st = (s.status || "").toString().toLowerCase();
        return st === "completed" || st === "closed" || st === "done";
      });
      return allCompleted ? "completed" : "overdue";
    }

    // Fallback
    return (project.status || "planning").toString().toLowerCase();
  };


  // Story status mapping from API to kanban columns

  const mapStoryStatusToColumn = (status: StoryStatus): string => {
    switch (status) {
      case "BACKLOG":
        return "backlog";

      case "TODO":
        return "stories";

      case "IN_PROGRESS":
        return "inprogress";

      case "REVIEW":
        return "qa";

      case "DONE":
        return "done";

      default:
        return "stories";
    }
  };

  const mapColumnToStoryStatus = (column: string): StoryStatus => {
    switch (column) {
      case "backlog":
        return "BACKLOG";

      case "stories":
        return "TODO";

      case "inprogress":
        return "IN_PROGRESS";

      case "qa":
        return "REVIEW";

      case "done":
        return "DONE";

      default:
        return "TODO";
    }
  };

  // Task status mapping

  const mapTaskStatusToColumn = (status: TaskStatus | string): string => {
    // Check if status matches a custom lane statusValue

    const customLane = workflowLanes.find(
      (lane) => lane.statusValue && status === lane.statusValue,
    );

    if (customLane) {
      return customLane.statusValue;
    }

    // Check if status is a custom lane statusValue (starts with custom_lane_)

    if (typeof status === "string" && status.startsWith("custom_lane_")) {
      return status;
    }

    // Normalize status to uppercase for consistent matching
    const normalizedStatus = typeof status === "string"
      ? status.toUpperCase().replace(/-/g, '_')
      : status;

    // Handle all status formats (both lowercase and uppercase from backend)
    switch (normalizedStatus) {
      case "TO_DO":
      case "TODO":
      case "OPEN":
        return "todo";

      case "IN_PROGRESS":
      case "INPROGRESS":
        return "inprogress";

      case "QA_REVIEW":
      case "QAREVIEW":
      case "QA":
      case "TESTING":
      case "IN_REVIEW":
      case "INREVIEW":
        return "qa";

      case "DONE":
      case "COMPLETED":
        return "done";

      case "BLOCKED":
        return "todo"; // Blocked tasks appear in TODO

      case "CANCELLED":
        return "done"; // Cancelled tasks appear in DONE

      default:
        return "todo";
    }
  };

  const mapColumnToTaskStatus = (column: string): TaskStatus | string => {
    // Check if column is a custom lane statusValue

    const customLane = workflowLanes.find(
      (lane) => lane.statusValue && lane.statusValue === column,
    );

    if (customLane) {
      return customLane.statusValue; // Return custom statusValue as string
    }

    switch (column) {
      case "todo":
        return "TO_DO";

      case "inprogress":
        return "IN_PROGRESS";

      case "qa":
        return "QA_REVIEW";

      case "done":
        return "DONE";

      default:
        // If it's a custom lane statusValue, return it as-is

        if (column && column.startsWith("custom_lane_")) {
          return column;
        }

        return "TO_DO";
    }
  };

  // Get stories by column status

  const projectBacklogStories = useMemo(() => {
    let stories = backlogStories.filter(
      (story) => story.projectId === selectedProject,
    );

    // Role-based filtering: Non-managers/admins see only stories with tasks or issues assigned to them
    if (!canManageSprintsAndStories && user) {
      stories = stories.filter((story) => {
        const hasUserTask = allTasks.some(
          (task) => task.storyId === story.id && task.assigneeId === user.id
        );
        const hasUserIssue = allIssues.some(
          (issue) => issue.storyId === story.id && issue.assigneeId === user.id
        );
        return hasUserTask || hasUserIssue;
      });
    }

    return stories;
  }, [backlogStories, selectedProject, canManageSprintsAndStories, user, allTasks]);

  const selectedBacklogStories = useMemo(() => {
    if (selectedBacklogStoryIds.length === 0) return [] as Story[];

    const selectedSet = new Set(selectedBacklogStoryIds);

    return projectBacklogStories.filter((story) => selectedSet.has(story.id));
  }, [projectBacklogStories, selectedBacklogStoryIds]);

  // Get stories from previous sprints (excluding current sprint)
  const previousSprintStories = useMemo(() => {
    if (!selectedProject || !selectedSprint) return [];

    // Get all stories from sprints other than the current one
    const allProjectStories = sprintStories.filter(
      (story) => story.projectId === selectedProject && story.sprintId && story.sprintId !== selectedSprint
    );

    // Role-based filtering: Non-managers/admins see only stories with tasks or issues assigned to them
    if (!canManageSprintsAndStories && user) {
      return allProjectStories.filter((story) => {
        const hasUserTask = allTasks.some(
          (task) => task.storyId === story.id && task.assigneeId === user.id
        );
        const hasUserIssue = allIssues.some(
          (issue) => issue.storyId === story.id && issue.assigneeId === user.id
        );
        return hasUserTask || hasUserIssue;
      });
    }

    return allProjectStories;
  }, [sprintStories, selectedProject, selectedSprint, canManageSprintsAndStories, user, allTasks]);

  const boardStories = useMemo(() => {
    if (storiesScope === "backlog") {
      return projectBacklogStories;
    }

    if (storiesScope === "custom") {
      return selectedBacklogStories;
    }

    if (storiesScope === "all") {
      const sprintStoryIds = new Set(filteredSprintStories.map((story) => story.id));

      const uniqueBacklogStories = projectBacklogStories.filter(
        (story) => !sprintStoryIds.has(story.id),
      );

      return [...filteredSprintStories, ...uniqueBacklogStories];
    }

    return filteredSprintStories;
  }, [
    storiesScope,
    filteredSprintStories,
    projectBacklogStories,
    selectedBacklogStories,
  ]);

  const storyScopeLabel = useMemo(() => {
    switch (storiesScope) {
      case "backlog":
        return "Backlog";

      case "all":
        return "All";

      case "custom":
        return "Selected";

      case "sprint":

      default:
        return "Sprint";
    }
  }, [storiesScope]);

  const handleTogglePendingBacklogStory = useCallback((storyId: string) => {
    setPendingBacklogStoryIds((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId],
    );
  }, []);

  const handleConfirmPullSelectedStories = useCallback(async () => {
    if (!selectedSprint) {
      toast.error("Please select a sprint before pulling stories.");
      setIsPullStoriesDialogOpen(false);
      return;
    }

    if (!user?.id) {
      toast.error("User information not available.");
      setIsPullStoriesDialogOpen(false);
      return;
    }

    // Get selected backlog stories (dialog now only shows backlog stories)
    const selectedBacklogStories = projectBacklogStories.filter((story) =>
      pendingBacklogStoryIds.includes(story.id),
    );

    if (selectedBacklogStories.length === 0) {
      toast.info("No stories selected.");
      setIsPullStoriesDialogOpen(false);
      return;
    }

    try {
      const movedStories: Story[] = [];

      // Handle backlog stories: move them to sprint (they already exist with tasks)
      for (const story of selectedBacklogStories) {
        try {
          console.log(`Moving backlog story "${story.title}" (${story.id}) to sprint ${selectedSprint}`);

          const response = await storyApiService.moveStoryToSprint(
            story.id,
            selectedSprint
          );

          if (response.data) {
            const movedStory = response.data;

            // Verify the sprintId was set correctly in the response
            if (movedStory.sprintId !== selectedSprint) {
              console.error(`CRITICAL: Story ${movedStory.id} sprintId mismatch after move. Expected: ${selectedSprint}, Got: ${movedStory.sprintId}`);
              // Force set the sprintId in the local object
              movedStory.sprintId = selectedSprint;

              // Try to update the story again to fix the database
              try {
                const updateResponse = await storyApiService.updateStory(movedStory.id, {
                  ...movedStory,
                  sprintId: selectedSprint
                });
                if (updateResponse.data && updateResponse.data.sprintId === selectedSprint) {
                  console.log(`Fixed sprintId for story ${movedStory.id} via update`);
                  movedStory.sprintId = selectedSprint;
                }
              } catch (updateError) {
                console.error(`Failed to fix sprintId for story ${movedStory.id}:`, updateError);
              }
            }

            // Ensure sprintId is set before adding to array
            movedStory.sprintId = selectedSprint;
            movedStories.push(movedStory);

            console.log(`Successfully moved backlog story "${story.title}" (${story.id}) to sprint ${selectedSprint}. Verified sprintId: ${movedStory.sprintId}`);
          } else {
            console.error(`No data returned when moving story ${story.id} to sprint ${selectedSprint}`);
            toast.error(`Failed to move story "${story.title}" to sprint. No data returned.`);
          }
        } catch (error) {
          console.error(`Error moving backlog story ${story.id} to sprint:`, error);
          toast.error(`Failed to move story "${story.title}" to sprint. Please try again.`);
        }
      }

      if (movedStories.length > 0) {
        toast.success(
          `Successfully pulled ${movedStories.length} stor${movedStories.length === 1 ? "y" : "ies"} from backlog to current sprint.`,
        );

        // Refetch backlog stories first to update the backlog list
        if (refetchBacklogStories) {
          await refetchBacklogStories();
        }

        // Wait for database to persist the changes
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify stories were moved correctly by fetching them directly from the API
        console.log(`Verifying ${movedStories.length} moved stories have correct sprintId in database...`);
        for (const movedStory of movedStories) {
          try {
            const verifyResponse = await storyApiService.getStoryById(movedStory.id);
            if (verifyResponse.data) {
              const verifiedStory = verifyResponse.data;
              if (verifiedStory.sprintId !== selectedSprint) {
                console.error(`VERIFICATION FAILED: Story ${movedStory.id} still has wrong sprintId. Expected: ${selectedSprint}, Got: ${verifiedStory.sprintId}`);
                // Try to fix it one more time
                await storyApiService.updateStory(movedStory.id, {
                  ...verifiedStory,
                  sprintId: selectedSprint
                });
                console.log(`Attempted to fix sprintId for story ${movedStory.id}`);
              } else {
                console.log(`Verified: Story ${movedStory.id} has correct sprintId: ${verifiedStory.sprintId}`);
              }
            }
          } catch (verifyError) {
            console.error(`Error verifying story ${movedStory.id}:`, verifyError);
          }
        }

        // Refetch sprint stories to get updated list with correct sprintId
        if (refetchSprintStories) {
          await refetchSprintStories();
        }

        // Wait a moment for the refetch to complete and state to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Fetch tasks for all moved stories immediately
        // Ensure moved stories have the correct sprintId set
        const allStoriesToFetch = movedStories.map(s => ({ ...s, sprintId: selectedSprint }));

        if (allStoriesToFetch.length > 0) {
          console.log(`Fetching tasks for ${allStoriesToFetch.length} stories moved from backlog`);
          await fetchAllTasks(allStoriesToFetch, false);
        }

        // Wait for database to fully persist, then do a complete refetch
        // This ensures all tasks from all stories in the sprint are loaded
        setTimeout(async () => {
          // Refetch sprint stories again to ensure we have the latest data
          if (refetchSprintStories) {
            await refetchSprintStories();
          }

          // Wait for state to update
          await new Promise(resolve => setTimeout(resolve, 300));

          // Get the latest sprint stories from the hook data
          // We need to fetch tasks for all stories in the sprint, not just the moved ones
          if (selectedSprint && selectedProject) {
            console.log(`Refetching all tasks for sprint ${selectedSprint}`);
            try {
              const sprintStoriesResponse = await storyApiService.getStoriesBySprint(selectedSprint);
              let latestSprintStories: Story[] = [];

              if (sprintStoriesResponse && sprintStoriesResponse.data) {
                if (Array.isArray(sprintStoriesResponse.data)) {
                  latestSprintStories = sprintStoriesResponse.data;
                } else if (typeof sprintStoriesResponse.data === 'object' && 'data' in sprintStoriesResponse.data) {
                  const responseData = sprintStoriesResponse.data as any;
                  latestSprintStories = Array.isArray(responseData.data) ? responseData.data : [];
                }
              }

              const filteredStories = latestSprintStories.filter(
                (story: Story) => story.projectId === selectedProject && story.sprintId === selectedSprint
              );

              if (filteredStories.length > 0) {
                console.log(`Fetching tasks for ${filteredStories.length} sprint stories after move`);
                await fetchAllTasks(filteredStories, false);
              }
            } catch (error) {
              console.error("Error fetching sprint stories for task refresh:", error);
            }
          }
        }, 1000);
      }

      setSelectedBacklogStoryIds([]);
      setPendingBacklogStoryIds([]);
      setStoriesScope("sprint");
      setIsPullStoriesDialogOpen(false);
    } catch (error) {
      console.error("Error pulling stories:", error);
      toast.error("Failed to pull stories. Please try again.");
      setIsPullStoriesDialogOpen(false);
    }
  }, [pendingBacklogStoryIds, projectBacklogStories, selectedSprint, selectedProject, user, refetchSprintStories, refetchBacklogStories, fetchAllTasks]);

  const handlePullStoriesDialogChange = useCallback(
    (open: boolean) => {
      setIsPullStoriesDialogOpen(open);

      if (open) {
        setPendingBacklogStoryIds(selectedBacklogStoryIds);
      } else {
        setPendingBacklogStoryIds(selectedBacklogStoryIds);
      }
    },
    [selectedBacklogStoryIds],
  );

  const handleSelectBoard = useCallback((boardId: string | null) => {
    setSelectedBoard(boardId);

    if (boardId === null) {
      setStoriesScope("sprint");
    } else {
      setStoriesScope("custom");
    }

    setSelectedBacklogStoryIds([]);

    setPendingBacklogStoryIds([]);
  }, []);

  const getStoriesByStatus = (status: string) => {
    if (status === "backlog") {
      return projectBacklogStories;
    }

    // Stories should only appear in the "Stories" column, not in workflow columns

    if (status === "stories") {
      return boardStories;
    }

    return []; // No stories in workflow columns (To Do, In Progress, QA, Done)
  };

  // Get tasks for a specific story

  const getTasksForStory = (storyId: string) => {
    return allTasks

      .filter(
        (task) =>
          task.storyId === storyId &&
          boardStories.some((story) => story.id === storyId),
      )

      .sort((a, b) => {
        // Sort by task number, then by creation date if task numbers are the same

        const aNum = a.taskNumber || 0;

        const bNum = b.taskNumber || 0;

        if (aNum !== bNum) {
          return aNum - bNum;
        }

        return (
          new Date(a.createdAt || "").getTime() -
          new Date(b.createdAt || "").getTime()
        );
      });
  };

  // Get issues for a specific story

  const getIssuesForStory = (storyId: string) => {
    return allIssues

      .filter(
        (issue) =>
          issue.storyId === storyId &&
          boardStories.some((story) => story.id === storyId),
      )

      .sort((a, b) => {
        // Sort by issue number, then by creation date if issue numbers are the same

        const aNum = a.issueNumber || 0;

        const bNum = b.issueNumber || 0;

        if (aNum !== bNum) {
          return aNum - bNum;
        }

        // Fallback to creation date if task numbers are the same

        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  };

  // Get subtasks for a specific task

  const getSubtasksForTask = (taskId: string): Subtask[] => {
    return allSubtasks.filter((subtask) => subtask.taskId === taskId);
  };

  // Get subtasks for a specific issue

  const getSubtasksForIssue = (issueId: string): Subtask[] => {
    const subtasks = allSubtasks.filter(
      (subtask) => subtask.issueId === issueId,
    );

    console.log(
      `[getSubtasksForIssue] Issue ID: ${issueId}, Found ${subtasks.length} subtasks`,
    );

    console.log(
      `[getSubtasksForIssue] All subtasks with issueId:`,
      allSubtasks.filter((st) => st.issueId),
    );

    return subtasks;
  };

  // Get tasks by column status (tasks from stories in the current sprint or backlog)

  const getTasksByStatus = useCallback(
    (status: string) => {
      if (status === "stories") {
        return []; // No tasks in the Stories column
      }

      // Filter tasks to include those whose parent stories are in the current sprint OR backlog

      const filteredTasks = allTasks.filter((task) => {
        // Check if the task's parent story is in the current sprint or backlog

        const parentStoryOnBoard = boardStories.some(
          (story) => story.id === task.storyId,
        );

        if (!parentStoryOnBoard) return false;

        // Check if task status directly matches the status (for custom lanes)

        if (task.status === status) return true;

        // Only show tasks whose parent story is in sprint/backlog AND status matches the column

        const mappedStatus = mapTaskStatusToColumn(task.status);

        return mappedStatus === status;
      });

      // Sort tasks: For "To Do" column, show user-assigned tasks first
      const isTodoColumn = status === "todo" || status === "TO_DO" || status === "TODO" ||
        mapTaskStatusToColumn("TO_DO") === status ||
        (status && status.toLowerCase() === "todo");

      if (isTodoColumn) {
        filteredTasks.sort((a, b) => {
          const aIsUserAssigned = user?.id && a.assigneeId === user.id;
          const bIsUserAssigned = user?.id && b.assigneeId === user.id;

          // User-assigned tasks come first
          if (aIsUserAssigned && !bIsUserAssigned) return -1;
          if (!aIsUserAssigned && bIsUserAssigned) return 1;

          // If both are user-assigned or both are not, maintain original order
          return 0;
        });
      }

      return filteredTasks;
    },
    [allTasks, boardStories, workflowLanes, mapTaskStatusToColumn, user],
  );

  // Get issues by column status (issues from stories in the current sprint or backlog)
  const getIssuesByStatus = useCallback(
    (status: string) => {
      if (status === "stories") return []; // No issues in Stories column

      // Filter issues to include those whose parent stories are on the board
      const filteredIssues = allIssues.filter((issue) => {
        // Check if issue's parent story is on the board
        const parentStoryOnBoard = boardStories.some(
          (story) => story.id === issue.storyId
        );
        if (!parentStoryOnBoard) return false;

        // Check if issue status directly matches the status (for custom lanes)
        if (issue.status === status) return true;

        // Use the same mapping function as tasks for consistency
        const mappedStatus = mapTaskStatusToColumn(issue.status as any);
        return mappedStatus === status;
      });

      return filteredIssues;
    },
    [allIssues, boardStories, mapTaskStatusToColumn]
  );

  // Group tasks by their parent story (only from stories in current sprint)

  const getTasksGroupedByStory = (status: string) => {
    const tasks = getTasksByStatus(status);

    const grouped = tasks.reduce(
      (acc, task) => {
        // Only process tasks whose parent story is in the current sprint

        const parentStory = sprintStories.find(
          (story) => story.id === task.storyId,
        );

        if (parentStory) {
          // Only include if parent story is in sprint

          const storyTitle = parentStory.title;

          if (!acc[storyTitle]) {
            acc[storyTitle] = {
              story: parentStory,

              tasks: [],
            };
          }

          acc[storyTitle].tasks.push(task);
        }

        return acc;
      },
      {} as Record<string, { story?: Story; tasks: Task[] }>,
    );

    // Sort tasks by task number within each story group
    // For "To Do" column, prioritize user-assigned tasks first

    const isTodoColumn = status === "todo" || status === "TO_DO" || status === "TODO" ||
      (status && status.toLowerCase() === "todo");

    Object.keys(grouped).forEach((storyTitle) => {
      grouped[storyTitle].tasks.sort((a, b) => {
        // For "To Do" column, user-assigned tasks come first
        if (isTodoColumn && user?.id) {
          const aIsUserAssigned = a.assigneeId === user.id;
          const bIsUserAssigned = b.assigneeId === user.id;

          if (aIsUserAssigned && !bIsUserAssigned) return -1;
          if (!aIsUserAssigned && bIsUserAssigned) return 1;
        }

        // Then sort by task number
        const aNum = a.taskNumber || 0;
        const bNum = b.taskNumber || 0;

        if (aNum !== bNum) {
          return aNum - bNum;
        }

        // Finally by creation date
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    });

    return grouped;
  };

  // Helper functions for displaying names instead of IDs

  const getUserName = (userId: string) => {
    if (!userId) return "Unassigned";

    const normalizedId = String(userId).trim();

    // If users are still loading, return a placeholder
    if (usersLoading) {
      return "Loading...";
    }

    // If users array is empty, log warning (fetching is handled by useEffect)
    if (users.length === 0 && !usersLoading) {
      console.warn(`[getUserName] Users array is empty for userId: ${normalizedId}. Users should be fetched automatically.`);
      // Return placeholder - users should be fetched by useEffect
      return "Loading...";
    }

    // Try multiple matching strategies
    const user = users.find(
      (u) => {
        // Direct ID match (exact)
        if (u.id === normalizedId) return true;
        if (u.userId === normalizedId) return true;
        if (u.employeeId === normalizedId) return true;

        // Case-insensitive ID match
        if (u.id && String(u.id).toLowerCase() === normalizedId.toLowerCase()) return true;
        if (u.userId && String(u.userId).toLowerCase() === normalizedId.toLowerCase()) return true;
        if (u.employeeId && String(u.employeeId).toLowerCase() === normalizedId.toLowerCase()) return true;

        // Case-insensitive email match
        if (u.email && u.email.toLowerCase() === normalizedId.toLowerCase()) return true;

        // Username match
        if (u.username && u.username === normalizedId) return true;

        // Try matching with any ID field (case-insensitive)
        const userFields = [u.id, u.userId, u.employeeId].filter(Boolean);
        return userFields.some(field =>
          field && String(field).toLowerCase() === normalizedId.toLowerCase()
        );
      }
    );

    if (user) {
      const preferredName =
        user.name ||
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim();

      if (preferredName) {
        // Log successful match for debugging
        if (normalizedId === "USER000000000010" || normalizedId.toLowerCase() === "user000000000010") {
          console.log(`[getUserName] Successfully matched user ID ${normalizedId} to name: ${preferredName}`, {
            userId: normalizedId,
            userFound: {
              id: user.id,
              name: user.name,
              email: user.email
            }
          });
        }
        return preferredName;
      }

      if (user.email) {
        return user.email.split("@")[0];
      }

      return user.userId || user.id || normalizedId;
    }

    // If user not found, log for debugging
    if (normalizedId && normalizedId !== "Unassigned") {
      console.warn(`[getUserName] User not found for ID: ${normalizedId}. Available users: ${users.length}. User IDs (first 10):`,
        users.slice(0, 10).map(u => ({
          id: u.id,
          userId: u.userId,
          employeeId: u.employeeId,
          name: u.name,
          email: u.email
        })));

      // Special logging for the specific user ID mentioned
      if (normalizedId === "USER000000000010" || normalizedId.toLowerCase() === "user000000000010") {
        console.error(`[getUserName] CRITICAL: User "USER000000000010" (test user) not found!`, {
          searchingFor: normalizedId,
          availableUserIds: users.map(u => u.id),
          availableUserNames: users.map(u => ({ id: u.id, name: u.name }))
        });
      }
    }

    // Fallback: if it looks like an email, extract username
    if (normalizedId.includes("@")) {
      return normalizedId.split("@")[0];
    }

    // Last resort: return "Unknown" instead of the raw ID
    return "Unknown User";
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);

    return project?.name || projectId;
  };

  const getSprintName = (sprintId: string) => {
    const sprint = sprints.find((s) => s.id === sprintId);

    return sprint?.name || sprintId;
  };

  // Helper to sanitize story data for API (convert empty strings to null/arrays)

  const sanitizeStoryData = (storyData: any) => {
    return {
      ...storyData,

      // Convert empty string to empty array for acceptanceCriteria

      acceptanceCriteria: storyData.acceptanceCriteria
        ? typeof storyData.acceptanceCriteria === "string"
          ? storyData.acceptanceCriteria
            .split("\n")
            .filter((line: string) => line.trim())
          : storyData.acceptanceCriteria
        : [],

      // Convert empty strings to null for optional string fields

      epicId: storyData.epicId || null,

      releaseId: storyData.releaseId || null,

      sprintId: storyData.sprintId || null,

      assigneeId: storyData.assigneeId || null,

      reporterId: storyData.reporterId || null,

      // Convert empty array or undefined to null for labels

      labels:
        storyData.labels && storyData.labels.length > 0
          ? storyData.labels
          : null,
    };
  };

  // Get filtered backlog stories

  const getFilteredBacklogStories = () => {
    let filtered = backlogStories;

    if (searchTerm) {
      filtered = filtered.filter(
        (story) =>
          story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (backlogFilter !== "all") {
      filtered = filtered.filter(
        (story) => story.priority.toLowerCase() === backlogFilter.toLowerCase(),
      );
    }

    return filtered;
  };

  // Fetch tasks for backlog stories (for backlog page functionality)
  const fetchTasksForBacklogStories = useCallback(async (stories: Story[]) => {
    if (!stories || stories.length === 0) {
      setBacklogStoriesWithTasks([]);
      return;
    }

    setBacklogTasksLoading(true);
    try {
      const token = localStorage.getItem("authToken") || "";

      const storyItemsPromises = stories.map(async (story: Story) => {
        try {
          // Fetch tasks and issues in parallel
          const [tasksResponse, issuesResult] = await Promise.all([
            fetch(
              `${API_CONFIG.BASE_URL}/tasks/story/${story.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            ),
            issueApiService.getIssuesByStory(story.id).catch(e => {
              console.error(`Error fetching issues for story ${story.id}:`, e);
              return { data: [] };
            })
          ]);

          let tasks: Task[] = [];
          if (tasksResponse.ok) {
            const data = await tasksResponse.json();
            tasks = Array.isArray(data) ? data : data?.data || [];
          }

          // Parse issues - handle both direct array and nested .data.data structure (like BacklogPage)
          const issuesData = issuesResult?.data;
          console.log(`[ScrumPage Backlog] Story ${story.id} - issuesResult:`, issuesResult);
          console.log(`[ScrumPage Backlog] Story ${story.id} - issuesData:`, issuesData);
          console.log(`[ScrumPage Backlog] Story ${story.id} - isArray:`, Array.isArray(issuesData));

          const issues: Issue[] = Array.isArray(issuesData)
            ? issuesData
            : ((issuesData as any)?.data || []);

          console.log(`[ScrumPage Backlog] Story ${story.id} - parsed ${tasks.length} tasks, ${issues.length} issues`);

          return { story, tasks, issues };
        } catch (error) {
          console.error(`Error fetching items for story ${story.id}:`, error);
          return { story, tasks: [], issues: [] };
        }
      });

      const results = await Promise.all(storyItemsPromises);
      let storiesWithItemsData = results.map(({ story, tasks, issues }) => ({
        ...story,
        tasks: tasks || [],
        issues: issues || []
      }));

      // Store unfiltered version if needed for stats
      setAllBacklogStoriesWithTasks(storiesWithItemsData);

      // Log story item counts for debugging (like BacklogPage)
      const totalTasks = storiesWithItemsData.reduce((sum, s) => sum + (s.tasks?.length || 0), 0);
      const totalIssues = storiesWithItemsData.reduce((sum, s) => sum + (s.issues?.length || 0), 0);
      console.log(`ScrumPage Backlog: Fetched ${totalTasks} tasks and ${totalIssues} issues from ${storiesWithItemsData.length} stories`);

      // Update global tasks and issues state to ensure filtering works
      setAllTasks(prev => {
        const newTasks = storiesWithItemsData.flatMap(s => s.tasks);
        const newTaskIds = new Set(newTasks.map(t => t.id));
        const filteredPrev = prev.filter(t => !newTaskIds.has(t.id));
        return [...filteredPrev, ...newTasks];
      });

      setAllIssues(prev => {
        const newIssues = storiesWithItemsData.flatMap(s => s.issues);
        const newIssueIds = new Set(newIssues.map(i => i.id));
        const filteredPrev = prev.filter(i => !newIssueIds.has(i.id));
        return [...filteredPrev, ...newIssues];
      });

      // Role-based filtering: Non-managers/admins see only their assigned tasks OR issues
      if (!canManageSprintsAndStories && user) {
        storiesWithItemsData = storiesWithItemsData.map((story) => ({
          ...story,
          tasks: story.tasks.filter((task) => task.assigneeId === user.id),
          issues: story.issues.filter((issue) => issue.assigneeId === user.id),
        })).filter((story) => story.tasks.length > 0 || story.issues.length > 0);

        console.log(
          `Filtered backlog stories for user ${user.name}: showing ${storiesWithItemsData.length} stories with assigned items`,
        );
      }

      setBacklogStoriesWithTasks(storiesWithItemsData);
    } catch (error) {
      console.error("Error fetching backlog items:", error);
      setBacklogStoriesWithTasks([]);
    } finally {
      setBacklogTasksLoading(false);
    }
  }, [canManageSprintsAndStories, user]);

  // Fetch tasks when backlog stories change
  useEffect(() => {
    if (backlogStories && backlogStories.length > 0) {
      console.log("Fetching tasks for backlog stories:", backlogStories.length);
      fetchTasksForBacklogStories(backlogStories);
    } else {
      console.log("No backlog stories to fetch tasks for");
      setBacklogStoriesWithTasks([]);
    }
  }, [backlogStories, fetchTasksForBacklogStories]);

  // Note: allBacklogStoriesForDisplay is declared later and used for backlog display


  // Helper function to convert file to base64

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result as string);

      reader.onerror = (error) => reject(error);
    });
  };

  // Helper function to create attachment with file

  const uploadFileAndCreateAttachment = async (
    file: File,
    entityType: string,
    entityId: string,
  ): Promise<void> => {
    try {
      // Convert file to base64 data URL

      const fileDataUrl = await fileToBase64(file);

      const fileType = file.type || "application/octet-stream";

      // Create attachment record directly with base64 data URL

      await attachmentApiService.createAttachment({
        uploadedBy: user?.id,

        entityType,

        entityId,

        fileName: file.name,

        fileSize: file.size,

        fileType,

        fileUrl: fileDataUrl, // Store as base64 data URL

        thumbnailUrl: undefined,

        attachmentType: 'file' as const,

        isPublic: true,
      });
    } catch (error) {
      console.error("Error creating attachment:", error);

      throw error;
    }
  };

  // Helper function to create URL attachment
  const createUrlAttachment = async (
    url: string,
    name: string,
    entityType: string,
    entityId: string,
  ): Promise<void> => {
    try {
      await attachmentApiService.createAttachment({
        uploadedBy: user?.id,
        entityType,
        entityId,
        fileName: name,
        fileSize: undefined,
        fileType: 'url',
        fileUrl: url,
        attachmentType: 'url' as const,
        isPublic: true,
      });
    } catch (error) {
      console.error("Error creating URL attachment:", error);
      throw error;
    }
  };

  // Story creation handler

  const handleCreateStory = async () => {
    // Only managers can create stories
    if (!isManager) {
      toast.error("Only managers can create stories");
      return;
    }

    if (!selectedProject) {
      alert("Please select a project first");

      return;
    }

    if (!newStory.title.trim()) {
      alert("Please enter a story title");

      return;
    }

    // Sprint is now mandatory - check if it's set

    if (!newStory.sprintId) {
      alert("Please select a sprint for this story");

      return;
    }

    const storyData = {
      projectId: selectedProject,

      title: newStory.title,

      description: newStory.description,

      acceptanceCriteria: newStory.acceptanceCriteria,

      storyPoints: newStory.storyPoints,

      priority: newStory.priority,

      epicId: newStory.epicId || null,

      releaseId: newStory.releaseId || null,

      sprintId: newStory.sprintId || null,

      assigneeId: newStory.assigneeId || null,

      reporterId: newStory.reporterId || null,

      dueDate: newStory.dueDate || null,

      labels: newStory.labels.length > 0 ? newStory.labels : null,

      status: newStory.sprintId ? "TODO" : "BACKLOG",

      isActive: true,
    };

    console.log('[DEBUG] Story creation - sending data:', JSON.stringify(storyData, null, 2));

    const createdStory = await createStoryMutate(storyData as any);

    // Upload attachments if any

    if (storyAttachments.length > 0 && createdStory?.data?.id) {
      setUploadingAttachments(true);

      try {
        const uploadPromises = storyAttachments.map((file) =>
          uploadFileAndCreateAttachment(file, "story", createdStory.data.id),
        );

        await Promise.all(uploadPromises);

        toast.success(
          `Story created with ${storyAttachments.length} attachment(s)`,
        );
      } catch (error) {
        console.error("Error uploading attachments:", error);

        toast.error("Story created but some attachments failed to upload");
      } finally {
        setUploadingAttachments(false);
      }
    } else {
      toast.success("Story created successfully");
    }

    // Reset form with default sprint

    setNewStory({
      title: "",

      description: "",

      acceptanceCriteria: "",

      storyPoints: 0,

      priority: "MEDIUM" as Priority,

      epicId: "",

      releaseId: "",

      sprintId: selectedSprint || "", // Reset to current sprint

      assigneeId: "",

      reporterId: "",

      dueDate: undefined,

      labels: [],
    });

    setStoryAttachments([]);

    // Reset popover state
    setIsDueDatePopoverOpen(false);

    // Close dialog

    setIsAddStoryDialogOpen(false);

    // Refetch stories

    if (newStory.sprintId) {
      refetchSprintStories();
    } else {
      refetchBacklogStories();
    }
  };

  // Drag and drop handlers

  const moveItem = useCallback(
    async (id: string, newStatus: string, itemType: string) => {
      const mappedNewStatus = mapColumnToTaskStatus(newStatus);

      // === RULE 1: Only MANAGER/QA Manager/QA Developer can move tasks TO DONE column ===
      if (mappedNewStatus === "DONE" && !canDragToDone) {
        toast.error("Only managers and QA roles can move tasks to the Done column");
        return;
      }

      if (itemType === ItemTypes.TASK) {
        // Check if newStatus is a valid default status or a custom lane statusValue

        const validStatuses = ["todo", "inprogress", "qa", "done"];

        const isCustomLane = workflowLanes.some(
          (lane) => lane.statusValue === newStatus,
        );

        if (validStatuses.includes(newStatus) || isCustomLane) {
          const task = allTasks.find((t) => t.id === id);
          const oldStatus = task?.status;

          // === RULE 2: Tasks in DONE - Only MANAGERS/QA roles can move, and ONLY to TODO ===
          if (oldStatus === "DONE") {
            // First check: only managers/QA can move from DONE
            if (!canDragToDone) {
              toast.error("Only managers and QA roles can move tasks from Done column");
              try {
                await activityLogApiService.createActivityLog({
                  userId: user?.id || "",
                  entityType: "tasks",
                  entityId: id,
                  action: "status_change_blocked",
                  description: `Non-manager attempted to move task from DONE (blocked - manager only)`,
                  oldValues: JSON.stringify({ status: oldStatus }),
                  newValues: JSON.stringify({ status: mappedNewStatus }),
                  ipAddress: undefined,
                  userAgent: undefined,
                });
              } catch (error) {
                console.error("Failed to log blocked activity:", error);
              }
              return;
            }
            // Second check: even managers can only move to TODO
            if (newStatus !== "todo") {
              toast.error("Done tasks can only be moved back to To Do");
              try {
                await activityLogApiService.createActivityLog({
                  userId: user?.id || "",
                  entityType: "tasks",
                  entityId: id,
                  action: "status_change_blocked",
                  description: `Attempted to move task from DONE to ${mappedNewStatus} (blocked - can only go to TODO)`,
                  oldValues: JSON.stringify({ status: oldStatus }),
                  newValues: JSON.stringify({ status: mappedNewStatus }),
                  ipAddress: undefined,
                  userAgent: undefined,
                });
              } catch (error) {
                console.error("Failed to log blocked activity:", error);
              }
              return;
            }
          }

          // === RULE 3: TODO → IN_PROGRESS requires effort logged ===
          const isMovingFromTodoToInProgress =
            oldStatus === "TO_DO" && newStatus === "inprogress";

          if (isMovingFromTodoToInProgress) {
            // Check if task has any time entries logged
            try {
              const response = await timeEntryApiService.getTimeEntriesByTask(id);
              const entries = Array.isArray(response.data)
                ? response.data
                : (Array.isArray(response) ? response : []);

              if (entries.length === 0) {
                toast.error("Log effort at least once before moving to In Progress");
                try {
                  await activityLogApiService.createActivityLog({
                    userId: user?.id || "",
                    entityType: "tasks",
                    entityId: id,
                    action: "status_change_blocked",
                    description: `Attempted to move task from TODO to IN_PROGRESS (blocked - no effort logged)`,
                    oldValues: JSON.stringify({ status: oldStatus }),
                    newValues: JSON.stringify({ status: "IN_PROGRESS" }),
                    ipAddress: undefined,
                    userAgent: undefined,
                  });
                } catch (logError) {
                  console.error("Failed to log blocked activity:", logError);
                }
                return;
              }
            } catch (error) {
              console.error("Failed to check time entries:", error);
              toast.error("Unable to verify effort logs. Please try again.");
              return;
            }
          }

          // === RULE 4: Only managers can move tasks from In Progress back to To Do ===
          const isMovingFromInProgressToTodo =
            oldStatus === "IN_PROGRESS" && newStatus === "todo";

          if (isMovingFromInProgressToTodo && !canManageSprintsAndStories) {
            toast.error("Only managers can move tasks from In Progress back to To Do");
            try {
              await activityLogApiService.createActivityLog({
                userId: user?.id || "",
                entityType: "tasks",
                entityId: id,
                action: "status_change_blocked",
                description: `Attempted to move task from ${oldStatus} to TODO (blocked - manager only)`,
                oldValues: JSON.stringify({ status: oldStatus }),
                newValues: JSON.stringify({ status: "TODO" }),
                ipAddress: undefined,
                userAgent: undefined,
              });
            } catch (error) {
              console.error("Failed to log blocked activity:", error);
            }
            return;
          }

          const mappedStatus = mapColumnToTaskStatus(newStatus);

          await updateTaskStatusMutate({
            id,

            status: mappedStatus as any, // Allow custom status strings
          });

          notifyProjectBudgetUpdate("task-status-updated");

          // Log activity
          try {
            const isMovingToInProgress = mappedStatus === "IN_PROGRESS";
            const isMovingFromTodo = oldStatus === "TO_DO";

            let description = `Changed status from ${oldStatus} to ${mappedStatus}`;
            if (isMovingFromTodo && isMovingToInProgress && canManageSprintsAndStories) {
              description = `Manager moved task from To Do to In Progress`;
            }

            await activityLogApiService.createActivityLog({
              userId: user?.id || "",
              entityType: "tasks",
              entityId: id,
              action: "status_changed",
              description: description,
              oldValues: JSON.stringify({ status: oldStatus }),
              newValues: JSON.stringify({ status: mappedStatus }),
              ipAddress: undefined, // Not tracking IP from frontend
              userAgent: undefined, // Not tracking user agent from frontend
            });
          } catch (error) {
            console.error("Failed to log activity:", error);
          }

          toast.success("Task status updated");

          // Refetch tasks to update the UI (include backlog stories)

          await fetchAllTasks(sprintStories, true);
        }
      } else if (itemType === ItemTypes.ISSUE) {
        // Check if newStatus is a valid default status or a custom lane statusValue

        const validStatuses = ["todo", "inprogress", "qa", "done"];

        const isCustomLane = workflowLanes.some(
          (lane) => lane.statusValue === newStatus,
        );

        if (validStatuses.includes(newStatus) || isCustomLane) {
          const issue = allIssues.find((i) => i.id === id);
          const oldStatus = issue?.status;

          // === RULE 2: Issues in DONE - Only MANAGERS can move, and ONLY to TODO ===
          if (oldStatus === "DONE") {
            // First check: only managers can move from DONE
            if (!isManager) {
              toast.error("Only managers can move issues from Done column");
              try {
                await activityLogApiService.createActivityLog({
                  userId: user?.id || "",
                  entityType: "issues",
                  entityId: id,
                  action: "status_change_blocked",
                  description: `Non-manager attempted to move issue from DONE (blocked - manager only)`,
                  oldValues: JSON.stringify({ status: oldStatus }),
                  newValues: JSON.stringify({ status: mappedNewStatus }),
                  ipAddress: undefined,
                  userAgent: undefined,
                });
              } catch (error) {
                console.error("Failed to log blocked activity:", error);
              }
              return;
            }
            // Second check: even managers can only move to TODO
            if (newStatus !== "todo") {
              toast.error("Done issues can only be moved back to To Do");
              try {
                await activityLogApiService.createActivityLog({
                  userId: user?.id || "",
                  entityType: "issues",
                  entityId: id,
                  action: "status_change_blocked",
                  description: `Attempted to move issue from DONE to ${mappedNewStatus} (blocked - can only go to TODO)`,
                  oldValues: JSON.stringify({ status: oldStatus }),
                  newValues: JSON.stringify({ status: mappedNewStatus }),
                  ipAddress: undefined,
                  userAgent: undefined,
                });
              } catch (error) {
                console.error("Failed to log blocked activity:", error);
              }
              return;
            }
          }

          // === RULE 3: TODO → IN_PROGRESS requires effort logged (for issues) ===
          const isMovingFromTodoToInProgress =
            oldStatus === "TO_DO" && newStatus === "inprogress";

          if (isMovingFromTodoToInProgress) {
            // Check if issue has any effort logged (actualHours > 0)
            const issue = allIssues.find((i) => i.id === id);
            const hasLoggedEffort = issue && (issue.actualHours || 0) > 0;

            if (!hasLoggedEffort) {
              toast.error("Log effort at least once before moving issue to In Progress");
              try {
                await activityLogApiService.createActivityLog({
                  userId: user?.id || "",
                  entityType: "issues",
                  entityId: id,
                  action: "status_change_blocked",
                  description: `Attempted to move issue from TODO to IN_PROGRESS (blocked - no effort logged)`,
                  oldValues: JSON.stringify({ status: oldStatus }),
                  newValues: JSON.stringify({ status: "IN_PROGRESS" }),
                  ipAddress: undefined,
                  userAgent: undefined,
                });
              } catch (logError) {
                console.error("Failed to log blocked activity:", logError);
              }
              return;
            }
          }

          // === RULE 4: Only managers can move issues from In Progress back to To Do ===
          const isMovingFromInProgressToTodo =
            oldStatus === "IN_PROGRESS" && newStatus === "todo";

          if (isMovingFromInProgressToTodo && !canManageSprintsAndStories) {
            toast.error("Only managers can move issues from In Progress back to To Do");
            try {
              await activityLogApiService.createActivityLog({
                userId: user?.id || "",
                entityType: "issues",
                entityId: id,
                action: "status_change_blocked",
                description: `Attempted to move issue from ${oldStatus} to TODO (blocked - manager only)`,
                oldValues: JSON.stringify({ status: oldStatus }),
                newValues: JSON.stringify({ status: "TODO" }),
                ipAddress: undefined,
                userAgent: undefined,
              });
            } catch (error) {
              console.error("Failed to log blocked activity:", error);
            }
            return;
          }

          const mappedStatus = mapColumnToTaskStatus(newStatus);

          await updateIssueStatusMutate({
            id,

            status: mappedStatus as any, // Allow custom status strings
          });

          // Log activity
          try {
            const isMovingToInProgress = mappedStatus === "IN_PROGRESS";
            const isMovingFromTodo = oldStatus === "TO_DO";

            let description = `Changed issue status from ${oldStatus} to ${mappedStatus}`;
            if (isMovingFromTodo && isMovingToInProgress && canManageSprintsAndStories) {
              description = `Manager moved issue from To Do to In Progress`;
            }

            await activityLogApiService.createActivityLog({
              userId: user?.id || "",
              entityType: "issues",
              entityId: id,
              action: "status_changed",
              description: description,
              oldValues: JSON.stringify({ status: oldStatus }),
              newValues: JSON.stringify({ status: mappedStatus }),
              ipAddress: undefined,
              userAgent: undefined,
            });
          } catch (error) {
            console.error("Failed to log activity:", error);
          }

          toast.success("Issue status updated");

          // Refetch issues and tasks to update the UI (include backlog stories)

          await fetchAllTasks(sprintStories, true);
        }
      } else if (itemType === ItemTypes.STORY) {
        const validStatuses = [
          "backlog",
          "stories",
          "todo",
          "inprogress",
          "qa",
          "done"
        ];

        if (validStatuses.includes(newStatus)) {
          const newApiStatus = mapColumnToStoryStatus(newStatus);

          // If moving to/from backlog, also update sprintId

          if (newStatus === "backlog") {
            updateStoryMutate({
              id,

              story: {
                status: newApiStatus,

                sprintId: "",
              },
            });
          } else if (newStatus === "stories") {
            // Find the story to check if it needs sprint assignment

            const story = [...sprintStories, ...backlogStories].find(
              (s) => s.id === id,
            );

            if (story && !story.sprintId) {
              moveStoryToSprintMutate({
                id,

                sprintId: selectedSprint,
              });
            }

            updateStoryStatusMutate({
              id,

              status: newApiStatus,
            });
          } else {
            updateStoryStatusMutate({
              id,

              status: newApiStatus,
            });
          }

          toast.success("Story status updated");

          refetchSprintStories();

          refetchBacklogStories();
        }
      }
    },
    [
      selectedSprint,
      updateTaskStatusMutate,
      updateIssueStatusMutate,
      updateStoryMutate,
      updateStoryStatusMutate,
      moveStoryToSprintMutate,
      refetchSprintStories,
      refetchBacklogStories,
      fetchAllTasks,
      sprintStories,
      allTasks,
      allIssues,
      workflowLanes,
      user,
      isDeveloper,
      lanesAfterQA,
    ],
  );

  // Create Sprint Handler

  const handleCreateSprint = async () => {
    if (!canManageSprintsAndStories) return;

    // Validate required fields

    if (!newSprint.name || !newSprint.name.trim()) {
      toast.error("Sprint name is required");

      return;
    }

    if (!selectedProject) {
      toast.error("Please select a project first");

      return;
    }

    try {
      const response = await createSprintMutate({
        projectId: selectedProject,

        name: newSprint.name.trim(),

        goal: newSprint.goal?.trim() || "",

        status: "PLANNING" as SprintStatus,

        startDate: newSprint.startDate || undefined,

        endDate: newSprint.endDate || undefined,

        capacityHours: newSprint.capacityHours
          ? parseInt(newSprint.capacityHours)
          : undefined,

        velocityPoints: 0,

        isActive: true,
      });

      if (response && response.success) {
        toast.success("Sprint created successfully");

        // Reset form

        setNewSprint({
          name: "",

          goal: "",

          startDate: "",

          endDate: "",

          capacityHours: "",
        });

        setIsSprintDialogOpen(false);

        // Refetch sprints to update the list

        await refetchSprints();

        // Optionally select the newly created sprint

        if (response.data?.id) {
          setSelectedSprint(response.data.id);
        }
      } else {
        toast.error(response?.message || "Failed to create sprint");
      }
    } catch (error: any) {
      console.error("Error creating sprint:", error);

      toast.error(
        error?.message || "Failed to create sprint. Please try again.",
      );
    }
  };

  // Add Story Handler

  const handleAddStory = async () => {
    // Only managers can create stories
    if (!isManager) {
      toast.error("Only managers can create stories");
      return;
    }

    // Convert acceptanceCriteria string to array (backend expects List<String>)
    const acceptanceCriteriaArray = newStory.acceptanceCriteria
      ? newStory.acceptanceCriteria.split('\n').filter((line: string) => line.trim() !== '')
      : [];

    const createdStory = await createStoryMutate({
      projectId: selectedProject,
      title: newStory.title,
      description: newStory.description || null,
      acceptanceCriteria: acceptanceCriteriaArray,
      storyPoints: newStory.storyPoints || null,
      priority: newStory.priority || "MEDIUM",
      epicId: newStory.epicId || null,
      releaseId: newStory.releaseId || null,
      sprintId: activeView === "backlog" ? null : (selectedSprint || null),
      assigneeId: newStory.assigneeId || null,
      reporterId: user?.id || null,
      status: activeView === "backlog" ? "BACKLOG" : "TODO",
      labels: newStory.labels || [],
      dueDate: newStory.dueDate || null,
    } as any);

    // Upload attachments if any

    if (storyAttachments.length > 0 && createdStory?.data?.id) {
      setUploadingAttachments(true);

      try {
        const uploadPromises = storyAttachments.map((file) =>
          uploadFileAndCreateAttachment(file, "story", createdStory.data.id),
        );

        await Promise.all(uploadPromises);

        toast.success(
          `Story created with ${storyAttachments.length} attachment(s)`,
        );
      } catch (error) {
        console.error("Error uploading attachments:", error);

        toast.error("Story created but some attachments failed to upload");
      } finally {
        setUploadingAttachments(false);
      }
    } else {
      toast.success("Story created successfully");
    }

    refetchSprintStories();

    refetchBacklogStories();

    setNewStory({
      title: "",
      description: "",
      acceptanceCriteria: "",
      storyPoints: 0,
      priority: "MEDIUM",
      epicId: "",
      releaseId: "",
      sprintId: selectedSprint || "",
      assigneeId: "",
      reporterId: user?.id || "",
      dueDate: undefined,
      labels: [],
    });

    setStoryAttachments([]);

    setIsAddStoryDialogOpen(false);
  };

  // Add Task Handler - Updated to accept AddTaskDialog format

  // AddTaskDialog now returns assignee as user ID

  // Handler for creating/updating workflow lane

  const handleCreateWorkflowLane = async (laneData: Partial<WorkflowLane>) => {
    try {
      if (selectedLaneForEdit?.id) {
        await updateWorkflowLaneMutation.mutate({
          id: selectedLaneForEdit.id,
          lane: laneData,
        });

        toast.success("Workflow lane updated successfully");
      } else {
        if (!laneData.projectId) {
          toast.error("Project ID is required");

          return;
        }

        if (!laneData.title || !laneData.title.trim()) {
          toast.error("Lane title is required");

          return;
        }

        if (!laneData.displayOrder || laneData.displayOrder === 0) {
          const defaultOrders = [1, 2, 3, 4, 10, 20, 30, 40];

          const customLanes = workflowLanes.filter((l) => {
            const order = l.displayOrder || 0;

            return !defaultOrders.includes(order);
          });

          if (laneCreationSource === "inprogress") {
            const lanesAfterInProgress = customLanes.filter((l) => {
              const order = l.displayOrder || 0;

              return order > 20 && order < 30;
            });

            const maxOrder =
              lanesAfterInProgress.length > 0
                ? Math.max(
                  ...lanesAfterInProgress.map((l) => l.displayOrder || 0),
                )
                : 20;

            laneData.displayOrder = Math.min(maxOrder + 1, 29);
          } else if (laneCreationSource === "qa") {
            const lanesAfterQA = customLanes.filter((l) => {
              const order = l.displayOrder || 0;

              return order > 30 && order < 40;
            });

            const maxOrder =
              lanesAfterQA.length > 0
                ? Math.max(...lanesAfterQA.map((l) => l.displayOrder || 0))
                : 30;

            laneData.displayOrder = Math.min(maxOrder + 1, 39);
          } else {
            const lanesAfterQA = customLanes.filter((l) => {
              const order = l.displayOrder || 0;

              return order > 30 && order < 40;
            });

            const maxOrder =
              lanesAfterQA.length > 0
                ? Math.max(...lanesAfterQA.map((l) => l.displayOrder || 0))
                : 30;

            laneData.displayOrder = Math.min(maxOrder + 1, 39);
          }
        }

        // Fetch lanes from database and check if lane already exists

        const defaultOrders = [1, 2, 3, 4, 10, 20, 30, 40];

        const existingLane = workflowLanes.find(
          (l) =>
            l.title.toLowerCase() === laneData.title?.toLowerCase().trim() &&
            l.projectId === laneData.projectId &&
            !defaultOrders.includes(l.displayOrder || 0),
        );

        if (existingLane) {
          toast.error(
            "A lane with this name already exists for this project. Please use a different name.",
          );

          return;
        }

        // Check if lane exists in other sections (to prevent duplicate creation)

        const allExistingLanes = workflowLanes.filter(
          (l) =>
            l.projectId === laneData.projectId &&
            !defaultOrders.includes(l.displayOrder || 0),
        );

        // If lane with same title exists in any section, don't create

        const duplicateLane = allExistingLanes.find(
          (l) => l.title.toLowerCase() === laneData.title?.toLowerCase().trim(),
        );

        if (duplicateLane) {
          toast.error(
            `A lane named "${laneData.title}" already exists in this project. Please use a different name.`,
          );

          return;
        }

        await createWorkflowLaneMutation.mutate(laneData);

        toast.success("Workflow lane created successfully");
      }

      await refetchWorkflowLanes();

      setIsLaneConfigModalOpen(false);

      setSelectedLaneForEdit(null);

      setLaneCreationSource(null);
    } catch (error: any) {
      console.error("Error saving workflow lane:", error);

      const errorMessage =
        error?.message || error?.details?.error || "Unknown error occurred";

      toast.error(
        selectedLaneForEdit?.id
          ? `Failed to update workflow lane: ${errorMessage}`
          : `Failed to create workflow lane: ${errorMessage}`,
      );
    }
  };

  // Handler for deleting workflow lane

  const handleDeleteWorkflowLane = async (laneId: string) => {
    // Find the lane to get its status value
    const lane = workflowLanes.find((l: any) => l.id === laneId);
    if (!lane) {
      toast.error("Lane not found");
      return;
    }

    // Check if there are any tasks or issues in this lane
    const laneStatus = lane.statusValue;
    const tasksInLane = allTasks.filter((t: any) => t.status === laneStatus);
    const issuesInLane = allIssues.filter((i: any) => i.status === laneStatus);

    const totalItemsInLane = tasksInLane.length + issuesInLane.length;

    if (totalItemsInLane > 0) {
      // There are items in this lane - show migration dialog
      setLaneToDelete(laneId);
      setLaneItemsCount({ tasks: tasksInLane.length, issues: issuesInLane.length });
      setTargetMigrationLane("");
      setLaneMigrationDialogOpen(true);
    } else {
      // No items in lane - confirm deletion directly
      if (
        !window.confirm(
          "Are you sure you want to delete this workflow lane? This action cannot be undone.",
        )
      ) {
        return;
      }

      try {
        await workflowLaneApiService.deleteLaneWithMigration(laneId);
        toast.success("Workflow lane deleted successfully");
        refetchWorkflowLanes();
      } catch (error) {
        console.error("Error deleting workflow lane:", error);
        toast.error("Failed to delete workflow lane");
      }
    }
  };

  // Handler for confirming lane deletion with migration
  const handleConfirmLaneMigration = async () => {
    if (!laneToDelete) return;

    const lane = workflowLanes.find((l: any) => l.id === laneToDelete);
    if (!lane) {
      toast.error("Lane not found");
      return;
    }

    // Get the source lane status
    const sourceStatus = lane.statusValue;

    // The targetMigrationLane is already the statusValue from the dropdown
    let targetStatus: string | undefined = targetMigrationLane;

    try {
      // First, update all tasks and issues to the new status if target lane is selected
      if (targetStatus && targetMigrationLane) {
        // Update tasks
        const tasksInLane = allTasks.filter((t: any) => t.status === sourceStatus);
        for (const task of tasksInLane) {
          try {
            await taskApiService.updateTaskStatus(task.id, targetStatus);
          } catch (err) {
            console.error(`Failed to update task ${task.id}:`, err);
          }
        }

        // Update issues
        const issuesInLane = allIssues.filter((i: any) => i.status === sourceStatus);
        for (const issue of issuesInLane) {
          try {
            await issueApiService.updateIssueStatus(issue.id, targetStatus);
          } catch (err) {
            console.error(`Failed to update issue ${issue.id}:`, err);
          }
        }
      }

      // Now delete the lane
      await workflowLaneApiService.deleteLaneWithMigration(laneToDelete, targetMigrationLane || undefined);

      toast.success("Workflow lane deleted and items migrated successfully");
      refetchWorkflowLanes();

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error deleting workflow lane with migration:", error);
      toast.error("Failed to delete workflow lane");
    } finally {
      setLaneMigrationDialogOpen(false);
      setLaneToDelete(null);
      setTargetMigrationLane("");
    }
  };

  // Handler for opening lane configuration modal (for editing)

  // Handler for creating a new board

  const handleCreateBoard = async () => {
    if (!canCreateBoards) {
      toast.error("Only Managers and QA can create boards");

      return;
    }

    if (!selectedProject) {
      toast.error("Please select a project first");

      return;
    }

    if (!newBoardName || !newBoardName.trim()) {
      toast.error("Please enter a board name");

      return;
    }

    try {
      const response = await createBoardFromDefaultMutation.mutate({
        projectId: selectedProject,

        name: newBoardName.trim(),

        description: `Board created from default configuration`,
      });

      toast.success(`Board "${newBoardName.trim()}" created successfully!`);

      setNewBoardName("");

      setIsCreateBoardDialogOpen(false);

      if (response?.data?.id) {
        handleSelectBoard(response.data.id);

        toast.info("New board is empty. Use Pull Stories to add items.");
      }

      refetchBoards();

      refetchWorkflowLanes();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create board";

      toast.error(`Failed to create board: ${errorMessage}`);
    }
  };

  // Handler for deleting a board

  const handleDeleteBoard = async (
    boardId: string,
    boardName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // Prevent triggering the dropdown item click

    // Only MANAGER and QA can delete boards

    if (!canCreateBoards) {
      toast.error("Only Managers and QA can delete boards");

      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${boardName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteBoardMutation.mutate(boardId);

      toast.success(`Board "${boardName}" deleted successfully!`);

      // If the deleted board was selected, switch to default board

      if (selectedBoard === boardId) {
        handleSelectBoard(null);

        refetchWorkflowLanes();

        toast.info("Switched to default board");
      }

      refetchBoards();

      refetchWorkflowLanes();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete board";

      toast.error(`Failed to delete board: ${errorMessage}`);
    }
  };

  // Handler for updating a story
  const handleUpdateStory = async () => {
    if (!editingStory) {
      toast.error("No story selected for editing");
      return;
    }

    if (!editStoryForm.title.trim()) {
      toast.error("Story title is required");
      return;
    }

    try {
      const updateData = {
        ...editingStory,
        title: editStoryForm.title.trim(),
        description: editStoryForm.description.trim(),
        priority: editStoryForm.priority,
        storyPoints: editStoryForm.storyPoints,
        dueDate: editStoryForm.dueDate || null,
        assigneeId: editStoryForm.assigneeId || null,
        sprintId: editStoryForm.sprintId || null,
        epicId: editStoryForm.epicId || null,
        releaseId: editStoryForm.releaseId || null,
        acceptanceCriteria: editStoryForm.acceptanceCriteria
          ? editStoryForm.acceptanceCriteria.split('\n').filter((line: string) => line.trim())
          : [],
        labels: editStoryForm.labels
          ? editStoryForm.labels.split(',').map((label: string) => label.trim()).filter((label: string) => label)
          : [],
      };

      await updateStoryMutate({ id: editingStory.id, story: updateData });

      toast.success(`Story "${editStoryForm.title}" updated successfully!`);
      setIsEditStoryDialogOpen(false);
      setEditingStory(null);

      // Refresh stories
      refetchSprintStories();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to update story";
      toast.error(`Failed to update story: ${errorMessage}`);
    }
  };

  const handleOpenLaneConfig = (lane?: WorkflowLane) => {
    setSelectedLaneForEdit(lane || null);

    setIsLaneConfigModalOpen(true);
  };

  // Handler for opening lane configuration modal for a specific status

  const handleOpenLaneConfigForStatus = (status: string) => {
    console.log("handleOpenLaneConfigForStatus called with status:", status);

    if (status === "inprogress") {
      setLaneCreationSource("inprogress");
    } else if (status === "qa") {
      setLaneCreationSource("qa");
    } else {
      setLaneCreationSource(null);
    }

    setSelectedLaneForEdit(null);

    console.log("Setting isLaneConfigModalOpen to true");

    setIsLaneConfigModalOpen(true);

    console.log("Modal should now be open");
  };

  const handleAddTask = async (taskDataFromDialog: any) => {
    // Only managers and QA managers can create tasks
    if (!canAddTasks) {
      toast.error("Only managers and QA managers can create tasks");
      return;
    }

    try {
      // The dialog now sends assignee as user ID directly

      let assigneeId: string | undefined = undefined;

      const assigneeValue = taskDataFromDialog.assignee;

      if (assigneeValue) {
        // If it's already an ID (starts with 'USER' or is a valid ID format), use it directly

        // Otherwise, try to map name to ID for backward compatibility

        if (assigneeValue.startsWith("USER") || assigneeValue.length > 10) {
          assigneeId = assigneeValue;
        } else {
          // Fallback: find user by name (for backward compatibility)

          const foundUser = users.find((u: any) => {
            const userName = `${u.firstName || ""} ${u.lastName || ""}`.trim();

            const emailUser = u.email?.split("@")[0].replace(/\./g, " ");

            return (
              userName === assigneeValue ||
              emailUser?.toLowerCase() === assigneeValue.toLowerCase() ||
              u.name === assigneeValue ||
              `${u.name || ""} Manager`.toLowerCase() ===
              assigneeValue.toLowerCase()
            );
          });

          assigneeId = foundUser?.id || foundUser?.userId;
        }
      }

      // Map priority from dialog format to API format (HIGH/MEDIUM/LOW/BLOCKER/CRITICAL)
      // Handle both lowercase and uppercase inputs

      const priorityMap: Record<string, Priority> = {
        blocker: "BLOCKER",
        critical: "CRITICAL",
        high: "HIGH",
        medium: "MEDIUM",
        low: "LOW",
      };

      const priorityInput = taskDataFromDialog.priority || "medium";
      const apiPriority =
        priorityMap[priorityInput.toLowerCase()] ||
        (["BLOCKER", "CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(priorityInput.toUpperCase()) ? priorityInput.toUpperCase() as Priority : "MEDIUM");

      // Map status from dialog format (todo/inprogress/qa/done) to API format

      const statusMap: Record<string, TaskStatus> = {
        todo: "TO_DO",

        inprogress: "IN_PROGRESS",

        qa: "QA_REVIEW",

        review: "QA_REVIEW",

        done: "DONE",
      };

      const requestedStatus = taskDataFromDialog.status?.toLowerCase() || "todo";

      // Prevent developers from creating tasks with Done status
      if (isDeveloper && (requestedStatus === "done" || statusMap[requestedStatus] === "DONE")) {
        toast.error("Developers cannot add tasks to Done column. Please select another status.");
        return;
      }

      const apiStatus =
        statusMap[requestedStatus] ||
        "TO_DO";

      // Map due date format (dd/MM/yy) to ISO string

      let dueDate: string | undefined = undefined;

      if (taskDataFromDialog.dueDate) {
        try {
          // Try parsing dd/MM/yy format

          const [day, month, year] = taskDataFromDialog.dueDate.split("/");

          if (day && month && year) {
            const fullYear =
              parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);

            const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));

            if (!isNaN(date.getTime())) {
              dueDate = date.toISOString().split("T")[0];
            }
          }
        } catch (e) {
          // If parsing fails, try using as-is if it's already ISO format

          dueDate = taskDataFromDialog.dueDate;
        }
      }

      // Create task data in API format

      const taskData = {
        storyId: taskDataFromDialog.storyId || "",

        title: taskDataFromDialog.title,

        description: taskDataFromDialog.description || "",

        status: apiStatus,

        priority: apiPriority,

        assigneeId: assigneeId,

        reporterId: user?.id || "",

        estimatedHours: taskDataFromDialog.estimatedHours || 0,

        actualHours: 0,

        orderIndex: 0,

        dueDate: dueDate,

        labels: [],
      };

      // Create task via API

      const response = await createTaskMutate(taskData);

      if (response && response.data) {
        // Upload attachments if any
        const hasFiles = taskDataFromDialog.attachments && taskDataFromDialog.attachments.length > 0;
        const hasUrls = taskDataFromDialog.attachmentUrls && taskDataFromDialog.attachmentUrls.length > 0;

        if (hasFiles || hasUrls) {
          try {
            const uploadPromises: Promise<void>[] = [];

            // Upload files
            if (hasFiles) {
              uploadPromises.push(...taskDataFromDialog.attachments.map(
                (file: File) =>
                  uploadFileAndCreateAttachment(file, "task", response.data.id),
              ));
            }

            // Create URL attachments
            if (hasUrls) {
              uploadPromises.push(...taskDataFromDialog.attachmentUrls.map(
                (item: { url: string; name: string }) =>
                  createUrlAttachment(item.url, item.name, "task", response.data.id),
              ));
            }

            await Promise.all(uploadPromises);

            const totalAttachments = (taskDataFromDialog.attachments?.length || 0) + (taskDataFromDialog.attachmentUrls?.length || 0);
            toast.success(
              `Task created with ${totalAttachments} attachment(s)`,
            );
          } catch (error) {
            console.error("Error uploading attachments:", error);

            toast.error("Task created but some attachments failed to upload");
          }
        } else {
          toast.success("Task created successfully");
        }
      } else {
        toast.error("Failed to create task");
      }
    } catch (error: any) {
      console.error("Error creating task:", error);

      toast.error(error?.response?.data?.message || "Failed to create task");
    }
  };

  // Add Issue Handler - Similar to handleAddTask

  const handleAddIssue = async (issueDataFromDialog: any) => {
    // Managers and QA Managers can create issues
    if (!canAddIssues) {
      toast.error("Only managers, QA managers, and QA developers can create issues");
      return;
    }

    // Validate that storyId is provided

    const storyId = issueDataFromDialog.storyId || selectedStoryForIssue;

    if (!storyId || storyId === "none" || storyId === "") {
      toast.error("Issue must be linked to a story. Please select a story.");

      return;
    }

    try {
      // The dialog now sends assignee as user ID directly

      let assigneeId: string | undefined = undefined;

      const assigneeValue = issueDataFromDialog.assignee;

      if (assigneeValue) {
        // If it's already an ID (starts with 'USER' or is a valid ID format), use it directly

        // Otherwise, try to map name to ID for backward compatibility

        if (assigneeValue.startsWith("USER") || assigneeValue.length > 10) {
          assigneeId = assigneeValue;
        } else {
          // Fallback: find user by name (for backward compatibility)

          const foundUser = users.find((u: any) => {
            const userName = `${u.firstName || ""} ${u.lastName || ""}`.trim();

            const emailUser = u.email?.split("@")[0].replace(/\./g, " ");

            return (
              userName === assigneeValue ||
              emailUser?.toLowerCase() === assigneeValue.toLowerCase() ||
              u.name === assigneeValue ||
              `${u.name || ""} Manager`.toLowerCase() ===
              assigneeValue.toLowerCase()
            );
          });

          assigneeId = foundUser?.id || foundUser?.userId;
        }
      }

      // Map priority from dialog format to API format (HIGH/MEDIUM/LOW/BLOCKER/CRITICAL)
      // Handle both lowercase and uppercase inputs

      const priorityMap: Record<string, Priority> = {
        blocker: "BLOCKER",
        critical: "CRITICAL",
        high: "HIGH",
        medium: "MEDIUM",
        low: "LOW",
      };

      const priorityInput = issueDataFromDialog.priority || "medium";
      const apiPriority =
        priorityMap[priorityInput.toLowerCase()] ||
        (["BLOCKER", "CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(priorityInput.toUpperCase()) ? priorityInput.toUpperCase() as Priority : "MEDIUM");

      // Map status from dialog format (todo/inprogress/qa/done) to API format

      const statusMap: Record<string, TaskStatus> = {
        todo: "TO_DO",

        inprogress: "IN_PROGRESS",

        qa: "QA_REVIEW",

        review: "QA_REVIEW",

        done: "DONE",
      };

      const requestedStatus = issueDataFromDialog.status?.toLowerCase() || "todo";

      // Prevent developers from creating issues with Done status
      if (isDeveloper && (requestedStatus === "done" || statusMap[requestedStatus] === "DONE")) {
        toast.error("Developers cannot add issues to Done column. Please select another status.");
        return;
      }

      const apiStatus =
        statusMap[requestedStatus] ||
        "TO_DO";

      // Map due date format (dd/MM/yy) to ISO string

      let dueDate: string | undefined = undefined;

      if (issueDataFromDialog.dueDate) {
        const dateStr = issueDataFromDialog.dueDate;

        // Check if already in ISO format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          dueDate = dateStr;
        } else {
          try {
            // Try parsing dd/MM/yy format (legacy fallback)
            const [day, month, year] = dateStr.split("/");

            if (day && month && year) {
              const fullYear =
                parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);

              const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));

              if (!isNaN(date.getTime())) {
                dueDate = date.toISOString().slice(0, 10);
              }
            }
          } catch (e) {
            // If parsing fails, try using as-is
            dueDate = dateStr;
          }
        }
      }

      // Create issue data in API format

      const issueData = {
        storyId: storyId,

        title: issueDataFromDialog.title,

        description: issueDataFromDialog.description || "",

        status: apiStatus,

        priority: apiPriority,

        assigneeId: assigneeId,

        reporterId: user?.id || "",

        estimatedHours: issueDataFromDialog.estimatedHours || 0,

        actualHours: 0,

        orderIndex: 0,

        dueDate: dueDate,

        labels: [],

        // Linked tasks from the Add Issue dialog (optional)
        linkedTaskIds: (issueDataFromDialog as any).linkedTaskIds || [],
      };

      // Create issue via API (without linkedTaskIds first to avoid validation issues)
      const issueDataForCreate = { ...issueData };
      delete (issueDataForCreate as any).linkedTaskIds;

      const response = await createIssueMutate(issueDataForCreate);

      if (response && response.data) {
        const createdIssueId = response.data.id;
        const linkedTaskIds = (issueDataFromDialog as any).linkedTaskIds || [];

        // Update linked tasks bidirectionally: add this issue ID to each task's linked_issue_ids
        if (linkedTaskIds.length > 0) {
          try {
            // First, update the issue with linkedTaskIds using the dedicated endpoint
            await issueApiService.updateIssueLinkedTaskIds(createdIssueId, linkedTaskIds);

            // Then, update each linked task to include this issue in their linked_issue_ids
            const taskUpdatePromises = linkedTaskIds.map(async (taskId: string) => {
              try {
                // Fetch the current task to get its existing linkedIssueIds
                const taskRes = await taskApiService.getTaskById(taskId);
                const currentTask = taskRes.data as any;
                const existingLinkedIssueIds: string[] =
                  currentTask?.linkedIssueIds ||
                  currentTask?.linked_issue_ids ||
                  [];

                // Add this issue ID if not already present
                if (!existingLinkedIssueIds.includes(createdIssueId)) {
                  const updatedLinkedIssueIds = [...existingLinkedIssueIds, createdIssueId];
                  await taskApiService.updateTaskLinkedIssueIds(taskId, updatedLinkedIssueIds);
                  console.log(`[ScrumPage] Updated task ${taskId} with linked issue ${createdIssueId}`);
                }
              } catch (taskError) {
                console.error(`[ScrumPage] Error updating task ${taskId} with linked issue:`, taskError);
              }
            });

            await Promise.all(taskUpdatePromises);
            console.log(`[ScrumPage] Successfully synced ${linkedTaskIds.length} linked tasks with issue ${createdIssueId}`);
          } catch (syncError) {
            console.error('[ScrumPage] Error syncing linked tasks:', syncError);
            toast.error('Issue created but failed to sync linked tasks');
          }
        }

        // Create subtasks if any

        if (
          issueDataFromDialog.subtasks &&
          issueDataFromDialog.subtasks.length > 0
        ) {
          try {
            const validSubtasks = issueDataFromDialog.subtasks.filter(
              (st: string) => st.trim(),
            );

            if (validSubtasks.length > 0) {
              const subtaskPromises = validSubtasks.map(
                (subtaskTitle: string) =>
                  subtaskApiService.createSubtask({
                    issueId: createdIssueId,

                    title: subtaskTitle.trim(),

                    description: "",

                    isCompleted: false,

                    assigneeId: assigneeId || undefined,

                    estimatedHours: undefined,

                    actualHours: 0,

                    orderIndex: 0,
                  }),
              );

              const createdSubtasks = await Promise.all(subtaskPromises);

              // Add created subtasks to allSubtasks state immediately

              const newSubtasks = createdSubtasks

                .map((res) => {
                  // Handle different response structures

                  const subtask = res?.data || res;

                  return subtask;
                })

                .filter(
                  (subtask) =>
                    subtask !== null && subtask !== undefined && subtask.id,
                );

              if (newSubtasks.length > 0) {
                setAllSubtasks((prev) => {
                  // Remove any existing subtasks for this issue (in case of duplicates)

                  const otherSubtasks = prev.filter(
                    (st) => st.issueId !== createdIssueId,
                  );

                  return [...otherSubtasks, ...newSubtasks];
                });
              }

              // Also refetch to ensure we have the latest data

              try {
                const response =
                  await subtaskApiService.getSubtasksByIssue(createdIssueId);

                const fetchedSubtasks = response.data || [];

                if (fetchedSubtasks.length > 0) {
                  setAllSubtasks((prev) => {
                    const otherSubtasks = prev.filter(
                      (st) => st.issueId !== createdIssueId,
                    );

                    return [...otherSubtasks, ...fetchedSubtasks];
                  });
                }
              } catch (error) {
                console.error(
                  "Error refetching subtasks after creation:",
                  error,
                );
              }

              toast.success(
                `Issue created with ${validSubtasks.length} subtask(s)`,
              );
            }
          } catch (error) {
            console.error("Error creating subtasks:", error);

            toast.error("Issue created but some subtasks failed to create");
          }
        }

        // Upload attachments if any
        const hasFiles = issueDataFromDialog.attachments && issueDataFromDialog.attachments.length > 0;
        const hasUrls = issueDataFromDialog.attachmentUrls && issueDataFromDialog.attachmentUrls.length > 0;

        if (hasFiles || hasUrls) {
          try {
            const uploadPromises: Promise<void>[] = [];

            // Upload files
            if (hasFiles) {
              uploadPromises.push(...issueDataFromDialog.attachments.map(
                (file: File) =>
                  uploadFileAndCreateAttachment(file, "issue", createdIssueId),
              ));
            }

            // Create URL attachments
            if (hasUrls) {
              uploadPromises.push(...issueDataFromDialog.attachmentUrls.map(
                (item: { url: string; name: string }) =>
                  createUrlAttachment(item.url, item.name, "issue", createdIssueId),
              ));
            }

            await Promise.all(uploadPromises);

            const totalAttachments = (issueDataFromDialog.attachments?.length || 0) + (issueDataFromDialog.attachmentUrls?.length || 0);
            toast.success(
              `Issue created with ${totalAttachments} attachment(s)`,
            );
          } catch (error) {
            console.error("Error uploading attachments:", error);

            toast.error("Issue created but some attachments failed to upload");
          }
        } else if (
          !issueDataFromDialog.subtasks ||
          issueDataFromDialog.subtasks.length === 0
        ) {
          toast.success("Issue created successfully");
        }

        // Log activity

        try {
          await activityLogApiService.createActivityLog({
            userId: user?.id || "",

            entityType: "issues",

            entityId: response.data.id,

            action: "created",

            description: `Created issue "${issueDataFromDialog.title}"${issueDataFromDialog.attachments && issueDataFromDialog.attachments.length > 0 ? ` with ${issueDataFromDialog.attachments.length} attachment(s)` : ""}`,

            newValues: JSON.stringify(issueData),

            ipAddress: undefined,

            userAgent: undefined,
          });
        } catch (error) {
          console.error("Failed to log activity:", error);
        }

        // Refresh tasks and stories (both sprint and backlog)

        refetchSprintStories();

        refetchBacklogStories();

        // Refetch tasks after a short delay to ensure stories are updated

        setTimeout(() => {
          fetchAllTasks(sprintStories, true);
        }, 500);
      } else {
        throw new Error("Failed to create task");
      }
    } catch (error: any) {
      console.error("Error creating task:", error);

      toast.error(error?.message || "Failed to create task. Please try again.");
    }
  };

  // View Task Details Handler (JIRA-style) - will be defined in component scope

  // Handle subtask dialog close

  const handleSubtaskDialogClose = (open: boolean) => {
    setIsAddSubtaskDialogOpen(open);

    if (!open) {
      setNewSubtask({
        title: "",

        description: "",

        taskId: "",

        assigneeId: "",

        estimatedHours: 0,

        category: "",

        dueDate: "",
      });

      setSelectedTaskForSubtask(null);

      setSelectedIssueForSubtask(null);
    }
  };

  // Add Subtask Handler

  const handleAddSubtask = async () => {
    if (!newSubtask.title.trim()) {
      toast.error("Please enter a subtask title");

      return;
    }

    // Validate that either task or issue is selected

    if (!selectedTaskForSubtask && !selectedIssueForSubtask) {
      toast.error("Please select a task or issue");

      return;
    }

    // Validation: Check subtask category limits and hours
    if (selectedTaskForSubtask) {
      // Get all existing subtasks for this task
      const existingSubtasks = allSubtasks.filter(
        (st) => st.taskId === selectedTaskForSubtask.id
      );

      // Check category limits: Max 2 Major, Max 1 Other
      const category = newSubtask.category || "";
      if (category === "Major") {
        const majorCount = existingSubtasks.filter(
          (st) => st.category === "Major"
        ).length;
        if (majorCount >= 2) {
          toast.error("Maximum 2 Major subtasks allowed per task");
          return;
        }
      } else if (category === "Other") {
        const otherCount = existingSubtasks.filter(
          (st) => st.category === "Other"
        ).length;
        if (otherCount >= 1) {
          toast.error("Maximum 1 Other subtask allowed per task");
          return;
        }
      }

      // Check total hours: Sum of all subtask hours must not exceed task hours
      const taskEstimatedHours = selectedTaskForSubtask.estimatedHours || 0;
      if (taskEstimatedHours > 0) {
        const existingSubtaskHours = existingSubtasks.reduce(
          (sum, st) => sum + (st.estimatedHours || 0),
          0
        );
        const newSubtaskHours = newSubtask.estimatedHours || 0;
        const totalSubtaskHours = existingSubtaskHours + newSubtaskHours;

        if (totalSubtaskHours > taskEstimatedHours) {
          toast.error(
            `Total subtask hours (${totalSubtaskHours}h) cannot exceed task hours (${taskEstimatedHours}h). Please reduce subtask hours.`
          );
          return;
        }
      }
    } else if (selectedIssueForSubtask) {
      // Similar validation for issues
      const existingSubtasks = allSubtasks.filter(
        (st) => st.issueId === selectedIssueForSubtask.id
      );

      const category = newSubtask.category || "";
      if (category === "Major") {
        const majorCount = existingSubtasks.filter(
          (st) => st.category === "Major"
        ).length;
        if (majorCount >= 2) {
          toast.error("Maximum 2 Major subtasks allowed per issue");
          return;
        }
      } else if (category === "Other") {
        const otherCount = existingSubtasks.filter(
          (st) => st.category === "Other"
        ).length;
        if (otherCount >= 1) {
          toast.error("Maximum 1 Other subtask allowed per issue");
          return;
        }
      }

      const issueEstimatedHours = selectedIssueForSubtask.estimatedHours || 0;
      if (issueEstimatedHours > 0) {
        const existingSubtaskHours = existingSubtasks.reduce(
          (sum, st) => sum + (st.estimatedHours || 0),
          0
        );
        const newSubtaskHours = newSubtask.estimatedHours || 0;
        const totalSubtaskHours = existingSubtaskHours + newSubtaskHours;

        if (totalSubtaskHours > issueEstimatedHours) {
          toast.error(
            `Total subtask hours (${totalSubtaskHours}h) cannot exceed issue hours (${issueEstimatedHours}h). Please reduce subtask hours.`
          );
          return;
        }
      }
    }

    setIsCreatingSubtask(true);

    try {
      // Format due date if provided

      let formattedDueDate: string | undefined = undefined;

      if (newSubtask.dueDate) {
        try {
          const date = new Date(newSubtask.dueDate);

          if (!isNaN(date.getTime())) {
            formattedDueDate = date.toISOString().split("T")[0];
          }
        } catch (e) {
          console.error("Error formatting due date:", e);
        }
      }

      const subtaskData = {
        taskId: selectedTaskForSubtask?.id || undefined,

        issueId: selectedIssueForSubtask?.id || undefined,

        title: newSubtask.title,

        description: newSubtask.description,

        isCompleted: false,

        assigneeId: newSubtask.assigneeId || undefined,

        estimatedHours: newSubtask.estimatedHours,

        actualHours: 0,

        orderIndex: 0,

        dueDate: formattedDueDate,

        category: newSubtask.category || undefined,

        labels: [],
      };

      const result = await subtaskApiService.createSubtask(subtaskData);

      console.log("Subtask created result:", result);

      // Log activity for subtask creation

      try {
        if (selectedTaskForSubtask) {
          await activityLogApiService.createActivityLog({
            userId: user?.id || "",

            entityType: "tasks",

            entityId: selectedTaskForSubtask.id,

            action: "subtask_created",

            description: `Created subtask "${newSubtask.title}"`,

            newValues: JSON.stringify(subtaskData),

            ipAddress: undefined,

            userAgent: undefined,
          });
        } else if (selectedIssueForSubtask) {
          await activityLogApiService.createActivityLog({
            userId: user?.id || "",

            entityType: "issues",

            entityId: selectedIssueForSubtask.id,

            action: "subtask_created",

            description: `Created subtask "${newSubtask.title}"`,

            newValues: JSON.stringify(subtaskData),

            ipAddress: undefined,

            userAgent: undefined,
          });
        }
      } catch (error) {
        console.error("Failed to log activity:", error);
      }

      toast.success("Subtask created successfully");

      // Manually refetch subtasks for the specific task or issue to update the display immediately

      if (selectedTaskForSubtask) {
        try {
          const response = await subtaskApiService.getSubtasksByTask(
            selectedTaskForSubtask.id,
          );

          // Update allSubtasks with the new data

          setAllSubtasks((prev) => {
            // Remove existing subtasks for this task and add new ones

            const otherSubtasks = prev.filter(
              (st) => st.taskId !== selectedTaskForSubtask.id,
            );

            return [...otherSubtasks, ...response.data];
          });

          // Also reset the previousTaskIdsRef to force refetch on next change

          previousTaskIdsRef.current = "";
        } catch (error) {
          console.error("Failed to refetch subtasks:", error);
        }
      } else if (selectedIssueForSubtask) {
        try {
          const response = await subtaskApiService.getSubtasksByIssue(
            selectedIssueForSubtask.id,
          );

          // Update allSubtasks with the new data

          setAllSubtasks((prev) => {
            // Remove existing subtasks for this issue and add new ones

            const otherSubtasks = prev.filter(
              (st) => st.issueId !== selectedIssueForSubtask.id,
            );

            return [...otherSubtasks, ...response.data];
          });
        } catch (error) {
          console.error("Failed to refetch subtasks:", error);
        }
      }

      // Also refetch all tasks to ensure everything is in sync

      if (sprintStories.length > 0) {
        fetchAllTasks(sprintStories, true);
      }

      setIsAddSubtaskDialogOpen(false);

      setSelectedTaskForSubtask(null);

      setSelectedIssueForSubtask(null);
    } catch (error) {
      toast.error("Failed to create subtask");

      console.error("Error creating subtask:", error);
    } finally {
      setIsCreatingSubtask(false);
    }
  };

  // Edit Subtask Handler
  const handleEditSubtask = async () => {
    if (!selectedSubtaskForEdit || !newSubtask.title.trim()) {
      toast.error("Please enter a subtask title");
      return;
    }

    // Validation: Check subtask category limits and hours
    if (selectedSubtaskForEdit.taskId) {
      // Get all existing subtasks for this task (excluding the one being edited)
      const existingSubtasks = allSubtasks.filter(
        (st) => st.taskId === selectedSubtaskForEdit.taskId && st.id !== selectedSubtaskForEdit.id
      );

      // Find the parent task
      const parentTask = allTasks.find(
        (t) => t.id === selectedSubtaskForEdit.taskId
      );

      if (parentTask) {
        // Check category limits: Max 2 Major, Max 1 Other
        const category = newSubtask.category || "";
        if (category === "Major") {
          const majorCount = existingSubtasks.filter(
            (st) => st.category === "Major"
          ).length;
          // Only check if the category is being changed to Major
          if (selectedSubtaskForEdit.category !== "Major" && majorCount >= 2) {
            toast.error("Maximum 2 Major subtasks allowed per task");
            return;
          }
        } else if (category === "Other") {
          const otherCount = existingSubtasks.filter(
            (st) => st.category === "Other"
          ).length;
          // Only check if the category is being changed to Other
          if (selectedSubtaskForEdit.category !== "Other" && otherCount >= 1) {
            toast.error("Maximum 1 Other subtask allowed per task");
            return;
          }
        }

        // Check total hours: Sum of all subtask hours must not exceed task hours
        const taskEstimatedHours = parentTask.estimatedHours || 0;
        if (taskEstimatedHours > 0) {
          const existingSubtaskHours = existingSubtasks.reduce(
            (sum, st) => sum + (st.estimatedHours || 0),
            0
          );
          const editedSubtaskHours = newSubtask.estimatedHours || 0;
          const totalSubtaskHours = existingSubtaskHours + editedSubtaskHours;

          if (totalSubtaskHours > taskEstimatedHours) {
            toast.error(
              `Total subtask hours (${totalSubtaskHours}h) cannot exceed task hours (${taskEstimatedHours}h). Please reduce subtask hours.`
            );
            return;
          }
        }
      }
    } else if (selectedSubtaskForEdit.issueId) {
      // Similar validation for issues
      const existingSubtasks = allSubtasks.filter(
        (st) => st.issueId === selectedSubtaskForEdit.issueId && st.id !== selectedSubtaskForEdit.id
      );

      const parentIssue = allIssues.find(
        (i) => i.id === selectedSubtaskForEdit.issueId
      );

      if (parentIssue) {
        const category = newSubtask.category || "";
        if (category === "Major") {
          const majorCount = existingSubtasks.filter(
            (st) => st.category === "Major"
          ).length;
          if (selectedSubtaskForEdit.category !== "Major" && majorCount >= 2) {
            toast.error("Maximum 2 Major subtasks allowed per issue");
            return;
          }
        } else if (category === "Other") {
          const otherCount = existingSubtasks.filter(
            (st) => st.category === "Other"
          ).length;
          if (selectedSubtaskForEdit.category !== "Other" && otherCount >= 1) {
            toast.error("Maximum 1 Other subtask allowed per issue");
            return;
          }
        }

        const issueEstimatedHours = parentIssue.estimatedHours || 0;
        if (issueEstimatedHours > 0) {
          const existingSubtaskHours = existingSubtasks.reduce(
            (sum, st) => sum + (st.estimatedHours || 0),
            0
          );
          const editedSubtaskHours = newSubtask.estimatedHours || 0;
          const totalSubtaskHours = existingSubtaskHours + editedSubtaskHours;

          if (totalSubtaskHours > issueEstimatedHours) {
            toast.error(
              `Total subtask hours (${totalSubtaskHours}h) cannot exceed issue hours (${issueEstimatedHours}h). Please reduce subtask hours.`
            );
            return;
          }
        }
      }
    }

    setIsCreatingSubtask(true);

    try {
      // Format due date if provided
      let formattedDueDate: string | undefined = undefined;
      if (newSubtask.dueDate) {
        try {
          const date = new Date(newSubtask.dueDate);
          if (!isNaN(date.getTime())) {
            formattedDueDate = date.toISOString().split("T")[0];
          }
        } catch (e) {
          console.error("Error formatting due date:", e);
        }
      }

      const subtaskData = {
        title: newSubtask.title,
        description: newSubtask.description,
        assigneeId: newSubtask.assigneeId || undefined,
        estimatedHours: newSubtask.estimatedHours,
        dueDate: formattedDueDate,
        category: newSubtask.category || undefined,
        // Preserve the parent task/issue relationship
        taskId: selectedSubtaskForEdit.taskId || undefined,
        issueId: selectedSubtaskForEdit.issueId || undefined,
      };

      // Update subtask in database via API
      console.log("Updating subtask in database:", {
        id: selectedSubtaskForEdit.id,
        data: subtaskData
      });

      const updateResponse = await subtaskApiService.updateSubtask(selectedSubtaskForEdit.id, subtaskData);

      // Verify the update was successful
      if (!updateResponse) {
        throw new Error("No response received from server");
      }

      if (!updateResponse.success) {
        throw new Error(updateResponse.message || "Failed to update subtask in database");
      }

      if (!updateResponse.data) {
        throw new Error("Update response missing data");
      }

      console.log("Subtask updated successfully in database:", updateResponse.data);

      // Update local state immediately with the updated subtask from database
      setAllSubtasks((prev) =>
        prev.map((st) =>
          st.id === selectedSubtaskForEdit.id
            ? { ...st, ...updateResponse.data }
            : st
        )
      );

      // Log activity for subtask update
      try {
        if (selectedSubtaskForEdit.taskId) {
          await activityLogApiService.createActivityLog({
            userId: user?.id || "",
            entityType: "tasks",
            entityId: selectedSubtaskForEdit.taskId,
            action: "subtask_updated",
            description: `Updated subtask "${newSubtask.title}"`,
            oldValues: JSON.stringify(selectedSubtaskForEdit),
            newValues: JSON.stringify(subtaskData),
            ipAddress: undefined,
            userAgent: undefined,
          });
        }
      } catch (error) {
        console.error("Failed to log activity:", error);
      }

      toast.success("Subtask updated successfully");

      // Refresh tasks to update subtasks
      if (sprintStories.length > 0) {
        fetchAllTasks(sprintStories, true);
      }

      // Manually refetch subtasks for the specific task
      if (selectedSubtaskForEdit.taskId) {
        try {
          const response = await subtaskApiService.getSubtasksByTask(
            selectedSubtaskForEdit.taskId,
          );
          setAllSubtasks((prev) => {
            const otherSubtasks = prev.filter(
              (st) => st.taskId !== selectedSubtaskForEdit.taskId,
            );
            return [...otherSubtasks, ...response.data];
          });
        } catch (error) {
          console.error("Failed to refetch subtasks:", error);
        }
      }

      // Manually refetch subtasks for the specific issue (if it's an issue subtask)
      if (selectedSubtaskForEdit.issueId) {
        try {
          const response = await subtaskApiService.getSubtasksByIssue(
            selectedSubtaskForEdit.issueId,
          );
          setAllSubtasks((prev) => {
            const otherSubtasks = prev.filter(
              (st) => st.issueId !== selectedSubtaskForEdit.issueId,
            );
            return [...otherSubtasks, ...response.data];
          });
        } catch (error) {
          console.error("Failed to refetch issue subtasks:", error);
        }
      }

      // Reset form and close dialog
      setNewSubtask({
        title: "",
        description: "",
        taskId: "",
        assigneeId: "",
        estimatedHours: 0,
        category: "",
        dueDate: "",
      });

      setIsEditSubtaskDialogOpen(false);
      setSelectedSubtaskForEdit(null);
    } catch (error: any) {
      console.error("Error updating subtask:", error);
      toast.error(
        error?.message || "Failed to update subtask. Please try again.",
      );
    } finally {
      setIsCreatingSubtask(false);
    }
  };

  // Handle subtask effort logging
  const handleLogSubtaskEffort = async () => {
    // Block logging if sprint has ended
    if (isSprintEnded) {
      toast.error("Cannot log time - sprint has ended");
      return;
    }
    if (!selectedSubtaskForLog || !subtaskLogEffort.hours || subtaskLogEffort.hours <= 0) {
      toast.error("Please enter valid hours");
      return;
    }
    if (!subtaskLogEffort.description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!subtaskLogEffort.workDate) {
      toast.error("Please select a work date");
      return;
    }

    try {
      setIsLoggingSubtaskEffort(true);
      const timeEntryData = {
        userId: user?.id || "",
        subtaskId: selectedSubtaskForLog.id,
        taskId: selectedSubtaskForLog.taskId || undefined,
        issueId: selectedSubtaskForLog.issueId || undefined,
        description: subtaskLogEffort.description,
        entryType: "development" as const,
        hoursWorked: subtaskLogEffort.hours,
        workDate: subtaskLogEffort.workDate,
        startTime: subtaskLogEffort.startTime?.trim() || undefined,
        endTime: subtaskLogEffort.endTime?.trim() || undefined,
        isBillable: true,
      };

      await timeEntryApiService.createTimeEntry(timeEntryData);

      // Upload attachments if any
      if (subtaskLogAttachments.length > 0) {
        try {
          for (const file of subtaskLogAttachments) {
            const fileDataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = (error) => reject(error);
            });
            await attachmentApiService.createAttachment({
              uploadedBy: user?.id,
              entityType: 'subtask',
              entityId: selectedSubtaskForLog.id,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type || "application/octet-stream",
              fileUrl: fileDataUrl,
              attachmentType: 'file' as const,
              isPublic: true,
            });
          }
        } catch (attachError) {
          console.error("Error uploading attachments:", attachError);
          toast.error("Effort logged, but some attachments failed to upload");
        }
      }

      // Update subtask actual hours
      const updatedActualHours = (selectedSubtaskForLog.actualHours || 0) + subtaskLogEffort.hours;
      await subtaskApiService.updateSubtaskActualHours(selectedSubtaskForLog.id, updatedActualHours);

      // Update local subtask state immediately for instant UI update
      setAllSubtasks((prev) =>
        prev.map((st) =>
          st.id === selectedSubtaskForLog.id
            ? { ...st, actualHours: updatedActualHours }
            : st
        )
      );

      // If this subtask belongs to an issue, ADD logged hours to parent issue's actual hours
      if (selectedSubtaskForLog.issueId) {
        const parentIssue = allIssues.find(i => i.id === selectedSubtaskForLog.issueId);
        if (parentIssue) {
          // Add the logged hours to parent issue's existing actual hours
          const newParentActualHours = (parentIssue.actualHours || 0) + subtaskLogEffort.hours;

          // Update parent issue's actual hours
          await issueApiService.updateIssueActualHours(parentIssue.id, newParentActualHours);

          // Update parent issue in allIssues state
          setAllIssues((prev) =>
            prev.map((issue) =>
              issue.id === parentIssue.id
                ? { ...issue, actualHours: newParentActualHours }
                : issue
            )
          );

          // Update selectedIssueForDetails if it matches the parent issue
          setSelectedIssueForDetails((prev) =>
            prev?.id === parentIssue.id
              ? { ...prev, actualHours: newParentActualHours }
              : prev
          );
        }
      }

      // If this subtask belongs to a task, ADD logged hours to parent task's actual hours
      if (selectedSubtaskForLog.taskId) {
        const parentTask = allTasks.find(t => t.id === selectedSubtaskForLog.taskId);
        if (parentTask) {
          // Add the logged hours to parent task's existing actual hours
          const newParentActualHours = (parentTask.actualHours || 0) + subtaskLogEffort.hours;

          await taskApiService.updateTaskActualHours(parentTask.id, newParentActualHours);

          setAllTasks((prev) =>
            prev.map((task) =>
              task.id === parentTask.id
                ? { ...task, actualHours: newParentActualHours }
                : task
            )
          );

          setSelectedTaskForDetails((prev) =>
            prev?.id === parentTask.id
              ? { ...prev, actualHours: newParentActualHours }
              : prev
          );
        }
      }

      // Automatically move parent issue to IN_PROGRESS if it's currently in TO_DO status
      if (selectedSubtaskForLog.issueId) {
        const parentIssue = allIssues.find(i => i.id === selectedSubtaskForLog.issueId);
        if (parentIssue) {
          const currentStatus = parentIssue.status?.toUpperCase() || "";
          if (currentStatus === "TO_DO" || currentStatus === "TODO") {
            try {
              // Use direct API call instead of mutate for proper async handling
              await issueApiService.updateIssueStatus(parentIssue.id, "IN_PROGRESS");

              // Update local state immediately
              setAllIssues((prev) =>
                prev.map((issue) =>
                  issue.id === parentIssue.id
                    ? { ...issue, status: "IN_PROGRESS" as any }
                    : issue
                )
              );
              setSelectedIssueForDetails((prev) =>
                prev?.id === parentIssue.id
                  ? { ...prev, status: "IN_PROGRESS" as any }
                  : prev
              );

              // Log activity for status change
              try {
                await activityLogApiService.createActivityLog({
                  userId: user?.id || "",
                  entityType: "issues",
                  entityId: parentIssue.id,
                  action: "status_changed",
                  description: `Issue automatically moved to IN_PROGRESS after logging subtask effort`,
                  oldValues: JSON.stringify({ status: currentStatus }),
                  newValues: JSON.stringify({ status: "IN_PROGRESS" }),
                  ipAddress: undefined,
                  userAgent: undefined,
                });
              } catch (error) {
                console.error("Failed to log activity for status change:", error);
              }

              toast.success("Issue moved to In Progress automatically");
            } catch (error) {
              console.error("Failed to update issue status to IN_PROGRESS:", error);
            }
          }
        }
      }

      // Automatically move parent task to IN_PROGRESS if it's currently in TO_DO status
      if (selectedSubtaskForLog.taskId) {
        const parentTask = allTasks.find(t => t.id === selectedSubtaskForLog.taskId);
        if (parentTask) {
          const currentStatus = parentTask.status?.toUpperCase() || "";
          if (currentStatus === "TO_DO" || currentStatus === "TODO") {
            try {
              // Use direct API call instead of mutate for proper async handling
              await taskApiService.updateTaskStatus(parentTask.id, "IN_PROGRESS");

              // Update local state immediately
              setAllTasks((prev) =>
                prev.map((task) =>
                  task.id === parentTask.id
                    ? { ...task, status: "IN_PROGRESS" as any }
                    : task
                )
              );
              setSelectedTaskForDetails((prev) =>
                prev?.id === parentTask.id
                  ? { ...prev, status: "IN_PROGRESS" as any }
                  : prev
              );

              // Log activity for status change
              try {
                await activityLogApiService.createActivityLog({
                  userId: user?.id || "",
                  entityType: "tasks",
                  entityId: parentTask.id,
                  action: "status_changed",
                  description: `Task automatically moved to IN_PROGRESS after logging subtask effort`,
                  oldValues: JSON.stringify({ status: currentStatus }),
                  newValues: JSON.stringify({ status: "IN_PROGRESS" }),
                  ipAddress: undefined,
                  userAgent: undefined,
                });
              } catch (error) {
                console.error("Failed to log activity for status change:", error);
              }

              toast.success("Task moved to In Progress automatically");
            } catch (error) {
              console.error("Failed to update task status to IN_PROGRESS:", error);
            }
          }
        }
      }

      // Refresh task logs so the new time entry is visible in the Activities tab
      if (selectedSubtaskForLog.taskId) {
        try {
          const response = await timeEntryApiService.getTimeEntriesByTask(selectedSubtaskForLog.taskId);
          const logs = Array.isArray(response.data)
            ? response.data
            : (Array.isArray(response) ? response : []);
          setTaskLogs(logs);
        } catch (error) {
          console.error("Failed to refresh task logs:", error);
        }
      }

      // Refresh issue logs so the new time entry is visible in the Activities tab
      if (selectedSubtaskForLog.issueId) {
        try {
          const response = await timeEntryApiService.getTimeEntriesByIssue(selectedSubtaskForLog.issueId);
          const logs = Array.isArray(response.data)
            ? response.data
            : (Array.isArray(response) ? response : []);
          setIssueLogs(logs);
        } catch (error) {
          console.error("Failed to refresh issue logs:", error);
        }
      }

      toast.success("Subtask effort logged successfully");
      setIsSubtaskLogEffortOpen(false);
      setSelectedSubtaskForLog(null);
      setSubtaskLogEffort({
        hours: 0,
        description: "",
        workDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
      });
      setSubtaskLogAttachments([]);
    } catch (error) {
      console.error("Error logging subtask effort:", error);
      toast.error("Failed to log subtask effort");
    } finally {
      setIsLoggingSubtaskEffort(false);
    }
  };

  // Edit Time Entry Handler
  const handleEditTimeEntry = async () => {
    if (!selectedLogForEdit || !editLogData.hoursWorked || editLogData.hoursWorked <= 0) {
      toast.error("Please enter valid hours");
      return;
    }

    try {
      // Ensure description is not empty (required field)
      if (!editLogData.description || editLogData.description.trim() === "") {
        toast.error("Description is required");
        return;
      }

      // Build update data with all required fields from the original entry
      // The backend expects the full TimeEntry object, so we need to preserve all required fields
      const updateData: Partial<TimeEntry> = {
        // Preserve all required fields from the original entry
        userId: selectedLogForEdit.userId,
        entryType: selectedLogForEdit.entryType || 'development',
        isBillable: selectedLogForEdit.isBillable !== undefined ? selectedLogForEdit.isBillable : true,
        // Update fields
        hoursWorked: editLogData.hoursWorked,
        description: editLogData.description.trim(),
        workDate: editLogData.workDate,
        // Optional fields - preserve if they exist, or set to undefined if empty
        startTime: editLogData.startTime && editLogData.startTime.trim() !== "" ? editLogData.startTime : undefined,
        endTime: editLogData.endTime && editLogData.endTime.trim() !== "" ? editLogData.endTime : undefined,
        // Preserve optional IDs if they exist
        projectId: selectedLogForEdit.projectId || undefined,
        storyId: selectedLogForEdit.storyId || undefined,
        taskId: selectedLogForEdit.taskId || undefined,
        subtaskId: selectedLogForEdit.subtaskId || undefined,
      };

      console.log("Updating time entry in database:", {
        id: selectedLogForEdit.id,
        data: updateData
      });

      const updateResponse = await timeEntryApiService.updateTimeEntry(selectedLogForEdit.id, updateData);

      notifyProjectBudgetUpdate("time-entry-updated");

      if (!updateResponse || !updateResponse.success) {
        throw new Error(updateResponse?.message || "Failed to update time entry in database");
      }

      console.log("Time entry updated successfully in database:", updateResponse.data);

      // Update local state
      setTaskLogs((prev) =>
        prev.map((log) =>
          log.id === selectedLogForEdit.id
            ? { ...log, ...updateResponse.data }
            : log
        )
      );

      // Log activity
      try {
        if (selectedLogForEdit.taskId) {
          await activityLogApiService.createActivityLog({
            userId: user?.id || "",
            entityType: "tasks",
            entityId: selectedLogForEdit.taskId,
            action: "time_entry_updated",
            description: `Updated time entry: ${editLogData.hoursWorked}h`,
            oldValues: JSON.stringify(selectedLogForEdit),
            newValues: JSON.stringify(updateData),
            ipAddress: undefined,
            userAgent: undefined,
          });
        }
      } catch (error) {
        console.error("Failed to log activity:", error);
      }

      toast.success("Time entry updated successfully");

      // Reset form and close dialog
      setEditLogData({
        hoursWorked: 0,
        description: "",
        workDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
      });
      setIsEditLogDialogOpen(false);
      setSelectedLogForEdit(null);
    } catch (error: any) {
      console.error("Error updating time entry:", error);
      toast.error(
        error?.message || "Failed to update time entry. Please try again.",
      );
    }
  };

  // Issue Activity Log Component

  const IssueActivityLog: React.FC<{ issueId: string }> = ({ issueId }) => {
    const { activityLogs, loading, error } = useRecentActivityByEntity(
      "issues",
      issueId,
      30,
    );

    const getActionIcon = (action: string) => {
      switch (action.toLowerCase()) {
        case "created":
          return <Plus className="w-4 h-4 text-green-600" />;

        case "updated":
          return <Edit3 className="w-4 h-4 text-blue-600" />;

        case "deleted":
          return <Trash2 className="w-4 h-4 text-red-600" />;

        case "status_changed":
          return <TrendingUp className="w-4 h-4 text-purple-600" />;

        case "assigned":
          return <User className="w-4 h-4 text-orange-600" />;

        default:
          return <History className="w-4 h-4 text-gray-600" />;
      }
    };

    const formatActivityTime = (timestamp: string) => {
      const date = new Date(timestamp);

      const now = new Date();

      const diffMs = now.getTime() - date.getTime();

      const diffMins = Math.floor(diffMs / 60000);

      const diffHours = Math.floor(diffMins / 60);

      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "just now";

      if (diffMins < 60) return `${diffMins}m ago`;

      if (diffHours < 24) return `${diffHours}h ago`;

      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />

          <span className="ml-2 text-sm text-gray-600">
            Loading activity...
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />

          <p className="text-sm">Failed to load activity logs</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Activity Timeline */}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Activity</h3>

          {activityLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />

              <p className="text-sm">No activity yet</p>

              <p className="text-xs text-gray-400 mt-1">
                Activity will appear here as you work on this issue
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(log.action)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-red-100 text-red-800 text-xs">
                            {log.userId
                              ? getUserName(log.userId)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                              : "SYS"}
                          </AvatarFallback>
                        </Avatar>

                        <span className="text-sm font-medium text-gray-900">
                          {log.userId ? getUserName(log.userId) : "System"}
                        </span>
                      </div>

                      <span className="text-xs text-gray-500">
                        {formatActivityTime(log.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700">
                      {log.description || `${log.action} ${log.entityType}`}
                    </p>

                    {log.newValues && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                          {typeof log.newValues === "string"
                            ? log.newValues.substring(0, 200)
                            : JSON.stringify(log.newValues, null, 2).substring(
                              0,
                              200,
                            )}

                          {(typeof log.newValues === "string"
                            ? log.newValues.length
                            : JSON.stringify(log.newValues).length) > 200 &&
                            "..."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Task Activity Log Component

  const TaskActivityLog: React.FC<{ taskId: string }> = ({ taskId }) => {
    const { activityLogs, loading, error } = useRecentActivityByEntity(
      "tasks",
      taskId,
      30,
    );

    const getActionIcon = (action: string) => {
      switch (action.toLowerCase()) {
        case "created":
          return <Plus className="w-4 h-4 text-green-600" />;

        case "updated":
          return <Edit3 className="w-4 h-4 text-blue-600" />;

        case "deleted":
          return <Trash2 className="w-4 h-4 text-red-600" />;

        case "status_changed":
          return <TrendingUp className="w-4 h-4 text-purple-600" />;

        case "assigned":
          return <User className="w-4 h-4 text-orange-600" />;

        default:
          return <History className="w-4 h-4 text-gray-600" />;
      }
    };

    const formatActivityTime = (timestamp: string) => {
      const date = new Date(timestamp);

      const now = new Date();

      const diffMs = now.getTime() - date.getTime();

      const diffMins = Math.floor(diffMs / 60000);

      const diffHours = Math.floor(diffMins / 60);

      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "just now";

      if (diffMins < 60) return `${diffMins}m ago`;

      if (diffHours < 24) return `${diffHours}h ago`;

      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />

          <span className="ml-2 text-sm text-gray-600">
            Loading activity...
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />

          <p className="text-sm">Failed to load activity logs</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Activity Timeline */}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Activity</h3>

          {activityLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />

              <p className="text-sm">No activity yet</p>

              <p className="text-xs text-gray-400 mt-1">
                Activity will appear here as you work on this task
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(log.action)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                            {log.userId
                              ? getUserName(log.userId)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                              : "SYS"}
                          </AvatarFallback>
                        </Avatar>

                        <span className="text-sm font-medium text-gray-900">
                          {log.userId ? getUserName(log.userId) : "System"}
                        </span>
                      </div>

                      <span className="text-xs text-gray-500">
                        {formatActivityTime(log.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700">
                      {log.description || `${log.action} ${log.entityType}`}
                    </p>

                    {log.newValues && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                          {typeof log.newValues === "string"
                            ? log.newValues.substring(0, 200)
                            : JSON.stringify(log.newValues, null, 2).substring(
                              0,
                              200,
                            )}

                          {(typeof log.newValues === "string"
                            ? log.newValues.length
                            : JSON.stringify(log.newValues).length) > 200 &&
                            "..."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Task Effort Logs Component - Shows effort log entries in Details section
  const TaskEffortLogs: React.FC<{ taskId: string }> = ({ taskId }) => {
    const { activityLogs, loading, error } = useRecentActivityByEntity(
      "tasks",
      taskId,
      30,
    );

    // Filter only TIME_LOGGED entries
    const effortLogs = activityLogs.filter(log =>
      log.action === 'TIME_LOGGED'
    );

    const formatActivityTime = (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          <span className="ml-2 text-xs text-gray-500">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-4 text-xs text-gray-500">
          Failed to load effort logs
        </div>
      );
    }

    if (effortLogs.length === 0) {
      return (
        <div className="text-center py-4">
          <Clock className="w-6 h-6 mx-auto mb-2 text-gray-300" />
          <p className="text-xs text-gray-500">No effort logged yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Log effort via My Tasks page
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {effortLogs.slice(0, 5).map((log) => (
          <div
            key={log.id}
            className="p-2 bg-white rounded border border-gray-200 hover:border-green-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1">
                <Timer className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-gray-700">
                  {log.userId ? getUserName(log.userId) : "Unknown"}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {formatActivityTime(log.createdAt)}
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {log.description || "Time logged"}
            </p>
          </div>
        ))}
        {effortLogs.length > 5 && (
          <p className="text-xs text-center text-gray-400 pt-1">
            +{effortLogs.length - 5} more entries
          </p>
        )}
      </div>
    );
  };

  // Log Effort Handler (JIRA-style: log on subtasks)

  const handleLogEffort = async () => {
    // Block logging if sprint has ended
    if (isSprintEnded) {
      toast.error("Cannot log time - sprint has ended");
      return;
    }
    if (!selectedSubtaskForEffort || !effortLog.hours || effortLog.hours <= 0) {
      toast.error("Please enter valid hours");

      return;
    }

    if (!effortLog.description.trim()) {
      toast.error("Please enter a description");

      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");

      return;
    }

    try {
      setIsLoggingEffort(true);
      // Find the parent task

      const parentTask = allTasks.find(
        (t) => t.id === selectedSubtaskForEffort.taskId,
      );

      // Create time entry for the subtask

      const timeEntryData = {
        userId: user?.id || "",

        projectId: selectedProject || undefined,

        storyId: parentTask?.storyId || undefined,

        taskId: selectedSubtaskForEffort.taskId,

        subtaskId: selectedSubtaskForEffort.id,

        description: effortLog.description,

        entryType: "development" as const,

        hoursWorked: effortLog.hours,

        workDate: effortLog.workDate,

        startTime:
          effortLog.startTime && effortLog.startTime.trim()
            ? effortLog.startTime
            : undefined,

        endTime:
          effortLog.endTime && effortLog.endTime.trim()
            ? effortLog.endTime
            : undefined,

        isBillable: true,
      };

      console.log("Creating time entry with data:", timeEntryData);

      await timeEntryApiService.createTimeEntry(timeEntryData);

      // Update subtask actual hours using new PATCH endpoint

      const newSubtaskActualHours =
        (selectedSubtaskForEffort.actualHours || 0) + effortLog.hours;

      await subtaskApiService.updateSubtaskActualHours(
        selectedSubtaskForEffort.id,
        newSubtaskActualHours,
      );

      // Calculate and update parent task's actual hours (roll-up from all subtasks) using new PATCH endpoint

      if (parentTask) {
        const allTaskSubtasks = getSubtasksForTask(parentTask.id);

        const totalSubtaskHours = allTaskSubtasks.reduce((sum, st) => {
          if (st.id === selectedSubtaskForEffort.id) {
            return sum + newSubtaskActualHours;
          }

          return sum + (st.actualHours || 0);
        }, 0);

        await taskApiService.updateTaskActualHours(
          parentTask.id,
          totalSubtaskHours,
        );

        notifyProjectBudgetUpdate("subtask-effort-logged");

        // Update local state immediately for instant UI update
        // Update subtask in allSubtasks
        setAllSubtasks((prev) =>
          prev.map((st) =>
            st.id === selectedSubtaskForEffort.id
              ? { ...st, actualHours: newSubtaskActualHours }
              : st,
          ),
        );

        // Update selectedSubtaskForEffort if it's still selected
        setSelectedSubtaskForEffort((prev) =>
          prev?.id === selectedSubtaskForEffort.id
            ? { ...prev, actualHours: newSubtaskActualHours }
            : prev,
        );

        // Update parent task in allTasks
        setAllTasks((prev) =>
          prev.map((task) =>
            task.id === parentTask.id
              ? { ...task, actualHours: totalSubtaskHours }
              : task,
          ),
        );

        // Update selectedTaskForDetails if it matches the parent task
        setSelectedTaskForDetails((prev) =>
          prev?.id === parentTask.id
            ? { ...prev, actualHours: totalSubtaskHours }
            : prev,
        );
      }

      // Log activity for effort logging

      try {
        if (parentTask) {
          await activityLogApiService.createActivityLog({
            userId: user?.id || "",

            entityType: "tasks",

            entityId: parentTask.id,

            action: "effort_logged",

            description: `Logged ${effortLog.hours}h on subtask "${selectedSubtaskForEffort.title}"`,

            newValues: JSON.stringify({
              subtaskId: selectedSubtaskForEffort.id,

              hours: effortLog.hours,

              description: effortLog.description,

              workDate: effortLog.workDate,
            }),

            ipAddress: undefined,

            userAgent: undefined,
          });
        }
      } catch (error) {
        console.error("Failed to log activity:", error);
      }

      toast.success(
        `Logged ${effortLog.hours}h effort on subtask successfully`,
      );

      // Upload any attachments if present
      if (effortLogAttachments.length > 0 && selectedSubtaskForEffort?.id) {
        try {
          for (const file of effortLogAttachments) {
            await uploadFileAndCreateAttachment(file, 'subtask', selectedSubtaskForEffort.id);
          }
          toast.success(`${effortLogAttachments.length} attachment(s) uploaded`);
        } catch (attachError) {
          console.error("Error uploading attachments:", attachError);
          toast.error("Effort logged, but some attachments failed to upload");
        }
      }

      // Refresh tasks and subtasks

      if (sprintStories.length > 0) {
        fetchAllTasks(sprintStories, true);
      }

      setEffortLog({
        hours: 0,

        description: "",

        workDate: new Date().toISOString().split("T")[0],

        startTime: "",

        endTime: "",
      });

      // Clear attachments
      setEffortLogAttachments([]);

      setIsLogEffortDialogOpen(false);

      setSelectedSubtaskForEffort(null);
    } catch (error) {
      toast.error("Failed to log effort");

      console.error("Error logging effort:", error);
    } finally {
      setIsLoggingEffort(false);
    }
  };

  // Log Effort Handler for Tasks
  const handleLogTaskEffort = async () => {
    // Block logging if sprint has ended
    if (isSprintEnded) {
      toast.error("Cannot log time - sprint has ended");
      return;
    }
    if (!selectedTaskForEffort || !effortLog.hours || effortLog.hours <= 0) {
      toast.error("Please enter valid hours");
      return;
    }

    if (!effortLog.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setIsLoggingEffort(true);
      // Create time entry for the task
      const timeEntryData = {
        userId: user?.id || "",
        projectId: selectedProject || undefined,
        storyId: selectedTaskForEffort.storyId || undefined,
        taskId: selectedTaskForEffort.id,
        description: effortLog.description,
        entryType: "development" as const,
        hoursWorked: effortLog.hours,
        workDate: effortLog.workDate,
        startTime: effortLog.startTime && effortLog.startTime.trim() ? effortLog.startTime : undefined,
        endTime: effortLog.endTime && effortLog.endTime.trim() ? effortLog.endTime : undefined,
        isBillable: true,
      };

      console.log("Creating time entry for task with data:", timeEntryData);
      await timeEntryApiService.createTimeEntry(timeEntryData);

      // Update task actual hours
      const newTaskActualHours = (selectedTaskForEffort.actualHours || 0) + effortLog.hours;
      await taskApiService.updateTaskActualHours(selectedTaskForEffort.id, newTaskActualHours);

      notifyProjectBudgetUpdate("task-effort-logged");

      // Update local state immediately for instant UI update
      setAllTasks((prev) =>
        prev.map((task) =>
          task.id === selectedTaskForEffort.id
            ? { ...task, actualHours: newTaskActualHours }
            : task,
        ),
      );

      // Update selectedTaskForEffort if it's still selected
      setSelectedTaskForEffort((prev) =>
        prev?.id === selectedTaskForEffort.id
          ? { ...prev, actualHours: newTaskActualHours }
          : prev,
      );

      // Update selectedTaskForDetails if it matches the logged task
      setSelectedTaskForDetails((prev) =>
        prev?.id === selectedTaskForEffort.id
          ? { ...prev, actualHours: newTaskActualHours }
          : prev,
      );

      // Automatically move task to IN_PROGRESS if it's currently in TO_DO status
      const currentStatus = selectedTaskForEffort.status?.toUpperCase() || "";
      if (currentStatus === "TO_DO" || currentStatus === "TODO") {
        try {
          await updateTaskStatusMutate({
            id: selectedTaskForEffort.id,
            status: "IN_PROGRESS" as any,
          });

          // Log activity for status change
          try {
            await activityLogApiService.createActivityLog({
              userId: user?.id || "",
              entityType: "tasks",
              entityId: selectedTaskForEffort.id,
              action: "status_changed",
              description: `Task automatically moved to IN_PROGRESS after logging effort`,
              oldValues: JSON.stringify({ status: currentStatus }),
              newValues: JSON.stringify({ status: "IN_PROGRESS" }),
              ipAddress: undefined,
              userAgent: undefined,
            });
          } catch (error) {
            console.error("Failed to log activity for status change:", error);
          }

          toast.success("Task moved to In Progress automatically");
        } catch (error) {
          console.error("Failed to update task status to IN_PROGRESS:", error);
          // Don't show error toast as the main operation (logging effort) succeeded
        }
      }

      // Log activity for effort logging
      try {
        await activityLogApiService.createActivityLog({
          userId: user?.id || "",
          entityType: "tasks",
          entityId: selectedTaskForEffort.id,
          action: "effort_logged",
          description: `Logged ${effortLog.hours}h on task "${selectedTaskForEffort.title}"`,
          newValues: JSON.stringify({
            hours: effortLog.hours,
            description: effortLog.description,
            workDate: effortLog.workDate,
          }),
          ipAddress: undefined,
          userAgent: undefined,
        });
      } catch (error) {
        console.error("Failed to log activity:", error);
      }

      toast.success(`Logged ${effortLog.hours}h effort on task successfully`);

      // Refresh tasks
      if (sprintStories.length > 0) {
        fetchAllTasks(sprintStories, true);
      }

      setEffortLog({
        hours: 0,
        description: "",
        workDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
      });

      setIsLogEffortDialogOpen(false);
      setSelectedTaskForEffort(null);
    } catch (error) {
      toast.error("Failed to log effort");
      console.error("Error logging effort:", error);
    } finally {
      setIsLoggingEffort(false);
    }
  };

  // Log Effort Handler for Issues
  const handleLogIssueEffort = async () => {
    // Block logging if sprint has ended
    if (isSprintEnded) {
      toast.error("Cannot log time - sprint has ended");
      return;
    }
    if (!selectedIssueForEffort || !effortLog.hours || effortLog.hours <= 0) {
      toast.error("Please enter valid hours");
      return;
    }

    if (!effortLog.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      setIsLoggingEffort(true);
      // Create time entry for the issue
      const timeEntryData = {
        userId: user?.id || "",
        projectId: selectedProject || undefined,
        storyId: selectedIssueForEffort.storyId || undefined,
        issueId: selectedIssueForEffort.id,
        description: effortLog.description,
        entryType: "development" as const,
        hoursWorked: effortLog.hours,
        workDate: effortLog.workDate,
        startTime: effortLog.startTime && effortLog.startTime.trim() ? effortLog.startTime : undefined,
        endTime: effortLog.endTime && effortLog.endTime.trim() ? effortLog.endTime : undefined,
        isBillable: true,
      };

      console.log("Creating time entry for issue with data:", timeEntryData);
      await timeEntryApiService.createTimeEntry(timeEntryData);

      // Update issue actual hours
      const newIssueActualHours = (selectedIssueForEffort.actualHours || 0) + effortLog.hours;
      await issueApiService.updateIssueActualHours(selectedIssueForEffort.id, newIssueActualHours);

      notifyProjectBudgetUpdate("issue-effort-logged");

      // Update local state immediately for instant UI update
      setAllIssues((prev) =>
        prev.map((issue) =>
          issue.id === selectedIssueForEffort.id
            ? { ...issue, actualHours: newIssueActualHours }
            : issue,
        ),
      );

      // Update selectedIssueForEffort if it's still selected
      setSelectedIssueForEffort((prev) =>
        prev?.id === selectedIssueForEffort.id
          ? { ...prev, actualHours: newIssueActualHours }
          : prev,
      );

      // Update selectedIssueForDetails if it matches the logged issue
      setSelectedIssueForDetails((prev) =>
        prev?.id === selectedIssueForEffort.id
          ? { ...prev, actualHours: newIssueActualHours }
          : prev,
      );

      // Log activity for effort logging
      try {
        await activityLogApiService.createActivityLog({
          userId: user?.id || "",
          entityType: "issues",
          entityId: selectedIssueForEffort.id,
          action: "effort_logged",
          description: `Logged ${effortLog.hours}h on issue "${selectedIssueForEffort.title}"`,
          newValues: JSON.stringify({
            hours: effortLog.hours,
            description: effortLog.description,
            workDate: effortLog.workDate,
          }),
          ipAddress: undefined,
          userAgent: undefined,
        });
      } catch (error) {
        console.error("Failed to log activity:", error);
      }

      // Automatically move issue to IN_PROGRESS if it's currently in TO_DO status
      const currentStatus = selectedIssueForEffort.status?.toUpperCase() || "";
      if (currentStatus === "TO_DO" || currentStatus === "TODO") {
        try {
          await issueApiService.updateIssueStatus(selectedIssueForEffort.id, "IN_PROGRESS");

          // Update local state immediately
          setAllIssues((prev) =>
            prev.map((issue) =>
              issue.id === selectedIssueForEffort.id
                ? { ...issue, status: "IN_PROGRESS" as any }
                : issue
            )
          );

          // Update selectedIssueForDetails if it matches
          setSelectedIssueForDetails((prev) =>
            prev?.id === selectedIssueForEffort.id
              ? { ...prev, status: "IN_PROGRESS" as any }
              : prev
          );

          // Log activity for status change
          try {
            await activityLogApiService.createActivityLog({
              userId: user?.id || "",
              entityType: "issues",
              entityId: selectedIssueForEffort.id,
              action: "status_changed",
              description: `Issue automatically moved to IN_PROGRESS after logging effort`,
              oldValues: JSON.stringify({ status: currentStatus }),
              newValues: JSON.stringify({ status: "IN_PROGRESS" }),
              ipAddress: undefined,
              userAgent: undefined,
            });
          } catch (error) {
            console.error("Failed to log activity for status change:", error);
          }

          toast.success("Issue moved to In Progress automatically");
        } catch (error) {
          console.error("Failed to update issue status to IN_PROGRESS:", error);
        }
      }

      toast.success(`Logged ${effortLog.hours}h effort on issue successfully`);

      setEffortLog({
        hours: 0,
        description: "",
        workDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
      });

      setIsLogEffortDialogOpen(false);
      setSelectedIssueForEffort(null);
    } catch (error) {
      toast.error("Failed to log effort");
      console.error("Error logging effort:", error);
    } finally {
      setIsLoggingEffort(false);
    }
  };

  // Draggable Story Component with Tasks

  const DraggableStory: React.FC<{ story: Story; index: number }> = ({
    story,
    index,
  }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.STORY,

      item: { id: story.id, type: ItemTypes.STORY },

      canDrag: !isSprintEnded, // Disable dragging when sprint has ended

      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const handleViewDetails = () => {
      setSelectedStoryForDetails(story);

      setIsStoryDetailsOpen(true);
    };

    // Get tasks for this story

    const storyTasks = getTasksForStory(story.id);

    // Get issues for this story

    const storyIssues = getIssuesForStory(story.id);

    // Get assignee name
    const assigneeName = story.assigneeId ? getUserName(story.assigneeId) : null;

    // Get initials helper function
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div className="mb-4">
        {/* Story Card - Each story in its own separate row */}

        <div
          ref={drag as unknown as React.Ref<HTMLDivElement>}
          className={`transition-all cursor-move ${isDragging ? "opacity-50 rotate-1 scale-105" : "hover:scale-[1.01]"
            }`}
        >
          <Card
            className={`border-l-4 ${story.priority === "CRITICAL"
              ? "border-l-red-500 bg-red-50/30"
              : story.priority === "HIGH"
                ? "border-l-orange-500 bg-orange-50/30"
                : story.priority === "MEDIUM"
                  ? "border-l-blue-500 bg-blue-50/30"
                  : "border-l-green-500 bg-green-50/30"
              } hover:shadow-md transition-shadow rounded-lg overflow-hidden`}
          >
            <CardContent className="p-4">
              {/* Story Header */}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />

                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-1 ${getPriorityColor(story.priority)} font-medium`}
                  >
                    {story.priority}
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 font-medium"
                  >
                    ST#{index + 1}
                  </Badge>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();

                      handleViewDetails();
                    }}
                    title="View story details"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      {canManageSprintsAndStories && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingStory(story);
                            setEditStoryForm({
                              title: story.title || "",
                              description: story.description || "",
                              priority: story.priority || "MEDIUM",
                              storyPoints: story.storyPoints || 1,
                              dueDate: story.dueDate ? story.dueDate.split('T')[0] : "",
                              assigneeId: story.assigneeId || "",
                              sprintId: story.sprintId || "",
                              epicId: story.epicId || "",
                              releaseId: story.releaseId || "",
                              acceptanceCriteria: Array.isArray(story.acceptanceCriteria)
                                ? story.acceptanceCriteria.join("\n")
                                : (story.acceptanceCriteria || ""),
                              labels: Array.isArray(story.labels)
                                ? story.labels.join(", ")
                                : (story.labels || ""),
                            });
                            setIsEditStoryDialogOpen(true);
                          }}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Story
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Story Insights
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Story Title */}

              <h4 className="font-semibold text-base mb-3 line-clamp-2 leading-tight text-gray-800">
                {story.title}
              </h4>

              {/* Story Footer */}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {story.storyPoints} pts
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(
                      (() => {
                        const tasks = allTasks.filter((t) => t.storyId === story.id);
                        if (tasks.length === 0) return story.status;

                        const allDone = tasks.every((t) => {
                          const s = t.status?.toUpperCase();
                          return s === "DONE";
                        });
                        if (allDone) return "DONE";

                        const allTodo = tasks.every((t) => {
                          const s = t.status?.toUpperCase();
                          return s === "TO_DO";
                        });
                        if (allTodo) return "TODO";

                        return "IN_PROGRESS";
                      })()
                    )} font-medium`}
                  >
                    {(() => {
                      const tasks = allTasks.filter((t) => t.storyId === story.id);
                      if (tasks.length === 0) return story.status.replace("_", " ");

                      const allDone = tasks.every((t) => {
                        const s = t.status?.toUpperCase();
                        return s === "DONE";
                      });
                      if (allDone) return "DONE";

                      const allTodo = tasks.every((t) => {
                        const s = t.status?.toUpperCase();
                        return s === "TO_DO";
                      });
                      if (allTodo) return "TODO";

                      return "IN PROGRESS";
                    })()}
                  </Badge>

                  {storyTasks.length > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700"
                    >
                      {storyTasks.length} task
                      {storyTasks.length !== 1 ? "s" : ""}
                    </Badge>
                  )}

                  {storyIssues.length > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-1 bg-red-50 text-red-700"
                    >
                      {storyIssues.length} issue
                      {storyIssues.length !== 1 ? "s" : ""}
                    </Badge>
                  )}

                  {assigneeName && (
                    <div className="flex items-center space-x-1">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs bg-green-200 text-green-800">
                          {getInitials(assigneeName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Add Task and Issue Buttons */}

                  <div className="flex flex-col space-y-1">
                    {/* Add Task Button - Only for Managers */}
                    {canAddTasks && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();

                          setNewTask((prev) => ({
                            ...prev,
                            storyId: story.id,
                          }));

                          setIsAddTaskDialogOpen(true);
                        }}
                        disabled={isSprintEnded}
                        title={isSprintEnded ? "Cannot add tasks - Sprint has ended" : `Add task to ${story.title}`}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Task
                      </Button>
                    )}

                    {/* Add Issue Button - For Managers and QA Managers */}
                    {canAddIssues && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs border-dashed border-red-300 hover:border-red-400 hover:bg-red-50 whitespace-nowrap text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();

                          setSelectedStoryForIssue(story.id);

                          setIsAddIssueDialogOpen(true);
                        }}
                        disabled={isSprintEnded}
                        title={isSprintEnded ? "Cannot add issues - Sprint has ended" : `Add issue to ${story.title}`}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Issue
                      </Button>
                    )}
                  </div>

                  {storyTasks.length > 0 && (
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      <span className="flex items-center">
                        <div className="w-1 h-1 bg-blue-400 rounded-full mr-1"></div>

                        {storyTasks.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div >
    );
  };

  // Draggable Task Component

  // Draggable Issue Component (similar to DraggableTask but styled in red)

  const DraggableIssue: React.FC<{ issue: Issue; index: number }> = ({
    issue,
    index,
  }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.ISSUE,

      item: { id: issue.id, type: ItemTypes.ISSUE },

      canDrag: !isSprintEnded, // Disable dragging when sprint has ended

      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    // Find the parent story for this issue

    const parentStory = sprintStories.find(
      (story) => story.id === issue.storyId,
    );

    // Get issue number (default to index + 1 if not set)

    const issueNumber = issue.issueNumber || index + 1;

    // Get assignee name

    const assigneeName = issue.assigneeId
      ? getUserName(issue.assigneeId)
      : null;

    const handleViewIssueDetails = () => {
      setSelectedIssueForDetails(issue);
      setIssueDetailsTab('details');
      setIsIssueDetailsOpen(true);
    };

    // Get initials helper function
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // Calculate estimated and actual hours for issues
    const estimatedHours = issue.estimatedHours || 0;
    const actualHours = issue.actualHours || 0;

    const hasUnreadMention = unreadMentions.some(
      (n: any) => {
        const relId = String(n.relatedEntityId || '').toUpperCase();
        const relType = (n.relatedEntityType || '').toUpperCase();
        return (relId === String(issue.id).toUpperCase() || relId === String(issue.issueNumber).toUpperCase()) &&
          relType === 'ISSUE';
      }
    );

    return (
      <div
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        className={`transition-all cursor-move ${isDragging ? "opacity-50 rotate-1 scale-105" : "hover:scale-[1.01]"
          }`}
      >
        <Card
          className={`border-l-4 group ${parentStory?.priority === "CRITICAL"
            ? "border-l-red-500"
            : parentStory?.priority === "HIGH"
              ? "border-l-orange-500"
              : parentStory?.priority === "MEDIUM"
                ? "border-l-blue-500"
                : "border-l-green-500"
            } issue-card hover:shadow-lg transition-all duration-200 rounded-lg overflow-hidden w-full aspect-square flex flex-col`}        >
          <CardContent className="p-3 flex flex-col flex-1 justify-between">
            {/* Top Row: Issue ID, Priority Badge, and Due Date */}
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center space-x-1">
                {hasUnreadMention && (
                  <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center rounded-full animate-pulse mr-1" title="Unread mention">
                    @
                  </Badge>
                )}
                <span
                  className="text-xs font-semibold text-red-600 cursor-help"
                  title={`Issue UUID: ${issue.id}`}
                >
                  I){issue.id.slice(-6).toUpperCase()}
                </span>
                {issue.priority && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1 py-0 h-4 cursor-help ${issue.priority === 'BLOCKER' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                      issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-300' :
                        issue.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                          issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-green-100 text-green-800 border-green-300'
                      }`}
                    title={`Priority: ${issue.priority} - ${issue.priority === 'BLOCKER' ? 'Blocking further progress' :
                      issue.priority === 'CRITICAL' ? 'Requires immediate attention' :
                        issue.priority === 'HIGH' ? 'High priority issue' :
                          issue.priority === 'MEDIUM' ? 'Normal priority' :
                            'Low priority issue'
                      }`}
                  >
                    {issue.priority.charAt(0)}
                  </Badge>
                )}
              </div>
              {issue.dueDate && (
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-3 h-3 text-red-500" />
                  <span className="text-xs font-medium text-red-500">
                    {new Date(issue.dueDate).getDate()}
                  </span>
                </div>
              )}
            </div>

            {/* Middle: Issue Title (can wrap) */}
            <h4
              className="text-xs font-medium text-gray-900 leading-tight cursor-pointer hover:text-red-600 transition-colors flex-1 mb-2 line-clamp-3"
              onClick={(e) => {
                e.stopPropagation();
                handleViewIssueDetails();
              }}
              title={issue.title}
            >
              {issue.title.length > 40 ? `${issue.title.substring(0, 40)}...` : issue.title}
            </h4>

            {/* Bottom Row: Time and Assignee */}
            <div className="flex items-center justify-between mt-auto flex-shrink-0">
              {/* Time (left) - Format as HH:00 */}
              <span className="text-xs font-medium text-gray-700">
                {actualHours > 0
                  ? `${Math.floor(actualHours)}:00`
                  : estimatedHours > 0
                    ? `${Math.floor(estimatedHours)}:00`
                    : '0:00'}
              </span>

              {/* Assignee Initials (right) with dropdown menu */}
              <div className="flex items-center space-x-1">
                {assigneeName && (
                  <span className="text-xs font-semibold text-gray-700">
                    {getInitials(assigneeName)}
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIssueForEffort(issue);
                        setEffortLog({
                          hours: 0,
                          description: "",
                          workDate: new Date().toISOString().split("T")[0],
                          startTime: "",
                          endTime: "",
                        });
                        setIsLogEffortDialogOpen(true);
                      }}
                      disabled={isSprintEnded}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Log Work{isSprintEnded ? " (Sprint Ended)" : ""}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewIssueDetails();
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const DraggableTask: React.FC<{
    task: Task;
    index: number;
    isNested?: boolean;
  }> = ({ task, index, isNested = false }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.TASK,

      item: { id: task.id, type: ItemTypes.TASK },

      canDrag: !isSprintEnded, // Disable dragging when sprint has ended

      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    // Find the parent story for this task

    const parentStory = sprintStories.find(
      (story) => story.id === task.storyId,
    );

    const handleViewTaskDetails = () => {
      setSelectedTaskForDetails(task);
      setTaskDetailsTab('details');
      setIsTaskDetailsOpen(true);
    };

    // JIRA-like calculations

    const taskSubtasks = getSubtasksForTask(task.id);

    const completedSubtasks = taskSubtasks.filter(
      (st) => st.isCompleted,
    ).length;

    const totalSubtasks = taskSubtasks.length;

    const subtaskProgress =
      totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    // Calculate remaining hours (Estimated - Actual)

    const estimatedHours = task.estimatedHours || 0;

    const actualHours = task.actualHours || 0;

    const remainingHours = Math.max(0, estimatedHours - actualHours);

    // Calculate time progress percentage

    const timeProgress =
      estimatedHours > 0
        ? Math.min(100, (actualHours / estimatedHours) * 100)
        : 0;

    // Get task number (default to index + 1 if not set)

    const taskNumber = task.taskNumber || index + 1;

    // Get assignee name

    const assigneeName = task.assigneeId ? getUserName(task.assigneeId) : null;

    const hasUnreadMention = unreadMentions.some(
      (n: any) => {
        const relId = String(n.relatedEntityId || '').toUpperCase();
        const relType = (n.relatedEntityType || '').toUpperCase();
        return (relId === String(task.id).toUpperCase() || relId === String(task.taskNumber).toUpperCase()) &&
          relType === 'TASK';
      }
    );

    // Get initials helper function
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        className={`transition-all cursor-move ${isDragging ? "opacity-50 rotate-1 scale-105" : "hover:scale-[1.01]"
          }`}
      >
        <Card
          className={`border-l-4 group ${task.isPulledFromBacklog
            ? "border-l-yellow-500"
            : parentStory?.priority === "CRITICAL"
              ? "border-l-red-500"
              : parentStory?.priority === "HIGH"
                ? "border-l-orange-500"
                : parentStory?.priority === "MEDIUM"
                  ? "border-l-blue-500"
                  : "border-l-green-500"
            } task-card hover:shadow-lg transition-all duration-200 rounded-lg overflow-hidden w-full aspect-square flex flex-col`}
        >
          <CardContent className="p-3 flex flex-col flex-1 justify-between">
            {/* Top Row: Task ID, Priority Badge, and Due Date */}
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center space-x-1">
                {hasUnreadMention && (
                  <Badge variant="destructive" className="h-4 w-4 p-0 flex items-center justify-center rounded-full animate-pulse mr-1" title="Unread mention">
                    @
                  </Badge>
                )}
                <span
                  className="text-xs font-semibold text-blue-600 cursor-help"
                  title={`Task UUID: ${task.id}`}
                >
                  T){task.id.slice(-6).toUpperCase()}
                </span>
                {task.priority && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1 py-0 h-4 cursor-help ${task.priority === 'BLOCKER' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                      task.priority === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-300' :
                        task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-green-100 text-green-800 border-green-300'
                      }`}
                    title={`Priority: ${task.priority} - ${task.priority === 'BLOCKER' ? 'Blocking further progress' :
                      task.priority === 'CRITICAL' ? 'Requires immediate attention' :
                        task.priority === 'HIGH' ? 'High priority task' :
                          task.priority === 'MEDIUM' ? 'Normal priority' :
                            'Low priority task'
                      }`}
                  >
                    {task.priority.charAt(0)}
                  </Badge>
                )}
              </div>
              {task.dueDate && (
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-3 h-3 text-red-500" />
                  <span className="text-xs font-medium text-red-500">
                    {new Date(task.dueDate).getDate()}
                  </span>
                </div>
              )}
            </div>

            {/* Middle: Task Title (can wrap) */}
            <h4
              className="text-xs font-medium text-gray-900 leading-tight cursor-pointer hover:text-blue-600 transition-colors flex-1 mb-2 line-clamp-3"
              onClick={(e) => {
                e.stopPropagation();
                handleViewTaskDetails();
              }}
              title={task.title}
            >
              {task.title.length > 40 ? `${task.title.substring(0, 40)}...` : task.title}
            </h4>

            {/* Bottom Row: Time and Assignee */}
            <div className="flex items-center justify-between mt-auto flex-shrink-0">
              {/* Time (left) - Format as HH:00 */}
              <span className="text-xs font-medium text-gray-700">
                {actualHours > 0
                  ? `${Math.floor(actualHours)}:00`
                  : estimatedHours > 0
                    ? `${Math.floor(estimatedHours)}:00`
                    : '0:00'}
              </span>

              {/* Assignee Initials (right) with dropdown menu */}
              <div className="flex items-center space-x-1">
                {assigneeName && (
                  <span className="text-xs font-semibold text-gray-700">
                    {getInitials(assigneeName)}
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskForEffort(task);
                        setEffortLog({
                          hours: 0,
                          description: "",
                          workDate: new Date().toISOString().split("T")[0],
                          startTime: "",
                          endTime: "",
                        });
                        setIsLogEffortDialogOpen(true);
                      }}
                      disabled={isSprintEnded || !canLogEffortOnTasks}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Log Work{isSprintEnded ? " (Sprint Ended)" : !canLogEffortOnTasks ? " (QA cannot log on tasks)" : ""}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTaskDetails();
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent >
        </Card >
      </div >
    );
  };

  // Backlog helper functions (matching BacklogPage) - moved outside to prevent re-declaration
  const getBacklogStatusColor = useCallback((status: string) => {
    switch (status?.toUpperCase()) {
      case 'BACKLOG':
      case 'TO_DO':
      case 'TODO': return 'bg-gray-100 text-gray-800';
      case 'SPRINT_READY':
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'QA_REVIEW':
      case 'REVIEW': return 'bg-blue-100 text-blue-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getBacklogPriorityColor = useCallback((priority: string) => {
    const p = priority?.toUpperCase();
    switch (p) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getBacklogStoryStatusColor = useCallback((status: string) => {
    switch (status?.toUpperCase()) {
      case 'BACKLOG': return 'bg-gray-100 text-gray-800';
      case 'TODO': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW': return 'bg-purple-100 text-purple-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const formatBacklogDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  }, []);

  const toggleBacklogStoryExpansion = useCallback((storyId: string) => {
    setExpandedBacklogStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });
  }, []);

  const getSprintNameForBacklog = useCallback((sprintId: string | undefined): string => {
    if (!sprintId) return '';
    const sprint = sprints.find((s: Sprint) => s.id === sprintId);
    return sprint?.name || '';
  }, [sprints]);

  // Drop Zone Component

  const DropZone: React.FC<{
    status: string;

    children: React.ReactNode;

    title: string;

    icon: React.ReactNode;

    count: number;

    colorClass: string;
  }> = ({ status, children, title, icon, count, colorClass }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: [ItemTypes.STORY, ItemTypes.TASK, ItemTypes.ISSUE],

      drop: (item: { id: string; type: string }) => {
        moveItem(item.id, status, item.type);
      },

      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`min-h-[600px] ${isOver ? "bg-blue-50 border-blue-300" : "bg-gray-50"} 

        border-2 border-dashed rounded-lg transition-colors flex flex-col`}
      >
        <div
          className={`${colorClass} p-3 rounded-t-lg border-b flex items-center justify-between`}
        >
          <div className="flex items-center space-x-2">
            {icon}

            <span className="font-semibold">{title}</span>

            <Badge variant="secondary">{count}</Badge>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">{children}</div>
      </div>
    );
  };

  // Task-level filter predicate for backlog (matching BacklogPage)
  const backlogTaskPassesFilters = useCallback((task: Task) => {
    if (!task) return false;

    const normalizeStatus = (s: any) =>
      (s || '').toString().toUpperCase().replace(/[^A-Z]/g, '');

    // Assignee filter
    if (backlogAssigneeFilter !== 'all' && task.assigneeId !== backlogAssigneeFilter) {
      return false;
    }

    // Status filter
    if (backlogStatusFilter !== 'all') {
      const taskStatusNorm = normalizeStatus(task.status);
      const desiredStatusNorm = normalizeStatus(backlogStatusFilter);
      if (taskStatusNorm !== desiredStatusNorm) {
        return false;
      }
    }

    // Priority filter
    if (backlogPriorityFilter !== 'all') {
      const priorityMap: { [key: string]: string } = {
        'critical': 'CRITICAL',
        'high': 'HIGH',
        'medium': 'MEDIUM',
        'low': 'LOW'
      };
      const desiredPriority = priorityMap[backlogPriorityFilter];
      const taskPriority = (task.priority || '').toString().toUpperCase();
      if (taskPriority !== desiredPriority) {
        return false;
      }
    }

    return true;
  }, [backlogAssigneeFilter, backlogStatusFilter, backlogPriorityFilter]);

  // Fetch tasks for backlog stories
  useEffect(() => {
    if (backlogStories && backlogStories.length > 0 && selectedProject) {
      const fetchBacklogTasks = async () => {
        setBacklogTasksLoading(true);
        try {
          const tasksPromises = backlogStories.map(async (story: Story) => {
            try {
              const response = await taskApiService.getTasksByStory(story.id);
              const tasks = Array.isArray(response.data) ? response.data : ((response.data as any)?.content || []);
              return { storyId: story.id, tasks };
            } catch (error) {
              console.error(`Error fetching tasks for story ${story.id}:`, error);
              return { storyId: story.id, tasks: [] };
            }
          });

          const results = await Promise.all(tasksPromises);
          const storiesWithTasksData = backlogStories.map((story: Story) => {
            const result = results.find(r => r.storyId === story.id);
            return {
              ...story,
              tasks: result?.tasks || []
            };
          });

          // Role-based filtering: Only managers see all tasks
          let filteredStoriesWithTasks = storiesWithTasksData;
          if (!isManager && user) {
            filteredStoriesWithTasks = storiesWithTasksData.map((story) => ({
              ...story,
              tasks: (story.tasks || []).filter((t: Task) => t.assigneeId === user.id)
            })).filter(story => (story.tasks || []).length > 0);
          }

          // Store unfiltered version for stats
          setAllBacklogStoriesWithTasks(storiesWithTasksData);

          setBacklogStoriesWithTasks(filteredStoriesWithTasks);
        } catch (error) {
          console.error('Error fetching backlog tasks:', error);
        } finally {
          setBacklogTasksLoading(false);
        }
      };

      fetchBacklogTasks();
    } else {
      setBacklogStoriesWithTasks([]);
      setBacklogTasksLoading(false);
    }
  }, [backlogStories, selectedProject, isManager, user]);

  // Filter and sort backlog stories (matching BacklogPage logic)
  const allBacklogStoriesForDisplay = useMemo(() => {
    if (!backlogStoriesWithTasks || backlogStoriesWithTasks.length === 0) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Keep stories that belong to a sprint and contain at least one task OR issue that passes filters
    let filtered = backlogStoriesWithTasks.filter((story: Story & { tasks: Task[]; issues: Issue[] }) => {
      // Only show stories that belong to a sprint
      if (!story.sprintId || story.sprintId.trim() === '') {
        return false;
      }

      // Filter by selected sprint if one is selected
      if (selectedSprint && story.sprintId !== selectedSprint) {
        return false;
      }

      const tasksForStory = Array.isArray(story.tasks) ? story.tasks : [];
      const issuesForStory = Array.isArray(story.issues) ? story.issues : [];

      // If not manager, respect earlier rule of user assignment visibility (check BOTH tasks AND issues)
      if (!isManager && user?.id) {
        const hasAssignedTask = tasksForStory.some((t: Task) => t.assigneeId === user.id);
        const hasAssignedIssue = issuesForStory.some((i: Issue) => i.assigneeId === user.id);
        if (!hasAssignedTask && !hasAssignedIssue) return false;
      }

      // Apply task-level filters; keep story if any task OR issue matches
      const anyVisibleTask = tasksForStory.some(backlogTaskPassesFilters);
      const anyVisibleIssue = issuesForStory.some(backlogTaskPassesFilters as any);
      return anyVisibleTask || anyVisibleIssue;
    });

    // Apply search filter (search in story title/description AND task/issue titles)
    filtered = filtered.filter((story: Story & { tasks: Task[]; issues: Issue[] }) => {
      const storyMatches = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (story.description && story.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const taskMatches = (story.tasks || []).some((t: Task) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const issueMatches = (story.issues || []).some((i: Issue) =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return storyMatches || taskMatches || issueMatches;
    });

    // Sort stories
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (backlogSortBy) {
        case 'priority':
          const priorityOrder: { [key: string]: number } = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          aValue = priorityOrder[a.priority as string] || 0;
          bValue = priorityOrder[b.priority as string] || 0;
          break;
        case 'storyPoints':
          aValue = a.storyPoints || 0;
          bValue = b.storyPoints || 0;
          break;
        case 'dueDate':
          const aTasks = (a.tasks || []).filter((t: Task) => t.dueDate && new Date(t.dueDate) < today);
          const bTasks = (b.tasks || []).filter((t: Task) => t.dueDate && new Date(t.dueDate) < today);
          aValue = aTasks.length > 0 ? Math.min(...aTasks.map((t: Task) => new Date(t.dueDate!).getTime())) : Infinity;
          bValue = bTasks.length > 0 ? Math.min(...bTasks.map((t: Task) => new Date(t.dueDate!).getTime())) : Infinity;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (backlogSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [backlogStoriesWithTasks, searchTerm, backlogStatusFilter, backlogPriorityFilter, backlogAssigneeFilter, backlogSortBy, backlogSortOrder, user?.id, isManager, backlogTaskPassesFilters, selectedSprint]);

  // Flatten tasks from filtered stories for stats
  const backlogTasks = useMemo(() => {
    const allTasks: Task[] = [];
    allBacklogStoriesForDisplay.forEach((story: Story & { tasks: Task[] }) => {
      if (story.tasks && story.tasks.length > 0) {
        const visibleTasks = story.tasks.filter(backlogTaskPassesFilters);
        allTasks.push(...visibleTasks);
      }
    });
    return allTasks;
  }, [allBacklogStoriesForDisplay, backlogTaskPassesFilters]);

  // Get ALL backlog tasks for stats (bypassing role-based filtering)
  const allBacklogTasksForStats = useMemo(() => {
    const allTasks: Task[] = [];
    // Filter stories by selected sprint for stats
    const storiesToUse = selectedSprint
      ? allBacklogStoriesWithTasks.filter((s: Story & { tasks: Task[] }) => s.sprintId === selectedSprint)
      : allBacklogStoriesWithTasks;

    storiesToUse.forEach((story: Story & { tasks: Task[] }) => {
      if (story.tasks && story.tasks.length > 0) {
        allTasks.push(...story.tasks);
      }
    });
    console.log('ScrumPage allBacklogTasksForStats:', {
      totalTasks: allTasks.length,
      doneTasks: allTasks.filter(t => (t.status || '').toUpperCase() === 'DONE').length,
      storiesCount: storiesToUse.length,
      selectedSprint
    });
    return allTasks;
  }, [allBacklogStoriesWithTasks, selectedSprint]);


  // Handler functions for backlog
  const handleOpenBacklogEffortManager = (task: Task) => {
    setSelectedBacklogTaskForEffort(task);
    setIsBacklogEffortManagerOpen(true);
  };

  const handleLogBacklogEffort = async (effortData: any) => {
    // Handle effort logging if needed
    setSelectedBacklogTaskForEffort(null);
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />

        <span className="ml-2 text-muted-foreground">Loading projects...</span>
      </div>
    );
  }

  if (!selectedProject && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="w-[480px] shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <Layers3 className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              No Projects Found
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400 mt-2">
              Create your first project to start using the Scrum Management features
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-6 py-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Sprints</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Stories</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <CheckSquare className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tasks</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Get started by creating a project from the Projects page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSprintComputedStatus = (sprint: Sprint) => {
    if (!sprint.startDate || !sprint.endDate) return sprint.status;
    const now = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);

    // Set times to ensure accurate day comparison if needed, 
    // but simplified logic as requested:
    // before start -> planning
    // between start and end -> active
    // after end -> completed

    if (now < start) return "PLANNING";
    if (now >= start && now <= end) return "ACTIVE";
    if (now > end) return "COMPLETED";

    return sprint.status;
  };

  const getSprintStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800 border-green-200";
      case "PLANNING":
      case "CREATED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Tabs
        value={activeView}
        onValueChange={setActiveView}
        className="flex flex-col h-full space-y-6"
      >
        {/* Header with project and sprint selectors */}

        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Project Selector */}

              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>

                <SelectContent>
                  {projects.map((project) => {
                    const status = computeDerivedStatus(project);
                    return (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={getStatusColor(status)}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                          <span className="font-medium">{project.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Role Switcher - shows roles based on selected project */}
              {selectedProject && (
                <RoleSwitcherDropdown projectId={selectedProject} compact />
              )}

              {/* Sprint Selector */}

              <Select
                value={selectedSprint || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    setSelectedSprint("");
                  } else {
                    // Validate that the sprint belongs to the selected project

                    const sprint = sprints.find((s: Sprint) => s.id === value);

                    if (sprint && sprint.projectId === selectedProject) {
                      setSelectedSprint(value);
                    } else {
                      console.warn(
                        `Cannot select sprint ${value} - it does not belong to project ${selectedProject}`,
                      );

                      toast.error(
                        "Selected sprint does not belong to the current project",
                      );
                    }
                  }
                }}
                disabled={!selectedProject || sprintsLoading}
              >
                <SelectTrigger className="w-64">
                  <SelectValue
                    placeholder={
                      sprintsLoading
                        ? "Loading sprints..."
                        : sprints.filter(
                          (s: Sprint) => s.projectId === selectedProject,
                        ).length === 0
                          ? "No sprints available"
                          : "Select Sprint"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">None</span>
                  </SelectItem>

                  {(() => {
                    // Filter sprints to only show those belonging to the selected project

                    const projectSprints = selectedProject
                      ? sprints.filter(
                        (s: Sprint) => s.projectId === selectedProject,
                      )
                      : [];

                    if (projectSprints.length === 0) {
                      return (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          <p>No sprints found for this project</p>

                          {canManageSprintsAndStories && (
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setActiveView("sprint-management");

                                setIsSprintDialogOpen(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Create Sprint
                            </Button>
                          )}
                        </div>
                      );
                    }

                    return projectSprints.map((sprint) => {
                      const computedStatus = getSprintComputedStatus(sprint);
                      return (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={getSprintStatusColor(computedStatus)}
                            >
                              {computedStatus}
                            </Badge>

                            <span>{sprint.name}</span>
                          </div>
                        </SelectItem>
                      );
                    });
                  })()}
                </SelectContent>
              </Select>

              {/* Board Actions Dropdown */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default" className="ml-2">
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Board
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-[200px]">
                  {canCreateBoards && (
                    <DropdownMenuItem
                      onClick={() => {
                        setIsCreateBoardDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Board
                    </DropdownMenuItem>
                  )}

                  {!canCreateBoards && (
                    <DropdownMenuItem disabled>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Board (Manager/QA only)
                    </DropdownMenuItem>
                  )}

                  {boards.length > 0 && (
                    <>
                      <DropdownMenuSeparator />

                      <DropdownMenuLabel>Switch Board</DropdownMenuLabel>

                      <DropdownMenuItem
                        onClick={() => {
                          handleSelectBoard(null);

                          refetchWorkflowLanes();

                          toast.info("Switched to default board");
                        }}
                        className={selectedBoard === null ? "bg-accent" : ""}
                      >
                        Default Board
                      </DropdownMenuItem>

                      {boards.map((board: Board) => (
                        <DropdownMenuItem
                          key={board.id}
                          onClick={() => {
                            handleSelectBoard(board.id);

                            refetchWorkflowLanes();

                            toast.info(`Switched to board: ${board.name}`);
                          }}
                          className={`flex items-center justify-between ${selectedBoard === board.id ? "bg-accent" : ""}`}
                          onSelect={(e) => e.preventDefault()} // Prevent default selection behavior
                        >
                          <span className="flex-1">{board.name}</span>

                          {canCreateBoards && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) =>
                                handleDeleteBoard(board.id, board.name, e)
                              }
                              disabled={deleteBoardMutation.loading}
                              title="Delete board"
                            >
                              {deleteBoardMutation.loading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center space-x-2">
              {/* Sprint Count Badge */}

              {selectedProject && (
                <Badge variant="secondary" className="mr-2">
                  {sprintsLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      {
                        sprints.filter(
                          (s: Sprint) => s.projectId === selectedProject,
                        ).length
                      }{" "}
                      sprint
                      {sprints.filter(
                        (s: Sprint) => s.projectId === selectedProject,
                      ).length !== 1
                        ? "s"
                        : ""}
                    </>
                  )}
                </Badge>
              )}

              {/* Refresh Button */}

              {selectedProject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchSprints()}
                  disabled={sprintsLoading}
                  title="Refresh sprints"
                >
                  {sprintsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "🔄"
                  )}
                </Button>
              )}

              <TabsList>
                <TabsTrigger value="backlog">Backlog</TabsTrigger>

                <TabsTrigger value="scrum-board">Scrum Board</TabsTrigger>

                <TabsTrigger value="sprint-management">
                  Sprint Management
                </TabsTrigger>

                <TabsTrigger value="burndown">Burndown</TabsTrigger>
              </TabsList>

              {/* Dashboard Tab Content */}
              <TabsContent value="dashboard" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-semibold">Performance &amp; Workload</h1>
                </div>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Filter className="w-4 h-4 text-gray-600" />
                    {/* Project Filter */}
                    <Select value={dashboardProject} onValueChange={setDashboardProject}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={dashboardProject === "all" ? "All Projects" : dashboardProject} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Sprint Filter */}
                    <Select
                      value={dashboardSprint}
                      onValueChange={setDashboardSprint}
                      disabled={dashboardProject === "all"}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={dashboardSprint === "all" ? "All Sprints" : dashboardSprint} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sprints</SelectItem>
                        {dashboardSprints
                          ?.filter((s) => dashboardProject === "all" || s.projectId === dashboardProject)
                          .map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {/* Member Filter */}
                    <Select value={dashboardMember} onValueChange={setDashboardMember}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={dashboardMember === "all" ? "All Members" : dashboardMember} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        {users?.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {dashboardLoading ? (
                    <div className="flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-white rounded shadow">
                        <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
                        <p className="text-2xl font-semibold">{filteredTasks.length}</p>
                      </div>
                      <div className="p-4 bg-white rounded shadow">
                        <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                        <p className="text-2xl font-semibold">{filteredTasks.filter((t) => t.status === "DONE").length}</p>
                      </div>
                      <div className="p-4 bg-white rounded shadow">
                        <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                        <p className="text-2xl font-semibold">{filteredTasks.filter((t) => t.status === "IN_PROGRESS").length}</p>
                      </div>
                      <div className="p-4 bg-white rounded shadow">
                        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                        <p className="text-2xl font-semibold">{filteredTasks.filter((t) => t.status as string === "TODO").length}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </div>
        </div>

        <TabsContent value="backlog" className="mt-0 flex-1">
          {/* Backlog Management - Full BacklogPage Functionality */}

          <div className="p-6 space-y-6">
            {/* Header */}

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Product Backlog</h1>

                <p className="text-muted-foreground">
                  {canManageSprintsAndStories ? 'All stories and tasks in sprints' : 'Stories where you are assigned to tasks'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Project Selector */}
                <Select value={selectedProject || "all"} onValueChange={(value) => setSelectedProject(value === "all" ? "" : value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={projectsLoading ? "Loading projects..." : "Select Project"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects?.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sprint Selector */}
                <Select
                  value={selectedSprint || "all"}
                  onValueChange={(value) => setSelectedSprint(value === "all" ? "" : value)}
                  disabled={!selectedProject || sprintsLoading}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={sprintsLoading ? "Loading sprints..." : (!selectedProject ? "Select project first" : "Select Sprint")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sprints</SelectItem>
                    {sprints?.filter((s: Sprint) => s.projectId === selectedProject).map(sprint => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filters and Search */}

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-x-8 lg:gap-x-10 flex-nowrap">
                  {/* Search */}

                  <div className="relative flex-1 min-w-[260px] mr-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

                    <Input
                      placeholder="Search stories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Filters */}

                  <div className="shrink-0 ml-6">
                    <Select
                      value={backlogStatusFilter}
                      onValueChange={setBacklogStatusFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>

                        <SelectItem value="BACKLOG">Backlog</SelectItem>

                        <SelectItem value="TODO">To Do</SelectItem>

                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>

                        <SelectItem value="REVIEW">Review</SelectItem>

                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="shrink-0 ml-6">
                    <Select
                      value={backlogPriorityFilter}
                      onValueChange={setBacklogPriorityFilter}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>

                        <SelectItem value="blocker">Blocker</SelectItem>

                        <SelectItem value="critical">Critical</SelectItem>

                        <SelectItem value="high">High</SelectItem>

                        <SelectItem value="medium">Medium</SelectItem>

                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="shrink-0 ml-6">
                    <Select
                      value={backlogAssigneeFilter}
                      onValueChange={setBacklogAssigneeFilter}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder={usersLoading ? 'Loading assignees...' : (selectedProject ? 'Assignee (project)' : 'Assignee')} />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>

                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email || user.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}

                  <div className="flex items-center space-x-2 ml-6">
                    <Select
                      value={backlogSortBy}
                      onValueChange={setBacklogSortBy}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="priority">Priority</SelectItem>

                        <SelectItem value="storyPoints">
                          Story Points
                        </SelectItem>

                        <SelectItem value="dueDate">Due Date</SelectItem>

                        <SelectItem value="created">Created Date</SelectItem>

                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setBacklogSortOrder(
                          backlogSortOrder === "asc" ? "desc" : "asc",
                        )
                      }
                      className="px-3"
                    >
                      {backlogSortOrder === "asc" ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setBacklogStatusFilter('all');
                        setBacklogPriorityFilter('all');
                        setBacklogAssigneeFilter('all');
                        setBacklogSortBy('priority');
                        setBacklogSortOrder('desc');
                      }}
                      disabled={!searchTerm && backlogStatusFilter === 'all' && backlogPriorityFilter === 'all' && backlogAssigneeFilter === 'all'}
                      className="px-3 border-red-300 text-red-600 hover:text-red-700 hover:border-red-400 hover:bg-red-50 disabled:text-red-300 disabled:border-red-200"
                      title="Clear all filters"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-blue-600">{allBacklogStoriesForDisplay.length}</div>
                  <div className="text-sm text-muted-foreground">{isManager ? 'All Stories' : 'My Assigned Stories'}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-red-600">
                    {allBacklogTasksForStats.filter(t => {
                      if (!t.dueDate) return false;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const taskDueDate = new Date(t.dueDate);
                      taskDueDate.setHours(0, 0, 0, 0);
                      const statusUpper = (t.status || '').toUpperCase();
                      return taskDueDate < today && statusUpper !== 'CANCELLED';
                    }).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Overdue Tasks</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-yellow-600">
                    {allBacklogTasksForStats.filter(t => {
                      const statusUpper = (t.status || '').toUpperCase();
                      return statusUpper === 'IN_PROGRESS' || statusUpper === 'TO_DO' || statusUpper === 'TODO';
                    }).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Incomplete Tasks</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-semibold text-green-600">
                    {allBacklogTasksForStats.filter(t => {
                      const statusUpper = (t.status || '').toUpperCase();
                      if (statusUpper !== 'DONE') return false;
                      if (!t.dueDate) return true;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const dueDate = new Date(t.dueDate);
                      dueDate.setHours(0, 0, 0, 0);
                      return dueDate >= today;
                    }).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed Tasks</div>
                </CardContent>
              </Card>
            </div>

            {/* Loading State */}

            {(backlogStoriesLoading || backlogTasksLoading) && (
              <LoadingSpinner message="Loading Backlog..." fullScreen />
            )}

            {/* Stories List */}

            {!backlogStoriesLoading && !backlogTasksLoading && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {isManager ? 'All Stories' : 'Stories with My Assigned Tasks'} ({allBacklogStoriesForDisplay.length})
                    </h3>

                    <div className="flex items-center space-x-2">
                      {allBacklogStoriesForDisplay.reduce(
                        (sum, story) => sum + (story.storyPoints || 0),
                        0,
                      ) > 0 && (
                          <Badge variant="secondary">
                            Total:{" "}
                            {allBacklogStoriesForDisplay.reduce(
                              (sum, story) => sum + (story.storyPoints || 0),
                              0,
                            )}{" "}
                            points
                          </Badge>
                        )}
                    </div>
                  </div>

                  {allBacklogStoriesForDisplay.length > 0 ? (
                    <div className="space-y-4">
                      {allBacklogStoriesForDisplay.map((story) => {
                        // Get sprint info for this story
                        const storySprint = story.sprintId
                          ? sprints.find((s: Sprint) => s.id === story.sprintId)
                          : null;

                        return (
                          <Card key={story.id} className="mb-4">
                            <CardHeader
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() =>
                                toggleBacklogStoryExpansion(story.id)
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <ChevronDown
                                    className={`w-4 h-4 text-muted-foreground transition-transform ${expandedBacklogStories.has(story.id) ? "rotate-180" : ""}`}
                                  />

                                  <h3 className="font-semibold text-lg">
                                    {story.title}
                                  </h3>

                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getBacklogStoryStatusColor(story.status)}`}
                                  >
                                    {story.status}
                                  </Badge>

                                  {story.sprintId && getSprintNameForBacklog(story.sprintId) && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      <GitBranch className="w-3 h-3 mr-1" />
                                      {getSprintNameForBacklog(story.sprintId)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>

                            {expandedBacklogStories.has(story.id) && (
                              <CardContent>
                                <div className="space-y-4">
                                  {/* Story Info */}

                                  {story.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {story.description}
                                    </p>
                                  )}

                                  <div className="flex items-center space-x-4 text-sm">
                                    <Badge
                                      variant="outline"
                                      className={`${getBacklogPriorityColor(story.priority)}`}
                                    >
                                      <Flag className="w-3 h-3 mr-1" />

                                      {story.priority}
                                    </Badge>

                                    {story.storyPoints && (
                                      <div className="flex items-center space-x-1 text-muted-foreground">
                                        <Target className="w-4 h-4" />

                                        <span>{story.storyPoints} points</span>
                                      </div>
                                    )}

                                    {storySprint && (
                                      <div className="flex items-center space-x-1 text-muted-foreground">
                                        <CalendarIcon className="w-4 h-4" />

                                        <span>Sprint: {storySprint.name}</span>
                                      </div>
                                    )}

                                    {story.tasks && story.tasks.length > 0 && (
                                      <div className="flex items-center space-x-1 text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4" />

                                        <span>
                                          {story.tasks.length} task
                                          {story.tasks.length > 1 ? "s" : ""}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Tasks and Issues - Combined like BacklogPage */}

                                  {(() => {
                                    const visibleTasks = (story.tasks || []).filter(backlogTaskPassesFilters);
                                    const visibleIssues = (story.issues || []).filter(backlogTaskPassesFilters as any);

                                    // Combine tasks and issues into a single array with type labels
                                    const visibleItems = [
                                      ...visibleTasks.map(t => ({ ...t, type: 'TASK' as const })),
                                      ...visibleIssues.map(i => ({ ...i, type: 'ISSUE' as const }))
                                    ];

                                    // Sort: done items last
                                    visibleItems.sort((a, b) => {
                                      if ((a.status || '').toUpperCase() === 'DONE' && (b.status || '').toUpperCase() !== 'DONE') return 1;
                                      if ((a.status || '').toUpperCase() !== 'DONE' && (b.status || '').toUpperCase() === 'DONE') return -1;
                                      return 0;
                                    });

                                    const overdueItems = visibleItems.filter((item: any) => {
                                      if (!item.dueDate) return false;
                                      const itemDueDate = new Date(item.dueDate);
                                      itemDueDate.setHours(0, 0, 0, 0);
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      return itemDueDate < today && item.status !== 'DONE' && item.status !== 'CANCELLED';
                                    });

                                    return visibleItems.length > 0 ? (
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <h4 className="text-sm font-medium">
                                            Items ({visibleItems.length})
                                            {visibleTasks.length > 0 && <span className="text-green-600 ml-1">({visibleTasks.length} tasks)</span>}
                                            {visibleIssues.length > 0 && <span className="text-red-600 ml-1">({visibleIssues.length} issues)</span>}
                                          </h4>
                                          <div className="text-xs text-muted-foreground">
                                            {visibleItems.filter((item: any) => (item.status || '').toUpperCase() === 'DONE').length} completed
                                          </div>
                                        </div>

                                        {overdueItems.length > 0 && (
                                          <Badge variant="destructive" className="text-xs">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            {overdueItems.length} overdue item{overdueItems.length > 1 ? 's' : ''}
                                          </Badge>
                                        )}

                                        <div className="space-y-2">
                                          {visibleItems.map((item: any) => {
                                            const isIssue = item.type === 'ISSUE';
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const isOverdue = item.dueDate && new Date(item.dueDate) < today;
                                            const itemStatusUpper = (item.status || '').toUpperCase();
                                            const isItemDoneStatus = itemStatusUpper === 'DONE';
                                            const isItemCancelled = itemStatusUpper === 'CANCELLED';
                                            const isIncomplete = !isItemDoneStatus && !isItemCancelled;
                                            const isOverdueAndIncomplete = isOverdue && isIncomplete;
                                            const isDoneAfterDue = isItemDoneStatus && isOverdue;
                                            const isUserAssigned = user?.id && item.assigneeId === user.id;
                                            const isDoneBeforeDue = isItemDoneStatus && item.dueDate && new Date(item.dueDate) >= today;

                                            const assigneeName = item.assigneeId ? users.find((u: any) => u.id === item.assigneeId)?.name : null;
                                            const assigneeLabel = assigneeName || (!item.assigneeId ? 'Unassigned' : usersLoading ? 'Loading...' : 'Unknown user');

                                            return (
                                              <Card
                                                key={item.id}
                                                className={`border-l-4 ${isOverdueAndIncomplete ? 'border-l-red-500 bg-red-50' :
                                                  isDoneBeforeDue ? 'border-l-green-300 bg-green-50' :
                                                    isItemDoneStatus ? 'border-l-green-500 bg-green-50' :
                                                      isIssue ? 'border-l-pink-500 bg-red-50/30' :
                                                        isUserAssigned ? 'border-l-purple-500 bg-purple-50' :
                                                          'border-l-blue-500'
                                                  }`}
                                              >
                                                <CardContent className="p-3">
                                                  <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                      <div className="flex items-center space-x-2 mb-1">
                                                        <h5 className="text-sm font-medium">
                                                          {isIssue && <span className="font-bold text-red-600 mr-1">[I]</span>}
                                                          {!isIssue && <span className="font-bold text-green-600 mr-1">[T]</span>}
                                                          {item.title}
                                                        </h5>
                                                        <Badge variant="outline" className={`text-xs ${getBacklogStatusColor(item.status)}`}>
                                                          {item.status?.replace('_', ' ') || 'TO_DO'}
                                                        </Badge>
                                                        {isOverdueAndIncomplete && (
                                                          <Badge variant="destructive" className="text-xs">
                                                            Overdue
                                                          </Badge>
                                                        )}
                                                        {isDoneAfterDue && (
                                                          <Badge variant="destructive" className="text-xs">
                                                            Overdue
                                                          </Badge>
                                                        )}
                                                      </div>
                                                      {item.description && (
                                                        <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                                                      )}
                                                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                        <Badge variant="outline" className={`${getBacklogPriorityColor(item.priority)}`}>
                                                          {item.priority}
                                                        </Badge>
                                                        {item.dueDate && (
                                                          <div className="flex items-center space-x-1">
                                                            <CalendarIcon className={`w-3 h-3 ${isDoneBeforeDue ? 'text-green-400' : isOverdue ? 'text-red-600' : ''}`} />
                                                            <span className={
                                                              isDoneBeforeDue ? 'text-green-600 font-medium' :
                                                                isOverdue ? 'text-red-600 font-medium' : ''
                                                            }>
                                                              {formatBacklogDate(item.dueDate)}
                                                              {isDoneBeforeDue && ' (Completed Early)'}
                                                            </span>
                                                          </div>
                                                        )}
                                                        {item.estimatedHours && (
                                                          <div className="flex items-center space-x-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{item.estimatedHours}h</span>
                                                          </div>
                                                        )}
                                                        {assigneeLabel && (
                                                          <div className="flex items-center space-x-1">
                                                            <User className="w-3 h-3" />
                                                            <span className="font-bold text-black">
                                                              {assigneeLabel}
                                                            </span>
                                                          </div>
                                                        )}
                                                        {item.actualHours > 0 && (
                                                          <div className="flex items-center space-x-1">
                                                            <Target className="w-3 h-3" />
                                                            <span>{item.actualHours}h actual</span>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>

                                                    <DropdownMenu>
                                                      <DropdownMenuTrigger asChild>
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="h-6 w-6 p-0"
                                                        >
                                                          <MoreVertical className="w-3 h-3" />
                                                        </Button>
                                                      </DropdownMenuTrigger>

                                                      <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                          onClick={() => {
                                                            setBacklogTaskToView(item);
                                                            setIsBacklogTaskDialogOpen(true);
                                                          }}
                                                        >
                                                          <Eye className="w-4 h-4 mr-2" />
                                                          View {isIssue ? 'Issue' : 'Task'}
                                                        </DropdownMenuItem>
                                                      </DropdownMenuContent>
                                                    </DropdownMenu>
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-muted-foreground">
                                        No items assigned to this story yet.
                                      </div>
                                    );
                                  })()}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <div className="text-muted-foreground space-y-2">
                          <Target className="w-12 h-12 mx-auto opacity-50" />
                          <p>{isManager ? 'No stories found' : 'No stories with your assigned tasks found'}</p>
                          <p className="text-sm">
                            {selectedProject
                              ? (isManager
                                ? "No stories found for this project."
                                : "You are not assigned to any tasks in stories for this project.")
                              : "Please select a project to view stories."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Task View Dialog (View Details) - aligned with BacklogPage */}
          <TaskDetailsFullDialog
            open={isBacklogTaskDialogOpen}
            onOpenChange={setIsBacklogTaskDialogOpen}
            task={backlogTaskToView as any}
            stories={allBacklogStoriesForDisplay as any}
            resolveUserName={(id) => {
              const foundUser = users.find((u: any) => u.id === id);
              return foundUser?.name || id;
            }}
            formatDate={(dateString: string) => {
              return new Date(dateString).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short'
              });
            }}
          />

          {/* Effort Manager */}
          <EffortManager
            open={isBacklogEffortManagerOpen}
            onOpenChange={setIsBacklogEffortManagerOpen}
            onLogEffort={handleLogBacklogEffort}
            task={selectedBacklogTaskForEffort ? {
              ...selectedBacklogTaskForEffort,
              assignee: selectedBacklogTaskForEffort.assigneeId ? getUserName(selectedBacklogTaskForEffort.assigneeId) : 'Unassigned',
              efforts: []
            } as any : null}
            allTasks={backlogTasks as any[]}
            allStories={[]}
          />
        </TabsContent>

        {/* Add Story Button - Positioned above scrum board, below sprint section, on the right */}
        {activeView === "scrum-board" && isManager && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsAddStoryDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="default"
              disabled={isSprintEnded}
              title={isSprintEnded ? "Cannot add stories - Sprint has ended" : "Add a new story"}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Story
            </Button>
          </div>
        )}

        <TabsContent value="scrum-board" className="mt-0 flex-1">
          {/* Story-Row Aligned Grid Scrum Board */}

          {sprintStoriesLoading || tasksLoading || issuesLoading ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-gradient-to-br from-white via-green-50/30 to-cyan-50/30">
              <div className="text-center space-y-6">
                <div
                  className="loading"
                  style={{
                    width: "100px",
                    height: "100px",
                    position: "relative",
                    margin: "0px auto",
                  }}
                >
                  <div
                    className="loading__ring"
                    style={{
                      position: "absolute",
                      width: "100px",
                      height: "100px",
                      transform: "skew(30deg, 20deg)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      version="1.1"
                      x="0px"
                      y="0px"
                      viewBox="0 0 100 100"
                      className="loading-svg"
                    >
                      <path d="M85.5,42c-0.2-0.8-0.5-1.7-0.8-2.5c-0.3-0.9-0.7-1.6-1-2.3c-0.3-0.7-0.6-1.3-1-1.9c0.3,0.5,0.5,1.1,0.8,1.7  c0.2,0.7,0.6,1.5,0.8,2.3s0.5,1.7,0.8,2.5c0.8,3.5,1.3,7.5,0.8,12c-0.4,4.3-1.8,9-4.2,13.4c-2.4,4.2-5.9,8.2-10.5,11.2  c-1.1,0.7-2.2,1.5-3.4,2c-0.5,0.2-1.2,0.6-1.8,0.8s-1.3,0.5-1.9,0.8c-2.6,1-5.3,1.7-8.1,1.8l-1.1,0.1L53.8,84c-0.7,0-1.4,0-2.1,0  c-1.4-0.1-2.9-0.1-4.2-0.5c-1.4-0.1-2.8-0.6-4.1-0.8c-1.4-0.5-2.7-0.9-3.9-1.5c-1.2-0.6-2.4-1.2-3.7-1.9c-0.6-0.3-1.2-0.7-1.7-1.1  l-0.8-0.6c-0.3-0.1-0.6-0.4-0.8-0.6l-0.8-0.6L31.3,76l-0.2-0.2L31,75.7l-0.1-0.1l0,0l-1.5-1.5c-1.2-1-1.9-2.1-2.7-3.1  c-0.4-0.4-0.7-1.1-1.1-1.7l-1.1-1.7c-0.3-0.6-0.6-1.2-0.9-1.8c-0.2-0.5-0.6-1.2-0.8-1.8c-0.4-1.2-1-2.4-1.2-3.7  c-0.2-0.6-0.4-1.2-0.5-1.9c-0.1-0.6-0.2-1.2-0.3-1.8c-0.3-1.2-0.3-2.4-0.4-3.7c-0.1-1.2,0-2.5,0.1-3.7c0.2-1.2,0.3-2.4,0.6-3.5  c0.1-0.6,0.3-1.1,0.4-1.7l0.1-0.8l0.3-0.8c1.5-4.3,3.8-8,6.5-11c0.8-0.8,1.4-1.5,2.1-2.1c0.9-0.9,1.4-1.3,2.2-1.8  c1.4-1.2,2.9-2,4.3-2.8c2.8-1.5,5.5-2.3,7.7-2.8s4-0.7,5.2-0.6c0.6-0.1,1.1,0,1.4,0s0.4,0,0.4,0h0.1c2.7,0.1,5-2.2,5-5  c0.1-2.7-2.2-5-5-5c-0.2,0-0.2,0-0.3,0c0,0-0.2,0.1-0.6,0.1c-0.4,0-1,0-1.8,0.1c-1.6,0.1-4,0.4-6.9,1.2c-2.9,0.8-6.4,2-9.9,4.1  c-1.8,1-3.6,2.3-5.4,3.8C26,21.4,25,22.2,24.4,23c-0.2,0.2-0.4,0.4-0.6,0.6c-0.2,0.2-0.5,0.4-0.6,0.7c-0.5,0.4-0.8,0.9-1.3,1.4  c-3.2,3.9-5.9,8.8-7.5,14.3l-0.3,1l-0.2,1.1c-0.1,0.7-0.3,1.4-0.4,2.1c-0.3,1.5-0.4,2.9-0.5,4.5c0,1.5-0.1,3,0.1,4.5  c0.2,1.5,0.2,3,0.6,4.6c0.1,0.7,0.3,1.5,0.4,2.3c0.2,0.8,0.5,1.5,0.7,2.3c0.4,1.6,1.1,3,1.7,4.4c0.3,0.7,0.7,1.4,1.1,2.1  c0.4,0.8,0.8,1.4,1.2,2.1c0.5,0.7,0.9,1.4,1.4,2s0.9,1.3,1.5,1.9c1.1,1.3,2.2,2.7,3.3,3.5l1.7,1.6c0,0,0.1,0.1,0.1,0.1c0,0,0,0,0,0  c0,0,0,0,0,0l0.1,0.1l0.1,0.1h0.2l0.5,0.4l1,0.7c0.4,0.2,0.6,0.5,1,0.7l1.1,0.6c0.8,0.4,1.4,0.9,2.1,1.2c1.4,0.7,2.9,1.5,4.4,2  c1.5,0.7,3.1,1,4.6,1.5c1.5,0.3,3.1,0.7,4.7,0.8c1.6,0.2,3.1,0.2,4.7,0.2c0.8,0,1.6-0.1,2.4-0.1l1.2-0.1l1.1-0.1  c3.1-0.4,6.1-1.3,8.9-2.4c0.8-0.3,1.4-0.6,2.1-0.9s1.3-0.7,2-1.1c1.3-0.7,2.6-1.7,3.7-2.5c0.5-0.4,1-0.9,1.6-1.3l0.8-0.6l0.2-0.2  c0,0,0.1-0.1,0.1-0.1c0.1-0.1,0,0,0,0v0.1l0.1-0.1l0.4-0.4c0.5-0.5,1-1,1.5-1.5c0.3-0.3,0.5-0.5,0.8-0.8l0.7-0.8  c0.9-1.1,1.8-2.2,2.5-3.3c0.4-0.6,0.7-1.1,1.1-1.7c0.3-0.7,0.6-1.2,0.9-1.8c2.4-4.9,3.5-9.8,3.7-14.4C87.3,49.7,86.6,45.5,85.5,42z"></path>
                    </svg>
                  </div>
                  <div
                    className="loading__ring"
                    style={{
                      position: "absolute",
                      width: "100px",
                      height: "100px",
                      transform: "skew(-30deg, -20deg) scale(-1, 1)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      version="1.1"
                      x="0px"
                      y="0px"
                      viewBox="0 0 100 100"
                      className="loading-svg"
                    >
                      <path d="M85.5,42c-0.2-0.8-0.5-1.7-0.8-2.5c-0.3-0.9-0.7-1.6-1-2.3c-0.3-0.7-0.6-1.3-1-1.9c0.3,0.5,0.5,1.1,0.8,1.7  c0.2,0.7,0.6,1.5,0.8,2.3s0.5,1.7,0.8,2.5c0.8,3.5,1.3,7.5,0.8,12c-0.4,4.3-1.8,9-4.2,13.4c-2.4,4.2-5.9,8.2-10.5,11.2  c-1.1,0.7-2.2,1.5-3.4,2c-0.5,0.2-1.2,0.6-1.8,0.8s-1.3,0.5-1.9,0.8c-2.6,1-5.3,1.7-8.1,1.8l-1.1,0.1L53.8,84c-0.7,0-1.4,0-2.1,0  c-1.4-0.1-2.9-0.1-4.2-0.5c-1.4-0.1-2.8-0.6-4.1-0.8c-1.4-0.5-2.7-0.9-3.9-1.5c-1.2-0.6-2.4-1.2-3.7-1.9c-0.6-0.3-1.2-0.7-1.7-1.1  l-0.8-0.6c-0.3-0.1-0.6-0.4-0.8-0.6l-0.8-0.6L31.3,76l-0.2-0.2L31,75.7l-0.1-0.1l0,0l-1.5-1.5c-1.2-1-1.9-2.1-2.7-3.1  c-0.4-0.4-0.7-1.1-1.1-1.7l-1.1-1.7c-0.3-0.6-0.6-1.2-0.9-1.8c-0.2-0.5-0.6-1.2-0.8-1.8c-0.4-1.2-1-2.4-1.2-3.7  c-0.2-0.6-0.4-1.2-0.5-1.9c-0.1-0.6-0.2-1.2-0.3-1.8c-0.3-1.2-0.3-2.4-0.4-3.7c-0.1-1.2,0-2.5,0.1-3.7c0.2-1.2,0.3-2.4,0.6-3.5  c0.1-0.6,0.3-1.1,0.4-1.7l0.1-0.8l0.3-0.8c1.5-4.3,3.8-8,6.5-11c0.8-0.8,1.4-1.5,2.1-2.1c0.9-0.9,1.4-1.3,2.2-1.8  c1.4-1.2,2.9-2,4.3-2.8c2.8-1.5,5.5-2.3,7.7-2.8s4-0.7,5.2-0.6c0.6-0.1,1.1,0,1.4,0s0.4,0,0.4,0h0.1c2.7,0.1,5-2.2,5-5  c0.1-2.7-2.2-5-5-5c-0.2,0-0.2,0-0.3,0c0,0-0.2,0.1-0.6,0.1c-0.4,0-1,0-1.8,0.1c-1.6,0.1-4,0.4-6.9,1.2c-2.9,0.8-6.4,2-9.9,4.1  c-1.8,1-3.6,2.3-5.4,3.8C26,21.4,25,22.2,24.4,23c-0.2,0.2-0.4,0.4-0.6,0.6c-0.2,0.2-0.5,0.4-0.6,0.7c-0.5,0.4-0.8,0.9-1.3,1.4  c-3.2,3.9-5.9,8.8-7.5,14.3l-0.3,1l-0.2,1.1c-0.1,0.7-0.3,1.4-0.4,2.1c-0.3,1.5-0.4,2.9-0.5,4.5c0,1.5-0.1,3,0.1,4.5  c0.2,1.5,0.2,3,0.6,4.6c0.1,0.7,0.3,1.5,0.4,2.3c0.2,0.8,0.5,1.5,0.7,2.3c0.4,1.6,1.1,3,1.7,4.4c0.3,0.7,0.7,1.4,1.1,2.1  c0.4,0.8,0.8,1.4,1.2,2.1c0.5,0.7,0.9,1.4,1.4,2s0.9,1.3,1.5,1.9c1.1,1.3,2.2,2.7,3.3,3.5l1.7,1.6c0,0,0.1,0.1,0.1,0.1c0,0,0,0,0,0  c0,0,0,0,0,0l0.1,0.1l0.1,0.1h0.2l0.5,0.4l1,0.7c0.4,0.2,0.6,0.5,1,0.7l1.1,0.6c0.8,0.4,1.4,0.9,2.1,1.2c1.4,0.7,2.9,1.5,4.4,2  c1.5,0.7,3.1,1,4.6,1.5c1.5,0.3,3.1,0.7,4.7,0.8c1.6,0.2,3.1,0.2,4.7,0.2c0.8,0,1.6-0.1,2.4-0.1l1.2-0.1l1.1-0.1  c3.1-0.4,6.1-1.3,8.9-2.4c0.8-0.3,1.4-0.6,2.1-0.9s1.3-0.7,2-1.1c1.3-0.7,2.6-1.7,3.7-2.5c0.5-0.4,1-0.9,1.6-1.3l0.8-0.6l0.2-0.2  c0,0,0.1-0.1,0.1-0.1c0.1-0.1,0,0,0,0v0.1l0.1-0.1l0.4-0.4c0.5-0.5,1-1,1.5-1.5c0.3-0.3,0.5-0.5,0.8-0.8l0.7-0.8  c0.9-1.1,1.8-2.2,2.5-3.3c0.4-0.6,0.7-1.1,1.1-1.7c0.3-0.7,0.6-1.2,0.9-1.8c2.4-4.9,3.5-9.8,3.7-14.4C87.3,49.7,86.6,45.5,85.5,42z"></path>
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    Board Loading
                  </p>
                </div>
              </div>
            </div>
          ) : !selectedProject ? (
            <div className="flex items-center justify-center py-16">
              <Card className="w-[480px] shadow-xl border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                    <Layers3 className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    No Project Selected
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-400 mt-2">
                    Select a project from the dropdown above to view the Scrum board
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-2 pb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Use the project selector in the header</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (!selectedSprint || !currentSprint) && !selectedBoard ? (
            <div className="flex items-center justify-center py-16">
              <Card className="w-[480px] shadow-xl border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    No Sprint Selected
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-400 mt-2">
                    {sprints.filter(
                      (s: Sprint) => s.projectId === selectedProject,
                    ).length === 0
                      ? "This project doesn't have any sprints yet. Create your first sprint to get started."
                      : "Select a sprint from the sprint selector to view the Scrum board."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pt-4 pb-6">
                  {canManageSprintsAndStories &&
                    sprints.filter((s: Sprint) => s.projectId === selectedProject)
                      .length === 0 && (
                      <Button
                        className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg"
                        onClick={() => {
                          setActiveView("sprint-management");
                          setIsSprintDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Sprint
                      </Button>
                    )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Search Bar - Completely outside the scrum board */}
              <div className="bg-white border rounded-lg mb-4 p-3 flex items-center gap-3 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by title or full UUID (T) for tasks, I) for issues - hover ID for full UUID)..."
                    value={scrumBoardSearch}
                    onChange={(e) => setScrumBoardSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                {scrumBoardSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setScrumBoardSearch("")}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Scrum Board Container - Restructured for separate header/body scroll */}
              <div className="relative border rounded-lg bg-white shadow-sm flex flex-col" style={{ height: "calc(100vh - 240px)", minHeight: "450px" }}>
                {/* Fixed Lane Headers - Always visible at top */}
                <div className="flex-shrink-0 overflow-x-auto scrum-board-header" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="min-w-[1200px]">
                    <div
                      className="grid gap-0 bg-gray-100 border-b shadow-sm"
                      style={{
                        gridTemplateColumns: `300px repeat(${3 + lanesAfterInProgress.length + lanesAfterQA.length}, 260px) 260px`,
                      }}
                    >
                      <div className="p-3 bg-green-100/80 border-r border-gray-200">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-green-600" />

                          <span className="font-semibold text-sm">Stories</span>

                          <Badge variant="secondary" className="text-xs">
                            {boardStories.length}
                          </Badge>

                          {canManageSprintsAndStories && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs font-medium flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <span>Pull Stories</span>

                                  <span className="text-[10px] uppercase text-muted-foreground">
                                    {storyScopeLabel}
                                  </span>

                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="start" sideOffset={4}>
                                <DropdownMenuLabel>Pull Stories</DropdownMenuLabel>

                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                  Current: {storyScopeLabel}
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                {/* Pull from Backlog - Only for Managers */}
                                {canManageSprintsAndStories && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setPendingBacklogStoryIds(
                                        selectedBacklogStoryIds,
                                      );

                                      setIsPullStoriesDialogOpen(true);

                                      refetchSprintStories();
                                      refetchBacklogStories();
                                    }}
                                  >
                                    <GitBranch className="w-4 h-4 mr-2" />
                                    Pull from Backlog...
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => handlePullStories("sprint")}
                                  disabled={!selectedSprint}
                                  className={
                                    storiesScope === "sprint"
                                      ? "font-semibold text-green-700"
                                      : ""
                                  }
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Sprint Stories
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => handlePullStories("backlog")}
                                  className={
                                    storiesScope === "backlog"
                                      ? "font-semibold text-purple-700"
                                      : ""
                                  }
                                >
                                  <Layers3 className="w-4 h-4 mr-2" />
                                  Backlog Stories
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => handlePullStories("all")}
                                  disabled={!selectedSprint}
                                  className={
                                    storiesScope === "all"
                                      ? "font-semibold text-blue-700"
                                      : ""
                                  }
                                >
                                  <GitBranch className="w-4 h-4 mr-2" />
                                  Sprint + Backlog
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-blue-100/80 border-r border-gray-200 min-w-[240px]">
                        <div className="flex items-center space-x-2">
                          <Timer className="w-4 h-4 text-blue-600" />

                          <span className="font-semibold text-sm">To Do</span>

                          <Badge variant="secondary" className="text-xs">
                            {getTasksByStatus("todo").length + getIssuesByStatus("todo").length}
                          </Badge>
                        </div>
                      </div>

                      {/* Default In Progress Column */}

                      <div className="p-3 bg-orange-100/80 border-r border-gray-200 min-w-[240px]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <PlayCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />

                            <span className="font-semibold text-sm whitespace-nowrap">
                              In Progress
                            </span>

                            <Badge
                              variant="secondary"
                              className="text-xs flex-shrink-0"
                            >
                              {getTasksByStatus("inprogress").length + getIssuesByStatus("inprogress").length}
                            </Badge>
                          </div>

                          {canManageSprintsAndStories && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-orange-200 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <MoreHorizontal className="w-4 h-4 text-orange-600" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault();

                                    e.stopPropagation();

                                    console.log("Add Lane clicked from In Progress");

                                    handleOpenLaneConfigForStatus("inprogress");
                                  }}
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  Add Lane
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => {
                                    const lane = workflowLanes.find(
                                      (l) =>
                                        l.statusValue
                                          ?.toLowerCase()
                                          .includes("in_progress") ||
                                        l.statusValue
                                          ?.toLowerCase()
                                          .includes("inprogress"),
                                    );

                                    if (lane?.id) {
                                      handleDeleteWorkflowLane(lane.id);
                                    }
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Lane
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>

                      {/* Render Custom Lanes After In Progress (before QA) */}

                      {lanesAfterInProgress.map((lane) => {
                        const tasksInLane = getTasksByStatus(lane.statusValue);
                        const issuesInLane = getIssuesByStatus(lane.statusValue);

                        const laneColor = lane.color || "#3B82F6";

                        // Convert hex color to RGB for background opacity

                        const hexToRgb = (hex: string) => {
                          const result =
                            /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

                          return result
                            ? {
                              r: parseInt(result[1], 16),

                              g: parseInt(result[2], 16),

                              b: parseInt(result[3], 16),
                            }
                            : { r: 59, g: 130, b: 246 };
                        };

                        const rgb = hexToRgb(laneColor);

                        const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;

                        const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;

                        return (
                          <div
                            key={lane.id}
                            className="p-3 border-r border-gray-200 min-w-[240px]"
                            style={{
                              backgroundColor: bgColor,

                              borderRightColor: borderColor,
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-2 min-w-0">
                                <div
                                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                  style={{ backgroundColor: laneColor }}
                                />

                                <span
                                  className="font-semibold text-sm whitespace-nowrap"
                                  style={{ color: laneColor }}
                                >
                                  {lane.title}
                                </span>

                                <Badge
                                  variant="secondary"
                                  className="text-xs flex-shrink-0"
                                >
                                  {tasksInLane.length + issuesInLane.length}
                                </Badge>

                                {lane.wipLimitEnabled && lane.wipLimit && (
                                  <Badge
                                    variant={
                                      tasksInLane.length > lane.wipLimit
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-xs flex-shrink-0"
                                  >
                                    WIP: {tasksInLane.length}/{lane.wipLimit}
                                  </Badge>
                                )}
                              </div>

                              {canManageSprintsAndStories && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 flex-shrink-0"
                                      style={{ color: laneColor }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleOpenLaneConfig(lane)}
                                    >
                                      <Settings className="w-4 h-4 mr-2" />
                                      Configure Lane
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteWorkflowLane(lane.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Lane
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>

                            {lane.objective && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1 truncate">
                                {lane.objective}
                              </p>
                            )}
                          </div>
                        );
                      })}

                      {/* QA Column - Show for all boards (default and custom) to match default board styling */}

                      <>
                        <div className="p-3 bg-purple-100/80 border-r border-gray-200 min-w-[240px]">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2 min-w-0">
                              <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />

                              <span className="font-semibold text-sm whitespace-nowrap">
                                QA
                              </span>

                              <Badge
                                variant="secondary"
                                className="text-xs flex-shrink-0"
                              >
                                {getTasksByStatus("qa").length + getIssuesByStatus("qa").length}
                              </Badge>
                            </div>

                            {canManageSprintsAndStories && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-purple-200 flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    <MoreHorizontal className="w-4 h-4 text-purple-600" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.preventDefault();

                                      e.stopPropagation();

                                      console.log("Add Lane clicked from QA");

                                      handleOpenLaneConfigForStatus("qa");
                                    }}
                                  >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Add Lane
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => {
                                      const lane = workflowLanes.find(
                                        (l) =>
                                          l.statusValue
                                            ?.toLowerCase()
                                            .includes("qa") ||
                                          l.statusValue
                                            ?.toLowerCase()
                                            .includes("review"),
                                      );

                                      if (lane?.id) {
                                        handleDeleteWorkflowLane(lane.id);
                                      }
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Lane
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>

                        {/* Render Custom Lanes After QA (before Done) - Show for all boards */}
                      </>

                      {/* Render Custom Lanes After QA (before Done) - Show for all boards to match default board styling */}

                      {lanesAfterQA.map((lane) => {
                        const tasksInLane = getTasksByStatus(lane.statusValue);
                        const issuesInLane = getIssuesByStatus(lane.statusValue);

                        const laneColor = lane.color || "#3B82F6";

                        // Convert hex color to RGB for background opacity

                        const hexToRgb = (hex: string) => {
                          const result =
                            /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

                          return result
                            ? {
                              r: parseInt(result[1], 16),

                              g: parseInt(result[2], 16),

                              b: parseInt(result[3], 16),
                            }
                            : { r: 59, g: 130, b: 246 };
                        };

                        const rgb = hexToRgb(laneColor);

                        const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;

                        const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;

                        return (
                          <div
                            key={lane.id}
                            className="p-3 border-r border-gray-200 min-w-[240px]"
                            style={{
                              backgroundColor: bgColor,

                              borderRightColor: borderColor,
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-2 min-w-0">
                                <div
                                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                  style={{ backgroundColor: laneColor }}
                                />

                                <span
                                  className="font-semibold text-sm whitespace-nowrap"
                                  style={{ color: laneColor }}
                                >
                                  {lane.title}
                                </span>

                                <Badge
                                  variant="secondary"
                                  className="text-xs flex-shrink-0"
                                >
                                  {tasksInLane.length + issuesInLane.length}
                                </Badge>

                                {lane.wipLimitEnabled && lane.wipLimit && (
                                  <Badge
                                    variant={
                                      tasksInLane.length > lane.wipLimit
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-xs flex-shrink-0"
                                  >
                                    WIP: {tasksInLane.length}/{lane.wipLimit}
                                  </Badge>
                                )}
                              </div>

                              {canManageSprintsAndStories && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 flex-shrink-0"
                                      style={{ color: laneColor }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleOpenLaneConfig(lane)}
                                    >
                                      <Settings className="w-4 h-4 mr-2" />
                                      Configure Lane
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteWorkflowLane(lane.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Lane
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>

                            {lane.objective && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1 truncate">
                                {lane.objective}
                              </p>
                            )}
                          </div>
                        );
                      })}

                      <div className="p-3 bg-emerald-100/80 border-r border-gray-200 min-w-[240px]">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                          <span className="font-semibold text-sm">Done</span>

                          <Badge variant="secondary" className="text-xs">
                            {getTasksByStatus("done").length + getIssuesByStatus("done").length}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* End of Fixed Lane Headers */}

                {/* Scrollable Story Rows Body - Synced horizontal scroll with header */}
                <div
                  className="flex-1 overflow-auto scrum-board-body"
                  onScroll={(e) => {
                    const target = e.target as HTMLElement;
                    const header = document.querySelector('.scrum-board-header') as HTMLElement;
                    if (header) {
                      header.scrollLeft = target.scrollLeft;
                    }
                  }}
                >
                  <div className="min-w-[1200px]">
                    {/* Story Rows Content */}
                    <div className="w-full">
                      {boardStories.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />

                            <h3 className="font-medium text-gray-600 mb-2">
                              No stories in this view
                            </h3>

                            <p className="text-sm text-gray-500">
                              Add stories or change the pull scope to see the grid
                              layout
                            </p>
                          </div>
                        </div>
                      ) : (
                        boardStories.map((story, storyIndex) => {
                          // Get tasks for this story by status

                          // Search filter helper - checks title and UUID with T)/I) prefix support
                          const matchesTaskSearch = (task: Task) => {
                            if (!scrumBoardSearch) return true;
                            const search = scrumBoardSearch.toLowerCase().trim();
                            // Check if searching for task UUID with T) prefix
                            if (search.startsWith('t)')) {
                              const uuidSearch = search.substring(2).trim();
                              return task.id.toLowerCase().includes(uuidSearch);
                            }
                            // Otherwise search by title or ID
                            return task.title.toLowerCase().includes(search) ||
                              task.id.toLowerCase().includes(search);
                          };

                          const matchesIssueSearch = (issue: Issue) => {
                            if (!scrumBoardSearch) return true;
                            const search = scrumBoardSearch.toLowerCase().trim();
                            // Check if searching for issue UUID with I) prefix
                            if (search.startsWith('i)')) {
                              const uuidSearch = search.substring(2).trim();
                              return issue.id.toLowerCase().includes(uuidSearch);
                            }
                            // Otherwise search by title or ID
                            return issue.title.toLowerCase().includes(search) ||
                              issue.id.toLowerCase().includes(search);
                          };

                          // Backend returns: to_do, in_progress, qa_review, done, blocked, cancelled

                          const todoTasks = allTasks.filter(
                            (task) =>
                              task.storyId === story.id &&
                              matchesTaskSearch(task) &&
                              ((task.status as any) === "to_do" ||
                                (task.status as any) === "TO_DO" ||
                                (task.status as any) === "todo" ||
                                (task.status as any) === "TODO"),
                          );

                          const inProgressTasks = allTasks.filter(
                            (task) =>
                              task.storyId === story.id &&
                              matchesTaskSearch(task) &&
                              ((task.status as any) === "in_progress" ||
                                (task.status as any) === "IN_PROGRESS" ||
                                (task.status as any) === "inprogress" ||
                                (task.status as any) === "INPROGRESS"),
                          );

                          const qaTasks = allTasks.filter(
                            (task) =>
                              task.storyId === story.id &&
                              matchesTaskSearch(task) &&
                              ((task.status as any) === "qa_review" ||
                                (task.status as any) === "QA_REVIEW" ||
                                (task.status as any) === "qa" ||
                                (task.status as any) === "QA"),
                          );

                          const doneTasks = allTasks.filter(
                            (task) =>
                              task.storyId === story.id &&
                              matchesTaskSearch(task) &&
                              ((task.status as any) === "done" || (task.status as any) === "DONE"),
                          );

                          // Get issues for this story by status (same status mapping as tasks)

                          const todoIssues = allIssues.filter(
                            (issue) =>
                              issue.storyId === story.id &&
                              matchesIssueSearch(issue) &&
                              ((issue.status as any) === "to_do" ||
                                (issue.status as any) === "TO_DO" ||
                                (issue.status as any) === "todo" ||
                                (issue.status as any) === "TODO"),
                          );

                          const inProgressIssues = allIssues.filter(
                            (issue) =>
                              issue.storyId === story.id &&
                              matchesIssueSearch(issue) &&
                              ((issue.status as any) === "in_progress" ||
                                (issue.status as any) === "IN_PROGRESS" ||
                                (issue.status as any) === "inprogress" ||
                                (issue.status as any) === "INPROGRESS"),
                          );

                          const qaIssues = allIssues.filter(
                            (issue) =>
                              issue.storyId === story.id &&
                              matchesIssueSearch(issue) &&
                              ((issue.status as any) === "qa_review" ||
                                (issue.status as any) === "QA_REVIEW" ||
                                (issue.status as any) === "qa" ||
                                (issue.status as any) === "QA"),
                          );

                          const doneIssues = allIssues.filter(
                            (issue) =>
                              issue.storyId === story.id &&
                              matchesIssueSearch(issue) &&
                              ((issue.status as any) === "done" || (issue.status as any) === "DONE"),
                          );

                          const maxTaskCount = Math.max(
                            todoTasks.length + todoIssues.length,

                            inProgressTasks.length + inProgressIssues.length,

                            qaTasks.length + qaIssues.length,

                            doneTasks.length + doneIssues.length,

                            1,
                          );

                          // Debug logging

                          console.log(`Story ${story.id} (${story.title}):`, {
                            allTasksCount: allTasks.length,

                            storyTasks: allTasks.filter(
                              (t) => t.storyId === story.id,
                            ),

                            todoTasks: todoTasks.length,

                            inProgressTasks: inProgressTasks.length,

                            qaTasks: qaTasks.length,

                            doneTasks: doneTasks.length,

                            allTaskStatuses: allTasks.map((t) => ({
                              id: t.id,
                              storyId: t.storyId,
                              status: t.status,
                              statusType: typeof t.status,
                            })),
                          });

                          // Drop zone component for each cell (displays both tasks and issues)

                          const TaskDropZone: React.FC<{
                            status: string;
                            tasks: Task[];
                            issues: Issue[];
                            bgClass: string;
                            style?: React.CSSProperties;
                          }> = ({ status, tasks, issues, bgClass, style }) => {
                            // Disable drop for REGULAR developers on Done column only
                            // QA Developer and QA Manager CAN drop to Done from any column
                            // Developers can add tasks to all other lanes including manager-created lanes
                            const isDoneColumn = status === "done";
                            // Check if the status maps to DONE
                            const mappedStatus = mapColumnToTaskStatus(status);
                            const isDoneStatus = isDoneColumn || mappedStatus === "DONE";
                            // Only block regular developers from Done, QA roles (including original role) can drop to Done
                            const canDropForDeveloper = !(isRegularDeveloper && isDoneStatus) || isOriginalQADeveloper || isQADeveloper;

                            // Check if trying to drop from "In Progress" to "To Do" (only managers allowed)
                            const isTodoColumn = status === "todo" || status === "TO_DO" || status === "TODO" ||
                              (status && status.toLowerCase() === "todo");

                            // Check if trying to drop to "In Progress" column
                            const isInProgressColumn = status === "inprogress" || status === "IN_PROGRESS" || status === "in_progress" ||
                              (status && status.toLowerCase() === "inprogress");

                            const canDropForManager = (item: { id: string; type: string } | null) => {
                              // QA Developer has same drag permissions as managers (can drag between all columns)
                              // Also check isOriginalQADeveloper for role-switched users
                              if (!item || canManageSprintsAndStories || isQADeveloper || isOriginalQADeveloper) {
                                return true; // Allow if user is manager or QA Developer (current or original role)
                              }

                              // Check if trying to drop from "In Progress" to "To Do" (only managers allowed)
                              if (isTodoColumn) {
                                if (item.type === ItemTypes.TASK) {
                                  const task = allTasks.find((t) => t.id === item.id);
                                  const taskStatus = task?.status?.toUpperCase() || "";
                                  if (taskStatus === "IN_PROGRESS" || taskStatus === "in_progress".toUpperCase()) {
                                    return false; // Prevent non-managers from dropping
                                  }
                                } else if (item.type === ItemTypes.ISSUE) {
                                  const issue = allIssues.find((i) => i.id === item.id);
                                  const issueStatus = issue?.status?.toUpperCase() || "";
                                  if (issueStatus === "IN_PROGRESS" || issueStatus === "in_progress".toUpperCase()) {
                                    return false; // Prevent non-managers from dropping
                                  }
                                }
                              }

                              // Check if trying to drop from "To Do" to "In Progress" (only managers allowed)
                              if (isInProgressColumn) {
                                if (item.type === ItemTypes.TASK) {
                                  const task = allTasks.find((t) => t.id === item.id);
                                  const taskStatus = task?.status?.toUpperCase() || "";
                                  if (taskStatus === "TO_DO" || taskStatus === "TODO" || taskStatus === "todo".toUpperCase() || taskStatus === "to_do".toUpperCase()) {
                                    return false; // Prevent non-managers from dropping
                                  }
                                } else if (item.type === ItemTypes.ISSUE) {
                                  const issue = allIssues.find((i) => i.id === item.id);
                                  const issueStatus = issue?.status?.toUpperCase() || "";
                                  if (issueStatus === "TO_DO" || issueStatus === "TODO" || issueStatus === "todo".toUpperCase() || issueStatus === "to_do".toUpperCase()) {
                                    return false; // Prevent non-managers from dropping
                                  }
                                }
                              }

                              return true;
                            };

                            const [{ isOver }, drop] = useDrop(() => ({
                              accept: [ItemTypes.TASK, ItemTypes.ISSUE],

                              drop: (item: { id: string; type: string }) => {
                                if (canDropForDeveloper && canDropForManager(item)) {
                                  moveItem(item.id, status, item.type);
                                }
                              },

                              canDrop: (item: { id: string; type: string }) => {
                                return canDropForDeveloper && canDropForManager(item);
                              },

                              collect: (monitor) => ({
                                isOver: monitor.isOver() && canDropForDeveloper && canDropForManager(monitor.getItem()),
                              }),
                            }));

                            return (
                              <div
                                ref={drop as unknown as React.Ref<HTMLDivElement>}
                                className={`p-3 border-r border-gray-200 ${bgClass} ${isOver ? "bg-blue-100 ring-2 ring-blue-400 ring-inset" : ""} transition-all`}
                                style={style}
                                title={
                                  !canDropForDeveloper
                                    ? "Developers cannot move items to Done column"
                                    : isTodoColumn && !canManageSprintsAndStories
                                      ? "Only managers can move items from In Progress back to To Do"
                                      : isInProgressColumn && !canManageSprintsAndStories
                                        ? "Only managers can move items from To Do to In Progress"
                                        : undefined
                                }
                              >
                                <div className="grid grid-cols-2 gap-2 min-h-[80px]">
                                  {tasks.map((task, taskIndex) => (
                                    <DraggableTask
                                      key={task.id}
                                      task={task}
                                      index={taskIndex}
                                    />
                                  ))}

                                  {issues.map((issue, issueIndex) => (
                                    <DraggableIssue
                                      key={issue.id}
                                      issue={issue}
                                      index={issueIndex}
                                    />
                                  ))}

                                  {tasks.length === 0 &&
                                    issues.length === 0 &&
                                    !isOver && (
                                      <div className="col-span-2 text-center py-6 text-gray-300 text-xs">
                                        Drop here
                                      </div>
                                    )}
                                </div>
                              </div>
                            );
                          };

                          // Helper to get tasks for a custom lane

                          const getTasksForLane = (statusValue: string) => {
                            return allTasks.filter((task) => {
                              if (task.storyId !== story.id) return false;

                              // Check if task status directly matches the lane's statusValue

                              if (task.status === statusValue) return true;

                              // Also check mapped status

                              const mappedColumn = mapTaskStatusToColumn(task.status);

                              return mappedColumn === statusValue;
                            });
                          };

                          // Helper to get issues for a custom lane

                          const getIssuesForLane = (statusValue: string) => {
                            return allIssues.filter((issue) => {
                              if (issue.storyId !== story.id) return false;

                              // Check if issue status directly matches the lane's statusValue

                              if (issue.status === statusValue) return true;

                              // Also check mapped status

                              const mappedColumn = mapTaskStatusToColumn(
                                issue.status,
                              );

                              return mappedColumn === statusValue;
                            });
                          };

                          return (
                            <div
                              key={story.id}
                              className="grid gap-0 border-b border-gray-200 bg-white"
                              style={{
                                // Match header layout with fixed-width columns for consistent scrolling
                                gridTemplateColumns: `300px repeat(${3 + lanesAfterInProgress.length + lanesAfterQA.length}, 260px) 260px`,
                              }}
                            >
                              {/* Story Column */}

                              <div
                                className="p-4 border-r border-gray-200 bg-green-50/20"
                                style={{ minHeight: "280px" }}
                              >
                                <DraggableStory story={story} index={storyIndex} />
                              </div>

                              {/* To Do Column */}

                              <TaskDropZone
                                status="todo"
                                tasks={todoTasks}
                                issues={todoIssues}
                                bgClass="bg-blue-50/10"
                                style={{ minWidth: "260px" }}
                              />

                              {/* In Progress Column */}

                              <TaskDropZone
                                status="inprogress"
                                tasks={inProgressTasks}
                                issues={inProgressIssues}
                                bgClass="bg-orange-50/10"
                                style={{ minWidth: "260px" }}
                              />

                              {/* Render custom lanes after In Progress */}

                              {lanesAfterInProgress.map((lane) => {
                                const laneTasks = getTasksForLane(lane.statusValue);

                                const laneIssues = getIssuesForLane(lane.statusValue);

                                const laneColor = lane.color || "#3B82F6";

                                const hexToRgb = (hex: string) => {
                                  const result =
                                    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                                      hex,
                                    );

                                  return result
                                    ? {
                                      r: parseInt(result[1], 16),

                                      g: parseInt(result[2], 16),

                                      b: parseInt(result[3], 16),
                                    }
                                    : { r: 59, g: 130, b: 246 };
                                };

                                const rgb = hexToRgb(laneColor);

                                const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;

                                return (
                                  <TaskDropZone
                                    key={lane.id}
                                    status={lane.statusValue}
                                    tasks={laneTasks}
                                    issues={laneIssues}
                                    bgClass=""
                                    style={{
                                      backgroundColor: bgColor,
                                      minWidth: "260px",
                                    }}
                                  />
                                );
                              })}

                              {/* QA Column - Show for all boards (default and custom) to match default board styling */}

                              <TaskDropZone
                                status="qa"
                                tasks={qaTasks}
                                issues={qaIssues}
                                bgClass="bg-purple-50/10"
                                style={{ minWidth: "260px" }}
                              />

                              {/* Render custom lanes after QA - Show for all boards to match default board styling */}

                              {lanesAfterQA.map((lane) => {
                                const laneTasks = getTasksForLane(lane.statusValue);

                                const laneIssues = getIssuesForLane(lane.statusValue);

                                const laneColor = lane.color || "#3B82F6";

                                const hexToRgb = (hex: string) => {
                                  const result =
                                    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                                      hex,
                                    );

                                  return result
                                    ? {
                                      r: parseInt(result[1], 16),

                                      g: parseInt(result[2], 16),

                                      b: parseInt(result[3], 16),
                                    }
                                    : { r: 59, g: 130, b: 246 };
                                };

                                const rgb = hexToRgb(laneColor);

                                const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;

                                return (
                                  <TaskDropZone
                                    key={lane.id}
                                    status={lane.statusValue}
                                    tasks={laneTasks}
                                    issues={laneIssues}
                                    bgClass=""
                                    style={{
                                      backgroundColor: bgColor,
                                      minWidth: "260px",
                                    }}
                                  />
                                );
                              })}

                              {/* Done Column */}

                              <TaskDropZone
                                status="done"
                                tasks={doneTasks}
                                issues={doneIssues}
                                bgClass="bg-emerald-50/10"
                                style={{ minWidth: "260px" }}
                              />

                              {/* Actions Column - Commented out */}
                              {/* 
                        <div className="p-3 bg-gray-50/30 border-r-0">
                          <div className="sticky top-16 space-y-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs justify-start"
                              onClick={() => {
                                setSelectedStoryForDetails(story);

                                setIsStoryDetailsOpen(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>

                            {canAddTasks && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 text-xs border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                  onClick={() => {
                                    setNewTask((prev) => ({
                                      ...prev,
                                      storyId: story.id,
                                    }));

                                    setIsAddTaskDialogOpen(true);
                                  }}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Task
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 text-xs border-dashed border-red-300 hover:border-red-400 hover:bg-red-50 text-red-700"
                                  onClick={() => {
                                    setSelectedStoryForIssue(story.id);

                                    setIsAddIssueDialogOpen(true);
                                  }}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Issue
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        */}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="sprint-management" className="mt-0 flex-1">
          {/* Sprint Management */}

          <div className="space-y-6">
            {/* Sprint Planning Header */}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Sprint Management</h3>

                <p className="text-muted-foreground">
                  Plan and manage your sprints
                </p>
              </div>

              {canManageSprintsAndStories && (
                <Button onClick={() => setIsSprintDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sprint
                </Button>
              )}
            </div>

            {/* Sprint Timeline */}

            {sprintsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />

                <span className="ml-2 text-muted-foreground">
                  Loading sprints...
                </span>
              </div>
            ) : sprints.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />

                  <h3 className="font-medium mb-2">No Sprints Found</h3>

                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedProject
                      ? "This project has no sprints yet. Create your first sprint to get started!"
                      : "Select a project to view its sprints"}
                  </p>

                  {canManageSprintsAndStories && selectedProject && (
                    <Button onClick={() => setIsSprintDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Sprint
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {sprints.map((sprint) => (
                  <Card
                    key={sprint.id}
                    className={`border-2 ${sprint.id === selectedSprint ? "border-green-200 bg-green-50/30" : "border-border"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(getSprintComputedStatus(sprint))}>
                            {getSprintComputedStatus(sprint)}
                          </Badge>

                          <h4 className="font-semibold">{sprint.name}</h4>

                          <Badge variant="outline">
                            {
                              (backlogStoriesData || []).filter(
                                (s) => s.sprintId === sprint.id,
                              ).length
                            }{" "}
                            stories
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                            onClick={(e) => {
                              e.stopPropagation();

                              setSelectedSprintForDetails(sprint);

                              setIsSprintDetailsOpen(true);
                            }}
                            title="View sprint details"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {sprint.goal}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {sprint.endDate
                              ? Math.ceil(
                                (new Date(sprint.endDate).getTime() -
                                  new Date().getTime()) /
                                (1000 * 60 * 60 * 24),
                              )
                              : 0}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Days Left
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {sprint.velocityPoints || 0}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Velocity Points
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-600">
                            {sprint.capacityHours || 0}h
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Capacity
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">
                            {sprint.startDate &&
                              new Date(
                                sprint.startDate,
                              ).toLocaleDateString()}{" "}
                            -{" "}
                            {sprint.endDate &&
                              new Date(sprint.endDate).toLocaleDateString()}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Duration
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="burndown" className="mt-0 flex-1">
          {/* Burndown Velocity Chart */}

          {burndownLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : currentSprint ? (
            (() => {
              const storyPointsCommitted = sprintStories.reduce(
                (sum, s) => sum + (s.storyPoints || 0),
                0,
              );

              const storyPointsCompleted = sprintStories
                .filter((s) => {
                  const tasks = allTasks.filter(t => t.storyId === s.id);
                  if (tasks.length === 0) return s.status === "DONE";

                  // Strict rule: Story is done ONLY if ALL tasks are DONE
                  return tasks.every(t => {
                    const status = t.status?.toUpperCase();
                    return status === "DONE";
                  });
                })
                .reduce((sum, s) => sum + (s.storyPoints || 0), 0);

              const sprintLengthDays =
                currentSprint.startDate && currentSprint.endDate
                  ? Math.ceil(
                    (new Date(currentSprint.endDate).getTime() -
                      new Date(currentSprint.startDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                  )
                  : 14;

              const teamCapacity = currentSprint.capacityHours || undefined;

              // Calculate completed sprints for average velocity

              const completedSprints = sprints.filter(
                (s) => s.status === "COMPLETED",
              ).length;

              // Generate work remaining per day if burndown data is available

              const workRemainingPerDay =
                burndownData?.data?.dataPoints?.map(
                  (point: any) => point.remainingWork || 0,
                ) || [];

              // Override the last data point with the strictly calculated remaining work
              // This ensures the chart reflects the immediate client-side state
              if (workRemainingPerDay.length > 0) {
                const currentRemainingWork = Math.max(0, storyPointsCommitted - storyPointsCompleted);
                workRemainingPerDay[workRemainingPerDay.length - 1] = currentRemainingWork;
              }

              // Dynamic Color Logic
              const currentDayIndex = Math.floor((new Date().getTime() - new Date(currentSprint.startDate || "").getTime()) / (1000 * 60 * 60 * 24));
              const idealBurnRate = storyPointsCommitted / (sprintLengthDays || 1);
              const idealRemainingToday = Math.max(0, storyPointsCommitted - (currentDayIndex * idealBurnRate));
              const currentActualRemaining = Math.max(0, storyPointsCommitted - storyPointsCompleted);

              // Red if behind (Actual > Ideal), Green if ahead/on-track (Actual <= Ideal)
              // Keep Ideal line blue (handled in BurndownChart defaults/constants)
              const chartColor = currentActualRemaining > idealRemainingToday ? "#ef4444" : "#10b981";

              return (
                <BurndownChart
                  sprintName={currentSprint.name}
                  sprintGoal={currentSprint.goal}
                  startDate={currentSprint.startDate || ""}
                  endDate={currentSprint.endDate || ""}
                  lineColor={chartColor}
                  sprintLengthDays={sprintLengthDays}
                  storyPointsCommitted={storyPointsCommitted}
                  storyPointsCompleted={storyPointsCompleted}
                  teamCapacity={teamCapacity}
                  workRemainingPerDay={
                    workRemainingPerDay.length > 0
                      ? workRemainingPerDay
                      : undefined
                  }
                  numberOfSprints={
                    completedSprints > 0 ? completedSprints : undefined
                  }
                  useHours={false}
                />
              );
            })()
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />

                <h3 className="font-medium mb-2">No Sprint Selected</h3>

                <p className="text-sm text-muted-foreground">
                  Please select a sprint to view the burndown velocity chart.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pull Stories from Backlog Dialog - Only for Managers */}
        {
          canManageSprintsAndStories && (
            <Dialog
              open={isPullStoriesDialogOpen}
              onOpenChange={handlePullStoriesDialogChange}
            >
              <DialogContent
                className="!w-[80vw] !h-[75vh] !max-w-[80vw] !max-h-[75vh] overflow-y-auto !translate-y-[-50%] !min-w-[80vw]"
                style={{ width: '80vw', maxWidth: '80vw', minWidth: '80vw' }}
              >
                <DialogHeader>
                  <DialogTitle>Pull Stories from Backlog</DialogTitle>
                  <DialogDescription>
                    Select stories from the project backlog to pull into the current sprint.
                    Selected stories will be moved to the current sprint with all their tasks.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {projectBacklogStories.length} stor
                      {projectBacklogStories.length === 1 ? "y" : "ies"} available in backlog
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => {
                        if (
                          pendingBacklogStoryIds.length ===
                          projectBacklogStories.length
                        ) {
                          setPendingBacklogStoryIds([]);
                        } else {
                          setPendingBacklogStoryIds(
                            projectBacklogStories.map((story) => story.id),
                          );
                        }
                      }}
                      disabled={projectBacklogStories.length === 0}
                    >
                      {pendingBacklogStoryIds.length ===
                        projectBacklogStories.length &&
                        projectBacklogStories.length > 0
                        ? "Clear all"
                        : "Select all"}
                    </Button>
                  </div>

                  <div className="max-h-80 overflow-y-auto rounded-md border">
                    {projectBacklogStories.length === 0 ? (
                      <div className="py-10 px-4 text-center text-sm text-muted-foreground">
                        No stories available in the backlog for this project.
                      </div>
                    ) : (
                      <div className="divide-y">
                        {projectBacklogStories.map((story) => {
                          const checked = pendingBacklogStoryIds.includes(story.id);

                          return (
                            <label
                              key={story.id}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-muted/60 cursor-pointer"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  handleTogglePendingBacklogStory(story.id)
                                }
                                className="mt-1"
                              />

                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm text-foreground line-clamp-1">
                                    {story.title || story.name}
                                  </span>

                                  {typeof story.storyPoints === "number" && (
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 text-xs flex-shrink-0"
                                    >
                                      {story.storyPoints} pts
                                    </Badge>
                                  )}
                                </div>

                                <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                  {story.description
                                    ? story.description
                                    : "No description provided."}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                  <span className="uppercase tracking-wide">
                                    Status: {story.status || "BACKLOG"}
                                  </span>

                                  {story.priority && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      {story.priority}
                                    </Badge>
                                  )}

                                  {story.assigneeName && (
                                    <span>Assigned To: {story.assigneeName}</span>
                                  )}

                                  {story.epicName && (
                                    <span>Epic: {story.epicName}</span>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => handlePullStoriesDialogChange(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleConfirmPullSelectedStories}
                    disabled={projectBacklogStories.length === 0 || pendingBacklogStoryIds.length === 0}
                  >
                    {pendingBacklogStoryIds.length > 0
                      ? `Pull ${pendingBacklogStoryIds.length} stor${pendingBacklogStoryIds.length === 1 ? "y" : "ies"}`
                      : "Select stories"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }

        {/* Create Sprint Dialog */}

        <Dialog open={isSprintDialogOpen} onOpenChange={setIsSprintDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>

              <DialogDescription>
                Set up a new sprint for your project with goals and timeline.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="sprint-name">Sprint Name</Label>

                <Input
                  id="sprint-name"
                  value={newSprint.name}
                  onChange={(e) =>
                    setNewSprint((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Sprint 18 - Feature Complete"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sprint-goal">Sprint Goal</Label>

                <Textarea
                  id="sprint-goal"
                  value={newSprint.goal}
                  onChange={(e) =>
                    setNewSprint((prev) => ({ ...prev, goal: e.target.value }))
                  }
                  placeholder="What do you want to achieve in this sprint?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>

                  <Input
                    id="start-date"
                    type="date"
                    value={newSprint.startDate}
                    onChange={(e) =>
                      setNewSprint((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>

                  <Input
                    id="end-date"
                    type="date"
                    value={newSprint.endDate}
                    onChange={(e) =>
                      setNewSprint((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Team Capacity (hours)</Label>

                <div className="flex gap-2">
                  <Input
                    id="capacity"
                    type="number"
                    value={newSprint.capacityHours}
                    onChange={(e) =>
                      setNewSprint((prev) => ({
                        ...prev,
                        capacityHours: e.target.value,
                      }))
                    }
                    placeholder="160"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCapacityCalculatorOpen(true)}
                    className="whitespace-nowrap"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the calculator to automatically calculate team capacity based on team size, allocation, and availability.
                </p>
              </div>
            </div>

            <DialogFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsSprintDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={handleCreateSprint}
                disabled={createSprintLoading}
              >
                {createSprintLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Sprint"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Story Dialog */}

        <Dialog
          open={isAddStoryDialogOpen}
          onOpenChange={setIsAddStoryDialogOpen}
        >
          <DialogContent className="w-[75%] max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add User Story</DialogTitle>

              <DialogDescription>
                Create a new user story for your project
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="story-title">Title</Label>

                <Input
                  id="story-title"
                  value={newStory.title}
                  onChange={(e) =>
                    setNewStory((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="As a user, I want to..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story-description">Description</Label>

                <Textarea
                  id="story-description"
                  value={newStory.description}
                  onChange={(e) =>
                    setNewStory((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Detailed description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story-acceptance">Acceptance Criteria</Label>

                <Textarea
                  id="story-acceptance"
                  value={newStory.acceptanceCriteria}
                  onChange={(e) =>
                    setNewStory((prev) => ({
                      ...prev,
                      acceptanceCriteria: e.target.value,
                    }))
                  }
                  placeholder="Given... When... Then..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="story-points">Story Points</Label>

                  <Input
                    id="story-points"
                    type="number"
                    value={newStory.storyPoints}
                    onChange={(e) =>
                      setNewStory((prev) => ({
                        ...prev,
                        storyPoints: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-priority">Priority</Label>

                  <Select
                    value={newStory.priority}
                    onValueChange={(value) =>
                      setNewStory((prev) => ({
                        ...prev,
                        priority: value as Priority,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>

                      <SelectItem value="MEDIUM">Medium</SelectItem>

                      <SelectItem value="HIGH">High</SelectItem>

                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddStoryDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleAddStory} disabled={createStoryLoading}>
                {createStoryLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Story"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Story Details Dialog */}

        <Dialog open={isStoryDetailsOpen} onOpenChange={setIsStoryDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Story Details</DialogTitle>

              <DialogDescription>
                View detailed information about the story
              </DialogDescription>
            </DialogHeader>

            {selectedStoryForDetails && (
              <div className="space-y-6">
                {/* Story Header */}

                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {selectedStoryForDetails.title}
                    </h3>

                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={`${getPriorityColor(selectedStoryForDetails.priority)}`}
                      >
                        {selectedStoryForDetails.priority}
                      </Badge>

                      <Badge variant="secondary">
                        {selectedStoryForDetails.storyPoints} points
                      </Badge>

                      <Badge
                        variant="outline"
                        className={`${getStatusColor(selectedStoryForDetails.status)}`}
                      >
                        {selectedStoryForDetails.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Story Content */}

                <div className="space-y-4">
                  {selectedStoryForDetails.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>

                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                        {selectedStoryForDetails.description}
                      </p>
                    </div>
                  )}

                  {selectedStoryForDetails.acceptanceCriteria && (
                    <div>
                      <h4 className="font-medium mb-2">Acceptance Criteria</h4>

                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                        {selectedStoryForDetails.acceptanceCriteria}
                      </p>
                    </div>
                  )}

                  {/* Story Metadata */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Project</h4>

                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {getProjectName(selectedStoryForDetails.projectId)}
                      </p>
                    </div>

                    {selectedStoryForDetails.sprintId && (
                      <div>
                        <h4 className="font-medium mb-2">Sprint</h4>

                        <p className="text-sm bg-gray-50 p-2 rounded">
                          {getSprintName(selectedStoryForDetails.sprintId)}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Assigned To</h4>

                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedStoryForDetails.assigneeId
                          ? getUserName(selectedStoryForDetails.assigneeId)
                          : "Unassigned"}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center space-x-2">
                        <CalendarDays className="w-4 h-4 text-blue-600" />
                        <span>Due Date</span>
                      </h4>

                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedStoryForDetails.dueDate
                          ? new Date(selectedStoryForDetails.dueDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "No due date set"}
                      </p>
                    </div>
                  </div>

                  {/* Attachments Section */}

                  <div>
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Paperclip className="w-4 h-4" />

                      <span>Attachments</span>
                    </h4>

                    {loadingAttachments ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />

                        <span className="ml-2 text-sm text-gray-500">
                          Loading attachments...
                        </span>
                      </div>
                    ) : storyAttachmentsList.length > 0 ? (
                      <div className="space-y-2">
                        {storyAttachmentsList.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {attachment.fileName}
                                </p>

                                <p className="text-xs text-gray-500">
                                  {attachment.fileSize
                                    ? `${(attachment.fileSize / 1024).toFixed(1)} KB`
                                    : ""}

                                  {attachment.fileType &&
                                    ` • ${attachment.fileType}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setViewingAttachment(attachment);
                                  setIsAttachmentViewerOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (attachment.fileUrl) {
                                    // Handle base64 data URLs
                                    if (attachment.fileUrl.startsWith("data:")) {
                                      const link = document.createElement("a");
                                      link.href = attachment.fileUrl;
                                      link.download = attachment.fileName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    } else {
                                      const link = document.createElement("a");
                                      link.href = attachment.fileUrl;
                                      link.download = attachment.fileName;
                                      link.target = "_blank";
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }
                                  }
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                        No attachments for this story
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsStoryDetailsOpen(false);

                  setStoryAttachmentsList([]);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Story Dialog */}

        <Dialog
          open={isAddStoryDialogOpen}
          onOpenChange={(open) => {
            setIsAddStoryDialogOpen(open);
            if (!open) {
              // Reset popover state when dialog closes
              setIsDueDatePopoverOpen(false);
            }
          }}
        >
          <DialogContent className="w-[75%] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Story</DialogTitle>

              <DialogDescription>
                Add a new user story to your project backlog
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Title */}

              <div className="space-y-2">
                <Label htmlFor="story-title">Title *</Label>

                <Input
                  id="story-title"
                  value={newStory.title}
                  onChange={(e) =>
                    setNewStory((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="As a user, I want to..."
                />
              </div>

              {/* Description */}

              <div className="space-y-2">
                <Label htmlFor="story-description">Description</Label>

                <Textarea
                  id="story-description"
                  value={newStory.description}
                  onChange={(e) =>
                    setNewStory((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Detailed description of the user story"
                  rows={3}
                />
              </div>

              {/* Acceptance Criteria */}

              <div className="space-y-2">
                <Label htmlFor="acceptance-criteria">Acceptance Criteria</Label>

                <Textarea
                  id="acceptance-criteria"
                  value={newStory.acceptanceCriteria}
                  onChange={(e) =>
                    setNewStory((prev) => ({
                      ...prev,
                      acceptanceCriteria: e.target.value,
                    }))
                  }
                  placeholder="Enter acceptance criteria (one per line)"
                  rows={4}
                />

                <p className="text-xs text-muted-foreground mt-1">
                  Enter each criterion on a new line
                </p>
              </div>

              {/* Row 1: Priority, Story Points, Status */}

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="story-priority">Priority *</Label>

                  <Select
                    value={newStory.priority}
                    onValueChange={(value: Priority) =>
                      setNewStory((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger id="story-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>

                      <SelectItem value="MEDIUM">Medium</SelectItem>

                      <SelectItem value="HIGH">High</SelectItem>

                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-points">Story Points</Label>

                  <Select
                    value={newStory.storyPoints?.toString() || "0"}
                    onValueChange={(value) =>
                      setNewStory((prev) => ({
                        ...prev,
                        storyPoints: parseInt(value) || 0,
                      }))
                    }
                  >
                    <SelectTrigger id="story-points">
                      <SelectValue placeholder="Select points" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="13">13</SelectItem>
                      <SelectItem value="21">21</SelectItem>
                      <SelectItem value="34">34</SelectItem>
                      <SelectItem value="55">55</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>

                  <Popover open={isDueDatePopoverOpen} onOpenChange={setIsDueDatePopoverOpen} modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        id="due-date"
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!newStory.dueDate ? "text-muted-foreground" : ""
                          }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newStory.dueDate ? (
                          typeof newStory.dueDate === 'string'
                            ? new Date(newStory.dueDate).toLocaleDateString()
                            : (newStory.dueDate as any).toLocaleDateString()
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start" side="top" sideOffset={5}>
                      <Calendar
                        mode="single"
                        selected={typeof newStory.dueDate === 'string' ? new Date(newStory.dueDate) : newStory.dueDate}
                        onSelect={(date) => {
                          if (date) {
                            setNewStory((prev) => ({
                              ...prev,
                              dueDate: date.toISOString().split('T')[0],
                            }));
                            setIsDueDatePopoverOpen(false);
                          }
                        }}
                        disabled={(date) => {
                          // Get selected sprint dates for validation
                          const selectedSprintData = sprints.find(s => s.id === (newStory.sprintId || selectedSprint));
                          if (selectedSprintData && selectedSprintData.startDate && selectedSprintData.endDate) {
                            const sprintStart = new Date(selectedSprintData.startDate);
                            sprintStart.setHours(0, 0, 0, 0);
                            const sprintEnd = new Date(selectedSprintData.endDate);
                            sprintEnd.setHours(0, 0, 0, 0);
                            const dateOnly = new Date(date);
                            dateOnly.setHours(0, 0, 0, 0);
                            // Disable dates outside sprint range
                            if (dateOnly < sprintStart || dateOnly > sprintEnd) {
                              return true;
                            }
                          }
                          return false;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {(() => {
                    const selectedSprintData = sprints.find(s => s.id === (newStory.sprintId || selectedSprint));
                    if (selectedSprintData && selectedSprintData.endDate) {
                      return (
                        <p className="text-xs text-muted-foreground">
                          Sprint ends: {new Date(selectedSprintData.endDate).toLocaleDateString()}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Row 2: Sprint, Epic, Release */}

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="story-sprint">Sprint *</Label>

                  <Select
                    value={newStory.sprintId || selectedSprint || "BACKLOG"}
                    onValueChange={(value) =>
                      setNewStory((prev) => ({
                        ...prev,
                        sprintId: value === "BACKLOG" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger id="story-sprint">
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="BACKLOG">
                        No Sprint (Backlog)
                      </SelectItem>

                      {sprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-epic">Epic</Label>

                  <Select
                    value={newStory.epicId || "NO_EPIC"}
                    onValueChange={(value) =>
                      setNewStory((prev) => ({
                        ...prev,
                        epicId: value === "NO_EPIC" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger id="story-epic">
                      <SelectValue placeholder="Select epic" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="NO_EPIC">No Epic</SelectItem>

                      {epics.map((epic) => (
                        <SelectItem key={epic.id} value={epic.id}>
                          {epic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-release">Release</Label>

                  <Select
                    value={newStory.releaseId || "NO_RELEASE"}
                    onValueChange={(value) =>
                      setNewStory((prev) => ({
                        ...prev,
                        releaseId: value === "NO_RELEASE" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger id="story-release">
                      <SelectValue placeholder="Select release" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="NO_RELEASE">No Release</SelectItem>

                      {releases.map((release) => (
                        <SelectItem key={release.id} value={release.id}>
                          {release.name} (v{release.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Assignee, Reporter */}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="story-assignee">Assigned To</Label>

                  <Select
                    value={newStory.assigneeId || "UNASSIGNED"}
                    onValueChange={(value) =>
                      setNewStory((prev) => ({
                        ...prev,
                        assigneeId: value === "UNASSIGNED" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger id="story-assignee">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="UNASSIGNED">Unassigned</SelectItem>

                      {availableUsersForAssignment.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story-reporter">Reporter</Label>

                  <Select
                    value={newStory.reporterId || "NO_REPORTER"}
                    onValueChange={(value) =>
                      setNewStory((prev) => ({
                        ...prev,
                        reporterId: value === "NO_REPORTER" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger id="story-reporter">
                      <SelectValue placeholder="Select reporter" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="NO_REPORTER">No Reporter</SelectItem>

                      {availableUsersForAssignment.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Labels */}

              <div className="space-y-2">
                <Label htmlFor="story-labels">Labels</Label>

                <Input
                  id="story-labels"
                  value={newStory.labels?.join(", ") || ""}
                  onChange={(e) =>
                    setNewStory((prev) => ({
                      ...prev,

                      labels: e.target.value
                        .split(",")
                        .map((l) => l.trim())
                        .filter((l) => l),
                    }))
                  }
                  placeholder="bug, feature, enhancement (comma-separated)"
                />

                <p className="text-xs text-muted-foreground mt-1">
                  Enter labels separated by commas
                </p>
              </div>

              {/* Attachments Section */}

              <div className="space-y-2">
                <Label htmlFor="story-attachments">Attachments</Label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="story-attachments"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);

                      setStoryAttachments((prev) => [...prev, ...files]);
                    }}
                  />

                  <label htmlFor="story-attachments" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Paperclip className="w-8 h-8 text-gray-400" />

                      <p className="text-sm text-gray-600">
                        Click to upload files or drag and drop
                      </p>

                      <p className="text-xs text-gray-400">
                        Any file type supported
                      </p>
                    </div>
                  </label>
                </div>

                {/* Display selected files */}

                {storyAttachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700">
                      Selected Files ({storyAttachments.length}):
                    </p>

                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {storyAttachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />

                            <span className="truncate" title={file.name}>
                              {file.name}
                            </span>

                            <span className="text-xs text-gray-500 flex-shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 ml-2"
                            onClick={() => {
                              setStoryAttachments((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddStoryDialogOpen(false);

                  setStoryAttachments([]);
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={handleCreateStory}
                disabled={createStoryLoading || uploadingAttachments}
              >
                {createStoryLoading || uploadingAttachments ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />

                    {uploadingAttachments ? "Uploading..." : "Creating..."}
                  </>
                ) : (
                  "Create Story"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sprint Details Dialog */}

        <Dialog
          open={isSprintDetailsOpen}
          onOpenChange={setIsSprintDetailsOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Sprint Details</DialogTitle>

              <DialogDescription>
                View detailed information about the sprint
              </DialogDescription>
            </DialogHeader>

            {selectedSprintForDetails && (
              <div className="space-y-6">
                {/* Sprint Header */}

                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {selectedSprintForDetails.name}
                    </h3>

                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={getStatusColor(
                          getSprintComputedStatus(selectedSprintForDetails),
                        )}
                      >
                        {getSprintComputedStatus(selectedSprintForDetails)}
                      </Badge>

                      <Badge variant="secondary">
                        {selectedSprintForDetails.velocityPoints || 0} velocity
                        points
                      </Badge>

                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700"
                      >
                        {selectedSprintForDetails.capacityHours || 0} hours
                        capacity
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Sprint Content */}

                <div className="space-y-4">
                  {selectedSprintForDetails.goal && (
                    <div>
                      <h4 className="font-medium mb-2">Sprint Goal</h4>

                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                        {selectedSprintForDetails.goal}
                      </p>
                    </div>
                  )}

                  {/* Sprint Timeline */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Start Date</h4>

                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedSprintForDetails.startDate
                          ? new Date(
                            selectedSprintForDetails.startDate,
                          ).toLocaleDateString("en-US", {
                            weekday: "long",

                            year: "numeric",

                            month: "long",

                            day: "numeric",
                          })
                          : "Not set"}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">End Date</h4>

                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedSprintForDetails.endDate
                          ? new Date(
                            selectedSprintForDetails.endDate,
                          ).toLocaleDateString("en-US", {
                            weekday: "long",

                            year: "numeric",

                            month: "long",

                            day: "numeric",
                          })
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  {/* Sprint Duration */}

                  {selectedSprintForDetails.startDate &&
                    selectedSprintForDetails.endDate && (
                      <div>
                        <h4 className="font-medium mb-2">Duration</h4>

                        <p className="text-sm bg-gray-50 p-2 rounded">
                          {Math.ceil(
                            (new Date(
                              selectedSprintForDetails.endDate,
                            ).getTime() -
                              new Date(
                                selectedSprintForDetails.startDate,
                              ).getTime()) /
                            (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </p>
                      </div>
                    )}

                  {/* Sprint Statistics */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Stories in Sprint</h4>

                      <p className="text-lg font-semibold text-blue-600">
                        {
                          sprintStories.filter(
                            (s) => s.sprintId === selectedSprintForDetails.id,
                          ).length
                        }
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Total Story Points</h4>

                      <p className="text-lg font-semibold text-green-600">
                        {sprintStories
                          .filter(
                            (s) => s.sprintId === selectedSprintForDetails.id,
                          )

                          .reduce(
                            (sum, s) => sum + (s.storyPoints || 0),
                            0,
                          )}{" "}
                        points
                      </p>
                    </div>
                  </div>

                  {/* Sprint Progress */}

                  {selectedSprintForDetails.startDate &&
                    selectedSprintForDetails.endDate && (
                      <div>
                        <h4 className="font-medium mb-2">Sprint Progress</h4>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Days remaining</span>

                            <span
                              className={
                                Math.ceil(
                                  (new Date(
                                    selectedSprintForDetails.endDate,
                                  ).getTime() -
                                    new Date().getTime()) /
                                  (1000 * 60 * 60 * 24),
                                ) < 0
                                  ? "text-red-600 font-semibold"
                                  : "text-green-600 font-semibold"
                              }
                            >
                              {Math.ceil(
                                (new Date(
                                  selectedSprintForDetails.endDate,
                                ).getTime() -
                                  new Date().getTime()) /
                                (1000 * 60 * 60 * 24),
                              )}{" "}
                              days
                            </span>
                          </div>

                          <Progress
                            value={Math.max(
                              0,
                              Math.min(
                                100,

                                ((new Date().getTime() -
                                  new Date(
                                    selectedSprintForDetails.startDate,
                                  ).getTime()) /
                                  (new Date(
                                    selectedSprintForDetails.endDate,
                                  ).getTime() -
                                    new Date(
                                      selectedSprintForDetails.startDate,
                                    ).getTime())) *
                                100,
                              ),
                            )}
                            className="h-2"
                          />
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSprintDetailsOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Details Dialog */}

        <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>

              <DialogDescription>
                View detailed information about the task
              </DialogDescription>
            </DialogHeader>

            {selectedTaskForDetails && (
              <div className="space-y-6">
                {/* Task Header */}

                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      {selectedTaskForDetails.title}
                    </h3>

                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={getPriorityColor(
                          selectedTaskForDetails.priority,
                        )}
                      >
                        {selectedTaskForDetails.priority}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={getStatusColor(
                          selectedTaskForDetails.status,
                        )}
                      >
                        {selectedTaskForDetails.status.replace("_", " ")}
                      </Badge>

                      <Badge variant="secondary">
                        {selectedTaskForDetails.estimatedHours || 0}h estimated
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Task Content */}

                <div className="space-y-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Description</h4>
                      {canManageSprintsAndStories && !isEditingTaskDescription && (
                        <Button variant="ghost" size="sm" onClick={() => {
                          setTempDescription(selectedTaskForDetails.description || "");
                          setIsEditingTaskDescription(true);
                        }} className="h-6 px-2">
                          <Edit3 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      )}
                    </div>

                    {isEditingTaskDescription ? (
                      <div className="space-y-2">
                        <Textarea
                          value={tempDescription}
                          onChange={(e) => setTempDescription(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setIsEditingTaskDescription(false)}>Cancel</Button>
                          <Button size="sm" onClick={handleSaveTaskDescription}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                        {selectedTaskForDetails.description || "No description provided."}
                      </p>
                    )}
                  </div>

                  {/* Task Metadata Grid */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Story</h4>

                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {sprintStories.find(
                          (s) => s.id === selectedTaskForDetails.storyId,
                        )?.title || "N/A"}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Assigned To</h4>

                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedTaskForDetails.assigneeId
                          ? getUserName(selectedTaskForDetails.assigneeId)
                          : "Unassigned"}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Reporter</h4>

                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedTaskForDetails.reporterId
                          ? getUserName(selectedTaskForDetails.reporterId)
                          : "No Reporter"}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Due Date</h4>

                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedTaskForDetails.dueDate
                          ? new Date(
                            selectedTaskForDetails.dueDate,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",

                            month: "long",

                            day: "numeric",
                          })
                          : "No due date"}
                      </p>
                    </div>
                  </div>

                  {/* Time Tracking */}

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Estimated Hours</h4>

                      <p className="text-lg font-semibold text-blue-600">
                        {selectedTaskForDetails.estimatedHours || 0}h
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Actual Hours</h4>

                      <p className="text-lg font-semibold text-green-600">
                        {selectedTaskForDetails.actualHours || 0}h
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Remaining</h4>

                      <p
                        className={`text-lg font-semibold ${(selectedTaskForDetails.estimatedHours || 0) -
                          (selectedTaskForDetails.actualHours || 0) <
                          0
                          ? "text-red-600"
                          : "text-orange-600"
                          }`}
                      >
                        {(selectedTaskForDetails.estimatedHours || 0) -
                          (selectedTaskForDetails.actualHours || 0)}
                        h
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}

                  {selectedTaskForDetails.estimatedHours &&
                    selectedTaskForDetails.estimatedHours > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Progress</h4>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Time spent</span>

                            <span
                              className={
                                ((selectedTaskForDetails.actualHours || 0) /
                                  selectedTaskForDetails.estimatedHours) *
                                  100 >
                                  100
                                  ? "text-red-600 font-semibold"
                                  : "text-green-600 font-semibold"
                              }
                            >
                              {Math.round(
                                ((selectedTaskForDetails.actualHours || 0) /
                                  selectedTaskForDetails.estimatedHours) *
                                100,
                              )}
                              %
                            </span>
                          </div>

                          <Progress
                            value={Math.min(
                              100,
                              ((selectedTaskForDetails.actualHours || 0) /
                                selectedTaskForDetails.estimatedHours) *
                              100,
                            )}
                            className="h-2"
                          />
                        </div>
                      </div>
                    )}

                  {/* Labels */}

                  {selectedTaskForDetails.labels &&
                    selectedTaskForDetails.labels.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Labels</h4>

                        <div className="flex flex-wrap gap-2">
                          {selectedTaskForDetails.labels.map((label, index) => (
                            <Badge key={index} variant="secondary">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTaskDetailsOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Subtask Dialog */}

        <Dialog
          open={isAddSubtaskDialogOpen}
          onOpenChange={handleSubtaskDialogClose}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Subtask</DialogTitle>

              <DialogDescription>
                Create a new subtask for:{" "}
                {selectedTaskForSubtask?.title ||
                  selectedIssueForSubtask?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="subtask-title">Subtask Title</Label>

                <Input
                  id="subtask-title"
                  value={newSubtask.title}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., Implement validation logic"
                />
              </div>

              <div>
                <Label htmlFor="subtask-description">Description</Label>

                <Textarea
                  id="subtask-description"
                  value={newSubtask.description}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Detailed description of the subtask..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="subtask-hours">Estimated Hours</Label>

                <Input
                  id="subtask-hours"
                  type="number"
                  value={newSubtask.estimatedHours}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      estimatedHours: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="2"
                />
              </div>

              <div>
                <Label htmlFor="subtask-assignee">Assigned To</Label>

                <Select
                  value={newSubtask.assigneeId}
                  onValueChange={(value) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      assigneeId: value === "UNASSIGNED" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>

                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>

                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subtask-category">Category</Label>

                <Select
                  value={newSubtask.category}
                  onValueChange={(value) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      category: value === "NONE" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>

                    <SelectItem value="Major">Major</SelectItem>

                    <SelectItem value="Other">Other</SelectItem>

                    <SelectItem value="Development">Development</SelectItem>

                    <SelectItem value="Documentation">Documentation</SelectItem>

                    <SelectItem value="Idle">Idle</SelectItem>

                    <SelectItem value="Learning">Learning</SelectItem>

                    <SelectItem value="Meeting">Meeting</SelectItem>

                    <SelectItem value="Support">Support</SelectItem>

                    <SelectItem value="Testing">Testing</SelectItem>

                    <SelectItem value="Training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subtask-due-date">Due Date</Label>

                <Input
                  id="subtask-due-date"
                  type="date"
                  value={newSubtask.dueDate}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddSubtaskDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={handleAddSubtask}
                disabled={isCreatingSubtask || !newSubtask.title.trim()}
              >
                {isCreatingSubtask ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Subtask"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Subtask Dialog */}
        <Dialog
          open={isEditSubtaskDialogOpen}
          onOpenChange={(open) => {
            setIsEditSubtaskDialogOpen(open);
            if (!open) {
              setSelectedSubtaskForEdit(null);
              setNewSubtask({
                title: "",
                description: "",
                taskId: "",
                assigneeId: "",
                estimatedHours: 0,
                category: "",
                dueDate: "",
              });
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Subtask</DialogTitle>
              <DialogDescription>
                Update subtask: {selectedSubtaskForEdit?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-subtask-title">Subtask Title</Label>
                <Input
                  id="edit-subtask-title"
                  value={newSubtask.title}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., Implement validation logic"
                />
              </div>

              <div>
                <Label htmlFor="edit-subtask-description">Description</Label>
                <Textarea
                  id="edit-subtask-description"
                  value={newSubtask.description}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Detailed description of the subtask..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-subtask-hours">Estimated Hours</Label>
                <Input
                  id="edit-subtask-hours"
                  type="number"
                  value={newSubtask.estimatedHours}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      estimatedHours: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="2"
                />
              </div>

              <div>
                <Label htmlFor="edit-subtask-assignee">Assigned To</Label>
                <Select
                  value={newSubtask.assigneeId}
                  onValueChange={(value) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      assigneeId: value === "UNASSIGNED" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-subtask-category">Category</Label>
                <Select
                  value={newSubtask.category}
                  onValueChange={(value) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      category: value === "NONE" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="Major">Major</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Idle">Idle</SelectItem>
                    <SelectItem value="Learning">Learning</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-subtask-due-date">Due Date</Label>
                <Input
                  id="edit-subtask-due-date"
                  type="date"
                  value={newSubtask.dueDate}
                  onChange={(e) =>
                    setNewSubtask((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditSubtaskDialogOpen(false);
                  setSelectedSubtaskForEdit(null);
                  setNewSubtask({
                    title: "",
                    description: "",
                    taskId: "",
                    assigneeId: "",
                    estimatedHours: 0,
                    category: "",
                    dueDate: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubtask}
                disabled={isCreatingSubtask || !newSubtask.title.trim()}
              >
                {isCreatingSubtask ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Subtask"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Time Entry Dialog */}
        <Dialog
          open={isEditLogDialogOpen}
          onOpenChange={(open) => {
            setIsEditLogDialogOpen(open);
            if (!open) {
              setSelectedLogForEdit(null);
              setEditLogData({
                hoursWorked: 0,
                description: "",
                workDate: new Date().toISOString().split("T")[0],
                startTime: "",
                endTime: "",
              });
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
              <DialogDescription>
                Update time log entry
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-log-hours">Hours Worked</Label>
                <Input
                  id="edit-log-hours"
                  type="number"
                  step="0.25"
                  min="0"
                  value={editLogData.hoursWorked}
                  onChange={(e) =>
                    setEditLogData((prev) => ({
                      ...prev,
                      hoursWorked: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="2.5"
                />
              </div>

              <div>
                <Label htmlFor="edit-log-description">Description</Label>
                <Textarea
                  id="edit-log-description"
                  value={editLogData.description}
                  onChange={(e) =>
                    setEditLogData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What did you work on?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-log-date">Work Date <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-log-date"
                  type="date"
                  value={editLogData.workDate}
                  onChange={(e) =>
                    setEditLogData((prev) => ({
                      ...prev,
                      workDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-log-start-time">
                    Start Time (Optional)
                  </Label>
                  <Input
                    id="edit-log-start-time"
                    type="time"
                    value={editLogData.startTime}
                    onChange={(e) =>
                      setEditLogData((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="edit-log-end-time">End Time (Optional)</Label>
                  <Input
                    id="edit-log-end-time"
                    type="time"
                    value={editLogData.endTime}
                    onChange={(e) =>
                      setEditLogData((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditLogDialogOpen(false);
                  setSelectedLogForEdit(null);
                  setEditLogData({
                    hoursWorked: 0,
                    description: "",
                    workDate: new Date().toISOString().split("T")[0],
                    startTime: "",
                    endTime: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditTimeEntry}
                disabled={!editLogData.hoursWorked || editLogData.hoursWorked <= 0}
              >
                Update Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Subtask Log Effort Dialog */}
        <Dialog
          open={isSubtaskLogEffortOpen}
          onOpenChange={(open) => {
            setIsSubtaskLogEffortOpen(open);
            if (!open) {
              setSelectedSubtaskForLog(null);
              setSubtaskLogEffort({
                hours: 0,
                description: "",
                workDate: new Date().toISOString().split("T")[0],
                startTime: "",
                endTime: "",
              });
              setSubtaskLogAttachments([]);
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-700">Log Subtask Work</DialogTitle>
              <DialogDescription>
                Log time spent on subtask: {selectedSubtaskForLog?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="subtask-log-hours">Hours Worked *</Label>
                <Input
                  id="subtask-log-hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={subtaskLogEffort.hours}
                  onChange={(e) =>
                    setSubtaskLogEffort((prev) => ({
                      ...prev,
                      hours: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="2.5"
                />
              </div>

              <div>
                <Label htmlFor="subtask-log-description">Work Description *</Label>
                <Textarea
                  id="subtask-log-description"
                  value={subtaskLogEffort.description}
                  onChange={(e) =>
                    setSubtaskLogEffort((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What did you work on?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subtask-log-startTime">Start Time (Optional)</Label>
                  <Input
                    id="subtask-log-startTime"
                    type="time"
                    value={subtaskLogEffort.startTime}
                    onChange={(e) =>
                      setSubtaskLogEffort((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="subtask-log-endTime">End Time (Optional)</Label>
                  <Input
                    id="subtask-log-endTime"
                    type="time"
                    value={subtaskLogEffort.endTime}
                    onChange={(e) =>
                      setSubtaskLogEffort((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subtask-log-date">Work Date *</Label>
                <Input
                  id="subtask-log-date"
                  type="date"
                  value={subtaskLogEffort.workDate}
                  onChange={(e) =>
                    setSubtaskLogEffort((prev) => ({
                      ...prev,
                      workDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Attachments Section */}
              <div className="border rounded-lg p-3 bg-red-50/30">
                <Label className="flex items-center gap-2 mb-2 text-red-700">
                  <Paperclip className="w-4 h-4" />
                  Attachments (Optional)
                </Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setSubtaskLogAttachments((prev) => [...prev, ...files]);
                      e.target.value = '';
                    }}
                    className="cursor-pointer bg-white"
                  />
                  {subtaskLogAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {subtaskLogAttachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-1 bg-white border rounded px-2 py-1 text-xs">
                          <Paperclip className="w-3 h-3 text-gray-500" />
                          <span className="max-w-[120px] truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setSubtaskLogAttachments(prev => prev.filter((_, i) => i !== index))}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Subtask Time Stats */}
              {selectedSubtaskForLog && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-red-600 uppercase font-bold mb-1">Estimated</p>
                    <p className="text-lg font-bold text-red-700">{(selectedSubtaskForLog.estimatedHours || 0)}h</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-green-600 uppercase font-bold mb-1">Logged</p>
                    <p className="text-lg font-bold text-green-700">{(selectedSubtaskForLog.actualHours || 0)}h</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-orange-600 uppercase font-bold mb-1">After Log</p>
                    <p className="text-lg font-bold text-orange-700">{((selectedSubtaskForLog.actualHours || 0) + subtaskLogEffort.hours).toFixed(1)}h</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubtaskLogEffortOpen(false);
                  setSelectedSubtaskForLog(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogSubtaskEffort}
                disabled={isLoggingSubtaskEffort || !subtaskLogEffort.hours || subtaskLogEffort.hours <= 0}
              >
                {isLoggingSubtaskEffort && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Log {subtaskLogEffort.hours > 0 ? `${subtaskLogEffort.hours}h` : 'Work'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Log Effort Dialog (JIRA-style: on subtasks, tasks, and issues) */}

        <Dialog
          open={isLogEffortDialogOpen}
          onOpenChange={setIsLogEffortDialogOpen}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Work</DialogTitle>

              <DialogDescription>
                {selectedSubtaskForEffort && `Log time spent on subtask: ${selectedSubtaskForEffort.title}`}
                {selectedTaskForEffort && `Log time spent on task: ${selectedTaskForEffort.title}`}
                {selectedIssueForEffort && `Log time spent on issue: ${selectedIssueForEffort.title}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Hours */}

              <div>
                <Label htmlFor="effort-hours">Hours Worked *</Label>

                <Input
                  id="effort-hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={effortLog.hours}
                  onChange={(e) =>
                    setEffortLog((prev) => ({
                      ...prev,
                      hours: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="e.g., 2.5"
                />
              </div>

              {/* Description */}

              <div>
                <Label htmlFor="effort-description">Work Description *</Label>

                <Textarea
                  id="effort-description"
                  value={effortLog.description}
                  onChange={(e) =>
                    setEffortLog((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What did you work on?"
                  rows={3}
                />
              </div>

              {/* Work Date */}

              <div>
                <Label htmlFor="effort-date">Work Date <span className="text-red-500">*</span></Label>

                <Input
                  id="effort-date"
                  type="date"
                  required
                  min={
                    (Array.isArray(sprintsData)
                      ? sprintsData
                      : (sprintsData as any)?.data || []
                    )
                      .find((s: any) => s.id === selectedSprint)
                      ?.startDate?.split("T")[0]
                  }
                  max={
                    (Array.isArray(sprintsData)
                      ? sprintsData
                      : (sprintsData as any)?.data || []
                    )
                      .find((s: any) => s.id === selectedSprint)
                      ?.endDate?.split("T")[0]
                  }
                  value={effortLog.workDate}
                  onChange={(e) =>
                    setEffortLog((prev) => ({
                      ...prev,
                      workDate: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Optional: Start and End Time */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="effort-start-time">
                    Start Time (Optional)
                  </Label>

                  <Input
                    id="effort-start-time"
                    type="time"
                    value={effortLog.startTime}
                    onChange={(e) =>
                      setEffortLog((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="effort-end-time">End Time (Optional)</Label>

                  <Input
                    id="effort-end-time"
                    type="time"
                    value={effortLog.endTime}
                    onChange={(e) =>
                      setEffortLog((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Attachment Upload Section */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <Label className="flex items-center gap-2 mb-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments (Optional)
                </Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setEffortLogAttachments((prev) => [...prev, ...files]);
                      e.target.value = ''; // Reset input for re-selection
                    }}
                    className="cursor-pointer"
                  />
                  {effortLogAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {effortLogAttachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-white border rounded px-2 py-1 text-xs"
                        >
                          <Paperclip className="w-3 h-3 text-gray-500" />
                          <span className="max-w-[120px] truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEffortLogAttachments((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Current Time Stats */}
              {selectedSubtaskForEffort && (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-sm mb-2 text-purple-900">
                    Subtask Time Stats
                  </h4>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-gray-600">Estimated</div>

                      <div className="font-semibold text-blue-700">
                        {selectedSubtaskForEffort.estimatedHours || 0}h
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-600">Logged</div>

                      <div className="font-semibold text-green-700">
                        {selectedSubtaskForEffort.actualHours || 0}h
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-600">After Log</div>

                      <div className="font-semibold text-orange-700">
                        {(
                          (selectedSubtaskForEffort.actualHours || 0) +
                          effortLog.hours
                        ).toFixed(1)}
                        h
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-purple-200 text-xs text-purple-700">
                    <span className="font-medium">Note:</span> Parent task time
                    will be updated automatically
                  </div>
                </div>
              )}

              {selectedTaskForEffort && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-sm mb-2 text-blue-900">
                    Task Time Stats
                  </h4>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-gray-600">Estimated</div>

                      <div className="font-semibold text-blue-700">
                        {selectedTaskForEffort.estimatedHours || 0}h
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-600">Logged</div>

                      <div className="font-semibold text-green-700">
                        {selectedTaskForEffort.actualHours || 0}h
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-600">After Log</div>

                      <div className="font-semibold text-orange-700">
                        {(
                          (selectedTaskForEffort.actualHours || 0) +
                          effortLog.hours
                        ).toFixed(1)}
                        h
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedIssueForEffort && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <h4 className="font-medium text-sm mb-2 text-red-900">
                    Issue Time Stats
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-600">Logged</div>

                      <div className="font-semibold text-green-700">
                        {effortLog.hours}h
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-600">After Log</div>

                      <div className="font-semibold text-orange-700">
                        {effortLog.hours.toFixed(1)}h
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLogEffortDialogOpen(false);

                  setSelectedSubtaskForEffort(null);
                  setSelectedTaskForEffort(null);
                  setSelectedIssueForEffort(null);
                  setEffortLogAttachments([]);

                  setEffortLog({
                    hours: 0,

                    description: "",

                    workDate: "",

                    startTime: "",

                    endTime: "",
                  });
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={() => {
                  if (selectedSubtaskForEffort) {
                    handleLogEffort();
                  } else if (selectedTaskForEffort) {
                    handleLogTaskEffort();
                  } else if (selectedIssueForEffort) {
                    handleLogIssueEffort();
                  }
                }}
                disabled={
                  !effortLog.hours ||
                  effortLog.hours <= 0 ||
                  !effortLog.workDate ||
                  !effortLog.description.trim() ||
                  isLoggingEffort
                }
              >
                {isLoggingEffort ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4 mr-2" />
                )}
                Log {effortLog.hours}h
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* JIRA-Style Task Details Modal */}

        <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
            <DialogTitle className="sr-only">
              Task Details: {selectedTaskForDetails?.title || "Task"}
            </DialogTitle>

            {selectedTaskForDetails && (
              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Main Content Area (Left Panel) */}

                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  {/* Header */}

                  <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 font-semibold"
                        >
                          T){selectedTaskForDetails.id.toUpperCase()}
                        </Badge>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3"
                        >
                          {selectedTaskForDetails.status.replace("_", " ")}

                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 hover:bg-blue-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTaskForEffort(selectedTaskForDetails);
                          setEffortLog({
                            hours: 0,
                            description: "",
                            workDate: "",
                            startTime: "",
                            endTime: "",
                          });
                          setIsLogEffortDialogOpen(true);
                        }}
                        title={canLogEffortOnTasks ? "Log work on this task" : "QA roles cannot log on tasks"}
                        disabled={!canLogEffortOnTasks}
                      >
                        <Clock className="w-4 h-4 mr-1 text-blue-600" />
                        Add Log
                      </Button>
                    </div>
                  </div>

                  {/* Task Title */}

                  <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedTaskForDetails.title}
                    </h2>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Flag className="w-4 h-4" />

                        <span>{selectedTaskForDetails.priority}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />

                        <span>
                          {selectedTaskForDetails.estimatedHours}h estimated
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />

                        <span>
                          {selectedTaskForDetails.assigneeId
                            ? getUserName(selectedTaskForDetails.assigneeId)
                            : "Unassigned"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Tabs */}

                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <Tabs
                      value={taskDetailsTab}
                      onValueChange={(value) => setTaskDetailsTab(value as any)}
                      className="h-full flex flex-col min-h-0"
                    >
                      <TabsList className="mx-6 mt-4 flex-shrink-0">
                        <TabsTrigger value="details">Details</TabsTrigger>

                        <TabsTrigger value="activities">Activities</TabsTrigger>

                        <TabsTrigger value="subtasks">Subtasks</TabsTrigger>

                        <TabsTrigger value="due-dates">Due Dates</TabsTrigger>

                        <TabsTrigger value="linked-issues">
                          Linked Issues
                        </TabsTrigger>

                        <TabsTrigger value="chats" className="relative">
                          Chats
                          {unreadMentions.some((n: any) => {
                            const relId = String(n.relatedEntityId || '').toUpperCase();
                            const relType = (n.relatedEntityType || '').toUpperCase();
                            return (relId === String(selectedTaskForDetails.id).toUpperCase() || relId === String(selectedTaskForDetails.taskNumber).toUpperCase()) &&
                              relType === 'TASK';
                          }) && (
                              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                            )}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent
                        value="details"
                        className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                        style={{ maxHeight: 'calc(90vh - 200px)' }}
                      >
                        {/* Task Logs Section */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">
                            Time Logs
                          </h3>
                          {loadingTaskLogs ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                              <span className="ml-2 text-sm text-gray-600">
                                Loading logs...
                              </span>
                            </div>
                          ) : taskLogs.length > 0 ? (
                            <div className="space-y-2">
                              {taskLogs.map((log) => (
                                <div
                                  key={log.id}
                                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors group"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                          {log.hoursWorked}h logged
                                        </span>
                                        {log.workDate && (
                                          <span className="text-xs text-gray-500">
                                            on {new Date(log.workDate).toLocaleDateString("en-GB", {
                                              day: "numeric",
                                              month: "short",
                                              year: "numeric",
                                            })}
                                          </span>
                                        )}
                                      </div>
                                      {log.description && (
                                        <p className="text-sm text-gray-700 mt-1">
                                          {log.description}
                                        </p>
                                      )}
                                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                        {log.userId && (
                                          <div className="flex items-center space-x-1">
                                            <User className="w-3 h-3" />
                                            <span>{getUserName(log.userId)}</span>
                                          </div>
                                        )}
                                        {log.startTime && log.endTime && (
                                          <div className="flex items-center space-x-1">
                                            <Timer className="w-3 h-3" />
                                            <span>
                                              {log.startTime} - {log.endTime}
                                            </span>
                                          </div>
                                        )}
                                        {log.entryType && (
                                          <Badge variant="outline" className="text-xs">
                                            {log.entryType}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {/* Edit Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-xs hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                      onClick={() => {
                                        setSelectedLogForEdit(log);
                                        // Format workDate properly (handle both date string and Date object)
                                        let workDateStr = "";
                                        if (log.workDate) {
                                          if (typeof log.workDate === 'string') {
                                            workDateStr = log.workDate.split('T')[0];
                                          } else {
                                            workDateStr = new Date(log.workDate).toISOString().split("T")[0];
                                          }
                                        } else {
                                          workDateStr = new Date().toISOString().split("T")[0];
                                        }

                                        setEditLogData({
                                          hoursWorked: log.hoursWorked || 0,
                                          description: log.description || "",
                                          workDate: workDateStr,
                                          startTime: log.startTime || "",
                                          endTime: log.endTime || "",
                                        });
                                        setIsEditLogDialogOpen(true);
                                      }}
                                      title="Edit log entry"
                                    >
                                      <Edit3 className="w-3 h-3 mr-1 text-blue-600" />
                                      Edit
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">No time logs recorded yet</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Log time spent on this task to track your work
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Effort Logs from My Tasks Page */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">
                            Effort Logs (from My Tasks)
                          </h3>
                          <TaskEffortLogs taskId={selectedTaskForDetails.id} />
                        </div>

                        {/* Description */}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              Description
                            </h3>
                            {canManageSprintsAndStories && !isEditingTaskDescription && (
                              <Button variant="ghost" size="sm" onClick={() => {
                                setTempDescription(selectedTaskForDetails.description || "");
                                setIsEditingTaskDescription(true);
                              }} className="h-6 px-2">
                                <Edit3 className="w-3 h-3 mr-1" /> Edit
                              </Button>
                            )}
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            {isEditingTaskDescription ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={tempDescription}
                                  onChange={(e) => setTempDescription(e.target.value)}
                                  className="min-h-[100px] bg-white"
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => setIsEditingTaskDescription(false)}>Cancel</Button>
                                  <Button size="sm" onClick={handleSaveTaskDescription}>Save</Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {selectedTaskForDetails.description || "No description provided."}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Acceptance Criteria */}



                        {/* Labels */}

                        {selectedTaskForDetails.labels &&
                          selectedTaskForDetails.labels.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                Labels
                              </h3>

                              <div className="flex flex-wrap gap-2">
                                {selectedTaskForDetails.labels.map(
                                  (label, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {label}
                                    </Badge>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                        {/* Attachments from Parent Story */}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              Attachments
                            </h3>

                            {parentStoryAttachments.length > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                              >
                                <BookOpen className="w-3 h-3 mr-1" />
                                From Story
                              </Badge>
                            )}
                          </div>

                          {loadingParentStoryAttachments ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />

                              <span className="ml-2 text-sm text-gray-600">
                                Loading attachments...
                              </span>
                            </div>
                          ) : parentStoryAttachments.length > 0 ? (
                            <div className="space-y-2">
                              {parentStoryAttachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-blue-50/30"
                                >
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                      <Paperclip className="w-4 h-4 text-blue-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {attachment.fileName}
                                        </p>

                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-blue-100 text-blue-700 border-blue-300 flex-shrink-0"
                                        >
                                          Inherited
                                        </Badge>
                                      </div>

                                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        {attachment.fileSize && (
                                          <>
                                            <span>
                                              {(
                                                attachment.fileSize / 1024
                                              ).toFixed(2)}{" "}
                                              KB
                                            </span>

                                            <span>•</span>
                                          </>
                                        )}

                                        {attachment.uploadedBy && (
                                          <>
                                            <span>
                                              by{" "}
                                              {getUserName(
                                                attachment.uploadedBy,
                                              )}
                                            </span>

                                            <span>•</span>
                                          </>
                                        )}

                                        <span>
                                          {new Date(
                                            attachment.createdAt,
                                          ).toLocaleDateString("en-GB", {
                                            day: "numeric",

                                            month: "short",

                                            year: "numeric",
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 flex-shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingAttachment(attachment);
                                        setIsAttachmentViewerOpen(true);
                                      }}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-3 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();

                                        if (attachment.fileUrl) {
                                          const link =
                                            document.createElement("a");

                                          link.href = attachment.fileUrl;

                                          link.download = attachment.fileName;

                                          document.body.appendChild(link);

                                          link.click();

                                          document.body.removeChild(link);

                                          toast.success("File downloaded");
                                        } else {
                                          toast.error("File URL not available");
                                        }
                                      }}
                                    >
                                      <Download className="w-3 h-3 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                              <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />

                              <p className="text-sm">
                                No attachments from parent story
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                Attachments added to the story will appear here
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent
                        value="activities"
                        className="flex-1 overflow-auto p-6"
                      >
                        <TaskActivityLog taskId={selectedTaskForDetails.id} />
                      </TabsContent>

                      <TabsContent
                        value="subtasks"
                        className="flex-1 overflow-hidden flex flex-col"
                      >
                        {/* Header with Add Subtask Button */}

                        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-sm font-semibold text-gray-900">
                              Subtasks
                            </h3>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 text-xs"
                              onClick={() => {
                                setSelectedTaskForSubtask(
                                  selectedTaskForDetails,
                                );

                                setNewSubtask((prev) => ({
                                  ...prev,
                                  taskId: selectedTaskForDetails.id,
                                  assigneeId:
                                    selectedTaskForDetails.assigneeId || "",
                                }));

                                setIsAddSubtaskDialogOpen(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Subtask
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Progress
                              value={
                                getSubtasksForTask(selectedTaskForDetails.id)
                                  .length > 0
                                  ? (getSubtasksForTask(
                                    selectedTaskForDetails.id,
                                  ).filter((st) => st.isCompleted).length /
                                    getSubtasksForTask(
                                      selectedTaskForDetails.id,
                                    ).length) *
                                  100
                                  : 0
                              }
                              className="w-20 h-2"
                            />

                            <span className="text-xs text-gray-600">
                              {
                                getSubtasksForTask(
                                  selectedTaskForDetails.id,
                                ).filter((st) => st.isCompleted).length
                              }
                              /
                              {
                                getSubtasksForTask(selectedTaskForDetails.id)
                                  .length
                              }{" "}
                              Done
                            </span>
                          </div>
                        </div>

                        {/* Scrollable Subtasks List */}

                        <div
                          className="flex-1 overflow-y-auto p-6 pt-4 space-y-2"
                          style={{ maxHeight: "400px" }}
                        >
                          {getSubtasksForTask(selectedTaskForDetails.id).map(
                            (subtask) => (
                              <div
                                key={subtask.id}
                                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-200 group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    {/* Checkbox */}

                                    <CheckSquare
                                      className={`w-4 h-4 cursor-pointer hover:scale-110 transition-transform flex-shrink-0 ${subtask.isCompleted
                                        ? "text-green-500"
                                        : "text-gray-400 hover:text-green-400"
                                        }`}
                                      onClick={async (e) => {
                                        e.stopPropagation();

                                        try {
                                          await subtaskApiService.updateSubtaskCompletion(
                                            subtask.id,
                                            !subtask.isCompleted,
                                          );

                                          toast.success(
                                            `Subtask ${!subtask.isCompleted ? "completed" : "reopened"}`,
                                          );

                                          // Update local subtasks state immediately

                                          setAllSubtasks((prev) =>
                                            prev.map((st) =>
                                              st.id === subtask.id
                                                ? {
                                                  ...st,
                                                  isCompleted:
                                                    !st.isCompleted,
                                                }
                                                : st,
                                            ),
                                          );

                                          // Also refresh all tasks to ensure everything stays in sync

                                          if (sprintStories.length > 0) {
                                            fetchAllTasks(sprintStories, true);
                                          }
                                        } catch (error) {
                                          console.error(
                                            "Failed to update subtask:",
                                            error,
                                          );

                                          toast.error(
                                            "Failed to update subtask",
                                          );
                                        }
                                      }}
                                    />

                                    {/* Subtask Content */}

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4
                                          className={`text-sm font-medium truncate ${subtask.isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}
                                        >
                                          {subtask.title}
                                        </h4>

                                        {subtask.category && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                          >
                                            {subtask.category}
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Compact Meta Info */}

                                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                                        <div className="flex items-center space-x-1">
                                          <User className="w-3 h-3" />

                                          <span className="truncate max-w-20">
                                            {subtask.assigneeId
                                              ? getUserName(
                                                subtask.assigneeId,
                                              ).split(" ")[0]
                                              : "Unassigned"}
                                          </span>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                          <Clock className="w-3 h-3" />

                                          <span className="font-medium">
                                            {subtask.estimatedHours || 0}h
                                            {(subtask.actualHours || 0) > 0 && (
                                              <span className="text-blue-600 ml-1">
                                                /
                                                {(
                                                  subtask.actualHours || 0
                                                ).toFixed(1)}
                                                h
                                              </span>
                                            )}
                                          </span>
                                        </div>

                                        {subtask.dueDate && (
                                          <div className="flex items-center space-x-1">
                                            <CalendarIcon className="w-3 h-3" />

                                            <span>
                                              {new Date(
                                                subtask.dueDate,
                                              ).toLocaleDateString("en-GB")}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}

                                  <div className="flex items-center space-x-2 flex-shrink-0">
                                    {/* Edit Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-xs hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        setSelectedSubtaskForEdit(subtask);
                                        setNewSubtask({
                                          title: subtask.title || "",
                                          description: subtask.description || "",
                                          taskId: subtask.taskId || "",
                                          assigneeId: subtask.assigneeId || "",
                                          estimatedHours: subtask.estimatedHours || 0,
                                          category: subtask.category || "",
                                          dueDate: subtask.dueDate ? subtask.dueDate.split('T')[0] : "",
                                        });
                                        setIsEditSubtaskDialogOpen(true);
                                      }}
                                      title="Edit subtask"
                                    >
                                      <Edit3 className="w-3 h-3 mr-1 text-blue-600" />
                                      Edit
                                    </Button>

                                    {/* Log Work Button */}

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity ${isSprintEnded ? 'cursor-not-allowed opacity-50' : 'hover:bg-green-100'}`}
                                      disabled={isSprintEnded}
                                      title={isSprintEnded ? 'Cannot log time - sprint has ended' : 'Log work on this subtask'}
                                      onClick={() => {
                                        if (isSprintEnded) return;
                                        setSelectedSubtaskForLog(subtask);
                                        setSubtaskLogEffort({
                                          hours: 0,
                                          description: "",
                                          workDate: new Date().toISOString().split("T")[0],
                                          startTime: "",
                                          endTime: "",
                                        });
                                        setIsSubtaskLogEffortOpen(true);
                                      }}
                                    >
                                      <Clock className="w-3 h-3 mr-1 text-green-600" />
                                      Add Log
                                    </Button>
                                  </div>
                                </div>

                                {/* Progress Bar for Time Tracking */}

                                {(subtask.estimatedHours || 0) > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-gray-500">
                                        Time Progress
                                      </span>

                                      <span className="text-xs font-medium text-gray-700">
                                        {Math.min(
                                          100,
                                          ((subtask.actualHours || 0) /
                                            (subtask.estimatedHours || 1)) *
                                          100,
                                        ).toFixed(0)}
                                        %
                                      </span>
                                    </div>

                                    <Progress
                                      value={Math.min(
                                        100,
                                        ((subtask.actualHours || 0) /
                                          (subtask.estimatedHours || 1)) *
                                        100,
                                      )}
                                      className="h-1.5"
                                    />
                                  </div>
                                )}
                              </div>
                            ),
                          )}

                          {getSubtasksForTask(selectedTaskForDetails.id)
                            .length === 0 && (
                              <div className="text-center py-8 text-gray-500">
                                <Layers3 className="w-8 h-8 mx-auto mb-2 text-gray-400" />

                                <p className="text-sm">No subtasks yet</p>

                                <p className="text-xs text-gray-400 mt-1">
                                  Use the "Add Subtask" button above to create one
                                </p>
                              </div>
                            )}
                        </div>
                      </TabsContent>

                      <TabsContent
                        value="due-dates"
                        className="flex-1 overflow-auto p-6 space-y-6"
                      >
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Due Dates
                          </h3>

                          <div className="space-y-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <CalendarIcon className="w-4 h-4 text-gray-600" />

                                <span className="text-sm font-medium text-gray-900">
                                  Task Due Date
                                </span>
                              </div>

                              <div className="text-sm text-gray-700">
                                {selectedTaskForDetails.dueDate
                                  ? new Date(
                                    selectedTaskForDetails.dueDate,
                                  ).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                  : "No due date set"}
                              </div>
                            </div>

                            {getSubtasksForTask(
                              selectedTaskForDetails.id,
                            ).filter((st) => st.dueDate).length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-700 mb-2">
                                    Subtask Due Dates
                                  </h4>

                                  <div className="space-y-2">
                                    {getSubtasksForTask(selectedTaskForDetails.id)
                                      .filter((st) => st.dueDate)
                                      .map((subtask) => (
                                        <div
                                          key={subtask.id}
                                          className="bg-white border border-gray-200 rounded-lg p-3"
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-900">
                                              {subtask.title}
                                            </span>

                                            <span className="text-xs text-gray-600">
                                              {subtask.dueDate
                                                ? new Date(
                                                  subtask.dueDate,
                                                ).toLocaleDateString("en-GB", {
                                                  day: "numeric",
                                                  month: "short",
                                                  year: "numeric",
                                                })
                                                : ""}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent
                        value="linked-issues"
                        className="flex-1 overflow-auto p-6 space-y-6"
                      >
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Linked Issues
                          </h3>

                          <div className="text-center py-8 text-gray-500">
                            <Link className="w-8 h-8 mx-auto mb-2 text-gray-400" />

                            <p className="text-sm">No linked issues</p>

                            <p className="text-xs text-gray-400 mt-1">
                              Links to related tasks and stories will appear
                              here
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="chats" className="flex-1 overflow-hidden p-6 min-h-0">
                        <ChatSection entityId={selectedTaskForDetails.id} entityType="task" projectId={selectedProject || undefined} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                {/* Sidebar (Right Panel) */}

                <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-auto">
                  <div className="p-6 space-y-6">
                    {/* Task Details Section (Replacing Effort Details) */}

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Task Details
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {/* Estimation */}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">
                              Estimation
                            </span>

                            <span className="text-xs font-semibold text-blue-600">
                              {selectedTaskForDetails.estimatedHours || 0}h
                            </span>
                          </div>

                          <Progress value={100} className="h-2 bg-blue-100" />
                        </div>

                        {/* Time Spent */}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">
                              Time Spent
                            </span>

                            <span className="text-xs font-semibold text-green-600">
                              {selectedTaskForDetails.actualHours || 0}h
                            </span>
                          </div>

                          <Progress
                            value={
                              selectedTaskForDetails.estimatedHours > 0
                                ? Math.min(
                                  100,
                                  ((selectedTaskForDetails.actualHours || 0) /
                                    selectedTaskForDetails.estimatedHours) *
                                  100,
                                )
                                : 0
                            }
                            className="h-2 bg-green-100"
                          />
                        </div>

                        {/* Remaining */}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">
                              Remaining
                            </span>

                            <span className="text-xs font-semibold text-gray-600">
                              {Math.max(
                                0,
                                (selectedTaskForDetails.estimatedHours || 0) -
                                (selectedTaskForDetails.actualHours || 0),
                              )}
                              h
                            </span>
                          </div>

                          <Progress
                            value={
                              selectedTaskForDetails.estimatedHours > 0
                                ? Math.min(
                                  100,
                                  (Math.max(
                                    0,
                                    (selectedTaskForDetails.estimatedHours ||
                                      0) -
                                    (selectedTaskForDetails.actualHours ||
                                      0),
                                  ) /
                                    selectedTaskForDetails.estimatedHours) *
                                  100,
                                )
                                : 0
                            }
                            className="h-2 bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Details Section */}

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Details
                        </h3>

                        <Settings className="w-4 h-4 text-gray-400" />
                      </div>

                      {/* Manager-Only Dropdowns Section */}
                      {canManageSprintsAndStories && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <h4 className="text-xs font-semibold text-blue-800">Manager Controls</h4>
                          </div>
                          <div className="space-y-3">
                            {/* Assignee Dropdown */}
                            <div>
                              <label className="text-xs font-medium text-gray-900 block mb-1">
                                Assigned To
                              </label>
                              <Select
                                value={selectedTaskForDetails.assigneeId || "unassigned"}
                                onValueChange={async (value) => {
                                  const newAssigneeId = value === "unassigned" ? "" : value;
                                  try {
                                    // 1. Update the task's assignee (Standard behavior - moves card on board)
                                    await taskApiService.updateTaskAssignee(selectedTaskForDetails.id, newAssigneeId || "");

                                    // 2. USER REQUEST: Create a new time entry for the new assignee (0 hours)
                                    // This ensures the task appears in their Time Tracking page without duplication on the board.
                                    if (newAssigneeId) {
                                      try {
                                        await timeEntryApiService.createTimeEntry({
                                          userId: newAssigneeId,
                                          taskId: selectedTaskForDetails.id,
                                          projectId: selectedProject || "",
                                          storyId: selectedTaskForDetails.storyId,
                                          description: "Assigned to task",
                                          entryType: "development",
                                          hoursWorked: 0,
                                          workDate: new Date().toISOString().split('T')[0], // Today's date
                                          isBillable: true
                                        });
                                        console.log("Created 0h time entry for new assignee");
                                      } catch (teError) {
                                        console.error("Failed to create initial time entry:", teError);
                                        // Don't block the UI if this fails, but log it.
                                      }
                                    }

                                    // 3. Update local state
                                    setSelectedTaskForDetails((prev) =>
                                      prev ? { ...prev, assigneeId: newAssigneeId } : prev
                                    );
                                    setAllTasks((prev) =>
                                      prev.map((t) =>
                                        t.id === selectedTaskForDetails.id
                                          ? { ...t, assigneeId: newAssigneeId }
                                          : t
                                      )
                                    );
                                    toast.success("Assigned To updated");
                                  } catch (error) {
                                    console.error("Failed to update assignee:", error);
                                    toast.error("Failed to change Assigned To");
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs bg-white text-black font-medium">
                                  <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-black">
                                  <SelectItem value="unassigned" className="!text-black" style={{ color: 'black' }}>
                                    Unassigned
                                  </SelectItem>
                                  {availableUsersForAssignment.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id} className="!text-black" style={{ color: 'black' }}>
                                      {user.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Estimation Hours Input */}
                            <div>
                              <label className="text-xs font-medium text-gray-900 block mb-1">
                                Estimation Hours
                              </label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  className="h-8 text-sm bg-white text-black w-20"
                                  defaultValue={selectedTaskForDetails.estimatedHours || 0}
                                  onBlur={async (e) => {
                                    const newHours = parseFloat(e.target.value) || 0;
                                    if (newHours !== selectedTaskForDetails.estimatedHours) {
                                      try {
                                        await taskApiService.updateTaskEstimatedHours(selectedTaskForDetails.id, newHours);
                                        setSelectedTaskForDetails((prev) =>
                                          prev ? { ...prev, estimatedHours: newHours } : prev
                                        );
                                        setAllTasks((prev) =>
                                          prev.map((t) =>
                                            t.id === selectedTaskForDetails.id
                                              ? { ...t, estimatedHours: newHours }
                                              : t
                                          )
                                        );
                                        toast.success("Estimation updated");
                                      } catch (error) {
                                        console.error("Failed to update estimation:", error);
                                        toast.error("Failed to update estimation");
                                      }
                                    }
                                  }}
                                />
                                <span className="text-xs text-gray-600">hours</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Assignee */}

                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            Assigned To
                          </label>

                          <div className="flex items-center space-x-2">
                            {selectedTaskForDetails.assigneeId ? (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                                  {getUserName(
                                    selectedTaskForDetails.assigneeId,
                                  )
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-400" />
                              </div>
                            )}

                            <span className="text-sm text-gray-700">
                              {selectedTaskForDetails.assigneeId
                                ? getUserName(selectedTaskForDetails.assigneeId)
                                : "Unassigned"}
                            </span>
                          </div>
                        </div>

                        {/* Priority */}

                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            Priority
                          </label>

                          <Badge
                            variant="outline"
                            className={getPriorityColor(
                              selectedTaskForDetails.priority,
                            )}
                          >
                            {selectedTaskForDetails.priority}
                          </Badge>
                        </div>

                        {/* Due Date */}

                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            Due Date
                          </label>

                          {canManageSprintsAndStories ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={`w-full justify-start text-left font-normal h-8 text-xs ${!selectedTaskForDetails.dueDate ? "text-muted-foreground" : ""
                                    }`}
                                >
                                  <CalendarIcon className="mr-2 h-3 w-3" />
                                  {selectedTaskForDetails.dueDate
                                    ? new Date(selectedTaskForDetails.dueDate).toLocaleDateString()
                                    : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-[50]" align="start">
                                <Calendar
                                  mode="single"
                                  selected={selectedTaskForDetails.dueDate ? new Date(selectedTaskForDetails.dueDate) : undefined}
                                  onSelect={async (date) => {
                                    if (date) {
                                      // Use local date string YYYY-MM-DD instead of toISOString() to avoid timezone offsets
                                      const year = date.getFullYear();
                                      const month = String(date.getMonth() + 1).padStart(2, '0');
                                      const day = String(date.getDate()).padStart(2, '0');
                                      const formattedDate = `${year}-${month}-${day}`;

                                      try {
                                        // Convert status to uppercase for backend enum compatibility
                                        const taskUpdate = {
                                          ...selectedTaskForDetails,
                                          status: selectedTaskForDetails.status?.toUpperCase() as any,
                                          dueDate: formattedDate
                                        };
                                        await taskApiService.updateTask(selectedTaskForDetails.id, taskUpdate);
                                        setSelectedTaskForDetails((prev) =>
                                          prev ? { ...prev, dueDate: formattedDate } : prev
                                        );
                                        setAllTasks((prev) =>
                                          prev.map((t) =>
                                            t.id === selectedTaskForDetails.id
                                              ? { ...t, dueDate: formattedDate }
                                              : t
                                          )
                                        );
                                        toast.success("Due date updated");
                                      } catch (error) {
                                        console.error("Failed to update due date:", error);
                                        toast.error("Failed to update due date");
                                      }
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                              <CalendarIcon className="w-4 h-4 text-gray-400" />
                              <span>
                                {selectedTaskForDetails.dueDate
                                  ? new Date(selectedTaskForDetails.dueDate).toLocaleDateString()
                                  : "No due date"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Labels */}

                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            Labels
                          </label>

                          <div className="flex flex-wrap gap-1">
                            {selectedTaskForDetails.labels &&
                              selectedTaskForDetails.labels.length > 0 ? (
                              selectedTaskForDetails.labels.map(
                                (label, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {label}
                                  </Badge>
                                ),
                              )
                            ) : (
                              <span className="text-sm text-gray-400">
                                Add labels
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Parent Story */}

                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            Parent
                          </label>

                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />

                            <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                              {(() => {
                                const story = sprintStories.find(
                                  (s) => s.id === selectedTaskForDetails.storyId,
                                );
                                // Use parentStoryTitle from API if available, otherwise find in sprintStories
                                return story?.parentStoryTitle || story?.title || "Unknown Story";
                              })()}
                            </span>
                          </div>
                        </div>

                        {/* Sprint */}

                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            Sprint
                          </label>

                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-gray-400" />

                            <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                              {(selectedSprint &&
                                sprints.find((s) => s.id === selectedSprint)
                                  ?.name) ||
                                "No Sprint"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Tabs >

      {/* JIRA-Style Issue Details Modal */}

      < Dialog open={isIssueDetailsOpen} onOpenChange={setIsIssueDetailsOpen} >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <DialogTitle className="sr-only">
            Issue Details: {selectedIssueForDetails?.title || "Issue"}
          </DialogTitle>
          <DialogDescription className="sr-only">View and edit issue details</DialogDescription>

          {selectedIssueForDetails && (
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Main Content Area (Left Panel) */}

              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Header */}

                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50 flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800 font-semibold"
                      >
                        I){selectedIssueForDetails.id.toUpperCase()}
                      </Badge>

                      <Button variant="outline" size="sm" className="h-7 px-3">
                        {selectedIssueForDetails.status.replace("_", " ")}

                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIssueForEffort(selectedIssueForDetails);
                        setEffortLog({
                          hours: 0,
                          description: "",
                          workDate: "",
                          startTime: "",
                          endTime: "",
                        });
                        setIsLogEffortDialogOpen(true);
                      }}
                      title="Log work on this issue"
                    >
                      <Clock className="w-4 h-4 mr-1 text-red-600" />
                      Add Log
                    </Button>
                  </div>
                </div>

                {/* Issue Title */}

                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedIssueForDetails.title}
                  </h2>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Flag className="w-4 h-4" />

                      <span>{selectedIssueForDetails.priority}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />

                      <span>
                        {selectedIssueForDetails.estimatedHours || 0}h estimated
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />

                      <span>
                        {selectedIssueForDetails.assigneeId
                          ? getUserName(selectedIssueForDetails.assigneeId)
                          : "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Tabs */}

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <Tabs
                    value={issueDetailsTab}
                    onValueChange={(value) => setIssueDetailsTab(value as any)}
                    className="h-full flex flex-col min-h-0"
                  >
                    <TabsList className="mx-6 mt-4 flex-shrink-0">
                      <TabsTrigger value="details">Details</TabsTrigger>

                      <TabsTrigger value="activities">Activities</TabsTrigger>

                      <TabsTrigger value="subtasks">Subtasks</TabsTrigger>

                      <TabsTrigger value="due-dates">Due Dates</TabsTrigger>

                      <TabsTrigger value="linked-issues">
                        Linked Tasks
                      </TabsTrigger>

                      <TabsTrigger value="chats" className="relative">
                        Chats
                        {unreadMentions.some((n: any) => {
                          const relId = String(n.relatedEntityId || '').toUpperCase();
                          const relType = (n.relatedEntityType || '').toUpperCase();
                          return (relId === String(selectedIssueForDetails.id).toUpperCase() || relId === String(selectedIssueForDetails.issueNumber).toUpperCase()) &&
                            relType === 'ISSUE';
                        }) && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                          )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="details"
                      className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                      style={{ maxHeight: 'calc(90vh - 200px)' }}
                    >
                      {/* Issue Time Logs Section */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Time Logs
                        </h3>
                        {loadingIssueLogs ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-gray-600">
                              Loading logs...
                            </span>
                          </div>
                        ) : issueLogs.length > 0 ? (
                          <div className="space-y-2">
                            {issueLogs.map((log) => (
                              <div
                                key={log.id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors group"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Clock className="w-4 h-4 text-red-600" />
                                      <span className="text-sm font-medium text-gray-900">
                                        {log.hoursWorked}h logged
                                      </span>
                                      {log.workDate && (
                                        <span className="text-xs text-gray-500">
                                          on {new Date(log.workDate).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </span>
                                      )}
                                    </div>
                                    {log.description && (
                                      <p className="text-sm text-gray-700 mt-1">
                                        {log.description}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                      {log.userId && (
                                        <div className="flex items-center space-x-1">
                                          <User className="w-3 h-3" />
                                          <span>{getUserName(log.userId)}</span>
                                        </div>
                                      )}
                                      {log.startTime && log.endTime && (
                                        <div className="flex items-center space-x-1">
                                          <Timer className="w-3 h-3" />
                                          <span>
                                            {log.startTime} - {log.endTime}
                                          </span>
                                        </div>
                                      )}
                                      {log.entryType && (
                                        <Badge variant="outline" className="text-xs">
                                          {log.entryType}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">No time logged yet</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Log effort on subtasks to track time
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Description */}

                      <div>
                        {/* Accessibility fix: Header with Edit button */}
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Description
                          </h3>
                          {canManageSprintsAndStories && !isEditingIssueDescription && (
                            <Button variant="ghost" size="sm" onClick={() => {
                              setTempDescription(selectedIssueForDetails.description || "");
                              setIsEditingIssueDescription(true);
                            }} className="h-6 px-2">
                              <Edit3 className="w-3 h-3 mr-1" /> Edit
                            </Button>
                          )}
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          {isEditingIssueDescription ? (
                            <div className="space-y-2">
                              <Textarea
                                value={tempDescription}
                                onChange={(e) => setTempDescription(e.target.value)}
                                className="min-h-[100px] bg-white"
                              />
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setIsEditingIssueDescription(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleSaveIssueDescription}>Save</Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {selectedIssueForDetails.description || "No description provided."}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Labels */}

                      {selectedIssueForDetails.labels &&
                        selectedIssueForDetails.labels.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">
                              Labels
                            </h3>

                            <div className="flex flex-wrap gap-2">
                              {selectedIssueForDetails.labels.map(
                                (label, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {label}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* Attachments - Issue-specific and Parent Story */}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Attachments
                          </h3>

                          {(issueAttachments.length > 0 ||
                            parentStoryAttachments.length > 0) && (
                              <div className="flex items-center space-x-2">
                                {issueAttachments.length > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-red-50 text-red-700 border-red-200"
                                  >
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Issue ({issueAttachments.length})
                                  </Badge>
                                )}

                                {parentStoryAttachments.length > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    Story ({parentStoryAttachments.length})
                                  </Badge>
                                )}
                              </div>
                            )}
                        </div>

                        {loadingIssueAttachments ||
                          loadingParentStoryAttachments ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />

                            <span className="ml-2 text-sm text-gray-600">
                              Loading attachments...
                            </span>
                          </div>
                        ) : issueAttachments.length > 0 ||
                          parentStoryAttachments.length > 0 ? (
                          <div className="space-y-2">
                            {/* Issue-specific attachments */}

                            {issueAttachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-red-50/30"
                              >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                                    <Paperclip className="w-4 h-4 text-red-600" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {attachment.fileName}
                                      </p>

                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-red-100 text-red-700 border-red-300 flex-shrink-0"
                                      >
                                        Issue
                                      </Badge>
                                    </div>

                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      {attachment.fileSize && (
                                        <>
                                          <span>
                                            {(
                                              attachment.fileSize / 1024
                                            ).toFixed(2)}{" "}
                                            KB
                                          </span>

                                          <span>•</span>
                                        </>
                                      )}

                                      {attachment.uploadedBy && (
                                        <>
                                          <span>
                                            by{" "}
                                            {getUserName(attachment.uploadedBy)}
                                          </span>

                                          <span>•</span>
                                        </>
                                      )}

                                      <span>
                                        {new Date(
                                          attachment.createdAt,
                                        ).toLocaleDateString("en-GB", {
                                          day: "numeric",

                                          month: "short",

                                          year: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingAttachment(attachment);
                                      setIsAttachmentViewerOpen(true);
                                    }}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();

                                      if (attachment.fileUrl) {
                                        const link =
                                          document.createElement("a");

                                        link.href = attachment.fileUrl;

                                        link.download = attachment.fileName;

                                        document.body.appendChild(link);

                                        link.click();

                                        document.body.removeChild(link);

                                        toast.success("File downloaded");
                                      } else {
                                        toast.error("File URL not available");
                                      }
                                    }}
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            ))}

                            {/* Parent story attachments */}

                            {parentStoryAttachments.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-blue-50/30"
                              >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                    <Paperclip className="w-4 h-4 text-blue-600" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {attachment.fileName}
                                      </p>

                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-blue-100 text-blue-700 border-blue-300 flex-shrink-0"
                                      >
                                        Inherited
                                      </Badge>
                                    </div>

                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      {attachment.fileSize && (
                                        <>
                                          <span>
                                            {(
                                              attachment.fileSize / 1024
                                            ).toFixed(2)}{" "}
                                            KB
                                          </span>

                                          <span>•</span>
                                        </>
                                      )}

                                      {attachment.uploadedBy && (
                                        <>
                                          <span>
                                            by{" "}
                                            {getUserName(attachment.uploadedBy)}
                                          </span>

                                          <span>•</span>
                                        </>
                                      )}

                                      <span>
                                        {new Date(
                                          attachment.createdAt,
                                        ).toLocaleDateString("en-GB", {
                                          day: "numeric",

                                          month: "short",

                                          year: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingAttachment(attachment);
                                      setIsAttachmentViewerOpen(true);
                                    }}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();

                                      if (attachment.fileUrl) {
                                        const link =
                                          document.createElement("a");

                                        link.href = attachment.fileUrl;

                                        link.download = attachment.fileName;

                                        document.body.appendChild(link);

                                        link.click();

                                        document.body.removeChild(link);

                                        toast.success("File downloaded");
                                      } else {
                                        toast.error("File URL not available");
                                      }
                                    }}
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                            <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />

                            <p className="text-sm">No attachments</p>

                            <p className="text-xs text-gray-400 mt-1">
                              Attachments added to this issue or its parent
                              story will appear here
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="activities"
                      className="flex-1 overflow-auto p-6"
                    >
                      <IssueActivityLog issueId={selectedIssueForDetails.id} />
                    </TabsContent>

                    <TabsContent
                      value="subtasks"
                      className="flex-1 overflow-hidden flex flex-col"
                    >
                      {/* Header with Add Subtask Button */}

                      <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Subtasks
                          </h3>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={() => {
                              setSelectedIssueForSubtask(
                                selectedIssueForDetails,
                              );

                              setNewSubtask((prev) => ({
                                ...prev,

                                issueId: selectedIssueForDetails.id,

                                assigneeId:
                                  selectedIssueForDetails.assigneeId || "",
                              }));

                              setIsAddSubtaskDialogOpen(true);
                            }}
                            title="Add subtask"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Subtask
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                          {(() => {
                            const issueSubtasks = getSubtasksForIssue(
                              selectedIssueForDetails.id,
                            );

                            const completedSubtasks = issueSubtasks.filter(
                              (st) => st.isCompleted,
                            ).length;

                            const totalSubtasks = issueSubtasks.length;

                            const subtaskProgress =
                              totalSubtasks > 0
                                ? (completedSubtasks / totalSubtasks) * 100
                                : 0;

                            return (
                              <>
                                <Progress
                                  value={subtaskProgress}
                                  className="w-20 h-2"
                                />

                                <span className="text-xs text-gray-600">
                                  {completedSubtasks}/{totalSubtasks} Done
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Scrollable Subtasks List */}

                      <div
                        className="flex-1 overflow-y-auto p-6 pt-4 space-y-2"
                        style={{ maxHeight: "400px" }}
                      >
                        {(() => {
                          const issueSubtasks = getSubtasksForIssue(
                            selectedIssueForDetails.id,
                          );

                          if (issueSubtasks.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                <Layers3 className="w-8 h-8 mx-auto mb-2 text-gray-400" />

                                <p className="text-sm">No subtasks yet</p>

                                <p className="text-xs text-gray-400 mt-1">
                                  Use the "Add Subtask" button above to create
                                  one
                                </p>
                              </div>
                            );
                          }

                          return issueSubtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start space-x-3">
                                <Checkbox
                                  checked={subtask.isCompleted}
                                  onCheckedChange={async (checked) => {
                                    try {
                                      await subtaskApiService.updateSubtaskCompletion(
                                        subtask.id,
                                        checked as boolean,
                                      );

                                      // Update local state

                                      setAllSubtasks((prev) =>
                                        prev.map((st) =>
                                          st.id === subtask.id
                                            ? {
                                              ...st,
                                              isCompleted: checked as boolean,
                                            }
                                            : st,
                                        ),
                                      );

                                      toast.success(
                                        `Subtask ${checked ? "completed" : "reopened"}`,
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Error updating subtask:",
                                        error,
                                      );

                                      toast.error("Failed to update subtask");
                                    }
                                  }}
                                  className="mt-1"
                                />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p
                                        className={`text-sm font-medium ${subtask.isCompleted ? "line-through text-gray-500" : "text-gray-900"}`}
                                      >
                                        {subtask.title}
                                      </p>

                                      {subtask.description && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          {subtask.description}
                                        </p>
                                      )}
                                    </div>

                                    {/* Log Button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`h-7 px-2 text-red-700 border-red-200 flex-shrink-0 ${isSprintEnded ? 'cursor-not-allowed opacity-50' : 'hover:bg-red-100'}`}
                                      disabled={isSprintEnded}
                                      title={isSprintEnded ? 'Cannot log time - sprint has ended' : 'Log work on this subtask'}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isSprintEnded) return;
                                        setSelectedSubtaskForLog(subtask);
                                        setSubtaskLogEffort({
                                          hours: 0,
                                          description: "",
                                          workDate: new Date().toISOString().split("T")[0],
                                          startTime: "",
                                          endTime: "",
                                        });
                                        setIsSubtaskLogEffortOpen(true);
                                      }}
                                    >
                                      <Clock className="w-3 h-3 mr-1" />
                                      Add Log
                                    </Button>

                                    {/* Edit Button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 px-2 hover:bg-blue-100 text-blue-700 border-blue-200 flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSubtaskForEdit(subtask);
                                        setNewSubtask({
                                          title: subtask.title || "",
                                          description: subtask.description || "",
                                          taskId: subtask.taskId || "",
                                          assigneeId: subtask.assigneeId || "",
                                          estimatedHours: subtask.estimatedHours || 0,
                                          category: subtask.category || "",
                                          dueDate: subtask.dueDate ? subtask.dueDate.split('T')[0] : "",
                                        });
                                        setIsEditSubtaskDialogOpen(true);
                                      }}
                                    >
                                      <Edit3 className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>

                                  {/* Subtask Metadata */}

                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    {subtask.assigneeId && (
                                      <div className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />

                                        <span>
                                          {getUserName(subtask.assigneeId)}
                                        </span>
                                      </div>
                                    )}

                                    {subtask.dueDate && (
                                      <div className="flex items-center space-x-1">
                                        <CalendarIcon className="w-3 h-3" />

                                        <span>
                                          {new Date(
                                            subtask.dueDate,
                                          ).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </span>
                                      </div>
                                    )}

                                    {subtask.estimatedHours && (
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />

                                        <span>{subtask.estimatedHours}h</span>
                                      </div>
                                    )}

                                    {subtask.category && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {subtask.category}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Progress Bar for Time Tracking */}

                                  {(subtask.estimatedHours || 0) > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">
                                          Time Progress
                                        </span>

                                        <span className="text-xs font-medium text-gray-700">
                                          {Math.min(
                                            100,
                                            ((subtask.actualHours || 0) /
                                              (subtask.estimatedHours || 1)) *
                                            100,
                                          ).toFixed(0)}
                                          %
                                        </span>
                                      </div>

                                      <Progress
                                        value={Math.min(
                                          100,
                                          ((subtask.actualHours || 0) /
                                            (subtask.estimatedHours || 1)) *
                                          100,
                                        )}
                                        className="h-1.5"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="due-dates"
                      className="flex-1 overflow-auto p-6 space-y-6"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                          Due Dates
                        </h3>

                        <div className="space-y-4">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <CalendarIcon className="w-4 h-4 text-gray-600" />

                              <span className="text-sm font-medium text-gray-900">
                                Issue Due Date
                              </span>
                            </div>

                            <div className="text-sm text-gray-700">
                              {selectedIssueForDetails.dueDate
                                ? new Date(
                                  selectedIssueForDetails.dueDate,
                                ).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                                : "No due date set"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="linked-issues"
                      className="flex-1 overflow-auto p-6 space-y-6"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                          Linked Tasks
                        </h3>

                        <div className="text-center py-8 text-gray-500">
                          <Link className="w-8 h-8 mx-auto mb-2 text-gray-400" />

                          <p className="text-sm">No linked tasks</p>

                          <p className="text-xs text-gray-400 mt-1">
                            Links to related tasks will appear here
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="chats" className="flex-1 overflow-hidden p-6 min-h-0">
                      <ChatSection entityId={selectedIssueForDetails.id} entityType="issue" projectId={selectedProject || undefined} />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Sidebar (Right Panel) */}

              <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-auto">
                <div className="p-6 space-y-6">
                  {/* Task Details Section */}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Issue Details
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Estimation */}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            Estimation
                          </span>

                          <span className="text-xs font-semibold text-red-600">
                            {selectedIssueForDetails.estimatedHours || 0}h
                          </span>
                        </div>

                        <Progress value={100} className="h-2 bg-red-100" />
                      </div>

                      {/* Time Spent */}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            Time Spent
                          </span>

                          <span className="text-xs font-semibold text-green-600">
                            {selectedIssueForDetails.actualHours || 0}h
                          </span>
                        </div>

                        <Progress
                          value={
                            selectedIssueForDetails.estimatedHours > 0
                              ? Math.min(
                                100,
                                ((selectedIssueForDetails.actualHours || 0) /
                                  selectedIssueForDetails.estimatedHours) *
                                100,
                              )
                              : 0
                          }
                          className="h-2 bg-green-100"
                        />
                      </div>

                      {/* Remaining */}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            Remaining
                          </span>

                          <span className="text-xs font-semibold text-gray-600">
                            {Math.max(
                              0,
                              (selectedIssueForDetails.estimatedHours || 0) -
                              (selectedIssueForDetails.actualHours || 0),
                            )}
                            h
                          </span>
                        </div>

                        <Progress
                          value={
                            selectedIssueForDetails.estimatedHours > 0
                              ? Math.min(
                                100,
                                (Math.max(
                                  0,
                                  (selectedIssueForDetails.estimatedHours ||
                                    0) -
                                  (selectedIssueForDetails.actualHours ||
                                    0),
                                ) /
                                  selectedIssueForDetails.estimatedHours) *
                                100,
                              )
                              : 0
                          }
                          className="h-2 bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Details
                      </h3>

                      <Settings className="w-4 h-4 text-gray-400" />
                    </div>

                    {/* Manager-Only Dropdowns Section */}
                    {canManageSprintsAndStories && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-4 h-4 text-red-600" />
                          <h4 className="text-xs font-semibold text-red-800">Manager Controls</h4>
                        </div>
                        <div className="space-y-3">
                          {/* Assignee Dropdown */}
                          <div>
                            <label className="text-xs font-medium text-gray-900 block mb-1">
                              Assigned To
                            </label>
                            <Select
                              value={selectedIssueForDetails.assigneeId || "unassigned"}
                              onValueChange={async (value) => {
                                const newAssigneeId = value === "unassigned" ? "" : value;
                                try {
                                  // USER REQUEST: Create a new duplicate issue with same details but new assignee and 0 actual hours.
                                  // 1. Update the issue's assignee (Standard behavior)
                                  await issueApiService.updateIssueAssignee(selectedIssueForDetails.id, newAssigneeId || "");

                                  // 2. USER REQUEST: Create a new time entry for the new assignee (0 hours)
                                  // This ensures the issue appears in their Time Tracking page.
                                  if (newAssigneeId) {
                                    try {
                                      await timeEntryApiService.createTimeEntry({
                                        userId: newAssigneeId,
                                        issueId: selectedIssueForDetails.id, // Use issueId for issues
                                        projectId: selectedProject || "",
                                        storyId: selectedIssueForDetails.storyId,
                                        description: "Assigned to issue",
                                        entryType: "development",
                                        hoursWorked: 0,
                                        workDate: new Date().toISOString().split('T')[0],
                                        isBillable: true
                                      });
                                      console.log("Created 0h time entry for new issue assignee");
                                    } catch (teError) {
                                      console.error("Failed to create initial time entry for issue:", teError);
                                    }
                                  }

                                  // 3. Update local state
                                  setSelectedIssueForDetails((prev: any) =>
                                    prev ? { ...prev, assigneeId: newAssigneeId } : prev
                                  );
                                  setAllIssues((prev) =>
                                    prev.map((i) =>
                                      i.id === selectedIssueForDetails.id
                                        ? { ...i, assigneeId: newAssigneeId }
                                        : i
                                    )
                                  );
                                  toast.success("Assigned To updated");
                                } catch (error) {
                                  console.error("Failed to update assignee:", error);
                                  toast.error("Failed to change Assigned To");
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs bg-white text-black font-medium">
                                <SelectValue placeholder="Select assignee" />
                              </SelectTrigger>
                              <SelectContent className="bg-white text-black">
                                <SelectItem value="unassigned" className="!text-black" style={{ color: 'black' }}>
                                  Unassigned
                                </SelectItem>
                                {availableUsersForAssignment.map((user: any) => (
                                  <SelectItem key={user.id} value={user.id} className="!text-black" style={{ color: 'black' }}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Estimation Hours Input */}
                          <div>
                            <label className="text-xs font-medium text-gray-900 block mb-1">
                              Estimation Hours
                            </label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                className="h-8 text-sm bg-white text-black w-20"
                                defaultValue={selectedIssueForDetails.estimatedHours || 0}
                                onBlur={async (e) => {
                                  const newHours = parseFloat(e.target.value) || 0;
                                  if (newHours !== selectedIssueForDetails.estimatedHours) {
                                    try {
                                      await issueApiService.updateIssueEstimatedHours(selectedIssueForDetails.id, newHours);
                                      setSelectedIssueForDetails((prev: any) =>
                                        prev ? { ...prev, estimatedHours: newHours } : prev
                                      );
                                      setAllIssues((prev) =>
                                        prev.map((i) =>
                                          i.id === selectedIssueForDetails.id
                                            ? { ...i, estimatedHours: newHours }
                                            : i
                                        )
                                      );
                                      toast.success("Estimation updated");
                                    } catch (error) {
                                      console.error("Failed to update estimation:", error);
                                      toast.error("Failed to update estimation");
                                    }
                                  }
                                }}
                              />
                              <span className="text-xs text-gray-600">hours</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Assignee */}

                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Assigned To
                        </label>

                        <div className="flex items-center space-x-2">
                          {selectedIssueForDetails.assigneeId ? (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-red-100 text-red-800 text-xs">
                                {getUserName(selectedIssueForDetails.assigneeId)
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-3 h-3 text-gray-400" />
                            </div>
                          )}

                          <span className="text-sm text-gray-700">
                            {selectedIssueForDetails.assigneeId
                              ? getUserName(selectedIssueForDetails.assigneeId)
                              : "Unassigned"}
                          </span>
                        </div>
                      </div>

                      {/* Priority */}

                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Priority
                        </label>

                        <Badge
                          variant="outline"
                          className={getPriorityColor(
                            selectedIssueForDetails.priority,
                          )}
                        >
                          {selectedIssueForDetails.priority}
                        </Badge>
                      </div>

                      {/* Due Date */}

                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Due Date
                        </label>

                        {(user?.role === 'manager' || user?.role === 'qa_manager') ? (
                          <Popover open={isIssueDueDatePopoverOpen} onOpenChange={setIsIssueDueDatePopoverOpen} modal={true}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal h-8 text-xs ${!selectedIssueForDetails.dueDate ? "text-muted-foreground" : ""
                                  }`}
                              >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {selectedIssueForDetails.dueDate ? (
                                  new Date(selectedIssueForDetails.dueDate).toLocaleDateString()
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[9999]" align="start" side="top" sideOffset={5}>
                              <Calendar
                                mode="single"
                                selected={selectedIssueForDetails.dueDate ? new Date(selectedIssueForDetails.dueDate) : undefined}
                                onSelect={async (date) => {
                                  if (date) {
                                    // Use local date string YYYY-MM-DD instead of toISOString() to avoid timezone offsets
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const formattedDate = `${year}-${month}-${day}`;

                                    try {
                                      await issueApiService.updateIssueDueDate(selectedIssueForDetails.id, formattedDate);
                                      setSelectedIssueForDetails((prev: any) =>
                                        prev ? { ...prev, dueDate: formattedDate } : prev
                                      );
                                      setAllIssues((prev) =>
                                        prev.map((i) =>
                                          i.id === selectedIssueForDetails.id
                                            ? { ...i, dueDate: formattedDate }
                                            : i
                                        )
                                      );
                                      setIsIssueDueDatePopoverOpen(false);
                                      toast.success("Due date updated");
                                    } catch (error) {
                                      console.error("Failed to update due date:", error);
                                      toast.error("Failed to update due date");
                                    }
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <CalendarIcon className="w-4 h-4" />

                            <span>
                              {selectedIssueForDetails.dueDate
                                ? new Date(
                                  selectedIssueForDetails.dueDate,
                                ).toLocaleDateString()
                                : "No due date"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Labels */}

                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Labels
                        </label>

                        <div className="flex flex-wrap gap-1">
                          {selectedIssueForDetails.labels &&
                            selectedIssueForDetails.labels.length > 0 ? (
                            selectedIssueForDetails.labels.map(
                              (label, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {label}
                                </Badge>
                              ),
                            )
                          ) : (
                            <span className="text-sm text-gray-400">
                              Add labels
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Parent Story */}

                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Parent
                        </label>

                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />

                          <span className="text-sm text-red-600 cursor-pointer hover:underline">
                            {(() => {
                              const story = sprintStories.find(
                                (s) => s.id === selectedIssueForDetails.storyId,
                              );
                              // Use parentStoryTitle from API if available, otherwise find in sprintStories
                              return story?.parentStoryTitle || story?.title || "Unknown Story";
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Sprint */}

                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Sprint
                        </label>

                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-gray-400" />

                          <span className="text-sm text-red-600 cursor-pointer hover:underline">
                            {(selectedSprint &&
                              sprints.find((s) => s.id === selectedSprint)
                                ?.name) ||
                              "No Sprint"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog >

      {/* Add Issue Dialog */}

      < AddIssueDialog
        isOpen={isAddIssueDialogOpen}
        onClose={() => {
          setIsAddIssueDialogOpen(false);

          setSelectedStoryForIssue(null);
          setCustomLaneNameForDialog(undefined);
        }}
        sprintStartDate={selectedSprint ? sprints?.find((s: any) => s.id === selectedSprint)?.startDate : undefined}
        sprintEndDate={selectedSprint ? sprints?.find((s: any) => s.id === selectedSprint)?.endDate : undefined}
        onSubmit={handleAddIssue}
        stories={
          sprintStories.map((story) => ({
            id: story.id,

            title: story.title,

            priority: (story.priority?.toLowerCase() || "medium") as
              | "high"
              | "medium"
              | "low",

            points: story.storyPoints || 0,

            status: story.status?.toLowerCase()?.includes("backlog")
              ? "stories"
              : story.status?.toLowerCase()?.includes("todo")
                ? "todo"
                : story.status?.toLowerCase()?.includes("progress")
                  ? "inprogress"
                  : story.status?.toLowerCase()?.includes("review")
                    ? "qa"
                    : story.status?.toLowerCase()?.includes("done")
                      ? "done"
                      : ("stories" as
                        | "stories"
                        | "todo"
                        | "inprogress"
                        | "qa"
                        | "done"),

            assignee: undefined,
          }))
        }
        defaultStatus="todo"
        defaultStoryId={selectedStoryForIssue || undefined}
        requiredStoryId={selectedStoryForIssue || undefined}
        users={users}
        customLaneName={customLaneNameForDialog}
      />

      {/* Add Task Dialog */}

      < AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onClose={() => {
          setIsAddTaskDialogOpen(false);

          setNewTask({
            title: "",

            description: "",

            storyId: newTask.storyId, // Keep storyId if set from button click

            priority: "MEDIUM",

            assigneeId: "",

            estimatedHours: 0,

            dueDate: "",
          });
          setCustomLaneNameForDialog(undefined);
        }}
        onSubmit={handleAddTask}
        stories={
          sprintStories.map((story) => ({
            id: story.id,

            title: story.title,

            priority: (story.priority?.toLowerCase() || "medium") as
              | "high"
              | "medium"
              | "low",

            points: story.storyPoints || 0,

            status: story.status?.toLowerCase()?.includes("backlog")
              ? "stories"
              : story.status?.toLowerCase()?.includes("todo")
                ? "todo"
                : story.status?.toLowerCase()?.includes("progress")
                  ? "inprogress"
                  : story.status?.toLowerCase()?.includes("review")
                    ? "qa"
                    : story.status?.toLowerCase()?.includes("done")
                      ? "done"
                      : ("stories" as
                        | "stories"
                        | "todo"
                        | "inprogress"
                        | "qa"
                        | "done"),

            assignee: undefined,
            dueDate: story.dueDate || undefined,
          }))
        }
        defaultStatus={newTask.storyId ? "todo" : "todo"}
        defaultStoryId={newTask.storyId || undefined}
        users={users}
        customLaneName={customLaneNameForDialog}
      />

      {/* Lane Configuration Modal */}

      < LaneConfigurationModal
        open={isLaneConfigModalOpen}
        onClose={() => {
          setIsLaneConfigModalOpen(false);

          setSelectedLaneForEdit(null);

          setLaneCreationSource(null);
        }}
        onSubmit={handleCreateWorkflowLane}
        projectId={selectedProject}
        existingLane={selectedLaneForEdit}
        allLanes={workflowLanes}
      />

      {/* Create Board Dialog */}

      < Dialog
        open={isCreateBoardDialogOpen}
        onOpenChange={setIsCreateBoardDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>

            <DialogDescription>
              Create a new scrum board with all columns and functionality except
              QA columns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Board Name</Label>

              <Input
                id="board-name"
                placeholder="Enter board name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newBoardName.trim()) {
                    handleCreateBoard();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateBoardDialogOpen(false);

                setNewBoardName("");
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreateBoard}
              disabled={
                !newBoardName.trim() || createBoardFromDefaultMutation.loading
              }
            >
              {createBoardFromDefaultMutation.loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Board
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Edit Story Dialog */}
      < Dialog
        open={isEditStoryDialogOpen}
        onOpenChange={(open) => {
          setIsEditStoryDialogOpen(open);
          if (!open) setEditingStory(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              Edit Story
            </DialogTitle>
            <DialogDescription>
              Update the story details. Changes will be saved to the database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-story-title">Title *</Label>
              <Input
                id="edit-story-title"
                placeholder="Story title"
                value={editStoryForm.title}
                onChange={(e) =>
                  setEditStoryForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-story-description">Description</Label>
              <Textarea
                id="edit-story-description"
                placeholder="Story description"
                value={editStoryForm.description}
                onChange={(e) =>
                  setEditStoryForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            {/* Priority and Story Points */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-story-priority">Priority</Label>
                <Select
                  value={editStoryForm.priority}
                  onValueChange={(value) =>
                    setEditStoryForm((prev) => ({ ...prev, priority: value as Priority }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BLOCKER">Blocker</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-story-points">Story Points</Label>
                <Select
                  value={String(editStoryForm.storyPoints)}
                  onValueChange={(value) =>
                    setEditStoryForm((prev) => ({ ...prev, storyPoints: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Points" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="13">13</SelectItem>
                    <SelectItem value="21">21</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-story-due-date">Due Date</Label>
              <Input
                id="edit-story-due-date"
                type="date"
                value={editStoryForm.dueDate}
                onChange={(e) =>
                  setEditStoryForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>

            {/* Acceptance Criteria */}
            <div className="space-y-2">
              <Label htmlFor="edit-story-acceptance">Acceptance Criteria</Label>
              <Textarea
                id="edit-story-acceptance"
                placeholder="Enter acceptance criteria (one per line)"
                value={editStoryForm.acceptanceCriteria}
                onChange={(e) =>
                  setEditStoryForm((prev) => ({ ...prev, acceptanceCriteria: e.target.value }))
                }
                rows={3}
              />
              <p className="text-xs text-muted-foreground">One criterion per line</p>
            </div>

            {/* Labels */}
            <div className="space-y-2">
              <Label htmlFor="edit-story-labels">Labels</Label>
              <Input
                id="edit-story-labels"
                placeholder="bug, feature, enhancement (comma-separated)"
                value={editStoryForm.labels}
                onChange={(e) =>
                  setEditStoryForm((prev) => ({ ...prev, labels: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditStoryDialogOpen(false);
                setEditingStory(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStory} disabled={!editStoryForm.title.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Epic Template Dialog */}

      < Dialog
        open={isEpicTemplateDialogOpen}
        onOpenChange={setIsEpicTemplateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Epic Template</DialogTitle>

            <DialogDescription>
              Choose a template to create an epic for this project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {[
              {
                id: "tpl-auth",
                title: "User Authentication",
                summary: "Implement secure login/registration",
                priority: "HIGH",
                status: "PLANNING",
              },

              {
                id: "tpl-payments",
                title: "Payment Gateway Integration",
                summary: "Integrate multiple payment providers",
                priority: "CRITICAL",
                status: "PLANNING",
              },

              {
                id: "tpl-dashboard",
                title: "Analytics Dashboard",
                summary: "Interactive charts and KPIs",
                priority: "MEDIUM",
                status: "PLANNING",
              },
            ].map((tpl) => (
              <Card
                key={tpl.id}
                className="cursor-pointer hover:shadow"
                onClick={async () => {
                  if (!selectedProject) {
                    toast.error("Select a project first");
                    return;
                  }

                  try {
                    const payload: any = {
                      title: tpl.title,

                      description: tpl.summary,

                      summary: tpl.summary,

                      projectId: selectedProject,

                      status: tpl.status,

                      priority: tpl.priority,

                      owner: user?.id || "",

                      isActive: true,
                    };

                    const { epicApiService } = await import(
                      "../services/api/entities/epicApi"
                    );

                    await epicApiService.createEpic(payload);

                    const list =
                      await epicApiService.getEpicsByProject(
                        selectedProject,
                      );

                    setProjectEpics(
                      (list as any).data ??
                      (Array.isArray(list) ? list : []),
                    );

                    setIsEpicTemplateDialogOpen(false);

                    toast.success("Epic created from template");
                  } catch (e: any) {
                    console.error(e);

                    toast.error(
                      e?.message || "Failed to create epic",
                    );
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{tpl.title}</h4>

                      <p className="text-sm text-muted-foreground">
                        {tpl.summary}
                      </p>
                    </div>

                    <Badge variant="outline" className="text-xs">
                      {tpl.priority.toString().toLowerCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog >

      {/* Add Epic Dialog */}

      < Dialog
        open={isAddEpicDialogOpen}
        onOpenChange={setIsAddEpicDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Epic</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label>Title</Label>

              <Input
                value={newEpic.title}
                onChange={(e) =>
                  setNewEpic((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label>Description</Label>

              <Textarea
                value={newEpic.description}
                onChange={(e) =>
                  setNewEpic((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>

                <Select
                  value={newEpic.priority}
                  onValueChange={(v) =>
                    setNewEpic((prev) => ({
                      ...prev,
                      priority: v as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="BLOCKER">Blocker</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>

                <Select
                  value={newEpic.status}
                  onValueChange={(v) =>
                    setNewEpic((prev) => ({
                      ...prev,
                      status: v as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="PLANNING">
                      Planning
                    </SelectItem>

                    <SelectItem value="ACTIVE">Active</SelectItem>

                    <SelectItem value="COMPLETED">
                      Completed
                    </SelectItem>

                    <SelectItem value="CANCELLED">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddEpicDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={async () => {
                if (!selectedProject) {
                  toast.error("Select a project first");
                  return;
                }

                if (!newEpic.title.trim()) {
                  toast.error("Title is required");
                  return;
                }

                try {
                  const payload: any = {
                    title: newEpic.title,

                    description: newEpic.description,

                    projectId: selectedProject,

                    status: newEpic.status,

                    priority: newEpic.priority,

                    owner: user?.id || "",

                    isActive: true,
                  };

                  const { epicApiService } = await import(
                    "../services/api/entities/epicApi"
                  );

                  await epicApiService.createEpic(payload);

                  const list =
                    await epicApiService.getEpicsByProject(
                      selectedProject,
                    );

                  setProjectEpics(
                    (list as any).data ??
                    (Array.isArray(list) ? list : []),
                  );

                  setIsAddEpicDialogOpen(false);

                  setNewEpic({
                    title: "",
                    description: "",
                    priority: "MEDIUM",
                    status: "PLANNING",
                    startDate: "",
                    endDate: "",
                  });

                  toast.success("Epic created");
                } catch (e: any) {
                  console.error(e);

                  toast.error(
                    e?.message || "Failed to create epic",
                  );
                }
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Create Sprint Dialog */}
      {/* <CreateSprintDialog
        open={isCreateSprintDialogOpen}
        onOpenChange={setIsCreateSprintDialogOpen}
        onSubmit={async (sprint) => {
          try {
            await createSprintMutate(sprint);
            toast.success("Sprint created successfully");
            if (refetchSprints) {
              await refetchSprints();
            }
          } catch (error: any) {
            console.error("Error creating sprint:", error);
            toast.error(error?.message || "Failed to create sprint");
          }
        }}
        projectId={selectedProject}
      /> */}

      {/* Team Capacity Calculator */}
      {/* Team Capacity Calculator */}
      <TeamCapacityCalculator
        open={isCapacityCalculatorOpen}
        onOpenChange={setIsCapacityCalculatorOpen}
        onCalculate={(capacity) => {
          setNewSprint((prev) => ({
            ...prev,
            capacityHours: capacity.toFixed(0),
          }));
        }}
        initialCapacity={newSprint.capacityHours ? parseInt(newSprint.capacityHours) : undefined}
      />

      {/* Lane Migration Dialog */}
      <Dialog open={laneMigrationDialogOpen} onOpenChange={setLaneMigrationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Lane with Items</DialogTitle>
            <DialogDescription>
              This lane contains <strong>{laneItemsCount.tasks} task(s)</strong> and{" "}
              <strong>{laneItemsCount.issues} issue(s)</strong>. Please select a lane to move
              these items to before deleting.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="targetLane" className="text-sm font-medium">
              Move items to lane:
            </Label>
            <Select value={targetMigrationLane} onValueChange={setTargetMigrationLane}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select target lane" />
              </SelectTrigger>
              <SelectContent>
                {(() => {
                  // Define standard lanes
                  const standardLanes = [
                    { id: 'TO_DO', title: 'To Do', color: '#6B7280', statusValue: 'TO_DO', displayOrder: 1 },
                    { id: 'IN_PROGRESS', title: 'In Progress', color: '#3B82F6', statusValue: 'IN_PROGRESS', displayOrder: 10 },
                    { id: 'QA', title: 'QA', color: '#F59E0B', statusValue: 'QA', displayOrder: 20 },
                  ];

                  // Get custom lanes from API
                  const customLanes = Array.isArray(workflowLanesData) ? workflowLanesData : (workflowLanesData as any)?.data || [];

                  // Merge and filter
                  const allLanes = [...standardLanes, ...customLanes]
                    .filter((lane: any) => lane.id !== laneToDelete)
                    .filter((lane: any) => !lane.title?.toLowerCase().includes('done') && !lane.statusValue?.toLowerCase().includes('done'))
                    .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

                  return allLanes.map((lane: any) => (
                    <SelectItem key={lane.id} value={lane.statusValue || lane.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: lane.color || "#3B82F6" }}
                        />
                        {lane.title}
                      </div>
                    </SelectItem>
                  ));
                })()}
              </SelectContent>
            </Select>
            {!targetMigrationLane && (
              <p className="text-xs text-yellow-600 mt-2">
                ⚠️ If you don't select a target lane, the items will remain with their current
                status and may not be visible on the board.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setLaneMigrationDialogOpen(false);
                setLaneToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLaneMigration}
              disabled={!targetMigrationLane}
            >
              Move & Delete Lane
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onClose={() => {
          setIsAddTaskDialogOpen(false);
          // Reset storyId when dialog closes
          setNewTask((prev) => ({
            ...prev,
            storyId: "",
          }));
          setCustomLaneNameForDialog(undefined);
        }}
        projectId={selectedProject}
        sprintStartDate={selectedSprint ? sprints?.find((s: any) => s.id === selectedSprint)?.startDate : undefined}
        sprintEndDate={selectedSprint ? sprints?.find((s: any) => s.id === selectedSprint)?.endDate : undefined}
        onSubmit={async (taskData) => {
          try {
            const storyId = taskData.storyId === 'none' ? undefined : taskData.storyId;
            if (!storyId) {
              toast.error("Story is required");
              return;
            }

            // Map frontend status to backend enum format
            const mapTaskStatus = (status: string): string => {
              const statusUpper = status.toUpperCase();
              switch (statusUpper) {
                case 'TODO':
                  return 'TO_DO';
                case 'INPROGRESS':
                  return 'IN_PROGRESS';
                case 'QA':
                case 'QA_REVIEW':
                  return 'QA_REVIEW';
                case 'DONE':
                  return 'DONE';
                case 'BLOCKED':
                  return 'BLOCKED';
                case 'CANCELLED':
                  return 'CANCELLED';
                default:
                  return 'TO_DO'; // Default fallback
              }
            };

            const taskPayload: any = {
              title: taskData.title,
              description: taskData.description,
              storyId: storyId,
              priority: taskData.priority.toUpperCase(),
              assigneeId: taskData.assignee,
              status: mapTaskStatus(taskData.status),
              dueDate: taskData.dueDate || undefined,
              estimatedHours: taskData.estimatedHours,
            };

            await createTaskMutate(taskPayload);
            toast.success("Task created successfully");
            setIsAddTaskDialogOpen(false);

            // Reset storyId after successful creation
            setNewTask((prev) => ({
              ...prev,
              storyId: "",
            }));

            // Refresh tasks
            if (sprintStories.length > 0) {
              fetchAllTasks(sprintStories, false);
            }
          } catch (error: any) {
            console.error("Error creating task:", error);
            toast.error(error?.message || "Failed to create task");
          }
        }}
        stories={sprintStories.map((story) => ({
          id: story.id,
          title: story.title,
          priority: (story.priority?.toLowerCase() || "medium") as
            | "high"
            | "medium"
            | "low",
          points: story.storyPoints || 0,
          status: story.status?.toLowerCase()?.includes("backlog")
            ? "stories"
            : story.status?.toLowerCase()?.includes("todo")
              ? "todo"
              : story.status?.toLowerCase()?.includes("progress")
                ? "inprogress"
                : story.status?.toLowerCase()?.includes("review")
                  ? "qa"
                  : story.status?.toLowerCase()?.includes("done")
                    ? "done"
                    : ("stories" as
                      | "stories"
                      | "todo"
                      | "inprogress"
                      | "qa"
                      | "done"),
          assignee: undefined,
          dueDate: story.dueDate || undefined,
          projectId: story.projectId,
        }))}
        defaultStoryId={newTask.storyId || undefined}
        users={users}
        customLaneName={customLaneNameForDialog}
      />

      {/* Attachment Viewer Modal */}
      <AttachmentViewer
        isOpen={isAttachmentViewerOpen}
        onClose={() => {
          setIsAttachmentViewerOpen(false);
          setViewingAttachment(null);
        }}
        attachment={viewingAttachment}
      />
    </DndProvider >
  );
};

export default ScrumPage;