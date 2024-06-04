import { writable, get } from 'svelte/store';

const storage = (key, initValue) => {
    const store = writable(initValue);

    const storedValueStr = sessionStorage.getItem(key);
    if (storedValueStr != null) store.set(JSON.parse(storedValueStr));

    store.subscribe((val) => {
        if ([null, undefined].includes(val)) {
            sessionStorage.removeItem(key)
        } else {
            sessionStorage.setItem(key, JSON.stringify(val))
        }
    })

    window.addEventListener('storage', () => {
        const storedValueStr = sessionStorage.getItem(key);
        if (storedValueStr == null) return;

        const localValue = JSON.parse(storedValueStr)
        if (localValue !== get(store)) store.set(localValue);
    });

    return store;
};

export const userData = storage("userData", null);
