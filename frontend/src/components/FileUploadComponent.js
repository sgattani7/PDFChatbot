import React, { useState } from 'react';
import axios from 'axios';

const FileUploadComponent = ({ onUploadSuccess, isUploading, setIsUploading }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const uploadPDF = async () => {
        if (!selectedFile) {
            alert("Please select a PDF file.");
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("question", "");

        try {
            const response = await axios.post("http://localhost:8000/pdf/upload", formData);
            if (response.status === 200) {
                onUploadSuccess(response.data);
                alert("PDF uploaded successfully!");
            } else {
                alert("Error uploading PDF: " + response.data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to upload PDF.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ padding: '10px', fontSize: '16px', borderRadius: '5px' }} />
            <button
                onClick={uploadPDF}
                disabled={isUploading}
                style={{
                    padding: '10px',
                    fontSize: '16px',
                    backgroundColor: isUploading ? '#ccc' : '#007bff',
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
    );
};

export default FileUploadComponent;
