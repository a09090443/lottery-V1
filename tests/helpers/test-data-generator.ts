/**
 * Test Data Generator
 * 測試資料生成器
 */

import {
  LotteryEvent,
  Prize,
  Participant,
  CreateEventInput,
  CreatePrizeInput,
  CreateParticipantInput
} from '@/types';

/**
 * 生成隨機中文姓名
 */
const surnames = ['王', '李', '張', '劉', '陳', '楊', '黃', '趙', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '林', '羅'];
const givenNames = ['明', '華', '建', '文', '志', '秀', '麗', '美', '芳', '敏', '靜', '軍', '傑', '偉', '強', '勇', '磊', '濤', '鵬', '剛'];

function generateChineseName(): string {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const given1 = givenNames[Math.floor(Math.random() * givenNames.length)];
  const given2 = Math.random() > 0.5 ? givenNames[Math.floor(Math.random() * givenNames.length)] : '';
  return surname + given1 + given2;
}

/**
 * 生成員工編號
 */
function generateEmployeeId(index: number): string {
  const year = new Date().getFullYear();
  const paddedIndex = String(index).padStart(4, '0');
  return `EMP${year}${paddedIndex}`;
}

/**
 * 生成身分證字號（假資料，僅用於測試）
 */
function generateNationalId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const firstLetter = letters[Math.floor(Math.random() * letters.length)];
  const gender = Math.random() > 0.5 ? '1' : '2';
  const numbers = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  return firstLetter + gender + numbers;
}

/**
 * 生成 Email
 */
function generateEmail(name: string, index: number): string {
  const domains = ['example.com', 'test.com', 'demo.com', 'mail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `user${index}@${domain}`;
}

/**
 * 生成電話號碼
 */
function generatePhone(): string {
  const prefix = ['09', '02', '03', '04', '05', '06', '07', '08'];
  const selectedPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const numbers = Array.from({ length: selectedPrefix === '09' ? 8 : 7 }, () => Math.floor(Math.random() * 10)).join('');
  return selectedPrefix + numbers;
}

/**
 * 測試資料生成器選項
 */
export interface GeneratorOptions {
  /** 參與者數量 */
  participantCount?: number;
  /** 獎項數量 */
  prizeCount?: number;
  /** 是否包含 Email */
  includeEmail?: boolean;
  /** 是否包含電話 */
  includePhone?: boolean;
  /** 使用員工編號而非身分證 */
  useEmployeeId?: boolean;
}

/**
 * 生成測試活動資料
 */
export function generateTestEvent(name?: string): CreateEventInput {
  const now = new Date();
  const scheduledDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天後

  return {
    name: name || `測試活動 ${now.getTime()}`,
    description: '這是一個自動生成的測試活動，用於功能測試',
    scheduledAt: scheduledDate.toISOString(),
    allowDuplicateWinners: false,
  };
}

/**
 * 生成測試獎項資料
 */
export function generateTestPrizes(count: number = 3): CreatePrizeInput[] {
  const prizeNames = [
    { name: '特等獎', quantity: 1 },
    { name: '頭獎', quantity: 2 },
    { name: '貳獎', quantity: 5 },
    { name: '參獎', quantity: 10 },
    { name: '肆獎', quantity: 20 },
    { name: '普獎', quantity: 50 },
  ];

  return prizeNames.slice(0, count).map((prize, index) => ({
    name: prize.name,
    description: `${prize.name}獎品描述`,
    totalQuantity: prize.quantity,
    displayOrder: index + 1,
  }));
}

/**
 * 生成測試參與者資料
 */
export function generateTestParticipants(
  count: number = 50,
  options: GeneratorOptions = {}
): CreateParticipantInput[] {
  const {
    includeEmail = true,
    includePhone = true,
    useEmployeeId = true,
  } = options;

  return Array.from({ length: count }, (_, index) => {
    const name = generateChineseName();

    return {
      name,
      employeeId: useEmployeeId ? generateEmployeeId(index + 1) : undefined,
      nationalId: !useEmployeeId ? generateNationalId() : undefined,
      email: includeEmail ? generateEmail(name, index + 1) : undefined,
      phone: includePhone ? generatePhone() : undefined,
    };
  });
}

/**
 * 生成 CSV 格式的參與者資料
 */
export function generateTestParticipantsCSV(count: number = 50): string {
  const participants = generateTestParticipants(count);

  // CSV 標題
  const headers = ['name', 'employeeId', 'nationalId', 'email', 'phone'];
  const csvRows = [headers.join(',')];

  // CSV 資料行
  participants.forEach(p => {
    const row = [
      p.name,
      p.employeeId || '',
      p.nationalId || '',
      p.email || '',
      p.phone || '',
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * 生成 Blob 格式的 CSV 檔案（用於瀏覽器上傳測試）
 */
export function generateTestParticipantsCSVBlob(count: number = 50): Blob {
  const csvContent = generateTestParticipantsCSV(count);
  // 加入 BOM 以支援 Excel 開啟中文
  const bom = '\uFEFF';
  return new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * 生成完整的測試場景資料
 */
export interface TestScenarioData {
  event: CreateEventInput;
  prizes: CreatePrizeInput[];
  participants: CreateParticipantInput[];
  csvBlob: Blob;
}

export function generateCompleteTestScenario(options: GeneratorOptions = {}): TestScenarioData {
  const {
    participantCount = 100,
    prizeCount = 3,
  } = options;

  return {
    event: generateTestEvent(),
    prizes: generateTestPrizes(prizeCount),
    participants: generateTestParticipants(participantCount, options),
    csvBlob: generateTestParticipantsCSVBlob(participantCount),
  };
}

/**
 * 生成小型測試場景（快速測試）
 */
export function generateSmallTestScenario(): TestScenarioData {
  return generateCompleteTestScenario({
    participantCount: 20,
    prizeCount: 2,
  });
}

/**
 * 生成中型測試場景（標準測試）
 */
export function generateMediumTestScenario(): TestScenarioData {
  return generateCompleteTestScenario({
    participantCount: 100,
    prizeCount: 3,
  });
}

/**
 * 生成大型測試場景（壓力測試）
 */
export function generateLargeTestScenario(): TestScenarioData {
  return generateCompleteTestScenario({
    participantCount: 500,
    prizeCount: 5,
  });
}

/**
 * 生成管理員測試密碼
 */
export const TEST_ADMIN_PASSWORD = 'Test1234!@#$';

/**
 * 生成測試用的活動名稱（含時間戳避免衝突）
 */
export function generateUniqueEventName(prefix: string = '測試活動'): string {
  return `${prefix}_${Date.now()}`;
}
