import { ILearningStrategy } from './learning-strategy.interface';

export class GuessItStrategy implements ILearningStrategy {
  getCorrectWeight(): number {
    return 2;
  }

  getIncorrectWeight(): number {
    return 0.5;
  }

  getName(): string {
    return 'guess_it';
  }
}
