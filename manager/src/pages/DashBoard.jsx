import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const DashBoard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [form, setForm] = useState({ username: "", email: "" });
  const [passwords, setPasswords] = useState({ old: "", new: "" });
  const [avatar, setAvatar] = useState(null);

  const navigate = useNavigate();
  const menuRef = useRef(null);
  const token = localStorage.getItem("token");

  // ✅ FETCH PROFILE
  useEffect(() => {
    if (!token) return navigate("/");

    async function fetchProfile() {
      try {
        const res = await fetch("/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
        setForm({ username: data.username, email: data.email });
      } catch {
        localStorage.clear();
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [navigate, token]);

  // ✅ CLOSE MENU OUTSIDE
  useEffect(() => {
    function close(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // ✅ UPDATE PROFILE
  async function handleUpdateProfile() {
    try {
      await fetch("/api/v1/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      setEditMode(false);
      alert("Profile updated ✅");
    } catch {
      alert("Update failed ❌");
    }
  }

  // ✅ CHANGE PASSWORD
 async function handleChangePassword() {
  try {
    const res = await fetch("/api/v1/auth/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        oldPassword: passwords.old,
        newPassword: passwords.new,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert("Password changed successfully ✅");
    setPasswordMode(false);
  } catch (err) {
    alert(err.message || "Password update failed ❌");
  }
}


  // ✅ DELETE ACCOUNT
 async function handleDeleteAccount() {
  if (!window.confirm("Delete your account permanently?")) return;

  try {
   const res = await fetch("/api/v1/users/me", {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert("Account deleted successfully ✅");
    localStorage.clear();
    navigate("/");
  } catch (err) {
    alert(err.message || "Delete failed ❌");
  }
}


  function handleLogout() {
    localStorage.clear();
    navigate("/");
  }

if (loading) return <div>Loading...</div>;

if (!user) {
  return (
    <div className="h-screen flex items-center justify-center flex-col gap-3">
      <p className="text-red-500 font-semibold">Failed to load profile</p>
      <button
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Go to Login
      </button>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ NAVBAR */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">User Dashboard</h1>

        <div className="relative" ref={menuRef}>
          <div
  onClick={() => setMenuOpen(!menuOpen)}
  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold cursor-pointer"
>
  {user?.username?.[0]?.toUpperCase() || "U"}
</div>


          {menuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white shadow-xl rounded-xl p-4">
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <hr className="my-3" />

              <button onClick={() => setEditMode(true)} className="block w-full text-left py-1">Edit Profile</button>
              <button onClick={() => setPasswordMode(true)} className="block w-full text-left py-1">Change Password</button>
              <button onClick={handleDeleteAccount} className="block w-full text-left py-1 text-red-500">Delete Account</button>
              <button onClick={handleLogout} className="block w-full text-left py-1">Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ PROFILE VIEW */}
      <div className="p-8 max-w-xl mx-auto bg-white mt-6 rounded-xl shadow">
        {!editMode && !passwordMode && (
          <>
            <p><b>Username:</b> {user.username}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Role:</b> {user.role}</p>
          </>
        )}

        {editMode && (
          <>
            <input className="border p-2 w-full mb-3" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <input className="border p-2 w-full mb-3" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <button onClick={handleUpdateProfile} className="bg-blue-500 text-white px-4 py-2">Save</button>
          </>
        )}

        {passwordMode && (
          <>
            <input className="border p-2 w-full mb-3" placeholder="Old Password" onChange={e => setPasswords({ ...passwords, old: e.target.value })} />
            <input className="border p-2 w-full mb-3" placeholder="New Password" onChange={e => setPasswords({ ...passwords, new: e.target.value })} />
            <button onClick={handleChangePassword} className="bg-green-500 text-white px-4 py-2">Change</button>
          </>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
