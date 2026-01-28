import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Download, ExternalLink, FileText, Image, Video, Music, File, Loader2 } from 'lucide-react';

interface AttachmentViewerProps {
    isOpen: boolean;
    onClose: () => void;
    attachment: {
        fileName: string;
        fileUrl: string;
        fileType?: string;
        fileSize?: number;
    } | null;
}

// Helper function to convert base64 to blob and create object URL
const dataUrlToBlob = (dataUrl: string): Blob | null => {
    try {
        const arr = dataUrl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;
        const mime = mimeMatch[1];
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

    useEffect(() => {
        // Clean up object URL when component unmounts or attachment changes
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    useEffect(() => {
        if (!attachment?.fileUrl) {
            setObjectUrl(null);
            setTextContent(null);
            return;
        }

        setIsLoading(true);
        setTextContent(null);

        // Handle base64 data URLs
        if (attachment.fileUrl.startsWith('data:')) {
            const blob = dataUrlToBlob(attachment.fileUrl);
            if (blob) {
                const url = URL.createObjectURL(blob);
                setObjectUrl(url);
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
        } else {
            // Regular URL
            setObjectUrl(attachment.fileUrl);
        }

        setIsLoading(false);
    }, [attachment]);

    if (!attachment) return null;

    const handleDownload = () => {
        if (!attachment.fileUrl) return;

        try {
            if (attachment.fileUrl.startsWith('data:')) {
                // For base64 data URLs, create blob and download
                const blob = dataUrlToBlob(attachment.fileUrl);
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
                // For regular URLs
                const link = document.createElement('a');
                link.href = attachment.fileUrl;
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
        if (!objectUrl) return;

        // For blob URLs, we need to handle differently
        if (attachment.fileUrl.startsWith('data:')) {
            const blob = dataUrlToBlob(attachment.fileUrl);
            if (blob) {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                // Note: We can't revoke immediately as the new tab needs the URL
            }
        } else {
            window.open(attachment.fileUrl, '_blank');
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
        const displayUrl = objectUrl || attachment.fileUrl;

        // Image files
        if (fileType.includes('image') || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName)) {
            return (
                <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[300px]">
                    <img
                        src={displayUrl}
                        alt={attachment.fileName}
                        className="max-w-full max-h-[70vh] object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
            );
        }

        // PDF files
        if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg min-h-[300px]">
                    <FileText className="w-16 h-16 text-red-500 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">PDF Document</p>
                    <p className="text-sm text-gray-600 mb-6">{attachment.fileName}</p>
                    <div className="flex gap-3">
                        <Button onClick={handleOpenInNewTab} variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in New Tab
                        </Button>
                        <Button onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </div>
                </div>
            );
        }

        // Video files
        if (fileType.includes('video') || /\.(mp4|webm|ogg|mov)$/i.test(fileName)) {
            return (
                <div className="flex items-center justify-center bg-gray-900 rounded-lg p-4 min-h-[300px]">
                    <video
                        controls
                        className="w-full max-h-[70vh] rounded-lg"
                        src={displayUrl}
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

        // For other file types, show download option with file icon
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg min-h-[300px]">
                {getFileIcon(attachment.fileName, attachment.fileType)}
                <p className="text-lg font-medium text-gray-900 mt-4 mb-2">{attachment.fileName}</p>
                <p className="text-sm text-gray-600 mb-6">
                    Preview not available for this file type
                </p>
                <div className="flex gap-3">
                    <Button onClick={handleOpenInNewTab} variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                    </Button>
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold truncate pr-8">
                            {attachment.fileName}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenInNewTab}
                                title="Open in new tab"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open
                            </Button>
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
                <div className="mt-4 overflow-auto">
                    {renderContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AttachmentViewer;
