import { useEffect, useRef, useState } from "react";
import ProfileView from "../../profile/ProfileView";
import { useNavigate } from "react-router-dom";
const HeaderBar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const ref = useRef(null);
  const token = localStorage.getItem("token");
    const navigate = useNavigate();
  // fetch user (same as ProfileView)
  useEffect(() => {
    fetch("/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, [token]);

  // close on outside click
  useEffect(() => {
    const close = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!user) return null;

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center relative">
      <h1 className="text-xl font-bold">Live Orders</h1>

      <div ref={ref} className="relative">
        {/* Avatar */}
        <div
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-indigo-600 text-white
                     flex items-center justify-center font-bold cursor-pointer"
        >
          {user.username[0].toUpperCase()}
        </div>

        {/* Inline Profile View */}
        {open && (
        <ProfileView
          user={user}
          onClose={() => setOpen(false)}
          onEdit={() => {
            setOpen(false);       
            navigate("/profile/edit"); 
          }}
        />
      )}
      </div>
    </div>
  );
};

export default HeaderBar;
