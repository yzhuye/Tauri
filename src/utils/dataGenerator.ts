import { ProductionLine, Metric, Notification, LineData } from '../types';

const LINE_CONFIGS: Record<number, {
    meanPower: number;
    stdDevPower: number;
    minPower: number;
    maxPower: number;
    lowerLimit: number;
    upperLimit: number;
}> = {
    1: {
        meanPower: 19.787,
        stdDevPower: 9.927,
        minPower: 1.803,
        maxPower: 39.730,
        lowerLimit: 9.861,
        upperLimit: 29.714
    },
    3: {
        meanPower: 22.171,
        stdDevPower: 7.811,
        minPower: 0.599,
        maxPower: 60.012,
        lowerLimit: 14.361,
        upperLimit: 29.982
    },
    4: {
        meanPower: 21.806,
        stdDevPower: 5.216,
        minPower: 6.562,
        maxPower: 58.343,
        lowerLimit: 16.590,
        upperLimit: 27.022
    }
};

const randomNormal = (mean: number, stdDev: number): number => {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
};

export const calculateEfficiency = (lineId: number, activePower: number): number => {
    const config = LINE_CONFIGS[lineId];

    if (!config) {
        // Fallback para líneas sin configuración específica
        return Math.min(100, Math.floor((activePower / 100) * 100));
    }

    // Calcular eficiencia basada en qué tan cerca está del meanPower óptimo
    // 100% cuando está en meanPower, disminuye hacia los límites

    if (activePower >= config.lowerLimit && activePower <= config.upperLimit) {
        // Dentro del rango óptimo
        const deviation = Math.abs(activePower - config.meanPower);
        const maxDeviation = config.upperLimit - config.meanPower;
        const efficiency = 100 - (deviation / maxDeviation) * 30; // Máximo 30% de penalización dentro del rango
        return Math.max(70, Math.floor(efficiency));
    } else if (activePower < config.lowerLimit) {
        // Por debajo del límite inferior
        const deviation = config.lowerLimit - activePower;
        const range = config.lowerLimit - config.minPower;
        const penalty = (deviation / range) * 40; // Hasta 40% de penalización
        return Math.max(30, Math.floor(70 - penalty));
    } else {
        // Por encima del límite superior
        const deviation = activePower - config.upperLimit;
        const range = config.maxPower - config.upperLimit;
        const penalty = (deviation / range) * 40; // Hasta 40% de penalización
        return Math.max(30, Math.floor(70 - penalty));
    }
};

export const generateInitialData = (): LineData[] => {
    const lines: LineData[] = [];
    const activeLineIds = [1, 3, 4];

    for (const lineId of activeLineIds) {
        const initialMetric = generateMetric(lineId);
        const config = LINE_CONFIGS[lineId];

        const targetPower = config ? Math.ceil(config.meanPower * 1.2) : 100;

        const line: ProductionLine = {
            id: lineId,
            name: `Línea ${lineId}`,
            status: 'active',
            currentCurrent: initialMetric.current,
            currentVoltage: initialMetric.voltage,
            currentPower: initialMetric.activePower,
            targetPower: targetPower,
            efficiency: Math.floor(Math.random() * 30) + 70,
            lastUpdate: new Date(),
        };

        const metrics: Metric[] = [];
        const now = new Date();
        for (let j = 20; j >= 0; j--) {
            const timestamp = new Date(now.getTime() - j * 5 * 60 * 1000);
            const histMetric = generateMetric(lineId);
            metrics.push({
                ...histMetric,
                timestamp,
            });
        }

        lines.push({
            line,
            metrics,
            notifications: [],
        });
    }

    return lines;
};

export const generateMetric = (lineId: number): Metric => {
    const config = LINE_CONFIGS[lineId];

    let activePower: number;
    let current: number;
    let voltage: number;

    if (config) {
        activePower = randomNormal(config.meanPower, config.stdDevPower * 0.5);

        activePower = Math.max(0, activePower);

        current = activePower * 1.7;

        current = current * (0.95 + Math.random() * 0.1);

    } else {
        // Lógica por defecto para otras líneas
        const powerVariation = Math.random() * 20 - 10;
        activePower = Math.max(0, Math.floor(85 + powerVariation));

        const currentVariation = Math.random() * 20 - 10;
        current = Math.max(0, Math.floor(180 + currentVariation));
    }

    const voltageVariation = Math.random() * 10 - 5;
    voltage = Math.max(0, Math.floor(380 + voltageVariation));

    return {
        timestamp: new Date(),
        current: Number(current.toFixed(2)),
        voltage: Number(voltage.toFixed(2)),
        activePower: Number(activePower.toFixed(2)),
    };
};

export const generateNotification = (
    line: ProductionLine,
    metric: Metric
): Notification | null => {
    const notifications: Notification[] = [];
    const config = LINE_CONFIGS[line.id];

    if (config) {
        if (metric.activePower > config.upperLimit) {
            notifications.push({
                id: `${line.id}-${Date.now()}-power-high`,
                lineId: line.id,
                type: 'error',
                message: `[${line.name}] Potencia Alta: ${metric.activePower} kW (Límite: ${config.upperLimit} kW)`,
                timestamp: new Date(),
                read: false,
            });
        } else if (metric.activePower < config.lowerLimit) {
            notifications.push({
                id: `${line.id}-${Date.now()}-power-low`,
                lineId: line.id,
                type: 'warning',
                message: `[${line.name}] Potencia Baja: ${metric.activePower} kW (Límite: ${config.lowerLimit} kW)`,
                timestamp: new Date(),
                read: false,
            });
        }
    } else {
        if (metric.current > 200) {
            notifications.push({
                id: `${line.id}-${Date.now()}-current-high`,
                lineId: line.id,
                type: 'error',
                message: `[${line.name}] Corriente alta: ${metric.current} A (límite: 200 A)`,
                timestamp: new Date(),
                read: false,
            });
        }

        if (metric.activePower > 110) {
            notifications.push({
                id: `${line.id}-${Date.now()}-power-high-gen`,
                lineId: line.id,
                type: 'warning',
                message: `[${line.name}] Consumo de potencia elevado: ${metric.activePower} kW`,
                timestamp: new Date(),
                read: false,
            });
        }
    }

    if (metric.voltage > 400 || metric.voltage < 360) {
        notifications.push({
            id: `${line.id}-${Date.now()}-voltage`,
            lineId: line.id,
            type: 'error',
            message: `[${line.name}] Tensión fuera de rango: ${metric.voltage} V (rango: 360-400 V)`,
            timestamp: new Date(),
            read: false,
        });
    }

    return notifications.length > 0 ? notifications[0] : null;
};

export const getLineStatus = (lineId: number, metric: Metric): 'active' | 'warning' | 'error' => {
    const config = LINE_CONFIGS[lineId];

    if (metric.voltage > 400 || metric.voltage < 360) {
        return 'error';
    }

    if (config) {
        if (metric.activePower > config.upperLimit) {
            return 'error';
        }
        if (metric.activePower < config.lowerLimit) {
            return 'warning';
        }
    } else {
        if (metric.current > 200) return 'error';
        if (metric.current < 140) return 'warning';
        if (metric.activePower > 110) return 'warning';
    }

    return 'active';
};
