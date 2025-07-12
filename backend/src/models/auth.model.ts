import mongoose from 'mongoose';

const { Schema } = mongoose;

const authSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['attendant', 'admin'], default: 'attendant' }
}, { timestamps: true });

const Auth = mongoose.model('Auth', authSchema);

export default Auth;
export { authSchema };