import { ILearningStrategy } from './learning-strategy.interface';

export class RecallItStrategy implements ILearningStrategy {
  getCorrectWeight(): number {
    return 3;
  }

  getIncorrectWeight(): number {
    return 0.3;
  }

  getName(): string {
    return 'recall_it';
  }
}
