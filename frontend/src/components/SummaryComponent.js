const SummaryComponent = ({ summary }) => {
    return (
        summary && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#007bff', fontSize: '24px' }}>Summary:</h2>
                <p>{summary}</p>
            </div>
        )
    );
};

export default SummaryComponent;
