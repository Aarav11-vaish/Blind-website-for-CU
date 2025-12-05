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
import { v4 as uuidv4 } from "uuid";
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
app.post('/signup', async (req, res) => {

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    //checker for valid mail
    if (!email.toLowerCase().endsWith('@cuchd.in')) {
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
  try {
    const { email, enteredOtp } = req.body;

    if (!email || !enteredOtp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpEntry = await OTP.findOne({ email });

    if (!otpEntry) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (otpEntry.otp !== enteredOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({ email });

    let user = await User.findOne({ email });

    if (!user) {
      // Use UUID for new users
      const newUserId = uuidv4();

      user = await User.create({
        email,
        user_id: newUserId,
        isverified: true
      });
    } else {
      user.isverified = true;
      await user.save();
    }

    // Generate JWT token AFTER user exists
    const token = jwt.sign(
      {
        email: user.email,
        user_id: user.user_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: "OTP verified successfully",
      user,
      token
    });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

