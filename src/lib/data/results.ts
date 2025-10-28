/**
 * Drawing Result CRUD Operations
 * 抽獎結果資料的建立、讀取、更新、刪除操作
 */

import * as sqlite from '../database/sqlite';
import * as dateUtils from '../utils/date';
import { validate } from '../utils/validation';
import {
  DrawingResult,
  DrawingResultWithDetails,
  CreateDrawingResultInput,
  CreateDrawingResultInputSchema,
} from '@/types';
import { DataError } from './events';
import { getPrize, updatePrizeRemainingQuantity } from './prizes';
import { getParticipant, toDisplayData } from './participants';
import { getEvent, updateEventStats } from './events';

/**
 * 建立抽獎結果
 * @param input - 抽獎結果建立資料
 * @returns 建立的抽獎結果
 */
export async function createDrawingResult(input: CreateDrawingResultInput): Promise<DrawingResult> {
  // 驗證輸入資料
  const validation = validate(CreateDrawingResultInputSchema, input);
  if (!validation.success) {
    throw new DataError(`輸入資料驗證失敗: ${validation.errors?.map((e) => e.message).join(', ')}`);
  }

  const id = crypto.randomUUID();
  const now = dateUtils.now();

  const result: DrawingResult = {
    id,
    eventId: input.eventId,
    prizeId: input.prizeId,
    participantId: input.participantId,
    drawnAt: now,
    drawSequence: input.drawSequence,
    status: 'confirmed',
    notes: input.notes ?? null,
  };

  try {
    await sqlite.execute(
      `INSERT INTO drawing_results (
        id, event_id, prize_id, participant_id, drawn_at, draw_sequence, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        result.id,
        result.eventId,
        result.prizeId,
        result.participantId,
        result.drawnAt,
        result.drawSequence,
        result.status,
        result.notes,
      ]
    );

    // 更新獎項剩餘數量（減 1）
    await updatePrizeRemainingQuantity(input.prizeId, -1);

    // 更新活動的中獎者總數
    await updateDrawnWinnersCountForEvent(input.eventId);

    return result;
  } catch (error) {
    throw new DataError('建立抽獎結果失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 取得抽獎結果
 * @param id - 抽獎結果 ID
 * @returns 抽獎結果資料，若不存在則返回 null
 */
export async function getDrawingResult(id: string): Promise<DrawingResult | null> {
  try {
    const result = await sqlite.queryOne<any>(
      `SELECT
        id, event_id, prize_id, participant_id, drawn_at, draw_sequence, status, notes
      FROM drawing_results WHERE id = ?`,
      [id]
    );

    if (!result) {
      return null;
    }

    return mapRowToDrawingResult(result);
  } catch (error) {
    throw new DataError('取得抽獎結果失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 取得抽獎結果（含完整關聯資料）
 * @param id - 抽獎結果 ID
 * @returns 抽獎結果完整資料，若不存在則返回 null
 */
export async function getDrawingResultWithDetails(
  id: string
): Promise<DrawingResultWithDetails | null> {
  const result = await getDrawingResult(id);
  if (!result) {
    return null;
  }

  return enrichDrawingResult(result);
}

/**
 * 列出活動的所有抽獎結果
 * @param eventId - 活動 ID
 * @param options - 選項
 * @returns 抽獎結果列表
 */
export async function listDrawingResultsByEvent(
  eventId: string,
  options?: {
    status?: 'confirmed' | 'cancelled';
    limit?: number;
    offset?: number;
  }
): Promise<DrawingResult[]> {
  try {
    let sql = `SELECT
      id, event_id, prize_id, participant_id, drawn_at, draw_sequence, status, notes
    FROM drawing_results
    WHERE event_id = ?`;

    const params: Array<string | number> = [eventId];

    if (options?.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }

    sql += ' ORDER BY drawn_at DESC';

    if (options?.limit !== undefined) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options?.offset !== undefined) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    const results = await sqlite.query<any>(sql, params);
    return results.map(mapRowToDrawingResult);
  } catch (error) {
    throw new DataError('列出抽獎結果失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 列出獎項的所有抽獎結果
 * @param prizeId - 獎項 ID
 * @returns 抽獎結果列表
 */
export async function listDrawingResultsByPrize(prizeId: string): Promise<DrawingResult[]> {
  try {
    const results = await sqlite.query<any>(
      `SELECT
        id, event_id, prize_id, participant_id, drawn_at, draw_sequence, status, notes
      FROM drawing_results
      WHERE prize_id = ?
      ORDER BY draw_sequence ASC`,
      [prizeId]
    );

    return results.map(mapRowToDrawingResult);
  } catch (error) {
    throw new DataError('列出獎項抽獎結果失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 更新抽獎結果狀態
 * @param id - 抽獎結果 ID
 * @param status - 新狀態
 * @param notes - 備註（選填）
 * @returns 更新後的抽獎結果
 */
export async function updateDrawingResultStatus(
  id: string,
  status: 'confirmed' | 'cancelled',
  notes?: string
): Promise<DrawingResult> {
  // 檢查結果是否存在
  const existingResult = await getDrawingResult(id);
  if (!existingResult) {
    throw new DataError('抽獎結果不存在');
  }

  try {
    const params: Array<string> = [status];

    let sql = 'UPDATE drawing_results SET status = ?';

    if (notes !== undefined) {
      sql += ', notes = ?';
      params.push(notes);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await sqlite.execute(sql, params);

    // 如果取消結果，恢復獎項數量
    if (status === 'cancelled' && existingResult.status === 'confirmed') {
      await updatePrizeRemainingQuantity(existingResult.prizeId, 1);
      await updateDrawnWinnersCountForEvent(existingResult.eventId);
    }

    // 如果確認結果（從取消變為確認），減少獎項數量
    if (status === 'confirmed' && existingResult.status === 'cancelled') {
      await updatePrizeRemainingQuantity(existingResult.prizeId, -1);
      await updateDrawnWinnersCountForEvent(existingResult.eventId);
    }

    // 重新取得更新後的資料
    const updatedResult = await getDrawingResult(id);
    if (!updatedResult) {
      throw new DataError('更新後無法取得抽獎結果資料');
    }

    return updatedResult;
  } catch (error) {
    throw new DataError('更新抽獎結果狀態失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 刪除抽獎結果
 * @param id - 抽獎結果 ID
 */
export async function deleteDrawingResult(id: string): Promise<void> {
  try {
    // 先取得結果資料以便恢復獎項數量
    const result = await getDrawingResult(id);
    if (!result) {
      return;
    }

    // 如果是已確認的結果，恢復獎項數量
    if (result.status === 'confirmed') {
      await updatePrizeRemainingQuantity(result.prizeId, 1);
    }

    await sqlite.execute('DELETE FROM drawing_results WHERE id = ?', [id]);

    // 更新活動的中獎者總數
    await updateDrawnWinnersCountForEvent(result.eventId);
  } catch (error) {
    throw new DataError('刪除抽獎結果失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 取得獎項的下一個抽獎序號
 * @param prizeId - 獎項 ID
 * @returns 下一個序號
 */
export async function getNextDrawSequence(prizeId: string): Promise<number> {
  try {
    const result = await sqlite.queryOne<{ maxSeq: number | null }>(
      `SELECT MAX(draw_sequence) as maxSeq
       FROM drawing_results
       WHERE prize_id = ?`,
      [prizeId]
    );

    return (result?.maxSeq ?? 0) + 1;
  } catch (error) {
    throw new DataError('取得抽獎序號失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 更新活動的中獎者總數
 * @param eventId - 活動 ID
 */
async function updateDrawnWinnersCountForEvent(eventId: string): Promise<void> {
  try {
    const result = await sqlite.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM drawing_results
       WHERE event_id = ? AND status = 'confirmed'`,
      [eventId]
    );

    const count = result?.count ?? 0;
    await updateEventStats(eventId, { drawnWinnersCount: count });
  } catch (error) {
    throw new DataError('更新活動中獎者數量失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 將資料庫列轉換為 DrawingResult 物件
 */
function mapRowToDrawingResult(row: any): DrawingResult {
  return {
    id: row.id,
    eventId: row.event_id,
    prizeId: row.prize_id,
    participantId: row.participant_id,
    drawnAt: row.drawn_at,
    drawSequence: row.draw_sequence,
    status: row.status,
    notes: row.notes,
  };
}

/**
 * 豐富抽獎結果資料（加入關聯資料）
 */
async function enrichDrawingResult(result: DrawingResult): Promise<DrawingResultWithDetails> {
  const [prize, participant, event] = await Promise.all([
    getPrize(result.prizeId),
    getParticipant(result.participantId),
    getEvent(result.eventId),
  ]);

  if (!prize) {
    throw new DataError('獎項不存在');
  }

  if (!participant) {
    throw new DataError('參與者不存在');
  }

  if (!event) {
    throw new DataError('活動不存在');
  }

  return {
    ...result,
    prize,
    participant: toDisplayData(participant),
    eventName: event.name,
  };
}
