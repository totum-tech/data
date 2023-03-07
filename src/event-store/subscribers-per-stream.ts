import { StreamId } from './types';
import { Subscribers } from './subscribers';
import { RecordedEvent } from './recorded-event';

export class SubscribersPerStream extends Map<StreamId, Subscribers> {
  getOrCreate(streamId: StreamId) {
    if (!this.has(streamId)) {
      this.set(streamId, new Subscribers({ streamId }));
    }

    return this.get(streamId);
  }

  notify(streamId: StreamId, event: RecordedEvent) {
    this.getOrCreate(streamId).notify(event);
  }
}
