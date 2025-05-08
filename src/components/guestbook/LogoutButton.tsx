import React from 'react';
import { supabase } from '../../lib/supabaseClient';

const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <button
      className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white px-3 sm:px-4 py-1.5 rounded font-semibold shadow transition-colors text-sm sm:text-base"
      onClick={handleLogout}
    >
      Çıkış Yap
    </button>
  );
};

export default LogoutButton; 