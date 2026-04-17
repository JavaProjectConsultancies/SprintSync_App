import { apiClient, ApiResponse } from './client';
import { format } from 'date-fns';

export interface LoginActivityLog {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string;
  loginTime: string;
  createdAt: string;
}

export const loginActivityApi = {
  /**
   * Fetch login activity logs, optionally filtered by date.
   * Requires admin or master_admin role.
   */
  getLogs: (date?: Date): Promise<ApiResponse<LoginActivityLog[]>> => {
    const url = date 
      ? `/login-activity-logs?date=${format(date, 'yyyy-MM-dd')}` 
      : '/login-activity-logs';
    return apiClient.get<LoginActivityLog[]>(url);
  },

  /**
   * Export login activity logs to Excel for a specific date.
   */
  exportLogsExcel: async (date?: Date): Promise<void> => {
    const params = date ? { date: format(date, 'yyyy-MM-dd') } : {};
    
    try {
      const blob = await apiClient.download('/login-activity-logs/export', params);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `login_logs_${date ? format(date, 'yyyy-MM-dd') : 'all'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
};
