$filesToUpdate = @(
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/DepartmentService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/DomainService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/StoryService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/config/ProjectCacheConfig.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/controller/ProjectTeamMemberController.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/security/JwtAuthenticationFilter.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/ActivityLogService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/AttachmentService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/BatchOperationsService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/EpicService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/ProjectService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/QualityGateService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/ReleaseService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/TimeEntryService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/UserService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/WorkflowLaneService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/BoardService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/DashboardService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/IssueService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/NotificationService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/PendingRegistrationService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/ProjectMapper.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/ReportsService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/RequirementService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/RiskService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/SprintService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/StakeholderService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/SubtaskService.java",
    "SprintSync_App_API/src/main/java/com/sprintsync/api/service/TaskService.java"
)

$basePath = "C:\Users\snakhate\Desktop\SprintSync_App-1"

foreach ($file in $filesToUpdate) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw

        # Add @SuppressWarnings("null") before class declaration
        # Handle different annotation patterns
        if ($content -match '(@Service|@Component|@RestController|@Controller|@Configuration)\s*\n\s*(public class \w+)') {
            $content = $content -replace '(@Service|@Component|@RestController|@Controller|@Configuration)\s*\n\s*(public class \w+)', '$1`n@SuppressWarnings("null")`n$2'
        } elseif ($content -match 'public class \w+') {
            $content = $content -replace '(public class \w+)', '@SuppressWarnings("null")`n$1'
        }

        Set-Content $fullPath $content
        Write-Host "Added @SuppressWarnings to $file"
    } else {
        Write-Host "File not found: $file"
    }
}
