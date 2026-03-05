const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env"); 

const GOOGLE_CLIENT_ID =
  "709964897187-an6sclll2kfpfm4c3umc3bu4cnv0up4r.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Google token is required" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name,
        email: email,
        image: picture,
        role: "user",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      env.jwt.accessSecret, 
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google Auth Backend Error:", err);
    res.status(401).json({
      success: false,
      message: "Google authentication failed",
      error: err.message,
    });
  }
};

module.exports = { googleLogin };
