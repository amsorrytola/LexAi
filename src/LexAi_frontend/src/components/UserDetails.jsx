import React, { useState } from "react";

const UserDetails = ({ user, onUpdate, error }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
  });
  const [localError, setLocalError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }
    await onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="border-b border-gray-200 pb-8 animate-slide-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">User Information</h2>
        <button
          className="relative bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-2.5 rounded-xl transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden group"
          onClick={() => setIsEditing(!isEditing)}
        >
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
          <span className="relative">{isEditing ? "Cancel" : "Edit Profile"}</span>
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter your email"
            />
          </div>
          {(localError || error) && (
            <p className="text-red-600 text-sm font-medium">{localError || error}</p>
          )}
          <button
            type="submit"
            className="relative bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden group"
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            <span className="relative">Save Changes</span>
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="text-sm font-medium text-gray-700">Principal</span>
            <p className="text-sm text-gray-900 break-all mt-1">{user.principal}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Username</span>
            <p className="text-sm text-gray-900 mt-1">{user.username || "Not set"}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Email</span>
            <p className="text-sm text-gray-900 mt-1">{user.email || "Not set"}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">Joined</span>
            <p className="text-sm text-gray-900 mt-1">{user.created_at}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;