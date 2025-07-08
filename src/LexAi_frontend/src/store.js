import { create } from 'zustand';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/LexAi_backend';
import { canisterId } from 'declarations/LexAi_backend/index.js';

export const useUserStore = create((set) => ({
  principal: null,
  isAuthenticated: false,
  actor: null,
  authClient: null,
  userName: null,

  setPrincipal: (principal) => {
    console.log("📝 Setting principal:", principal);
    set({ principal });
  },

  setUserName: (userName) => {
    console.log("👤 Setting userName:", userName);
    set({ userName });
  },

  setIsAuthenticated: (isAuthenticated) => {
    console.log("🔑 Auth status changed:", isAuthenticated);
    set({ isAuthenticated });
  },

  init: async () => {
    console.log("⚙️ Initializing AuthClient and Actor...");
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const actor = createActor(canisterId, {
        agentOptions: { identity }
      });
      const isAuthenticated = await authClient.isAuthenticated();
      const principal = isAuthenticated ? identity.getPrincipal().toText() : null;

      console.log("✅ AuthClient created.");
      console.log("🔗 Principal:", principal);
      console.log("🔐 Authenticated?", isAuthenticated);

      set({
        actor,
        authClient,
        isAuthenticated,
        principal
      });
    } catch (error) {
      console.error("❌ Failed to initialize auth:", error);
    }
  },

  logout: async () => {
    const { authClient } = useUserStore.getState();
    if (!authClient) {
      console.warn("⚠️ No authClient to logout from.");
      return;
    }

    console.log("🔒 Logging out...");
    await authClient.logout();
    await useUserStore.getState().init();
    console.log("✅ Logout complete. State reset.");
  }
}));
