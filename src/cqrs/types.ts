import { IRecordedEvent } from '..'
import { EventStore } from '..'

export interface IAggregateRoot {
  apply(event: IRecordedEvent): void;
}

export interface ICommand<DomainCommand, Payload> {
  name: DomainCommand,
  data: Payload,
}

export interface ICommandBus {
  repo: EventStore;

  execute(command: ICommand<any, any>): Promise<void>;
}
