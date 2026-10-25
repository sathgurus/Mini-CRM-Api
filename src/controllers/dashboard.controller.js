const Lead = require('../models/Lead');
const Task = require('../models/Task');


const getDashboard = async (req, res, next) => {
  try {
    const from = req.query.from
      ? new Date(req.query.from)
      : new Date(new Date().setHours(0, 0, 0, 0));
    const to = req.query.to
      ? new Date(req.query.to)
      : new Date(new Date().setHours(23, 59, 59, 999));

    const [leadAgg, taskAgg] = await Promise.all([

      Lead.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            qualified: { $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] } },
          },
        },
      ]),
      Task.aggregate([
        {
          $group: {
            _id: null,
            completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
            dueToday: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$dueDate', from] },
                      { $lte: ['$dueDate', to] },
                      { $ne: ['$status', 'Completed'] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalLeads: leadAgg[0]?.total || 0,
        qualifiedLeads: leadAgg[0]?.qualified || 0,
        tasksDueToday: taskAgg[0]?.dueToday || 0,
        completedTasks: taskAgg[0]?.completed || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };