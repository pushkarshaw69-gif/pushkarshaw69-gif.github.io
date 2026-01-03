import { auth, db } from "./firebase.js";
import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, query, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

let links = [];
let editId = null;
let deleteId = null;
let user = null;

/* ELEMENTS */
const linkForm = document.getElementById("linkForm");
const linkList = document.getElementById("linkList");
const confirmBox = document.getElementById("confirmBox");
const editOverlay = document.getElementById("editOverlay");

const toggleForm = document.getElementById("toggleForm");
const saveLinkBtn = document.getElementById("saveLink");

const sortNameBtn = document.getElementById("sortName");
const sortTypeBtn = document.getElementById("sortType");

const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

/* 🔒 HARD LOCK POPUPS ON LOAD */
window.addEventListener("DOMContentLoaded", () => {
  editOverlay.classList.add("hidden");
  confirmBox.classList.add("hidden");
});

/* AUTH */
onAuthStateChanged(auth, u => {
  if (!u) location.href = "index.html";
  user = u;
  loadLinks();
});

/* ADD */
toggleForm.onclick = () => linkForm.classList.toggle("hidden");

saveLinkBtn.onclick = async () => {
  await addDoc(collection(db, "links"), {
    uid: user.uid,
    type: type.value,
    name: name.value,
    desc: desc.value
  });

  linkForm.classList.add("hidden");
  type.value = name.value = desc.value = "";
};

/* LOAD */
function loadLinks() {
  const q = query(collection(db, "links"), where("uid", "==", user.uid));
  onSnapshot(q, snap => {
    links = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    render(links);
  });
}

/* RENDER (NO INLINE JS) */
function render(list) {
  linkList.innerHTML = "";

  list.forEach(l => {
    const row = document.createElement("div");
    row.className = "link-row";

    row.innerHTML = `
      <div class="link-text">
        <span>${l.type}</span>
        <span>${l.name}</span>
        <span>${l.desc}</span>
      </div>
      <div class="link-actions">
        <button class="edit-btn">✏️</button>
        <button class="del-btn">🗑️</button>
      </div>
    `;

    row.querySelector(".edit-btn").onclick = () => openEdit(l.id);
    row.querySelector(".del-btn").onclick = () => askDelete(l.id);

    linkList.appendChild(row);
  });
}

/* SORT */
sortNameBtn.onclick = () =>
  render([...links].sort((a,b)=>a.name.localeCompare(b.name)));

sortTypeBtn.onclick = () =>
  render([...links].sort((a,b)=>a.type.localeCompare(b.type)));

/* EDIT */
function openEdit(id) {
  const l = links.find(x => x.id === id);
  editId = id;

  editType.value = l.type;
  editName.value = l.name;
  editDesc.value = l.desc;

  editOverlay.classList.remove("hidden");
}

saveEditBtn.onclick = async () => {
  if (!editId) return;

  await updateDoc(doc(db, "links", editId), {
    type: editType.value,
    name: editName.value,
    desc: editDesc.value
  });

  closeEdit();
};

cancelEditBtn.onclick = closeEdit;

function closeEdit() {
  editId = null;
  editOverlay.classList.add("hidden");
}

/* DELETE */
function askDelete(id) {
  deleteId = id;
  confirmBox.classList.remove("hidden");
}

confirmDeleteBtn.onclick = async () => {
  await deleteDoc(doc(db, "links", deleteId));
  closeConfirm();
};

cancelDeleteBtn.onclick = closeConfirm;

function closeConfirm() {
  deleteId = null;
  confirmBox.classList.add("hidden");
}
