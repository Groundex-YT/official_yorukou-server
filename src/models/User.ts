import mongoose, { mongo } from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        username: {
            required: true,
            type: String
        },
        email: {
            unique: true,
            required: true,
            type: String
        },
        password: {
            required: true,
            type: String
        },
        avatar: {
            type: String,
            default: ''
        },
        role: {
            enum: ['admin', 'user', 'editor'],
            default: 'user',
            type: String
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('User', UserSchema);
