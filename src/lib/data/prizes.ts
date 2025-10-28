/**
 * Prize CRUD Operations
 * 獎項資料的建立、讀取、更新、刪除操作
 */

import * as sqlite from '../database/sqlite';
import * as dateUtils from '../utils/date';
import { validate } from '../utils/validation';
import { Prize, CreatePrizeInput, UpdatePrizeInput, CreatePrizeInputSchema, UpdatePrizeInputSchema } from '@/types';
import { DataError } from './events';
import { updateEventStats } from './events';

/**
 * 建立獎項
 * @param input - 獎項建立資料
 * @returns 建立的獎項
 */
export async function createPrize(input: CreatePrizeInput): Promise<Prize> {
  // 驗證輸入資料
  const validation = validate(CreatePrizeInputSchema, input);
  if (!validation.success) {
    throw new DataError(`輸入資料驗證失敗: ${validation.errors?.map((e) => e.message).join(', ')}`);
  }

  const id = crypto.randomUUID();
  const now = dateUtils.now();

  const prize: Prize = {
    id,
    eventId: input.eventId,
    name: input.name,
    description: input.description ?? null,
    totalQuantity: input.totalQuantity,
    remainingQuantity: input.totalQuantity, // 初始等於總數
    displayOrder: input.displayOrder ?? 999,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await sqlite.execute(
      `INSERT INTO prizes (
        id, event_id, name, description, total_quantity, remaining_quantity,
        display_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prize.id,
        prize.eventId,
        prize.name,
        prize.description,
        prize.totalQuantity,
        prize.remainingQuantity,
        prize.displayOrder,
        prize.createdAt,
        prize.updatedAt,
      ]
    );

    // 更新活動的獎項數量
    await updatePrizeCountForEvent(input.eventId);

    return prize;
  } catch (error) {
    throw new DataError('建立獎項失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 取得獎項
 * @param id - 獎項 ID
 * @returns 獎項資料，若不存在則返回 null
 */
export async function getPrize(id: string): Promise<Prize | null> {
  try {
    const result = await sqlite.queryOne<any>(
      `SELECT
        id, event_id, name, description, total_quantity, remaining_quantity,
        display_order, created_at, updated_at
      FROM prizes WHERE id = ?`,
      [id]
    );

    if (!result) {
      return null;
    }

    return mapRowToPrize(result);
  } catch (error) {
    throw new DataError('取得獎項失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 列出活動的所有獎項
 * @param eventId - 活動 ID
 * @returns 獎項列表（依 displayOrder 排序）
 */
export async function listPrizesByEvent(eventId: string): Promise<Prize[]> {
  try {
    const results = await sqlite.query<any>(
      `SELECT
        id, event_id, name, description, total_quantity, remaining_quantity,
        display_order, created_at, updated_at
      FROM prizes
      WHERE event_id = ?
      ORDER BY display_order ASC, created_at ASC`,
      [eventId]
    );

    return results.map(mapRowToPrize);
  } catch (error) {
    throw new DataError('列出獎項失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 更新獎項
 * @param id - 獎項 ID
 * @param input - 更新資料
 * @returns 更新後的獎項
 */
export async function updatePrize(id: string, input: UpdatePrizeInput): Promise<Prize> {
  // 驗證輸入資料
  const validation = validate(UpdatePrizeInputSchema, input);
  if (!validation.success) {
    throw new DataError(`輸入資料驗證失敗: ${validation.errors?.map((e) => e.message).join(', ')}`);
  }

  // 檢查獎項是否存在
  const existingPrize = await getPrize(id);
  if (!existingPrize) {
    throw new DataError('獎項不存在');
  }

  const updates: string[] = [];
  const params: Array<string | number> = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    params.push(input.name);
  }

  if (input.description !== undefined) {
    updates.push('description = ?');
    params.push(input.description);
  }

  if (input.totalQuantity !== undefined) {
    // 檢查新的總數量是否小於已抽出的數量
    const drawnCount = existingPrize.totalQuantity - existingPrize.remainingQuantity;
    if (input.totalQuantity < drawnCount) {
      throw new DataError(`總數量不可小於已抽出的數量（${drawnCount}）`);
    }

    updates.push('total_quantity = ?');
    params.push(input.totalQuantity);

    // 同時更新剩餘數量
    const newRemaining = input.totalQuantity - drawnCount;
    updates.push('remaining_quantity = ?');
    params.push(newRemaining);
  }

  if (input.displayOrder !== undefined) {
    updates.push('display_order = ?');
    params.push(input.displayOrder);
  }

  if (updates.length === 0) {
    return existingPrize;
  }

  // 加入 updated_at
  updates.push('updated_at = ?');
  params.push(dateUtils.now());

  // 加入 WHERE 條件的 ID
  params.push(id);

  try {
    await sqlite.execute(`UPDATE prizes SET ${updates.join(', ')} WHERE id = ?`, params);

    // 重新取得更新後的資料
    const updatedPrize = await getPrize(id);
    if (!updatedPrize) {
      throw new DataError('更新後無法取得獎項資料');
    }

    return updatedPrize;
  } catch (error) {
    throw new DataError('更新獎項失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 刪除獎項
 * @param id - 獎項 ID
 */
export async function deletePrize(id: string): Promise<void> {
  try {
    // 先取得獎項資料以便更新活動統計
    const prize = await getPrize(id);
    if (!prize) {
      return;
    }

    // 檢查是否已有中獎者
    const drawnCount = prize.totalQuantity - prize.remainingQuantity;
    if (drawnCount > 0) {
      throw new DataError('已有中獎者的獎項無法刪除');
    }

    await sqlite.execute('DELETE FROM prizes WHERE id = ?', [id]);

    // 更新活動的獎項數量
    await updatePrizeCountForEvent(prize.eventId);
  } catch (error) {
    throw new DataError('刪除獎項失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 更新獎項剩餘數量
 * @param id - 獎項 ID
 * @param delta - 變動量（正數增加，負數減少）
 */
export async function updatePrizeRemainingQuantity(id: string, delta: number): Promise<void> {
  try {
    await sqlite.execute(
      `UPDATE prizes
       SET remaining_quantity = remaining_quantity + ?,
           updated_at = ?
       WHERE id = ?`,
      [delta, dateUtils.now(), id]
    );
  } catch (error) {
    throw new DataError('更新獎項剩餘數量失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 更新活動的獎項總數
 * @param eventId - 活動 ID
 */
async function updatePrizeCountForEvent(eventId: string): Promise<void> {
  try {
    const prizes = await listPrizesByEvent(eventId);
    await updateEventStats(eventId, { prizeCount: prizes.length });
  } catch (error) {
    throw new DataError('更新活動獎項數量失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 將資料庫列轉換為 Prize 物件
 */
function mapRowToPrize(row: any): Prize {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    description: row.description,
    totalQuantity: row.total_quantity,
    remainingQuantity: row.remaining_quantity,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
