import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Message from '../models/Message.js';
import { isAuthenticated, hasRole } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'messages');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * @route   GET /api/messages
 * @desc    Get all messages (HOD communication)
 * @access  HOD, Principal
 */
router.get('/', isAuthenticated, hasRole(['hod', 'principal']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;
    
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('sender', 'name email role')
      .populate('naacReportId', 'academicYear reportType status');
    
    res.json(messages.reverse()); // Reverse to show oldest first
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/messages
 * @desc    Send a text message
 * @access  HOD, Principal
 */
router.post('/', isAuthenticated, hasRole(['hod', 'principal']), async (req, res) => {
  try {
    const user = req.user!;
    const { content, messageType = 'text', naacReportId } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const message = new Message({
      sender: user._id,
      senderRole: user.role,
      senderName: user.name,
      content,
      messageType,
      naacReportId: naacReportId || undefined,
    });
    
    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email role')
      .populate('naacReportId', 'academicYear reportType status');
    
    // Emit socket event (will be handled by Socket.IO)
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('new-message', populatedMessage);
    }
    
    res.status(201).json(populatedMessage);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/messages/upload
 * @desc    Send a message with file attachment
 * @access  HOD, Principal
 */
router.post('/upload', isAuthenticated, hasRole(['hod', 'principal']), upload.single('file'), async (req, res) => {
  try {
    const user = req.user!;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }
    
    const { content } = req.body;
    
    // Determine message type based on file extension
    const ext = path.extname(file.originalname).toLowerCase();
    let messageType: 'file' | 'image' = 'file';
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      messageType = 'image';
    }
    
    const message = new Message({
      sender: user._id,
      senderRole: user.role,
      senderName: user.name,
      content: content || `Shared a file: ${file.originalname}`,
      messageType,
      fileUrl: `/uploads/messages/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
    });
    
    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email role');
    
    // Emit socket event
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('new-message', populatedMessage);
    }
    
    res.status(201).json(populatedMessage);
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/messages/share-naac-report
 * @desc    Share a NAAC report in chat
 * @access  HOD, Principal
 */
router.post('/share-naac-report', isAuthenticated, hasRole(['hod', 'principal']), async (req, res) => {
  try {
    const user = req.user!;
    const { naacReportId, content } = req.body;
    
    if (!naacReportId) {
      return res.status(400).json({ message: 'NAAC Report ID is required' });
    }
    
    const message = new Message({
      sender: user._id,
      senderRole: user.role,
      senderName: user.name,
      content: content || 'Shared a NAAC Report',
      messageType: 'naac-report',
      naacReportId,
    });
    
    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email role')
      .populate('naacReportId', 'academicYear reportType status department');
    
    // Emit socket event
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('new-message', populatedMessage);
    }
    
    res.status(201).json(populatedMessage);
  } catch (error: any) {
    console.error('Error sharing NAAC report:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/messages/:id/read
 * @desc    Mark message as read
 * @access  HOD, Principal
 */
router.put('/:id/read', isAuthenticated, hasRole(['hod', 'principal']), async (req, res) => {
  try {
    const user = req.user!;
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if already read by this user
    const alreadyRead = message.readBy.some(r => r.user.toString() === user._id.toString());
    
    if (!alreadyRead) {
      message.readBy.push({
        user: user._id as any,
        readAt: new Date(),
      });
      await message.save();
    }
    
    res.json(message);
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete a message (own messages only)
 * @access  HOD, Principal
 */
router.delete('/:id', isAuthenticated, hasRole(['hod', 'principal']), async (req, res) => {
  try {
    const user = req.user!;
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only sender can delete
    if (message.sender.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }
    
    // Delete file if exists
    if (message.fileUrl) {
      const filePath = path.join(process.cwd(), message.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Message.findByIdAndDelete(req.params.id);
    
    // Emit socket event
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('message-deleted', req.params.id);
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
