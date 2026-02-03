import { attachmentApiService } from "../services/api/entities/attachmentApi";

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const uploadFileAndCreateAttachment = async (
    file: File,
    entityType: string,
    entityId: string,
    userId: string,
): Promise<any> => {
    try {
        const fileDataUrl = await fileToBase64(file);
        const fileType = file.type || "application/octet-stream";

        const response = await attachmentApiService.createAttachment({
            uploadedBy: userId,
            entityType,
            entityId,
            fileName: file.name,
            fileSize: file.size,
            fileType,
            fileUrl: fileDataUrl,
            attachmentType: "file" as const,
            isPublic: true,
        });

        return response;
    } catch (error) {
        console.error("Error creating attachment:", error);
        throw error;
    }
};
