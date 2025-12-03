import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import KPICard from '../components/charts/KPICard';
import LineChart from '../components/charts/LineChart';
import NotificationItem from '../components/notifications/NotificationItem';
import { ArrowLeft, FileDown } from 'lucide-react';
import { generateDailyReport } from '../utils/excelExport';

const LineDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getLineData, markNotificationAsRead } = useData();

    const lineData = getLineData(Number(id));

    if (!lineData) {
        return (
            <div className="error-page">
                <h2>Línea no encontrada</h2>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Volver al inicio
                </button>
            </div>
        );
    }

    const { line, metrics, notifications } = lineData;

    // Calcular métricas
    const avgCurrent = metrics.reduce((sum, m) => sum + m.current, 0) / metrics.length;
    const avgVoltage = metrics.reduce((sum, m) => sum + m.voltage, 0) / metrics.length;
    const totalActivePower = metrics.reduce((sum, m) => sum + m.activePower, 0);
    const avgActivePower = totalActivePower / metrics.length;

    const handleGenerateReport = async () => {
        await generateDailyReport(lineData, new Date());
    };

    return (
        <div className="line-detail">
            <div className="line-detail-header">
                <button className="btn btn-secondary" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} />
                    <span>Volver</span>
                </button>
                <div className="line-detail-title">
                    <h2>{line.name}</h2>
                    <span className={`status-badge status-${line.status}`}>
                        {line.status === 'active' ? 'Activa' :
                            line.status === 'warning' ? 'Advertencia' :
                                line.status === 'error' ? 'Error' : 'Inactiva'}
                    </span>
                </div>
                <button className="btn btn-primary" onClick={handleGenerateReport}>
                    <FileDown size={20} />
                    <span>Exportar Reporte</span>
                </button>
            </div>

            <div className="kpi-grid">
                <KPICard
                    title="Corriente Actual"
                    value={line.currentCurrent}
                    unit=" A"
                    trend={line.currentCurrent >= 150 && line.currentCurrent <= 200 ? 'up' : 'down'}
                    status={line.currentCurrent >= 150 && line.currentCurrent <= 200 ? 'success' : 'warning'}
                />
                <KPICard
                    title="Tensión Actual"
                    value={line.currentVoltage}
                    unit=" V"
                    trend={line.currentVoltage >= 360 && line.currentVoltage <= 400 ? 'up' : 'down'}
                    status={line.currentVoltage >= 360 && line.currentVoltage <= 400 ? 'success' : 'error'}
                />
                <KPICard
                    title="Potencia Actual"
                    value={line.currentPower.toFixed(1)}
                    unit=" kW"
                    trend={line.currentPower >= line.targetPower * 0.8 ? 'up' : 'down'}
                    status={line.currentPower >= line.targetPower * 0.8 ? 'success' : 'warning'}
                />
                <KPICard
                    title="Eficiencia"
                    value={line.efficiency}
                    unit="%"
                    trend={line.efficiency >= 80 ? 'up' : line.efficiency >= 70 ? 'neutral' : 'down'}
                    status={line.efficiency >= 80 ? 'success' : line.efficiency >= 70 ? 'warning' : 'error'}
                />
            </div>



            <div className="charts-section">
                <div className="chart-card">
                    <h3>Consumo de Potencia Activa Total</h3>
                    <LineChart
                        metrics={metrics}
                        dataKey="activePower"
                        label="Potencia Activa (kW)"
                        color="#f59e0b"
                    />
                </div>
            </div>

            <div className="metrics-summary">
                <h3>Resumen del Período</h3>
                <div className="summary-grid">
                    <div className="summary-item">
                        <span className="summary-label">Corriente Promedio</span>
                        <span className="summary-value">{avgCurrent.toFixed(2)} A</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Tensión Promedio</span>
                        <span className="summary-value">{avgVoltage.toFixed(2)} V</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Potencia Promedio</span>
                        <span className="summary-value">{avgActivePower.toFixed(2)} kW</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Potencia Total Consumida</span>
                        <span className="summary-value">{totalActivePower.toFixed(2)} kWh</span>
                    </div>
                </div>
            </div>

            {notifications.length > 0 && (
                <div className="line-notifications">
                    <h3>Notificaciones Recientes</h3>
                    <div className="notifications-list">
                        {[...notifications]
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .slice(0, 10)
                            .map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markNotificationAsRead}
                                />
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LineDetail;
