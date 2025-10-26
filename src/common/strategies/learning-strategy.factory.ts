import { Injectable } from '@nestjs/common';
import { LearningStrategyType } from '../types/learningStrategyType';
import { ILearningStrategy } from './learning-strategy.interface';
import { PairItStrategy } from './pair-it.strategy';
import { GuessItStrategy } from './guess-it.strategy';
import { RecallItStrategy } from './recall-it.strategy';
import { TypeItStrategy } from './type-it.strategy';

@Injectable()
export class LearningStrategyFactory {
  private readonly strategies = new Map<
    LearningStrategyType,
    ILearningStrategy
  >();

  constructor() {
    this.strategies.set(LearningStrategyType.PAIR_IT, new PairItStrategy());
    this.strategies.set(LearningStrategyType.GUESS_IT, new GuessItStrategy());
    this.strategies.set(LearningStrategyType.RECALL_IT, new RecallItStrategy());
    this.strategies.set(LearningStrategyType.TYPE_IT, new TypeItStrategy());
  }

  getStrategy(type: LearningStrategyType): ILearningStrategy {
    const strategy = this.strategies.get(type);

    if (!strategy) {
      throw new Error(`Unhandled learning strategy type: ${type}`);
    }

    return strategy;
  }
}
