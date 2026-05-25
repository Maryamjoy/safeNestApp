const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required, matching your official ID'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // hides the password from DB queries automatically.
    },
    role: {
        type: String,
        enum: ['renter', 'landlord', 'agent', 'admin'],
        default: 'renter'
    },
    //Anti-fraud verification Flags.
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationType: {
        type: String,
        enum: ['NIN', 'BVN', 'DriversLicense', 'Passport', 'None'],
        default: 'None'
    },
    idNumber: {
        type: String,
        default: null
    }
}, {
    timestamps: true

});

//ANTI-FRAUD SECURITY MEASURE: Hashes the password before saving to the database
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;//only hash if password is new or modified

    const salt = await bcrypt.genSalt(12); //12 rounds of salting for strong security
    this.password = await bcrypt.hash(this.password, salt); 
});

UserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword); //compares the provided password with the hashed password in the database
};

module.exports = mongoose.model('User', UserSchema);