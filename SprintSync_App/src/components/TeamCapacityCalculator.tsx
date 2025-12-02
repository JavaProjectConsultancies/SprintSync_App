import React, { useState, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calculator, Users, Clock, Calendar, AlertCircle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  allocation: 'full' | 'part';
  hoursPerDay: number;
  availabilityDays: number;
}

interface TeamCapacityCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCalculate: (capacity: number) => void;
  initialCapacity?: number;
}

const TeamCapacityCalculator: React.FC<TeamCapacityCalculatorProps> = ({
  open,
  onOpenChange,
  onCalculate,
  initialCapacity,
}) => {
  const [teamSize, setTeamSize] = useState(5);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sprintDuration, setSprintDuration] = useState(2); // weeks
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState(5);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [bankHolidays, setBankHolidays] = useState(1);
  const [individualAvailabilityDays, setIndividualAvailabilityDays] = useState(0);

  // Initialize team members when team size changes
  React.useEffect(() => {
    if (teamMembers.length === 0 && teamSize > 0) {
      const newMembers: TeamMember[] = Array.from({ length: teamSize }, (_, i) => ({
        id: `member-${i}`,
        name: `Developer ${i + 1}`,
        allocation: 'full' as const,
        hoursPerDay: 8,
        availabilityDays: 0,
      }));
      setTeamMembers(newMembers);
    } else if (teamMembers.length !== teamSize) {
      if (teamMembers.length < teamSize) {
        // Add new members
        const newMembers: TeamMember[] = Array.from(
          { length: teamSize - teamMembers.length },
          (_, i) => ({
            id: `member-${teamMembers.length + i}`,
            name: `Developer ${teamMembers.length + i + 1}`,
            allocation: 'full' as const,
            hoursPerDay: 8,
            availabilityDays: 0,
          })
        );
        setTeamMembers([...teamMembers, ...newMembers]);
      } else {
        // Remove excess members
        setTeamMembers(teamMembers.slice(0, teamSize));
      }
    }
  }, [teamSize, teamMembers.length]);

  // Calculate capacity
  const capacityResult = useMemo(() => {
    // Step 1: Calculate Daily Capacity
    const fullTimeMembers = teamMembers.filter((m) => m.allocation === 'full');
    const partTimeMembers = teamMembers.filter((m) => m.allocation === 'part');

    const fullTimeDailyCapacity = fullTimeMembers.length * hoursPerDay;
    const partTimeDailyCapacity = partTimeMembers.reduce(
      (sum, m) => sum + m.hoursPerDay,
      0
    );
    const totalDailyCapacity = fullTimeDailyCapacity + partTimeDailyCapacity;

    // Step 2: Calculate raw sprint capacity
    const totalWorkingDays = sprintDuration * workingDaysPerWeek;
    const rawSprintCapacity = totalDailyCapacity * totalWorkingDays;

    // Step 3: Account for individual availability & bank holidays
    const totalIndividualAvailabilityDays = teamMembers.reduce(
      (sum, m) => sum + m.availabilityDays,
      0
    );
    const individualAvailabilityHours = totalIndividualAvailabilityDays * hoursPerDay;
    const bankHolidayHours = bankHolidays * totalDailyCapacity;
    const totalDeductions = individualAvailabilityHours + bankHolidayHours;

    // Final result
    const finalCapacity = Math.max(0, rawSprintCapacity - totalDeductions);

    return {
      dailyCapacity: totalDailyCapacity,
      fullTimeDaily: fullTimeDailyCapacity,
      partTimeDaily: partTimeDailyCapacity,
      rawSprintCapacity,
      totalWorkingDays,
      individualAvailabilityHours,
      bankHolidayHours,
      totalDeductions,
      finalCapacity,
    };
  }, [teamMembers, sprintDuration, workingDaysPerWeek, hoursPerDay, bankHolidays]);

  const handleMemberChange = (id: string, field: keyof TeamMember, value: any) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleApply = () => {
    onCalculate(capacityResult.finalCapacity);
    onOpenChange(false);
  };

  const handleReset = () => {
    setTeamSize(5);
    setSprintDuration(2);
    setWorkingDaysPerWeek(5);
    setHoursPerDay(8);
    setBankHolidays(1);
    setIndividualAvailabilityDays(0);
    setTeamMembers([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Team Capacity Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate your team's sprint capacity based on team size, allocation, availability, and sprint duration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 px-6 overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Size */}
            <div className="space-y-2">
              <Label htmlFor="teamSize" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team Size (Number of Developers)
              </Label>
              <Input
                id="teamSize"
                type="number"
                min="1"
                value={teamSize}
                onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            {/* Sprint Duration */}
            <div className="space-y-2">
              <Label htmlFor="sprintDuration" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Sprint Duration (Weeks)
              </Label>
              <Input
                id="sprintDuration"
                type="number"
                min="1"
                value={sprintDuration}
                onChange={(e) => setSprintDuration(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            {/* Working Days Per Week */}
            <div className="space-y-2">
              <Label htmlFor="workingDays">Working Days Per Week</Label>
              <Input
                id="workingDays"
                type="number"
                min="1"
                max="7"
                value={workingDaysPerWeek}
                onChange={(e) => setWorkingDaysPerWeek(Math.max(1, Math.min(7, parseInt(e.target.value) || 5)))}
              />
            </div>

            {/* Hours Per Day */}
            <div className="space-y-2">
              <Label htmlFor="hoursPerDay" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hours Per Day (Unit: Hours)
              </Label>
              <Input
                id="hoursPerDay"
                type="number"
                min="1"
                max="24"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Math.max(1, Math.min(24, parseInt(e.target.value) || 8)))}
              />
            </div>

            {/* Bank Holidays */}
            <div className="space-y-2">
              <Label htmlFor="bankHolidays">External Distractors (Bank Holidays)</Label>
              <Input
                id="bankHolidays"
                type="number"
                min="0"
                value={bankHolidays}
                onChange={(e) => setBankHolidays(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>

          {/* Team Members Allocation */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Team Member Allocation & Availability</Label>
            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4">
              {teamMembers.map((member, index) => (
                <div key={member.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={member.name}
                      onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                      placeholder={`Developer ${index + 1}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Allocation</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={member.allocation}
                      onChange={(e) =>
                        handleMemberChange(member.id, 'allocation', e.target.value as 'full' | 'part')
                      }
                    >
                      <option value="full">Full Time</option>
                      <option value="part">Part Time</option>
                    </select>
                  </div>
                  {member.allocation === 'part' && (
                    <div className="space-y-1">
                      <Label className="text-xs">Hours Per Day</Label>
                      <Input
                        type="number"
                        min="1"
                        max="8"
                        value={member.hoursPerDay}
                        onChange={(e) =>
                          handleMemberChange(member.id, 'hoursPerDay', Math.max(1, Math.min(8, parseInt(e.target.value) || 4)))
                        }
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Availability Days (Holidays/Training/Sick Leave)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={member.availabilityDays}
                      onChange={(e) =>
                        handleMemberChange(member.id, 'availabilityDays', Math.max(0, parseInt(e.target.value) || 0))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculation Results */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Calculation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Daily Capacity */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Step 1: Calculate Daily Capacity</h4>
                <div className="pl-4 space-y-1 text-sm">
                  <div>
                    Full Time Members: {teamMembers.filter((m) => m.allocation === 'full').length} × {hoursPerDay} hrs ={' '}
                    <span className="font-semibold">{capacityResult.fullTimeDaily} hrs</span>
                  </div>
                  {teamMembers.filter((m) => m.allocation === 'part').length > 0 && (
                    <div>
                      Part Time Members: {teamMembers.filter((m) => m.allocation === 'part').reduce((sum, m) => sum + m.hoursPerDay, 0)} hrs
                    </div>
                  )}
                  <div className="font-semibold text-base pt-1">
                    Total Daily Capacity: {capacityResult.dailyCapacity} hrs/day
                  </div>
                </div>
              </div>

              {/* Step 2: Raw Sprint Capacity */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Step 2: Calculate Raw Sprint Capacity</h4>
                <div className="pl-4 text-sm">
                  <div>
                    {capacityResult.dailyCapacity} hrs/day × {capacityResult.totalWorkingDays} days ={' '}
                    <span className="font-semibold">{capacityResult.rawSprintCapacity} hours</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Account for Availability & Holidays */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Step 3: Account for Individual Availability & Bank Holidays</h4>
                <div className="pl-4 space-y-1 text-sm">
                  <div>
                    Individual Availability: {capacityResult.individualAvailabilityHours} hours
                  </div>
                  <div>
                    Bank Holidays: {bankHolidays} days × {capacityResult.dailyCapacity} hrs ={' '}
                    {capacityResult.bankHolidayHours} hours
                  </div>
                  <div className="font-semibold">
                    Total Deductions: {capacityResult.totalDeductions} hours
                  </div>
                </div>
              </div>

              {/* Final Result */}
              <div className="pt-4 border-t border-blue-300">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg">Final Sprint Capacity:</h4>
                  <div className="text-2xl font-bold text-blue-700">
                    {capacityResult.finalCapacity.toFixed(0)} Hours
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {capacityResult.rawSprintCapacity} - {capacityResult.totalDeductions} = {capacityResult.finalCapacity.toFixed(0)} hours
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0 bg-background !flex !flex-row !justify-end gap-2 shadow-lg">
          <Button variant="outline" onClick={handleReset} type="button">
            Reset
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button onClick={handleApply} type="button" className="bg-green-600 hover:bg-green-700 text-white">
            Apply Capacity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamCapacityCalculator;

