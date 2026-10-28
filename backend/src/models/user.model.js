import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';
import { ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a secure password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Prevents unintended exposure in queries
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.GUEST,
      index: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    },
    refreshTokenHash: {
      type: String,
      select: false, // Prevents session token leak
    },
    passwordChangedAt: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 1. Pre-save hook: Hash password with cost factor 12 
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// 2. Pre-save hook: Set passwordChangedAt timestamp 
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

// 3. Instance Method: Verify plain password against bcrypt hash
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 4. Instance Method: Check if password was modified after JWT was signed
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export const User = mongoose.model('User', userSchema);