import {IObservableArray, observable, values} from 'mobx';
import {Instance, types} from 'mobx-state-tree';
import {parseISO} from 'date-fns';

const GenericData = types.model('GenericData', {
  message: types.string,
});

export const RecordedEvent = types.model('RecordedEvent', {
  id: types.identifier,
  streamId: types.string,
  streamEventRevision: types.number,
  globalEventPosition: types.number,
  type: types.string,
  createdAt: types.Date,
  data: GenericData,
}).preProcessSnapshot(snapshot => {
  if (typeof snapshot.createdAt === 'string') {
    return {
    ...snapshot,
      // @ts-ignore
      createdAt: parseISO(snapshot.createdAt)
    }
  } else {
    return snapshot
  }
});

type RecordedEventType = Instance<typeof RecordedEvent>;

export function createEventStream(params) {
  const EventStream = types.model('EventStream', {
    events: types.optional(types.map(RecordedEvent), {})
  }).actions(stream => {
    async function initialize() {
      const loadedEvents = await params.storage.load();
      // @ts-ignore
      loadedEvents.forEach(event => stream.setEvent(event.id, event));
    }

    function setEvent(id, event) {
      stream.events.set(event.id, event);
    }

    function listenForEvents() {
      params.storage.subscribe(event => {
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
      return params.storage.save(recordedEvent);
    }

    return {
      initialize,
      setEvent,
      appendEvent,
      listenForEvents,
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
      return stream.events.filter(filterFn);
    }
  }));

  return EventStream.create({ events: {} });
}
