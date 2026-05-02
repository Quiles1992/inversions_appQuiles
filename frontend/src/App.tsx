import { useState } from 'react';

function App() {
  const [message] = useState('DR.FIC Plataforma de Inversiones - MVP frontend skeleton');
  return (
    <main className="app-shell">
      <h1>{message}</h1>
      <p>Este frontend es un esqueleto inicial para la futura aplicación PWA.</p>
    </main>
  );
}

export default App;
