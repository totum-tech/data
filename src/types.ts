
type StreamId = string;

export type IEvent<Data = any, Metadata = any> = {
  type: string;
  data: Data;
  metadata: Metadata;
}

export type IRecordedEvent<Data = unknown, Metadata = unknown> = {
  id: string;
  streamId: StreamId;
  streamEventRevision: number;
  globalEventPosition: number;
  type: string;
  createdAt: Date;
  data: Data;
  metadata: Metadata;
};

export interface IStorage {
  save(event: IRecordedEvent): Promise<void>;
  load(): Promise<IRecordedEvent[]>;

  subscribe(listener) : void;
}

export interface IEventStore {
  initialize(): Promise<void>;
  teardown(): Promise<void>;

  appendToStream(
    streamId: string,
    event: IEvent
): Promise<{ nextExpectedStreamRevision: number }>;

  nextStreamEventRevision(streamId: string): number;

  nextGlobalEventRevision(): number;

  eventsForStream(streamId: string): IRecordedEvent[];

  readStream(streamId: string): IRecordedEvent[];

  readAllStream(): IRecordedEvent[];
}

export interface IEventStream {
  appendToStream(event: IEvent): Promise<{ nextExpectedStreamRevision: number }>;
}
