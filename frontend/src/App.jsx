import { useEffect } from "react";
import { useState } from "react";

function App() {

  const [message, setMessage] = useState('');

  useEffect(() => {
fetch("http://localhost:3000/api/message")    
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching message:', error));
  }, []);

  return (
    <div className="App">
      <h1>Service Desk</h1>
      <p>Backend says:</p>

      <strong>{message}</strong>   
    </div>
  );
}

export default App;