package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Board;
import com.sprintsync.api.service.BoardService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Board entity operations.
 * Provides endpoints for board management operations.
 * 
 * @author SprintSync Team
 */
@RestController
@RequestMapping("/api/boards")
@CrossOrigin(origins = "*")
public class BoardController {

    private static final Logger logger = LoggerFactory.getLogger(BoardController.class);
    private final BoardService boardService;

    @Autowired
    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    /**
     * Create a new board.
     * 
     * @param board the board to create
     * @return ResponseEntity containing the created board
     */
    @PostMapping
    public ResponseEntity<?> createBoard(@Valid @RequestBody Board board) {
        try {
            logger.info("Creating board for project: {}", board.getProjectId());
            Board createdBoard = boardService.createBoard(board);
            logger.info("Successfully created board with ID: {}", createdBoard.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBoard);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request for creating board: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "status", HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            logger.error("Error creating board", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create board: " + e.getMessage(), 
                                 "status", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * Create a new board by copying workflow lanes from default board (excluding QA columns).
     * 
     * @param request map containing projectId, name, and optional description
     * @return ResponseEntity containing the created board
     */
    @PostMapping("/create-from-default")
    public ResponseEntity<?> createBoardFromDefault(@RequestBody Map<String, String> request) {
        try {
            String projectId = request.get("projectId");
            String name = request.get("name");
            String description = request.get("description");

            if (projectId == null || projectId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Project ID is required", "status", HttpStatus.BAD_REQUEST.value()));
            }

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Board name is required", "status", HttpStatus.BAD_REQUEST.value()));
            }

            logger.info("Creating board '{}' from default for project: {}", name, projectId);
            Board createdBoard = boardService.createBoardFromDefault(projectId, name, description);
            logger.info("Successfully created board with ID: {}", createdBoard.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBoard);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request for creating board from default: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "status", HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            logger.error("Error creating board from default", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create board: " + e.getMessage(), 
                                 "status", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * Get board by ID.
     * 
     * @param id the board ID
     * @return ResponseEntity containing the board if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoardById(@PathVariable String id) {
        Optional<Board> board = boardService.findById(id);
        return board.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all boards for a project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of boards for the project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Board>> getBoardsByProject(@PathVariable String projectId) {
        List<Board> boards = boardService.getBoardsByProject(projectId);
        return ResponseEntity.ok(boards);
    }

    /**
     * Get default board for a project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing the default board if found
     */
    @GetMapping("/project/{projectId}/default")
    public ResponseEntity<Board> getDefaultBoard(@PathVariable String projectId) {
        Optional<Board> board = boardService.getDefaultBoard(projectId);
        return board.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all boards.
     * 
     * @return ResponseEntity containing list of all boards
     */
    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        List<Board> boards = boardService.getAllBoards();
        return ResponseEntity.ok(boards);
    }

    /**
     * Update an existing board.
     * 
     * @param id the board ID
     * @param board the updated board
     * @return ResponseEntity containing the updated board
     */
    @PutMapping("/{id}")
    public ResponseEntity<Board> updateBoard(@PathVariable String id, @RequestBody Board board) {
        try {
            board.setId(id);
            Board updatedBoard = boardService.updateBoard(board);
            return ResponseEntity.ok(updatedBoard);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a board by ID.
     * 
     * @param id the board ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable String id) {
        try {
            boardService.deleteBoard(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

