/**
 * Participant CRUD Operations
 * 參與者資料的建立、讀取、更新、刪除操作
 */

import * as sqlite from '../database/sqlite';
import * as dateUtils from '../utils/date';
import { validate } from '../utils/validation';
import { maskEmployeeId, maskNationalId } from '../utils/idMasking';
import {
  Participant,
  ParticipantDisplayData,
  CreateParticipantInput,
  UpdateParticipantInput,
  CreateParticipantInputSchema,
  UpdateParticipantInputSchema,
} from '@/types';
import { DataError } from './events';

/**
 * 建立參與者
 * @param input - 參與者建立資料
 * @returns 建立的參與者
 */
export async function createParticipant(input: CreateParticipantInput): Promise<Participant> {
  // 驗證輸入資料
  const validation = validate(CreateParticipantInputSchema, input);
  if (!validation.success) {
    throw new DataError(`輸入資料驗證失敗: ${validation.errors?.map((e) => e.message).join(', ')}`);
  }

  const id = crypto.randomUUID();
  const now = dateUtils.now();

  const participant: Participant = {
    id,
    name: input.name,
    employeeId: input.employeeId ?? null,
    nationalId: input.nationalId ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await sqlite.execute(
      `INSERT INTO participants (
        id, name, employee_id, national_id, email, phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        participant.id,
        participant.name,
        participant.employeeId,
        participant.nationalId,
        participant.email,
        participant.phone,
        participant.createdAt,
        participant.updatedAt,
      ]
    );

    return participant;
  } catch (error) {
    throw new DataError('建立參與者失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 取得參與者
 * @param id - 參與者 ID
 * @returns 參與者資料，若不存在則返回 null
 */
export async function getParticipant(id: string): Promise<Participant | null> {
  try {
    const result = await sqlite.queryOne<any>(
      `SELECT
        id, name, employee_id, national_id, email, phone, created_at, updated_at
      FROM participants WHERE id = ?`,
      [id]
    );

    if (!result) {
      return null;
    }

    return mapRowToParticipant(result);
  } catch (error) {
    throw new DataError('取得參與者失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 取得參與者（UI 顯示用，ID 已遮罩）
 * @param id - 參與者 ID
 * @returns 參與者顯示資料，若不存在則返回 null
 */
export async function getParticipantDisplay(id: string): Promise<ParticipantDisplayData | null> {
  const participant = await getParticipant(id);
  if (!participant) {
    return null;
  }

  return toDisplayData(participant);
}

/**
 * 列出所有參與者
 * @param options - 選項
 * @returns 參與者列表
 */
export async function listParticipants(options?: {
  limit?: number;
  offset?: number;
}): Promise<Participant[]> {
  try {
    let sql = `SELECT
      id, name, employee_id, national_id, email, phone, created_at, updated_at
    FROM participants
    ORDER BY created_at DESC`;

    const params: Array<number> = [];

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
    throw new DataError('列出參與者失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 檢查參與者唯一性（在特定活動中）
 * @param eventId - 活動 ID
 * @param name - 姓名
 * @param employeeId - 員工編號
 * @param nationalId - 身分證字號
 * @returns 是否唯一（true = 可以新增）
 */
export async function checkParticipantUniqueness(
  eventId: string,
  name: string,
  employeeId: string | null,
  nationalId: string | null
): Promise<boolean> {
  try {
    // 在活動中查詢是否有相同 name + employeeId 或 name + nationalId 的參與者
    const sql = `
      SELECT COUNT(*) as count
      FROM participants p
      INNER JOIN event_participants ep ON p.id = ep.participant_id
      WHERE ep.event_id = ?
        AND p.name = ?
        AND (
          (p.employee_id = ? AND ? IS NOT NULL)
          OR
          (p.national_id = ? AND ? IS NOT NULL)
        )
    `;

    const result = await sqlite.queryOne<{ count: number }>(sql, [
      eventId,
      name,
      employeeId,
      employeeId,
      nationalId,
      nationalId,
    ]);

    return result ? result.count === 0 : true;
  } catch (error) {
    throw new DataError('檢查參與者唯一性失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 更新參與者
 * @param id - 參與者 ID
 * @param input - 更新資料
 * @returns 更新後的參與者
 */
export async function updateParticipant(id: string, input: UpdateParticipantInput): Promise<Participant> {
  // 驗證輸入資料
  const validation = validate(UpdateParticipantInputSchema, input);
  if (!validation.success) {
    throw new DataError(`輸入資料驗證失敗: ${validation.errors?.map((e) => e.message).join(', ')}`);
  }

  // 檢查參與者是否存在
  const existingParticipant = await getParticipant(id);
  if (!existingParticipant) {
    throw new DataError('參與者不存在');
  }

  const updates: string[] = [];
  const params: Array<string | null> = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    params.push(input.name);
  }

  if (input.employeeId !== undefined) {
    updates.push('employee_id = ?');
    params.push(input.employeeId);
  }

  if (input.nationalId !== undefined) {
    updates.push('national_id = ?');
    params.push(input.nationalId);
  }

  if (input.email !== undefined) {
    updates.push('email = ?');
    params.push(input.email);
  }

  if (input.phone !== undefined) {
    updates.push('phone = ?');
    params.push(input.phone);
  }

  if (updates.length === 0) {
    return existingParticipant;
  }

  // 加入 updated_at
  updates.push('updated_at = ?');
  params.push(dateUtils.now());

  // 加入 WHERE 條件的 ID
  params.push(id);

  try {
    await sqlite.execute(`UPDATE participants SET ${updates.join(', ')} WHERE id = ?`, params);

    // 重新取得更新後的資料
    const updatedParticipant = await getParticipant(id);
    if (!updatedParticipant) {
      throw new DataError('更新後無法取得參與者資料');
    }

    return updatedParticipant;
  } catch (error) {
    throw new DataError('更新參與者失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 刪除參與者
 * @param id - 參與者 ID
 */
export async function deleteParticipant(id: string): Promise<void> {
  try {
    await sqlite.execute('DELETE FROM participants WHERE id = ?', [id]);
  } catch (error) {
    throw new DataError('刪除參與者失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 將參與者轉換為顯示資料（ID 遮罩）
 * @param participant - 參與者
 * @returns 參與者顯示資料
 */
export function toDisplayData(participant: Participant): ParticipantDisplayData {
  return {
    id: participant.id,
    name: participant.name,
    maskedEmployeeId: maskEmployeeId(participant.employeeId),
    maskedNationalId: maskNationalId(participant.nationalId),
    email: participant.email,
    phone: participant.phone,
    createdAt: participant.createdAt,
    updatedAt: participant.updatedAt,
  };
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
