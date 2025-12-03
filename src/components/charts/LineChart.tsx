import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Metric } from '../../types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface LineChartProps {
    metrics: Metric[];
    dataKey: 'current' | 'voltage' | 'activePower';
    label: string;
    color?: string;
}

const LineChart: React.FC<LineChartProps> = ({
    metrics,
    dataKey,
    label,
    color = '#4472C4',
}) => {
    const data = {
        labels: metrics.map((m) =>
            m.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        ),
        datasets: [
            {
                label,
                data: metrics.map((m) => m[dataKey]),
                borderColor: color,
                backgroundColor: `${color}33`,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div style={{ height: '300px', width: '100%' }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default LineChart;
