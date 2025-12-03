import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
}) => {
    const navigate = useNavigate();

    const getIcon = () => {
        switch (notification.type) {
            case 'error':
                return <AlertCircle size={20} />;
            case 'warning':
                return <AlertTriangle size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        navigate(`/line/${notification.lineId}`);
    };

    return (
        <div
            className={`notification-item notification-${notification.type} ${notification.read ? 'notification-read' : ''}`}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
        >
            <div className="notification-icon">{getIcon()}</div>
            <div className="notification-content">
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                    {notification.timestamp.toLocaleTimeString('es-ES')}
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
