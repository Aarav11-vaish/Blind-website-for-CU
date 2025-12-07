import { User } from "../models/userschema.js";

export const getProfile = async (req, res) => {
  const { user_id } = req.params;

  const user = await User.findOne({ user_id });
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ user });
};

export const updateProfile = async (req, res) => {
  const { user_id } = req.params;
  const { user_name, graduation_year } = req.body;

  const user = await User.findOne({ user_id });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user_name) user.user_name = user_name;
  if (graduation_year) user.graduation_year = graduation_year;

  await user.save();

  res.json({ message: "Profile updated", user });
};
