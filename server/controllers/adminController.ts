import { Request, Response } from 'express';
import Admin from '../models/Admin';
import { sendMail } from '../utils/mailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const password = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();

    try {
      await sendMail({
        to: email,
        subject: 'Your new account at SmartStudent-Hub',
        text: `Hello ${name},

Your new account has been created.
Your password is: ${password}

Please change your password after logging in.

Thank you,
The SmartStudent-Hub Team`,
        html: `<p>Hello ${name},</p>
<p>Your new account has been created.</p>
<p>Your password is: <strong>${password}</strong></p>
<p>Please change your password after logging in.</p>
<p>Thank you,<br>The SmartStudent-Hub Team</p>`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      // Decide if you want to fail the whole request if email sending fails
    }

    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    admin.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    admin.passwordResetExpires = Date.now() + 3600000; // 1 hour;

    await admin.save();

    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/reset-password/${resetToken}`;

    console.log('Password reset URL:', resetUrl);


    try {
      await sendMail({
        to: admin.email,
        subject: 'Password Reset Request',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
        html: `<p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the following link, or paste this into your browser to complete the process:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
      });

      res.status(200).json({ message: 'Email sent' });
    } catch (error) {
      admin.passwordResetToken = undefined;
      admin.passwordResetExpires = undefined;
      await admin.save();
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending email' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await Admin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    admin.password = await bcrypt.hash(password, 10);
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();

    try {
      await sendMail({
        to: admin.email,
        subject: 'Password Changed',
        text: 'Your password has been successfully changed.',
        html: '<p>Your password has been successfully changed.</p>',
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
};


