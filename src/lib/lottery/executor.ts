/**
 * Lottery Execution Workflow
 * 抽獎執行工作流程
 */

import { Participant, DrawingResult } from '@/types';
import { selectRandomWinner } from './algorithm';
import { filterEligibleParticipants, validateFullDrawingWorkflow } from './validator';
import { createDrawingResult, getNextDrawSequence, listDrawingResultsByEvent } from '../data/results';
import { getEvent } from '../data/events';
import { getPrize } from '../data/prizes';
import { listEventParticipants } from '../data/eventParticipants';

/**
 * 抽獎執行結果
 */
export interface DrawingExecutionResult {
  success: boolean;
  winner?: Participant;
  result?: DrawingResult;
  error?: string;
}

/**
 * 執行單次抽獎
 * @param eventId - 活動 ID
 * @param prizeId - 獎項 ID
 * @returns 抽獎執行結果
 */
export async function executeDraw(eventId: string, prizeId: string): Promise<DrawingExecutionResult> {
  try {
    // 載入活動資料
    const event = await getEvent(eventId);
    if (!event) {
      return { success: false, error: '活動不存在' };
    }

    // 載入獎項資料
    const prize = await getPrize(prizeId);
    if (!prize) {
      return { success: false, error: '獎項不存在' };
    }

    // 載入所有參與者
    const allParticipants = await listEventParticipants(eventId);
    if (allParticipants.length === 0) {
      return { success: false, error: '活動沒有參與者' };
    }

    // 載入現有抽獎結果
    const existingResults = await listDrawingResultsByEvent(eventId, { status: 'confirmed' });

    // 驗證抽獎前置條件
    const validation = validateFullDrawingWorkflow(event, prize, allParticipants, existingResults);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join('; ') };
    }

    // 過濾可參與的參與者
    const eligibleParticipants = filterEligibleParticipants(
      allParticipants,
      existingResults,
      event.allowDuplicateWinners
    );

    if (eligibleParticipants.length === 0) {
      return { success: false, error: '沒有符合資格的參與者' };
    }

    // 隨機選擇中獎者
    const winner = selectRandomWinner(eligibleParticipants);

    // 取得下一個抽獎序號
    const drawSequence = await getNextDrawSequence(prizeId);

    // 儲存抽獎結果
    const result = await createDrawingResult({
      eventId,
      prizeId,
      participantId: winner.id,
      drawSequence,
    });

    return {
      success: true,
      winner,
      result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '抽獎執行失敗',
    };
  }
}

/**
 * 執行多次抽獎（用於多數量獎項）
 * @param eventId - 活動 ID
 * @param prizeId - 獎項 ID
 * @param count - 要抽出的數量
 * @returns 抽獎執行結果陣列
 */
export async function executeMultipleDraws(
  eventId: string,
  prizeId: string,
  count: number
): Promise<DrawingExecutionResult[]> {
  const results: DrawingExecutionResult[] = [];

  for (let i = 0; i < count; i++) {
    const result = await executeDraw(eventId, prizeId);
    results.push(result);

    // 如果抽獎失敗，停止後續抽獎
    if (!result.success) {
      break;
    }
  }

  return results;
}

/**
 * 檢查抽獎是否可以繼續
 * @param eventId - 活動 ID
 * @param prizeId - 獎項 ID
 * @returns 是否可繼續抽獎及原因
 */
export async function canContinueDrawing(
  eventId: string,
  prizeId: string
): Promise<{ canContinue: boolean; reason?: string }> {
  try {
    const event = await getEvent(eventId);
    if (!event) {
      return { canContinue: false, reason: '活動不存在' };
    }

    if (event.status !== 'active') {
      return { canContinue: false, reason: '活動未啟用' };
    }

    const prize = await getPrize(prizeId);
    if (!prize) {
      return { canContinue: false, reason: '獎項不存在' };
    }

    if (prize.remainingQuantity <= 0) {
      return { canContinue: false, reason: '獎項數量已全數抽出' };
    }

    const allParticipants = await listEventParticipants(eventId);
    const existingResults = await listDrawingResultsByEvent(eventId, { status: 'confirmed' });

    const eligibleParticipants = filterEligibleParticipants(
      allParticipants,
      existingResults,
      event.allowDuplicateWinners
    );

    if (eligibleParticipants.length === 0) {
      return { canContinue: false, reason: '沒有符合資格的參與者' };
    }

    return { canContinue: true };
  } catch (error) {
    return {
      canContinue: false,
      reason: error instanceof Error ? error.message : '檢查失敗',
    };
  }
}

/**
 * 取得抽獎進度資訊
 * @param prizeId - 獎項 ID
 * @returns 抽獎進度
 */
export async function getDrawingProgress(prizeId: string): Promise<{
  totalQuantity: number;
  drawnCount: number;
  remainingCount: number;
  percentage: number;
}> {
  const prize = await getPrize(prizeId);
  if (!prize) {
    throw new Error('獎項不存在');
  }

  const drawnCount = prize.totalQuantity - prize.remainingQuantity;
  const percentage = prize.totalQuantity > 0 ? (drawnCount / prize.totalQuantity) * 100 : 0;

  return {
    totalQuantity: prize.totalQuantity,
    drawnCount,
    remainingCount: prize.remainingQuantity,
    percentage: Math.round(percentage),
  };
}
