import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, Edit3, FilePlus, Mail, Copy, AlertCircle } from 'lucide-react';

const EVENT_CONFIG = {
    created: { icon: FilePlus, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Document created' },
    updated: { icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Document updated' },
    status_changed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Status changed' },
    emailed: { icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Email sent to client' },
    duplicated: { icon: Copy, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Duplicated from another document' },
};

const EventItem = ({ event, isLast }) => {
    const config = EVENT_CONFIG[event.type] || {
        icon: AlertCircle,
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        label: event.type
    };
    const Icon = config.icon;

    return (
        <div className="flex gap-3 items-start">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                    <Icon size={14} className={config.color} />
                </div>
                {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1 mb-1 min-h-[1rem]" />}
            </div>

            {/* Content */}
            <div className={`pb-${isLast ? '0' : '3'} min-w-0 flex-1`}>
                <p className="text-sm font-medium text-gray-800">
                    {event.label || config.label}
                </p>
                {event.detail && (
                    <p className="text-xs text-gray-500 mt-0.5">{event.detail}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </p>
            </div>
        </div>
    );
};

const ActivityTimeline = ({ events = [] }) => {
    if (!events || events.length === 0) {
        return (
            <div className="flex items-center gap-2 py-3 text-gray-400">
                <Clock size={14} />
                <span className="text-xs">No activity recorded yet.</span>
            </div>
        );
    }

    // Sort newest first
    const sorted = [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="space-y-0 py-2">
            {sorted.map((event, i) => (
                <EventItem
                    key={i}
                    event={event}
                    isLast={i === sorted.length - 1}
                />
            ))}
        </div>
    );
};

export default ActivityTimeline;
