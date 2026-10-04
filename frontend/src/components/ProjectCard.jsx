import { Link } from 'react-router-dom';
import { AvatarStack } from './Avatar';

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      className="group relative flex flex-col justify-between rounded-card border border-paper-line bg-paper-card p-5 transition hover:border-brand-300 hover:shadow-soft"
    >
      <span
        className="absolute left-0 top-0 h-1 w-10 rounded-tl-card"
        style={{ backgroundColor: project.color }}
      />
      <div>
        <h3 className="font-display text-lg leading-snug text-ink group-hover:text-brand-700">
          {project.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">
          {project.description || 'No description yet.'}
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <AvatarStack users={project.members.map((m) => m.user)} size="xs" max={4} />
        <span className="text-xs text-ink-soft">
          {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
        </span>
      </div>
    </Link>
  );
}
