import mongoose from 'mongoose';
 
const { Schema, model } = mongoose;
 
// ─── Message Schema ───────────────────────────────────────────────────────────
 
const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation reference is required'],
    },
 
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
 
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
 
    isRead: {
      type: Boolean,
      default: false,
    },
 
    // Flagged by the fraud detection service (scam keywords, suspicious content)
    flagged: {
      type: Boolean,
      default: false,
    },
 
    flagReason: {
      type: String,
      default: null, // e.g. "scam_keyword: western union"
    },
  },
  {
    timestamps: true,
  }
);
 
// After a message is saved, update the parent conversation's lastMessage pointer
messageSchema.post('save', async function () {
  await mongoose.model('Conversation').findByIdAndUpdate(this.conversation, {
    lastMessage: this._id,
    updatedAt: new Date(),
  });
});

// ─── Conversation Schema ──────────────────────────────────────────────────────
 
const conversationSchema = new Schema(
  {
    // The property this conversation is about
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property reference is required'],
    },
 
    // Always exactly 2 participants: the renter and the landlord/agent
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      validate: {
        validator: (arr) => arr.length === 2,
        message: 'A conversation must have exactly 2 participants',
      },
    },
 
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
 
// Prevent duplicate conversations between the same two users for the same property
conversationSchema.index({ property: 1, participants: 1 }, { unique: true });
 
// ─── Models ───────────────────────────────────────────────────────────────────
 
export const Message = model('Message', messageSchema);
export const Conversation = model('Conversation', conversationSchema);