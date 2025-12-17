const ProfileView = ({ user, onEdit, onClose }) => {
  return (
    <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl p-5 z-50">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-600 text-white
                        flex items-center justify-center text-xl font-bold">
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{user.username}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 text-sm space-y-1">
        <p>Role: <b>{user.role}</b></p>
      </div>

      <hr className="my-4" />

      {/* Actions */}
      <button
        onClick={onEdit}
        className="w-full text-left py-2 hover:text-indigo-600"
      >
        Edit Profile
      </button>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
        className="w-full text-left py-2 text-red-500"
      >
        Logout
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-2 right-3 text-gray-400"
      >
        ✕
      </button>
    </div>
  );
};

export default ProfileView;
