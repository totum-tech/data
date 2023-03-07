import { IEventStoreSubscriber, StreamId } from './types';
import { RecordedEvent } from './recorded-event';

export class Subscribers extends Set<IEventStoreSubscriber> {
  readonly #streamId: StreamId;

  constructor(args: { streamId: StreamId }) {
    super();
    this.#streamId = args.streamId;
  }

  notify(event: RecordedEvent) {
    this.forEach((handler) => handler(this.#streamId, event));
  }

  addSubscriber(subscriber: IEventStoreSubscriber) {
    this.add(subscriber);
  }
}
