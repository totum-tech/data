import { EventStore } from '..'
import { ICommand, ICommandBus } from './types'

export abstract class CommandBus implements ICommandBus {
  repo: EventStore;
  constructor(repo: EventStore) {
    this.repo = repo;
  }
  abstract execute(command: ICommand<any, any>): Promise<void>;
}
