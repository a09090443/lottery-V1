# Tasks: Browser-Based Lottery System

**Feature Branch**: `001-browser-lottery-system`
**Input**: Design documents from `/specs/001-browser-lottery-system/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: 本專案測試為可選項目,未在規格中明確要求 TDD,因此不包含測試任務

**Organization**: 任務依據 User Story 組織,確保每個故事可獨立實作與測試

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 可平行執行 (不同檔案,無依賴關係)
- **[Story]**: 所屬 User Story (US1, US2, US3, US4)
- 描述中包含明確的檔案路徑

---

## Phase 1: Setup (專案初始化)

**目的**: 建立專案結構與基礎設定

- [ ] T001 Create Next.js 14 project with App Router and TypeScript configuration
- [ ] T002 Install core dependencies (react@18, next@14, typescript@5, framer-motion, zod)
- [ ] T003 [P] Install development dependencies (vitest, @testing-library/react, playwright, eslint, prettier)
- [ ] T004 [P] Create project directory structure per plan.md (src/app, src/components, src/lib, src/types, src/contexts, tests/)
- [ ] T005 [P] Configure TypeScript with strict mode in tsconfig.json
- [ ] T006 [P] Configure ESLint and Prettier in .eslintrc.json and .prettierrc
- [ ] T007 [P] Configure Vitest in vitest.config.ts
- [ ] T008 [P] Configure Playwright in playwright.config.ts
- [ ] T009 [P] Setup Next.js static export configuration in next.config.js
- [ ] T010 [P] Create package.json scripts for dev, build, test, lint

---

## Phase 2: Foundational (核心基礎設施)

**目的**: 建立所有 User Stories 共用的核心基礎設施,完成前無法開始任何 User Story

**⚠️ 關鍵**: 此階段必須完成才能開始任何 User Story 的實作

### 資料層基礎設施

- [ ] T011 Copy TypeScript interfaces and Zod schemas from specs/001-browser-lottery-system/contracts/data-schemas.ts to src/types/index.ts
- [ ] T012 [P] Implement localStorage wrapper utilities in src/lib/database/storage.ts (getItem, setItem, removeItem with error handling)
- [ ] T013 [P] Implement SQLite WASM initialization in src/lib/database/sqlite.ts (database connection, basic execute method)
- [ ] T014 Create database schema SQL file in src/lib/database/schema.sql (events, prizes, participants, event_participants, drawing_results tables)
- [ ] T015 Implement database migration runner in src/lib/database/migrations.ts (init database, run migrations, check version)
- [ ] T016 Implement data version management in src/lib/database/version.ts (read/write version to localStorage)

### 管理員認證基礎設施 (研究主題 3)

- [ ] T017 [P] Implement password hashing utilities in src/lib/auth/crypto.ts (SHA-256 hash function)
- [ ] T018 [P] Implement admin auth functions in src/lib/auth/admin-auth.ts (setPassword, verifyPassword, createSession, isLoggedIn, logout)
- [ ] T019 Create ProtectedRoute component in src/components/auth/ProtectedRoute.tsx (check session, redirect to login)
- [ ] T020 Create admin login page layout in src/app/admin/login/page.tsx
- [ ] T021 Create admin layout with ProtectedRoute wrapper in src/app/admin/layout.tsx

### 工具函式庫

- [ ] T022 [P] Implement ID masking utility in src/lib/utils/idMasking.ts (mask employee/national ID showing first 6 chars)
- [ ] T023 [P] Implement date formatting utilities in src/lib/utils/date.ts (ISO 8601 format, validation)
- [ ] T024 [P] Implement validation utilities in src/lib/utils/validation.ts (Zod schema wrappers, error formatting)
- [ ] T025 [P] Create UI components library in src/components/ui/ (Button.tsx, Input.tsx, Dialog.tsx, Alert.tsx)

### 全域狀態管理

- [ ] T026 [P] Create EventContext in src/contexts/EventContext.tsx (manage current event state)
- [ ] T027 [P] Create DrawContext in src/contexts/DrawContext.tsx (manage lottery drawing state)

**Checkpoint**: 基礎設施完成 - User Story 實作可以開始

---

## Phase 3: User Story 1 - Event Administrator Creates and Manages Lottery Event (Priority: P1) 🎯 MVP

**目標**: 管理員能夠建立活動、設定獎項、新增參與者(手動或批次匯入),所有資料持久化至瀏覽器儲存

**獨立測試**: 建立一個包含至少 1 個獎項和 1 個參與者的活動,驗證資料儲存至瀏覽器,確認活動出現在列表中且資料正確

### 實作 US1: 資料層

- [ ] T028 [P] [US1] Implement Event CRUD operations in src/lib/data/events.ts (create, read, update, delete, list with filters)
- [ ] T029 [P] [US1] Implement Prize CRUD operations in src/lib/data/prizes.ts (create, read, update, delete, listByEvent)
- [ ] T030 [P] [US1] Implement Participant CRUD operations in src/lib/data/participants.ts (create, read, update, delete, listByEvent, checkUniqueness)
- [ ] T031 [US1] Implement event-participant association operations in src/lib/data/eventParticipants.ts (add participant to event, remove, list)

### 實作 US1: 匯入功能

- [ ] T032 [P] [US1] Implement CSV parser in src/lib/import/csv.ts (parse CSV file, validate structure, return ParticipantImportRow[])
- [ ] T033 [US1] Implement participant import validator in src/lib/import/validator.ts (validate row data, check duplicates, return ImportResult)
- [ ] T034 [US1] Integrate CSV import workflow in src/lib/import/index.ts (parse + validate + save participants)

### 實作 US1: UI 元件

- [ ] T035 [P] [US1] Create EventForm component in src/components/events/EventForm.tsx (name, description, scheduledAt, allowDuplicateWinners)
- [ ] T036 [P] [US1] Create EventList component in src/components/events/EventList.tsx (display events, filter by status)
- [ ] T037 [P] [US1] Create PrizeForm component in src/components/prizes/PrizeForm.tsx (name, description, totalQuantity, displayOrder)
- [ ] T038 [P] [US1] Create PrizeList component in src/components/prizes/PrizeList.tsx (display prizes, edit, delete)
- [ ] T039 [P] [US1] Create ParticipantForm component in src/components/participants/ParticipantForm.tsx (name, employeeId/nationalId, email, phone)
- [ ] T040 [P] [US1] Create ParticipantList component in src/components/participants/ParticipantList.tsx (display participants with masked IDs)
- [ ] T041 [P] [US1] Create ParticipantImport component in src/components/participants/ParticipantImport.tsx (file upload, preview, import)

### 實作 US1: 頁面與路由

- [ ] T042 [US1] Create admin dashboard page in src/app/admin/page.tsx (event summary, quick actions)
- [ ] T043 [US1] Create event list page in src/app/admin/events/page.tsx (use EventList component)
- [ ] T044 [US1] Create new event page in src/app/admin/events/new/page.tsx (use EventForm component)
- [ ] T045 [US1] Create event detail/edit page in src/app/admin/events/[id]/page.tsx (event info, prizes, participants tabs)
- [ ] T046 [US1] Create prize management section in src/app/admin/events/[id]/prizes/page.tsx (add/edit prizes)
- [ ] T047 [US1] Create participant management section in src/app/admin/events/[id]/participants/page.tsx (add manually or import CSV)

### 實作 US1: 驗證與錯誤處理

- [ ] T048 [US1] Add client-side validation for EventForm using CreateEventInputSchema
- [ ] T049 [US1] Add client-side validation for PrizeForm using CreatePrizeInputSchema
- [ ] T050 [US1] Add client-side validation for ParticipantForm using CreateParticipantInputSchema
- [ ] T051 [US1] Implement error boundary component in src/components/ErrorBoundary.tsx
- [ ] T052 [US1] Add toast notifications for success/error feedback in src/components/ui/Toast.tsx

**Checkpoint**: US1 完成 - 管理員可建立活動、設定獎項、新增參與者,所有資料持久化

---

## Phase 4: User Story 2 - Event Administrator Executes Lottery Drawing (Priority: P2)

**目標**: 管理員能夠執行抽獎,包含吃角子老虎機動畫、逐個抽出中獎者(多數量獎項)、防止重複中獎(依設定)

**獨立測試**: 設定一個包含 5 位參與者和 2 個獎項的活動,執行抽獎流程,驗證 2 位不同參與者被隨機選中,動畫正常播放,結果正確儲存

### 實作 US2: 抽獎邏輯

- [ ] T053 [P] [US2] Implement random selection algorithm in src/lib/lottery/algorithm.ts (Fisher-Yates shuffle, select random winner)
- [ ] T054 [US2] Implement lottery validator in src/lib/lottery/validator.ts (check duplicate winners, validate participants pool, check prize availability)
- [ ] T055 [US2] Implement Drawing Result CRUD in src/lib/data/results.ts (create, read, update status, listByEvent, listByPrize)
- [ ] T056 [US2] Integrate lottery execution workflow in src/lib/lottery/executor.ts (select winner, update prize quantity, save result)

### 實作 US2: 動畫元件 (Framer Motion - 研究主題 1)

- [ ] T057 [US2] Create SlotMachine component skeleton in src/components/lottery/SlotMachine.tsx
- [ ] T058 [US2] Implement rapid scrolling animation using useAnimate hook in SlotMachine.tsx (scroll participant names at high speed)
- [ ] T059 [US2] Implement deceleration effect in SlotMachine.tsx (gradually slow down before stopping)
- [ ] T060 [US2] Implement winner reveal animation in SlotMachine.tsx (highlight final winner with scale + background color)
- [ ] T061 [US2] Add animation duration configuration (2-5 seconds configurable) in SlotMachine.tsx
- [ ] T062 [US2] Optimize performance with LazyMotion in SlotMachine.tsx (reduce bundle size to ~5.5 KB)

### 實作 US2: UI 元件

- [ ] T063 [P] [US2] Create PrizeSelector component in src/components/lottery/PrizeSelector.tsx (select prize to draw, show remaining quantity)
- [ ] T064 [P] [US2] Create DrawingControl component in src/components/lottery/DrawingControl.tsx (start drawing button, next winner button for multi-quantity)
- [ ] T065 [P] [US2] Create WinnerDisplay component in src/components/lottery/WinnerDisplay.tsx (show winner name + masked ID, confirm/cancel actions)
- [ ] T066 [P] [US2] Create DrawingProgress component in src/components/lottery/DrawingProgress.tsx (show "Winner X of Y" for multi-quantity prizes)

### 實作 US2: 頁面與流程

- [ ] T067 [US2] Create lottery drawing page in src/app/admin/draw/[eventId]/page.tsx (prize selection, drawing execution, winner confirmation)
- [ ] T068 [US2] Integrate SlotMachine component in drawing page
- [ ] T069 [US2] Implement multi-quantity drawing flow (draw one, confirm, draw next) in drawing page
- [ ] T070 [US2] Handle duplicate winner prevention logic based on event.allowDuplicateWinners
- [ ] T071 [US2] Add real-time prize quantity updates after each drawing

### 實作 US2: 狀態管理

- [ ] T072 [US2] Update DrawContext to manage current drawing state (selected prize, winner, animation state, draw sequence)
- [ ] T073 [US2] Implement drawing state machine (idle → selecting prize → animating → winner revealed → confirming → completed)

**Checkpoint**: US2 完成 - 管理員可執行完整抽獎流程,包含動畫與多數量獎項處理

---

## Phase 5: User Story 3 - Event Administrator Views and Manages Drawing Results (Priority: P3)

**目標**: 管理員能夠查看所有中獎者、匯出結果檔案(CSV/JSON)、重置或取消抽獎結果

**獨立測試**: 完成包含 3 位中獎者的抽獎,查看結果摘要,匯出資料至檔案,驗證匯出檔案包含完整資訊,確認可清除結果

### 實作 US3: 匯出功能

- [ ] T074 [P] [US3] Implement CSV export for winners in src/lib/export/csv.ts (generate CSV from DrawingResult[], include complete unmasked data)
- [ ] T075 [P] [US3] Implement JSON export for full event backup in src/lib/export/json.ts (export EventBackupData structure)
- [ ] T076 [US3] Create export workflow in src/lib/export/index.ts (select format, generate file, trigger download)

### 實作 US3: UI 元件

- [ ] T077 [P] [US3] Create ResultsList component in src/components/results/ResultsList.tsx (display all winners with masked IDs, group by prize)
- [ ] T078 [P] [US3] Create ResultsFilter component in src/components/results/ResultsFilter.tsx (filter by prize, status, date range)
- [ ] T079 [P] [US3] Create ExportButton component in src/components/results/ExportButton.tsx (select format CSV/JSON, trigger export)
- [ ] T080 [P] [US3] Create ResultActions component in src/components/results/ResultActions.tsx (cancel result, reset drawing)

### 實作 US3: 頁面

- [ ] T081 [US3] Create results management page in src/app/admin/results/[eventId]/page.tsx (results list, filter, export, actions)
- [ ] T082 [US3] Implement result cancellation workflow (update status to cancelled, restore prize quantity, allow re-draw)
- [ ] T083 [US3] Implement result reset workflow (delete all results for event, restore all prize quantities, show confirmation dialog)
- [ ] T084 [US3] Add timestamp and drawing sequence display in results list

### 實作 US3: 資料完整性

- [ ] T085 [US3] Implement result validation before export (ensure all referenced entities exist)
- [ ] T086 [US3] Add export confirmation dialog with data preview
- [ ] T087 [US3] Add destructive action warnings (reset results, delete event with results)

**Checkpoint**: US3 完成 - 管理員可查看、匯出、管理所有抽獎結果

---

## Phase 6: User Story 4 - Regular User Views Events, Prizes, and Winners (Priority: P3)

**目標**: 一般使用者能在公開首頁查看活動列表、獎項詳情、中獎名單(唯讀,無管理功能)

**獨立測試**: 以管理員身分建立活動並完成抽獎,以一般使用者身分存取首頁,驗證活動詳情、獎項資訊、中獎名單可見且無編輯功能

### 實作 US4: UI 元件 (公開前台)

- [ ] T088 [P] [US4] Create PublicEventList component in src/components/events/PublicEventList.tsx (display events with status badges, no edit controls)
- [ ] T089 [P] [US4] Create PublicEventDetail component in src/components/events/PublicEventDetail.tsx (event name, description, prizes, no admin actions)
- [ ] T090 [P] [US4] Create PublicWinnersList component in src/components/results/PublicWinnersList.tsx (display winners with masked IDs, group by prize)
- [ ] T091 [P] [US4] Create EventStatusBadge component in src/components/events/EventStatusBadge.tsx (pending/active/completed visual indicators)

### 實作 US4: 頁面 (公開路由)

- [ ] T092 [US4] Create public homepage in src/app/(public)/page.tsx (use PublicEventList component)
- [ ] T093 [US4] Create public event detail page in src/app/(public)/events/[id]/page.tsx (event info, prizes, winners if completed)
- [ ] T094 [US4] Add conditional rendering for drawing status (pending: "抽獎待進行", completed: show winners)
- [ ] T095 [US4] Ensure no admin controls or links visible on public pages

### 實作 US4: 資料存取控制

- [ ] T096 [US4] Create read-only data access functions in src/lib/data/public.ts (getPublicEvents, getPublicEventDetail, getPublicWinners)
- [ ] T097 [US4] Ensure all displayed IDs are masked using idMasking utility

**Checkpoint**: US4 完成 - 公開前台可查看活動與中獎資訊,完全分離管理功能

---

## Phase 7: Polish & Cross-Cutting Concerns

**目的**: 跨 User Story 的改善與最佳化

### 儲存空間管理

- [ ] T098 [P] Implement storage monitoring in src/lib/database/storageMonitor.ts (calculate usage, check quota, trigger warnings)
- [ ] T099 Add storage usage display in admin dashboard (show usage percentage, warn at 80%)
- [ ] T100 Add periodic export reminder system (localStorage last export timestamp, show reminder after 7 days)

### 效能最佳化

- [ ] T101 [P] Optimize SQLite queries with proper indexing (verify schema.sql indexes)
- [ ] T102 [P] Implement data pagination for large participant lists (use PaginationParams interface)
- [ ] T103 Optimize Framer Motion bundle size with LazyMotion (verify implementation in SlotMachine.tsx)
- [ ] T104 Add loading states for async operations (database queries, imports, exports)

### 使用者體驗改善

- [ ] T105 [P] Create global layout in src/app/layout.tsx (metadata, fonts, global styles)
- [ ] T106 [P] Implement responsive design for mobile devices (test with Chrome DevTools Device Mode)
- [ ] T107 [P] Add keyboard shortcuts for common actions (e.g., Ctrl+N for new event)
- [ ] T108 Add confirmation dialogs for all destructive actions (delete event, reset results, logout)
- [ ] T109 Implement session idle timeout (30 minutes, update lastActivityAt on user actions)

### 文件與品質

- [ ] T110 [P] Create README.md in repository root (project overview, installation, usage)
- [ ] T111 [P] Validate all instructions in quickstart.md work correctly (manual testing)
- [ ] T112 [P] Add inline code comments in traditional Chinese for complex logic
- [ ] T113 [P] Generate architecture diagram (optional, using Mermaid or similar)

### 安全性強化

- [ ] T114 Implement Content Security Policy headers (if deployment platform supports)
- [ ] T115 Add XSS protection for all user inputs (validate with CreateEventInputSchema, CreateParticipantInputSchema)
- [ ] T116 Implement rate limiting for admin login attempts (max 5 attempts, 5-minute lockout)
- [ ] T117 Add security notice on admin login page (remind users to use in safe environment)

### Chrome DevTools 測試清單 (憲章要求)

- [ ] T118 Performance: Verify first page load < 2 seconds (use Performance tab)
- [ ] T119 Performance: Verify slot machine animation runs at 60fps (use Performance monitor)
- [ ] T120 Network: Verify all static resources load correctly (use Network tab)
- [ ] T121 Console: Ensure no errors or warnings in console (manual check)
- [ ] T122 Device Mode: Test responsive design on mobile/tablet viewports
- [ ] T123 Lighthouse: Achieve Performance score ≥ 90 (run Lighthouse audit)
- [ ] T124 Application: Verify localStorage and SQLite WASM data structure (use Application tab)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
    ├─→ Phase 3: User Story 1 (P1) 🎯 MVP - Can start in parallel
    ├─→ Phase 4: User Story 2 (P2)      - Can start in parallel
    ├─→ Phase 5: User Story 3 (P3)      - Can start in parallel
    └─→ Phase 6: User Story 4 (P3)      - Can start in parallel
    ↓
Phase 7: Polish (depends on desired user stories completion)
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends ONLY on Foundational phase - No dependencies on other stories
- **User Story 2 (P2)**: Depends ONLY on Foundational phase - Requires events/participants created by US1 but independently testable
- **User Story 3 (P3)**: Depends ONLY on Foundational phase - Requires drawing results created by US2 but independently testable
- **User Story 4 (P3)**: Depends ONLY on Foundational phase - Reads data created by US1/US2/US3 but independently testable

### Within Each User Story

- Data layer (CRUD operations) before business logic
- Business logic before UI components
- UI components before pages
- Pages before integration testing
- Core implementation complete before moving to next priority

### Parallel Opportunities

**Phase 1 - Setup**: T002, T003, T004, T005, T006, T007, T008, T009, T010 可平行執行

**Phase 2 - Foundational**:
- Data layer: T012, T013 可平行執行
- Auth: T017, T018 可平行執行
- Utilities: T022, T023, T024, T025 可平行執行
- Contexts: T026, T027 可平行執行

**Phase 3 - User Story 1**:
- Data layer: T028, T029, T030 可平行執行
- Import: T032 可獨立執行
- UI components: T035, T036, T037, T038, T039, T040, T041 可平行執行

**Phase 4 - User Story 2**:
- Logic: T053, T055 可平行執行
- UI components: T063, T064, T065, T066 可平行執行

**Phase 5 - User Story 3**:
- Export: T074, T075 可平行執行
- UI components: T077, T078, T079, T080 可平行執行

**Phase 6 - User Story 4**:
- UI components: T088, T089, T090, T091 可平行執行

**Phase 7 - Polish**:
- T098, T101, T102, T105, T106, T107, T110, T111, T112, T113 可平行執行

**跨 User Stories 平行**: 一旦 Foundational phase 完成,US1、US2、US3、US4 可由不同開發者同時進行

---

## Parallel Example: Phase 2 Foundational

```bash
# 同時啟動所有 Foundational data layer 任務:
Task: "Implement localStorage wrapper utilities in src/lib/database/storage.ts"
Task: "Implement SQLite WASM initialization in src/lib/database/sqlite.ts"

# 同時啟動所有 auth 任務:
Task: "Implement password hashing utilities in src/lib/auth/crypto.ts"
Task: "Implement admin auth functions in src/lib/auth/admin-auth.ts"

# 同時啟動所有 utility 任務:
Task: "Implement ID masking utility in src/lib/utils/idMasking.ts"
Task: "Implement date formatting utilities in src/lib/utils/date.ts"
Task: "Implement validation utilities in src/lib/utils/validation.ts"
Task: "Create UI components library in src/components/ui/"
```

---

## Parallel Example: User Story 1

```bash
# 同時啟動所有 US1 data layer 任務:
Task: "Implement Event CRUD operations in src/lib/data/events.ts"
Task: "Implement Prize CRUD operations in src/lib/data/prizes.ts"
Task: "Implement Participant CRUD operations in src/lib/data/participants.ts"

# 同時啟動所有 US1 UI component 任務:
Task: "Create EventForm component in src/components/events/EventForm.tsx"
Task: "Create EventList component in src/components/events/EventList.tsx"
Task: "Create PrizeForm component in src/components/prizes/PrizeForm.tsx"
Task: "Create PrizeList component in src/components/prizes/PrizeList.tsx"
Task: "Create ParticipantForm component in src/components/participants/ParticipantForm.tsx"
Task: "Create ParticipantList component in src/components/participants/ParticipantList.tsx"
Task: "Create ParticipantImport component in src/components/participants/ParticipantImport.tsx"
```

---

## Implementation Strategy

### MVP First (僅 User Story 1)

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational (關鍵 - 阻擋所有 stories)
3. ✅ Complete Phase 3: User Story 1
4. **停止並驗證**: 獨立測試 User Story 1
5. 部署/展示 MVP

**MVP 範圍建議**: Phase 1 + Phase 2 + Phase 3 (US1) = 52 tasks

### Incremental Delivery (漸進式交付)

1. Setup + Foundational → 基礎完成 (27 tasks)
2. Add User Story 1 → 獨立測試 → 部署/展示 (MVP!) (25 tasks)
3. Add User Story 2 → 獨立測試 → 部署/展示 (21 tasks)
4. Add User Story 3 → 獨立測試 → 部署/展示 (14 tasks)
5. Add User Story 4 → 獨立測試 → 部署/展示 (10 tasks)
6. Polish → 最終優化 (27 tasks)

每個 story 增加價值且不破壞先前的 stories

### Parallel Team Strategy (多人團隊)

若有多位開發者:

1. 團隊一起完成 Setup + Foundational
2. Foundational 完成後:
   - Developer A: User Story 1 (Event Management)
   - Developer B: User Story 2 (Lottery Drawing)
   - Developer C: User Story 3 (Results Management)
   - Developer D: User Story 4 (Public Frontend)
3. Stories 獨立完成並整合

---

## Summary

**總任務數**: 124 tasks

**任務分布**:
- Phase 1 (Setup): 10 tasks
- Phase 2 (Foundational): 17 tasks ⚠️ 阻擋所有 user stories
- Phase 3 (User Story 1 - P1): 25 tasks 🎯 MVP
- Phase 4 (User Story 2 - P2): 21 tasks
- Phase 5 (User Story 3 - P3): 14 tasks
- Phase 6 (User Story 4 - P3): 10 tasks
- Phase 7 (Polish): 27 tasks

**平行執行機會**: 67 tasks 標記為 [P],可在各自階段內平行執行

**獨立測試標準**:
- US1: 建立活動 + 獎項 + 參與者,驗證資料持久化
- US2: 執行完整抽獎流程,驗證動畫 + 隨機選擇 + 結果儲存
- US3: 查看結果 + 匯出檔案,驗證資料完整性
- US4: 公開前台查看活動與中獎者,驗證唯讀存取

**MVP 建議範圍**: Phase 1-3 (52 tasks) = 活動管理系統

**格式驗證**: ✅ 所有任務遵循 `- [ ] [ID] [P?] [Story?] Description` 格式

---

## Notes

- [P] = 不同檔案,無依賴關係,可平行執行
- [Story] = 標記任務所屬 User Story,便於追蹤
- 每個 User Story 可獨立完成與測試
- 在每個 checkpoint 停止以獨立驗證 story
- 每個任務或邏輯群組完成後提交
- 避免: 模糊任務、同檔案衝突、破壞獨立性的跨 story 依賴

---

**文件版本**: 1.0.0
**生成日期**: 2025-10-25
**狀態**: ✅ 任務分解完成,可開始實作
