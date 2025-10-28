/**
 * Lottery Validator
 * 抽獎驗證器
 */

import { LotteryEvent, Prize, Participant, DrawingResult } from '@/types';
import { getEvent } from '../data/events';
import { getPrize } from '../data/prizes';
import { listEventParticipants } from '../data/eventParticipants';

/**
 * 驗證結果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 驗證抽獎前置條件
 * @param eventId - 活動 ID
 * @param prizeId - 獎項 ID
 * @returns 驗證結果
 */
export async function validateDrawingPreconditions(
  eventId: string,
  prizeId: string
): Promise<ValidationResult> {
  const errors: string[] = [];

  // 檢查活動是否存在
  const event = await getEvent(eventId);
  if (!event) {
    errors.push('活動不存在');
    return { isValid: false, errors };
  }

  // 檢查活動狀態
  if (event.status !== 'active') {
    errors.push(`活動狀態為「${event.status}」，無法執行抽獎`);
  }

  // 檢查獎項是否存在
  const prize = await getPrize(prizeId);
  if (!prize) {
    errors.push('獎項不存在');
    return { isValid: false, errors };
  }

  // 檢查獎項是否屬於該活動
  if (prize.eventId !== eventId) {
    errors.push('獎項不屬於此活動');
  }

  // 檢查獎項剩餘數量
  if (prize.remainingQuantity <= 0) {
    errors.push('獎項數量已全數抽出');
  }

  // 檢查參與者數量
  const participants = await listEventParticipants(eventId);
  if (participants.length === 0) {
    errors.push('活動沒有參與者');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 驗證參與者是否可參與抽獎
 * @param participantId - 參與者 ID
 * @param eventId - 活動 ID
 * @param existingResults - 已存在的抽獎結果
 * @param allowDuplicateWinners - 是否允許重複中獎
 * @returns 驗證結果
 */
export function validateParticipantEligibility(
  participantId: string,
  eventId: string,
  existingResults: DrawingResult[],
  allowDuplicateWinners: boolean
): ValidationResult {
  const errors: string[] = [];

  // 如果不允許重複中獎，檢查該參與者是否已中獎
  if (!allowDuplicateWinners) {
    const hasWon = existingResults.some(
      (result) => result.participantId === participantId && result.status === 'confirmed'
    );

    if (hasWon) {
      errors.push('該參與者已中獎，不可重複中獎');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 過濾可參與抽獎的參與者
 * @param allParticipants - 所有參與者
 * @param existingResults - 已存在的抽獎結果
 * @param allowDuplicateWinners - 是否允許重複中獎
 * @returns 可參與抽獎的參與者列表
 */
export function filterEligibleParticipants(
  allParticipants: Participant[],
  existingResults: DrawingResult[],
  allowDuplicateWinners: boolean
): Participant[] {
  // 如果允許重複中獎，所有人都可參與
  if (allowDuplicateWinners) {
    return allParticipants;
  }

  // 不允許重複中獎，排除已中獎者
  const winnersSet = new Set(
    existingResults.filter((r) => r.status === 'confirmed').map((r) => r.participantId)
  );

  return allParticipants.filter((p) => !winnersSet.has(p.id));
}

/**
 * 驗證參與者池是否足夠
 * @param eligibleParticipants - 可參與的參與者
 * @param requiredCount - 需要的參與者數量
 * @returns 驗證結果
 */
export function validateParticipantPool(
  eligibleParticipants: Participant[],
  requiredCount: number = 1
): ValidationResult {
  const errors: string[] = [];

  if (eligibleParticipants.length === 0) {
    errors.push('沒有符合資格的參與者');
  } else if (eligibleParticipants.length < requiredCount) {
    errors.push(`可參與的參與者數量 (${eligibleParticipants.length}) 不足所需數量 (${requiredCount})`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 驗證獎項可用性
 * @param prize - 獎項
 * @param requestedCount - 要抽出的數量
 * @returns 驗證結果
 */
export function validatePrizeAvailability(prize: Prize, requestedCount: number = 1): ValidationResult {
  const errors: string[] = [];

  if (prize.remainingQuantity < requestedCount) {
    errors.push(
      `獎項剩餘數量 (${prize.remainingQuantity}) 不足所需數量 (${requestedCount})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 完整驗證抽獎流程
 * @param event - 活動
 * @param prize - 獎項
 * @param participants - 參與者列表
 * @param existingResults - 已存在的抽獎結果
 * @returns 驗證結果
 */
export function validateFullDrawingWorkflow(
  event: LotteryEvent,
  prize: Prize,
  participants: Participant[],
  existingResults: DrawingResult[]
): ValidationResult {
  const allErrors: string[] = [];

  // 驗證活動狀態
  if (event.status !== 'active') {
    allErrors.push('活動未啟用');
  }

  // 驗證獎項屬於活動
  if (prize.eventId !== event.id) {
    allErrors.push('獎項不屬於此活動');
  }

  // 驗證獎項可用性
  const prizeValidation = validatePrizeAvailability(prize, 1);
  allErrors.push(...prizeValidation.errors);

  // 過濾可參與的參與者
  const eligibleParticipants = filterEligibleParticipants(
    participants,
    existingResults,
    event.allowDuplicateWinners
  );

  // 驗證參與者池
  const poolValidation = validateParticipantPool(eligibleParticipants, 1);
  allErrors.push(...poolValidation.errors);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
