const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          // Regular expression pattern to allow only letters and limit length to 15 characters
          return /^[A-Za-z ]{1,25}$/.test(value);
        },
        message:
          "Full name must contain only letters and be at most 25 characters long.",
      },
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
      unique: true,
    },
    regno: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return /^(|\d{2}-NTU-[A-Za-z]{2}(-[A-Za-z]{2})?-\d{4})$/.test(value);
        },
        message: "Invalid Registeration Number format.",
      },
    },
    cnic: {
      type: Number,
      trim: true,
      unique: true,
      validate: {
        validator: function (value) {
          // Regular expression pattern to allow only letters and limit length to 15 characters
          return /^\d{13}$/.test(value);
        },
        message: "CNIC should be of 13 digits.",
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
    },
    role: {
      type: String,
      default: "user",
    },
    gender: {
      type: String,
      default: "male",
    },

    mobile: {
      type: String,
      default: "",
      validate: {
        validator: function (value) {
          return (
            value === null || value === "" || /^(\+923)?\d{9}$/.test(value)
          );
        },
        message: "Incorrect Mobile No or format.",
      },
    },

    address: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["verified", "unverified"],
      default: "unverified",
    },
    userType: {
      type: String,
      default: "",
    },
    // Teacher
    department: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      default: "",
    },
    qualification: {
      type: String,
      default: "",
    },

    // Alumni
    degree: {
      type: String,
      default: "",
    },
    batch: {
      type: String,
      default: "",
    },
    passingYear: {
      type: String,
      default: "",
    },

    // Student
    university: {
      type: String,
      default: "",
    },
    major: {
      type: String,
      default: "",
    },
    semester: {
      type: String,
      default: "",
    },

    saved: [
      {
        type: mongoose.Types.ObjectId,
        ref: "post",
      },
    ],
    story: {
      type: String,
      default: "",
      maxlength: 200,
    },
    website: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
    ],
    following: [
      {
        type: mongoose.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
