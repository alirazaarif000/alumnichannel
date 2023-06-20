const Users = require("../models/userModel");
const verifier = require("email-verify");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authCtrl = {
  register: async (req, res) => {
    try {
      const {
        fullname,
        username,
        email,
        password,
        gender,
        cnic,
        regno,

        userType,
        // Teacher
        department,
        designation,
        qualification,

        // Alumni
        degree,
        // batch,
        passingYear,

        // Student
        // university,
        major,
        semester,
      } = req.body;

      let newUserName = username.toLowerCase().replace(/ /g, "");

      const user_name = await Users.findOne({ username: newUserName });
      if (user_name) {
        return res.status(400).json({ msg: "This username is already taken." });
      }

      const user_cnic = await Users.findOne({ cnic });
      if (user_cnic) {
        return res.status(400).json({ msg: "This CNIC is already exists." });
      }

      const user_regno = await Users.findOne({ regno });
      if (user_regno && regno !== "") {
        return res
          .status(400)
          .json({ msg: "This registeration number already exists." });
      }

      const user_email = await Users.findOne({ email });
      if (user_email) {
        return res
          .status(400)
          .json({ msg: "This email is already registered." });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters long." });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      let newUserObj = {
        fullname,
        username: newUserName,
        email,
        password: passwordHash,
        gender,
        userType: userType,
        cnic,
        regno: "",

        department: "",
        designation: "",
        qualification: "",

        degree: "",
        passingYear: "",

        major: "",
        semester: "",
      };

      if (userType === "teacher") {
        newUserObj = {
          ...newUserObj,
          department,
          designation,
          qualification,
        };
      } else if (userType === "alumni") {
        newUserObj = {
          ...newUserObj,
          degree,
          regno,
          passingYear,
        };
      } else if (userType === "student") {
        newUserObj = {
          ...newUserObj,
          regno,
          major,
          semester,
        };
      } else {
        return res.status(400).json({
          msg: "User type include only ['teacher', 'alumni', 'student']",
        });
      }

      const newUser = new Users(newUserObj);
      await newUser.save();

      // res.json({ msg: "registered" });

      res.json({
        msg: "Registered Successfully!",
      });
    } catch (err) {
      let errorMessage = "";

      if (err.errors) {
        // Iterate over the validation errors
        for (let key in err.errors) {
          if (err.errors.hasOwnProperty(key)) {
            errorMessage = err.errors[key].message;
            break; // Stop iterating after the first error
          }
        }
      } else {
        errorMessage = err.message;
      }

      return res.status(500).json({ msg: errorMessage });
    }
  },
  forgetpassword: async (req, res) => {
    try {
      const { email } = req.body;

      // Verify if the email exists in the real world
      // const verifyPromise = new Promise((resolve, reject) => {
      //   verifier.verify(email, (err, info) => {
      //     if (err || !info.success) {
      //       reject(
      //         err || new Error("Can't send mail to non-existing email address.")
      //       );
      //     } else {
      //       resolve(info);
      //     }
      //   });
      // });

      // const info = await verifyPromise;
      // if (!info.success) {
      //   return res
      //     .status(404)
      //     .json({ msg: "Can't send mail to non-existing email address." });
      // }

      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: "Email not found." });
      }

      const newPassword = generateRandomPassword(8);
      const passwordHash = await bcrypt.hash(newPassword, 12);
      user.password = passwordHash;
      await user.save();

      const data = {
        from: `Mailgun Sandbox <postmaster@${process.env.SANDBOX_EMAIL_ADDRESS}>`,
        to: email,
        subject: "Password Reset",
        text: `Your new password is: ${newPassword}`,
      };

      await mg.messages.create(`${process.env.SANDBOX_EMAIL_ADDRESS}`, data);
      res.json({ msg: "Password reset email sent successfully." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Internal server error." });
    }
  },
  changePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;

      const user = await Users.findOne({ _id: req.user._id });

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Your password is wrong." });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters long." });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      await Users.findOneAndUpdate(
        { _id: req.user._id },
        { password: newPasswordHash }
      );

      res.json({ msg: "Password updated successfully." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  registerAdmin: async (req, res) => {
    try {
      const { fullname, username, email, password, gender } = req.body;

      let newUserName = username.toLowerCase().replace(/ /g, "");

      const user_name = await Users.findOne({ username: newUserName });
      if (user_name) {
        return res.status(400).json({ msg: "This username is already taken." });
      }

      const user_email = await Users.findOne({ email });
      if (user_email) {
        return res
          .status(400)
          .json({ msg: "This email is already registered." });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters long." });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = new Users({
        fullname,
        username: newUserName,
        email,
        password: passwordHash,
        gender,
        role: "admin",
        userType: "admin",
      });

      await newUser.save();

      res.json({ msg: "Admin Registered Successfully." });
    } catch (err) {
      let errorMessage = "";

      if (err.errors) {
        // Iterate over the validation errors
        for (let key in err.errors) {
          if (err.errors.hasOwnProperty(key)) {
            errorMessage = err.errors[key].message;
            break; // Stop iterating after the first error
          }
        }
      } else {
        errorMessage = err.message;
      }

      return res.status(500).json({ msg: errorMessage });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email, role: "user" }).populate(
        "followers following",
        "-password"
      );

      if (!user) {
        return res.status(400).json({ msg: "Email or Password is incorrect." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Email or Password is incorrect." });
      }

      if (user.status !== "verified") {
        return res.status(400).json({
          msg: "Please Contact Admin, Your Account is Unverified or Disabled.",
        });
      }

      const access_token = createAccessToken({ id: user._id });
      // console.log(access_token)
      const refresh_token = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, //validity of 30 days
      });

      res.json({
        msg: "Logged in  Successfully!",
        access_token,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  adminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email, role: "admin" });

      if (!user) {
        return res.status(400).json({ msg: "Email or Password is incorrect." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Email or Password is incorrect." });
      }

      if (user.status !== "verified") {
        return res.status(400).json({
          msg: "Please Contact Admin, Your Account is Unverified or Disabled.",
        });
      }

      const access_token = createAccessToken({ id: user._id });
      const refresh_token = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, //validity of 30 days
      });

      res.json({
        msg: "Logged in  Successfully!",
        access_token,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
      return res.json({ msg: "Logged out Successfully." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  generateAccessToken: async (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;

      if (!rf_token) {
        return res.status(400).json({ msg: "Please login again." });
      }
      jwt.verify(
        rf_token,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) {
            res.status(400).json({ msg: "Please login again." });
          }

          const user = await Users.findById(result.id)
            .select("-password")
            .populate("followers following", "-password");

          if (!user) {
            return res.status(400).json({ msg: "User does not exist." });
          }

          const access_token = createAccessToken({ id: result.id });
          res.json({ access_token, user });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

function generateRandomPassword(length) {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let newPassword = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    newPassword += chars[randomIndex];
  }

  return newPassword;
}

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = authCtrl;
