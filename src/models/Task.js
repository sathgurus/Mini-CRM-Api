const mongoose = require('mongoose');

const STATUSES = ['Pending', 'In Progress', 'Completed'];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: [true, 'Lead is required'] },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Assignee is required'], index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    status: { type: String, enum: { values: STATUSES, message: 'Invalid status' }, default: 'Pending' },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
Task.STATUSES = STATUSES;
module.exports = Task;
