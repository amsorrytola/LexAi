import { useState } from 'react';
import { LexAi_backend } from 'declarations/LexAi_backend';

function App() {
  const [greeting, setGreeting] = useState('');

  function handleSubmit(event) {
  }

  return (
    <main>
      <img src="/logo2.svg" alt="DFINITY logo" />
      <br />
      <br />
      <form action="#" onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name: &nbsp;</label>
        <input id="name" alt="Name" type="text" />
        <button type="submit">Click Me!</button>
      </form>
      <section id="greeting">{greeting}</section>
    </main>
  );
}

export default App;
