export const getPriorityColor = (priority: string) => {
  switch (priority?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DONE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'QA_REVIEW': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'TO_DO': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
