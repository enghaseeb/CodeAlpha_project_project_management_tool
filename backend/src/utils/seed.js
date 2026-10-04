// Optional: creates two demo users and a sample project so you can try the
// app (and real-time sync) right away.   Run with:  npm run seed
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import List from '../models/List.js';
import Task from '../models/Task.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Seeding…');

  await Promise.all([User.deleteMany({}), Project.deleteMany({}), List.deleteMany({}), Task.deleteMany({})]);

  const alice = await User.create({ name: 'Alice Khan', email: 'alice@demo.com', password: 'password123' });
  const bob = await User.create({ name: 'Bob Ahmed', email: 'bob@demo.com', password: 'password123' });

  const project = await Project.create({
    name: 'Website Redesign',
    description: 'Refresh the marketing site before the Q4 launch.',
    color: '#0D7A6E',
    owner: alice._id,
    members: [
      { user: alice._id, role: 'owner' },
      { user: bob._id, role: 'member' },
    ],
  });

  const [todo, doing, done] = await List.insertMany([
    { name: 'To Do', project: project._id, order: 0 },
    { name: 'In Progress', project: project._id, order: 1 },
    { name: 'Done', project: project._id, order: 2 },
  ]);

  const base = { project: project._id, createdBy: alice._id };
  await Task.insertMany([
    { ...base, title: 'Write homepage copy', list: todo._id, order: 0, priority: 'high', assignees: [bob._id], labels: ['content'] },
    { ...base, title: 'Collect brand assets', list: todo._id, order: 1, priority: 'low' },
    { ...base, title: 'Design new navbar', list: doing._id, order: 0, priority: 'urgent', assignees: [alice._id, bob._id], labels: ['design'], dueDate: new Date(Date.now() + 3 * 86400000) },
    { ...base, title: 'Set up analytics', list: done._id, order: 0, priority: 'medium', assignees: [alice._id] },
  ]);

  console.log('Done! Log in with:');
  console.log('  alice@demo.com / password123');
  console.log('  bob@demo.com   / password123');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
