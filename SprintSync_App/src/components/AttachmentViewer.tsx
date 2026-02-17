import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Download, ExternalLink, FileText, Image, Video, Music, File, Loader2 } from 'lucide-react';
import { attachmentApiService } from '../services/api/entities/attachmentApi';

interface AttachmentViewerProps {
    isOpen: boolean;
    onClose: () => void;
    attachment: {
        id?: string;
        fileName: string;
        fileUrl: string;
        fileType?: string;
        fileSize?: number;
    } | null;
}

// Helper function to convert base64 to blob and create object URL with proper MIME type
// This ensures browsers preview files instead of downloading them
const dataUrlToBlob = (dataUrl: string, fileName?: string, fileType?: string): Blob | null => {
    try {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        let mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

        // If MIME type is generic, try to determine from file extension
        if (mime === 'application/octet-stream' && fileName) {
            const ext = fileName.toLowerCase().split('.').pop();
            const mimeMap: { [key: string]: string } = {
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'webp': 'image/webp',
                'svg': 'image/svg+xml',
                'txt': 'text/plain',
                'html': 'text/html',
                'htm': 'text/html',
                'xml': 'application/xml',
                'json': 'application/json',
                'csv': 'text/csv',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'xls': 'application/vnd.ms-excel',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'doc': 'application/msword',
                'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'ppt': 'application/vnd.ms-powerpoint',
            };
            if (ext && mimeMap[ext]) {
                mime = mimeMap[ext];
            }
        }

        // Use provided fileType if available and more specific
        if (fileType && fileType !== 'application/octet-stream') {
            mime = fileType;
        }

        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (error) {
        console.error('Error converting data URL to blob:', error);
        return null;
    }
};

// Helper function to get file icon based on type
const getFileIcon = (fileName: string, fileType?: string) => {
    const type = fileType?.toLowerCase() || '';
    const name = fileName.toLowerCase();

    if (type.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(name)) {
        return <Image className="w-12 h-12 text-blue-500" />;
    }
    if (type.includes('video') || /\.(mp4|webm|ogg|mov|avi)$/i.test(name)) {
        return <Video className="w-12 h-12 text-purple-500" />;
    }
    if (type.includes('audio') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(name)) {
        return <Music className="w-12 h-12 text-green-500" />;
    }
    if (type.includes('pdf') || name.endsWith('.pdf')) {
        return <FileText className="w-12 h-12 text-red-500" />;
    }
    if (type.includes('text') || /\.(txt|md|json|xml|csv|log)$/i.test(name)) {
        return <FileText className="w-12 h-12 text-gray-500" />;
    }
    return <File className="w-12 h-12 text-gray-400" />;
};

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
    isOpen,
    onClose,
    attachment,
}) => {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [textContent, setTextContent] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        // Clean up object URLs when component unmounts or attachment changes
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [objectUrl, previewUrl]);

    useEffect(() => {
        if (!attachment?.fileUrl) {
            setObjectUrl(null);
            setTextContent(null);
            setPreviewUrl(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setTextContent(null);
        setPreviewUrl(null);

        // If attachment has an ID, fetch via backend view endpoint to get proper headers
        if (attachment.id) {
            // Use apiClient to fetch the blob, which automatically handles Authorization headers
            console.log('[AttachmentViewer] Fetching file via authenticated API:', attachment.id);

            attachmentApiService.viewAttachment(attachment.id)
                .then(blob => {
                    console.log('[AttachmentViewer] Received blob:', {
                        type: blob.type,
                        size: blob.size,
                    });
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);
                    setObjectUrl(url);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('[AttachmentViewer] Error fetching via authenticated API:', error);
                    // Fallback to direct URL handling if API fails
                    setIsLoading(false);
                });
        }

        // Handle base64 data URLs - convert to blob URL for preview with proper MIME type
        if (attachment.fileUrl.startsWith('data:')) {
            const blob = dataUrlToBlob(attachment.fileUrl, attachment.fileName, attachment.fileType);
            if (blob) {
                const url = URL.createObjectURL(blob);
                setObjectUrl(url);
                console.log('[AttachmentViewer] Created blob URL with MIME type:', blob.type);
            }

            // Try to decode text content for text files
            const fileType = attachment.fileType?.toLowerCase() || '';
            const fileName = attachment.fileName.toLowerCase();
            if (fileType.includes('text') || /\.(txt|md|json|xml|csv|log)$/i.test(fileName)) {
                try {
                    const base64Data = attachment.fileUrl.split(',')[1];
                    const decodedText = atob(base64Data);
                    setTextContent(decodedText);
                } catch (e) {
                    console.error('Error decoding text content:', e);
                }
            }

            if (!attachment.id) {
                setIsLoading(false);
            }
        } else if (attachment.fileUrl.startsWith('http://') || attachment.fileUrl.startsWith('https://')) {
            // Regular HTTP/HTTPS URL - use directly (only if no ID)
            if (!attachment.id) {
                setObjectUrl(attachment.fileUrl);
                setIsLoading(false);
            }
        } else if (attachment.fileUrl.startsWith('blob:')) {
            // Already a blob URL
            if (!attachment.id) {
                setObjectUrl(attachment.fileUrl);
                setIsLoading(false);
            }
        } else {
            // Unknown URL format
            if (!attachment.id) {
                setObjectUrl(attachment.fileUrl);
                setIsLoading(false);
            }
        }
    }, [attachment]);

    if (!attachment) return null;

    const handleDownload = () => {
        if (!attachment.fileUrl) return;

        try {
            if (attachment.fileUrl.startsWith('data:')) {
                // For base64 data URLs, create blob and download
                const blob = dataUrlToBlob(attachment.fileUrl, attachment.fileName, attachment.fileType);
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = attachment.fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            } else {
                // For regular URLs - use view URL if available, otherwise direct URL
                const downloadUrl = attachment.id
                    ? attachmentApiService.getAttachmentViewUrl(attachment.id) + '?download=true'
                    : attachment.fileUrl;
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = attachment.fileName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const handleOpenInNewTab = () => {
        // ALWAYS use view URL if available (for preview in new tab, prevents downloads)
        if (attachment.id) {
            const viewUrl = attachmentApiService.getAttachmentViewUrl(attachment.id);
            console.log('[AttachmentViewer] Opening view URL in new tab:', viewUrl);
            window.open(viewUrl, '_blank');
            return;
        }

        // Fallback to blob URL or regular URL
        if (!objectUrl && !attachment.fileUrl) return;

        // For blob URLs, we need to handle differently
        if (attachment.fileUrl?.startsWith('data:')) {
            const blob = dataUrlToBlob(attachment.fileUrl, attachment.fileName, attachment.fileType);
            if (blob) {
                const url = URL.createObjectURL(blob);
                console.log('[AttachmentViewer] Opening blob URL in new tab:', url.substring(0, 50) + '...');
                window.open(url, '_blank');
                // Note: We can't revoke immediately as the new tab needs the URL
            }
        } else {
            window.open(attachment.fileUrl || objectUrl || '', '_blank');
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            );
        }

        const fileType = attachment.fileType?.toLowerCase() || '';
        const fileName = attachment.fileName.toLowerCase();
        // Use previewUrl (blob URL from fetch) if available, otherwise fallback to objectUrl or fileUrl
        const displayUrl = previewUrl || objectUrl || attachment.fileUrl;

        console.log('[AttachmentViewer] Rendering attachment:', {
            id: attachment.id,
            fileName: attachment.fileName,
            fileType: attachment.fileType,
            hasPreviewUrl: !!previewUrl,
            previewUrl: previewUrl?.substring(0, 50) + '...',
            displayUrl: displayUrl?.substring(0, 50) + '...',
        });

        // Check if file can be previewed in browser (PDF, images, videos, text files, Office docs)
        const isImage = fileType.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName);
        const isPDF = fileType.includes('pdf') || fileName.endsWith('.pdf');
        const isVideo = fileType.includes('video') || /\.(mp4|webm|ogg|mov|avi)$/i.test(fileName);
        const isText = fileType.includes('text') || /\.(txt|md|html|htm|xml|json|csv|log)$/i.test(fileName);
        const isOfficeDoc = /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(fileName);
        const canPreviewInBrowser = isPDF || isImage || isVideo || isText || isOfficeDoc;

        // PDF files - Use previewUrl (blob URL from fetch) or displayUrl (prevents downloads)
        if (isPDF) {
            if (displayUrl) {
                console.log('[AttachmentViewer] Loading PDF in iframe:', displayUrl.substring(0, 80) + '...');
                return (
                    <div className="w-full h-full min-h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <iframe
                            src={displayUrl}
                            className="w-full h-full min-h-[500px] border-0"
                            title={attachment.fileName}
                            style={{ width: '100%', height: '100%', minHeight: '500px' }}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            onError={(e) => {
                                console.error('[AttachmentViewer] Error loading PDF in iframe:', e);
                            }}
                            onLoad={() => {
                                console.log('[AttachmentViewer] PDF iframe loaded successfully');
                            }}
                        />
                    </div>
                );
            }
        }

        // Image files - use img tag for direct preview (use previewUrl or displayUrl)
        if (isImage) {
            if (displayUrl) {
                return (
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[300px]">
                        <img
                            src={displayUrl}
                            alt={attachment.fileName}
                            className="max-w-full max-h-[70vh] object-contain"
                            onError={(e) => {
                                console.error('[AttachmentViewer] Error loading image:', e);
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                            onLoad={() => {
                                console.log('[AttachmentViewer] Image loaded successfully');
                            }}
                        />
                    </div>
                );
            }
        }

        // Video files - use video tag for direct preview
        if (fileType.includes('video') || /\.(mp4|webm|ogg|mov|avi)$/i.test(fileName)) {
            return (
                <div className="flex items-center justify-center bg-gray-900 rounded-lg p-4 min-h-[300px]">
                    <video
                        controls
                        className="w-full max-h-[70vh] rounded-lg"
                        src={displayUrl}
                        onError={(e) => {
                            console.error('Error loading video:', e);
                        }}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        // Audio files
        if (fileType.includes('audio') || /\.(mp3|wav|ogg|m4a)$/i.test(fileName)) {
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg min-h-[200px]">
                    <Music className="w-16 h-16 text-green-500 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-4">{attachment.fileName}</p>
                    <audio controls className="w-full max-w-md">
                        <source src={displayUrl} />
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            );
        }

        // Text files - show decoded content
        if (textContent !== null) {
            return (
                <div className="bg-white p-4 rounded-lg border border-gray-300 max-h-[70vh] overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap break-words font-mono">{textContent}</pre>
                </div>
            );
        }

        // Office documents - Use previewUrl or displayUrl (prevents downloads)
        if (isOfficeDoc) {
            if (displayUrl) {
                return (
                    <div className="w-full h-full min-h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <iframe
                            src={displayUrl}
                            className="w-full h-full min-h-[500px] border-0"
                            title={attachment.fileName}
                            style={{ width: '100%', height: '100%', minHeight: '500px' }}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                            onError={(e) => {
                                console.error('[AttachmentViewer] Error loading Office document in iframe:', e);
                            }}
                            onLoad={() => {
                                console.log('[AttachmentViewer] Office document iframe loaded successfully');
                            }}
                        />
                    </div>
                );
            }
        }

        // For other file types, show download option with file icon
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg min-h-[300px]">
                {getFileIcon(attachment.fileName, attachment.fileType)}
                <p className="text-lg font-medium text-gray-900 mt-4 mb-2">{attachment.fileName}</p>

                {/* Warning for potentially corrupted or inaccessible files */}
                {(!attachment.fileUrl || (attachment.fileUrl.length < 100 && !attachment.id)) && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 max-w-md text-center">
                        <p className="font-semibold">⚠️ content unavailable</p>
                        <p>This file appears to be corrupted or inaccessible. If this is an older attachment, it may have been truncated.</p>
                    </div>
                )}

                <p className="text-sm text-gray-600 mb-6">
                    {canPreviewInBrowser ? 'Preview loading failed or not supported' : 'Preview not available for this file type'}
                </p>
                <div className="flex gap-3">
                    {attachment.id && (
                        <Button onClick={handleOpenInNewTab} variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in New Tab
                        </Button>
                    )}
                    <Button onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold truncate pr-8">
                            {attachment.fileName}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            {attachment.id && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleOpenInNewTab}
                                    title="Open in new tab for preview"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open
                                </Button>
                            )}
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleDownload}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                    {attachment.fileSize && (
                        <p className="text-sm text-gray-500">
                            Size: {(attachment.fileSize / 1024).toFixed(1)} KB
                        </p>
                    )}
                </DialogHeader>
                <div className="mt-4 overflow-auto flex-1 min-h-0">
                    {renderContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AttachmentViewer;
