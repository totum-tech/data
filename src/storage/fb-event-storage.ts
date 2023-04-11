import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import {IRecordedEvent, IStorage} from "../types";

function formatDatesInSnapshot(snapshot) {
  function recursiveFormat(obj) {
    const formattedObj = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (!obj[key]) {
          formattedObj[key] = obj[key]
        } else if (typeof obj[key].toDate === 'function') {
          formattedObj[key] = obj[key].toDate();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          formattedObj[key] = recursiveFormat(obj[key]);
        } else {
          formattedObj[key] = obj[key];
        }
      }
    }

    return formattedObj;
  }

  return recursiveFormat(snapshot);
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
    const unsubscriber = this.firestore.collection(this.path)
      .orderBy("createdAt")
      .limitToLast(1)
      .onSnapshot(snapshot => {
        if (!snapshot) { return; }
        const changes = snapshot.docChanges();
        changes.forEach(change => {
          if (change.type === "added") {
            const recordData = change.doc.data();
            listener(formatDatesInSnapshot(recordData));
          }
        });
      });

    return () => new Promise(resolve => {
      unsubscriber();
      resolve(undefined);
    });
  }
}

export default FirebaseEventStorage;
