import {EventStore} from "../event-store/event-store";

export type PersistedEvent = any & { streamId: string }
export interface IProjector {
  (events: PersistedEvent): void
}

interface IConnectProjector {
  store: EventStore,
  projector: IProjector
}

export function connectProjector(params: IConnectProjector) {
  async function eventListener(_streamId: string, event: PersistedEvent) {
    params.projector(event);
  }
  const events = params.store.readAllStream() as unknown as PersistedEvent;
  events.forEach((event: PersistedEvent) => {
    params.projector(event);
  });
  params.store.subscribeToAll(eventListener);

  return function unsubscribe() {
    // Need to add unsubscribe fn to EventStore
  }
}
