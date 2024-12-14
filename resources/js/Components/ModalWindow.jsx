// import React, { useState } from 'react';
// import Modal from 'react-modal';
// import '../../css/app.css'

// export const ModalWindow = () => {

//   const [modalIsOpen, setModalIsOpen] = useState(false);

//   const openModal = () => {
//     setModalIsOpen(true);
//   };

//   const closeModal = () => {
//     setModalIsOpen(false);
//   };

//   return (
//     <div className='modal-overlay'>
//       <button onClick={openModal}>Открыть модальное окно</button>
//       <Modal ariaHideApp={false} isOpen={modalIsOpen} onRequestClose={closeModal}>
//         {modalContent}
//       </Modal>
//   </div>
//   );
// }


import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../css/app.css';

export const ModalWindow = ({ modalContent, isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      overlayClassName="modal-overlay"
      className="modal-container"
    >
      <button className="modal-close" onClick={onClose}>
        &times;
      </button>
      <div>{modalContent}</div>
    </Modal>
  );
};


