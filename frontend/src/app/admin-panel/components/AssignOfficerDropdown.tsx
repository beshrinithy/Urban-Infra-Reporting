'use client';
import { useEffect, useState } from 'react';

interface Officer {
    id: number;
    email: string;
    department: string | null;
}

interface AssignOfficerDropdownProps {
    reportId: number;
    currentOfficerId?: number | null;
    onAssign: (officerId: number) => void;
}

export default function AssignOfficerDropdown({ reportId, currentOfficerId, onAssign }: AssignOfficerDropdownProps) {
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [selected, setSelected] = useState<string>(currentOfficerId?.toString() || '');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
        fetch(`${API_URL}/api/reports/officers`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => setOfficers(d.officers || []))
            .catch(err => console.error('Failed to load officers:', err));
    }, []);

    const handleAssign = async () => {
        if (!selected) return;
        setSaving(true);
        setSuccess(false);
        try {
            const token = localStorage.getItem('admin_token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
            const res = await fetch(`${API_URL}/api/reports/${reportId}/assign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ officerId: parseInt(selected) })
            });
            if (res.ok) {
                setSuccess(true);
                onAssign(parseInt(selected));
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error('Assign failed:', err);
        }
        setSaving(false);
    };

    if (officers.length === 0) {
        return (
            <div className="text-xs text-slate-400 italic">
                No officers registered yet.
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">👮 Assign Officer:</label>
            <select
                aria-label="Select officer"
                value={selected}
                onChange={e => setSelected(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition font-medium"
            >
                <option value="">— Select Officer —</option>
                {officers.map(o => (
                    <option key={o.id} value={o.id.toString()}>
                        {o.email} ({o.department || 'No dept'})
                    </option>
                ))}
            </select>
            <button
                onClick={handleAssign}
                disabled={saving || !selected}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-semibold shadow-sm"
            >
                {saving ? 'Saving...' : success ? '✅ Assigned!' : 'Assign'}
            </button>
        </div>
    );
}
