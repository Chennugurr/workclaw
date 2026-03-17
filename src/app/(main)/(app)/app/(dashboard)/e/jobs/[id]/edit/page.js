import AuthGuard from '@/components/guards/auth.guard';
import PageContent from './page.content';

export default async function Page(props) {
  const params = await props.params;

  return (
    <AuthGuard>
      <PageContent {...props} params={params} />
    </AuthGuard>
  );
}
