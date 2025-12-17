import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileView from "../../profile/ProfileView";

const PartnerHeader = () => {
  const [online, setOnline] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const ref = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔹 Fetch logged-in user
  useEffect(() => {
    fetch("/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, [token]);

  // 🔹 Close profile on outside click
  useEffect(() => {
    const close = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!user) return null;

  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center relative">

      {/* LEFT: ONLINE / OFFLINE */}
      <button
        onClick={() => setOnline(!online)}
        className={`px-4 py-2 rounded text-white font-semibold ${
          online ? "bg-green-600" : "bg-gray-500"
        }`}
      >
        {online ? "🟢 Online" : "⚪ Offline"}
      </button>

      {/* CENTER: EARNINGS */}
      <p className="font-semibold">Today: ₹320</p>

      {/* RIGHT: PROFILE */}
      <div ref={ref} className="relative">
        <div
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-indigo-600 text-white
                     flex items-center justify-center font-bold cursor-pointer"
        >
          {user.username[0].toUpperCase()}
        </div>

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

export default PartnerHeader;
