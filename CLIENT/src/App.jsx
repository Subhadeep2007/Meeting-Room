import { useState } from 'react'

import './App.css'
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="h-16 bg-blue-600 text-white flex items-center justify-center shadow-md">
        <h1 className="text-2xl font-bold">Meeting Room</h1>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="bg-white shadow-lg rounded-xl p-10 text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            🚀 Client Running Successfully
          </h2>

          <p className="text-gray-600 mt-4">
            Welcome to the Meeting Room Project
          </p>

          <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Create Meeting
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;