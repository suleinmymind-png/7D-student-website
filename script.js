// Firebase configuration - ganti dengan milik kamu
const firebaseConfig = {
  apiKey: "AIzaSyDaCZT2gtDN45i9Hwza5qOJAYsCRviVcKA",
  authDomain: "pr-project-61a77.firebaseapp.com",
  projectId: "pr-project-61a77",
  storageBucket: "pr-project-61a77.firebasestorage.app",
  messagingSenderId: "916086754491",
  appId: "1:916086754491:web:b05accd75cf58604562d9e",
  measurementId: "G-8236Y1QXGC"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Array data PR lokal (kini juga di Firebase)
let dataPR = [];

// Fungsi untuk load data dari Firebase
async function loadDataFromFirebase() {
  dataPR = [];
  const snapshot = await getDocs(collection(db, "list_pr_kelas"));
  snapshot.forEach(doc => {
    dataPR.push({ id: parseInt(doc.id), ...doc.data() });
  });
  simpanDanTampilkan();
}

// Fungsi untuk simpan data ke Firebase
async function saveDataToFirebase() {
  // Hapus semua data lama
  const collectionRef = collection(db, "list_pr_kelas");
  const snapshot = await getDocs(collectionRef);
  snapshot.forEach(async (docSnap) => {
    await deleteDoc(doc(db, "list_pr_kelas", docSnap.id));
  });
  // Tambah semua data baru
  for (const pr of dataPR) {
    await addDoc(collectionRef, {
      mataPelajaran: pr.mataPelajaran,
      detail: pr.detail,
      jumlahSudah: pr.jumlahSudah
    });
  }
}

// Saat awal, load data dari Firebase
loadDataFromFirebase();

// 1. Fungsi tambahPR
function tambahPR() {
  const mapel = document.getElementById('mapel').value;
  const deskripsi = document.getElementById('deskripsi').value;

  if (mapel.trim() === "" || deskripsi.trim() === "") {
    alert("Mohon isi nama pelajaran dan detail tugasnya!");
    return;
  }

  const prBaru = {
    id: Date.now(),
    mataPelajaran: mapel,
    detail: deskripsi,
    jumlahSudah: 0
  };

  dataPR.push(prBaru);
  simpanDanTampilkan();
  saveDataToFirebase();

  document.getElementById('mapel').value = "";
  document.getElementById('deskripsi').value = "";
}

// 2. Fungsi tekanCeklis
async function tekanCeklis(idPR) {
  const pr = dataPR.find(item => item.id === idPR);
  if (pr) {
    pr.jumlahSudah += 1;
    if (pr.jumlahSudah >= MAKSIMAL_MURID) {
      alert(`Semua murid (${MAKSIMAL_MURID} orang) telah menyelesaikan PR ${pr.mataPelajaran}!`);
      dataPR = dataPR.filter(item => item.id !== idPR);
    }
    simpanDanTampilkan();
    await saveDataToFirebase();
  }
}

// 3. Fungsi tampilkan
function simpanDanTampilkan() {
  const kontainer = document.getElementById('daftar-pr');
  kontainer.innerHTML = "";

  if (dataPR.length === 0) {
    kontainer.innerHTML = "<p>Bebas tugas! Tidak ada PR aktif saat ini. 🎉</p>";
    return;
  }

  dataPR.forEach(pr => {
    kontainer.innerHTML += `
      <div class="pr-card">
        <h3>📚 ${pr.mataPelajaran}</h3>
        <p>${pr.detail}</p>
        <div style="margin-bottom: 12px;">
          <button onclick="tekanCeklis(${pr.id})">Selesai</button>
        </div>
        <small>Sudah: ${pr.jumlahSudah} / ${MAKSIMAL_MURID}</small>
      </div>
    `;
  });
}