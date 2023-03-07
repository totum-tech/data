import { IAggregateRoot } from './types';
import { IRecordedEvent } from '..';

export abstract class AggregateRoot implements IAggregateRoot {
  constructor(events: IRecordedEvent[]) {
    events.forEach((event) => this.apply(event));
  }
  abstract apply(event: IRecordedEvent): void;
}
