# 🗨️ HOD Communication System - Real-Time Chat

## ✅ Backend Complete!

### What's Been Created:

**1. Message Model** (`server/models/Message.ts`)
- Text messages
- File attachments (PDF, DOC, XLS, images)
- NAAC report sharing
- Read receipts
- Timestamps

**2. Message Routes** (`server/routes/messages.ts`)
- `GET /api/messages` - Get all messages
- `POST /api/messages` - Send text message
- `POST /api/messages/upload` - Upload file
- `POST /api/messages/share-naac-report` - Share NAAC report
- `PUT /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

**3. Features:**
- ✅ Real-time messaging (Socket.IO ready)
- ✅ File upload (10MB limit)
- ✅ NAAC report sharing
- ✅ Read receipts
- ✅ Message deletion
- ✅ File types: PDF, DOC, DOCX, XLS, XLSX, images, ZIP

---

## 📋 Message Types

### 1. Text Message
```json
{
  "messageType": "text",
  "content": "Hello everyone!",
  "sender": "user_id",
  "senderName": "Dr. John",
  "senderRole": "hod"
}
```

### 2. File Message
```json
{
  "messageType": "file",
  "content": "Shared a file: report.pdf",
  "fileUrl": "/uploads/messages/123-report.pdf",
  "fileName": "report.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf"
}
```

### 3. Image Message
```json
{
  "messageType": "image",
  "content": "Shared an image",
  "fileUrl": "/uploads/messages/123-photo.jpg",
  "fileName": "photo.jpg"
}
```

### 4. NAAC Report Share
```json
{
  "messageType": "naac-report",
  "content": "Check out this NAAC report",
  "naacReportId": "report_id"
}
```

---

## 🚀 Frontend Component Needed

### HODCommunication.tsx

**Features to Build:**
1. **Chat Interface**
   - Message list (scrollable)
   - Message input box
   - Send button
   - File upload button
   - NAAC report share button

2. **Message Display**
   - Text messages
   - File attachments with download
   - Images with preview
   - NAAC report cards
   - Sender name and timestamp
   - Read receipts

3. **Real-Time Updates**
   - Socket.IO connection
   - Listen for 'new-message' event
   - Auto-scroll to bottom
   - Typing indicators (optional)

4. **File Upload**
   - Drag & drop support
   - File type validation
   - Progress indicator
   - Preview before send

5. **NAAC Report Sharing**
   - Button to share from list
   - Report preview in chat
   - Click to view full report

---

## 🔌 Socket.IO Integration

### Server Side (Already Set Up):
```typescript
// In routes/messages.ts
const io = (req.app as any).get('io');
if (io) {
  io.emit('new-message', populatedMessage);
  io.emit('message-deleted', messageId);
}
```

### Client Side (To Implement):
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Listen for new messages
socket.on('new-message', (message) => {
  setMessages(prev => [...prev, message]);
});

// Listen for deleted messages
socket.on('message-deleted', (messageId) => {
  setMessages(prev => prev.filter(m => m._id !== messageId));
});
```

---

## 📱 UI Layout

```
┌─────────────────────────────────────────────────────┐
│ HOD Communication                    [Share NAAC]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─ Dr. John (HOD) ─ 10:30 AM ──────────────────┐  │
│ │ Hello everyone! Let's discuss the NAAC       │  │
│ │ report submissions.                           │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│           ┌─ Dr. Smith (HOD) ─ 10:32 AM ──────┐    │
│           │ Sure! I've completed my report.   │    │
│           └───────────────────────────────────┘    │
│                                                     │
│ ┌─ Dr. John (HOD) ─ 10:33 AM ──────────────────┐  │
│ │ 📄 report.pdf (2.5 MB)                       │  │
│ │ [Download]                                    │  │
│ └───────────────────────────────────────────────┘  │
│                                                     │
│           ┌─ Dr. Smith (HOD) ─ 10:35 AM ──────┐    │
│           │ 📊 NAAC Report - 2023-24          │    │
│           │ Status: Approved                   │    │
│           │ [View Report]                      │    │
│           └───────────────────────────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [📎] Type a message...              [Send] [📄]   │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Component Structure

### 1. Main Component
```tsx
<HODCommunication>
  <ChatHeader />
  <MessageList>
    {messages.map(msg => (
      <MessageBubble message={msg} />
    ))}
  </MessageList>
  <MessageInput 
    onSend={handleSend}
    onFileUpload={handleFileUpload}
    onShareNAAC={handleShareNAAC}
  />
</HODCommunication>
```

### 2. Message Bubble Types
```tsx
// Text Message
<div className="message-bubble">
  <div className="sender-name">Dr. John</div>
  <div className="content">{message.content}</div>
  <div className="timestamp">10:30 AM</div>
</div>

// File Message
<div className="message-bubble file">
  <FileIcon type={message.fileType} />
  <div className="file-info">
    <div className="file-name">{message.fileName}</div>
    <div className="file-size">{formatSize(message.fileSize)}</div>
  </div>
  <Button onClick={() => download(message.fileUrl)}>
    Download
  </Button>
</div>

// NAAC Report Message
<div className="message-bubble naac-report">
  <div className="report-card">
    <div className="report-title">
      NAAC Report - {report.academicYear}
    </div>
    <div className="report-status">
      Status: {report.status}
    </div>
    <Button onClick={() => viewReport(report._id)}>
      View Report
    </Button>
  </div>
</div>
```

---

## 🔧 API Usage Examples

### Send Text Message
```typescript
const sendMessage = async (content: string) => {
  const response = await apiRequest('POST', '/api/messages', {
    content,
    messageType: 'text'
  });
  return response.json();
};
```

### Upload File
```typescript
const uploadFile = async (file: File, content?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (content) formData.append('content', content);
  
  const response = await fetch('/api/messages/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  return response.json();
};
```

### Share NAAC Report
```typescript
const shareNAACReport = async (reportId: string, content?: string) => {
  const response = await apiRequest('POST', '/api/messages/share-naac-report', {
    naacReportId: reportId,
    content: content || 'Shared a NAAC Report'
  });
  return response.json();
};
```

### Get Messages
```typescript
const getMessages = async () => {
  const response = await apiRequest('GET', '/api/messages?limit=100');
  return response.json();
};
```

---

## 🎯 Features to Implement

### Phase 1: Basic Chat ✅
- [x] Backend API
- [x] Message model
- [x] Routes
- [ ] Frontend component
- [ ] Socket.IO integration

### Phase 2: File Sharing
- [ ] File upload UI
- [ ] Drag & drop
- [ ] File preview
- [ ] Download functionality
- [ ] Image preview

### Phase 3: NAAC Report Sharing
- [ ] Share button in NAAC list
- [ ] Report card in chat
- [ ] View report from chat
- [ ] Report status updates

### Phase 4: Advanced Features
- [ ] Read receipts display
- [ ] Typing indicators
- [ ] Message search
- [ ] File gallery view
- [ ] Emoji support
- [ ] Message reactions

---

## 💡 Usage Scenarios

### Scenario 1: Discuss NAAC Submission
```
HOD 1: "Everyone, please submit your NAAC reports by Friday"
HOD 2: "I've completed mine. Here it is:"
       [Shares NAAC Report - 2023-24]
HOD 3: "Great! I'll review it"
```

### Scenario 2: Share Documents
```
HOD 1: "Here's the template for the report"
       [Uploads: NAAC_Template.pdf]
HOD 2: "Thanks! Downloading now"
       [Downloads file]
```

### Scenario 3: Quick Updates
```
Principal: "All reports look good! Approving now"
HOD 1: "Thank you!"
HOD 2: "Appreciate the quick review"
```

---

## 🚀 Next Steps

1. **Create HODCommunication.tsx component**
2. **Add Socket.IO client setup**
3. **Implement message list and input**
4. **Add file upload functionality**
5. **Integrate NAAC report sharing**
6. **Add to HOD Dashboard navigation**
7. **Test real-time messaging**
8. **Add read receipts**
9. **Polish UI/UX**

---

## 📍 Where to Add

### HOD Dashboard:
Add new tab or page for "Communication"

```tsx
// In EnhancedSidebar.tsx or navigation
{
  icon: MessageSquare,
  label: "Communication",
  href: "/hod/communication",
  badge: unreadCount > 0 ? unreadCount : undefined
}
```

### Principal Dashboard:
Same communication access for monitoring

---

## ✅ Backend is Ready!

The complete backend for HOD communication is now set up:
- ✅ Message model with all types
- ✅ API routes for CRUD operations
- ✅ File upload support
- ✅ NAAC report sharing
- ✅ Socket.IO integration ready
- ✅ Read receipts
- ✅ Message deletion

**Next:** Build the frontend chat component! 🎉
