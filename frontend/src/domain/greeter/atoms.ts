import { atom } from 'jotai';
import type { HelloRequest, HelloResponse } from '@/proto/greeter';

// Define the structure of the greeter state
interface GreeterState {
  request: HelloRequest;
  reply: HelloResponse | null;
  loading: boolean;
  error: Error | null;
}

// Initial state for the greeter
const initialState: GreeterState = {
  request: { name: '' },
  reply: null,
  loading: false,
  error: null,
};

// Base atom for the greeter state
export const greeterStateAtom = atom<GreeterState>(initialState);

// Derived atoms for individual properties
export const requestAtom = atom(
  (get) => get(greeterStateAtom).request,
  (get, set, request: HelloRequest) => {
    set(greeterStateAtom, {
      ...get(greeterStateAtom),
      request,
    });
  }
);

export const replyAtom = atom(
  (get) => get(greeterStateAtom).reply,
  (get, set, reply: HelloResponse | null) => {
    set(greeterStateAtom, {
      ...get(greeterStateAtom),
      reply,
    });
  }
);

export const loadingAtom = atom(
  (get) => get(greeterStateAtom).loading,
  (get, set, loading: boolean) => {
    set(greeterStateAtom, {
      ...get(greeterStateAtom),
      loading,
    });
  }
);

export const errorAtom = atom(
  (get) => get(greeterStateAtom).error,
  (get, set, error: Error | null) => {
    set(greeterStateAtom, {
      ...get(greeterStateAtom),
      error,
    });
  }
);

// Derived atom for the name field in the request
export const nameAtom = atom(
  (get) => get(requestAtom).name,
  (get, set, name: string) => {
    set(requestAtom, {
      ...get(requestAtom),
      name,
    });
  }
);
