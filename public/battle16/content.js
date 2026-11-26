const art = (scene) => `/battle16/art/${scene}.webp`;

export const HERO_ART = art("entrance");
export const CONTENT_EDITION = 3;

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
        prompt: "Suhaili memperlekehkan pilihan Zahar. Pilih gambar yang menunjukkan Zahar tetap meneruskan pilihannya selepas pertemuan itu. Huraikan nilai kegigihan dengan satu contoh peristiwa.",
        choices: [
          scene("course-letter", "Zahar menerima surat IKM daripada Mak Kiah."),
          scene("enrolment", "Zahar menyerahkan dokumen kepada petugas IKM."),
        ],
        hint: "Mulakan dengan “Nilai murni yang pertama ialah …”. Selepas “Sebagai contoh, …”, ceritakan tindakan Zahar ketika pilihannya dipersoalkan.",
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
        hint: "Mulakan dengan “Selain itu, nilai murni yang kedua ialah …”. Selepas “Sebagai contoh, …”, nyatakan siapa yang bekerjasama dan kerja yang mereka lakukan.",
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
        hint: "Mulakan dengan “Seterusnya, nilai murni yang ketiga ialah …”. Selepas “Sebagai contoh, …”, jelaskan bantuan Pak Yusuf dan siapa yang dibantunya.",
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
          { speaker: "Pak Yusuf", text: "Kamu nampak murung sejak pulang dari Alor Setar, Zahar. Ada orang meragui pilihan kamu?" },
          { speaker: "Zahar", text: "Ada, pak cik. Kata-katanya memang menyakitkan hati. Tapi saya masih ingat apa yang saya mahu capai." },
        ],
        prompt: "Kedua-dua gambar menunjukkan langkah Zahar ke arah cita-citanya. Pilih langkah yang diambilnya untuk memulakan pengajian selepas pilihannya dipandang rendah. Apakah pengajaran daripada peristiwa itu?",
        choices: [
          scene("workshop-funds", "Zahar dan Pak Yusuf meneliti dokumen di bengkel."),
          scene("enrolment", "Zahar dan Pak Yusuf mengurus dokumen di kaunter."),
        ],
        hint: "Mulakan dengan “Pengajaran yang pertama ialah kita hendaklah …”. Selepas “Sebagai contoh, …”, ceritakan keputusan Zahar dan cita-cita yang akhirnya dicapainya.",
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
        hint: "Mulakan dengan “Selain itu, pengajaran yang kedua ialah kita hendaklah …”. Selepas “Sebagai contoh, …”, nyatakan siapa yang dimaafkan oleh Zahar dan kesalahannya.",
      },
      {
        number: 3,
        title: "Bekerjasama",
        opening: art("orientation"),
        dialogue: [
          { speaker: "Norimi", text: "Zahar, kadang-kadang orang yang menikmati hasil sesuatu kerja pun tak kenal orang yang mengusahakannya." },
          { speaker: "Zahar", text: "Betul, Norimi. Yang penting, setiap orang sanggup menyumbangkan tenaga." },
        ],
        prompt: "Kedua-dua gambar menunjukkan gotong-royong. Pilih gambar yang berkaitan dengan tapak asrama pelatih. Jelaskan pengajaran dengan menceritakan kerja yang dilakukan bersama-sama.",
        choices: [
          scene("building", "Zahar dan rakan-rakan mengangkut kayu di tapak kerja."),
          scene("gathering-grass", "Zahar dan rakan-rakan mengangkut rumput di tapak kerja."),
        ],
        hint: "Mulakan dengan “Seterusnya, pengajaran yang ketiga ialah kita hendaklah …”. Selepas “Sebagai contoh, …”, nyatakan siapa yang bekerjasama, apa yang dilakukan dan di mana.",
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
        prompt: "Pilih gambar yang menunjukkan cita-cita Zahar akhirnya tercapai. Huraikan persoalan kegigihan melalui tindakan Zahar selepas Suhaili memperlekehkan pilihannya.",
        choices: [
          scene("workshop-trainees", "Zahar menunjukkan cara kerja kepada tiga orang pelatih."),
          scene("factory-production", "Zahar melihat cara kerja di bahagian pengeluaran."),
        ],
        hint: "Mulakan dengan “Persoalan yang pertama ialah …”. Selepas “Sebagai contoh, …”, kaitkan keputusan Zahar dengan kejayaan yang akhirnya dicapainya.",
      },
      {
        number: 2,
        title: "Kerajinan menuntut ilmu",
        opening: art("preparation"),
        dialogue: [
          { speaker: "Cikgu Baharum", text: "Hasil kerja yang kemas bermula sebelum kamu menyentuh alatan, Zahar." },
          { speaker: "Zahar", text: "Betul, cikgu. Kalau masa saya tidak teratur, susah hendak memberikan tumpuan." },
        ],
        prompt: "Pilih gambar tugasan Zahar dalam peperiksaan asas di IKM. Kemudian, huraikan persoalan kerajinan menuntut ilmu melalui cara Zahar membuat persediaan untuk peperiksaan.",
        choices: [
          scene("cupboard-test", "Zahar menyiapkan sebuah almari dalam ujian amali."),
          scene("examination", "Zahar menyiapkan sebuah rak buku dalam ujian amali."),
        ],
        hint: "Mulakan dengan “Selain itu, persoalan yang kedua ialah …”. Selepas “Sebagai contoh, …”, terangkan bagaimana Zahar belajar sebelum peperiksaan.",
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
        hint: "Mulakan dengan “Seterusnya, persoalan yang ketiga ialah …”. Selepas “Sebagai contoh, …”, nyatakan siapa yang bekerja bersama Zahar dan tugas yang mereka lakukan.",
      },
    ],
  },
};
