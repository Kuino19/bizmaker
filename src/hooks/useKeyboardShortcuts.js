import { useEffect } from 'react';

/**
 * Attaches keyboard shortcut listeners.
 * @param {Array<{ key: string, ctrl?: boolean, shift?: boolean, action: () => void, description?: string }>} shortcuts
 * @param {boolean} enabled - Set to false to disable all shortcuts (e.g. when a modal is open)
 */
const useKeyboardShortcuts = (shortcuts = [], enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handler = (e) => {
            // Don't trigger shortcuts when typing in inputs/textareas
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') {
                // Allow Escape regardless
                if (e.key !== 'Escape') return;
            }

            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
                const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey || shortcut.key === '?';
                const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

                if (ctrlMatch && shiftMatch && keyMatch) {
                    e.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [shortcuts, enabled]);
};

export default useKeyboardShortcuts;
