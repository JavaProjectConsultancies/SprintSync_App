package com.sprintsync.api.service;

import com.sprintsync.api.entity.Board;
import com.sprintsync.api.entity.WorkflowLane;
import com.sprintsync.api.repository.BoardRepository;
import com.sprintsync.api.repository.WorkflowLaneRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for Board operations.
 * Provides business logic for board management.
 * 
 * @author SprintSync Team
 */
@Service
@SuppressWarnings("null")
public class BoardService {

    private static final Logger logger = LoggerFactory.getLogger(BoardService.class);

    private final BoardRepository boardRepository;
    private final WorkflowLaneRepository workflowLaneRepository;

    @Autowired
    public BoardService(BoardRepository boardRepository, WorkflowLaneRepository workflowLaneRepository) {
        this.boardRepository = boardRepository;
        this.workflowLaneRepository = workflowLaneRepository;
    }

    /**
     * Create a new board.
     * 
     * @param board the board to create
     * @return the created board
     */
    @Transactional
    public Board createBoard(Board board) {
        if (board.getName() == null || board.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Board name cannot be empty");
        }

        // Check if board name already exists for this project
        List<Board> existingBoards = boardRepository.findByProjectIdOrderByCreatedAtAsc(board.getProjectId());
        boolean nameExists = existingBoards.stream()
            .anyMatch(b -> b.getName().equalsIgnoreCase(board.getName().trim()));
        
        if (nameExists) {
            throw new IllegalArgumentException("Board name already exists for this project");
        }

        // Set board ID if not provided
        if (board.getId() == null || board.getId().isEmpty()) {
            board.setId(UUID.randomUUID().toString());
        }

        board.setCreatedAt(LocalDateTime.now());
        board.setUpdatedAt(LocalDateTime.now());

        Board createdBoard = boardRepository.save(board);
        logger.info("Created board: {} for project: {}", createdBoard.getName(), createdBoard.getProjectId());
        
        return createdBoard;
    }

    /**
     * Create a new empty board with all columns except QA columns.
     * Creates default columns: Stories, To Do, In Progress, Done (excluding QA Review).
     * 
     * @param projectId the project ID
     * @param boardName the name for the new board
     * @param description optional description for the board
     * @return the created board with default lanes (excluding QA)
     */
    @Transactional
    public Board createBoardFromDefault(String projectId, String boardName, String description) {
        logger.info("Creating new empty board '{}' for project: {}", boardName, projectId);

        // Create new board
        Board newBoard = new Board();
        newBoard.setId(UUID.randomUUID().toString());
        newBoard.setProjectId(projectId);
        newBoard.setName(boardName);
        newBoard.setDescription(description);
        newBoard.setIsDefault(false);
        newBoard.setCreatedAt(LocalDateTime.now());
        newBoard.setUpdatedAt(LocalDateTime.now());

        Board createdBoard = boardRepository.save(newBoard);
        logger.info("Created board: {} with ID: {}", createdBoard.getName(), createdBoard.getId());

        // Create default lanes for the new board (excluding QA)
        // Default columns: Stories, To Do, In Progress, Done
        List<WorkflowLane> defaultLanes = List.of(
            createDefaultLane(createdBoard.getId(), projectId, "To Do", "#3B82F6", "TODO", 1),
            createDefaultLane(createdBoard.getId(), projectId, "In Progress", "#F97316", "IN_PROGRESS", 2),
            createDefaultLane(createdBoard.getId(), projectId, "Done", "#10B981", "DONE", 3)
        );

        for (WorkflowLane lane : defaultLanes) {
            workflowLaneRepository.save(lane);
            logger.info("Created default lane '{}' for board '{}'", lane.getTitle(), createdBoard.getName());
        }

        logger.info("Created empty board '{}' with {} default lanes (QA excluded)", createdBoard.getName(), defaultLanes.size());
        return createdBoard;
    }

    /**
     * Helper method to create a default lane.
     */
    private WorkflowLane createDefaultLane(String boardId, String projectId, String title, String color, String statusValue, int displayOrder) {
        WorkflowLane lane = new WorkflowLane();
        lane.setId(UUID.randomUUID().toString());
        lane.setBoardId(boardId);
        lane.setProjectId(projectId);
        lane.setTitle(title);
        lane.setColor(color);
        lane.setStatusValue(statusValue);
        lane.setDisplayOrder(displayOrder);
        lane.setWipLimitEnabled(false);
        lane.setCreatedAt(LocalDateTime.now());
        lane.setUpdatedAt(LocalDateTime.now());
        return lane;
    }

    /**
     * Get board by ID.
     * 
     * @param id the board ID
     * @return the board if found
     */
    public Optional<Board> findById(String id) {
        return boardRepository.findById(id);
    }

    /**
     * Get all boards for a project.
     * 
     * @param projectId the project ID
     * @return list of boards for the project
     */
    public List<Board> getBoardsByProject(String projectId) {
        return boardRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
    }

    /**
     * Get default board for a project.
     * 
     * @param projectId the project ID
     * @return the default board if found
     */
    public Optional<Board> getDefaultBoard(String projectId) {
        return boardRepository.findByProjectIdAndIsDefaultTrue(projectId);
    }

    /**
     * Update an existing board.
     * 
     * @param board the board to update
     * @return the updated board
     */
    @Transactional
    public Board updateBoard(Board board) {
        if (board.getId() == null || board.getId().isEmpty()) {
            throw new IllegalArgumentException("Board ID cannot be null");
        }

        Board existingBoard = boardRepository.findById(board.getId())
            .orElseThrow(() -> new IllegalArgumentException("Board not found"));

        // Update fields
        if (board.getName() != null && !board.getName().trim().isEmpty()) {
            // Check if name already exists for this project (excluding current board)
            List<Board> existingBoards = boardRepository.findByProjectIdOrderByCreatedAtAsc(board.getProjectId());
            boolean nameExists = existingBoards.stream()
                .anyMatch(b -> !b.getId().equals(board.getId()) && b.getName().equalsIgnoreCase(board.getName().trim()));
            
            if (nameExists) {
                throw new IllegalArgumentException("Board name already exists for this project");
            }
            existingBoard.setName(board.getName().trim());
        }

        if (board.getDescription() != null) {
            existingBoard.setDescription(board.getDescription());
        }

        existingBoard.setUpdatedAt(LocalDateTime.now());

        return boardRepository.save(existingBoard);
    }

    /**
     * Delete a board by ID.
     * 
     * @param id the board ID
     */
    @Transactional
    public void deleteBoard(String id) {
        if (!boardRepository.existsById(id)) {
            throw new IllegalArgumentException("Board not found");
        }
        boardRepository.deleteById(id);
        logger.info("Deleted board with ID: {}", id);
    }

    /**
     * Get all boards.
     * 
     * @return list of all boards
     */
    public List<Board> getAllBoards() {
        return boardRepository.findAll();
    }
}







