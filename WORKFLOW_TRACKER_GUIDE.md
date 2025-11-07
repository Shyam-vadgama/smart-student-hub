# 📊 Workflow Tracker - HOD Dashboard

## ✅ What's Been Added

### New Component: WorkflowTracker.tsx

A comprehensive workflow tracking component that shows HODs the status of all their approval requests in real-time.

---

## 🎯 Features

### 1. Visual Progress Tracking
- **Progress Bar** - Shows completion percentage
- **Stage Indicators** - Visual markers for each stage
- **Status Icons** - Quick status identification
- **Color Coding** - Green (approved), Red (rejected), Blue (pending)

### 2. Workflow Stages Display
- ✅ **Completed Stages** - Green checkmark
- 🔵 **Current Stage** - Blue clock icon, highlighted
- ⚪ **Pending Stages** - Gray circle outline
- **Role Information** - Shows who needs to approve

### 3. Approval History
- **Timeline** - Chronological approval/rejection events
- **Approver Info** - Role and timestamp
- **Status** - Approved or rejected at each stage

### 4. Comments & Feedback
- **Comments Section** - View feedback from approvers
- **Rejection Reasons** - Highlighted in red if rejected
- **Guidance** - Understand what needs to be fixed

---

## 📱 UI Layout

```
┌─────────────────────────────────────────────────────┐
│ Approval Workflow Status              [3 Items]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─ Project Approval ─────────────── [Pending] ───┐ │
│ │ ✓ Submitted: Nov 7, 2024                       │ │
│ │                                                 │ │
│ │ Progress                    Stage 2 of 3       │ │
│ │ ████████████░░░░░░░░ 66%                       │ │
│ │                                                 │ │
│ │ Workflow Stages:                                │ │
│ │ ✓ HOD Review          [Completed]              │ │
│ │ ⏱ Principal Approval  [Current]                │ │
│ │ ○ Final Sign-off      [Pending]                │ │
│ │                                                 │ │
│ │ Approval History:                               │ │
│ │ ✓ HOD approved - Nov 7, 10:30 AM               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─ Achievement Approval ─────────── [Approved] ──┐ │
│ │ ✓ Submitted: Nov 6, 2024                       │ │
│ │                                                 │ │
│ │ Progress                    Stage 3 of 3       │ │
│ │ ████████████████████ 100%                      │ │
│ │                                                 │ │
│ │ ✓ All stages completed!                        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Elements

### Status Badges:
- 🟡 **Pending** - Yellow badge
- 🟢 **Approved** - Green badge
- 🔴 **Rejected** - Red badge

### Stage Indicators:
- ✅ **Completed** - Green checkmark
- 🔵 **Current** - Blue clock + highlighted background
- ⚪ **Pending** - Empty circle

### Progress Bar Colors:
- **Approved** - Green
- **Rejected** - Red
- **In Progress** - Blue

---

## 📊 Information Displayed

### For Each Workflow Request:

**Header:**
- Content type (Project, Achievement, Resume, Marks)
- Submission date
- Overall status badge

**Progress Section:**
- Visual progress bar
- Current stage number
- Total stages count
- Percentage complete

**Stages Section:**
- Stage name
- Required roles for approval
- Completion status
- Current stage highlight

**History Section:**
- Who approved/rejected
- When it happened
- Their role
- Timestamp

**Feedback:**
- General comments
- Rejection reasons (if rejected)
- Guidance for resubmission

---

## 🔄 How It Works

### Data Flow:
```
1. HOD submits content (project, achievement, etc.)
2. Approval request created with workflow
3. Goes through stages sequentially
4. Each stage requires specific role approval
5. WorkflowTracker shows real-time status
6. Updates automatically when approvals happen
```

### Stage Progression:
```
Draft → Stage 1 → Stage 2 → Stage 3 → Approved
         (HOD)     (Principal) (Admin)
```

---

## 🎯 Use Cases

### Scenario 1: Project Approval
```
HOD submits project
├─ Stage 1: HOD Review (Auto-approved)
├─ Stage 2: Principal Approval (Pending)
└─ Stage 3: Final Sign-off (Pending)

Status: Waiting for Principal
Progress: 33%
```

### Scenario 2: Achievement Verification
```
HOD submits achievement
├─ Stage 1: Department Verification ✓
├─ Stage 2: Principal Approval ✓
└─ Stage 3: Record Update ✓

Status: Approved
Progress: 100%
```

### Scenario 3: Rejected Submission
```
HOD submits marks
├─ Stage 1: HOD Review ✓
├─ Stage 2: Principal Approval ✗
└─ Rejection Reason: "Please verify student IDs"

Status: Rejected
Action: Fix and resubmit
```

---

## 📍 Where to Find

### HOD Dashboard:
```
1. Login as HOD
2. Go to HOD Dashboard
3. Scroll down to tabs section
4. Click "Workflows" tab (5th tab)
5. See all your approval requests
```

---

## 🎨 Component Props

```typescript
interface WorkflowTrackerProps {
  contentType?: 'project' | 'achievement' | 'resume' | 'marks' | 'all';
}
```

**Usage:**
```tsx
// Show all workflows
<WorkflowTracker />

// Filter by content type
<WorkflowTracker contentType="project" />
<WorkflowTracker contentType="achievement" />
```

---

## 🔧 API Integration

### Endpoint Used:
```
GET /api/approval-requests?contentType={type}
```

### Response Format:
```json
{
  "_id": "request_id",
  "contentType": "project",
  "status": "pending",
  "currentStage": 2,
  "workflow": {
    "stages": [
      {
        "stageOrder": 1,
        "stageName": "HOD Review",
        "requiredRoles": ["hod"]
      },
      {
        "stageOrder": 2,
        "stageName": "Principal Approval",
        "requiredRoles": ["principal"]
      }
    ]
  },
  "approvals": [
    {
      "approverRole": "hod",
      "status": "approved",
      "timestamp": "2024-11-07T10:30:00Z"
    }
  ],
  "comments": "Looks good!",
  "createdAt": "2024-11-07T10:00:00Z"
}
```

---

## ✅ Benefits for HODs

1. **Transparency** - See exactly where requests are
2. **Accountability** - Know who needs to act
3. **Tracking** - Monitor progress in real-time
4. **Feedback** - Understand rejections
5. **Planning** - Estimate approval timelines
6. **History** - Review past approvals

---

## 🎯 Next Steps

### Enhancements (Future):
- [ ] Real-time updates via Socket.IO
- [ ] Email notifications on status change
- [ ] Filter by status (pending/approved/rejected)
- [ ] Search functionality
- [ ] Export workflow history
- [ ] Bulk actions
- [ ] Reminder system for pending approvals

---

## 🚀 Now Live!

The Workflow Tracker is now available in the HOD Dashboard!

**Access it:**
1. HOD Dashboard → Workflows tab
2. See all approval requests
3. Track progress visually
4. View approval history
5. Read feedback and comments

Everything is working and ready to use! 🎉
