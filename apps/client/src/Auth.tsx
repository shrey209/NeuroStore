import React from "react";

const Auth = () => {
  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:4000/auth/github/login";
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google/login";
  };

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
      <h1 className="text-2xl font-bold mb-4">🔐 Sign in to NeuroStore</h1>

      <button
        onClick={handleGitHubLogin}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition w-64"
      >
        🐙 Login with GitHub
      </button>

      <button
        onClick={handleGoogleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-64"
      >
        🔵 Login with Google
      </button>
    </div>
  );
};

export default Auth;
