import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ItineraryResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { itineraryJson } = location.state || {};

    let itineraryData = null;
    let parseError = null;

    if (!itineraryJson) {
        return (
            <div style={{ backgroundColor: 'white', color: 'black', padding: '40px', minHeight: '100vh' }}>
                <h1>No Itinerary Data</h1>
                <p>Itinerary data was not provided. Please go back and generate an itinerary first.</p>
                <button onClick={() => navigate('/create-trip')} style={{ padding: '10px 20px', marginTop: '20px' }}>
                    Go Back
                </button>
            </div>
        );
    }

    try {
        itineraryData = JSON.parse(itineraryJson);
    } catch (e) {
        parseError = `Failed to parse JSON: ${e.message}`;
    }

    return (
        <div style={{ backgroundColor: 'white', color: 'black', padding: '40px', fontFamily: 'monospace', minHeight: '100vh' }}>
            <button onClick={() => navigate('/create-trip')} style={{ padding: '10px 20px', marginBottom: '20px', fontFamily: 'sans-serif' }}>
                &larr; Back to Editor
            </button>
            <h1 style={{ fontFamily: 'sans-serif', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                Generated Itinerary (Raw JSON)
            </h1>
            
            {parseError ? (
                <div>
                    <h2 style={{ color: 'red', fontFamily: 'sans-serif' }}>Parsing Error</h2>
                    <p style={{ fontFamily: 'sans-serif' }}>{parseError}</p>
                    <h3>Original JSON String:</h3>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: '#f0f0f0', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
                        {itineraryJson}
                    </pre>
                </div>
            ) : (
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', background: '#f0f0f0', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
                    {JSON.stringify(itineraryData, null, 2)}
                </pre>
            )}
        </div>
    );
};

export default ItineraryResult;
