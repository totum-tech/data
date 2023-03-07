import { EventStore } from '../../src/event-store/event-store';
import { IEmittedEvent, IRecordedEvent, IStorage } from '../../src/event-store/types';
import { RecordedEvent } from '../../src/event-store/recorded-event';

const TEST_STORAGE: IStorage = {
  save(event): Promise<void> {
    return new Promise((resolve) => resolve());
  },
  load(): Promise<IRecordedEvent[]> {
    return new Promise((resolve) => resolve([]));
  },
};

const TEST_STREAM = 'WalkingWithJesus';
const TEST_STREAM_2 = 'Community';
const TEST_EVENT: IEmittedEvent = {
  type: 'readTheWord',
  data: {
    book: 'Revelation',
    chapter: '1',
    startVerse: '5',
    endVerse: '6',
  },
  metadata: {},
};

function createEventStore() {
  return new EventStore({ storage: TEST_STORAGE });
}

describe('given an EventStore', () => {
  describe('when appending to an event stream', () => {
    it('then return next expected stream revision', async () => {
      const eventStore = createEventStore();
      const result = await eventStore.appendToStream(TEST_STREAM, [TEST_EVENT]);

      expect(result.nextExpectedStreamRevision).toBe(1);
    });
  });

  describe('when reading from a stream', () => {
    it('then returns an array of RecordedEvents for the relevant stream', () => {
      const eventStore = createEventStore();
      eventStore.appendToStream(TEST_STREAM, [TEST_EVENT]);
      const events = eventStore.readStream(TEST_STREAM);

      expect(events.length).toBe(1);
      expect(events[0]).toBeInstanceOf(RecordedEvent);
    });
  });

  describe('when subscribed to an event stream', () => {
    it('then subscriber receives all events published to the stream', () => {
      const eventStore = createEventStore();
      const subscriber = jest.fn();
      eventStore.subscribeToStream(TEST_STREAM, subscriber);
      eventStore.appendToStream(TEST_STREAM, [TEST_EVENT]);

      expect(subscriber.mock.calls.length).toBe(1);
      expect(subscriber.mock.calls[0][1]).toBeInstanceOf(RecordedEvent);
    });
  });

  describe('when reading all events from the event store', () => {
    it('then returns all the RecordedEvents in the system', () => {
      const eventStore = createEventStore();
      const allEvents = eventStore.readAllStream();
      eventStore.appendToStream(TEST_STREAM, [TEST_EVENT]);
      eventStore.appendToStream(TEST_STREAM_2, [TEST_EVENT]);

      expect(allEvents.length).toBe(2);
      expect(allEvents[0].streamId).toBe(TEST_STREAM);
      expect(allEvents[1].streamId).toBe(TEST_STREAM_2);
    });
  });
});
