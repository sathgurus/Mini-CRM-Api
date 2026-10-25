const Task = require('../models/Task');
const Lead = require('../models/Lead');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { canUpdateTaskStatus } = require('../utils/permissions');

const populate = (q) =>
  q.populate('lead', 'name').populate('assignedTo', 'name email').populate('createdBy', 'name');

const withFlag = (user, t) => ({
  ...t.toObject(),
  canUpdateStatus: canUpdateTaskStatus(user, t),
});

const createTask = async (req, res, next) => {
  try {
    const { title, description, lead, assignedTo, dueDate } = req.body;

    if (lead && !(await Lead.exists({ _id: lead }))) {
      throw new ApiError(400, 'Lead does not exist');
    }
    if (assignedTo && !(await User.exists({ _id: assignedTo }))) {
      throw new ApiError(400, 'Assigned user does not exist');
    }

    const task = await Task.create({
      title,
      description,
      lead,
      assignedTo,
      dueDate,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: withFlag(req.user, await populate(Task.findById(task._id))),
    });
  } catch (error) {
    next(error);
  }
};

const listTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.mine === 'true') filter.assignedTo = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.lead) filter.lead = req.query.lead;

    const tasks = await populate(Task.find(filter).sort('dueDate'));
    res.json({ success: true, data: tasks.map((t) => withFlag(req.user, t)) });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw new ApiError(404, 'Task not found');

    
    if (!canUpdateTaskStatus(req.user, task)) {
      throw new ApiError(403, "Only the assigned user can update this task's status");
    }
    if (!Task.STATUSES.includes(req.body.status)) {
      throw new ApiError(400, 'Invalid status');
    }

    task.status = req.body.status;
    await task.save();

    res.json({
      success: true,
      data: withFlag(req.user, await populate(Task.findById(task._id))),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask, listTasks, updateTaskStatus,
};