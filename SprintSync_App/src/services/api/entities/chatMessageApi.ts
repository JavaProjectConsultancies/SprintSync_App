import apiClient from '../client';
import { ChatMessage } from '../../../types/api';

const BASE_URL = '/chats';

export const chatMessageApiService = {
    /**
     * Get all chat messages for a specific entity.
     */
    getMessages: (entityType: string, entityId: string) =>
        apiClient.get<ChatMessage[]>(`${BASE_URL}/${entityType}/${entityId}`),

    /**
     * Post a new chat message.
     */
    postMessage: (message: Partial<ChatMessage>) =>
        apiClient.post<ChatMessage>(BASE_URL, message),
};
