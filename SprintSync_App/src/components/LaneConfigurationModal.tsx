import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Settings, Check } from 'lucide-react';
import { WorkflowLane } from '../services/api/entities/workflowLaneApi';

interface LaneConfigurationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (lane: Partial<WorkflowLane>) => void;
  projectId: string;
  existingLane?: WorkflowLane | null;
  allLanes?: WorkflowLane[]; // Add prop for all lanes
}

// Color palette - 16 colors for 4x4 grid
const LANE_COLORS = [
  '#8B5CF6', // Purple
  '#6B21A8', // Dark Purple
  '#3B82F6', // Blue
  '#60A5FA', // Light Blue
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#047857', // Dark Green
  '#10B981', // Green
  '#84CC16', // Lime Green
  '#EAB308', // Yellow
  '#F97316', // Orange
  '#EF4444', // Red
  '#DC2626', // Dark Red
  '#92400E', // Brown
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

const LaneConfigurationModal: React.FC<LaneConfigurationModalProps> = ({
  open,
  onClose,
  onSubmit,
  projectId,
  existingLane,
  allLanes = [],
}) => {
  const [laneTitle, setLaneTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(LANE_COLORS[2]); // Default to blue
  const [objective, setObjective] = useState('');
  const [wipLimitEnabled, setWipLimitEnabled] = useState(false);
  const [wipLimit, setWipLimit] = useState<number | ''>('');

  useEffect(() => {
    if (existingLane) {
      setLaneTitle(existingLane.title || '');
      setSelectedColor(existingLane.color || LANE_COLORS[2]);
      setObjective(existingLane.objective || '');
      setWipLimitEnabled(existingLane.wipLimitEnabled || false);
      setWipLimit(existingLane.wipLimit || '');
    } else {
      // Reset form for new lane
      setLaneTitle('');
      setSelectedColor(LANE_COLORS[2]);
      setObjective('');
      setWipLimitEnabled(false);
      setWipLimit('');
    }
  }, [existingLane, open]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!laneTitle.trim()) {
      return;
    }

    // Prevent duplicate submissions
    if (isSubmitting) {
      console.warn('Lane submission already in progress');
      return;
    }

    setIsSubmitting(true);

    try {
      const laneData: Partial<WorkflowLane> = {
        projectId,
        title: laneTitle.trim(),
        color: selectedColor,
        objective: objective.trim() || undefined,
        wipLimitEnabled,
        wipLimit: wipLimitEnabled && wipLimit ? Number(wipLimit) : undefined,
        statusValue: existingLane?.statusValue || `custom_lane_${Date.now()}`,
      };

      await onSubmit(laneData);
      // Don't close here - let the parent handle closing after successful mutation
    } catch (error) {
      // Error is handled by parent, but don't close modal on error
      console.error('Error in lane submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setLaneTitle('');
    setSelectedColor(LANE_COLORS[2]);
    setObjective('');
    setWipLimitEnabled(false);
    setWipLimit('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <DialogTitle className="text-lg font-semibold">
              Workflow Lane Configuration
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Lane Title Section */}
          <div className="space-y-2">
            <Label htmlFor="lane-title" className="text-sm font-medium">
              Lane Title
            </Label>
            <p className="text-xs text-gray-500">
              Write down a title to identify the lane. It get displayed in the header.
            </p>
            <Input
              id="lane-title"
              placeholder="New Lane"
              value={laneTitle}
              onChange={(e) => setLaneTitle(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Lane Color Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Lane Color</Label>
            <p className="text-xs text-gray-500">
              Choose appropriate lane color to identify it. It get displayed as the header background color.
            </p>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {LANE_COLORS.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center mx-auto ${
                    selectedColor === color
                      ? 'border-gray-800 scale-110 shadow-lg'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                >
                  {selectedColor === color && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Lane Objective Section */}
          <div className="space-y-2">
            <Label htmlFor="lane-objective" className="text-sm font-medium">
              Lane Objective
            </Label>
            <p className="text-xs text-gray-500">
              Write down few words to help your teams to effectively execute any item in/out of this lane.
            </p>
            <Textarea
              id="lane-objective"
              placeholder="Describe lane objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full min-h-[80px]"
              rows={3}
            />
          </div>

          {/* WIP Limit Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">WIP Limit</Label>
            <p className="text-xs text-gray-500">
              Set WIP limit to alert user when more items are placed in the lane. For ex. If you set WIP limit to 5 items, then if more than 5 items are dropped within a lane, background color is automatically changed to red to alert team.
            </p>
            <RadioGroup
              value={wipLimitEnabled ? 'enabled' : 'disabled'}
              onValueChange={(value) => setWipLimitEnabled(value === 'enabled')}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="disabled" id="wip-disabled" />
                <Label htmlFor="wip-disabled" className="text-sm font-normal cursor-pointer">
                  Disable WIP limit
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="enabled" id="wip-enabled" />
                <Label htmlFor="wip-enabled" className="text-sm font-normal cursor-pointer">
                  Enable WIP limit
                </Label>
              </div>
            </RadioGroup>
            {wipLimitEnabled && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="wip-limit" className="text-sm font-medium">
                  Maximum items allowed in this lane
                </Label>
                <Input
                  id="wip-limit"
                  type="number"
                  min="1"
                  placeholder="e.g., 5"
                  value={wipLimit}
                  onChange={(e) => {
                    const value = e.target.value;
                    setWipLimit(value === '' ? '' : Number(value));
                  }}
                  className="w-full max-w-xs"
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!laneTitle.trim() || isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {existingLane ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                'Done'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LaneConfigurationModal;
