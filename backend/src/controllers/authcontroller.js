import { OTP } from "../models/otpSchema.js";
import { User } from "../models/userschema.js";
import generateOTP from "../services/generateOTP.js";
import { sendEmail } from "../services/sendEmail.js";
import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

export const signin = async (req, res) => {
  const { email } = req.body;
  
  if (!email) 
    return res.status(400).json({ message: "Email is required" });

  if (!email.endsWith("@cuchd.in"))
    return res.status(400).json({ message: "Please use your CU college emailID" });

  if (await OTP.findOne({ email }))
    return res.status(400).json({ message: "OTP already sent" });

  const otp = generateOTP();

  await sendEmail(email, otp);
  await OTP.create({ email, otp });

  res.json({ message: "OTP is sent to ", email});
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, enteredOtp } = req.body;

    const otpEntry = await OTP.findOne({ email });
    if (!otpEntry) return res.status(400).json({ message: "OTP expired" });
    if (otpEntry.otp !== enteredOtp)
      return res.status(400).json({ message: "Invalid OTP" });

    
    let user = await User.findOne({ email });
    let randomName = "";
    if(!user || !user.user_name){
  randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      style: "capital",
      separator: ""
    });
  }
    if (!user) {
      user = await User.create({
        email,
        user_id: uuidv4(),
        user_name: randomName,
        isverified: true
      });
    } else {
      user.isverified = true;
      user.user_name = user.user_name||randomName;
      await user.save();
    }
    
    await OTP.deleteOne({ email });
    const token = jwt.sign(
      { email: user.email, user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "OTP verified", user, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
