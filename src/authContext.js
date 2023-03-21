import React, { useState, useEffect, createContext } from "react";
import { PublicClientApplication } from "@azure/msal-browser";

// Define the scopes that your application needs access to
const scopes = ["user.read", "openid", "profile"];

// Define the configuration options for the MSAL client
const msalConfig = {
  auth: {
    clientId: "f01391ee-72aa-4d4a-a90a-00a4fba26bfc",
    redirectUri: "https://biorhythmsapp.azurewebsites.net", // Or your production URL
    //redirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "localStorage",
  },
};

// Initialize the MSAL client with the configuration options
const msalInstance = new PublicClientApplication(msalConfig);

// Define the initial state of the AuthenticationContext
const initialState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
};

// Create the AuthenticationContext using the createContext API
export const AuthenticationContext = createContext(initialState);

// Define the AuthenticationContextProvider component
export const AuthenticationContextProvider = ({ children }) => {
  // Use the useState hook to manage the authentication state
  const [authState, setAuthState] = useState(initialState);

  // Use the useEffect hook to initialize the authentication state when the component mounts
  useEffect(() => {
    // Check if the user is already authenticated
    const account = msalInstance.getAllAccounts()[0];
    if (account) {
      setAuthState({
        isAuthenticated: true,
        user: account.username,
        accessToken: null, // Access token will be obtained on-demand with PKCE
      });
    }
  }, []);

  // Define the login function, which initiates the OAuth 2.0 authorization code flow with PKCE
  const login = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: scopes,
        prompt: "select_account", // Force the user to select an account
        pkce: true, // Use PKCE to protect against authorization code interception attacks
      });

      // Update the authentication state with the user and access token
      setAuthState({
        isAuthenticated: true,
        user: loginResponse.account.username,
        accessToken: null, // Access token will be obtained on-demand with PKCE
      });
    } catch (err) {
      console.log(err);
    }
  };

  // Define the logout function, which clears the authentication state and signs the user out of all accounts
  const logout = async () => {
    try {
      console.log("LOGGING OUT");
      await msalInstance.logoutPopup();
      setAuthState(initialState);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AuthenticationContext.Provider
      value={{ ...authState, login, logout, msalInstance }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
