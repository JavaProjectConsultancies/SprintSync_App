import React from 'react';
import { useRoleSwitcher, SwitchableRole } from '../contexts/RoleSwitcherContext';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Users, Shield, Code, Lock } from 'lucide-react';
import { cn } from './ui/utils';

interface RoleSwitcherDropdownProps {
    /** Optional project ID to filter available roles */
    projectId?: string;
    /** Callback when role changes */
    onRoleChange?: (role: SwitchableRole) => void;
    /** Additional CSS classes */
    className?: string;
    /** Show compact version */
    compact?: boolean;
}

/**
 * Role switcher dropdown component for pages
 * Shows available roles based on user's project membership
 */
const RoleSwitcherDropdown: React.FC<RoleSwitcherDropdownProps> = ({
    projectId,
    onRoleChange,
    className,
    compact = false
}) => {
    const { user } = useAuth();
    const {
        activeRole,
        projectAvailableRoles,
        availableRoles,
        switchRole,
        getRoleForProject,
        canUseRoleInProject,
        setSelectedProject,
        isLoading
    } = useRoleSwitcher();

    // If master_admin, show Master_admin View badge (view-only access)
    if (user?.role === 'master_admin') {
        return (
            <Badge variant="outline" className={cn("bg-violet-50 text-violet-700 border-violet-200", className)}>
                <Shield className="w-3 h-3 mr-1" />
                Master_admin View
            </Badge>
        );
    }

    // If admin, don't show role switcher - they have full access
    if (user?.role === 'admin') {
        return (
            <Badge variant="outline" className={cn("bg-purple-50 text-purple-700 border-purple-200", className)}>
                <Shield className="w-3 h-3 mr-1" />
                Admin
            </Badge>
        );
    }

    // Sync selected project when projectId prop changes
    React.useEffect(() => {
        if (projectId) {
            setSelectedProject(projectId);
        }
    }, [projectId, setSelectedProject]);

    // Get roles available for this context
    const rolesForDropdown = projectId ? projectAvailableRoles : availableRoles;

    // Only one role available - show as badge instead of dropdown
    if (rolesForDropdown.length <= 1) {
        const role = rolesForDropdown[0] || 'developer';
        const Icon = role === 'manager' ? Users : Code;
        return (
            <Badge
                variant="outline"
                className={cn(
                    role === 'manager'
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-green-50 text-green-700 border-green-200",
                    className
                )}
            >
                <Icon className="w-3 h-3 mr-1" />
                {role === 'manager' ? 'Manager View' : 'Developer View'}
            </Badge>
        );
    }

    const handleRoleChange = (value: string) => {
        const newRole = value as SwitchableRole;

        // Check if role is valid for project
        if (projectId && !canUseRoleInProject(newRole, projectId)) {
            return;
        }

        switchRole(newRole);
        onRoleChange?.(newRole);
    };

    const getRoleIcon = (role: SwitchableRole) => {
        return role === 'manager' ? Users : Code;
    };

    const getRoleLabel = (role: SwitchableRole) => {
        return role === 'manager' ? 'Manager View' : 'Developer View';
    };

    const getRoleColor = (role: SwitchableRole) => {
        return role === 'manager'
            ? 'text-blue-600'
            : 'text-green-600';
    };

    if (isLoading) {
        return (
            <Badge variant="outline" className={cn("bg-gray-50 text-gray-500", className)}>
                Loading...
            </Badge>
        );
    }

    const ActiveIcon = getRoleIcon(activeRole);

    return (
        <Select value={activeRole} onValueChange={handleRoleChange}>
            <SelectTrigger
                className={cn(
                    "h-9 bg-white shadow-sm border-gray-200 focus:ring-blue-500",
                    compact ? "w-[140px]" : "w-[180px]",
                    className
                )}
            >
                <div className="flex items-center gap-2">
                    <ActiveIcon className={cn("w-4 h-4", getRoleColor(activeRole))} />
                    <SelectValue placeholder="Select Role">
                        {compact ? (activeRole === 'manager' ? 'Manager' : 'Developer') : getRoleLabel(activeRole)}
                    </SelectValue>
                </div>
            </SelectTrigger>
            <SelectContent>
                {(['developer', 'manager'] as SwitchableRole[]).map(role => {
                    const Icon = getRoleIcon(role);
                    const isAvailable = rolesForDropdown.includes(role);
                    const isDisabled = projectId ? !canUseRoleInProject(role, projectId) : !isAvailable;

                    return (
                        <SelectItem
                            key={role}
                            value={role}
                            disabled={isDisabled}
                            className={cn(
                                "flex items-center gap-2",
                                isDisabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <div className="flex items-center gap-2 w-full">
                                <Icon className={cn("w-4 h-4", getRoleColor(role))} />
                                <span>{getRoleLabel(role)}</span>
                                {isDisabled && (
                                    <Lock className="w-3 h-3 ml-auto text-gray-400" />
                                )}
                            </div>
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
};

export default RoleSwitcherDropdown;
