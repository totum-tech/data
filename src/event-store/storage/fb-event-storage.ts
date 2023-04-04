import { IRecordedEvent, IStorage } from '../types';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

function formatDatesInSnapshot(snapshot) {
  const formattedSnapshot = {};

  for (const key in snapshot) {
    if (snapshot.hasOwnProperty(key)) {
      if (typeof snapshot[key]?.toDate === 'function') {
        formattedSnapshot[key] = snapshot[key].toDate();
      } else {
        formattedSnapshot[key] = snapshot[key];
      }
    }
  }

  return formattedSnapshot;
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
        data: formatDatesInSnapshot(eventData.data),
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
            listener(formatDatesInSnapshot(recordData));
          }
        });
      });
  }
}

export default FirebaseEventStorage;
