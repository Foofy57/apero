import { useState } from 'react';
import { supabase } from '../supabaseClient';
import AdresseAutocomplete from './AdresseAutocomplete'; // adapte le chemin selon ton arborescence

export default function CreatePlanche({ session }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null);
  const [type, setType] = useState('fromage');
  const [selectedAddress, setSelectedAddress] = useState(null); // stocke l'adresse complète

  const uploadImage = async () => {
    if (!image) return null;
    const fileExt = image.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('images').upload(fileName, image);
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const imagePath = await uploadImage();
    const { error } = await supabase.from('planches').insert({
      user_id: session.user.id,
      title,
      description: desc,
      type,
      image_path: imagePath,
      address: selectedAddress ? selectedAddress.formatted : null,
      latitude: selectedAddress ? selectedAddress.geometry.lat : null,
      longitude: selectedAddress ? selectedAddress.geometry.lng : null,
    });
    if (error) alert(error.message);
    else {
      setTitle('');
      setDesc('');
      setImage(null);
      setType('fromage');
      setSelectedAddress(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-gray-100 rounded">
      <input
        className="w-full p-2 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        required
      />
      <textarea
        className="w-full p-2 border rounded"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description"
        required
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full p-2 border rounded"
        required
      >
        <option value="fromage">Fromage</option>
        <option value="charcuterie">Charcuterie</option>
        <option value="mixte">Mixte</option>
        <option value="vege">Végétarienne</option>
      </select>

      <AdresseAutocomplete onSelect={setSelectedAddress} />

      <input
        className="w-full"
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        accept="image/*"
      />

      <button
        type="submit"
        className="px-4 py-2 text-black bg-green-500 rounded disabled:text-white"
        disabled={!selectedAddress} // optionnel : obliger à choisir une adresse
      >
        Ajouter la planche
      </button>
    </form>
  );
}
