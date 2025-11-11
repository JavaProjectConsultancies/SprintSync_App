import apiClient from '../client';
import { Notification } from '../../../types/api';

const BASE_URL = '/notifications';

export const notificationApiService = {
  // Get all notifications for a user
  getNotificationsByUserId: (userId: string) =>
    apiClient.get<Notification[]>(`${BASE_URL}/user/${userId}`),

  // Get unread notifications for a user
  getUnreadNotificationsByUserId: (userId: string) =>
    apiClient.get<Notification[]>(`${BASE_URL}/user/${userId}/unread`),

  // Get unread count for a user
  getUnreadCount: (userId: string) =>
    apiClient.get<{ count: number }>(`${BASE_URL}/user/${userId}/unread-count`),

  // Get notification by ID
  getNotificationById: (id: string) =>
    apiClient.get<Notification>(`${BASE_URL}/${id}`),

  // Mark notification as read
  markAsRead: (id: string) =>
    apiClient.patch<Notification>(`${BASE_URL}/${id}/read`),

  // Mark all notifications as read for a user
  markAllAsRead: (userId: string) =>
    apiClient.patch<{ success: boolean; message: string }>(`${BASE_URL}/user/${userId}/read-all`),

  // Create a notification
  createNotification: (notification: {
    userId: string;
    title: string;
    message: string;
    type: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) =>
    apiClient.post<Notification>(BASE_URL, notification),

  // Delete notification
  deleteNotification: (id: string) =>
    apiClient.delete<void>(`${BASE_URL}/${id}`),
};

