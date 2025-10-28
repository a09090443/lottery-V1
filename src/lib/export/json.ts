/**
 * JSON Export Module
 * JSON 格式匯出模組（完整備份）
 */

import { LotteryEvent, Prize, Participant, DrawingResult } from '@/types';
import { getEvent } from '../data/events';
import { listPrizesByEvent } from '../data/prizes';
import { listEventParticipants } from '../data/eventParticipants';
import { listDrawingResultsByEvent } from '../data/results';
import * as dateUtils from '../utils/date';

/**
 * 完整活動資料匯出格式
 */
export interface EventBackupData {
  /** 匯出版本 */
  version: string;
  /** 匯出時間 */
  exportedAt: string;
  /** 活動資料 */
  event: LotteryEvent;
  /** 獎項列表 */
  prizes: Prize[];
  /** 參與者列表 */
  participants: Participant[];
  /** 抽獎結果列表 */
  results: DrawingResult[];
}

/**
 * 匯出完整活動資料為 JSON
 * @param eventId - 活動 ID
 * @returns 完整活動資料
 */
export async function exportEventToJson(eventId: string): Promise<EventBackupData> {
  const [event, prizes, participants, results] = await Promise.all([
    getEvent(eventId),
    listPrizesByEvent(eventId),
    listEventParticipants(eventId),
    listDrawingResultsByEvent(eventId),
  ]);

  if (!event) {
    throw new Error('活動不存在');
  }

  return {
    version: '1.0',
    exportedAt: dateUtils.now(),
    event,
    prizes,
    participants,
    results,
  };
}

/**
 * 僅匯出中獎結果（簡化版）
 * @param eventId - 活動 ID
 * @returns 中獎結果資料
 */
export async function exportResultsToJson(eventId: string): Promise<{
  eventId: string;
  eventName: string;
  exportedAt: string;
  results: Array<{
    drawSequence: number;
    drawnAt: string;
    prizeName: string;
    winnerName: string;
    employeeId: string | null;
    nationalId: string | null;
    status: string;
    notes: string | null;
  }>;
}> {
  const event = await getEvent(eventId);
  if (!event) {
    throw new Error('活動不存在');
  }

  const results = await listDrawingResultsByEvent(eventId, { status: 'confirmed' });
  const prizes = await listPrizesByEvent(eventId);
  const participants = await listEventParticipants(eventId);

  // Build a map for quick lookup
  const prizeMap = new Map(prizes.map((p) => [p.id, p]));
  const participantMap = new Map(participants.map((p) => [p.id, p]));

  return {
    eventId: event.id,
    eventName: event.name,
    exportedAt: dateUtils.now(),
    results: results.map((r) => {
      const prize = prizeMap.get(r.prizeId);
      const participant = participantMap.get(r.participantId);

      return {
        drawSequence: r.drawSequence,
        drawnAt: r.drawnAt,
        prizeName: prize?.name || '未知獎項',
        winnerName: participant?.name || '未知參與者',
        employeeId: participant?.employeeId || null,
        nationalId: participant?.nationalId || null,
        status: r.status === 'confirmed' ? '已確認' : '已取消',
        notes: r.notes,
      };
    }),
  };
}

/**
 * 將資料轉換為格式化的 JSON 字串
 * @param data - 要匯出的資料
 * @param pretty - 是否美化格式（預設為 true）
 * @returns JSON 字串
 */
export function toJsonString(data: unknown, pretty = true): string {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * 觸發 JSON 檔案下載
 * @param jsonContent - JSON 內容字串
 * @param filename - 檔案名稱
 */
export function downloadJson(jsonContent: string, filename: string): void {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * 生成完整備份 JSON 檔案名稱
 * @param eventName - 活動名稱
 * @returns 檔案名稱
 */
export function generateBackupJsonFilename(eventName: string): string {
  const timestamp = dateUtils.formatDate(dateUtils.now()).replace(/-/g, '');
  const sanitizedName = eventName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
  return `${sanitizedName}_完整備份_${timestamp}.json`;
}

/**
 * 生成中獎結果 JSON 檔案名稱
 * @param eventName - 活動名稱
 * @returns 檔案名稱
 */
export function generateResultsJsonFilename(eventName: string): string {
  const timestamp = dateUtils.formatDate(dateUtils.now()).replace(/-/g, '');
  const sanitizedName = eventName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
  return `${sanitizedName}_中獎名單_${timestamp}.json`;
}

/**
 * 驗證匯入的 JSON 資料格式
 * @param data - 要驗證的資料
 * @returns 是否為有效的備份資料
 */
export function isValidBackupData(data: unknown): data is EventBackupData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const backup = data as Record<string, unknown>;

  return (
    typeof backup.version === 'string' &&
    typeof backup.exportedAt === 'string' &&
    typeof backup.event === 'object' &&
    Array.isArray(backup.prizes) &&
    Array.isArray(backup.participants) &&
    Array.isArray(backup.results)
  );
}
