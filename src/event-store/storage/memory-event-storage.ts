import { IRecordedEvent, IStorage } from '../types';

class InMemoryEventRepo implements IStorage {
  events: IRecordedEvent[];

  constructor() {
    this.events = [];
  }

  load(): Promise<IRecordedEvent[]> {
    return new Promise((resolve) => {
      resolve(this.events);
    });
  }

  save(event: IRecordedEvent): Promise<void> {
    return new Promise((resolve) => {
      this.events.push(event);
      resolve();
    });
  }

  subscribe(listener) {
    return () => new Promise(resolve => resolve(null))
  }
}

export default InMemoryEventRepo;
