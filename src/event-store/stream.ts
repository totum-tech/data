import { RecordedEvent } from './recorded-event';
import { IStorage, StreamId } from './types';

export class Stream {
  readonly #storage: IStorage;
  readonly #events: RecordedEvent[] = [];

  constructor(args: { storage: IStorage }) {
    this.#storage = args.storage;
  }

  async loadEvents(): Promise<void> {
    const loadedEvents = await this.#storage.load();
    loadedEvents.forEach((event) => this.#events.push(event));
  }

  getSize(): number {
    return this.#events.length;
  }

  appendEvent(recordedEvent: RecordedEvent) {
    this.#events.push(recordedEvent);
    return this.#storage.save(recordedEvent);
  }

  getEvents() {
    return this.#events;
  }

  getEventsForStream(streamId: StreamId) {
    return this.#events.filter((event) => event.streamId === streamId);
  }
}
