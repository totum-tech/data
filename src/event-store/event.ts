import { IEmittedEvent } from './types';

export class Event<Payload, Metadata> implements IEmittedEvent<any, any> {
  type: string;
  data: Payload;
  metadata: Metadata;

  constructor(payload?: Payload, meta?: Metadata) {
    this.data = payload ?? ({} as Payload);
    this.metadata = meta ?? ({} as Metadata);
  }
}
