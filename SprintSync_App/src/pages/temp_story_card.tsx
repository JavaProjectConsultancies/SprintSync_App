// Story Card Component

const StoryCard: React.FC<{ story: StoryWithTasks }> = ({ story }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const visibleTasks = (story.tasks || []).filter(taskPassesFilters);
    const visibleIssues = (story.issues || []).filter(taskPassesFilters as any);

    // Combine and sort items (simple sort by creation or just concat)
    const visibleItems = [
        ...visibleTasks.map(t => ({ ...t, type: 'TASK' as const })),
        ...visibleIssues.map(i => ({ ...i, type: 'ISSUE' as const }))
    ];

    visibleItems.sort((a, b) => {
        // Sort by status (done last), then priority
        if (a.status === 'DONE' && b.status !== 'DONE') return 1;
        if (a.status !== 'DONE' && b.status === 'DONE') return -1;
        return 0;
    });

    const overdueTasks = visibleItems.filter(item => {
        if (!item.dueDate) return false;
        const itemDueDate = new Date(item.dueDate);
        itemDueDate.setHours(0, 0, 0, 0);
        return itemDueDate < today && item.status !== 'DONE' && item.status !== 'CANCELLED';
    });

    const isExpanded = expandedStories.has(story.id);

    return (
        <Card className="mb-4">
            <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleStoryExpansion(story.id)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                        <h3 className="font-semibold text-lg">{story.title}</h3>
                        <Badge variant="outline" className={`text-xs ${getStoryStatusColor(story.status)}`}>
                            {story.status}
                        </Badge>
                        {story.sprintId && getSprintName(story.sprintId) && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <GitBranch className="w-3 h-3 mr-1" />
                                {getSprintName(story.sprintId)}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent>
                    <div className="space-y-4">
                        {/* Story Info */}
                        {story.description && (
                            <p className="text-sm text-muted-foreground">{story.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm">
                            <Badge variant="outline" className={`${getPriorityColor(story.priority)}`}>
                                <Flag className="w-3 h-3 mr-1" />
                                {story.priority}
                            </Badge>
                            {story.storyPoints && (
                                <div className="flex items-center space-x-1 text-muted-foreground">
                                    <Target className="w-4 h-4" />
                                    <span>{story.storyPoints} points</span>
                                </div>
                            )}
                            {overdueTasks.length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {overdueTasks.length} overdue item{overdueTasks.length > 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>

                        {/* Items */}
                        {visibleItems.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">Items ({visibleItems.length})</h4>
                                    <div className="text-xs text-muted-foreground">
                                        {visibleItems.filter(t => (t.status || '').toUpperCase() === 'DONE').length} completed
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {visibleItems.map(item => {
                                        const isIssue = item.type === 'ISSUE';
                                        const isOverdue = item.dueDate && new Date(item.dueDate) < today;
                                        const itemStatusUpper = item.status?.toUpperCase() || '';
                                        const isItemDoneStatus = itemStatusUpper === 'DONE';
                                        const isItemCancelled = itemStatusUpper === 'CANCELLED';
                                        const isIncomplete = !isItemDoneStatus && !isItemCancelled;
                                        const isOverdueAndIncomplete = isOverdue && isIncomplete;
                                        const isDoneAfterDue = isItemDoneStatus && isOverdue; // Item completed after due date
                                        const isUserAssigned = user?.id && item.assigneeId === user.id;
                                        const isDoneBeforeDue = isItemDoneStatus && item.dueDate && new Date(item.dueDate) >= today;

                                        const enrichedItem = item as typeof item & { assigneeName?: string };
                                        const resolvedAssigneeName =
                                            enrichedItem.assigneeName ||
                                            (item.assigneeId ? userMap[item.assigneeId] : null);
                                        const assigneeLabel =
                                            resolvedAssigneeName ||
                                            (!item.assigneeId
                                                ? 'Unassigned'
                                                : usersLoading
                                                    ? 'Loading...'
                                                    : 'Unknown user');

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
                                                                <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                                                                    {getStatusLabelUtil(item.status, workflowLanes)}
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
                                                                <Badge variant="outline" className={`${getPriorityColor(item.priority)}`}>
                                                                    {item.priority}
                                                                </Badge>
                                                                {item.dueDate && (
                                                                    <div className="flex items-center space-x-1">
                                                                        <Calendar className={`w-3 h-3 ${isDoneBeforeDue ? 'text-green-400' : isOverdue ? 'text-red-600' : ''}`} />
                                                                        <span className={
                                                                            isDoneBeforeDue ? 'text-green-600 font-medium' :
                                                                                isOverdue ? 'text-red-600 font-medium' : ''
                                                                        }>
                                                                            {formatDate(item.dueDate)}
                                                                            {isDoneBeforeDue && ' (Completed Early)'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {item.estimatedHours !== undefined && (
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
                                                                {item.actualHours !== undefined && item.actualHours > 0 && (
                                                                    <div className="flex items-center space-x-1">
                                                                        <Target className="w-3 h-3" />
                                                                        <span>{item.actualHours}h actual</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                    <MoreVertical className="w-3 h-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => isIssue ? null /* TODO: issue dialog */ : handleOpenTaskDialog(item as Task)}>
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
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};
