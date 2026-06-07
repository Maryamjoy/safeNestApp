import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
    },

    reviewee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewee is required'],
    },

    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a reviewer from reviewing the same person for the same property twice
reviewSchema.index({ reviewer: 1, reviewee: 1, property: 1 }, { unique: true });

// After saving a review, recalculate and update the reviewee's reputation score
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const User = mongoose.model('User');

  const result = await Review.aggregate([
    { $match: { reviewee: this.reviewee } },
    { $group: { _id: '$reviewee', avgRating: { $avg: '$rating' } } },
  ]);

  const avgRating = result.length > 0 ? parseFloat(result[0].avgRating.toFixed(1)) : 0;

  await User.findByIdAndUpdate(this.reviewee, { reputationScore: avgRating });
});

const Review = model('Review', reviewSchema);

export default Review;