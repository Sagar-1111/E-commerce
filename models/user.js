const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true},
  password: String,
  profile: {
    name: { type: String, default: ''},
    picture: { type: String, default: ''}
  },
  address: String,
  history: [{
    date: Date,
    paid: { type: Number, default: 0}
  }]
});

UserSchema.pre('save', function(next){
  const user = this;
  if(!user.isModified('password')) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if(err) return next(err);
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.comareSync(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);