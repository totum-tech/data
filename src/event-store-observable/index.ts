import {autorun, flow, makeAutoObservable, makeObservable, observable} from "mobx";
import { v4 } from 'uuid';

function isEventRecorded(events, event) {
  const result = !!events.find(e => e.id === event.id);
  return result;
}
export class EventStore {
  events = observable([])
  storage = null;

  constructor(params) {
    makeAutoObservable(this);
    this.storage = params.storage;
    this.initialize()
      .then(() => console.info('eventStore::initialized'))
      .catch(e => console.error(e.message));
  }

  async initialize() {
    const events = await this.storage.load();
    this.events.replace(events)
    this.storage.subscribe(this.setEvent.bind(this))
  }

  setEvent(event) {
    if (!isEventRecorded(this.events, event)) {
      this.events.push(event);
    }
  }

  appendToStream(streamId: string, events: any[]) {
    const eventsToAdd = events.map(eventData => ({
      id: v4(),
      streamId,
      // @ts-ignore
      streamEventRevision: this.nextStreamEventRevision(streamId),
      // @ts-ignore
      globalEventPosition: this.nextGlobalEventRevision(),
      type: eventData.type,
      createdAt: new Date(),
      data: eventData.data,
      // @ts-ignore
      metadata: eventData.metadata ?? null,
    }))

    eventsToAdd.forEach(event => {
      this.events.push(event);
      this.storage.save(event);
    });
  }

  nextStreamEventRevision(streamId: string): number {
    return this.events.filter(e => e.streamId === streamId).length;
  }

  nextGlobalEventRevision(): number {
    return this.events.length;
  }

  eventsForStream(streamId: string) {
    return this.events.filter(e => e.streamId === streamId);
  }

  getStream(streamId: string): EventStream {
    return new EventStream({
      streamId,
      store: this
    });
  }
}

export class EventStream {
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

  appendToStream(events: any[]) {
    this.store.appendToStream(this.streamId, events);
  }
}
