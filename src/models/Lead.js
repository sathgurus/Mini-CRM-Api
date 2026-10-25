const mongoose = require('mongoose');

const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String, required: [true, 'Email is required'], lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
    },
    phone: { type: String, trim: true, default: '' },
    status: { type: String, enum: { values: STATUSES, message: 'Invalid status' }, default: 'New' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);


leadSchema.pre(/^(find|count)/, function (next) {
  if (!this.getOptions().withDeleted) this.where({ isDeleted: { $ne: true } });
  next();
});

leadSchema.pre('aggregate', function (next) {
  if (!this.options.withDeleted) this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Lead = mongoose.model('Lead', leadSchema);
Lead.STATUSES = STATUSES;
module.exports = Lead;
