# Feature Specification: Browser-Based Lottery System

**Feature Branch**: `001-browser-lottery-system`
**Created**: 2025-10-24
**Status**: Draft
**Input**: User description: "抽獎系統
一、系統概述
系統名稱： 單機版網頁抽獎系統 (名稱可自定義)
系統目標： 建立一個運作於瀏覽器端、無需架設傳統後端伺服器的抽獎平台，適用於活動現場、離線環境或小型抽獎活動。
目標對象： 活動管理員、參與抽獎的用戶。
系統特性： 資料完全儲存於使用者的瀏覽器環境中，具備高回應速度，但不適用於需跨裝置同步數據或高併發的大型網路活動。
二、功能需求
管理端功能
活動建立與管理
參與者管理
抽獎執行與設定
結果管理
系統設定
用戶端功能 (前台展示)
活動瀏覽
參與抽獎
中獎查詢"

## Clarifications

### Session 2025-10-24

- Q: Data persistence strategy - How should the system handle backup and data loss prevention when using browser localStorage? → A: Use localStorage with periodic export reminders and warnings before destructive actions (balanced approach: simple implementation with safety measures)
- Q: Participant unique identification - What fields should serve as the unique identifier for participants to prevent duplicates and enable winner lookup? → A: Name + employee ID or national ID number
- Q: Sensitive ID storage and display - How should employee IDs and national IDs be stored and displayed to balance functionality with privacy protection? → A: Store complete data in localStorage, but partially mask when displayed in UI (e.g., A12345****); export includes full data
- Q: Multi-quantity prize drawing flow - When a prize has multiple winners (e.g., "1st Prize x3"), how should the drawing process work? → A: Draw one winner at a time with display for each, administrator clicks "Next" to continue drawing remaining quantities
- Q: Duplicate winner rules default and configuration - What should be the default behavior for duplicate winners, and how should this be configured? → A: Default to disallow duplicate winners; provide event-level toggle setting to enable duplicate winners if needed

**Additional Constraints**:
- Event scheduled date/time cannot be set earlier than today's date (prevent creating events in the past)
- Drawing animation must include slot-machine-style rapid scrolling effect to create excitement and anticipation during the selection process

**Role and Permission Clarification**:
- **Administrator Role**: Can create events, add/manage participants, execute lottery drawings, view and export results, and access all administrative functions
- **Regular User Role**: Can only access the public homepage to view event list, prize details, and winner announcements (read-only access, no administrative capabilities)
- No individual participant login or personal winner verification feature; all users view the same public winner list

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Event Administrator Creates and Manages Lottery Event (Priority: P1)

An event administrator needs to set up a lottery event by defining the event details, configuring prizes, and adding participants. This includes naming the event, setting time frames, defining prize categories and quantities, and managing the participant list through manual entry or bulk import.

**Why this priority**: This is the foundational capability required before any lottery can take place. Without the ability to create and configure an event, no other features can function. This represents the core administrative workflow.

**Independent Test**: Can be fully tested by creating a new lottery event with at least one prize and one participant, verifying all data is saved to browser storage, and confirming the event appears in the event list with accurate details.

**Acceptance Scenarios**:

1. **Given** I am on the administrator dashboard, **When** I create a new lottery event with a name, description, and date range where the scheduled date is today or in the future, **Then** the event is saved and appears in my event list with duplicate winners disallowed by default
2. **Given** I am creating or editing an event, **When** I attempt to set the event date to a date in the past, **Then** the system displays an error message and prevents saving until a valid date is provided
3. **Given** I am creating or editing an event, **When** I toggle the "Allow Duplicate Winners" setting, **Then** the system saves this preference and applies it to all drawings within the event
4. **Given** I have created an event, **When** I add multiple prize categories with names and quantities, **Then** all prizes are associated with the event and displayed correctly
5. **Given** I have an event with prizes, **When** I add participants manually by entering their names, employee ID or national ID, and optional contact information, **Then** all participants are saved to the participant pool with uniqueness validated
6. **Given** I have prepared a participant data file, **When** I import the file using the bulk upload feature, **Then** all valid participants are added to the event and any errors are reported
7. **Given** I have configured an event, **When** I refresh or close the browser and return, **Then** all event data persists and remains accessible

---

### User Story 2 - Event Administrator Executes Lottery Drawing (Priority: P2)

During the event, an administrator needs to conduct the lottery drawing by selecting which prizes to draw, initiating the random selection process, viewing the results in real-time, and confirming winners. The system must ensure fair random selection and prevent duplicate winners unless allowed.

**Why this priority**: This is the core functionality that delivers the main value of the system - conducting the actual lottery. While P1 establishes the setup, this story enables the primary event activity.

**Independent Test**: Can be tested by setting up a simple event with 5 participants and 2 prizes, executing the drawing process with slot-machine animation, and verifying that 2 unique participants are randomly selected as winners with animated scrolling effect, gradual deceleration, final reveal, and results properly displayed and saved.

**Acceptance Scenarios**:

1. **Given** I have an active event with participants and prizes, **When** I initiate a drawing for a specific prize, **Then** the system displays a slot-machine-style animation rapidly scrolling through participant names
2. **Given** the drawing animation is playing, **When** the animation progresses, **Then** I see the scrolling gradually slow down before stopping on the final winner
3. **Given** the animation completes, **When** the final winner is revealed, **Then** the winner's information (name and masked ID) is displayed prominently with visual feedback
4. **Given** a winner has been selected, **When** I confirm the result, **Then** the winner is recorded, marked as drawn, and removed from the pool for subsequent drawings (unless duplicate winners are allowed)
5. **Given** I am drawing a prize with multiple quantities (e.g., 3 winners), **When** I complete one drawing, **Then** I can click "Next" or "Draw Next Winner" to continue drawing the remaining quantities one by one with animation for each
6. **Given** I am conducting multiple prize drawings, **When** I complete each drawing, **Then** each result is saved separately with timestamp and prize association
7. **Given** duplicate winners are not allowed (default setting), **When** a participant has already won a prize, **Then** they are automatically excluded from subsequent drawings
8. **Given** duplicate winners are enabled for an event, **When** a participant has already won a prize, **Then** they remain in the pool and can be selected again for other prizes

---

### User Story 3 - Event Administrator Views and Manages Drawing Results (Priority: P3)

After conducting lottery drawings, an administrator needs to review all drawing results, see the complete list of winners with their associated prizes, export the results for record-keeping or announcement purposes, and potentially undo or adjust results if errors occurred.

**Why this priority**: This provides essential post-drawing administrative capabilities for record-keeping, verification, and communication. While important, the core lottery function can operate without these management features.

**Independent Test**: Can be tested by completing a lottery with 3 winners, viewing the results summary, exporting the data to a file, verifying the export contains all winner information, and confirming the ability to clear or reset results if needed.

**Acceptance Scenarios**:

1. **Given** I have completed lottery drawings, **When** I access the results page, **Then** I see a complete list of all winners with their names, masked IDs (showing first 6 characters), contact information, and prizes won
2. **Given** I am viewing results, **When** I request to export the data, **Then** the system generates a downloadable file containing all winner information in a structured format
3. **Given** I need to verify drawing history, **When** I view detailed results, **Then** I can see timestamps, prize details, and the order of drawings
4. **Given** an error occurred in the drawing process, **When** I choose to reset or clear specific results, **Then** affected participants are returned to the available pool and the drawing can be re-executed

---

### User Story 4 - Regular User Views Events, Prizes, and Winners (Priority: P3)

Regular users (non-administrators) want to view lottery events on the homepage, see what prizes are available, and view the list of winners after drawings are completed. This provides transparency and allows participants to check results without requiring administrative access or individual login.

**Why this priority**: This enhances transparency and user engagement by providing read-only public access to event information. However, the core lottery administration and drawing functions can operate without this public view.

**Independent Test**: Can be tested by creating an event as administrator, conducting a drawing, then accessing the homepage as a regular user and verifying that event details, prize information, and winner announcements are visible without any edit capabilities.

**Acceptance Scenarios**:

1. **Given** I am a regular user accessing the homepage, **When** the page loads, **Then** I can see a list of all lottery events with their names and status
2. **Given** I am viewing an event on the homepage, **When** I select event details, **Then** I can see the event name, description, and available prizes but no administrative controls
3. **Given** an event has completed drawings, **When** I view the event, **Then** I can see the complete list of winners with their names and masked IDs, organized by prize
4. **Given** the drawing has not yet occurred, **When** I view the event, **Then** I see a message indicating the drawing is pending and no winners are displayed yet
5. **Given** I am a regular user, **When** I attempt to access administrative functions (create event, execute drawing), **Then** these functions are not visible or accessible on the homepage interface

---

### Edge Cases

- What happens when an administrator attempts to conduct a drawing with no participants added to the event?
- What happens when an administrator attempts to draw more winners than available participants?
- What happens if an administrator closes the browser mid-way through drawing a multi-quantity prize (e.g., 2 of 5 winners drawn)?
- How does the system handle browser storage limits when managing very large participant lists (1000+ participants)?
- What happens when an administrator accidentally closes the browser during an active drawing process?
- How does the system prevent data loss if the browser clears storage or storage quota is exceeded?
- What happens when two browser tabs/windows attempt to modify the same lottery event simultaneously?
- How does the system handle importing participant data with duplicate entries or invalid format?
- What happens when a participant tries to register with the same name + ID combination that already exists in the event?
- How does the system behave if browser storage is disabled or unavailable?
- What happens if an administrator tries to set an event date exactly at midnight (boundary case for "today")?
- How does the system handle timezone differences when validating event dates?
- What happens to existing events with past dates if the validation rule is applied retroactively?
- How does the system prevent unauthorized users from accessing administrative functions through URL manipulation or browser console?
- What happens if a regular user attempts to directly navigate to administrative URLs?
- How does the public homepage handle displaying events when no events have been created yet?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow administrators to create lottery events with customizable names and descriptions
- **FR-002**: System MUST enable administrators to add and edit multiple prize categories for each event, including prize names and quantities
- **FR-003**: System MUST support adding participants manually through a form interface with required fields: name, employee ID or national ID number, and optional contact information (phone/email)
- **FR-004**: System MUST support bulk participant import from common file formats (CSV, Excel, or JSON) with validation and error reporting
- **FR-005**: System MUST persist all event data (events, prizes, participants, results) in browser local storage
- **FR-006**: System MUST provide a random selection mechanism that ensures fair and unbiased winner selection
- **FR-007**: System MUST display selected winners after each drawing with clear visual feedback, preceded by an animated slot-machine-style scrolling effect
- **FR-007a**: System MUST show rapid scrolling through participant names/IDs during the drawing animation to create anticipation
- **FR-007b**: System MUST gradually slow down the scrolling animation before stopping on the final winner
- **FR-007c**: System MUST ensure the animation duration is engaging but not excessively long (recommended 2-5 seconds)
- **FR-008**: System MUST record and timestamp all drawing results
- **FR-009**: System MUST default to disallowing duplicate winners (same participant cannot win multiple prizes)
- **FR-009a**: System MUST provide an event-level toggle setting that allows administrators to enable duplicate winners when creating or editing an event
- **FR-009b**: System MUST clearly display the current duplicate winner setting on the event configuration page
- **FR-009c**: System MUST apply the duplicate winner rule consistently across all prize drawings within the same event
- **FR-010**: System MUST provide a results management interface showing all winners with associated prize information
- **FR-011**: System MUST enable export of lottery results in a downloadable file format (CSV or JSON)
- **FR-012**: System MUST allow administrators to reset or clear drawing results and return participants to the available pool
- **FR-013**: System MUST provide a public homepage accessible to all users showing the list of lottery events
- **FR-013a**: System MUST display event details (name, description, prizes) on the homepage without requiring authentication
- **FR-013b**: System MUST display complete winner lists with names and masked IDs for events that have completed drawings
- **FR-014**: System MUST restrict administrative functions (create event, add participants, execute drawings, export data) to administrator role only
- **FR-014a**: System MUST NOT display or provide access to administrative controls on the public homepage interface
- **FR-014b**: System MUST provide a separate administrator interface or access method for users with administrative privileges
- **FR-015**: System MUST display appropriate messages for different event states (pending drawing, drawing in progress, completed) on the public homepage
- **FR-016**: System MUST validate all participant data during import and manual entry (required fields, format validation)
- **FR-017**: System MUST provide confirmation dialogs for destructive actions (delete event, reset results)
- **FR-018**: System MUST handle browser storage errors gracefully with user-friendly error messages
- **FR-019**: System MUST support editing event details after creation (name, description, date range)
- **FR-020**: System MUST support editing and removing participants before drawing execution
- **FR-021**: System MUST work entirely offline without requiring internet connectivity after initial page load
- **FR-022**: System MUST maintain data integrity when browser is closed and reopened
- **FR-023**: System MUST provide visual distinction between active, completed, and pending events
- **FR-024**: System MUST display periodic reminders encouraging administrators to export event data for backup purposes
- **FR-025**: System MUST show clear warnings about potential data loss before executing destructive actions (clearing browser data, deleting events)
- **FR-026**: System MUST use browser localStorage as the primary data persistence mechanism
- **FR-027**: System MUST provide prominent export functionality accessible from the main dashboard to encourage regular backups
- **FR-028**: System MUST enforce uniqueness constraint on participant combination of name + (employee ID or national ID) within each event to prevent duplicate registrations
- **FR-029**: System MUST generate an internal unique identifier for each participant automatically for system reference
- **FR-030**: System MUST validate that either employee ID or national ID is provided during participant entry (at least one required)
- **FR-031**: System MUST store employee IDs and national IDs in complete form in browser localStorage for validation and lookup functionality
- **FR-032**: System MUST display employee IDs and national IDs with partial masking in all UI views (showing first 6 characters, masking remaining with asterisks, e.g., A12345****)
- **FR-033**: System MUST include complete unmasked employee IDs and national IDs in exported data files for administrative record-keeping
- **FR-034**: System MUST apply ID masking consistently across participant lists, drawing results display, and winner announcements
- **FR-035**: System MUST draw one winner at a time for prizes with multiple quantities, displaying each winner individually before proceeding to the next
- **FR-036**: System MUST provide a clear control (button/action) for administrators to trigger the next drawing iteration when multiple quantities remain for a prize
- **FR-037**: System MUST display progress information showing how many winners have been drawn and how many remain for the current prize (e.g., "Winner 2 of 3")
- **FR-038**: System MUST allow administrators to pause between individual draws within a multi-quantity prize drawing
- **FR-039**: System MUST save each individual winner immediately after confirmation, even if the full prize quantity has not been completed
- **FR-040**: System MUST validate that event scheduled date/time is not earlier than the current date when creating or editing events
- **FR-041**: System MUST display a clear error message when administrators attempt to set an event date in the past
- **FR-042**: System MUST allow editing of event dates but continue to enforce the no-past-date validation rule

### Key Entities

- **Lottery Event**: Represents a lottery activity with properties including event name, description, creation date, scheduled drawing date/time, status (draft/active/completed), allowDuplicateWinners flag (default: false), and associated prizes and participants
- **Prize**: Represents an award in the lottery with properties including prize name, description, total quantity (number of winners for this prize), remaining quantity (updates as winners are drawn), and relationship to the parent event
- **Participant**: Represents an individual eligible for the lottery with properties including system-generated unique identifier (UUID), name (required), employee ID or national ID number (at least one required), optional contact information (email/phone), and relationship to specific events. Uniqueness enforced on combination of name + (employee ID or national ID) within each event
- **Drawing Result**: Represents the outcome of a lottery drawing with properties including winner participant reference, prize reference, drawing timestamp, and relationship to the parent event
- **Winner**: Represents a participant who has won a prize, linking the participant entity to the drawing result and prize information

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create a complete lottery event (including event details, prizes, and participants) in under 5 minutes for events with up to 50 participants
- **SC-002**: The random drawing animation (including slot-machine scrolling effect) completes and displays final results within 2-5 seconds for participant pools up to 500 people, creating engaging visual feedback
- **SC-003**: System maintains full functionality offline without internet connectivity after the initial page load
- **SC-004**: All event data persists across browser sessions with 100% accuracy (no data loss on browser close/refresh)
- **SC-005**: System handles at least 1000 participants per event without performance degradation or storage errors
- **SC-006**: Bulk participant import processes files with up to 500 entries in under 10 seconds with complete validation
- **SC-007**: 95% of administrators can successfully conduct their first lottery drawing without assistance or documentation
- **SC-008**: Regular users can view event information and winner lists within 5 seconds of accessing the public homepage
- **SC-009**: Export functionality generates complete and accurate result files in under 3 seconds for events with up to 100 winners
- **SC-010**: System provides clear, actionable error messages for 100% of user errors (invalid input, storage issues, etc.)
- **SC-011**: The random selection algorithm demonstrates verifiable randomness (each participant has equal probability in statistical testing)
- **SC-012**: System operates correctly on major modern browsers (Chrome, Firefox, Safari, Edge) without browser-specific issues
- **SC-013**: Employee IDs and national IDs are masked in 100% of UI displays while maintaining full data integrity in storage and exports
- **SC-014**: System prevents 100% of attempts to create or edit events with past dates, displaying clear validation errors
- **SC-015**: Drawing animation displays smooth, visually appealing slot-machine-style scrolling effect in 100% of lottery drawings, with gradual deceleration before revealing the winner
- **SC-016**: Administrative functions are completely inaccessible from the public homepage interface, with 100% separation between admin and public views

### Assumptions

- Users will access the system through modern web browsers (released within the last 2 years) with JavaScript enabled
- Browser local storage is available and not disabled by user settings or browser policies
- Typical event size will be between 20-500 participants, with occasional larger events up to 1000 participants
- Administrators have basic computer literacy and can perform tasks like file uploads and form entry
- Participant data will be available in digital format (spreadsheet or manual entry) prior to event setup
- The system will be used for single-device, single-administrator scenarios (no concurrent multi-user editing required)
- Administrator access may be controlled through URL path, password protection, or separate entry point (specific authentication mechanism to be determined during implementation)
- Public homepage is accessible without authentication, displaying read-only event information
- Events will typically have between 1-20 different prize categories
- Drawing results will be announced through external channels (the system provides data but not communication features)
- No compliance requirements exist for lottery fairness certification or audit trails beyond basic timestamping
- Internet connectivity is available for initial page load but may not be available during event execution
- Administrators will manage data backup manually by exporting results (no automatic cloud backup)
- User interface language will be Traditional Chinese as the primary language
- The system will be used for promotional/entertainment purposes rather than regulated gambling activities
