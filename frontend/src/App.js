import React, { useState } from 'react';
import axios from 'axios';
import FileUploadComponent from './components/FileUploadComponent';
import SummaryComponent from './components/SummaryComponent';
import QuestionInputComponent from './components/QuestionInputComponent';
import PreviousQuestionsComponent from './components/PreviousQuestionsComponent';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState([]);
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [isQuestionInputEnabled, setIsQuestionInputEnabled] = useState(false);
    const [isAskButtonEnabled, setIsAskButtonEnabled] = useState(false);
    const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [summary, setSummary] = useState('');

    const handleUploadSuccess = (data) => {
        setUploadedFileName(data.filename);
        setSummary(data.summary.result);
        setIsQuestionInputEnabled(true);
        setIsAskButtonEnabled(true);
    };

    const handleAskQuestion = async (question) => {
        setIsGeneratingAnswer(true);

        try {
            const response = await axios.get(`http://localhost:8000/question/${uploadedFileName}?question=${encodeURIComponent(question)}`);
            if (response.status === 200) {
                const answer = response.data.answer.result;
                if (typeof answer === 'object') {
                    setAnswers([...answers, { question, answer: JSON.stringify(answer, null, 2) }]);
                } else {
                    setAnswers([...answers, { question, answer }]);
                }
                setQuestion('');
            } else {
                alert("Error: " + response.data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to fetch answer.");
        } finally {
            setIsGeneratingAnswer(false);
        }
    };

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            margin: '20px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ color: '#007bff', fontSize: '36px' }}>PDF Q&A System</h1>

            <FileUploadComponent onUploadSuccess={handleUploadSuccess} isUploading={isUploading} setIsUploading={setIsUploading} />
            <SummaryComponent summary={summary} />
            <QuestionInputComponent onAskQuestion={handleAskQuestion} isQuestionInputEnabled={isQuestionInputEnabled} isAskButtonEnabled={isAskButtonEnabled} isGeneratingAnswer={isGeneratingAnswer} />
            <PreviousQuestionsComponent answers={answers} />
        </div>
    );
}

export default App;
