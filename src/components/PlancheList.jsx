import { useEffect, useState } from 'react';
import { supabase, supabaseStorageUrl } from '../supabaseClient';

export default function PlancheList({ session }) {
  const [planches, setPlanches] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPlanches();
  }, [filter]);

  const fetchPlanches = async () => {
    let query = supabase
      .from('planches')
      .select(`
        *,
        ratings(rating),
        comments(content, user_id, created_at)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('type', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
    } else {
      setPlanches(data);
    }
  };

  const handleComment = async (plancheId, text) => {
    if (!text.trim()) return;
    const { error } = await supabase.from('comments').insert({
      planche_id: plancheId,
      user_id: session.user.id,
      content: text,
    });
    if (!error) fetchPlanches();
  };

  const handleRating = async (plancheId, note) => {
    const { error } = await supabase.from('ratings').insert({
      planche_id: plancheId,
      user_id: session.user.id,
      rating: note,
    });
    if (!error) fetchPlanches();
  };

  return (
    <div>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="p-2 mb-4 border rounded"
      >
        <option value="all">Toutes</option>
        <option value="fromage">Fromage</option>
        <option value="charcuterie">Charcuterie</option>
        <option value="mixte">Mixte</option>
        <option value="vege">Végétarienne</option>
      </select>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {planches.map((planche) => {
          const ratings = planche.ratings || [];
          const avgRating =
            ratings.length > 0
              ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
              : null;

          const comments = planche.comments || [];

          return (
            <div key={planche.id} className="p-4 bg-white border rounded shadow">
              <h2 className="mb-1 text-xl font-bold">{planche.title}</h2>
              <p className="mb-2 text-sm italic text-gray-500">{planche.type}</p>
              <p className="mb-2">{planche.description}</p>

              {/* Affichage de l'adresse cliquable */}
              {planche.address && planche.latitude && planche.longitude && (
                <p className="mb-2 font-medium text-gray-700">
                  Adresse :{' '}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${planche.latitude},${planche.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {planche.address}
                  </a>
                </p>
              )}

              {planche.image_path && (
                <img
                  src={`${supabaseStorageUrl}/${planche.image_path}`}
                  alt={planche.title}
                  className="object-cover w-full h-auto mt-2 rounded"
                />
              )}

              <div className="mt-2">
                <strong>Note moyenne :</strong>{' '}
                {avgRating ? `${avgRating} / 5 ⭐` : 'Pas encore notée'}
              </div>

              <div className="mt-2">
                <strong>Noter :</strong>{' '}
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => handleRating(planche.id, n)}>⭐</button>
                ))}
              </div>

              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Ton commentaire"
                  onBlur={(e) => handleComment(planche.id, e.target.value)}
                  className="w-full p-2 mt-1 border rounded"
                />
              </div>

              {comments.length > 0 && (
                <div className="mt-4">
                  <strong>Commentaires :</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    {comments.map((comment, idx) => (
                      <li key={idx} className="pb-1 border-b">
                        {comment.content}
                        <span className="block text-xs text-gray-400">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
