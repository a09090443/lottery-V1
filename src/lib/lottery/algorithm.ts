/**
 * Lottery Random Selection Algorithm
 * 抽獎隨機選擇演算法
 */

import { Participant } from '@/types';

/**
 * Fisher-Yates Shuffle Algorithm
 * 將陣列隨機打亂
 * @param array - 要打亂的陣列
 * @returns 打亂後的新陣列（不修改原陣列）
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * 從參與者池中隨機選擇一位中獎者
 * @param participants - 參與者列表
 * @returns 隨機選中的參與者
 */
export function selectRandomWinner(participants: Participant[]): Participant {
  if (participants.length === 0) {
    throw new Error('參與者列表不可為空');
  }

  const randomIndex = Math.floor(Math.random() * participants.length);
  return participants[randomIndex];
}

/**
 * 從參與者池中選擇多位中獎者（不重複）
 * @param participants - 參與者列表
 * @param count - 要選擇的中獎者數量
 * @returns 選中的參與者陣列
 */
export function selectMultipleWinners(participants: Participant[], count: number): Participant[] {
  if (count > participants.length) {
    throw new Error(`要選擇的數量 (${count}) 超過參與者總數 (${participants.length})`);
  }

  if (count <= 0) {
    throw new Error('選擇數量必須大於 0');
  }

  const shuffled = shuffle(participants);
  return shuffled.slice(0, count);
}

/**
 * 生成隨機參與者名單（用於動畫效果）
 * @param participants - 完整參與者列表
 * @param count - 要生成的隨機名單數量
 * @returns 隨機排列的參與者陣列
 */
export function generateAnimationSequence(participants: Participant[], count: number): Participant[] {
  const sequence: Participant[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * participants.length);
    sequence.push(participants[randomIndex]);
  }

  return sequence;
}

/**
 * 驗證隨機數生成器品質（用於測試）
 * @param participants - 參與者列表
 * @param iterations - 測試迭代次數
 * @returns 每位參與者被選中的次數統計
 */
export function testRandomnessQuality(
  participants: Participant[],
  iterations: number
): Map<string, number> {
  const counts = new Map<string, number>();

  participants.forEach((p) => counts.set(p.id, 0));

  for (let i = 0; i < iterations; i++) {
    const winner = selectRandomWinner(participants);
    counts.set(winner.id, (counts.get(winner.id) || 0) + 1);
  }

  return counts;
}
