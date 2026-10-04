import { useEffect, useState } from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';
import { EmptyState, LoadingSpinner } from '../components/Common';
import { getProjects, createProject } from '../api/projects';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => getProjects().then(setProjects);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data) => {
    const project = await createProject(data);
    setProjects((p) => [{ ...project, taskCount: 0 }, ...p]);
  };

  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-ink">Hi {firstName},</h1>
            <p className="mt-1 text-sm text-ink-soft">Here's what your teams are working on.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-brand-500 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <Plus size={16} />
            New project
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={24} />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="No projects yet"
            hint="Create your first project to start a board."
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="mt-1 rounded-md bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Create a project
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />
    </div>
  );
}
