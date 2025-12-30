import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const IMGBB_API = "YOUR_IMGBB_API_KEY";

onAuthStateChanged(auth, user => {
  if (!user) window.location = "index.html";
  loadImages();
});

window.uploadImage = () => {
  const file = imgFile.files[0];
  if (!file) return alert("Select an image");

  const form = new FormData();
  form.append("image", file);

  fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API}`, {
    method: "POST",
    body: form
  })
  .then(res => res.json())
  .then(data => {
    addDoc(collection(db, "images"), {
      uid: auth.currentUser.uid,
      url: data.data.url
    });
  });
};

function loadImages() {
  const q = query(collection(db, "images"), where("uid", "==", auth.currentUser.uid));
  onSnapshot(q, snap => {
    imageGallery.innerHTML = "";
    snap.forEach(doc => {
      imageGallery.innerHTML += `<img src="${doc.data().url}">`;
    });
  });
}