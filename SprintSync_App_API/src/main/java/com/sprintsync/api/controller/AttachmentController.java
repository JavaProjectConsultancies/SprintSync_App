package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Attachment;
import com.sprintsync.api.service.AttachmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Attachment management operations.
 * Provides endpoints for CRUD operations on Attachment entities.
 * 
 * @author SprintSync Team
 */
@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    /**
     * Get all attachments by entity type and ID
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<Attachment>> getAttachmentsByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        try {
            List<Attachment> attachments = attachmentService.getAttachmentsByEntity(entityType, entityId);
            return ResponseEntity.ok(attachments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get attachment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Attachment> getAttachmentById(@PathVariable String id) {
        try {
            Attachment attachment = attachmentService.getAttachmentById(id);
            if (attachment != null) {
                return ResponseEntity.ok(attachment);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new attachment
     */
    @PostMapping
    public ResponseEntity<?> createAttachment(@Valid @RequestBody Attachment attachment) {
        try {
            // Validate required fields
            if (attachment.getEntityType() == null || attachment.getEntityType().isEmpty()) {
                String errorMsg = "Attachment creation failed: entityType is required";
                System.err.println(errorMsg);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", errorMsg, "success", false));
            }
            if (attachment.getEntityId() == null || attachment.getEntityId().isEmpty()) {
                String errorMsg = "Attachment creation failed: entityId is required";
                System.err.println(errorMsg);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", errorMsg, "success", false));
            }
            if (attachment.getFileName() == null || attachment.getFileName().isEmpty()) {
                String errorMsg = "Attachment creation failed: fileName is required";
                System.err.println(errorMsg);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", errorMsg, "success", false));
            }
            if (attachment.getFileUrl() == null || attachment.getFileUrl().isEmpty()) {
                String errorMsg = "Attachment creation failed: fileUrl is required";
                System.err.println(errorMsg);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", errorMsg, "success", false));
            }
            
            System.out.println("Creating attachment: " + attachment.getFileName() + 
                " for " + attachment.getEntityType() + " " + attachment.getEntityId() +
                " (uploadedBy: " + attachment.getUploadedBy() + ", fileSize: " + attachment.getFileSize() + ")");
            
            Attachment createdAttachment = attachmentService.createAttachment(attachment);
            
            System.out.println("Attachment created successfully with ID: " + createdAttachment.getId() +
                " for " + createdAttachment.getEntityType() + " " + createdAttachment.getEntityId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAttachment);
        } catch (IllegalArgumentException e) {
            String errorMsg = "Validation error: " + e.getMessage();
            System.err.println(errorMsg);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", errorMsg, "success", false, "message", e.getMessage()));
        } catch (Exception e) {
            String errorMsg = "Error creating attachment: " + e.getMessage();
            System.err.println(errorMsg);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", errorMsg, "success", false, "message", e.getMessage()));
        }
    }

    /**
     * Delete an attachment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable String id) {
        try {
            boolean deleted = attachmentService.deleteAttachment(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get attachments by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Attachment>> getAttachmentsByUser(@PathVariable String userId) {
        try {
            List<Attachment> attachments = attachmentService.getAttachmentsByUser(userId);
            return ResponseEntity.ok(attachments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get public attachments
     */
    @GetMapping("/public")
    public ResponseEntity<List<Attachment>> getPublicAttachments() {
        try {
            List<Attachment> attachments = attachmentService.getPublicAttachments();
            return ResponseEntity.ok(attachments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Count attachments by entity
     */
    @GetMapping("/count/entity/{entityType}/{entityId}")
    public ResponseEntity<Map<String, Long>> countAttachmentsByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        try {
            long count = attachmentService.countAttachmentsByEntity(entityType, entityId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * View attachment file in browser (preview without download)
     * Decodes base64 data URL and serves with proper content-type headers
     * CORS enabled to allow iframe embedding
     */
    @CrossOrigin(origins = "*")
    @GetMapping("/view/{id}")
    public ResponseEntity<byte[]> viewAttachment(@PathVariable String id) {
        try {
            Attachment attachment = attachmentService.getAttachmentById(id);
            if (attachment == null) {
                return ResponseEntity.notFound().build();
            }

            String fileUrl = attachment.getFileUrl();
            byte[] fileData;
            String contentType;

            // Handle base64 data URLs (data:image/png;base64,...)
            if (fileUrl != null && fileUrl.startsWith("data:")) {
                // Extract content type from data URL
                int commaIndex = fileUrl.indexOf(',');
                if (commaIndex == -1) {
                    return ResponseEntity.badRequest().build();
                }
                
                String dataPart = fileUrl.substring(0, commaIndex);
                String base64Data = fileUrl.substring(commaIndex + 1);
                
                // Extract content type (e.g., "data:image/png;base64" -> "image/png")
                String mimeType = "application/octet-stream"; // default
                if (dataPart.contains(":")) {
                    String[] parts = dataPart.split(":");
                    if (parts.length > 1) {
                        String mimePart = parts[1];
                        if (mimePart.contains(";")) {
                            mimeType = mimePart.split(";")[0];
                        } else {
                            mimeType = mimePart;
                        }
                    }
                }
                
                // Decode base64 data
                try {
                    fileData = Base64.getDecoder().decode(base64Data);
                    contentType = mimeType;
                } catch (IllegalArgumentException e) {
                    System.err.println("Error decoding base64 data for attachment " + id + ": " + e.getMessage());
                    return ResponseEntity.badRequest().build();
                }
            } else if (fileUrl != null && (fileUrl.startsWith("http://") || fileUrl.startsWith("https://"))) {
                // For regular URLs, redirect to the URL
                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.LOCATION, fileUrl);
                return ResponseEntity.status(HttpStatus.FOUND).headers(headers).build();
            } else {
                // Invalid file URL
                return ResponseEntity.badRequest().build();
            }

            // Determine content type from file type or file name if not already set
            if (contentType == null || contentType.equals("application/octet-stream")) {
                String fileType = attachment.getFileType();
                String fileName = attachment.getFileName();
                
                if (fileType != null && !fileType.isEmpty()) {
                    contentType = fileType;
                } else if (fileName != null) {
                    // Try to determine from file extension
                    String lowerFileName = fileName.toLowerCase();
                    if (lowerFileName.endsWith(".pdf")) {
                        contentType = "application/pdf";
                    } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else if (lowerFileName.endsWith(".png")) {
                        contentType = "image/png";
                    } else if (lowerFileName.endsWith(".gif")) {
                        contentType = "image/gif";
                    } else if (lowerFileName.endsWith(".txt")) {
                        contentType = "text/plain";
                    } else if (lowerFileName.endsWith(".html") || lowerFileName.endsWith(".htm")) {
                        contentType = "text/html";
                    } else if (lowerFileName.endsWith(".json")) {
                        contentType = "application/json";
                    } else if (lowerFileName.endsWith(".xml")) {
                        contentType = "application/xml";
                    } else if (lowerFileName.endsWith(".xlsx")) {
                        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    } else if (lowerFileName.endsWith(".xls")) {
                        contentType = "application/vnd.ms-excel";
                    } else if (lowerFileName.endsWith(".docx")) {
                        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    } else if (lowerFileName.endsWith(".doc")) {
                        contentType = "application/msword";
                    } else if (lowerFileName.endsWith(".pptx")) {
                        contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                    } else if (lowerFileName.endsWith(".ppt")) {
                        contentType = "application/vnd.ms-powerpoint";
                    } else {
                        contentType = "application/octet-stream";
                    }
                } else {
                    contentType = "application/octet-stream";
                }
            }

            // Return file with proper headers for inline viewing
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + attachment.getFileName() + "\"")
                    .body(fileData);
        } catch (Exception e) {
            System.err.println("Error viewing attachment " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}




