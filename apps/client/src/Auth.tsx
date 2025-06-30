// src/Auth.tsx
import React from "react";

const Auth = () => {
  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:4000/auth/github/login";
  };

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <h1 className="text-2xl font-bold">🔐 Sign in with GitHub</h1>
      <button
        onClick={handleGitHubLogin}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        Login with GitHub
      </button>
    </div>
  );
};

export default Auth;
