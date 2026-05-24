const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    property: {
        type:mongoose.Schema.type.objectId,
        ref: 'property',
        required: true
    },
    tenant: {
        type:mongoose.Schema.type.objectId,
        ref: 'user',
        required: true
    },
    landlord: {
        type: mongoose.Schema.type.objectId,
        ref: 'user',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },

    status:{
        type: String,
        enum: ['pending', 'approved', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },

    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid'
    },
    timeStamp: true
})

module.exports = mongoose.bookingSchema("booking", bookingSchema)
