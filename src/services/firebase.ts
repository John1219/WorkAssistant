import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import { AppState } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyCffAwJJgpe7o8Fhl0Cz9KI00YsJIRl7sA",
  authDomain: "workassistant-shifts.firebaseapp.com",
  projectId: "workassistant-shifts",
  storageBucket: "workassistant-shifts.firebasestorage.app",
  messagingSenderId: "1040613466487",
  appId: "1:1040613466487:web:8f8fa47a343c8c7fad4172"
};

// Initialize Firebase App safely (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

/**
 * Subscribe to real-time changes for a specific workspace.
 */
export function subscribeToWorkspace(
  workspaceId: string,
  onData: (data: Partial<AppState>) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const cleanId = (workspaceId || 'default').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const docRef = doc(db, 'workspaces', cleanId);

  return onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        if (cloudData && cloudData.state) {
          onData(cloudData.state as Partial<AppState>);
        }
      } else {
        // Document does not exist yet; will be created on first state push
        onData({});
      }
    },
    error => {
      console.warn('[Firebase Sync] Realtime listener error:', error);
      onError(error);
    }
  );
}

/**
 * Persist app state to Firestore for a workspace.
 */
export async function pushWorkspaceState(
  workspaceId: string,
  state: AppState
): Promise<void> {
  const cleanId = (workspaceId || 'default').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const docRef = doc(db, 'workspaces', cleanId);

  // Strip non-serializable fields if any
  const payload = {
    updatedAt: new Date().toISOString(),
    workspaceId: cleanId,
    state: {
      employees: state.employees,
      classes: state.classes,
      shifts: state.shifts,
      assignments: state.assignments,
      taskTypes: state.taskTypes,
      selectedClassId: state.selectedClassId,
      selectedDate: state.selectedDate
    }
  };

  await setDoc(docRef, payload, { merge: true });
}
