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
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
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
  if (await OTP.findOne({ email })) {
    return res.status(400).json({ message: "OTP already sent to this email" });
  }
  //generate otp ()
  const otp = generateOTP();
  //saving the otp for some time
  const newOtpEntry = new OTP({ email, otp });
  // send otp to email
  await sendEmail(email, otp);
  await newOtpEntry.save();

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
  const newUserId = uuidv4();
  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    style: 'capital',
    separator: '',
  });

  user = await User.create({
    email,
    user_id: newUserId,
    randomName,
    isverified: true
  });
} else {
   const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    style: 'capital',
    separator: '',
  });

  user.isverified = true;
  user.user_name=randomName;
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

app.get('/:user_id/profile', async (req, res) => {
  const { user_id } = req.params;
  const user = await User.findOne({ user_id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user });

});

app.put('/:user_id/profile/submit', async (req, res) => {
  const { user_id } = req.params;
  const { user_name, graduation_year } = req.body;
  // would like to let user change only user_name and graduation year
  const user = await User.findOne({ user_id });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user_name) user.user_name = user_name;
  if (graduation_year) user.graduation_year = graduation_year;
  await user.save();
  res.json({ message: "Profile updated successfully", user });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

