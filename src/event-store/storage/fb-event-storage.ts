import { IRecordedEvent, IStorage } from '../types';
import firebase from 'firebase';
import 'firebase/firestore';
import {fromUnixTime} from 'date-fns';

function formatCreatedAt(snapshot) {
  return {
    ...snapshot,
    createdAt: fromUnixTime(snapshot.createdAt.nanoseconds)
  }
}

class FirebaseEventStorage implements IStorage {
  firestore: firebase.firestore.Firestore;
  path: string;

  constructor({ firestore, path }: { firestore: firebase.firestore.Firestore; path: string }) {
    this.firestore = firestore;
    this.path = path;
  }

  async save(event: IRecordedEvent): Promise<void> {
    const collectionRef = this.firestore.collection(this.path);
    await collectionRef.add({ ...event });
  }
  async load(): Promise<IRecordedEvent[]> {
    const collectionRef = this.firestore.collection(this.path);
    const { docs } = await collectionRef.orderBy('globalEventPosition').get();
    return docs.map((event) => {
      const eventData = event.data();
      const createdAt: firebase.firestore.Timestamp = eventData.createdAt;
      return {
        id: eventData.id,
        streamId: eventData.streamId,
        streamEventRevision: eventData.streamEventRevision,
        globalEventPosition: eventData.globalEventPosition,
        type: eventData.type,
        createdAt: createdAt.toDate(),
        data: eventData.data,
        metadata: eventData.metadata,
      };
    });
  }

  subscribe(listener) {
    this.firestore.collection(this.path)
      .orderBy("createdAt")
      .limitToLast(1)
      .onSnapshot(snapshot => {
        const changes = snapshot.docChanges();
        changes.forEach(change => {
          if (change.type === "added") {
            const recordData = change.doc.data();
            listener(formatCreatedAt(recordData));
          }
        });
      });
  }
}

export default FirebaseEventStorage;
