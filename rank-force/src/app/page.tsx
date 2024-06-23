import { redirect } from 'next/navigation';
import { ulid } from 'ulid';

export default function Page() {
  redirect('/session/' + ulid());
}
