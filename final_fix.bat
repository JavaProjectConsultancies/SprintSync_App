@echo off
setlocal enabledelayedexpansion

set "service_files=ActivityLogService.java AttachmentService.java BatchOperationsService.java BoardService.java DashboardService.java DepartmentService.java DomainService.java EpicService.java IssueService.java NotificationService.java PendingRegistrationService.java ProjectMapper.java ProjectService.java QualityGateService.java ReleaseService.java ReportsService.java RequirementService.java RiskService.java SprintService.java StakeholderService.java StoryService.java SubtaskService.java TaskService.java TimeEntryService.java UserService.java WorkflowLaneService.java"

set "controller_files=ProjectTeamMemberController.java"

set "config_files=ProjectCacheConfig.java"

set "security_files=JwtAuthenticationFilter.java"

for %%f in (%service_files%) do (
    set "file=C:\Users\snakhate\Desktop\SprintSync_App-1\SprintSync_App_API\src\main\java\com\sprintsync\api\service\%%f"
    if exist "!file!" (
        powershell -Command "(Get-Content '!file!' -Raw) -replace '`n', [Environment]::NewLine" > temp.txt
        move temp.txt "!file!" >nul
        echo Fixed %%f
    )
)

for %%f in (%controller_files%) do (
    set "file=C:\Users\snakhate\Desktop\SprintSync_App-1\SprintSync_App_API\src\main\java\com\sprintsync\api\controller\%%f"
    if exist "!file!" (
        powershell -Command "(Get-Content '!file!' -Raw) -replace '`n', [Environment]::NewLine" > temp.txt
        move temp.txt "!file!" >nul
        echo Fixed %%f
    )
)

for %%f in (%config_files%) do (
    set "file=C:\Users\snakhate\Desktop\SprintSync_App-1\SprintSync_App_API\src\main\java\com\sprintsync\api\config\%%f"
    if exist "!file!" (
        powershell -Command "(Get-Content '!file!' -Raw) -replace '`n', [Environment]::NewLine" > temp.txt
        move temp.txt "!file!" >nul
        echo Fixed %%f
    )
)

for %%f in (%security_files%) do (
    set "file=C:\Users\snakhate\Desktop\SprintSync_App-1\SprintSync_App_API\src\main\java\com\sprintsync\api\security\%%f"
    if exist "!file!" (
        powershell -Command "(Get-Content '!file!' -Raw) -replace '`n', [Environment]::NewLine" > temp.txt
        move temp.txt "!file!" >nul
        echo Fixed %%f
    )
)

echo All files fixed.
pause
