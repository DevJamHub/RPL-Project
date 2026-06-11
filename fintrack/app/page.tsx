import { redirect } from 'next/navigation';

export default function Home() {
  // Langsung arahkan halaman utama (/) ke halaman /dashboard
  redirect('/login');
}
