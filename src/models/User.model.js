const mongoose = require('mongoose');
const { generateHash, generateSalt } = require('../util');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  }
});

UserSchema.pre('save', async () => {
  const user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return null;
  }
  const salt = generateSalt();
  user.password = generateHash(user.password, salt);
  user.salt = salt;
  return user.save().exec();
});

// method for comparing passwords
UserSchema.methods.comparePassword = (candidatePassword) => {
  const password = generateHash(candidatePassword, this.salt);
  return password === this.password;
};

mongoose.model('User', UserSchema);
