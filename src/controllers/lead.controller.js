const Lead = require('../models/Lead');
const User = require('../models/User');
const Company = require('../models/Company');
const ApiError = require('../utils/ApiError');
const { canModifyLead } = require('../utils/permissions');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FIELDS = ['name', 'email', 'phone', 'status', 'assignedTo', 'company'];
const withFlag = (user, lead) => ({ ...lead.toObject(), canModify: canModifyLead(user, lead) });
const populate = (q) => q.populate('assignedTo', 'name email').populate('company', 'name');


const checkRefs = async ({ assignedTo, company }) => {
  if (assignedTo && !(await User.exists({ _id: assignedTo }))) {
    throw new ApiError(400, 'Assigned user does not exist');
  }
  if (company && !(await Company.exists({ _id: company }))) {
    throw new ApiError(400, 'Company does not exist');
  }
};


const pick = (body) => {
  const data = {};
  FIELDS.forEach((f) => {
    if (body[f] === undefined) return;
    data[f] = body[f] === '' && ['assignedTo', 'company'].includes(f) ? null : body[f];
  });
  return data;
};

const createLead = async (req, res, next) => {
  try {
    const data = pick(req.body);
    await checkRefs(data);
    const lead = await Lead.create({ ...data, createdBy: req.user._id });
    res.status(201).json({
      success: true,
      data: withFlag(req.user, await populate(Lead.findById(lead._id))),
    });
  } catch (error) {
    next(error);
  }
};


const listLeads = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const { search, status } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search && search.trim()) {
      const rx = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }

    const [total, leads] = await Promise.all([
      Lead.countDocuments(filter),
      populate(Lead.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit)),
    ]);

    res.json({
      success: true,
      data: leads.map((l) => withFlag(req.user, l)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    next(error);
  }
};

const getLead = async (req, res, next) => {
  try {
    const lead = await populate(Lead.findById(req.params.id));
    if (!lead) throw new ApiError(404, 'Lead not found');
    res.json({ success: true, data: withFlag(req.user, lead) });
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new ApiError(404, 'Lead not found');
    if (!canModifyLead(req.user, lead)) {
      throw new ApiError(403, 'You can only edit leads you created or are assigned to');
    }
    const data = pick(req.body);
    await checkRefs(data);
    Object.assign(lead, data);
    await lead.save();
    res.json({
      success: true,
      data: withFlag(req.user, await populate(Lead.findById(lead._id))),
    });
  } catch (error) {
    next(error);
  }
};

const updateLeadStatus = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new ApiError(404, 'Lead not found');
    if (!canModifyLead(req.user, lead)) {
      throw new ApiError(403, 'You can only edit leads you created or are assigned to');
    }
    lead.status = req.body.status;
    await lead.save();
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};


const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new ApiError(404, 'Lead not found');
    if (!canModifyLead(req.user, lead)) {
      throw new ApiError(403, 'You can only delete leads you created or are assigned to');
    }
    lead.isDeleted = true;
    lead.deletedAt = new Date();
    lead.deletedBy = req.user._id;
    await lead.save();
    res.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  listLeads,
  getLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
};