import React, {  useEffect } from 'react';
import { useUserStore } from '../store';

const network = import.meta.env.DFX_NETWORK || "local";
const identityProvider =
  network === "ic"
    ? "https://identity.ic0.app"
    : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`;

const Button = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300"
  >
    {children}
  </button>
);

const LoginButton = () => {
  const { actor, isAuthenticated, init, principal, logout, authClient, setUserName } = useUserStore();

  useEffect(() => {
    console.log("🔄 useEffect running - calling init()");
    init();
  }, []);

  const login = async () => {
    console.log("🔐 Starting login flow...");
    if (!authClient) {
      console.error("❌ authClient is null!");
      return;
    }

    await authClient.login({
      identityProvider,
      onSuccess: async () => {
        console.log("✅ Login successful, reinitializing...");
        await init();

        const current = useUserStore.getState();
        console.log("🔎 Authenticated?", current.isAuthenticated);
        console.log("👤 Principal:", current.principal);

        if (current.isAuthenticated) {
          const user = await registerOrGetUser(current.actor);
          console.log("👤 User from backend:", user);
          console.log("👤 Username:", user ? user.username[0] : "Anonymous");
          setUserName(user ? user.username[0] : "Anonymous");
        } else {
          console.warn("⚠️ Still not authenticated after login.");
        }
      }
    });
  };

  const Logout = async () => {
    console.log("🚪 Logging out...");
    await logout();
    console.log("✅ Logged out.");
  };

  const registerOrGetUser = async (actor) => {
    if (!actor) {
      console.error("❌ Actor is null. Can't call get_or_register_user.");
      return;
    }

    try {
      console.log("📞 Calling get_or_register_user...");
      const result = await actor.get_or_register_user();

      console.log("✅ User registered/fetched:", result);
      return result;
    } catch (err) {
      console.error("❌ Error calling get_or_register_user:", err);
    }
  };

  return (
    <div className="flex gap-4 flex-wrap mb-6">
      {isAuthenticated ? (
        <Button onClick={Logout}>Logout</Button>
      ) : (
        <Button onClick={login}>Login with Internet Identity</Button>
      )}
    </div>
  );
};

export default LoginButton;
