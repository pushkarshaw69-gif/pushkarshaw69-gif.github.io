import { auth } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

/*
  SIMPLE ROUTE GUARD
  - Allows logged-in users
  - Redirects guests to index.html
*/

export function requireAuth(redirectTo = "index.html") {
  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.replace(redirectTo);
    }
  });
}
