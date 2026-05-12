import React from 'react';
import { X } from 'lucide-react';

const ShortcutRow = ({ keys, description }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
        <span className="text-sm text-gray-600">{description}</span>
        <div className="flex items-center gap-1">
            {keys.map((k, i) => (
                <React.Fragment key={i}>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-md shadow-sm font-mono">
                        {k}
                    </kbd>
                    {i < keys.length - 1 && <span className="text-gray-400 text-xs">+</span>}
                </React.Fragment>
            ))}
        </div>
    </div>
);

const ShortcutsModal = ({ onClose }) => {
    const editorShortcuts = [
        { keys: ['Ctrl', 'S'], description: 'Save & Preview document' },
        { keys: ['Ctrl', 'Enter'], description: 'Add new line item' },
    ];

    const previewShortcuts = [
        { keys: ['Ctrl', 'D'], description: 'Download PDF' },
    ];

    const globalShortcuts = [
        { keys: ['?'], description: 'Show this help panel' },
        { keys: ['Esc'], description: 'Close this panel' },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Keyboard Shortcuts</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Speed up your workflow</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-5">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Invoice Editor</h3>
                        {editorShortcuts.map((s, i) => <ShortcutRow key={i} {...s} />)}
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Preview Page</h3>
                        {previewShortcuts.map((s, i) => <ShortcutRow key={i} {...s} />)}
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Global</h3>
                        {globalShortcuts.map((s, i) => <ShortcutRow key={i} {...s} />)}
                    </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">
                        Mac users: use <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono">⌘</kbd> instead of Ctrl
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShortcutsModal;
