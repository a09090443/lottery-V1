/**
 * Export Workflow Orchestrator
 * 匯出工作流程協調器
 */

import {
  exportResultsToCsv,
  exportPrizeWinnersToCsv,
  downloadCsv,
  generateResultsCsvFilename,
  generatePrizeCsvFilename,
} from './csv';
import {
  exportEventToJson,
  exportResultsToJson,
  toJsonString,
  downloadJson,
  generateBackupJsonFilename,
  generateResultsJsonFilename,
} from './json';
import { getEvent } from '../data/events';
import { listPrizesByEvent, getPrize } from '../data/prizes';
import { listEventParticipants } from '../data/eventParticipants';
import { listDrawingResultsByEvent } from '../data/results';

/**
 * 匯出格式
 */
export type ExportFormat = 'csv' | 'json';

/**
 * 匯出類型
 */
export type ExportType = 'results' | 'prize' | 'full-backup';

/**
 * 匯出選項
 */
export interface ExportOptions {
  /** 匯出格式 */
  format: ExportFormat;
  /** 匯出類型 */
  type: ExportType;
  /** 活動 ID */
  eventId: string;
  /** 獎項 ID（type 為 'prize' 時需要） */
  prizeId?: string;
}

/**
 * 匯出結果
 */
export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

/**
 * 執行匯出工作流程
 * @param options - 匯出選項
 * @returns 匯出結果
 */
export async function executeExport(options: ExportOptions): Promise<ExportResult> {
  try {
    const { format, type, eventId, prizeId } = options;

    // 載入活動資料
    const event = await getEvent(eventId);
    if (!event) {
      return { success: false, error: '活動不存在' };
    }

    // 根據類型執行不同的匯出
    switch (type) {
      case 'results':
        return await exportResults(eventId, event.name, format);

      case 'prize':
        if (!prizeId) {
          return { success: false, error: '缺少獎項 ID' };
        }
        return await exportPrizeWinners(eventId, prizeId, event.name, format);

      case 'full-backup':
        return await exportFullBackup(eventId, event.name, format);

      default:
        return { success: false, error: '不支援的匯出類型' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '匯出失敗',
    };
  }
}

/**
 * 匯出所有中獎結果
 */
async function exportResults(
  eventId: string,
  eventName: string,
  format: ExportFormat
): Promise<ExportResult> {
  const results = await listDrawingResultsByEvent(eventId, { status: 'confirmed' });

  if (results.length === 0) {
    return { success: false, error: '沒有中獎結果可匯出' };
  }

  // 載入關聯資料
  const prizes = await listPrizesByEvent(eventId);
  const participants = await listEventParticipants(eventId);

  const prizeMap = new Map(prizes.map((p) => [p.id, p]));
  const participantMap = new Map(participants.map((p) => [p.id, p]));

  // 建立完整結果資料
  const enrichedResults = results.map((r) => {
    const prize = prizeMap.get(r.prizeId);
    const participant = participantMap.get(r.participantId);

    if (!prize || !participant) {
      throw new Error('資料完整性錯誤：找不到對應的獎項或參與者');
    }

    return {
      ...r,
      prize,
      participant,
      eventName,
    };
  });

  if (format === 'csv') {
    const csvContent = exportResultsToCsv(enrichedResults, eventName);
    const filename = generateResultsCsvFilename(eventName);
    downloadCsv(csvContent, filename);
    return { success: true, filename };
  } else {
    const jsonData = await exportResultsToJson(eventId);
    const jsonContent = toJsonString(jsonData);
    const filename = generateResultsJsonFilename(eventName);
    downloadJson(jsonContent, filename);
    return { success: true, filename };
  }
}

/**
 * 匯出單一獎項的中獎者
 */
async function exportPrizeWinners(
  eventId: string,
  prizeId: string,
  eventName: string,
  format: ExportFormat
): Promise<ExportResult> {
  const prize = await getPrize(prizeId);
  if (!prize) {
    return { success: false, error: '獎項不存在' };
  }

  const allResults = await listDrawingResultsByEvent(eventId, { status: 'confirmed' });
  const prizeResults = allResults.filter((r) => r.prizeId === prizeId);

  if (prizeResults.length === 0) {
    return { success: false, error: '此獎項沒有中獎結果' };
  }

  // 載入參與者資料
  const participants = await listEventParticipants(eventId);
  const participantMap = new Map(participants.map((p) => [p.id, p]));

  const enrichedResults = prizeResults.map((r) => {
    const participant = participantMap.get(r.participantId);
    if (!participant) {
      throw new Error('資料完整性錯誤：找不到對應的參與者');
    }

    return {
      ...r,
      prize,
      participant,
      eventName,
    };
  });

  if (format === 'csv') {
    const csvContent = exportPrizeWinnersToCsv(enrichedResults, prize.name);
    const filename = generatePrizeCsvFilename(eventName, prize.name);
    downloadCsv(csvContent, filename);
    return { success: true, filename };
  } else {
    // For JSON, export as simple structure
    const jsonData = {
      eventId,
      eventName,
      prizeId: prize.id,
      prizeName: prize.name,
      winners: enrichedResults.map((r) => ({
        drawSequence: r.drawSequence,
        drawnAt: r.drawnAt,
        winnerName: r.participant.name,
        employeeId: r.participant.employeeId,
        nationalId: r.participant.nationalId,
      })),
    };
    const jsonContent = toJsonString(jsonData);
    const filename = generatePrizeCsvFilename(eventName, prize.name).replace('.csv', '.json');
    downloadJson(jsonContent, filename);
    return { success: true, filename };
  }
}

/**
 * 匯出完整備份（僅支援 JSON）
 */
async function exportFullBackup(
  eventId: string,
  eventName: string,
  format: ExportFormat
): Promise<ExportResult> {
  if (format !== 'json') {
    return { success: false, error: '完整備份僅支援 JSON 格式' };
  }

  const backupData = await exportEventToJson(eventId);
  const jsonContent = toJsonString(backupData);
  const filename = generateBackupJsonFilename(eventName);

  downloadJson(jsonContent, filename);
  return { success: true, filename };
}

/**
 * 快速匯出中獎結果（CSV 格式）
 * @param eventId - 活動 ID
 */
export async function quickExportResultsCsv(eventId: string): Promise<ExportResult> {
  return executeExport({
    format: 'csv',
    type: 'results',
    eventId,
  });
}

/**
 * 快速匯出中獎結果（JSON 格式）
 * @param eventId - 活動 ID
 */
export async function quickExportResultsJson(eventId: string): Promise<ExportResult> {
  return executeExport({
    format: 'json',
    type: 'results',
    eventId,
  });
}

/**
 * 快速匯出完整備份
 * @param eventId - 活動 ID
 */
export async function quickExportFullBackup(eventId: string): Promise<ExportResult> {
  return executeExport({
    format: 'json',
    type: 'full-backup',
    eventId,
  });
}

// Re-export for convenience
export {
  exportResultsToCsv,
  exportPrizeWinnersToCsv,
  downloadCsv,
} from './csv';
export {
  exportEventToJson,
  exportResultsToJson,
  downloadJson,
} from './json';
export type { CsvExportOptions } from './csv';
export type { EventBackupData } from './json';
