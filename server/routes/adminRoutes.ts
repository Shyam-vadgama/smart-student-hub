import express from 'express';
import { createAdmin, forgotPassword, resetPassword } from '../controllers/adminController';

const router = express.Router();

router.post('/create', createAdmin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;
