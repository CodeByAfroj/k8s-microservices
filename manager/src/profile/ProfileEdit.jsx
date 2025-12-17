import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({ username: "", email: "" });
  const [passwords, setPasswords] = useState({ old: "", new: "" });
  const [loading, setLoading] = useState(true);

  // ✅ FETCH PROFILE
  useEffect(() => {
    if (!token) return navigate("/");

    fetch("/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setForm({ username: data.username, email: data.email });
        setLoading(false);
      })
      .catch(() => navigate("/"));
  }, [navigate, token]);

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

      alert("Profile updated successfully ✅");
      navigate("/profile");
    } catch {
      alert("Profile update failed ❌");
    }
  }

  // ✅ CHANGE PASSWORD
  async function handleChangePassword() {
    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: passwords.old,
          newPassword: passwords.new,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Password changed successfully ✅");
      setPasswords({ old: "", new: "" });
    } catch (err) {
      alert(err.message || "Password update failed ❌");
    }
  }

  // ✅ DELETE ACCOUNT
  async function handleDeleteAccount() {
    if (!window.confirm("Are you sure? This action is permanent.")) return;

    try {
      await fetch("/api/v1/users/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.clear();
      alert("Account deleted successfully");
      navigate("/");
    } catch {
      alert("Account deletion failed ❌");
    }
  }

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pt-10">
      <div className="bg-white w-full max-w-xl rounded-xl shadow p-8 space-y-8">

        <h2 className="text-2xl font-bold">Edit Profile</h2>

        {/* BASIC INFO */}
        <section>
          <h3 className="font-semibold mb-3">Profile Information</h3>

          <input
            className="border p-3 w-full mb-3 rounded"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />

          <button
            onClick={handleUpdateProfile}
            className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded"
          >
            Save Changes
          </button>
        </section>

        <hr />

        {/* PASSWORD */}
        <section>
          <h3 className="font-semibold mb-3">Change Password</h3>

          <input
            className="border p-3 w-full mb-3 rounded"
            placeholder="Old Password"
            type="password"
            value={passwords.old}
            onChange={e => setPasswords({ ...passwords, old: e.target.value })}
          />

          <input
            className="border p-3 w-full rounded"
            placeholder="New Password"
            type="password"
            value={passwords.new}
            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
          />

          <button
            onClick={handleChangePassword}
            className="mt-4 bg-green-600 text-white px-5 py-2 rounded"
          >
            Update Password
          </button>
        </section>

        <hr />

        {/* DANGER ZONE */}
        <section>
          <h3 className="font-semibold text-red-600 mb-3">Danger Zone</h3>

          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-5 py-2 rounded"
          >
            Delete Account
          </button>
        </section>

      </div>
    </div>
  );
};

export default ProfileEdit;
