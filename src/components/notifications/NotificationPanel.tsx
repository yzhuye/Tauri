import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import NotificationItem from './NotificationItem';
import { Bell, X } from 'lucide-react';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    const { getAllNotifications, markNotificationAsRead } = useData();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const notifications = getAllNotifications();
    const filteredNotifications =
        filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

    const unreadCount = notifications.filter((n) => !n.read).length;

    if (!isOpen) return null;

    return (
        <div className="notification-panel-overlay" onClick={onClose}>
            <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
                <div className="notification-panel-header">
                    <div className="notification-panel-title">
                        <Bell size={20} />
                        <span>Notificaciones</span>
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </div>
                    <button className="notification-panel-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="notification-panel-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Todas ({notifications.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        No leídas ({unreadCount})
                    </button>
                </div>

                <div className="notification-panel-content">
                    {filteredNotifications.length === 0 ? (
                        <div className="notification-empty">
                            <Bell size={48} />
                            <p>No hay notificaciones</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={markNotificationAsRead}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPanel;
