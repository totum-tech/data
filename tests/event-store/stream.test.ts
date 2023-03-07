import faker from 'faker';
import { RecordedEvent } from '../../src/event-store/recorded-event';
import { Stream } from '../../src/event-store/stream';
import { IRecordedEvent, IStorage } from '../../src/event-store/types';

describe('given Stream', () => {
  const TEST_STREAM_ID = 'WalkingWithJesus';
  const TEST_STORAGE: IStorage = {
    save(event): Promise<void> {
      return new Promise((resolve) => resolve());
    },
    load(): Promise<IRecordedEvent[]> {
      return new Promise((resolve) => resolve([]));
    },
  };
  const stream = new Stream({ storage: TEST_STORAGE });

  describe('when stream is empty', () => {
    it('then returns an empty stream', () => {
      const events = stream.getEvents();
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(0);
    });
    it('then returns a stream size of 0', () => {
      const size = stream.getSize();
      expect(size).toBe(0);
    });
    it('then returns a stream of 1 when an event is added', () => {
      const recordedEvent: RecordedEvent = {
        id: faker.random.uuid(),
        streamId: TEST_STREAM_ID,
        streamEventRevision: 0,
        globalEventPosition: 0,
        type: 'pray',
        createdAt: new Date(),
        data: {
          for: 'my family',
        },
        metadata: {},
      };

      stream.appendEvent(recordedEvent);
      expect(stream.getSize()).toBe(1);
      expect(stream.getEvents()[0]).toBe(recordedEvent);
    });
  });
});
