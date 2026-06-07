import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const reportSchema = new Schema(
  {
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required'],
    },

    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property reference is required'],
    },

    reason: {
      type: String,
      enum: {
        values: ['fake_listing', 'duplicate', 'scam', 'wrong_info', 'other'],
        message: '{VALUE} is not a valid report reason',
      },
      required: [true, 'Report reason is required'],
    },

    // Extra detail the renter provides
    details: {
      type: String,
      trim: true,
      maxlength: [1000, 'Details cannot exceed 1000 characters'],
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['open', 'reviewed', 'resolved'],
        message: '{VALUE} is not a valid report status',
      },
      default: 'open',
    },

    // Admin note after reviewing the report
    adminNote: {
      type: String,
      trim: true,
      default: null,
    },

    // Action taken by admin: suspend listing, ban user, or dismiss
    actionTaken: {
      type: String,
      enum: {
        values: ['listing_suspended', 'user_banned', 'dismissed', null],
        message: '{VALUE} is not a valid action',
      },
      default: null,
    },

    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// A renter can only report the same property once
reportSchema.index({ reportedBy: 1, property: 1 }, { unique: true });

// When a report is resolved, stamp the resolved time
reportSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

// When a report is saved or updated, increment the property's reportCount
reportSchema.post('save', async function () {
  if (this.isNew) {
    await mongoose.model('Property').findByIdAndUpdate(this.property, {
      $inc: { reportCount: 1 },
    });
  }
});

const Report = model('Report', reportSchema);

export default Report;