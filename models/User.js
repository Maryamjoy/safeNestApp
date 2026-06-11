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
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^(?:\+?234|0)[789][01]\d{8}$/, 'Please provide a valid phone number']
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
    //High-security standard and Anti-Fraud Tracking.
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
     //Anti-fraud verification Flags.
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['unverified','pending', 'verified', 'failed'],
        default: 'unverified'
    },
    verificationType: {
        type: String,
        enum: ['NIN', 'BVN', 'DriversLicense', 'Passport', 'None'],
        default: 'None'
    },
    idNumber: {
        type: String,
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    },

    //Agent-specific performance tracking metric initialized at signup.
    agentMetrics: {
        performanceScore: {
            type: Number,
            default: 100,
            min: 0,
            max: 100
        },
        reputationRanking: {
            type: String,
            enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
            default: 'Bronze'
        }
        
    },
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'under-review'],
        default: 'active'
    }
}, {
    timestamps: true

});


//ANTI-FRAUD SECURITY MEASURE: Hashes the password before saving to the database
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();//only hash if password is new or modified

    // 12 rounds of salting for strong security.
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//INSTANCE METHODS (Prototype Functions)
//Verification instance methods to compare password hashes during login/updates.

UserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    //bcryptjs compares the clear-text input password with the DB hashed safely.
    return await bcrypt.compare(candidatePassword, userPassword); //returns true if passwords match, false otherwise
    next();
};

//Instance method to check if user is verified for listing properties.
UserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    //bcryptjs compares the clear-text input password with the DB hashed safely.
    return await bcrypt.compare(candidatePassword, userPassword);
};




module.exports = mongoose.model('User', UserSchema);