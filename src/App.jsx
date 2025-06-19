import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import CreatePlanche from './components/CreatePlanche';
import PlancheList from './components/PlancheList';

function Home({ session }) {
  return (
    <div>
      <CreatePlanche session={session} />
      <PlancheList session={session} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <Router basename="/apero">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-3xl font-bold">🥖 Planches Apéro</h1>
        {session && (
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm underline"
          >
            Se déconnecter
          </button>
        )}
      </header>

      <nav className="flex items-center gap-4 px-4 mb-6">
        <Link to="/" className="underline">
          Accueil
        </Link>
        <Link to="/creer" className="underline">
          Créer une planche
        </Link>
      </nav>

      <main className="flex flex-col items-center px-4">
        {!session ? (
          <Auth />
        ) : (
          <Routes>
            <Route path="/" element={<PlancheList session={session} />} />
            <Route path="/creer" element={<CreatePlanche session={session} />} />
          </Routes>
        )}
      </main>
    </Router>
  );
}
