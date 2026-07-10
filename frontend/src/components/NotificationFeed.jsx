// src/components/NotificationFeed.jsx
// ─── Notification Feed ──────────────────────────────────────────────────────
// Renders the floating toast stack driven by NotificationContext.
// Purely presentational — all logic (timing, content) lives in the context.

import { useNotifications } from "../context/NotificationContext";

export default function NotificationFeed() {
  const { toasts, dismiss } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="notif-stack">
      {toasts.map((t) => (
        <div className={`notif-toast ${t.type}`} key={t.id}>
          <div className="notif-icon">{t.icon}</div>
          <div className="notif-text">
            <div className="notif-title">{t.title}</div>
            <div className="notif-body">{t.body}</div>
          </div>
          <button className="notif-dismiss" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">✕</button>
        </div>
      ))}
    </div>
  );
}
