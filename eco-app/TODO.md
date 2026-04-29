# AI Toggle in Navbar - Implementation Plan

## Status: ✅ In Progress

### Step 1: [Completed] Create TODO.md
Created this file with implementation steps.

### Step 2: [Completed] Update ChatbotSidebar.tsx
- Added open/onClose props
- Added overlay + close button
- Synced internal state with props
- Imported Bot icon, removed floating toggle
- Added chatbot-overlay class

### Step 3: Update Navbar.js
- Add aiOpen state
- Import Bot icon and ChatbotSidebar  
- Add AI toggle button in .nb__right after profile
- Render ChatbotSidebar conditionally
- Add to mobile menu

### Step 4: Update Navbar.css  
- Add .nb__ai-toggle styles (mirror profile btn)
- Ensure proper spacing/positioning
- Style .nb__ai-indicator (optional pulse)

### Step 5: Test Implementation
```
cd Frontend
npm start
```
- Verify toggle position below profile
- Test open/close functionality
- Check mobile responsiveness  
- Ensure /api/chat works
- Fix z-index conflicts

### Step 6: [Pending] Cleanup
- Remove TODO.md
- attempt_completion


