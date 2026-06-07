import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const verificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    // Role being verified — only landlords and agents go through this flow
    role: {
      type: String,
      enum: {
        values: ['landlord', 'agent'],
        message: 'Role must be either landlord or agent',
      },
      required: [true, 'Role is required'],
    },

    // Required for both landlords and agents
    governmentIdUrl: {
      type: String,
      required: [true, 'Government ID is required'],
    },

    selfieUrl: {
      type: String,
      required: [true, 'Selfie is required'],
    },

    // Required only for landlords (C of O, deed of assignment, etc.)
    proofOfOwnershipUrl: {
      type: String,
      default: null,
    },

    // Required only for agents (professional licence)
    agentLicenseUrl: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected',
      },
      default: 'pending',
    },

    // Note left by the admin — mandatory on rejection, optional on approval
    adminNote: {
      type: String,
      default: null,
      trim: true,
    },

    // Admin who reviewed this request
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt = submission time
  }
);

// One active verification request per user at a time
verificationSchema.index({ user: 1 }, { unique: true });

// When a verification is approved, update the User model accordingly
verificationSchema.post('save', async function () {
  if (this.status === 'approved') {
    await mongoose.model('User').findByIdAndUpdate(this.user, {
      isApproved: true,
      verificationBadge: true,
      verificationStatus: 'approved',
    });
  }

  if (this.status === 'rejected') {
    await mongoose.model('User').findByIdAndUpdate(this.user, {
      isApproved: false,
      verificationBadge: false,
      verificationStatus: 'rejected',
    });
  }
});

const Verification = model('Verification', verificationSchema);

export default Verification;