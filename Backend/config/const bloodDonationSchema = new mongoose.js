const bloodDonationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  status: {
    type: String,
    enum: ['processing', 'available', 'assigned', 'used', 'expired', 'discarded']
  }
});