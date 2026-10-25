const router = require('express').Router();
const { protect } = require('../middleware/auth');
const auth = require('../controllers/auth.controller');
const users = require('../controllers/user.controller');
const leads = require('../controllers/lead.controller');
const companies = require('../controllers/company.controller');
const tasks = require('../controllers/task.controller');
const dashboard = require('../controllers/dashboard.controller');


router.post('/auth/login', auth.login);


router.use(protect);

router.get('/users', users.listUsers);
router.get('/dashboard/stats', dashboard.getDashboard);

router.route('/leads').get(leads.listLeads);
router.route('/leads').post(leads.createLead);
router.route('/leads/:id').get(leads.getLead);
router.route('/leads/:id').put(leads.updateLead);
router.route('/leads/:id').delete(leads.deleteLead);
router.patch('/leads/:id/status', leads.updateLeadStatus);

router.route('/companies').get(companies.listCompanies);
router.route('/companies').post(companies.createCompany);
router.get('/companies/:id', companies.getCompany);

router.route('/tasks').get(tasks.listTasks);
router.route('/tasks').post(tasks.createTask);
router.patch('/tasks/:id/status', tasks.updateTaskStatus);

module.exports = router;
