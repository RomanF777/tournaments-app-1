import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Cards } from '../Components/Cards';
import { cards_create } from '../data';

export default function Create() {

  return (
    <div className='rainbow-bg main-container'>
      <AuthenticatedLayout>
        <div className="rainbow-bg cards">
          <Cards cards={cards_create} />
        </div>
      </AuthenticatedLayout>
    </div>
  )
}