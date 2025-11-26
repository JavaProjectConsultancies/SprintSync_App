import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { useUser } from '../hooks/api/useUsers';
import { useDepartments } from '../hooks/api/useDepartments';
import { useDomains } from '../hooks/api/useDomains';
import {
  Mail,
  Shield,
  Building,
  Globe,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  IndianRupee,
  Percent,
  UserCheck,
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  EXPERIENCE_LEVEL_LABELS,
  ExperienceLevelCode,
  getExperienceLabel,
  normalizeExperienceValue,
} from '../hooks/api/useExperienceLevels';

const EXPERIENCE_LEVEL_COLORS: Record<ExperienceLevelCode, string> = {
  E1: 'bg-green-100 text-green-800 border-green-200',
  E2: 'bg-green-100 text-green-800 border-green-200',
  M1: 'bg-blue-100 text-blue-800 border-blue-200',
  M2: 'bg-blue-100 text-blue-800 border-blue-200',
  M3: 'bg-blue-100 text-blue-800 border-blue-200',
  L1: 'bg-purple-100 text-purple-800 border-purple-200',
  L2: 'bg-purple-100 text-purple-800 border-purple-200',
  L3: 'bg-purple-100 text-purple-800 border-purple-200',
  S1: 'bg-red-100 text-red-800 border-red-200',
};

const isExperienceLevelCode = (value: string): value is ExperienceLevelCode =>
  value in EXPERIENCE_LEVEL_COLORS;

const getExperienceBadgeClass = (experience?: string | null): string => {
  const normalized = normalizeExperienceValue(experience || undefined);
  if (normalized && isExperienceLevelCode(normalized)) {
    return EXPERIENCE_LEVEL_COLORS[normalized];
  }
  return 'bg-gray-100 text-gray-800 border-gray-200';
};

const getExperienceDisplayLabel = (experience?: string | null): string => {
  if (!experience) return 'Not Set';
  const normalized = normalizeExperienceValue(experience);
  if (normalized && isExperienceLevelCode(normalized)) {
    return EXPERIENCE_LEVEL_LABELS[normalized];
  }
  return getExperienceLabel(experience);
};

const parseSkills = (skills?: string): string[] => {
  if (!skills) return [];
  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) {
      return parsed.map((skill) => `${skill}`.trim()).filter(Boolean);
    }
  } catch (_) {
    // ignore
  }
  return skills
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.replace(/^"|"$|'/g, '').trim())
    .filter(Boolean);
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateOnly = (dateString?: string) => {
  if (!dateString) return 'Not Set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatRelativeTime = (dateInput?: string | number | Date) => {
  if (!dateInput) return 'Not available';
  const timestamp = new Date(dateInput).getTime();
  if (Number.isNaN(timestamp)) return 'Not available';
  const diff = Date.now() - timestamp;
  if (diff < 0) return 'In the future';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
};

const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

const getRoleColor = (role?: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'manager':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'developer':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'designer':
    case 'qa':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

type SectionItem = {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
};

type InfoSection = {
  key: string;
  title: string;
  description: string;
  items: SectionItem[];
};

type HighlightStat = {
  label: string;
  value: string;
  icon: LucideIcon;
  detail?: string;
  progress?: number;
};

const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const userId = authUser?.id || '';
  const { data: userData, loading: userLoading, error: userError, refetch } = useUser(userId);
  const { data: departmentsData } = useDepartments();
  const { data: domainsData } = useDomains();

  const departments = Array.isArray(departmentsData) ? departmentsData : [];
  const domains = Array.isArray(domainsData) ? domainsData : [];

  const profile = userData as any;

  const getDepartmentName = useMemo(
    () => (id?: string) => {
      if (!id) return 'No Department Assigned';
      const dept = departments.find((d) => d.id === id);
      return dept?.name || 'Unknown Department';
    },
    [departments]
  );

  const getDomainName = useMemo(
    () => (id?: string) => {
      if (!id) return 'No Domain Assigned';
      const domain = domains.find((d) => d.id === id);
      return domain?.name || 'Unknown Domain';
    },
    [domains]
  );

  const userName = profile?.name || authUser?.name || 'User';
  const role = profile?.role || authUser?.role || 'user';
  const roleLabel = role?.replace('_', ' ') || 'Role not set';
  const roleDisplay = roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1);
  const department = getDepartmentName(profile?.departmentId);
  const domain = getDomainName(profile?.domainId);
  const reportingManager = profile?.reportingManager || 'Not Set';
  const dateOfJoining = formatDateOnly(profile?.dateOfJoining || profile?.createdAt);
  const authAvailability = (authUser as Record<string, any> | null)?.availabilityPercentage;
  const availability = profile?.availabilityPercentage ?? authAvailability ?? '100';
  const hourlyRate =
    profile?.hourlyRate != null ? Number(profile.hourlyRate).toFixed(2) : undefined;
  const ctc =
    profile?.ctc != null
      ? Number(profile.ctc).toLocaleString('en-IN', { maximumFractionDigits: 2 })
      : undefined;
  const skills = parseSkills(profile?.skills);
  const isActive = profile?.isActive !== false;
  const joiningDateRaw = profile?.dateOfJoining || profile?.createdAt;
  const joiningDate = joiningDateRaw ? new Date(joiningDateRaw) : undefined;
  const tenureDays = joiningDate ? Math.max(Math.round((Date.now() - joiningDate.getTime()) / 86400000), 0) : undefined;
  const tenureDisplay = tenureDays
    ? tenureDays >= 365
      ? `${(tenureDays / 365).toFixed(1)} yrs`
      : tenureDays >= 30
        ? `${Math.floor(tenureDays / 30)} mos`
        : `${tenureDays} days`
    : 'Not Set';
  const availabilityNumeric = Number(availability) || 0;
  const normalizedAvailability = Math.max(0, Math.min(Math.round(availabilityNumeric), 150));
  const availabilityFill = Math.max(0, Math.min(normalizedAvailability, 100));
  const availabilityState =
    normalizedAvailability >= 100
      ? 'Fully allocated'
      : normalizedAvailability >= 80
        ? 'Mostly booked'
        : 'Space available';
  const lastLoginRelative = formatRelativeTime(profile?.lastLogin);
  const lastUpdatedRelative = formatRelativeTime(profile?.updatedAt);
  const createdRelative = formatRelativeTime(profile?.createdAt);
  const heroMetaDetails = [
    {
      key: 'email',
      icon: Mail,
      text: profile?.email || authUser?.email || 'No email on file',
    },
    {
      key: 'joined',
      icon: Calendar,
      text: `Joined ${dateOfJoining}`,
    },
    {
      key: 'manager',
      icon: Briefcase,
      text: `Reports to ${reportingManager}`,
    },
  ];
  const accountStatusBadge = (
    <Badge
      variant="outline"
      className={
        isActive
          ? 'bg-green-100 text-green-800 border-green-200'
          : 'bg-red-100 text-red-800 border-red-200'
      }
    >
      {isActive ? (
        <>
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </>
      ) : (
        <>
          <XCircle className="w-[14px] h-[14px] mr-1" />
          Inactive
        </>
      )}
    </Badge>
  );
  const highlightStats: HighlightStat[] = [
    {
      label: 'Experience Level',
      value: getExperienceDisplayLabel(profile?.experience),
      icon: Briefcase,
      detail: profile?.experience ? 'Based on HR ladder' : 'Set via admin portal',
    },
    {
      label: 'Availability',
      value: `${normalizedAvailability}%`,
      icon: Percent,
      detail: availabilityState,
      progress: availabilityFill,
    },
    {
      label: 'Last Active',
      value: profile?.lastLogin ? lastLoginRelative : 'Never',
      icon: Clock,
      detail: profile?.lastLogin ? formatDateTime(profile?.lastLogin) : 'No login recorded',
    },
    {
      label: 'Tenure',
      value: tenureDisplay,
      icon: Calendar,
      detail: joiningDateRaw ? `Since ${formatDateOnly(joiningDateRaw)}` : 'Awaiting start date',
    },
  ];
  const timelineEvents = [
    {
      key: 'created',
      title: 'Account created',
      description: 'Invited to SprintSync workspace',
      date: profile?.createdAt ? formatDateTime(profile?.createdAt) : 'Not captured',
      meta: createdRelative,
    },
    {
      key: 'joined',
      title: 'Joined department',
      description: department,
      date: joiningDateRaw ? formatDateTime(joiningDateRaw) : 'Not set',
      meta: joiningDateRaw ? formatRelativeTime(joiningDateRaw) : '—',
    },
    {
      key: 'login',
      title: 'Last login',
      description: 'Most recent secure session',
      date: profile?.lastLogin ? formatDateTime(profile?.lastLogin) : 'Never logged in',
      meta: lastLoginRelative,
    },
    {
      key: 'updated',
      title: 'Profile updated',
      description: 'Latest change synced from HR/Admin',
      date: profile?.updatedAt ? formatDateTime(profile?.updatedAt) : 'Not captured',
      meta: lastUpdatedRelative,
    },
  ];
  const infoSections: InfoSection[] = [
    {
      key: 'contact',
      title: 'Contact & Access',
      description: 'Primary touchpoints and login telemetry.',
      items: [
        {
          icon: Mail,
          label: 'Email',
          value: profile?.email || authUser?.email || 'Not provided',
          hint: 'Read-only source of truth',
        },
        {
          icon: Shield,
          label: 'Role',
          value: (
            <Badge variant="outline" className={getRoleColor(role)}>
              {role?.toUpperCase()}
            </Badge>
          ),
          hint: roleLabel,
        },
        {
          icon: Clock,
          label: 'Last Login',
          value: profile?.lastLogin ? formatDateTime(profile?.lastLogin) : 'Never logged in',
          hint: lastLoginRelative,
        },
      ],
    },
    {
      key: 'org',
      title: 'Organization Placement',
      description: 'Where you sit inside SprintSync.',
      items: [
        {
          icon: Building,
          label: 'Department',
          value: department,
        },
        {
          icon: Globe,
          label: 'Domain',
          value: domain,
        },
        {
          icon: UserIcon,
          label: 'Account Status',
          value: accountStatusBadge,
          hint: isActive ? 'Visible in active rosters' : 'Hidden from staffing views',
        },
      ],
    },
    {
      key: 'reporting',
      title: 'Reporting & Journey',
      description: 'People flow and onboarding timeline.',
      items: [
        {
          icon: UserCheck,
          label: 'Reporting Manager',
          value: reportingManager,
        },
        {
          icon: Calendar,
          label: 'Date of Joining',
          value: dateOfJoining,
        },
        {
          icon: Calendar,
          label: 'Tenure',
          value: tenureDisplay,
          hint: joiningDateRaw ? formatRelativeTime(joiningDateRaw) : undefined,
        },
      ],
    },
    {
      key: 'professional',
      title: 'Professional Snapshot',
      description: 'Experience, compensation, and working capacity.',
      items: [
        {
          icon: Briefcase,
          label: 'Experience',
          value: (
            <Badge className={`${getExperienceBadgeClass(profile?.experience)} border`}>
              {getExperienceDisplayLabel(profile?.experience)}
            </Badge>
          ),
          hint: profile?.experience ? 'HR ladder aligned' : 'Not configured',
        },
        {
          icon: IndianRupee,
          label: 'Hourly Rate',
          value: hourlyRate ? `₹${hourlyRate}` : 'Not Set',
          hint: hourlyRate ? 'Billable (INR)' : 'Coordinate with admin',
        },
        {
          icon: IndianRupee,
          label: 'CTC',
          value: ctc ? `₹${ctc}` : 'Not Set',
          hint: ctc ? 'Annualized (INR)' : undefined,
        },
        {
          icon: Percent,
          label: 'Availability',
          value: (
            <div className="space-y-2">
              <span className="text-lg font-semibold">{normalizedAvailability}%</span>
              <div className="availability-bar">
                <span style={{ width: `${availabilityFill}%` }} />
              </div>
            </div>
          ),
          hint: availabilityState,
        },
      ],
    },
  ];

  if (!authUser) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Please sign in to view your profile information.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-destructive">Error loading profile data</p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="profile-page space-y-10 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-foreground">My Profile</h1>
        <div className="h-2" />
      </div>

      <section className="profile-hero rounded-3xl p-6 md:p-8 text-white shadow-2xl mb-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-28 w-28 border-4 border-white/30 shadow-xl">
                <AvatarImage src={profile?.avatarUrl} alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-white/20 to-white/5 text-2xl text-white">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold">{userName}</h2>
                  <Badge
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white"
                  >
                    {roleDisplay}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white"
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-[14px] h-[14px] mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-white/90 text-base">
                  {roleLabel} • {department}
                </p>
                <div className="hero-meta-row">
                  {heroMetaDetails.map((item, index) => (
                    <React.Fragment key={item.key}>
                      {index > 0 && <span className="hero-meta-divider" />}
                      <span className="hero-meta-item">
                        <item.icon className="h-4 w-4 opacity-80" />
                        {item.text}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-xs uppercase tracking-wide text-white/80">
                  <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                    {domain}
                  </Badge>
                  <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                    {department}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 lg:w-1/2">
              <div className="grid gap-4 sm:grid-cols-2">
                {highlightStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/25 bg-white/10 p-4 shadow-lg backdrop-blur-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white">
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/70">{stat.label}</p>
                        <p className="text-xl font-semibold">{stat.value}</p>
                      </div>
                    </div>
                    {typeof stat.progress === 'number' && (
                      <div className="mt-3 h-1.5 w-full rounded-full bg-white/30">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${stat.progress}%` }}
                        />
                      </div>
                    )}
                    {stat.detail && <p className="mt-2 text-xs text-white/80">{stat.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="profile-grid gap-y-10">
        {infoSections.map((section) => (
          <Card key={section.key} className="glass-panel profile-section-card text-center">
            <CardHeader className="px-7 pt-6 pb-2 space-y-2">
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-7 pb-7 pt-1">
              {section.items.map((item) => (
                <div key={item.label} className="profile-info-row">
                  <span className="info-icon">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div className="profile-info-text">
                    <p className="profile-info-label">{item.label}</p>
                    <div className="profile-info-value">{item.value}</div>
                    {item.hint && <p className="profile-info-hint">{item.hint}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card className="glass-panel profile-section-card skill-stack-card text-center">
          <CardHeader className="px-7 pt-6 pb-2 space-y-2">
            <CardTitle>Skill Stack</CardTitle>
            <CardDescription>Self-reported technical strengths.</CardDescription>
          </CardHeader>
          <CardContent className="px-7 pb-6 pt-1">
            {skills.length > 0 ? (
              <div className="skill-stack-list">
                {skills.map((skill, index) => (
                  <Badge
                    key={`${skill}-${index}`}
                    variant="outline"
                    className="skill-stack-badge"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No skills listed yet. Ask your admin to capture your top competencies.
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ProfilePage;