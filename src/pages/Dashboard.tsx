import React from 'react';
import { useData } from '../context/DataContext';
import KPICard from '../components/charts/KPICard';
import { Activity, AlertTriangle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { linesData } = useData();

    const totalPower = linesData.reduce(
        (sum, ld) => sum + ld.line.currentPower,
        0
    );
    const totalTargetPower = linesData.reduce((sum, ld) => sum + ld.line.targetPower, 0);
    const avgEfficiency =
        linesData.reduce((sum, ld) => sum + ld.line.efficiency, 0) / linesData.length;
    const activeLines = linesData.filter((ld) => ld.line.status === 'active').length;
    const warningLines = linesData.filter((ld) => ld.line.status === 'warning').length;
    const errorLines = linesData.filter((ld) => ld.line.status === 'error').length;

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active':
                return 'status-active';
            case 'warning':
                return 'status-warning';
            case 'error':
                return 'status-error';
            default:
                return 'status-offline';
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Resumen General</h2>
                <p>Vista consolidada de todas las líneas de producción</p>
            </div>

            <div className="kpi-grid">
                <KPICard
                    title="Potencia Total"
                    value={totalPower.toFixed(1)}
                    unit=" kW"
                    trend="up"
                    status="neutral"
                />
                <KPICard
                    title="Meta Total"
                    value={totalTargetPower}
                    unit=" kW"
                    trend="neutral"
                    status="neutral"
                />
                <KPICard
                    title="Eficiencia Promedio"
                    value={avgEfficiency.toFixed(1)}
                    unit="%"
                    trend={avgEfficiency >= 80 ? 'up' : avgEfficiency >= 70 ? 'neutral' : 'down'}
                    status={avgEfficiency >= 80 ? 'success' : avgEfficiency >= 70 ? 'warning' : 'error'}
                />
                <KPICard
                    title="Cumplimiento"
                    value={((totalPower / totalTargetPower) * 100).toFixed(1)}
                    unit="%"
                    trend={totalPower >= totalTargetPower - 15 ? 'up' : 'down'}
                    status={totalPower >= totalTargetPower - 15 ? 'success' : 'warning'}
                />
            </div>

            <div className="status-summary">
                <div className="status-card status-active">
                    <Activity size={24} />
                    <div>
                        <div className="status-count">{activeLines}</div>
                        <div className="status-label">Líneas Activas</div>
                    </div>
                </div>
                <div className="status-card status-warning">
                    <AlertTriangle size={24} />
                    <div>
                        <div className="status-count">{warningLines}</div>
                        <div className="status-label">Con Advertencias</div>
                    </div>
                </div>
                <div className="status-card status-error">
                    <AlertTriangle size={24} />
                    <div>
                        <div className="status-count">{errorLines}</div>
                        <div className="status-label">Con Errores</div>
                    </div>
                </div>
            </div>

            <div className="lines-overview">
                <h3>Estado de las Líneas</h3>
                <div className="lines-grid">
                    {linesData.map((lineData) => (
                        <div key={lineData.line.id} className={`line-card ${getStatusClass(lineData.line.status)}`}>
                            <div className="line-card-header">
                                <h4>{lineData.line.name}</h4>
                                <span className={`status-badge ${getStatusClass(lineData.line.status)}`}>
                                    {lineData.line.status === 'active' ? 'Activa' :
                                        lineData.line.status === 'warning' ? 'Advertencia' :
                                            lineData.line.status === 'error' ? 'Error' : 'Inactiva'}
                                </span>
                            </div>
                            <div className="line-card-metrics">
                                <div className="metric">
                                    <span className="metric-label">Corriente</span>
                                    <span className="metric-value">{lineData.line.currentCurrent} A</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Tensión</span>
                                    <span className="metric-value">{lineData.line.currentVoltage} V</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Potencia</span>
                                    <span className="metric-value">
                                        {lineData.line.currentPower} / {lineData.line.targetPower} kW
                                    </span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Eficiencia</span>
                                    <span className="metric-value">{lineData.line.efficiency}%</span>
                                </div>
                            </div>
                            <div className="line-card-footer">
                                <Clock size={14} />
                                <span>
                                    Actualizado: {lineData.line.lastUpdate.toLocaleTimeString('es-ES')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
