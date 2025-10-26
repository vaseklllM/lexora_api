export interface ILearningStrategy {
  getCorrectWeight(): number;
  getIncorrectWeight(): number;
  getName(): string;
}
