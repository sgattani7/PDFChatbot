import React, { useState } from 'react';
import axios from 'axios';

const QuestionInputComponent = ({ onAskQuestion, isQuestionInputEnabled, isAskButtonEnabled, isGeneratingAnswer }) => {
    const [question, setQuestion] = useState('');

    const handleQuestionChange = (event) => {
        setQuestion(event.target.value);
    };

    const askQuestion = async () => {
        if (!question) {
            alert("Please enter a question.");
            return;
        }

        onAskQuestion(question);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <input type="text" value={question} onChange={handleQuestionChange} placeholder="Ask a question..." disabled={!isQuestionInputEnabled} style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', width: '300px' }} />
            <button
                onClick={askQuestion}
                disabled={!isAskButtonEnabled}
                style={{
                    padding: '10px',
                    fontSize: '16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out'
                }}
            >
                {isGeneratingAnswer ? 'Generating answer...' : 'Ask'}
            </button>
        </div>
    );
};

export default QuestionInputComponent;
