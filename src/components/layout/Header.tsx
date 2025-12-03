import React, { useState } from 'react';
import { Bell, FileDown } from 'lucide-react';
import { useData } from '../../context/DataContext';
import NotificationPanel from '../notifications/NotificationPanel';
import { generateConsolidatedReport } from '../../utils/excelExport';

const Header: React.FC = () => {
    const { getAllNotifications, linesData } = useData();
    const [showNotifications, setShowNotifications] = useState(false);

    const unreadCount = getAllNotifications().filter((n) => !n.read).length;

    const handleGenerateReport = async () => {
        await generateConsolidatedReport(linesData, new Date());
    };

    return (
        <>
            <header className="header">
                <div className="header-title">
                    <h1>Sistema de Monitoreo de Producción</h1>
                    <p className="header-subtitle">
                        {new Date().toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                <div className="header-actions">
                    <button className="btn btn-primary" onClick={handleGenerateReport}>
                        <FileDown size={20} />
                        <span>Generar Reporte</span>
                    </button>

                    <button
                        className="btn btn-icon"
                        onClick={() => setShowNotifications(true)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>
                </div>
            </header>

            <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </>
    );
};

export default Header;
