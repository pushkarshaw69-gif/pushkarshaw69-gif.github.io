import { auth, db } from "./firebase.js";
import {
  collection, addDoc, deleteDoc, updateDoc,
  doc, query, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

let links = [];
let editId = null;
let deleteId = null;
let user = null;

const linkForm = document.getElementById("linkForm");
const linkList = document.getElementById("linkList");
const confirmBox = document.getElementById("confirmBox");
const editOverlay = document.getElementById("editOverlay");

toggleForm.onclick = () => linkForm.classList.toggle("hidden");

onAuthStateChanged(auth, u => {
  if (!u) location.href = "index.html";
  user = u;
  loadLinks();
});

window.addLink = async () => {
  await addDoc(collection(db, "links"), {
    uid: user.uid,
    type: type.value,
    name: name.value,
    desc: desc.value
  });

  linkForm.classList.add("hidden");
  type.value = name.value = desc.value = "";
};

function loadLinks() {
  const q = query(collection(db, "links"), where("uid", "==", user.uid));
  onSnapshot(q, snap => {
    links = [];
    snap.forEach(d => links.push({ id: d.id, ...d.data() }));
    render(links);
  });
}

function render(list) {
  linkList.innerHTML = "";
  list.forEach(l => {
    linkList.innerHTML += `
      <div class="link-row">
        <div class="link-text">
          <span>${l.type}</span>
          <span>${l.name}</span>
          <span>${l.desc}</span>
        </div>
        <div class="link-actions">
          <button onclick="openEdit('${l.id}')">✏️</button>
          <button onclick="askDelete('${l.id}')">🗑️</button>
        </div>
      </div>
    `;
  });
}

/* SORT */
window.sortByName = () =>
  render([...links].sort((a,b)=>a.name.localeCompare(b.name)));

window.sortByType = () =>
  render([...links].sort((a,b)=>a.type.localeCompare(b.type)));

/* EDIT */
window.openEdit = id => {
  const l = links.find(x => x.id === id);
  editId = id;

  editType.value = l.type;
  editName.value = l.name;
  editDesc.value = l.desc;

  editOverlay.classList.remove("hidden");
};

window.saveEdit = async () => {
  await updateDoc(doc(db, "links", editId), {
    type: editType.value,
    name: editName.value,
    desc: editDesc.value
  });
  closeEdit();
};

window.closeEdit = () => {
  editId = null;
  editOverlay.classList.add("hidden");
};

/* DELETE */
window.askDelete = id => {
  deleteId = id;
  confirmBox.classList.remove("hidden");
};

window.confirmDelete = async () => {
  await deleteDoc(doc(db, "links", deleteId));
  closeConfirm();
};

window.closeConfirm = () => {
  deleteId = null;
  confirmBox.classList.add("hidden");
};
