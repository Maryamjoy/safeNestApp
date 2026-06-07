import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    // The user who initiated or is linked to this transaction
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    // The deposit this transaction is tied to
    deposit: {
      type: Schema.Types.ObjectId,
      ref: 'Deposit',
      required: [true, 'Deposit reference is required'],
    },

    // deposit  → renter pays holding deposit
    // release  → deposit sent to landlord after move-in
    // refund   → deposit returned to renter (dispute resolution)
    type: {
      type: String,
      enum: {
        values: ['deposit', 'release', 'refund'],
        message: '{VALUE} is not a valid transaction type',
      },
      required: [true, 'Transaction type is required'],
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than zero'],
    },

    currency: {
      type: String,
      default: 'NGN',
      uppercase: true,
    },

    // Unique reference from the payment gateway
    reference: {
      type: String,
      required: [true, 'Payment reference is required'],
      unique: true,
      trim: true,
    },

    gateway: {
      type: String,
      enum: {
        values: ['paystack', 'flutterwave', 'internal'],
        message: '{VALUE} is not a valid gateway',
      },
      required: [true, 'Gateway is required'],
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'success', 'failed'],
        message: '{VALUE} is not a valid transaction status',
      },
      default: 'pending',
    },

    // Raw webhook payload stored for audit and dispute resolution
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },

    // Admin who authorized a release or refund (for internal transactions)
    authorizedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index on reference — prevents duplicate webhook processing
transactionSchema.index({ reference: 1 }, { unique: true });

// Index for quick lookup of all transactions per user
transactionSchema.index({ user: 1, createdAt: -1 });

const Transaction = model('Transaction', transactionSchema);

export default Transaction;