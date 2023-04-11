import { v4 } from 'uuid';
import MemoryEventStorage from '../../../src/storage/memory-event-storage';

describe('MemoryEventStorage', () => {
  let repoInstance;
  const getRepo = () => {
    if (!repoInstance) {
      repoInstance = new MemoryEventStorage();
    }
    return repoInstance;
  };

  it('should export a create repo function', () => {
    expect(MemoryEventStorage).toBeTruthy();
  });
  it('should start create a repo', () => {
    const repo = getRepo();

    expect(repo).toBeTruthy();
  });

  describe('save', () => {
    it('it should save an event to the log', async () => {
      const repo = getRepo();
      await repo.save({ id: v4(), type: 'test-event' });
      const events = await repo.load();

      expect(events.length).toBe(1);
    });
  });

  describe('load', () => {
    it('it should load the events', async (done) => {
      const repo = getRepo();
      const events = await repo.load();
      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
      expect(events[0].type).toBe('test-event');
      expect(events[0].id).toBeTruthy();
      done();
    });
  });
});
