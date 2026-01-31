import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { chatMessageApiService } from '../services/api/entities/chatMessageApi';
import { userApiService } from '../services/api/entities/userApi';
import { teamMemberApi } from '../services/api/entities/teamMemberApi';
import { notificationApiService } from '../services/api/entities/notificationApi';
import { ChatMessage, User } from '../types/api';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send, Loader2, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ChatSectionProps {
    entityId: string;
    entityType: 'task' | 'issue';
    projectId?: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({ entityId, entityType, projectId }) => {
    const { user: currentUser } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [mentionSearch, setMentionSearch] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionIndex, setMentionIndex] = useState(-1);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMessages();
        if (projectId) {
            fetchProjectUsers();
        } else {
            fetchAllUsers();
        }
        // Set up polling for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [entityId, entityType, projectId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await chatMessageApiService.getMessages(entityType, entityId);
            setMessages(res.data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await userApiService.getUsers({ size: 100 });
            setAllUsers(res.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchProjectUsers = async () => {
        if (!projectId) return;
        try {
            const members = await teamMemberApi.getTeamMembersByProject(projectId);
            // Map TeamMember to User-like object for consistent usage in the mention list
            const mappedUsers = members.map(m => ({
                id: m.userId || m.id,
                name: m.name,
                role: m.role,
                avatarUrl: m.avatarUrl || m.avatar
            } as any as User));
            setAllUsers(mappedUsers);
        } catch (error) {
            console.error('Error fetching project members:', error);
            fetchAllUsers(); // Fallback to all users if project-specific fails
        }
    };

    const handleMarkAsRead = async () => {
        if (!currentUser?.id) return;
        try {
            // Mark all notifications for this entity as read
            const unreadRes = await notificationApiService.getUnreadNotificationsByUserId(currentUser.id);
            const allUnread = Array.isArray(unreadRes.data)
                ? unreadRes.data
                : ((unreadRes.data as any)?.data || (unreadRes.data as any)?.content || []);

            const entityMentions = allUnread.filter((n: any) => {
                const type = (n.type || '').toUpperCase();
                const relType = (n.relatedEntityType || '').toUpperCase();
                return (type === 'MENTION' || type === 'TEAM_MENTION') &&
                    String(n.relatedEntityId) === String(entityId) &&
                    relType === entityType.toUpperCase();
            });

            for (const mention of entityMentions) {
                await notificationApiService.markAsRead(mention.id);
            }

            if (entityMentions.length > 0) {
                toast.success('Mentions marked as read');
                fetchMessages(); // Refresh to ensure UI stays in sync if needed
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        setSending(true);
        try {
            const messageData: Partial<ChatMessage> = {
                senderId: currentUser.id || (currentUser as any).userId,
                senderName: currentUser.name || (currentUser as any).fullName || 'Unknown User',
                entityId,
                entityType,
                message: newMessage.trim(),
            };
            await chatMessageApiService.postMessage(messageData);

            // Detect and send mention notifications
            const uniqueMentionedUsers = allUsers.filter(u => {
                const escapedName = u.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`@${escapedName}(\\s|$)`, 'i');
                return regex.test(newMessage) && u.id !== currentUser.id;
            });

            for (const mentionUser of uniqueMentionedUsers) {
                try {
                    await notificationApiService.createNotification({
                        userId: mentionUser.id,
                        title: 'You were mentioned',
                        message: `${currentUser.name} mentioned you in a chat for ${entityType} ${entityId}`,
                        type: 'TEAM_MENTION',
                        relatedEntityType: entityType.toUpperCase(),
                        relatedEntityId: entityId
                    });
                } catch (notiError) {
                    console.error('Failed to send mention notification:', notiError);
                }
            }

            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const selectionStart = e.target.selectionStart || 0;
        setNewMessage(value);

        // Check for @ mention trigger
        const lastAtPos = value.lastIndexOf('@', selectionStart - 1);
        if (lastAtPos !== -1) {
            const textAfterAt = value.substring(lastAtPos + 1, selectionStart);
            // Only trigger if @ is at start or after space
            const charBeforeAt = lastAtPos === 0 ? '' : value[lastAtPos - 1];
            if (charBeforeAt === '' || charBeforeAt === ' ') {
                setMentionSearch(textAfterAt);
                setShowMentions(true);
                setMentionIndex(lastAtPos);
                return;
            }
        }
        setShowMentions(false);
    };

    const handleSelectMention = (user: User) => {
        const beforeMention = newMessage.substring(0, mentionIndex);
        const afterMention = newMessage.substring(inputRef.current?.selectionStart || 0);
        const updatedMessage = `${beforeMention}@${user.name} ${afterMention}`;
        setNewMessage(updatedMessage);
        setShowMentions(false);
        inputRef.current?.focus();
    };

    const renderMessageContent = (content: string) => {
        if (!content) return null;

        // Split by @mention pattern
        // We'll use names from allUsers to build a regex for specific highlights
        // or a general pattern if we want to be broader.
        // Let's use names for precision.

        let parts: (string | React.ReactNode)[] = [content];

        allUsers.forEach(u => {
            const escapedName = u.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(@${escapedName})(\\s|$)`, 'gi');

            const newParts: (string | React.ReactNode)[] = [];
            parts.forEach(part => {
                if (typeof part === 'string') {
                    const subParts = part.split(regex);
                    // split with capture groups returns [before, @Match, trailing, after]
                    // regex has 2 groups, so it returns [segment, group1, group2, nextSegment...]
                    let i = 0;
                    while (i < subParts.length) {
                        const segment = subParts[i];
                        if (segment && segment.toLowerCase().startsWith(`@${u.name.toLowerCase()}`)) {
                            newParts.push(
                                <span key={`${u.id}-${i}`} className="text-blue-500 font-bold bg-blue-50 px-1 rounded">
                                    {segment}
                                </span>
                            );
                            // If there's a trailing space/char in group 2
                            if (subParts[i + 1]) {
                                newParts.push(subParts[i + 1]);
                                i++;
                            }
                        } else if (segment) {
                            newParts.push(segment);
                        }
                        i++;
                    }
                } else {
                    newParts.push(part);
                }
            });
            parts = newParts;
        });

        return <span>{parts}</span>;
    };

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(mentionSearch.toLowerCase())
    ).slice(0, 5);

    if (loading && messages.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-[500px] border rounded-lg bg-white overflow-hidden relative">
            <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    Discussion
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAsRead}
                    className="h-8 text-[10px] text-gray-500 hover:text-primary transition-colors uppercase tracking-tight font-bold"
                >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Mark all read
                </Button>
            </div>
            <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === currentUser?.id || msg.senderId === (currentUser as any).userId;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                        <Avatar className="w-8 h-8 flex-shrink-0">
                                            <AvatarFallback className={isMe ? 'bg-primary text-primary-foreground' : 'bg-gray-200'}>
                                                {msg.senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                <span className="text-xs font-semibold text-gray-600">
                                                    {isMe ? 'You' : msg.senderName}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {format(new Date(msg.createdAt), 'HH:mm')}
                                                </span>
                                            </div>
                                            <div
                                                className={`px-3 py-2 rounded-2xl text-sm ${isMe
                                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                                    }`}
                                            >
                                                {renderMessageContent(msg.message)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {showMentions && filteredUsers.length > 0 && (
                <div className="absolute bottom-16 left-3 w-64 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="p-2 border-b bg-gray-50 text-xs font-semibold text-gray-500">
                        Mention User
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() => handleSelectMention(user)}
                            >
                                <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-[10px]">
                                        {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{user.name}</span>
                                    <span className="text-[10px] text-gray-500 capitalize">{user.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSendMessage}
                className="p-3 border-t bg-gray-50 flex items-center gap-2"
            >
                <Input
                    ref={inputRef}
                    placeholder="Type a message (use @ to mention)..."
                    value={newMessage}
                    onChange={handleInputChange}
                    disabled={sending}
                    className="flex-1 bg-white"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim() || sending}
                    className="flex-shrink-0"
                >
                    {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </Button>
            </form>
        </div>
    );
};

export default ChatSection;
