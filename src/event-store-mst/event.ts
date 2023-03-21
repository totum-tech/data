import {Instance, types} from "mobx-state-tree";
import {parseISO} from "date-fns";

export const GenericData = types.model('GenericData', {
  message: types.string,
});
export const RecordedEvent = types.model('RecordedEvent', {
  id: types.identifier,
  streamId: types.string,
  streamEventRevision: types.number,
  globalEventPosition: types.number,
  type: types.string,
  createdAt: types.Date,
  data: GenericData,
}).preProcessSnapshot(snapshot => {
  if (typeof snapshot.createdAt === 'string') {
    return {
      ...snapshot,
      // @ts-ignore
      createdAt: parseISO(snapshot.createdAt)
    }
  } else {
    return snapshot
  }
});
export type RecordedEventType = Instance<typeof RecordedEvent>;
