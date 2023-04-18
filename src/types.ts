
type StreamId = string;

export interface IEvent<Type = string, Data = Record<string, any>, Metadata = Record<string, any>> {
  type: Type;
  data: Data;
  metadata?: Metadata;
}

export interface IRecordedEvent<Type = string, Data = Record<string, any>, Metadata = Record<string, any>> extends IEvent<Type, Data, Metadata> {
  id: string;
  streamId: StreamId;
  streamEventRevision: number;
  globalEventPosition: number;
  createdAt: Date;
}

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
