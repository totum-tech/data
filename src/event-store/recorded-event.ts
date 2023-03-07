import { IRecordedEventPayload, IRecordedEventMetaData, IRecordedEvent, StreamId } from './types';

export class RecordedEvent implements IRecordedEvent {
  id: string;
  streamId: StreamId;
  streamEventRevision: number;
  globalEventPosition: number;
  type: string;
  createdAt: Date;
  data: IRecordedEventPayload;
  metadata: IRecordedEventMetaData;

  constructor(args: {
    id: string;
    streamId: StreamId;
    streamEventRevision: number;
    globalEventPosition: number;
    type: string;
    createdAt: Date;
    data: Record<any, any>;
    metadata: Record<any, any>;
  }) {
    this.id = args.id;
    this.streamId = args.streamId;
    this.streamEventRevision = args.streamEventRevision;
    this.globalEventPosition = args.globalEventPosition;
    this.type = args.type;
    this.createdAt = args.createdAt;
    this.data = args.data;
    this.metadata = args.metadata;
  }
}
