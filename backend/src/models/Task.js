import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true, index: true },
    assignees: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    dueDate: { type: Date, default: null },
    labels: { type: [String], default: [] },
    order: { type: Number, required: true, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
