import {IEvent, IRecordedEvent, IStorage} from "../../src/types";
import {EventStore} from "../../src";

const TEST_STORAGE: IStorage = {
  save(event): Promise<void> {
    return new Promise((resolve) => resolve());
  },
  load(): Promise<IRecordedEvent[]> {
    return new Promise((resolve) => resolve([]));
  },
  subscribe() {}
};

const TEST_STREAM = 'WalkingWithJesus';
const TEST_STREAM_2 = 'Community';
const TEST_EVENT: IEvent = {
  type: 'readTheWord',
  data: {
    book: 'Revelation',
    chapter: '1',
    startVerse: '5',
    endVerse: '6',
  },
  metadata: {},
};

const TEST_EVENT_2: IEvent = {
  type: 'readTheWord',
  data: {
    book: 'Revelation',
    chapter: '1',
    startVerse: '7',
    endVerse: '8',
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
      const result = await eventStore.appendToStream(TEST_STREAM, TEST_EVENT);

      expect(result.nextExpectedStreamRevision).toBe(1);
    });
  });

  describe('when appending multiple to an event stream', () => {
    it('then return next expected stream revision', async () => {
      const eventStore = createEventStore();
      const { nextExpectedStreamRevision } = await eventStore.appendMultipleToStream(TEST_STREAM, [TEST_EVENT, TEST_EVENT_2]);
      const allEvents = eventStore.readAllStream();

      expect(allEvents.length).toBe(2);
      expect(allEvents[0].streamId).toBe(TEST_STREAM);
      expect(nextExpectedStreamRevision).toBe(3);
    });
  });

  describe('when reading from a stream', () => {
    it('then returns an array of RecordedEvents for the relevant stream', () => {
      const eventStore = createEventStore();
      eventStore.appendToStream(TEST_STREAM, TEST_EVENT);
      const events = eventStore.readStream(TEST_STREAM);

      expect(events.length).toBe(1);
    });
  });

  describe('when reading all events from the event store', () => {
    it('then returns all the RecordedEvents in the system', () => {
      const eventStore = createEventStore();
      const allEvents = eventStore.readAllStream();
      eventStore.appendToStream(TEST_STREAM, TEST_EVENT);
      eventStore.appendToStream(TEST_STREAM_2, TEST_EVENT);

      expect(allEvents.length).toBe(2);
      expect(allEvents[0].streamId).toBe(TEST_STREAM);
      expect(allEvents[1].streamId).toBe(TEST_STREAM_2);
    });
  });
});
