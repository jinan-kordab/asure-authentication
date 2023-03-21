import React, { useState } from "react";
import { AuthenticationContextProvider } from "./authContext";
import "./App.css";
import { PublicClientApplication } from "@azure/msal-browser";
import BiorhythmChart from "./BiorhythmChart";
import { TfiMicrosoftAlt } from "react-icons/tfi";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogout } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import UserCard from "./UserCard";
import GithubLogin from "react-github-login";
import { Octokit } from "@octokit/rest";
import WaveAnimation from "./WaveAnimation";

function App() {
  const initialState = {
    isAuthenticated: false,
    user: null,
    name: null,
    accessToken: null,
    signinprovider: null,
  };

  //State variables assignments to use in the app.
  const [birthdate, setBirthdate] = useState("");
  const [startdate, setStartdate] = useState("");
  const [enddate, setEnddate] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [authState, setAuthState] = useState(initialState);

  //The @react-oauth/google package is a client-side library that provides a React component for implementing a Google login flow in a web application using the OAuth 2.0 protocol.
  //When using this library, the authentication flow is handled by the Google API, specifically the Google OAuth 2.0 authentication protocol.
  //The @react-oauth / google package utilizes the following Google API endpoint for authentication: https://accounts.google.com/o/oauth2/v2/auth
  //This endpoint is used to initiate the OAuth 2.0 authorization flow, which allows the user to grant permission to the application to access their Google account.
  //Once the user has granted permission, the library uses another Google API endpoint to exchange the authorization code for an access token and a refresh token
  //https://oauth2.googleapis.com/token  This endpoint returns a JSON object containing the access token, refresh token, and other details related to the authorization.
  //The access token returned by this endpoint is a JWT(JSON Web Token)

  async function handleGoogleSignIn(credentialResponse) {
    const token = credentialResponse.credential; //This line declares a constant variable token and assigns it the value of credentialResponse.credential.
    const decoded = jwt_decode(token); //This line decodes the token variable using the jwt_decode function, which is a utility library for decoding JSON Web Tokens (JWTs). The decoded JWT token contains information about the user.
    setAuthState({
      isAuthenticated: true,
      user: decoded.name,
      name: decoded.email,
      accessToken: null,
      signinprovider: "Google",
    });
    setLoggedIn(true);
  }

  const handleGoogleSignOut = () => {
    googleLogout();
    setLoggedIn(false);
  };

  const handleGitHubSignOut = () => {
    setLoggedIn(false);
  };

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  const scopes = ["user.read", "openid", "profile"];
  const msalConfig = {
    auth: {
      clientId: "f01391ee-72aa-4d4a-a90a-00a4fba26bfc",
      authority: "https://login.microsoftonline.com/common",
      redirectUri: "https://biorhythmsapp.azurewebsites.net",
      //redirectUri: "http://localhost:3000",
    },
  };

  //This code initializes a new instance of the Microsoft Authentication Library (MSAL) with the provided configuration object msalConfig.
  //The PublicClientApplication class is used to create a new instance of MSAL for public client applications, which typically run in a web browser or a mobile app.
  //Once the msalInstance is created, it can be used to interact with the Azure Active Directory (Azure AD) to authenticate the user and obtain access tokens that
  //can be used to access protected resources such as APIs, on behalf of the user.
  //The msalInstance provides a set of methods to handle the authentication flow, such as loginRedirect() and loginPopup(), to get access tokens silently
  //or with a popup window, respectively.

  const msalInstance = new PublicClientApplication(msalConfig);

  const handleBirthDateDateChange = (event) => {
    setBirthdate(event.target.value);
  };
  const handleMonthDateDateChange = (event) => {
    let year_month = event.target.value;
    let month = year_month.slice(-2); // returns month

    let ye = event.target.value;
    let year = ye.substring(0, 4); //returns year

    setStartdate(year + "-" + month + "-1");
    setEnddate(year + "-" + month + "-" + getDaysInMonth(year, month));
  };

  //We are using Microsoft Azure Active Directory authentication scheme, which is commonly used for Microsoft online services such as Microsoft 365, Azure, and Dynamics CRM,
  //among others.We are using a tenant-independent endpoint, which can be used by any Azure AD tenant to authenticate users with a Microsoft account or an Azure AD account.
  //When a user attempts to log in using this URL, they are directed to the appropriate Azure AD tenant, based on their email domain or the tenant information provided in the request.
  const login = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: scopes,
        prompt: "select_account", // Force the user to select an account
        pkce: true, // Use PKCE to protect against authorization code interception attacks
      });

      //PKCE is a security feature introduced in OAuth 2.0 to prevent an attacker from intercepting and using an authorization code that is returned during the authorization flow.
      //PKCE does this by adding an additional layer of security to the authorization flow, by using a dynamically generated code challenge that is sent along with the authorization
      //request, and a code verifier that is used to validate the code challenge when the authorization code is returned.
      //By using PKCE, the MSAL library ensures that the authorization code that is returned during the authentication flow can only be used by
      //the intended client application, and cannot be intercepted and used by an attacker.
      //This helps to protect against certain types of attacks such as man -in -the - middle attacks and token replay attacks.

      // Update the authentication state with the user and access token
      setAuthState({
        isAuthenticated: true,
        user: loginResponse.account.username,
        name: loginResponse.account.name,
        accessToken: null, // Access token will be obtained on-demand with PKCE,
        signinprovider: "Microsoft",
      });
      setLoggedIn(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = async () => {
    try {
      await msalInstance.logoutPopup();
      setAuthState(initialState);
      setLoggedIn(false);
    } catch (err) {
      console.log(err);
    }
  };

  //Provided we have the token, this function gets github user details like name and repo URL, among others.
  const getUserDetails = async (authtoken) => {
    const octokit = new Octokit({
      auth: authtoken,
    });

    const { data } = await octokit.users.getAuthenticated();
    // handle user details
    setAuthState({
      isAuthenticated: true,
      user: data.login,
      name: data.url,
      accessToken: null,
      signinprovider: "GitHub",
    });
    setLoggedIn(true);
  };

  //We are using react-github-login package, where the authentication flow is handled by the GitHub API,
  //specifically the OAuth 2.0 authentication protocol. This package utilizes the following GitHub API endpoint for authentication:
  // /https://github.com/login/oauth/authorize  which sends us back "code" or Authorization code. Then we use that code to call
  // our serverless function in Azure to obtain a token : https://biorhythms1234.azurewebsites.net/api/token
  //After we get the token, we use this token to get the logged in successfully user's informtion: (getUserDetails function).

  const onGitHubSuccess = async (response) => {
    const code = response.code;
    const data = {
      code: response.code,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(data),
    };

    fetch("https://biorhythms1234.azurewebsites.net/api/token", options)
      .then((response) => response.text())
      .then((data) => getUserDetails(data))
      .catch((error) => console.error(error));
  };
  const onGitHubFailure = (response) => {
    console.log(response);
    // handle failed GitHub authentication
  };
  return (
    <GoogleOAuthProvider clientId="914589322607-87hhs972p6v65mk3n7itpotvev5dfkts.apps.googleusercontent.com">
      <AuthenticationContextProvider>
        <div className="App">
          {!loggedIn && (
            <div className="container">
              <div className="left-column">
                {/* <div class="example__background"></div> */}
                <WaveAnimation />
              </div>
              <div className="right-column">
                <div
                  style={{
                    position: "fixed",
                    top: "0",
                    width: "100%",
                    fontSize: "35px",
                  }}
                >
                  <h1 style={{ color: "#333333" }}>BIORHYTHMS</h1>
                </div>
                <div class="formLogin">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" />
                  </div>
                  <button class="regularBtn">
                    <span class="text">Login with email</span>
                  </button>
                  <button
                    // class="login-button-microsoft microsoft"
                    class="ms-login"
                    onClick={login}
                  >
                    <span class="icon">
                      <TfiMicrosoftAlt style={{ color: "lightblue" }} />
                    </span>
                    <span class="text">Continue with Microsoft</span>
                  </button>
                  <GoogleLogin
                    text="continue_with"
                    width="231"
                    theme="filled_blue"
                    shape="rectangular"
                    onSuccess={handleGoogleSignIn}
                    onError={() => {
                      console.log("Login Failed");
                    }}
                    scope="https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
                  />
                  <GithubLogin
                    className="githubBtn"
                    clientId="f26b2fd9fb46af5e35c8"
                    onSuccess={onGitHubSuccess}
                    onFailure={onGitHubFailure}
                    redirectUri="https://biorhythmsapp.azurewebsites.net/"
                  />
                </div>
              </div>
            </div>
          )}

          {loggedIn && (
            <main>
              <header className="header">
                <h1 className="header__title">BIORHYTHMS</h1>
                <nav className="header__nav">
                  <ul className="header__list">
                    <li className="header__item">
                      {authState.signinprovider == "Microsoft" && (
                        <button
                          onClick={handleLogout}
                          class="bsk-btn bsk-btn-default"
                        >
                          <span class="iconLogout">
                            <TfiMicrosoftAlt style={{ color: "lightblue" }} />
                          </span>
                          Sign out with Microsoft
                        </button>
                      )}
                      {authState.signinprovider == "Google" && (
                        <button
                          class="logout-with-google-btn"
                          onClick={handleGoogleSignOut}
                        >
                          Sign Out using Google
                        </button>
                      )}
                      {authState.signinprovider == "GitHub" && (
                        <button class="githubBtn" onClick={handleGitHubSignOut}>
                          Sign Out using GitHub
                        </button>
                      )}
                    </li>
                  </ul>
                </nav>
              </header>

              <section className="contact">
                <div className="containeri">
                  <div className="columni">
                    <div className="date-picker">
                      <label
                        htmlFor="date"
                        style={{
                          fontSize: "26px",
                          textAlign: "left",
                          marginRight: "220px",
                          marginTop: "0",
                        }}
                      >
                        Birthdate
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={birthdate}
                        onChange={handleBirthDateDateChange}
                      />
                    </div>
                  </div>
                  <div className="columni">
                    <div className="date-picker">
                      <label
                        htmlFor="month"
                        style={{
                          fontSize: "26px",
                          textAlign: "left",
                          marginRight: "220px",
                          marginTop: "0",
                        }}
                      >
                        Select a month
                      </label>
                      <input
                        type="month"
                        id="month"
                        name="month"
                        onChange={handleMonthDateDateChange}
                      ></input>
                    </div>
                  </div>
                  <div className="columni">
                    <div>
                      <UserCard user={authState} />
                    </div>
                  </div>
                </div>

                <BiorhythmChart
                  birthDate={birthdate}
                  startDate={startdate}
                  endDate={enddate}
                />
              </section>
            </main>
          )}
        </div>
      </AuthenticationContextProvider>
    </GoogleOAuthProvider>
  );
}
export default App;
