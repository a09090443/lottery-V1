/**
 * Event CRUD Operations
 * 活動資料的建立、讀取、更新、刪除操作
 */

import * as sqlite from '../database/sqlite';
import * as dateUtils from '../utils/date';
import { validate } from '../utils/validation';
import {
  LotteryEvent,
  CreateEventInput,
  UpdateEventInput,
  CreateEventInputSchema,
  UpdateEventInputSchema,
  EventStatusType,
} from '@/types';

/**
 * 資料錯誤類別
 */
export class DataError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'DataError';
  }
}

/**
 * 建立活動
 * @param input - 活動建立資料
 * @returns 建立的活動
 */
export async function createEvent(input: CreateEventInput): Promise<LotteryEvent> {
  // 驗證輸入資料
  const validation = validate(CreateEventInputSchema, input);
  if (!validation.success) {
    throw new DataError(`輸入資料驗證失敗: ${validation.errors?.map((e) => e.message).join(', ')}`);
  }

  const id = crypto.randomUUID();
  const now = dateUtils.now();

  const event: LotteryEvent = {
    id,
    name: input.name,
    description: input.description ?? null,
    createdAt: now,
    updatedAt: now,
    scheduledAt: input.scheduledAt,
    status: 'draft',
    allowDuplicateWinners: input.allowDuplicateWinners ?? false,
    participantCount: 0,
    prizeCount: 0,
    drawnWinnersCount: 0,
  };

  try {
    await sqlite.execute(
      `INSERT INTO events (
        id, name, description, created_at, updated_at, scheduled_at,
        status, allow_duplicate_winners, participant_count, prize_count, drawn_winners_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.id,
        event.name,
        event.description,
        event.createdAt,
        event.updatedAt,
        event.scheduledAt,
        event.status,
        event.allowDuplicateWinners ? 1 : 0,
        event.participantCount,
        event.prizeCount,
        event.drawnWinnersCount,
      ]
    );

    return event;
  } catch (error) {
    throw new DataError('建立活動失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 取得活動
 * @param id - 活動 ID
 * @returns 活動資料，若不存在則返回 null
 */
export async function getEvent(id: string): Promise<LotteryEvent | null> {
  try {
    const result = await sqlite.queryOne<any>(
      `SELECT
        id, name, description, created_at, updated_at, scheduled_at,
        status, allow_duplicate_winners, participant_count, prize_count, drawn_winners_count
      FROM events WHERE id = ?`,
      [id]
    );

    if (!result) {
      return null;
    }

    return mapRowToEvent(result);
  } catch (error) {
    throw new DataError('取得活動失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 列出所有活動
 * @param filters - 篩選條件
 * @returns 活動列表
 */
export async function listEvents(filters?: {
  status?: EventStatusType | EventStatusType[];
  limit?: number;
  offset?: number;
}): Promise<LotteryEvent[]> {
  try {
    let sql = `SELECT
      id, name, description, created_at, updated_at, scheduled_at,
      status, allow_duplicate_winners, participant_count, prize_count, drawn_winners_count
    FROM events`;

    const params: Array<string | number> = [];

    // 狀態篩選
    if (filters?.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      const placeholders = statuses.map(() => '?').join(', ');
      sql += ` WHERE status IN (${placeholders})`;
      params.push(...statuses);
    }

    // 排序
    sql += ' ORDER BY scheduled_at DESC';

    // 分頁
    if (filters?.limit !== undefined) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters?.offset !== undefined) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }

    const results = await sqlite.query<any>(sql, params);
    return results.map(mapRowToEvent);
  } catch (error) {
    throw new DataError('列出活動失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 更新活動
 * @param id - 活動 ID
 * @param input - 更新資料
 * @returns 更新後的活動
 */
export async function updateEvent(id: string, input: UpdateEventInput): Promise<LotteryEvent> {
  // 驗證輸入資料
  const validation = validate(UpdateEventInputSchema, input);
  if (!validation.success) {
    throw new DataError(`輸入資料驗證失敗: ${validation.errors?.map((e) => e.message).join(', ')}`);
  }

  // 檢查活動是否存在
  const existingEvent = await getEvent(id);
  if (!existingEvent) {
    throw new DataError('活動不存在');
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

  if (input.scheduledAt !== undefined) {
    updates.push('scheduled_at = ?');
    params.push(input.scheduledAt);
  }

  if (input.allowDuplicateWinners !== undefined) {
    updates.push('allow_duplicate_winners = ?');
    params.push(input.allowDuplicateWinners ? 1 : 0);
  }

  if (input.status !== undefined) {
    updates.push('status = ?');
    params.push(input.status);
  }

  if (updates.length === 0) {
    return existingEvent;
  }

  // 加入 updated_at
  updates.push('updated_at = ?');
  params.push(dateUtils.now());

  // 加入 WHERE 條件的 ID
  params.push(id);

  try {
    await sqlite.execute(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, params);

    // 重新取得更新後的資料
    const updatedEvent = await getEvent(id);
    if (!updatedEvent) {
      throw new DataError('更新後無法取得活動資料');
    }

    return updatedEvent;
  } catch (error) {
    throw new DataError('更新活動失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 刪除活動
 * @param id - 活動 ID
 */
export async function deleteEvent(id: string): Promise<void> {
  try {
    await sqlite.execute('DELETE FROM events WHERE id = ?', [id]);
  } catch (error) {
    throw new DataError('刪除活動失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 更新活動統計數字
 * @param id - 活動 ID
 * @param stats - 統計數字
 */
export async function updateEventStats(
  id: string,
  stats: {
    participantCount?: number;
    prizeCount?: number;
    drawnWinnersCount?: number;
  }
): Promise<void> {
  const updates: string[] = [];
  const params: Array<number> = [];

  if (stats.participantCount !== undefined) {
    updates.push('participant_count = ?');
    params.push(stats.participantCount);
  }

  if (stats.prizeCount !== undefined) {
    updates.push('prize_count = ?');
    params.push(stats.prizeCount);
  }

  if (stats.drawnWinnersCount !== undefined) {
    updates.push('drawn_winners_count = ?');
    params.push(stats.drawnWinnersCount);
  }

  if (updates.length === 0) {
    return;
  }

  updates.push('updated_at = ?');
  params.push(Date.now());

  params.push(id);

  try {
    await sqlite.execute(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, params as any);
  } catch (error) {
    throw new DataError('更新活動統計失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 將資料庫列轉換為 LotteryEvent 物件
 */
function mapRowToEvent(row: any): LotteryEvent {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledAt: row.scheduled_at,
    status: row.status,
    allowDuplicateWinners: row.allow_duplicate_winners === 1,
    participantCount: row.participant_count,
    prizeCount: row.prize_count,
    drawnWinnersCount: row.drawn_winners_count,
  };
}
