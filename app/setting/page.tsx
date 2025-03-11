"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";

export default function Settings() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const router = useRouter();

  const handleNameChange = async () => {
    await axios.put('/api/user', { name });
    alert('Name updated!');
  };

  const handlePasswordChange = async () => {
    await axios.put('/api/user', { password });
    alert('Password updated!');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    const res = await axios.post('/api/upload', formData);
    alert('Profile picture updated!');
};


  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account?')) {
      await axios.delete('/api/user');
      router.push('/login');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-4">
        <label>Change Name:</label>
        <input className="border p-2" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={handleNameChange}>Save</button>
      </div>
      <div className="mt-4">
        <label>Change Password:</label>
        <input className="border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handlePasswordChange}>Save</button>
      </div>
      <div className="mt-4">
        <label>Upload Profile Picture:</label>
        <input type="file" onChange={handleImageUpload} />
      </div>
      <div className="mt-4">
        <button className="bg-red-500 text-white p-2" onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
}