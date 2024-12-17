import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react'
import { Tournament } from '@/Components/Tournament';
import '../../css/app.css';

export default function Tournaments() {
  return (
    <div className='rainbow-bg'>
      <AuthenticatedLayout>
      <Head title="hehheehhe" />
      <div>
          <h1>Welcome to Tournaments!</h1>
          <Tournament />
      </div>
    </AuthenticatedLayout>
    </div>
  )
}