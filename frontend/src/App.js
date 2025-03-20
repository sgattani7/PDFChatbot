import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState([]);
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [isQuestionInputEnabled, setIsQuestionInputEnabled] = useState(false);
    const [isAskButtonEnabled, setIsAskButtonEnabled] = useState(false);
    const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
    const [isUploading, setIsUploading] = useState(false); // New state for upload status
    const [summary, setSummary] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleQuestionChange = (event) => {
        setQuestion(event.target.value);
    };

    const uploadPDF = async () => {
        if (!selectedFile) {
            alert("Please select a PDF file.");
            return;
        }

        setIsUploading(true); // Set uploading status to true

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("question", "");  // Question is not required for upload

        try {
            const response = await axios.post("http://localhost:8000/pdf/upload", formData);
            if (response.status === 200) {
                setUploadedFileName(response.data.filename);
                setSummary(response.data.summary.result); // Set the summary result
                alert("PDF uploaded successfully!");
                setIsQuestionInputEnabled(true);
                setIsAskButtonEnabled(true);
            } else {
                alert("Error uploading PDF: " + response.data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to upload PDF.");
        } finally {
            setIsUploading(false); // Reset uploading status
        }
    };

    const askQuestion = async () => {
        if (!uploadedFileName) {
            alert("Please upload a PDF first.");
            return;
        }
        if (!question) {
            alert("Please enter a question.");
            return;
        }

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

            {/* File Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ padding: '10px', fontSize: '16px', borderRadius: '5px' }} />
                <button
                    onClick={uploadPDF}
                    disabled={isUploading} // Disable button while uploading
                    className="clickable-button"
                    style={{
                        padding: '10px',
                        fontSize: '16px',
                        backgroundColor: isUploading ? '#ccc' : '#007bff', // Change button color while uploading
                        color: isUploading ? '#666' : 'white',
                        borderRadius: '5px',
                        border: 'none',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.2s ease-in-out'
                    }}
                >
                    {isUploading ? 'Uploading and summarizing...' : 'Upload PDF'}
                </button>
            </div>

            {/* Summary Display */}
            {summary && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ color: '#007bff', fontSize: '24px' }}>Summary:</h2>
                    <p>{summary}</p>
                </div>
            )}

            {/* Question Input */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <input type="text" value={question} onChange={handleQuestionChange} placeholder="Ask a question..." disabled={!isQuestionInputEnabled} style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', width: '300px' }} />
                <button
                    onClick={askQuestion}
                    disabled={!isAskButtonEnabled}
                    className="clickable-button"
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

            {/* Previous Questions and Answers */}
            {answers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ color: '#007bff', fontSize: '24px' }}>Previous Questions and Answers:</h2>
                    {answers.map((qa, index) => (
                        <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <h3 style={{ fontSize: '18px' }}>Question {index + 1}:</h3>
                            <p><strong>Q:</strong> {qa.question}</p>
                            <p><strong>A:</strong> {qa.answer}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
