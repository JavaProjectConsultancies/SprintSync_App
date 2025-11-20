import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calculator } from 'lucide-react';
import TeamCapacityCalculator from './TeamCapacityCalculator';
import { Sprint } from '../types/api';

interface CreateSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>) => void | Promise<void>;
  projectId: string;
}

const CreateSprintDialog: React.FC<CreateSprintDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  projectId,
}) => {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacityHours, setCapacityHours] = useState<string>('');
  const [isCapacityCalculatorOpen, setIsCapacityCalculatorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        projectId,
        name: name.trim(),
        goal: goal.trim() || undefined,
        status: 'PLANNING' as any,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        capacityHours: capacityHours ? parseInt(capacityHours) : undefined,
        isActive: true,
      });

      // Reset form
      setName('');
      setGoal('');
      setStartDate('');
      setEndDate('');
      setCapacityHours('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating sprint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCapacityCalculated = (capacity: number) => {
    setCapacityHours(capacity.toFixed(0));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
            <DialogDescription>
              Create a new sprint for your project. Set the sprint name, goal, dates, and team capacity.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sprint-name">Sprint Name *</Label>
              <Input
                id="sprint-name"
                placeholder="e.g., Sprint 1 - Q1 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprint-goal">Sprint Goal</Label>
              <Textarea
                id="sprint-goal"
                placeholder="Describe the goal for this sprint..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity-hours">Team Capacity (Hours)</Label>
              <div className="flex gap-2">
                <Input
                  id="capacity-hours"
                  type="number"
                  placeholder="Enter team capacity in hours"
                  value={capacityHours}
                  onChange={(e) => setCapacityHours(e.target.value)}
                  min="0"
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
              <p className="text-xs text-muted-foreground">
                Use the calculator to automatically calculate team capacity based on team size, allocation, and availability.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Sprint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TeamCapacityCalculator
        open={isCapacityCalculatorOpen}
        onOpenChange={setIsCapacityCalculatorOpen}
        onCalculate={handleCapacityCalculated}
        initialCapacity={capacityHours ? parseInt(capacityHours) : undefined}
      />
    </>
  );
};

export default CreateSprintDialog;

