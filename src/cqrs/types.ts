import { IRecordedEvent } from '..'
import { EventStore } from '..'

export interface IAggregateRoot {
  apply(event: IRecordedEvent): void;
}

export interface ICommand {
  name: string;
}

export interface ICommandBus {
  repo: EventStore;

  execute(command: ICommand): Promise<void>;
}
