import {values} from 'mobx';
import { v4 } from 'uuid';
import { types} from 'mobx-state-tree';
import {RecordedEvent, RecordedEventType} from "./event";

const listeners = new Map();

export const EventStream = types.model('EventStream', {
  id: types.optional(types.identifier, () => v4()),
  events: types.optional(types.map(RecordedEvent), {}),
  storage: types.optional(types.frozen(), {})
}).actions(stream => {
  async function initialize() {
    const loadedEvents = await stream.storage.load();
    // @ts-ignore
    loadedEvents.forEach(event => stream.setEvent(event.id, event));

    // @ts-ignore
    stream.listenForEvents();
  }

  function setEvent(id, event) {
    stream.events.set(event.id, event);
  }

  function listenForEvents() {
    stream.storage.subscribe(event => {
      // @ts-ignore
      const eventExistsLocally = stream.isEventRecorded(event);
      if (eventExistsLocally) {
        console.info('Event already recorded locally.');
        return;
      } else {
        // @ts-ignore
        stream.setEvent(event.id, event);
      }
    })
  }

  function appendEvent(recordedEvent: any) {
    // @ts-ignore
    stream.setEvent(recordedEvent.id, recordedEvent);
    return stream.storage.save(recordedEvent);
  }

  function subscribe(listener) {
    if (!listeners.get(stream.id)) {
      listeners.set(stream.id, new Set());
    }
    const listenersForStream = listeners.get(stream.id);
    listenersForStream.add(listener);
  }

  function unsubscribe(listener) {
    const listenersForStream = listeners.get(stream.id);
    if (!listenersForStream) {
      throw new Error('Unsubscribe called before listener registered.');
    } else if (!listenersForStream.has(listener)) {
      throw new Error('Listener does not exist.');
    } else {
      listenersForStream.delete(listener);
    }
  }

  return {
    initialize,
    setEvent,
    appendEvent,
    listenForEvents,
    subscribe,
    unsubscribe,
  }
}).views(stream => ({
  isEventRecorded: event => {
    return !!stream.events.get(event.id);
  },
  get eventCount() {
    return values(stream.events).length;
  },
  getEvents() {
    return values(stream.events);
  },
  get allEvents() {
    const events = stream.events;
    return values(events);
  },
  eventsForStream(streamId: string) {
    function filterFn(event: RecordedEventType): boolean {
      return event.streamId === streamId;
    }
    // @ts-ignore
    return values(stream.events).filter(filterFn);
  }
}));
