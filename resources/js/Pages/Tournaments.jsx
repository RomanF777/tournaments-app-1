import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react'

export default function Tournaments() {
  return (
    <AuthenticatedLayout>
      <Head title="hehheehhe" />
      <div>
          <h1>Welcome to Tournaments!</h1>
          <div style={{height:'500px', background:'silver'}}></div>
      </div>
    </AuthenticatedLayout>
  )
}