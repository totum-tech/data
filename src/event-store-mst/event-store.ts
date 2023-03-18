import {RecordedEvent} from "./event";
import {getParent, types} from "mobx-state-tree";
import { v4 } from 'uuid';
import {EventStream} from "./stream";

export const EventStore = types
  .model({
    storage: types.optional(types.frozen(), {}),
    stream: types.optional(EventStream, {}),
  })
  .actions((self) => ({
    async initialize() {
      await self.stream.initialize();
      // @ts-ignore
      self.stream.subscribe(self.notify);
    },
    async hydrate() {
      await self.stream.initialize();
    },
    async appendToStream(streamId, events) {
      events.map((eventData) => {
        const recordedEvent = RecordedEvent.create({
          id: v4(),
          streamId: streamId,
          // @ts-ignore
          streamEventRevision: self.nextStreamEventRevision(streamId),
          // @ts-ignore
          globalEventPosition: self.nextGlobalEventRevision(),
          type: eventData.type,
          createdAt: new Date(),
          data: eventData.data,
          // @ts-ignore
          metadata: eventData.metadata ?? null,
        });
        self.stream.appendEvent(recordedEvent);
        return recordedEvent;
      });

      // @ts-ignore
      return {nextExpectedStreamRevision: self.nextStreamEventRevision(streamId)};
    },
    notify(events) {
      events.forEach((event) => {
        // @ts-ignore
        self.subscribers.notify(event.streamId, event);
        // @ts-ignore
        self.subscribersPerAllStream.notify(event);
      });
    },
    subscribeToStream(streamId, subscriber) {
      // @ts-ignore
      self.stream.subscribersPerStream.get(streamId).addSubscriber(subscriber);
    },
    subscribeToAll(subscriber) {
      // @ts-ignore
      self.stream.subscribersPerAllStream.addSubscriber(subscriber);
    },
    readStream(streamId) {
      return self.stream.eventsForStream(streamId);
    },
    nextStreamEventRevision(streamId) {
      return self.stream.eventsForStream(streamId).length;
    },
    nextGlobalEventRevision() {
      return self.stream.getEvents().length;
    },
  })).views(self => ({
    get readAllStream() {
      return self.stream.allEvents;
    },
  }));
