import {generatePuzzle, generatePuzzleWithDifficulty} from '../src/generator/puzzleGenerator';
import {Puzzle, Checkpoint} from '../src/game/types';

describe('Puzzle Generator', () => {
  describe('generatePuzzle', () => {
    it('should generate a puzzle with correct size', () => {
      const puzzle = generatePuzzle(5, 6);
      expect(puzzle.size).toBe(5);
    });

    it('should generate a puzzle with correct number of checkpoints', () => {
      const puzzle = generatePuzzle(5, 6);
      expect(puzzle.checkpoints.length).toBe(6);
    });

    it('should have sequential checkpoint numbers starting from 1', () => {
      const puzzle = generatePuzzle(6, 8);
      const numbers = puzzle.checkpoints.map(c => c.number);
      for (let i = 0; i < numbers.length; i++) {
        expect(numbers[i]).toBe(i + 1);
      }
    });

    it('should place checkpoints within grid bounds', () => {
      const puzzle = generatePuzzle(5, 6);
      for (const checkpoint of puzzle.checkpoints) {
        expect(checkpoint.position.row).toBeGreaterThanOrEqual(0);
        expect(checkpoint.position.row).toBeLessThan(puzzle.size);
        expect(checkpoint.position.col).toBeGreaterThanOrEqual(0);
        expect(checkpoint.position.col).toBeLessThan(puzzle.size);
      }
    });

    it('should generate a solution path', () => {
      const puzzle = generatePuzzle(5, 6);
      expect(puzzle.solution).toBeDefined();
      expect(puzzle.solution!.length).toBe(puzzle.size * puzzle.size);
    });

    it('should have checkpoints placed on the solution path', () => {
      const puzzle = generatePuzzle(5, 6);
      const solution = puzzle.solution!;

      for (const checkpoint of puzzle.checkpoints) {
        const onPath = solution.some(
          pos => pos.row === checkpoint.position.row && pos.col === checkpoint.position.col
        );
        expect(onPath).toBe(true);
      }
    });

    it('should clamp size to valid range', () => {
      const tooSmall = generatePuzzle(2, 2);
      expect(tooSmall.size).toBeGreaterThanOrEqual(4);

      const tooLarge = generatePuzzle(15, 8);
      expect(tooLarge.size).toBeLessThanOrEqual(10);
    });

    it('should clamp number of checkpoints to valid range', () => {
      const puzzle = generatePuzzle(5, 50);
      expect(puzzle.checkpoints.length).toBeLessThanOrEqual(25); // size*size
    });

    it('should have first checkpoint at start of solution', () => {
      const puzzle = generatePuzzle(5, 6);
      const firstCheckpoint = puzzle.checkpoints[0];
      const firstSolutionCell = puzzle.solution![0];

      expect(firstCheckpoint.position.row).toBe(firstSolutionCell.row);
      expect(firstCheckpoint.position.col).toBe(firstSolutionCell.col);
    });

    it('should have last checkpoint at end of solution', () => {
      const puzzle = generatePuzzle(5, 6);
      const lastCheckpoint = puzzle.checkpoints[puzzle.checkpoints.length - 1];
      const lastSolutionCell = puzzle.solution![puzzle.solution!.length - 1];

      expect(lastCheckpoint.position.row).toBe(lastSolutionCell.row);
      expect(lastCheckpoint.position.col).toBe(lastSolutionCell.col);
    });
  });

  describe('generatePuzzleWithDifficulty', () => {
    it('should generate easy puzzle with correct parameters', () => {
      const puzzle = generatePuzzleWithDifficulty('easy');
      expect(puzzle.size).toBe(5);
      expect(puzzle.checkpoints.length).toBe(6);
    });

    it('should generate medium puzzle with correct parameters', () => {
      const puzzle = generatePuzzleWithDifficulty('medium');
      expect(puzzle.size).toBe(6);
      expect(puzzle.checkpoints.length).toBe(8);
    });

    it('should generate hard puzzle with correct parameters', () => {
      const puzzle = generatePuzzleWithDifficulty('hard');
      expect(puzzle.size).toBe(7);
      expect(puzzle.checkpoints.length).toBe(10);
    });

    it('should generate expert puzzle with correct parameters', () => {
      const puzzle = generatePuzzleWithDifficulty('expert');
      expect(puzzle.size).toBe(8);
      expect(puzzle.checkpoints.length).toBe(12);
    });

    it('should generate master puzzle with correct parameters', () => {
      const puzzle = generatePuzzleWithDifficulty('master');
      expect(puzzle.size).toBe(9);
      expect(puzzle.checkpoints.length).toBe(14);
    });

    it('should generate valid solution for all difficulties', () => {
      const difficulties = ['easy', 'medium', 'hard', 'expert', 'master'] as const;

      for (const difficulty of difficulties) {
        const puzzle = generatePuzzleWithDifficulty(difficulty);
        expect(puzzle.solution).toBeDefined();
        expect(puzzle.solution!.length).toBe(puzzle.size * puzzle.size);
      }
    });
  });

  describe('Solution Path Validity', () => {
    it('should have solution path visiting all cells exactly once', () => {
      const puzzle = generatePuzzle(5, 6);
      const solution = puzzle.solution!;
      const visited = new Set<string>();

      for (const pos of solution) {
        const key = `${pos.row},${pos.col}`;
        expect(visited.has(key)).toBe(false);
        visited.add(key);
      }

      expect(visited.size).toBe(puzzle.size * puzzle.size);
    });

    it('should have solution path with adjacent cells only', () => {
      const puzzle = generatePuzzle(5, 6);
      const solution = puzzle.solution!;

      for (let i = 1; i < solution.length; i++) {
        const prev = solution[i - 1];
        const curr = solution[i];

        const rowDiff = Math.abs(curr.row - prev.row);
        const colDiff = Math.abs(curr.col - prev.col);

        // Should be exactly one step in one direction
        expect(rowDiff + colDiff).toBe(1);
      }
    });

    it('should have checkpoints in order along the solution path', () => {
      const puzzle = generatePuzzle(6, 8);
      const solution = puzzle.solution!;

      // Find index of each checkpoint in the solution
      const checkpointIndices = puzzle.checkpoints.map(cp => {
        return solution.findIndex(
          pos => pos.row === cp.position.row && pos.col === cp.position.col
        );
      });

      // Checkpoints should appear in ascending order along the path
      for (let i = 1; i < checkpointIndices.length; i++) {
        expect(checkpointIndices[i]).toBeGreaterThan(checkpointIndices[i - 1]);
      }
    });
  });
});
