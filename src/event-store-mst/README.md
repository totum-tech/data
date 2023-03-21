# Totum Data

## Event Storage
Purpose: To synchronize persisted event data with a remote data source.

## Event Stream
Purpose: To read and write to a stream of events

## Event Store
Purpose: Primary interface for user to interact with events

## Observable Event Store Example
```js
const storage = new SupabaseEventStorage({ supabase, id });
storage.load() // loads events
storage.save(event) // saves an event
storage.subscribe(store.setEvent) // subscribes to upstream changes
storage.unsubscribe() // unsubscribes from upstream changes

const store = new EventStore({ storage: SupabaseEventStorage });
store.events // observable list of events
store.appendToStream(streamId, newEvents);
const stream = store.getStream('threads'); // returns an EventStream

stream.appendToStream(newEvents);
stream.events;

const chatQuery = new ChatQuery({ store });
chatQuery.allChats // observable list
chatQuery.messagesForChat(chatId) // observable list
```
