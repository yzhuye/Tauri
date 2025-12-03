import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity } from 'lucide-react';
import { useData } from '../../context/DataContext';

const Sidebar: React.FC = () => {
    const { linesData } = useData();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return '#10b981';
            case 'warning':
                return '#f59e0b';
            case 'error':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Activity size={32} />
                <h2>Dashboard</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Resumen General</span>
                </NavLink>

                <div className="nav-section">
                    <div className="nav-section-title">Líneas de Producción</div>
                    {linesData.map((lineData) => (
                        <NavLink
                            key={lineData.line.id}
                            to={`/line/${lineData.line.id}`}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span
                                className="status-indicator"
                                style={{ backgroundColor: getStatusColor(lineData.line.status) }}
                            />
                            <span>{lineData.line.name}</span>
                            <span className="efficiency-badge">
                                {lineData.line.efficiency}%
                            </span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
