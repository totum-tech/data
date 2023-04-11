import { flow } from "lodash";
import { EventStore } from '../event-store'

export interface ICommand<DomainCommands, Payload> {
  name: DomainCommands,
  data: Payload,
}

export interface ICommandHandler {
  (command: ICommand<any, any> | ICommand<any, any>[]): Promise<void>
}

export function createStreamReader(store: EventStore) {
  return function (streamId: string) {
    return store.readStream(streamId);
  }
}

export function createStreamAppender(store: EventStore) {
  return (streamId: string) => (events: any[]): Promise<any> => store.appendMultipleToStream(streamId, events);
}

function evolveWith(evolver: any) {
  return (events: any[]) => {
    return events.reduce((congregant, event) => evolver(congregant, event), undefined)
  }
}

function decideEventsWith(decider: IDecider<any, any, any>) {
  return (command: any) => (entity: any) => decider(entity, command);
}

export interface IGetStreamID<ICommand> {
  (command: ICommand): string
}

export interface IEvolver<IDomainEntity, IEvent> {
  (aggregate: IDomainEntity, event: IEvent): IDomainEntity
}

export interface IDecider<IDomainEntity, ICommand, IEvent> {
  (aggregate: IDomainEntity, command: ICommand) : IEvent[]
}

export interface ICommandHandlerParams<IDomainEntity, ICommand, IEvent> {
  store: EventStore
  getStreamId: IGetStreamID<ICommand>
  evolver: IEvolver<IDomainEntity, IEvent>
  decider: IDecider<IDomainEntity, ICommand, IEvent>
}

export function createCommandHandler(params: ICommandHandlerParams<any, any, any>): ICommandHandler {
  const readStream = createStreamReader(params.store);
  const appendToStream = createStreamAppender(params.store);
  const decideEvents = decideEventsWith(params.decider);
  const evolveEntity = evolveWith(params.evolver);

  async function handleCommand(command: ICommand<any, any>): Promise<void> {
    const streamId = params.getStreamId(command);

    return flow([
      readStream,
      evolveEntity,
      decideEvents(command),
      appendToStream(streamId)
    ])(streamId);
  }

  async function handleCommandArray(command: ICommand<any, any>[]): Promise<void> {
    for (const currentCommand of command) {
      await handleCommand(currentCommand);
    }
  }

  return async function handleCommands(command: ICommand<any, any> | ICommand<any, any>[]): Promise<void> {
    if (Array.isArray(command)) {
      return handleCommandArray(command);
    }

    return handleCommand(command);
  }
}

export function composeCommandHandlers(handlers: ICommandHandler[]): ICommandHandler {
  return async function composedCommandHandler(command): Promise<void> {
    await Promise.all(handlers.map(handler => handler(command)));
    return;
  }
}
