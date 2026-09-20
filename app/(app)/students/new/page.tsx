import NewStudentClient from "./NewStudentClient";

export default async function NewStudentPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <NewStudentClient error={error} />;
}
