import React from 'react';
import { supabase } from '../../lib/supabaseClient';

const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Çıkış yapma hatası:", error.message);
        alert("Çıkış yaparken bir hata oluştu: " + error.message);
      } else {
        console.log("Başarıyla çıkış yapıldı");
        window.location.reload();
      }
    } catch (e) {
      console.error("Beklenmeyen bir hata oluştu:", e);
      alert("Çıkış sırasında beklenmeyen bir hata oluştu.");
    }
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