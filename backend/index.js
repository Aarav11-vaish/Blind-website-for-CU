import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { sendEmail } from './src/services/sendEmail.js';
import generateOTP from './src/services/generateOTP.js';
import { OTP } from './src/models/otpSchema.js';
import { User } from './src/models/userschema.js';
// Load environment variables from .env file
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

app.get('/', (req, res) => {
    console.log("/ route accessed");
    res.send('API is running...');
})

// signup for user
app.post('/sighnup', async (req, res) => {

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    //checker for valid mail
    if (!email.toLowerCase().endsWith('.cuchd.in')) {
        return res.status(400).json({ message: "Please use your college email" });
    }
    //generate otp ()
    const otp = generateOTP();
    //saving the otp for some time
    const newOtpEntry = new OTP({ email, otp });
    await newOtpEntry.save();
    // send otp to email
    await sendEmail(email, otp);

    res.json({ message: "OTP sent to email" });

}
)
app.post('/verify-otp', async (req, res) => {
    // picking email and otp from req body
    try{
    const { email, enteredOtp } = req.body;
    if (!enteredOtp) {
        return res.status(400).json({ message: "OTP is required" });
    }

    const otpEntry = await OTP.findOne({ email });
    if (otpEntry.otp != enteredOtp) {
        return res.status(400).json({ message: "OTP expired or invalid" });
    }
    // jwt token generation for user 

    const token = jwt.sign({ email, user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await OTP.deleteOne({ email });
    let user = await User.findOne({ email });
    if (!user) {
        user = new User({ email, user_id: generateUserId(), isverified: true });
        await user.save();
    }
    else {
        user.isverified = true;
        await user.save();
    }
    res.json({ message: "OTP verified successfully", user, token });
    }
    catch(error) {      
        console.error('Error verifying OTP:', error);   
        res.status(500).json({ message: "Internal server error" });
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
