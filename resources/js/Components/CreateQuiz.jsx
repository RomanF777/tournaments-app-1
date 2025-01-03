// import React, { useState } from 'react';

// export const CreateQuiz = () => {
//   const [quizTitle, setQuizTitle] = useState('');
//   const [questions, setQuestions] = useState([]);

//   const handleAddQuestion = () => {
//     setQuestions([
//       ...questions,
//       { questionText: '', answers: ['', '', '', ''], correctAnswer: 0 }
//     ]);
//   };

//   const handleQuestionChange = (index, value) => {
//     const updatedQuestions = [...questions];
//     updatedQuestions[index].questionText = value;
//     setQuestions(updatedQuestions);
//   };

//   const handleAnswerChange = (questionIndex, answerIndex, value) => {
//     const updatedQuestions = [...questions];
//     updatedQuestions[questionIndex].answers[answerIndex] = value;
//     setQuestions(updatedQuestions);
//   };

//   const handleCorrectAnswerChange = (questionIndex, value) => {
//     const updatedQuestions = [...questions];
//     updatedQuestions[questionIndex].correctAnswer = parseInt(value, 10);
//     setQuestions(updatedQuestions);
//   };

//   const handleSubmitQuiz = () => {
//     const quizData = { title: quizTitle, questions };
//     console.log('Quiz Submitted:', quizData);
//     // Здесь вы можете отправить данные викторины на сервер
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <p style={{color: 'red', fontWeight: '900', margin: '0 auto'}}>In progress...</p>
//       <h1>Create a Quiz</h1>
//       <div style={{ marginBottom: '20px' }}>
//         <label>
//           Quiz Title:
//           <input
//             type="text"
//             value={quizTitle}
//             onChange={(e) => setQuizTitle(e.target.value)}
//             style={{ marginLeft: '10px', padding: '5px' }}
//           />
//         </label>
//       </div>
//       <div style={{overflowY: 'auto', maxHeight: '60vh'}}>
//       {questions.map((question, qIndex) => (
//         <div key={qIndex} style={{ marginBottom: '20px' }}>
//           <h3>Question {qIndex + 1}</h3>
//           <input
//             type="text"
//             placeholder="Enter question text"
//             value={question.questionText}
//             onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
//             style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '5px' }}
//           />
//           <div>
//             {question.answers.map((answer, aIndex) => (
//               <div key={aIndex} style={{ marginBottom: '5px' }}>
//                 <input
//                   type="text"
//                   placeholder={`Answer ${aIndex + 1}`}
//                   value={answer}
//                   onChange={(e) =>
//                     handleAnswerChange(qIndex, aIndex, e.target.value)
//                   }
//                   style={{ marginRight: '10px', padding: '5px' }}
//                 />
//                 <label>
//                   <input
//                     type="radio"
//                     name={`correctAnswer-${qIndex}`}
//                     value={aIndex}
//                     checked={question.correctAnswer === aIndex}
//                     onChange={(e) =>
//                       handleCorrectAnswerChange(qIndex, e.target.value)
//                     }
//                   />
//                 </label>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//       </div>
//       <button onClick={handleAddQuestion} style={{ marginRight: '10px', padding: '10px' }}>
//         Add Question
//       </button>
//       <button onClick={handleSubmitQuiz} style={{ padding: '10px' }}>
//         Submit Quiz
//       </button>
//     </div>
//   );
// };



import axios from 'axios';
import { useState } from 'react';

export const CreateQuiz = () => {
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([]);

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                questionText: '',
                answers: [
                    { answerText: '', isCorrect: false },
                    { answerText: '', isCorrect: false },
                ],
            },
        ]);
    };

    const handleQuestionChange = (index, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].questionText = value;
        setQuestions(updatedQuestions);
    };

    const handleAnswerChange = (qIndex, aIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].answers[aIndex].answerText = value;
        setQuestions(updatedQuestions);
    };

    const handleCorrectAnswerChange = (qIndex, aIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].answers.forEach((answer, index) => {
            updatedQuestions[qIndex].answers[index].isCorrect =
                index === aIndex;
        });
        setQuestions(updatedQuestions);
    };

    const handleSubmitQuiz = async () => {
        try {
            const response = await axios.post('/quiz', {
                title: quizTitle,
                questions,
            });
            console.log('Quiz created:', response.data);
        } catch (error) {
            console.error('Error saving quiz:', error);
            alert('error');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Create a Quiz</h1>
            <div style={{ marginBottom: '20px' }}>
                <label>
                    Quiz Title:
                    <input
                        type="text"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    />
                </label>
            </div>
            {questions.map((question, qIndex) => (
                <div key={qIndex} style={{ marginBottom: '20px' }}>
                    <h3>Question {qIndex + 1}</h3>
                    <input
                        type="text"
                        placeholder="Enter question text"
                        value={question.questionText}
                        onChange={(e) =>
                            handleQuestionChange(qIndex, e.target.value)
                        }
                        style={{
                            display: 'block',
                            marginBottom: '10px',
                            width: '100%',
                            padding: '5px',
                        }}
                    />
                    <div>
                        {question.answers.map((answer, aIndex) => (
                            <div key={aIndex} style={{ marginBottom: '5px' }}>
                                <input
                                    type="text"
                                    placeholder={`Answer ${aIndex + 1}`}
                                    value={answer.answerText}
                                    onChange={(e) =>
                                        handleAnswerChange(
                                            qIndex,
                                            aIndex,
                                            e.target.value,
                                        )
                                    }
                                    style={{
                                        marginRight: '10px',
                                        padding: '5px',
                                    }}
                                />
                                <label>
                                    <input
                                        type="radio"
                                        name={`correctAnswer-${qIndex}`}
                                        checked={answer.isCorrect}
                                        onChange={() =>
                                            handleCorrectAnswerChange(
                                                qIndex,
                                                aIndex,
                                            )
                                        }
                                    />
                                    Correct
                                </label>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() =>
                            setQuestions((prev) =>
                                prev.map((q, i) =>
                                    i === qIndex
                                        ? {
                                              ...q,
                                              answers: [
                                                  ...q.answers,
                                                  {
                                                      answerText: '',
                                                      isCorrect: false,
                                                  },
                                              ],
                                          }
                                        : q,
                                ),
                            )
                        }
                    >
                        Add Answer
                    </button>
                </div>
            ))}
            <button
                onClick={handleAddQuestion}
                style={{ marginRight: '10px', padding: '10px' }}
            >
                Add Question
            </button>
            <button onClick={handleSubmitQuiz} style={{ padding: '10px' }}>
                Submit Quiz
            </button>
        </div>
    );
};