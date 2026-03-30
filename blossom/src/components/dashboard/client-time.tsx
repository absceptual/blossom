"use client"

import { useState, useEffect } from "react";
import { formatTimeAgo } from "@/components/dashboard/submissions-card";

export function ClientTimeAgo({ date }: { date: string }) {
    const [text, setText] = useState("");

    useEffect(() => {
        setText(formatTimeAgo(date));
        const interval = setInterval(() => setText(formatTimeAgo(date)), 60000);
        return () => clearInterval(interval);
    }, [date]);

    return <span>{text}</span>;
}

export function ClientFormattedDate({ date }: { date: string }) {
    const [text, setText] = useState("");

    useEffect(() => {
        const normalized = date.includes('+') || date.endsWith('Z')
            ? date
            : date.replace(' ', 'T') + 'Z';
        setText(new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(new Date(normalized)));
    }, [date]);

    return <span>{text}</span>;
}
