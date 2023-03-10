import { RecordedEvent } from './recorded-event';
import { IStorage, StreamId } from './types';

function isEventRecorded(events, event) {
  const result = !!events.find(e => e.id === event.id);
  return result;
}
export class Stream {
  readonly #storage: IStorage;
  readonly #events: RecordedEvent[] = [];

  #subscribers: Set<any> = new Set();

  constructor(args: { storage: IStorage }) {
    this.#storage = args.storage;
  }

  async initialize() {
    await this.loadEvents();
    this.listenForEvents();
  }

  async loadEvents(): Promise<void> {
    const loadedEvents = await this.#storage.load();
    loadedEvents.forEach((event) => this.#events.push(event));
  }

  listenForEvents() : void {
    this.#storage.subscribe(event => {
      const eventExistsLocally = isEventRecorded(this.#events, event);
      if (eventExistsLocally) {
        console.info('Event already recorded locally.');
        return;
      } else {
        this.#events.push(event);
        this.notifySubscribers(event);
      }
    });
  }

  notifySubscribers(event): void {
    this.#subscribers.forEach(listener => listener(event));
  }

  subscribe(listener): void {
    this.#subscribers.add(listener);
  }

  unsubscribe(listener): void {
    if (!this.#subscribers.has(listener)) { throw new Error('Listener does not exist.') }
    this.#subscribers.delete(listener);
  }

  getSize(): number {
    return this.#events.length;
  }

  appendEvent(recordedEvent: RecordedEvent) {
    this.#events.push(recordedEvent);
    this.notifySubscribers(recordedEvent);
    return this.#storage.save(recordedEvent);
  }

  getEvents() {
    console.info('Stream::getEvents')
    // Need to return new Array otherwise causes issue with React state
    return [...this.#events];
  }

  getEventsForStream(streamId: StreamId) {
    return this.#events.filter((event) => event.streamId === streamId);
  }
}
