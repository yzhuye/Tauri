import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'neutral';
    status?: 'success' | 'warning' | 'error' | 'neutral';
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    unit = '',
    trend = 'neutral',
    status = 'neutral',
}) => {
    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return 'var(--color-success)';
            case 'warning':
                return 'var(--color-warning)';
            case 'error':
                return 'var(--color-error)';
            default:
                return 'var(--color-text)';
        }
    };

    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <TrendingUp size={20} />;
            case 'down':
                return <TrendingDown size={20} />;
            default:
                return <Minus size={20} />;
        }
    };

    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-title">{title}</span>
                <span className={`kpi-trend kpi-trend-${trend}`}>{getTrendIcon()}</span>
            </div>
            <div className="kpi-value" style={{ color: getStatusColor() }}>
                {value}
                {unit && <span className="kpi-unit">{unit}</span>}
            </div>
        </div>
    );
};

export default KPICard;
