import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const depositSchema = new Schema(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property reference is required'],
    },

    renter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Renter reference is required'],
    },

    landlord: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Landlord reference is required'],
    },

    amount: {
      type: Number,
      required: [true, 'Deposit amount is required'],
      min: [1, 'Amount must be greater than zero'],
    },

    currency: {
      type: String,
      default: 'NGN',
      uppercase: true,
    },

    // Lifecycle: pending → held → released | refunded | disputed
    status: {
      type: String,
      enum: {
        values: ['pending', 'held', 'released', 'refunded', 'disputed'],
        message: '{VALUE} is not a valid deposit status',
      },
      default: 'pending',
    },

    // Reference code returned by Paystack or Flutterwave after payment
    paymentReference: {
      type: String,
      default: null,
      trim: true,
    },

    paymentGateway: {
      type: String,
      enum: {
        values: ['paystack', 'flutterwave'],
        message: 'Gateway must be paystack or flutterwave',
      },
      default: 'paystack',
    },

    // Timestamps for each status change
    heldAt: {
      type: Date,
      default: null,
    },

    releasedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    disputedAt: {
      type: Date,
      default: null,
    },

    // Admin note for dispute resolution
    resolutionNote: {
      type: String,
      default: null,
      trim: true,
    },

    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One deposit per renter per property at a time
depositSchema.index({ property: 1, renter: 1 }, { unique: true });

// Auto-stamp the relevant date field when status changes
depositSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    const now = new Date();
    if (this.status === 'held' && !this.heldAt) this.heldAt = now;
    if (this.status === 'released' && !this.releasedAt) this.releasedAt = now;
    if (this.status === 'refunded' && !this.refundedAt) this.refundedAt = now;
    if (this.status === 'disputed' && !this.disputedAt) this.disputedAt = now;
  }
  next();
});

const Deposit = model('Deposit', depositSchema);

export default Deposit;