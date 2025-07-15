import React, { useState, useEffect } from "react";
import { User, FileText } from "lucide-react";
import UserDetails from "../components/UserDetails";
import SessionList from "../components/SessionList";
import DocumentList from "../components/DocumentList";
import { useUserStore } from "../store";
import dayjs from "dayjs";

const ProfilePage = () => {
  const { actor, isAuthenticated, init } = useUserStore();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initProfile = async () => {
      setLoading(true);
      try {
        await init();
      } catch (err) {
        console.error("Authentication initialization failed:", err);
        setError("Failed to initialize authentication. Please try again.");
        setLoading(false);
      }
    };

    initProfile();
  }, [init]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!actor || !isAuthenticated) {
        return;
      }

      try {
        // Fetch user details
        const userData = await actor.get_or_register_user();
        setUser({
          principal: userData.principal.toString(),
          username: userData.username?.[0] || "",
          email: userData.email?.[0] || "",
          created_at: dayjs(Number(userData.created_at) / 1000000).format(
            "MMMM D, YYYY"
          ),
        });

        // Fetch user sessions
        const sessionData = await actor.list_sessions();
        setSessions(
          sessionData.map(([id, title, created_at]) => ({
            id,
            title: title?.[0] || "Untitled Chat",
            created_at: dayjs(Number(created_at) / 1000000).format(
              "MMMM D, YYYY"
            ),
            messages: [],
          }))
        );

        // Fetch documents
        const documentIds = await actor.list_documents();
        const fetchedDocuments = [];
        for (const docId of documentIds) {
          const docContentResult = await actor.get_document(docId);
          // Handle opt text (Candid returns an array: [string] or [])
          const docContent = Array.isArray(docContentResult) && docContentResult.length > 0 ? docContentResult[0] : null;
          if (docContent && typeof docContent === "string") {
            fetchedDocuments.push({
              id: docId,
              content: docContent,
              name: `Document_${docId.replace("doc_", "")}.pdf`,
              created_at: dayjs().format("MMMM D, YYYY"), // Update if backend provides
            });
          } else {
            console.warn(`Document ${docId} has no valid content:`, docContentResult);
          }
        }
        setDocuments(fetchedDocuments);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data. Please try again.");
      }
      setLoading(false);
    };

    fetchProfileData();
  }, [actor, isAuthenticated]);

  const handleUpdateProfile = async (updatedFields) => {
    try {
      const username = updatedFields.username.trim()
        ? [updatedFields.username.trim()]
        : [];
      const email = updatedFields.email.trim() ? [updatedFields.email.trim()] : [];
      await actor.update_profile(username, email);
      setUser((prev) => ({
        ...prev,
        username: updatedFields.username,
        email: updatedFields.email,
      }));
      setError(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-900 p-8 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-dots.png')] opacity-10"></div>
            <h1 className="text-4xl font-extrabold text-white flex items-center relative z-10">
              <User className="w-10 h-10 mr-4" />
              Your Profile
            </h1>
            <p className="text-indigo-100 mt-3 text-base relative z-10">
              Manage your account, review your chats, and download your documents with ease.
            </p>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center items-center">
              <div className="flex space-x-3">
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse"></div>
                <div
                  className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 text-lg font-medium">{error}</div>
          ) : (
            <div className="p-8 space-y-12">
              <UserDetails user={user} onUpdate={handleUpdateProfile} error={error} />
              <SessionList sessions={sessions} />
              <DocumentList documents={documents} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;