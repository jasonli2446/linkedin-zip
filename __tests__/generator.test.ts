import {generatePuzzle, generatePuzzleWithDifficulty} from '../src/generator/puzzleGenerator';
import {solvePuzzle, isValidPuzzle, countSolutions} from '../src/generator/solver';
import {Puzzle} from '../src/game/types';

describe('Puzzle Generator', () => {
  describe('generatePuzzle', () => {
    it('should generate a puzzle with correct size', () => {
      const puzzle = generatePuzzle(5, 4);
      expect(puzzle.size).toBe(5);
    });

    it('should generate a puzzle with correct number of endpoints', () => {
      const puzzle = generatePuzzle(5, 4);
      expect(puzzle.endpoints.length).toBe(4);
    });

    it('should have unique endpoint IDs', () => {
      const puzzle = generatePuzzle(6, 5);
      const ids = puzzle.endpoints.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should place endpoints within grid bounds', () => {
      const puzzle = generatePuzzle(5, 4);
      for (const endpoint of puzzle.endpoints) {
        for (const pos of endpoint.positions) {
          expect(pos.row).toBeGreaterThanOrEqual(0);
          expect(pos.row).toBeLessThan(puzzle.size);
          expect(pos.col).toBeGreaterThanOrEqual(0);
          expect(pos.col).toBeLessThan(puzzle.size);
        }
      }
    });

    it('should generate a solvable puzzle', () => {
      const puzzle = generatePuzzle(5, 4);
      expect(isValidPuzzle(puzzle)).toBe(true);
    });

    it('should clamp size to valid range', () => {
      const tooSmall = generatePuzzle(2, 2);
      expect(tooSmall.size).toBeGreaterThanOrEqual(4);

      const tooLarge = generatePuzzle(15, 8);
      expect(tooLarge.size).toBeLessThanOrEqual(10);
    });

    it('should clamp number of paths to valid range', () => {
      const puzzle = generatePuzzle(5, 20);
      expect(puzzle.endpoints.length).toBeLessThanOrEqual(6); // 25/4 = 6
    });
  });

  describe('generatePuzzleWithDifficulty', () => {
    it('should generate easy puzzle with correct parameters', () => {
      const puzzle = generatePuzzleWithDifficulty('easy');
      expect(puzzle.size).toBe(5);
      expect(puzzle.endpoints.length).toBe(4);
    });

    it('should generate medium puzzle with correct parameters', () => {
      const puzzle = generatePuzzleWithDifficulty('medium');
      expect(puzzle.size).toBe(6);
      expect(puzzle.endpoints.length).toBe(5);
    });

    it('should generate hard puzzle with correct parameters', () => {
      const puzzle = generatePuzzleWithDifficulty('hard');
      expect(puzzle.size).toBe(7);
      expect(puzzle.endpoints.length).toBe(6);
    });

    it('should generate solvable puzzles for easy difficulty', () => {
      // Easy difficulty should reliably generate solvable puzzles
      const puzzle = generatePuzzleWithDifficulty('easy');
      expect(isValidPuzzle(puzzle)).toBe(true);
    });

    it('should generate solvable puzzles for medium difficulty', () => {
      const puzzle = generatePuzzleWithDifficulty('medium');
      expect(isValidPuzzle(puzzle)).toBe(true);
    });
  });
});

describe('Puzzle Solver', () => {
  describe('solvePuzzle', () => {
    it('should solve a simple puzzle', () => {
      // 3x3 grid with 3 horizontal paths - definitely solvable
      const puzzle: Puzzle = {
        size: 3,
        endpoints: [
          {id: 1, positions: [{row: 0, col: 0}, {row: 0, col: 2}]},
          {id: 2, positions: [{row: 1, col: 0}, {row: 1, col: 2}]},
          {id: 3, positions: [{row: 2, col: 0}, {row: 2, col: 2}]},
        ],
      };

      const solution = solvePuzzle(puzzle);
      expect(solution).not.toBeNull();
      expect(solution!.length).toBe(3);
    });

    it('should return paths that connect endpoints', () => {
      // Simple solvable puzzle - 3 horizontal paths
      const puzzle: Puzzle = {
        size: 3,
        endpoints: [
          {id: 1, positions: [{row: 0, col: 0}, {row: 0, col: 2}]},
          {id: 2, positions: [{row: 1, col: 0}, {row: 1, col: 2}]},
          {id: 3, positions: [{row: 2, col: 0}, {row: 2, col: 2}]},
        ],
      };

      const solution = solvePuzzle(puzzle);
      expect(solution).not.toBeNull();

      for (const path of solution!) {
        const endpoint = puzzle.endpoints.find(e => e.id === path.id);
        expect(endpoint).toBeDefined();

        const firstCell = path.cells[0];
        const lastCell = path.cells[path.cells.length - 1];

        const startsAtEndpoint =
          (firstCell.row === endpoint!.positions[0].row &&
            firstCell.col === endpoint!.positions[0].col) ||
          (firstCell.row === endpoint!.positions[1].row &&
            firstCell.col === endpoint!.positions[1].col);

        const endsAtEndpoint =
          (lastCell.row === endpoint!.positions[0].row &&
            lastCell.col === endpoint!.positions[0].col) ||
          (lastCell.row === endpoint!.positions[1].row &&
            lastCell.col === endpoint!.positions[1].col);

        expect(startsAtEndpoint).toBe(true);
        expect(endsAtEndpoint).toBe(true);
      }
    });

    it('should return null for unsolvable puzzle', () => {
      // Isolated endpoints that can't connect without crossing
      const puzzle: Puzzle = {
        size: 2,
        endpoints: [
          {id: 1, positions: [{row: 0, col: 0}, {row: 1, col: 1}]},
          {id: 2, positions: [{row: 0, col: 1}, {row: 1, col: 0}]},
        ],
      };

      const solution = solvePuzzle(puzzle);
      expect(solution).toBeNull();
    });
  });

  describe('isValidPuzzle', () => {
    it('should return true for valid puzzle', () => {
      // Solvable 3x3 puzzle with horizontal paths
      const puzzle: Puzzle = {
        size: 3,
        endpoints: [
          {id: 1, positions: [{row: 0, col: 0}, {row: 0, col: 2}]},
          {id: 2, positions: [{row: 1, col: 0}, {row: 1, col: 2}]},
          {id: 3, positions: [{row: 2, col: 0}, {row: 2, col: 2}]},
        ],
      };

      expect(isValidPuzzle(puzzle)).toBe(true);
    });

    it('should return false for invalid puzzle', () => {
      const puzzle: Puzzle = {
        size: 2,
        endpoints: [
          {id: 1, positions: [{row: 0, col: 0}, {row: 1, col: 1}]},
          {id: 2, positions: [{row: 0, col: 1}, {row: 1, col: 0}]},
        ],
      };

      expect(isValidPuzzle(puzzle)).toBe(false);
    });
  });

  describe('countSolutions', () => {
    it('should count solutions correctly', () => {
      // Solvable puzzle - horizontal paths
      const puzzle: Puzzle = {
        size: 3,
        endpoints: [
          {id: 1, positions: [{row: 0, col: 0}, {row: 0, col: 2}]},
          {id: 2, positions: [{row: 1, col: 0}, {row: 1, col: 2}]},
          {id: 3, positions: [{row: 2, col: 0}, {row: 2, col: 2}]},
        ],
      };

      const count = countSolutions(puzzle);
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it('should return 0 for unsolvable puzzle', () => {
      const puzzle: Puzzle = {
        size: 2,
        endpoints: [
          {id: 1, positions: [{row: 0, col: 0}, {row: 1, col: 1}]},
          {id: 2, positions: [{row: 0, col: 1}, {row: 1, col: 0}]},
        ],
      };

      const count = countSolutions(puzzle);
      expect(count).toBe(0);
    });
  });
});
