'use client';

import JobForm from '@/components/forms/job';
import useAppSWR from '@/hooks/use-app-swr';

export default function PageContent({ params }) {
  const { data: job, isLoading } = useAppSWR(`/jobs/${params.id}`);

  if (isLoading) return <div>Loading...</div>;

  return <JobForm job={job} />;
}
