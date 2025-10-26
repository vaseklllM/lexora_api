import { ILearningStrategy } from './learning-strategy.interface';

export class PairItStrategy implements ILearningStrategy {
  getCorrectWeight(): number {
    return 1;
  }

  getIncorrectWeight(): number {
    return 0.7;
  }

  getName(): string {
    return 'pair_it';
  }
}
