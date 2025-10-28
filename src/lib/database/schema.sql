-- ============================================================================
-- Browser-Based Lottery System - Database Schema
-- Version: 1.0.0
-- Date: 2025-10-24
-- ============================================================================

-- ============================================================================
-- 1. EVENTS TABLE (抽獎活動)
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
  description TEXT CHECK(description IS NULL OR length(description) <= 500),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  allow_duplicate_winners INTEGER NOT NULL DEFAULT 0,
  participant_count INTEGER NOT NULL DEFAULT 0,
  prize_count INTEGER NOT NULL DEFAULT 0,
  drawn_winners_count INTEGER NOT NULL DEFAULT 0
);

-- 索引：依狀態查詢
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 索引：依預定時間排序
CREATE INDEX IF NOT EXISTS idx_events_scheduled_at ON events(scheduled_at);

-- ============================================================================
-- 2. PRIZES TABLE (獎項)
-- ============================================================================
CREATE TABLE IF NOT EXISTS prizes (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
  description TEXT CHECK(description IS NULL OR length(description) <= 300),
  total_quantity INTEGER NOT NULL CHECK(total_quantity >= 1),
  remaining_quantity INTEGER NOT NULL CHECK(remaining_quantity >= 0),
  display_order INTEGER NOT NULL DEFAULT 999,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CHECK (remaining_quantity <= total_quantity)
);

-- 索引：依活動查詢獎項
CREATE INDEX IF NOT EXISTS idx_prizes_event_id ON prizes(event_id);

-- 索引：依排序順序顯示
CREATE INDEX IF NOT EXISTS idx_prizes_display_order ON prizes(event_id, display_order);

-- ============================================================================
-- 3. PARTICIPANTS TABLE (參與者)
-- ============================================================================
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
  employee_id TEXT CHECK(employee_id IS NULL OR length(employee_id) <= 50),
  national_id TEXT CHECK(national_id IS NULL OR length(national_id) <= 50),
  email TEXT CHECK(email IS NULL OR length(email) <= 100),
  phone TEXT CHECK(phone IS NULL OR length(phone) <= 20),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- 至少需要一個身分識別欄位
  CHECK (employee_id IS NOT NULL OR national_id IS NOT NULL)
);

-- 索引：依姓名搜尋
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(name);

-- 索引：依員工編號搜尋
CREATE INDEX IF NOT EXISTS idx_participants_employee_id ON participants(employee_id) WHERE employee_id IS NOT NULL;

-- 索引：依身分證字號搜尋
CREATE INDEX IF NOT EXISTS idx_participants_national_id ON participants(national_id) WHERE national_id IS NOT NULL;

-- ============================================================================
-- 4. EVENT_PARTICIPANTS TABLE (活動參與者關聯表)
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_participants (
  event_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),

  PRIMARY KEY (event_id, participant_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- 索引：快速查詢特定活動的參與者
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);

-- 索引：快速查詢特定參與者參加的活動
CREATE INDEX IF NOT EXISTS idx_event_participants_participant_id ON event_participants(participant_id);

-- ============================================================================
-- 5. DRAWING_RESULTS TABLE (抽獎結果)
-- ============================================================================
CREATE TABLE IF NOT EXISTS drawing_results (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  prize_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  drawn_at TEXT NOT NULL DEFAULT (datetime('now')),
  draw_sequence INTEGER NOT NULL CHECK(draw_sequence >= 1),
  status TEXT NOT NULL CHECK(status IN ('confirmed', 'cancelled')) DEFAULT 'confirmed',
  notes TEXT,

  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE RESTRICT,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE RESTRICT,

  -- 同一活動、同一獎項、同一參與者不可重複中獎（除非 allowDuplicateWinners = true）
  UNIQUE(event_id, prize_id, participant_id)
);

-- 索引：快速查詢特定活動的所有結果
CREATE INDEX IF NOT EXISTS idx_drawing_results_event_id ON drawing_results(event_id);

-- 索引：快速查詢特定獎項的所有中獎者
CREATE INDEX IF NOT EXISTS idx_drawing_results_prize_id ON drawing_results(prize_id);

-- 索引：快速查詢特定參與者的中獎記錄
CREATE INDEX IF NOT EXISTS idx_drawing_results_participant_id ON drawing_results(participant_id);

-- 索引：依抽獎時間排序
CREATE INDEX IF NOT EXISTS idx_drawing_results_drawn_at ON drawing_results(drawn_at);

-- ============================================================================
-- TRIGGERS (觸發器)
-- ============================================================================

-- 觸發器：更新 events 表的 updated_at 欄位
CREATE TRIGGER IF NOT EXISTS trigger_events_updated_at
AFTER UPDATE ON events
FOR EACH ROW
BEGIN
  UPDATE events SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- 觸發器：更新 prizes 表的 updated_at 欄位
CREATE TRIGGER IF NOT EXISTS trigger_prizes_updated_at
AFTER UPDATE ON prizes
FOR EACH ROW
BEGIN
  UPDATE prizes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- 觸發器：更新 participants 表的 updated_at 欄位
CREATE TRIGGER IF NOT EXISTS trigger_participants_updated_at
AFTER UPDATE ON participants
FOR EACH ROW
BEGIN
  UPDATE participants SET updated_at = datetime('now') WHERE id = NEW.id;
END;
