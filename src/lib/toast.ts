import { useSyncExternalStore } from 'react';

export type Toast = { id: number; message: string; tone: 'info' | 'success' | 'error' };

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function dismissToast(id: number): void {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function pushToast(message: string, tone: Toast['tone'] = 'info'): void {
  const id = nextId++;
  toasts = [...toasts.slice(-2), { id, message, tone }];
  emit();
  window.setTimeout(() => dismissToast(id), tone === 'error' ? 6000 : 3200);
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => toasts,
  );
}
