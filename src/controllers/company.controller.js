const Company = require('../models/Company');
const Lead = require('../models/Lead');
const ApiError = require('../utils/ApiError');
const { canModifyLead } = require('../utils/permissions');

const createCompany = async (req, res, next) => {
  try {
    const { name, industry, location, website } = req.body;
    const company = await Company.create({
      name,
      industry,
      location,
      website,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

const listCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort('name');
    res.json({ success: true, data: companies });
  } catch (error) {
    next(error);
  }
};

const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) throw new ApiError(404, 'Company not found');

   
    const leads = await Lead.find({ company: company._id })
      .populate('assignedTo', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      data: {
        ...company.toObject(),
        leads: leads.map((l) => ({ ...l.toObject(), canModify: canModifyLead(req.user, l) })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCompany, listCompanies, getCompany };