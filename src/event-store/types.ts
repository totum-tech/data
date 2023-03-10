export type StreamId = string;

export interface IEventStoreSubscriber {
  (streamId: string, event: IRecordedEvent): Promise<void>;
}

export interface IRecordedEventPayload<T = unknown> {
  [key: string]: T;
}

export interface IRecordedEventMetaData<T = unknown> {
  [key: string]: T;
}

export type IEmittedEvent<Data = unknown, Metadata = unknown> = {
  type: string;
  data: IRecordedEventPayload<Data>;
  metadata: IRecordedEventMetaData<Metadata>;
};

export type IRecordedEvent<Data = unknown, Metadata = unknown> = {
  id: string;
  streamId: StreamId;
  streamEventRevision: number;
  globalEventPosition: number;
  type: string;
  createdAt: Date;
  data: IRecordedEventPayload<Data>;
  metadata: IRecordedEventMetaData<Metadata>;
};

export interface IEventStore {
  hydrate(): Promise<void>;

  appendToStream(
    streamId: string,
    events: IEmittedEvent[]
  ): Promise<{ nextExpectedStreamRevision: number }>;

  readStream(streamId: string): IRecordedEvent[];

  readAllStream(): IRecordedEvent[];

  subscribeToStream(streamId: string, subscriber: IEventStoreSubscriber);

  subscribeToAll(subscriber: IEventStoreSubscriber);
}

export interface IStorage {
  save(event: IRecordedEvent): Promise<void>;
  load(): Promise<IRecordedEvent[]>;

  subscribe(listener) : void;
}

export type EmptyPayload = {};
export type EmptyMetadata = {};
