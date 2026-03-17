import PageContent from './page.content';

export default async function Page(props) {
  const params = await props.params;

  return (
    <>
      <PageContent {...props} params={params} />
    </>
  );
}
