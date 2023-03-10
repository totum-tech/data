import { v4 } from 'uuid';
import { IEventStore, IEventStoreSubscriber, IRecordedEvent, IStorage, StreamId } from './types';
import { RecordedEvent } from './recorded-event';
import { SubscribersPerStream } from './subscribers-per-stream';
import { Event } from './event';
import { ALL_STREAM_ID } from './constants';
import { Stream } from './stream';

export class EventStore implements IEventStore {
  readonly #stream: Stream;
  readonly #subscribers: SubscribersPerStream;

  constructor(args: { storage: IStorage }) {
    this.#stream = new Stream({ storage: args.storage });
    this.#subscribers = new SubscribersPerStream();
  }

  async initialize() {
    await this.hydrate();
    this.#stream.subscribe(event => {
      this.#notify([event]);
    });
  }

  async hydrate() {
    await this.#stream.initialize();
  }

  async appendToStream(streamId: StreamId, events: Event<any, any>[]) {
    const recordedEvents = events.map((eventData) => {
      const recordedEvent = new RecordedEvent({
        id: v4(),
        streamId: streamId,
        streamEventRevision: this.#nextStreamEventRevision(streamId),
        globalEventPosition: this.#nextGlobalEventRevision(),
        type: eventData.type,
        createdAt: new Date(),
        data: eventData.data,
        metadata: eventData.metadata ?? null, // Firebase doesnt accept undefined
      });

      this.#stream.appendEvent(recordedEvent);
      return recordedEvent;
    });

    return { nextExpectedStreamRevision: this.#nextStreamEventRevision(streamId) };
  }

  subscribeToStream(streamId: StreamId, subscriber: IEventStoreSubscriber) {
    this.#subscribers.getOrCreate(streamId).addSubscriber(subscriber);
  }

  subscribeToAll(subscriber: IEventStoreSubscriber) {
    this.#getAllStreamSubscribers().addSubscriber(subscriber);
  }

  readStream(streamId: string): IRecordedEvent[] {
    return this.#stream.getEventsForStream(streamId);
  }

  readAllStream(): IRecordedEvent[] {
    return this.#stream.getEvents();
  }

  #getAllStreamSubscribers = () => {
    return this.#subscribers.getOrCreate(ALL_STREAM_ID);
  };

  #getAllStream = () => {
    return this.#stream.getEvents();
  };

  #notify = (events: RecordedEvent[]) => {
    events.forEach((event) => {
      this.#subscribers.notify(event.streamId, event);
      this.#getAllStreamSubscribers().notify(event);
    });
  };

  #nextStreamEventRevision = (streamId: StreamId) => {
    return this.#stream.getEventsForStream(streamId).length;
  };

  #nextGlobalEventRevision = () => {
    return this.#getAllStream().length;
  };
}
