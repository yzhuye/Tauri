import ExcelJS from 'exceljs';
import { LineData } from '../types';

// Generar reporte diario de una línea específica
export const generateDailyReport = async (
    lineData: LineData,
    date: Date
): Promise<void> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Diario');

    // Configurar columnas
    worksheet.columns = [
        { header: 'Hora', key: 'time', width: 15 },
        { header: 'Potencia Activa (kW)', key: 'activePower', width: 22 },
    ];

    // Título del reporte
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Reporte Diario - ${lineData.line.name}`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
    };
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };

    // Fecha del reporte
    worksheet.mergeCells('A2:D2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Fecha: ${date.toLocaleDateString('es-ES')}`;
    dateCell.alignment = { horizontal: 'center' };
    dateCell.font = { bold: true };

    // Espacio
    worksheet.addRow([]);

    // Encabezados de tabla
    const headerRow = worksheet.addRow([
        'Hora',
        'Potencia Activa (kW)',
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' },
    };

    // Agregar datos
    lineData.metrics.forEach((metric) => {
        worksheet.addRow({
            time: metric.timestamp.toLocaleTimeString('es-ES'),
            activePower: metric.activePower.toFixed(2),
        });
    });

    // Calcular totales

    const totalActivePower = lineData.metrics.reduce((sum, m) => sum + m.activePower, 0);
    const avgActivePower = totalActivePower / lineData.metrics.length;

    // Espacio
    worksheet.addRow([]);

    // Resumen
    const summaryRow = worksheet.addRow(['RESUMEN', '', '', '']);
    summaryRow.font = { bold: true, size: 12 };
    summaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFC000' },
    };


    worksheet.addRow(['Potencia Promedio', `${avgActivePower.toFixed(2)} kW`, '', '']);
    worksheet.addRow(['Potencia Total Consumida', `${totalActivePower.toFixed(2)} kWh`, '', '']);
    worksheet.addRow([
        'Meta de Potencia',
        `${lineData.line.targetPower} kW`,
        '',
        '',
    ]);
    worksheet.addRow([
        'Eficiencia',
        `${lineData.line.efficiency}%`,
        '',
        '',
    ]);

    // Aplicar bordes a todas las celdas con datos
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 3) {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        }
    });

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_${lineData.line.name}_${date.toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
};

// Generar reporte consolidado de todas las líneas
export const generateConsolidatedReport = async (
    linesData: LineData[],
    date: Date
): Promise<void> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Consolidado');

    // Título
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Reporte Consolidado - Todas las Líneas';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
    };
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };

    // Fecha
    worksheet.mergeCells('A2:F2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Fecha: ${date.toLocaleDateString('es-ES')}`;
    dateCell.alignment = { horizontal: 'center' };
    dateCell.font = { bold: true };

    worksheet.addRow([]);

    // Encabezados
    const headerRow = worksheet.addRow([
        'Línea',
        'Corriente Promedio (A)',
        'Tensión Promedio (V)',
        'Potencia Promedio (kW)',
        'Potencia Total (kWh)',
        'Eficiencia (%)',
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' },
    };

    // Datos de cada línea
    linesData.forEach((lineData) => {
        const avgCurrent = lineData.metrics.reduce((sum, m) => sum + m.current, 0) / lineData.metrics.length;
        const avgVoltage = lineData.metrics.reduce((sum, m) => sum + m.voltage, 0) / lineData.metrics.length;
        const avgActivePower = lineData.metrics.reduce((sum, m) => sum + m.activePower, 0) / lineData.metrics.length;
        const totalActivePower = lineData.metrics.reduce((sum, m) => sum + m.activePower, 0);
        const efficiency = lineData.line.efficiency;

        const row = worksheet.addRow([
            lineData.line.name,
            avgCurrent.toFixed(2),
            avgVoltage.toFixed(2),
            avgActivePower.toFixed(2),
            totalActivePower.toFixed(2),
            efficiency,
        ]);

        // Colorear según eficiencia
        if (efficiency >= 80) {
            row.getCell(6).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC6EFCE' },
            };
        } else if (efficiency >= 70) {
            row.getCell(6).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFEB9C' },
            };
        } else {
            row.getCell(6).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFC7CE' },
            };
        }
    });

    // Totales generales
    worksheet.addRow([]);
    const totalRow = worksheet.addRow(['TOTALES', '', '', '', '', '']);
    totalRow.font = { bold: true, size: 12 };
    totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFC000' },
    };

    const grandAvgCurrent =
        linesData.reduce(
            (sum, ld) => sum + ld.metrics.reduce((s, m) => s + m.current, 0) / ld.metrics.length,
            0
        ) / linesData.length;
    const grandAvgVoltage =
        linesData.reduce(
            (sum, ld) => sum + ld.metrics.reduce((s, m) => s + m.voltage, 0) / ld.metrics.length,
            0
        ) / linesData.length;
    const grandAvgPower =
        linesData.reduce(
            (sum, ld) => sum + ld.metrics.reduce((s, m) => s + m.activePower, 0) / ld.metrics.length,
            0
        ) / linesData.length;
    const grandTotalPower = linesData.reduce(
        (sum, ld) => sum + ld.metrics.reduce((s, m) => s + m.activePower, 0),
        0
    );
    const grandAvgEfficiency =
        linesData.reduce((sum, ld) => sum + ld.line.efficiency, 0) / linesData.length;

    worksheet.addRow([
        'Promedio General',
        grandAvgCurrent.toFixed(2),
        grandAvgVoltage.toFixed(2),
        grandAvgPower.toFixed(2),
        grandTotalPower.toFixed(2),
        grandAvgEfficiency.toFixed(2),
    ]);

    // Configurar anchos de columna
    worksheet.columns = [
        { key: 'line', width: 15 },
        { key: 'current', width: 22 },
        { key: 'voltage', width: 22 },
        { key: 'avgPower', width: 22 },
        { key: 'totalPower', width: 22 },
        { key: 'efficiency', width: 18 },
    ];

    // Aplicar bordes
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 3) {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        }
    });

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Consolidado_${date.toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
};
