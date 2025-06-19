import React, { useState, useEffect } from 'react';

const OPENCAGE_API_KEY = '50a8a9446f6b426c98ec11621c4f3955';

export default function AdresseAutocomplete({ onSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=5`
      );
      const data = await response.json();
      if (data && data.results) {
        setSuggestions(data.results);
      }
    };

    fetchSuggestions();
  }, [query]);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        placeholder="Tape ton adresse"
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border rounded"
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            width: '100%',
            maxHeight: '150px',
            overflowY: 'auto',
            zIndex: 10,
            marginTop: 0,
            paddingLeft: '10px',
            listStyleType: 'none',
          }}
        >
          {suggestions.map((item) => (
            <li
              key={item.annotations.geohash || item.geometry.lat + item.geometry.lng}
              style={{ padding: '5px', cursor: 'pointer' }}
              onClick={() => {
                setQuery(item.formatted);
                setSuggestions([]);
                onSelect(item);
              }}
            >
              {item.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
