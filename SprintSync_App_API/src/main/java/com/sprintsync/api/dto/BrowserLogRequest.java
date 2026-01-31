package com.sprintsync.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrowserLogRequest {
    private String level;
    private String message;
    private String timestamp;
}
