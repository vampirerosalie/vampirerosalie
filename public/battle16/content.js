const art = (scene) => `/battle16/art/${scene}.webp`;

export const HERO_ART = art("entrance");
export const CONTENT_EDITION = 2;

// Each choice depicts a real event. The teacher assesses how the team uses it
// to support the paragraph, so the browser never receives an answer flag.
function scene(id, caption) {
  return { id, image: art(id), caption };
}

export const EXERCISES = {
  nilai: {
    title: "Latihan 1",
    label: "3 nilai murni",
    cover: art("promise"),
    stations: [
      {
        number: 1,
        title: "Kegigihan",
        opening: art("at-the-cafe"),
        dialogue: [
          { speaker: "Suhaili", text: "Awak betul-betul yakin dengan pilihan awak, Zahar?" },
          { speaker: "Zahar", text: "Awak boleh meraguinya, Suhaili. Saya tahu apa yang saya mahu." },
        ],
        prompt: "Selepas Suhaili memperlekehkan pilihannya, apakah tindakan Zahar yang membuktikan kegigihannya untuk belajar di IKM? Huraikan nilai itu dengan satu peristiwa.",
        choices: [
          scene("course-letter", "Zahar menerima surat IKM daripada Mak Kiah."),
          scene("enrolment", "Zahar menyerahkan dokumen kepada petugas IKM."),
        ],
        hint: "Nyatakan nilai, kemudian jelaskan tindakan Zahar walaupun pilihannya dipersoalkan.",
      },
      {
        number: 2,
        title: "Kerjasama",
        opening: art("orientation"),
        dialogue: [
          { speaker: "Ramli", text: "Masa mula-mula sampai di sini, nama kawan sebilik pun aku belum ingat." },
          { speaker: "Zahar", text: "Aku pun begitu, Ramli. Tak lama kemudian, kita sudah pandai membahagikan kerja." },
        ],
        prompt: "Huraikan nilai kerjasama yang ditunjukkan oleh pelatih IKM semasa minggu suai kenal. Pilih kegiatan yang benar-benar berlaku pada minggu itu.",
        choices: [
          scene("clearing", "Pelatih IKM mengurus kawasan di belakang bangunan."),
          scene("match-refreshments", "Pelatih IKM mengurus jamuan di tepi padang."),
        ],
        hint: "Nyatakan nilai. Sebutkan siapa yang terlibat, apa yang mereka lakukan dan tempatnya.",
      },
      {
        number: 3,
        title: "Kasih sayang",
        opening: art("at-the-bench"),
        dialogue: [
          { speaker: "Pak Yusuf", text: "Dari tadi kamu diam saja, Zahar. Apa yang merisaukan kamu?" },
          { speaker: "Zahar", text: "Banyak yang akan berubah kalau saya pergi, pak cik. Saya terfikir tentang orang di rumah." },
        ],
        prompt: "Kedua-dua peristiwa menunjukkan Pak Yusuf menyokong Zahar. Bantuan manakah yang meringankan tanggungan keluarga ketika Zahar hendak belajar di IKM? Huraikan nilai kasih sayang itu.",
        choices: [
          scene("workshop-funds", "Pak Yusuf berbincang dengan Zahar sambil meneliti anggaran belanja."),
          scene("promise", "Pak Yusuf berbincang dengan Zahar selepas Zahar pulang dari Alor Setar."),
        ],
        hint: "Nyatakan nilai, penerima bantuan dan perkara yang hendak ditanggung oleh Pak Yusuf.",
      },
    ],
  },
  pengajaran: {
    title: "Latihan 2",
    label: "3 pengajaran",
    cover: art("forgiveness"),
    stations: [
      {
        number: 1,
        title: "Gigih berusaha",
        opening: art("at-the-bench"),
        dialogue: [
          { speaker: "Pak Yusuf", text: "Enam bulan di Kamunting, tentu macam-macam yang kamu fikirkan tentang masa depan." },
          { speaker: "Zahar", text: "Betul, pak cik. Ada beberapa pilihan di sana. Saya kena ingat tujuan asal saya." },
        ],
        prompt: "Masa depan Zahar di kilang dibincangkan lebih daripada sekali. Jelaskan pengajaran tentang kegigihan melalui keputusan yang diambilnya apabila latihan industri tamat.",
        choices: [
          scene("factory-offer", "Zahar berbincang tentang pekerjaan dengan Miss Ooi."),
          scene("factory-conversation", "Zahar berbincang tentang pekerjaan dengan Suhaili."),
        ],
        hint: "Mulakan dengan “Kita hendaklah…”. Terangkan pilihan yang ada dan cita-cita yang ingin dicapai oleh Zahar.",
      },
      {
        number: 2,
        title: "Memaafkan kesalahan",
        opening: art("apology"),
        dialogue: [
          { speaker: "Suhaili", text: "Zahar, sejak kita bertemu semula di Kamunting, ada sesuatu yang saya ingin katakan." },
          { speaker: "Zahar", text: "Cakaplah, Suhaili. Saya sedia mendengarnya." },
        ],
        prompt: "Zahar dan Suhaili beberapa kali berbual di Kamunting. Pertemuan manakah yang memperlihatkan bahawa Zahar sudah memaafkan Suhaili? Jelaskan pengajarannya.",
        choices: [
          scene("factory-conversation", "Zahar dan Suhaili berbual di dalam pejabat."),
          scene("forgiveness", "Zahar dan Suhaili berbual di luar bangunan."),
        ],
        hint: "Nyatakan apa yang kita patut lakukan. Terangkan siapa yang dimaafkan dan kesalahannya.",
      },
      {
        number: 3,
        title: "Bekerjasama",
        opening: art("orientation"),
        dialogue: [
          { speaker: "Norimi", text: "Zahar, kadang-kadang orang yang menikmati hasil sesuatu kerja pun tak kenal orang yang mengusahakannya." },
          { speaker: "Zahar", text: "Betul, Norimi. Yang penting, setiap orang sanggup menyumbangkan tenaga." },
        ],
        prompt: "Kedua-dua peristiwa melibatkan gotong-royong. Yang manakah berkaitan dengan keperluan tempat tinggal pelatih pada masa hadapan? Jelaskan pengajaran melalui peristiwa itu.",
        choices: [
          scene("building", "Zahar dan rakan-rakan mengangkut kayu di tapak kerja."),
          scene("gathering-grass", "Zahar dan rakan-rakan mengangkut rumput di tapak kerja."),
        ],
        hint: "Nyatakan pengajaran, kemudian jelaskan siapa yang bekerjasama dan tujuan kerja mereka.",
      },
    ],
  },
  persoalan: {
    title: "Latihan 3",
    label: "3 persoalan",
    cover: art("preparation"),
    stations: [
      {
        number: 1,
        title: "Kegigihan mencapai cita-cita",
        opening: art("workshop"),
        dialogue: [
          { speaker: "Pak Yusuf", text: "Dahulu ramai yang tertanya-tanya ke mana pilihan kamu akan membawa kamu, Zahar." },
          { speaker: "Zahar", text: "Waktu itu saya pun belum tahu bagaimana akhirnya, pak cik. Tapi saya tetap mahu mencuba." },
        ],
        prompt: "Suhaili pernah meragui masa depan Zahar dalam bidang perabot. Peristiwa di tempat kerja manakah yang membuktikan bahawa cita-cita asalnya akhirnya tercapai? Huraikan persoalan kegigihan itu.",
        choices: [
          scene("workshop-trainees", "Zahar menunjukkan cara kerja kepada tiga orang pelatih."),
          scene("factory-production", "Zahar melihat cara kerja di bahagian pengeluaran."),
        ],
        hint: "Nyatakan persoalan, kemudian hubungkan peranan Zahar dalam peristiwa pilihan kamu dengan cita-citanya.",
      },
      {
        number: 2,
        title: "Kerajinan menuntut ilmu",
        opening: art("preparation"),
        dialogue: [
          { speaker: "Cikgu Baharum", text: "Hasil kerja yang kemas bermula sebelum kamu menyentuh alatan, Zahar." },
          { speaker: "Zahar", text: "Betul, cikgu. Kalau masa saya tidak teratur, susah hendak memberikan tumpuan." },
        ],
        prompt: "Zahar pernah mengetepikan kegiatan lain untuk menghadapi peperiksaan asas. Pilih tugasan yang disiapkannya pada peringkat itu dan huraikan persoalan kerajinan menuntut ilmu.",
        choices: [
          scene("cupboard-test", "Zahar menyiapkan sebuah almari dalam ujian amali."),
          scene("examination", "Zahar menyiapkan sebuah rak buku dalam ujian amali."),
        ],
        hint: "Nyatakan persoalan. Kemudian terangkan perubahan dalam rutin Zahar dan tugasan yang diberinya tumpuan.",
      },
      {
        number: 3,
        title: "Kerjasama menyelesaikan tugas",
        opening: art("rest"),
        dialogue: [
          { speaker: "Ramli", text: "Kerja kita cepat selesai apabila setiap orang tahu peranannya, Zahar." },
          { speaker: "Zahar", text: "Ya, Ramli. Suatu hari nanti, kalau ada pelatih belajar dengan aku pula, aku mahu mereka bekerja begitu juga." },
        ],
        prompt: "Dalam kedua-dua peristiwa, Zahar bekerja bersama pelatih. Huraikan persoalan kerjasama melalui peristiwa ketika Zahar sendiri masih seorang pelatih baharu.",
        choices: [
          scene("clearing", "Zahar dan sekumpulan pelatih bekerja dengan alatan di kawasan lapang."),
          scene("workshop-trainees", "Zahar dan sekumpulan pelatih bekerja dengan alatan di meja pertukangan."),
        ],
        hint: "Nyatakan persoalan. Jelaskan kedudukan Zahar dalam kumpulan itu dan tugas yang mereka lakukan.",
      },
    ],
  },
};
