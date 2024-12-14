import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Cards } from '../Components/Cards';
import { cards_create as initialCards } from '../data';
import { ModalWindow } from '../Components/ModalWindow';
import { useState } from 'react';
import { CreateGame } from '../Components/CreateGame';
import { CreateQuiz } from '../Components/CreateQuiz';

export default function Create() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null); // To store dynamic content for the modal

    // Function to open modal and set content dynamically
    const openModal = (content) => {
        setModalContent(content);
        setModalIsOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setModalIsOpen(false);
        setModalContent(null); // Reset content when modal is closed
    };

    // Pass the openModal handler to each card
    const cards_create = initialCards.map((card) => ({
        ...card,
        onClick: () => {
            // Customize the modal content per card here
            if (card.id === 1) {
                openModal(<CreateGame />); // Pass component for CreateGame
            } else if (card.id === 2) {
                openModal(<CreateQuiz />); // Pass component for CreateQuiz
            }
        },
    }));

    return (
        <div className='rainbow-bg main-container'>
            <AuthenticatedLayout>
              {/* <a><span>Back</span></a> */}
                <div className="rainbow-bg cards">
                    <Cards cards={cards_create} />
                </div>

                {/* Modal Component */}
                <ModalWindow
                    modalContent={modalContent} // Pass dynamic content here
                    isOpen={modalIsOpen}
                    onClose={closeModal} // Function to close modal
                />
            </AuthenticatedLayout>
        </div>
    );
}



