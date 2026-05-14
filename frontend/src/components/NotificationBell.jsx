import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  const refresh = async () => {
    try {
      const [c, list] = await Promise.all([
        api.get('/notifications/unread-count'),
        api.get('/notifications', { params: { pageSize: 8 } }),
      ]);
      setCount(c.data.count);
      setItems(list.data.items);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, []);

  const markAll = async () => {
    await api.post('/notifications/read-all');
    refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {count > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto card z-40">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            <button onClick={markAll} className="text-xs text-brand-700 hover:underline">
              Mark all read
            </button>
          </div>
          {items.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">No notifications yet.</div>
          ) : (
            items.map((n) => (
              <Link
                key={n.id}
                to={n.link || '#'}
                onClick={() => setOpen(false)}
                className={`block p-3 border-b hover:bg-slate-50 ${
                  n.read ? 'opacity-70' : 'bg-brand-50/30'
                }`}
              >
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-slate-600">{n.message}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
