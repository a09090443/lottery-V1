/**
 * CSV 測試檔案生成器
 * 生成不同數量的參與者測試資料
 */

const fs = require('fs');
const path = require('path');

// 姓氏與名字庫
const surnames = ['王', '李', '張', '劉', '陳', '楊', '黃', '趙', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '林', '羅'];
const givenNames = ['明', '華', '建', '文', '志', '秀', '麗', '美', '芳', '敏', '靜', '軍', '傑', '偉', '強', '勇', '磊', '濤', '鵬', '剛'];

/**
 * 生成隨機中文姓名
 */
function generateChineseName() {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const given1 = givenNames[Math.floor(Math.random() * givenNames.length)];
  const given2 = Math.random() > 0.5 ? givenNames[Math.floor(Math.random() * givenNames.length)] : '';
  return surname + given1 + given2;
}

/**
 * 生成員工編號
 */
function generateEmployeeId(index) {
  const year = new Date().getFullYear();
  const paddedIndex = String(index).padStart(4, '0');
  return `EMP${year}${paddedIndex}`;
}

/**
 * 生成身分證字號（假資料，僅用於測試）
 */
function generateNationalId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const firstLetter = letters[Math.floor(Math.random() * letters.length)];
  const gender = Math.random() > 0.5 ? '1' : '2';
  const numbers = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  return firstLetter + gender + numbers;
}

/**
 * 生成 Email
 */
function generateEmail(index) {
  const domains = ['company.com', 'test.com', 'demo.com', 'example.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `user${String(index).padStart(4, '0')}@${domain}`;
}

/**
 * 生成電話號碼
 */
function generatePhone() {
  const prefix = ['0912', '0922', '0932', '0952', '0972', '0982'];
  const selectedPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const numbers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
  return selectedPrefix + numbers;
}

/**
 * 生成 CSV 內容
 */
function generateCSV(count, options = {}) {
  const { useEmployeeId = true, includeEmail = true, includePhone = true } = options;

  // CSV 標題列
  const headers = ['姓名', '員工編號', '身分證字號', 'Email', '電話'];
  const rows = [headers.join(',')];

  // 生成資料列
  for (let i = 1; i <= count; i++) {
    const name = generateChineseName();
    const employeeId = useEmployeeId && i % 2 === 1 ? generateEmployeeId(i) : '';
    const nationalId = !employeeId ? generateNationalId() : '';
    const email = includeEmail ? generateEmail(i) : '';
    const phone = includePhone ? generatePhone() : '';

    rows.push([name, employeeId, nationalId, email, phone].join(','));
  }

  // 加上 BOM 以支援 Excel 開啟中文
  const bom = '\uFEFF';
  return bom + rows.join('\n');
}

/**
 * 儲存 CSV 檔案
 */
function saveCSV(filename, content) {
  const csvDir = path.join(__dirname, '../csv');

  // 確保目錄存在
  if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
  }

  const filepath = path.join(csvDir, filename);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ 已生成: ${filename} (${content.split('\n').length - 1} 筆資料)`);
}

/**
 * 主函式
 */
function main() {
  console.log('🚀 開始生成 CSV 測試檔案...\n');

  // 100 筆資料
  console.log('📄 生成 100 筆參與者資料...');
  const csv100 = generateCSV(100);
  saveCSV('participants_100.csv', csv100);

  // 500 筆資料
  console.log('📄 生成 500 筆參與者資料...');
  const csv500 = generateCSV(500);
  saveCSV('participants_500.csv', csv500);

  // 1000 筆資料
  console.log('📄 生成 1000 筆參與者資料...');
  const csv1000 = generateCSV(1000);
  saveCSV('participants_1000.csv', csv1000);

  // 範本檔案（僅 5 筆）
  console.log('📄 生成範本檔案...');
  const template = generateCSV(5);
  saveCSV('participants_template.csv', template);

  console.log('\n✨ 所有 CSV 檔案生成完成！');
  console.log('\n檔案位置: tests/fixtures/csv/');
}

// 執行
main();
