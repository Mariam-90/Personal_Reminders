const mongoose = require('mongoose');

const infoItemSchema = new mongoose.Schema(
  {
    label: { type: String, default: '', maxlength: 100 },
    value: { type: String, default: '', maxlength: 500 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    // Reminder sound: a file name from the client's /public folder, or 'custom'
    soundName: { type: String, default: 'reminder.wav' },
    audioContentType: { type: String, default: null },
    audioData: { type: Buffer, default: null },

    fullName: { type: String, default: '', maxlength: 100 },
    phone: { type: String, default: '', maxlength: 30 },
    notes: { type: String, default: '', maxlength: 2000 },
    caregiverName: { type: String, default: '', maxlength: 100 },
    caregiverPhone: { type: String, default: '', maxlength: 30 },
    infoItems: { type: [infoItemSchema], default: [] },
  },
  { timestamps: true }
);

// Never leak the password hash or the raw audio buffer to the client.
userSchema.methods.toPublic = function toPublic() {
  return {
    _id: this._id,
    username: this.username,
    soundName: this.soundName,
    hasCustomSound: Boolean(this.audioData && this.audioData.length && this.audioContentType !== 'predefined'),
    fullName: this.fullName,
    phone: this.phone,
    notes: this.notes,
    caregiverName: this.caregiverName,
    caregiverPhone: this.caregiverPhone,
    infoItems: this.infoItems,
  };
};

module.exports = mongoose.model('User', userSchema);
