/**
 * CSV Parser
 * CSV 檔案解析器
 */

/**
 * CSV 解析結果
 */
export interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

/**
 * CSV 解析選項
 */
export interface CSVParseOptions {
  delimiter?: string; // 分隔符號，預設為逗號
  skipEmptyLines?: boolean; // 是否跳過空行
  trim?: boolean; // 是否移除欄位前後空白
}

/**
 * 解析 CSV 文字內容
 * @param content - CSV 文字內容
 * @param options - 解析選項
 * @returns 解析結果
 */
export function parseCSV(content: string, options?: CSVParseOptions): ParsedCSV {
  const delimiter = options?.delimiter ?? ',';
  const skipEmptyLines = options?.skipEmptyLines ?? true;
  const trim = options?.trim ?? true;

  const lines = content.split(/\r?\n/);
  const allRows: string[][] = [];

  for (const line of lines) {
    // 跳過空行
    if (skipEmptyLines && line.trim() === '') {
      continue;
    }

    const row = parseLine(line, delimiter, trim);
    allRows.push(row);
  }

  if (allRows.length === 0) {
    return { headers: [], rows: [] };
  }

  const [headers, ...rows] = allRows;
  return { headers, rows };
}

/**
 * 解析 CSV 單行（處理引號內的逗號）
 * @param line - 單行文字
 * @param delimiter - 分隔符號
 * @param trim - 是否移除空白
 * @returns 欄位陣列
 */
function parseLine(line: string, delimiter: string, trim: boolean): string[] {
  const fields: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      // 處理雙引號跳脫 ("")
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // 跳過下一個引號
      } else {
        // 切換引號狀態
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      // 遇到分隔符號且不在引號內
      fields.push(trim ? currentField.trim() : currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // 加入最後一個欄位
  fields.push(trim ? currentField.trim() : currentField);

  return fields;
}

/**
 * 從 File 物件讀取並解析 CSV
 * @param file - File 物件
 * @param options - 解析選項
 * @returns 解析結果
 */
export async function parseCSVFile(file: File, options?: CSVParseOptions): Promise<ParsedCSV> {
  const content = await readFileAsText(file);
  return parseCSV(content, options);
}

/**
 * 讀取 File 物件為文字
 * @param file - File 物件
 * @returns 文字內容
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('讀取檔案失敗：結果不是文字'));
      }
    };

    reader.onerror = () => {
      reject(new Error('讀取檔案失敗'));
    };

    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * 將 ParsedCSV 轉換為物件陣列
 * @param parsed - 解析結果
 * @returns 物件陣列
 */
export function csvToObjects<T = Record<string, string>>(parsed: ParsedCSV): T[] {
  return parsed.rows.map((row) => {
    const obj: Record<string, string> = {};
    parsed.headers.forEach((header, index) => {
      obj[header] = row[index] ?? '';
    });
    return obj as T;
  });
}
