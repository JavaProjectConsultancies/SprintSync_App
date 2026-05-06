import React from 'react';
import { useDrag } from 'react-dnd';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../../components/ui/dropdown-menu';
import { 
  Eye, 
  MoreHorizontal, 
  GripVertical, 
  Edit3, 
  TrendingUp 
} from 'lucide-react';
import { Story, Task } from '../../../types/api';
import { useScrum } from '../context';
import { getPriorityColor, getStatusColor } from '../utils';

const ItemTypes = {
  STORY: "story",
};

export const DraggableStory: React.FC<{
  story: Story;
  index: number;
  allTasks: Task[];
}> = ({ story, index, allTasks }) => {
  const { setIsAddTaskDialogOpen, setIsAddIssueDialogOpen, setNewTask } = useScrum();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.STORY,
    item: { id: story.id, type: ItemTypes.STORY },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const storyTasks = allTasks.filter((t: Task) => t.storyId === story.id);

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`transition-all ${isDragging ? "opacity-50" : ""}`}
    >
      <Card className={`border-l-4 ${getPriorityColor(story.priority)}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <Badge variant="outline">{story.priority}</Badge>
              <Badge variant="secondary">ST#{index + 1}</Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Eye className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Story
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setNewTask({ storyId: story.id });
                    setIsAddTaskDialogOpen(true);
                  }}>
                    Add Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setNewTask({ storyId: story.id });
                    setIsAddIssueDialogOpen(true);
                  }}>
                    Add Issue
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <TrendingUp className="w-4 h-4 mr-2" /> Story Insights
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <h4 className="font-semibold text-sm mb-2">{story.title}</h4>
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge variant="secondary">{story.storyPoints} pts</Badge>
            <Badge variant="outline" className={getStatusColor(story.status)}>
              {story.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
