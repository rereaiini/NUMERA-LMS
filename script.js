// --- DATABASE LOKAL (MOCKUP) ---
const materiData = [
    { id: 1, judul: "Pengantar Akuntansi", desc: "Memahami persamaan dasar Harta = Utang + Modal.", konten: "Akuntansi adalah sistem informasi...", kuis: { tanya: "Apa rumus dasar akuntansi?", opsi: ["A. Harta = Utang + Modal", "B. Harta = Utang - Modal", "C. Modal = Harta + Utang"], benar: 0 } },
    { id: 2, judul: "Jurnal Umum", desc: "Aturan pencatatan Debit dan Kredit.", konten: "Jurnal umum digunakan untuk...", kuis: { tanya: "Saldo normal akun Kas adalah...", opsi: ["A. Kredit", "B. Debit", "C. Tidak memiliki saldo"], benar: 1 } },
];

// Inisialisasi Data User di LocalStorage
if (!localStorage.getItem('numera_data')) {
    localStorage.setItem('numera_data', JSON.stringify({
        email: 'siswa@numera.com',
        pass: '123',
        nama: 'Budi (Siswa)',
        progress: { 1: false, 2: false }, // ID Materi : Status Selesai
        nilai: { 1: 0, 2: 0 } // ID Materi : Nilai Kuis
    }));
}

let currentUser = null;
let currentMateri = null;
let myChart = null; // Variable untuk Chart.js

// --- FUNGSI NAVIGASI ---
function navigate(viewId) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    // Trigger khusus saat buka halaman tertentu
    if(viewId === 'dashboard') loadDashboard();
    if(viewId === 'materi-list') renderMateriList();
    if(viewId === 'rapor') renderRapor();
}

// --- FUNGSI LOGIN / LOGOUT ---
function login() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const db = JSON.parse(localStorage.getItem('numera_data'));

    if (email === db.email && pass === db.pass) {
        currentUser = db;
        document.getElementById('nav-login').classList.add('hidden');
        document.getElementById('nav-dashboard').classList.remove('hidden');
        document.getElementById('nav-logout').classList.remove('hidden');
        navigate('dashboard');
    } else {
        document.getElementById('login-error').innerText = "Email atau Password salah!";
    }
}

function logout() {
    currentUser = null;
    document.getElementById('nav-login').classList.remove('hidden');
    document.getElementById('nav-dashboard').classList.add('hidden');
    document.getElementById('nav-logout').classList.add('hidden');
    navigate('landing');
}

// --- FUNGSI DASHBOARD ---
function loadDashboard() {
    document.getElementById('user-name').innerText = currentUser.nama;
    
    const db = JSON.parse(localStorage.getItem('numera_data'));
    let selesai = Object.values(db.progress).filter(Boolean).length;
    let total = materiData.length;
    let persen = (selesai / total) * 100;
    
    document.getElementById('dash-progress').style.width = persen + '%';
    document.getElementById('dash-progress-text').innerText = `${selesai} dari ${total} Modul Selesai (${persen}%)`;

    let totalNilai = Object.values(db.nilai).reduce((a, b) => a + b, 0);
    document.getElementById('dash-nilai').innerText = totalNilai > 0 ? (totalNilai / total).toFixed(1) : "0";
}

// --- FUNGSI MATERI ---
function renderMateriList() {
    const container = document.getElementById('materi-container');
    const db = JSON.parse(localStorage.getItem('numera_data'));
    container.innerHTML = '';

    materiData.forEach(m => {
        let isDone = db.progress[m.id];
        let card = document.createElement('div');
        card.className = `card ${isDone ? 'border-pink' : 'border-blue'}`;
        card.innerHTML = `
            <h3 class="text-blue">${m.judul}</h3>
            <p style="margin: 10px 0; color: #64748b;">${m.desc}</p>
            <span style="font-size: 12px; font-weight: bold; color: ${isDone ? 'var(--pink)' : 'var(--blue)'}">${isDone ? '✔ Selesai' : '⏳ Belum Selesai'}</span><br>
            <button class="btn btn-primary mt-4" onclick="bukaMateri(${m.id})">Buka Modul</button>
        `;
        container.appendChild(card);
    });
}

function bukaMateri(id) {
    currentMateri = materiData.find(m => m.id === id);
    document.getElementById('detail-judul').innerText = currentMateri.judul;
    document.getElementById('detail-konten').innerHTML = `<p>${currentMateri.konten}</p>`;
    navigate('materi-detail');
}

function tandaiSelesai() {
    const db = JSON.parse(localStorage.getItem('numera_data'));
    db.progress[currentMateri.id] = true;
    localStorage.setItem('numera_data', JSON.stringify(db));
    alert("Kerja bagus! Modul ditandai selesai.");
    navigate('materi-list');
}

// --- FUNGSI KUIS ---
function mulaiKuis() {
    document.getElementById('kuis-judul').innerText = currentMateri.judul;
    const q = currentMateri.kuis;
    let html = `<p style="font-weight:600; margin-bottom:15px;">${q.tanya}</p>`;
    q.opsi.forEach((o, i) => {
        html += `<label class="kuis-opsi"><input type="radio" name="jawaban" value="${i}"> ${o}</label>`;
    });
    document.getElementById('kuis-pertanyaan').innerHTML = html;
    navigate('kuis');
}

function submitKuis() {
    const terpilih = document.querySelector('input[name="jawaban"]:checked');
    if (!terpilih) return alert("Pilih jawaban dulu!");

    const jawabanIdx = parseInt(terpilih.value);
    const benar = currentMateri.kuis.benar;
    const nilai = (jawabanIdx === benar) ? 100 : 0;

    const db = JSON.parse(localStorage.getItem('numera_data'));
    db.nilai[currentMateri.id] = nilai;
    localStorage.setItem('numera_data', JSON.stringify(db));

    alert(nilai === 100 ? "Benar! Nilai Anda 100." : "Salah! Nilai Anda 0.");
    navigate('dashboard');
}

// --- FUNGSI RAPOR & GRAFIK ---
function renderRapor() {
    const db = JSON.parse(localStorage.getItem('numera_data'));
    const tbody = document.getElementById('tabel-nilai');
    tbody.innerHTML = '';
    
    let labels = [];
    let dataNilai = [];

    materiData.forEach(m => {
        let n = db.nilai[m.id];
        labels.push(m.judul);
        dataNilai.push(n);

        tbody.innerHTML += `
            <tr>
                <td>${m.judul}</td>
                <td><b class="text-blue">${n}</b></td>
                <td>${db.progress[m.id] ? '<span class="text-pink">Selesai</span>' : 'Belum'}</td>
            </tr>
        `;
    });

    // Render Grafik Chart.js
    const ctx = document.getElementById('nilaiChart').getContext('2d');
    if(myChart) myChart.destroy(); // Hapus grafik lama jika ada
    
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nilai Kuis',
                data: dataNilai,
                backgroundColor: '#ec4899', // Pink
                borderRadius: 5
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}