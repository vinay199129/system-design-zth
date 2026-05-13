import Link from 'next/link';
import { redirect } from 'next/navigation';
import { studySections } from '@/lib/content';

export const metadata = {
  title: 'Study',
};

export default function StudyIndex() {
  // Land on the first guide by default
  const first = studySections[0];
  if (first) {
    redirect(`/study/${first.slug}`);
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Study</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        No study content found.{' '}
        <Link href="/" className="underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}

