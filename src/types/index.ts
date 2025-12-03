// Tipos de datos para el dashboard de producción

export interface ProductionLine {
    id: number;
    name: string;
    status: 'active' | 'warning' | 'error' | 'offline';
    currentCurrent: number;      // Corriente actual (A)
    currentVoltage: number;      // Tensión actual (V)
    currentPower: number;        // Potencia actual (kW)
    targetPower: number;         // Meta de potencia (kW)
    efficiency: number;          // Eficiencia (%)
    lastUpdate: Date;
}

export interface Metric {
    timestamp: Date;
    current: number;      // Corriente Media entre Fases (A)
    voltage: number;      // Tensión Media de Líneas (V)
    activePower: number;  // Consumo de Potencia Activa Total (kW)
}

export interface Notification {
    id: string;
    lineId: number;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
    read: boolean;
}

export interface DailyReport {
    date: Date;
    lineId: number;
    lineName: string;
    totalCurrent: number;
    averageVoltage: number;
    totalActivePower: number;
    metrics: Metric[];
}

export interface LineData {
    line: ProductionLine;
    metrics: Metric[];
    notifications: Notification[];
}
