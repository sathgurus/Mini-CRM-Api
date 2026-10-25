require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Company = require('./models/Company');
const Lead = require('./models/Lead');
const Task = require('./models/Task');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Company.deleteMany(), Lead.deleteMany().setOptions({ withDeleted: true }), Task.deleteMany()]);

  const admin = await User.create({ name: 'Admin', email: 'admin@crm.com', password: 'Admin@123', role: 'admin' });
  const john = await User.create({ name: 'John', email: 'john@crm.com', password: 'User@123' });
  const priya = await User.create({ name: 'Priya', email: 'priya@crm.com', password: 'User@123' });

  const abc = await Company.create({ name: 'ABC Corp', industry: 'IT', location: 'Chennai', createdBy: admin._id });
  const xyz = await Company.create({ name: 'XYZ Traders', industry: 'Retail', location: 'Mumbai', createdBy: admin._id });

  const leadNames = [
    'Ravi', 'Anita', 'Kiran', 'Meera', 'Arun',
    'Priya', 'Vijay', 'Divya', 'Karthik', 'Sneha',
    'Suresh', 'Kavya', 'Manoj', 'Nithya', 'Hari',
    'Deepa', 'Ajay', 'Ramya', 'Surya', 'Pooja'
  ];

  const leadStatuses = ['New', 'Qualified', 'Contacted', 'Lost'];

  const leadsData = Array.from({ length: 100 }, (_, i) => {
    const index = i + 1;

    const lead = {
      name: `${leadNames[i % leadNames.length]} ${index}`,
      email: `lead${index}@mail.com`,
      phone: String(9000000000 + index),
      status: leadStatuses[i % leadStatuses.length],
      assignedTo: index % 2 === 0 ? john._id : priya._id,
      company: index % 2 === 0 ? abc._id : xyz._id,
      createdBy: admin._id,
    };

    // Include some leads with optional fields missing or marked deleted.
    if (index % 10 === 0) {
      delete lead.phone;
    }

    if (index === 100) {
      lead.isDeleted = true;
      lead.deletedAt = new Date();
    }

    return lead;
  });

  const leads = await Lead.create(leadsData);



  const today = new Date();
  await Task.create([
    { title: 'Call', lead: leads[0]._id, assignedTo: john._id, createdBy: admin._id, dueDate: today, status: 'Pending' },
    { title: 'Send proposal', lead: leads[1]._id, assignedTo: priya._id, createdBy: admin._id, dueDate: new Date(Date.now() + 864e5 * 2) },
    { title: 'Follow-up email', lead: leads[2]._id, assignedTo: john._id, createdBy: john._id, dueDate: new Date(Date.now() - 864e5), status: 'Completed' },
  ]);

  console.log('Seeded. Logins: admin@crm.com / Admin@123, john@crm.com / User@123, priya@crm.com / User@123');
  await mongoose.disconnect();
})();
