

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Signin() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   async function handleSignin(e) {
//   e.preventDefault();
//   setLoading(true);
//   setError("");

//   try {
//     const res = await fetch("/api/v1/signin", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//     });

//     const data = await res.json();

//     console.log("Signin response:", data);

//     // ✅ FIXED CONDITION
//     if (res.ok && data.token) {
//       // ✅ Save token
//       localStorage.setItem("token", data.token);

//       // ✅ Optional role (since backend doesn't send user)
//       localStorage.setItem("role", "user");

//       // ✅ Redirect user
//       navigate("/dashboard");
//     } else {
//       setError(data.message || "Invalid credentials");
//     }
//   } catch (err) {
//     console.error(err);
//     setError("Something went wrong. Please try again.");
//   } finally {
//     setLoading(false);
//   }
// }


//   return (
//     <form
//       onSubmit={handleSignin}
//       className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg w-full max-w-md mx-auto"
//     >
//       <input
//         type="text"
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         required
//         className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 shadow-sm"
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//         className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 shadow-sm"
//       />

//       <button
//         type="submit"
//         disabled={loading}
//         className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50"
//       >
//         {loading ? "Signing In..." : "Sign In"}
//       </button>

//       {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
//     </form>
//   );
// }






// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Signin() {
//   const [usernameOrEmail, setUsernameOrEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   async function handleSignin(e) {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch("/api/v1/auth/signin", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           usernameOrEmail,   // ✅ IMPORTANT
//           password
//         }),
//       });

//       const data = await res.json();

//       console.log("Signin response:", data);

//       // ✅ SUCCESS CASE
//       if (res.ok && data.token) {
//         // ✅ Store JWT
//         localStorage.setItem("token", data.token);

//         // ✅ Store REAL role from backend
//         if (data.role) {
//           localStorage.setItem("role", data.role);
//         }

//         // ✅ Role-based redirect
//         if (data.role === "admin") {
//           navigate("/admin-dashboard");
//         } else {
//           navigate("/dashboard");
//         }

//       } else {
//         setError(data.message || "Invalid credentials");
//       }

//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <form
//       onSubmit={handleSignin}
//       className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg w-full max-w-md mx-auto"
//     >
//       {/* ✅ USERNAME OR EMAIL */}
//       <input
//         type="text"
//         placeholder="Username or Email"
//         value={usernameOrEmail}
//         onChange={(e) => setUsernameOrEmail(e.target.value)}
//         required
//         className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 shadow-sm"
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//         className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 shadow-sm"
//       />

//       <button
//         type="submit"
//         disabled={loading}
//         className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50"
//       >
//         {loading ? "Signing In..." : "Sign In"}
//       </button>

//       {error && (
//         <p className="text-red-500 text-center text-sm mt-2">{error}</p>
//       )}
//     </form>
//   );
// }




import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signin() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSignin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();

      console.log("Signin response:", data);

      if (!res.ok || !data.token) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // Save JWT + role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // ⭐ ROLE-BASED REDIRECT
     switch (data.role) {
  case "delivery_partner":
    navigate("/partner-dashboard");
    break;
  case "restaurant_owner":
    navigate("/restaurant-dashboard");
    break;
  default:
    navigate("/dashboard"); // customer by default
}


    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSignin}
      className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-lg w-full max-w-md mx-auto"
    >
      <input
        type="text"
        placeholder="Username or Email"
        value={usernameOrEmail}
        onChange={(e) => setUsernameOrEmail(e.target.value)}
        required
        className="px-4 py-3 border border-gray-300 rounded-xl"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="px-4 py-3 border border-gray-300 rounded-xl"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-3 rounded-xl"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>

      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  );
}
