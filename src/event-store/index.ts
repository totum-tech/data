import {autorun, makeAutoObservable, observable} from "mobx";
import { v4 } from 'uuid';
import {IEvent, IEventStore, IEventStream, IRecordedEvent} from "../types";

function isEventRecorded(events, event) {
  return !!events.find(e => e.id === event.id);
}

export class EventStore implements IEventStore {
  events = observable([]);
  storage = null;
  unsubscribeStorageListener = null;

  constructor(params) {
    makeAutoObservable(this);
    this.storage = params.storage;
    this.initialize()
      .then(() => console.info('eventStore::initialized'))
      .catch(e => console.error(e.message));
  }

  async initialize(): Promise<void> {
    const events = await this.storage.load();
    events.forEach(event => this.setEvent(event));
    this.unsubscribeStorageListener = this.storage.subscribe(this.setEvent.bind(this))
  }

  async teardown() {
    try {
      console.info('EventStore#teardown')
      this.unsubscribeStorageListener();
      console.info('EventStore#teardown::success')
    } catch (e) {
      console.error('EventStore#teardown::error', e.message)
    }
  }

  setEvent(event) {
    if (!isEventRecorded(this.events, event)) {
      this.events.push(event);
    }
  }

  async appendToStream(streamId: string, event: IEvent<any, any>): Promise<{ nextExpectedStreamRevision: number }> {
    const eventToAdd : IRecordedEvent = {
      id: v4(),
      streamId,
      // @ts-ignore
      streamEventRevision: this.nextStreamEventRevision(streamId),
      // @ts-ignore
      globalEventPosition: this.nextGlobalEventRevision(),
      type: event.type,
      createdAt: new Date(),
      data: event.data,
      // @ts-ignore
      metadata: event.metadata ?? null,
    }

    this.setEvent(eventToAdd);
    await this.storage.save(eventToAdd);
    return { nextExpectedStreamRevision: this.nextStreamEventRevision(streamId) }
  }

  async appendMultipleToStream(streamId: string, events: IEvent<any, any>[]): Promise<{ nextExpectedStreamRevision: number }> {
    if (!events.length) {
      throw new Error('No events provided to appendMultipleToStream');
    }

    for (const event of events) {
      await this.appendToStream(streamId, event);
    }

    return { nextExpectedStreamRevision: this.nextStreamEventRevision(streamId) };
  }

  nextStreamEventRevision(streamId: string): number {
    return this.events.filter(e => e.streamId === streamId).length + 1;
  }

  nextGlobalEventRevision(): number {
    return this.events.length;
  }

  eventsForStream(streamId: string): IRecordedEvent[] {
    return this.events.filter(e => e.streamId === streamId);
  }

  readStream(streamId: string): IRecordedEvent[] {
    return this.eventsForStream(streamId);
  }

  readAllStream(): IRecordedEvent[] {
    return this.events;
  }

  getStream(streamId: string): EventStream {
    return new EventStream({
      streamId,
      store: this
    });
  }
}

export class EventStream implements IEventStream{
  streamId: string;
  events = observable([]);
  store = null;
  constructor(params) {
    this.streamId = params.streamId;
    this.store = params.store

    autorun(() => {
      const stream = this.store.events.filter(e => e.streamId === this.streamId);
      this.events.replace(stream);
    })
    makeAutoObservable(this);
  }

  appendToStream(event: IEvent): Promise<{ nextExpectedStreamRevision: number }> {
    return this.store.appendToStream(this.streamId, event);
  }
}
