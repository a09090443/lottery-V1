/**
 * Event-Participant Association Operations
 * 活動與參與者的關聯操作
 */

import * as sqlite from '../database/sqlite';
import * as dateUtils from '../utils/date';
import { DataError } from './events';
import { Participant } from '@/types';
import { getParticipant } from './participants';
import { getEvent, updateEventStats } from './events';

/**
 * 將參與者加入活動
 * @param eventId - 活動 ID
 * @param participantId - 參與者 ID
 */
export async function addParticipantToEvent(eventId: string, participantId: string): Promise<void> {
  try {
    // 檢查活動是否存在
    const event = await getEvent(eventId);
    if (!event) {
      throw new DataError('活動不存在');
    }

    // 檢查參與者是否存在
    const participant = await getParticipant(participantId);
    if (!participant) {
      throw new DataError('參與者不存在');
    }

    // 檢查是否已經加入
    const exists = await isParticipantInEvent(eventId, participantId);
    if (exists) {
      throw new DataError('參與者已經在此活動中');
    }

    const now = dateUtils.now();

    await sqlite.execute(
      `INSERT INTO event_participants (event_id, participant_id, added_at)
       VALUES (?, ?, ?)`,
      [eventId, participantId, now]
    );

    // 更新活動的參與者數量
    await updateParticipantCountForEvent(eventId);
  } catch (error) {
    throw new DataError('加入參與者失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 批次將參與者加入活動
 * @param eventId - 活動 ID
 * @param participantIds - 參與者 ID 列表
 */
export async function addParticipantsToEvent(eventId: string, participantIds: string[]): Promise<void> {
  try {
    // 檢查活動是否存在
    const event = await getEvent(eventId);
    if (!event) {
      throw new DataError('活動不存在');
    }

    const now = dateUtils.now();

    // 批次插入
    for (const participantId of participantIds) {
      // 檢查參與者是否存在
      const participant = await getParticipant(participantId);
      if (!participant) {
        continue; // 跳過不存在的參與者
      }

      // 檢查是否已經加入
      const exists = await isParticipantInEvent(eventId, participantId);
      if (exists) {
        continue; // 跳過已存在的
      }

      await sqlite.execute(
        `INSERT INTO event_participants (event_id, participant_id, added_at)
         VALUES (?, ?, ?)`,
        [eventId, participantId, now]
      );
    }

    // 更新活動的參與者數量
    await updateParticipantCountForEvent(eventId);
  } catch (error) {
    throw new DataError('批次加入參與者失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 將參與者從活動中移除
 * @param eventId - 活動 ID
 * @param participantId - 參與者 ID
 */
export async function removeParticipantFromEvent(eventId: string, participantId: string): Promise<void> {
  try {
    // 檢查參與者是否已經中獎
    const hasWon = await hasParticipantWonInEvent(eventId, participantId);
    if (hasWon) {
      throw new DataError('已中獎的參與者無法移除');
    }

    await sqlite.execute(
      `DELETE FROM event_participants
       WHERE event_id = ? AND participant_id = ?`,
      [eventId, participantId]
    );

    // 更新活動的參與者數量
    await updateParticipantCountForEvent(eventId);
  } catch (error) {
    throw new DataError('移除參與者失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 列出活動的所有參與者
 * @param eventId - 活動 ID
 * @param options - 選項
 * @returns 參與者列表
 */
export async function listEventParticipants(
  eventId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<Participant[]> {
  try {
    let sql = `SELECT
      p.id, p.name, p.employee_id, p.national_id, p.email, p.phone, p.created_at, p.updated_at
    FROM participants p
    INNER JOIN event_participants ep ON p.id = ep.participant_id
    WHERE ep.event_id = ?
    ORDER BY ep.added_at DESC`;

    const params: Array<string | number> = [eventId];

    if (options?.limit !== undefined) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options?.offset !== undefined) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    const results = await sqlite.query<any>(sql, params);
    return results.map(mapRowToParticipant);
  } catch (error) {
    throw new DataError('列出活動參與者失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 取得活動的參與者數量
 * @param eventId - 活動 ID
 * @returns 參與者數量
 */
export async function getEventParticipantCount(eventId: string): Promise<number> {
  try {
    const result = await sqlite.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM event_participants
       WHERE event_id = ?`,
      [eventId]
    );

    return result?.count ?? 0;
  } catch (error) {
    throw new DataError('取得參與者數量失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 檢查參與者是否在活動中
 * @param eventId - 活動 ID
 * @param participantId - 參與者 ID
 * @returns 是否在活動中
 */
export async function isParticipantInEvent(eventId: string, participantId: string): Promise<boolean> {
  try {
    const result = await sqlite.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM event_participants
       WHERE event_id = ? AND participant_id = ?`,
      [eventId, participantId]
    );

    return result ? result.count > 0 : false;
  } catch (error) {
    throw new DataError('檢查參與者是否在活動中失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 檢查參與者是否已在活動中中獎
 * @param eventId - 活動 ID
 * @param participantId - 參與者 ID
 * @returns 是否已中獎
 */
async function hasParticipantWonInEvent(eventId: string, participantId: string): Promise<boolean> {
  try {
    const result = await sqlite.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM drawing_results dr
       INNER JOIN prizes p ON dr.prize_id = p.id
       WHERE p.event_id = ? AND dr.participant_id = ? AND dr.status = 'confirmed'`,
      [eventId, participantId]
    );

    return result ? result.count > 0 : false;
  } catch (error) {
    throw new DataError('檢查中獎狀態失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 更新活動的參與者數量
 * @param eventId - 活動 ID
 */
async function updateParticipantCountForEvent(eventId: string): Promise<void> {
  try {
    const count = await getEventParticipantCount(eventId);
    await updateEventStats(eventId, { participantCount: count });
  } catch (error) {
    throw new DataError('更新活動參與者數量失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 將資料庫列轉換為 Participant 物件
 */
function mapRowToParticipant(row: any): Participant {
  return {
    id: row.id,
    name: row.name,
    employeeId: row.employee_id,
    nationalId: row.national_id,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
