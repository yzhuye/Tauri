import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductionLine, Metric, Notification, LineData } from '../types';
import { generateInitialData, generateMetric, generateNotification, getLineStatus, calculateEfficiency } from '../utils/dataGenerator';

// import { invoke } from '@tauri-apps/api/core';

// // ... dentro del useEffect
// useEffect(() => {
//   const fetchData = async () => {
//     try {
//       // Llamada al backend real
//       const realData = await invoke<LineData[]>('get_lines_data');
//       setLinesData(realData);
//     } catch (error) {
//       console.error("Error al obtener datos:", error);
//     }
//   };

//   // Polling: Consultar cada 5 segundos
//   const interval = setInterval(fetchData, 5000);
//   fetchData(); // Primera carga inmediata

//   return () => clearInterval(interval);
// }, []);

interface DataContextType {
    linesData: LineData[];
    updateLineMetric: (lineId: number, metric: Metric) => void;
    addNotification: (notification: Notification) => void;
    markNotificationAsRead: (notificationId: string) => void;
    getLineData: (lineId: number) => LineData | undefined;
    getAllNotifications: () => Notification[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [linesData, setLinesData] = useState<LineData[]>([]);

    // Inicializar datos
    useEffect(() => {
        const initialData = generateInitialData();
        setLinesData(initialData);
    }, []);

    // Simular actualización de datos en tiempo real
    useEffect(() => {
        const interval = setInterval(() => {
            setLinesData((prevData: LineData[]) => {
                return prevData.map((lineData): LineData => {
                    const newMetric = generateMetric(lineData.line.id);
                    const updatedMetrics = [...lineData.metrics, newMetric].slice(-100); // Mantener últimas 100 métricas

                    // Calcular eficiencia basada en configuración específica de la línea
                    const efficiency = calculateEfficiency(lineData.line.id, newMetric.activePower);

                    // Actualizar estado de la línea
                    const updatedLine: ProductionLine = {
                        ...lineData.line,
                        currentCurrent: newMetric.current,
                        currentVoltage: newMetric.voltage,
                        currentPower: newMetric.activePower,
                        efficiency,
                        lastUpdate: newMetric.timestamp,
                        status: getLineStatus(lineData.line.id, newMetric),
                    };

                    // Generar notificación si hay problemas
                    const newNotifications = [...lineData.notifications];
                    const notification = generateNotification(updatedLine, newMetric);
                    if (notification) {
                        newNotifications.push(notification);
                    }

                    return {
                        line: updatedLine,
                        metrics: updatedMetrics,
                        notifications: newNotifications.slice(-50), // Mantener últimas 50 notificaciones
                    };
                });
            });
        }, 5000); // Actualizar cada 5 segundos

        return () => clearInterval(interval);
    }, []);

    const updateLineMetric = (lineId: number, metric: Metric) => {
        setLinesData((prevData) =>
            prevData.map((lineData) =>
                lineData.line.id === lineId
                    ? {
                        ...lineData,
                        metrics: [...lineData.metrics, metric].slice(-100),
                    }
                    : lineData
            )
        );
    };

    const addNotification = (notification: Notification) => {
        setLinesData((prevData) =>
            prevData.map((lineData) =>
                lineData.line.id === notification.lineId
                    ? {
                        ...lineData,
                        notifications: [...lineData.notifications, notification].slice(-50),
                    }
                    : lineData
            )
        );
    };

    const markNotificationAsRead = (notificationId: string) => {
        setLinesData((prevData) =>
            prevData.map((lineData) => ({
                ...lineData,
                notifications: lineData.notifications.map((notif) =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                ),
            }))
        );
    };

    const getLineData = (lineId: number): LineData | undefined => {
        return linesData.find((lineData) => lineData.line.id === lineId);
    };

    const getAllNotifications = (): Notification[] => {
        return linesData.flatMap((lineData) => lineData.notifications).sort(
            (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
    };

    return (
        <DataContext.Provider
            value={{
                linesData,
                updateLineMetric,
                addNotification,
                markNotificationAsRead,
                getLineData,
                getAllNotifications,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
