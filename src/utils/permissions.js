const id = (v) => String(v && v._id ? v._id : v);


const canModifyLead = (user, lead) =>
  user.role === 'admin' || id(lead.createdBy) === id(user._id) || (lead.assignedTo && id(lead.assignedTo) === id(user._id));


const canUpdateTaskStatus = (user, task) => id(task.assignedTo) === id(user._id);

module.exports = { canModifyLead, canUpdateTaskStatus };
