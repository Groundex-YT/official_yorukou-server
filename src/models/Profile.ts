import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema(
    {
        userId: {
            unique: true,
            required: true,
            type: String
        },
        owner: {
            required: true,
            ref: 'User',
            type: mongoose.Schema.Types.ObjectId
        },
        avatar: {
            type: String,
            default: ''
        },
        username: {
            unique: true,
            required: true,
            type: String
        },
        bg: {
            type: String,
            default: ''
        },
        isAdult: {
            required: true,
            type: Boolean
        },
        accessToken: {
            required: true,
            type: String
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Profile', ProfileSchema);
