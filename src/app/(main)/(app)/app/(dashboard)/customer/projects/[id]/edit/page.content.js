'use client';

import ProjectWizard from '@/components/forms/job';
import useAppSWR from '@/hooks/use-app-swr';
import { useAppState } from '@/store';

export default function PageContent({ params }) {
  const { organization: org } = useAppState();
  const { data: project, isLoading } = useAppSWR(
    org?.selected?.id ? `/orgs/${org.selected.id}/projects/${params.id}` : null
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-12 bg-gray-100 rounded animate-pulse' />
        ))}
      </div>
    );
  }

  return <ProjectWizard project={project} />;
}
