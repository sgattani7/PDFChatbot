const PreviousQuestionsComponent = ({ answers }) => {
    return (
        answers.length > 0 && (
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
        )
    );
};

export default PreviousQuestionsComponent;
