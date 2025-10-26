import { ILearningStrategy } from './learning-strategy.interface';

export class TypeItStrategy implements ILearningStrategy {
  getCorrectWeight(): number {
    return 4;
  }

  getIncorrectWeight(): number {
    return 0.1;
  }

  getName(): string {
    return 'type_it';
  }
}
