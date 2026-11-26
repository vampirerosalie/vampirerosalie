const art = (scene) => `/battle16/art/${scene}.webp`;

export const HERO_ART = art("entrance");

// Each choice depicts a real event. The teacher assesses how the team uses it
// to support the paragraph, so the browser never receives an answer flag.
function scene(id, caption) {
  return { id, image: art(id), caption };
}

const memories = {
  enrolment: scene("enrolment", "Pendaftaran di IKM"),
  clearing: scene("clearing", "Di belakang bangunan IKM"),
  gathering: scene("gathering-grass", "Mengangkut rumput bersama pelatih"),
  poem: scene("poem", "Persembahan pada malam suai kenal"),
  promise: scene("promise", "Janji Pak Yusuf di bengkel"),
  football: scene("football", "Perlawanan di IKM Alor Setar"),
  forgiveness: scene("forgiveness", "Pertemuan terakhir dengan Suhaili"),
  examination: scene("examination", "Tugasan rak buku di IKM"),
  building: scene("building", "Pembinaan bengkel di kampung"),
  parting: scene("parting", "Perpisahan dengan Razali"),
  rest: scene("rest", "Minum petang selepas suai kenal"),
};

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
          { speaker: "Zahar", text: "Suhaili tertanya-tanya apa masa depan saya jika saya belajar di IKM." },
          { speaker: "Zahar", text: "Kalau pilihan kamu dipandang rendah, adakah kamu akan mengubah rancangan kamu?" },
        ],
        prompt: "Huraikan nilai kegigihan dalam diri Zahar. Sertakan satu contoh peristiwa.",
        choices: [memories.poem, memories.enrolment],
        hint: "Nyatakan nilai dahulu. Kemudian jelaskan cabaran yang dihadapi oleh Zahar dan pilihannya.",
      },
      {
        number: 2,
        title: "Kerjasama",
        opening: art("orientation"),
        dialogue: [
          { speaker: "Ramli", text: "Zahar, ingatkah kamu akan minggu pertama kita di IKM?" },
          { speaker: "Zahar", text: "Ingat, Ramli. Baru berkenalan, kita sudah diberi tugas bersama. Cuba kenang peristiwanya." },
        ],
        prompt: "Huraikan nilai kerjasama semasa minggu suai kenal di IKM. Sertakan satu contoh peristiwa.",
        choices: [memories.clearing, memories.building],
        hint: "Nyatakan nilai. Sebutkan siapa yang terlibat, apa yang mereka lakukan dan tempatnya.",
      },
      {
        number: 3,
        title: "Kasih sayang",
        opening: art("at-the-bench"),
        dialogue: [
          { speaker: "Pak Yusuf", text: "Zahar, banyak yang bermain di fikiran kamu sejak kamu mendapat tawaran itu." },
          { speaker: "Zahar", text: "Saya teringat akan adik-adik di rumah, pak cik. Siapakah yang akan membantu mereka?" },
        ],
        prompt: "Huraikan nilai kasih sayang Pak Yusuf terhadap keluarga Zahar. Sertakan satu contoh peristiwa.",
        choices: [memories.rest, memories.promise],
        hint: "Nyatakan nilai. Jelaskan bantuan yang dijanjikan serta orang yang akan menerimanya.",
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
        opening: art("arrival"),
        dialogue: [
          { speaker: "Zahar", text: "Di hadapan saya, terbentang jalan menuju cita-cita saya. Bukan semua orang yakin akan pilihan saya." },
          { speaker: "Pak Yusuf", text: "Kamu sendiri yang akan menentukan langkah seterusnya, Zahar." },
        ],
        prompt: "Jelaskan pengajaran tentang usaha untuk mencapai cita-cita. Buktikan dengan satu peristiwa.",
        choices: [memories.enrolment, memories.parting],
        hint: "Mulakan dengan “Kita hendaklah…”. Susuli pengajaran itu dengan tindakan Zahar.",
      },
      {
        number: 2,
        title: "Memaafkan kesalahan",
        opening: art("apology"),
        dialogue: [
          { speaker: "Suhaili", text: "Zahar, saya masih ingat kata-kata saya dahulu. Saya menyesal kerana melukakan hati awak." },
          { speaker: "Zahar", text: "Saya dengar, Suhaili. Perbualan ini penting sebelum saya pulang." },
        ],
        prompt: "Jelaskan pengajaran tentang sikap memaafkan kesalahan orang lain. Sertakan satu contoh peristiwa.",
        choices: [memories.parting, memories.forgiveness],
        hint: "Nyatakan apa yang kita patut lakukan. Terangkan siapa yang dimaafkan dan kesalahannya.",
      },
      {
        number: 3,
        title: "Bekerjasama",
        opening: art("gathering-grass"),
        dialogue: [
          { speaker: "Norimi", text: "Banyak lagi rumput yang perlu diangkut. Mujurlah ramai yang turun membantu." },
          { speaker: "Zahar", text: "Betul, Norimi. Ada yang memotong rumput, ada pula yang mengangkutnya." },
        ],
        prompt: "Jelaskan pengajaran tentang bekerjasama untuk menyelesaikan tugas. Sertakan satu contoh peristiwa.",
        choices: [memories.gathering, memories.poem],
        hint: "Tulis pengajaran dahulu. Ceritakan satu tugas yang diselesaikan bersama-sama.",
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
          { speaker: "Pak Yusuf", text: "Lihatlah bengkel kamu sekarang, Zahar. Masih ingat akan langkah pertama kamu?" },
          { speaker: "Zahar", text: "Dahulu, ada yang memandang rendah pilihan saya. Saya teringat hari saya mendaftar di IKM." },
        ],
        prompt: "Huraikan persoalan kegigihan dalam mencapai cita-cita walaupun menghadapi halangan. Berikan satu contoh peristiwa.",
        choices: [memories.football, memories.enrolment],
        hint: "Mulakan dengan “Persoalannya ialah…”. Kaitkan cabaran Zahar dengan usaha yang diteruskannya.",
      },
      {
        number: 2,
        title: "Kerajinan menuntut ilmu",
        opening: art("preparation"),
        dialogue: [
          { speaker: "Cikgu Baharum", text: "Peperiksaan asas semakin hampir. Bagaimanakah persediaan kamu, Zahar?" },
          { speaker: "Zahar", text: "Saya perlu membahagikan masa, cikgu. Masih banyak kemahiran yang perlu saya kuasai." },
        ],
        prompt: "Huraikan persoalan kerajinan dalam menuntut ilmu untuk mencapai kejayaan. Berikan satu contoh peristiwa.",
        choices: [memories.examination, memories.rest],
        hint: "Nyatakan persoalan dahulu. Kemudian huraikan persediaan Zahar untuk menghadapi peperiksaan.",
      },
      {
        number: 3,
        title: "Kerjasama menyelesaikan tugas",
        opening: art("rest"),
        dialogue: [
          { speaker: "Ramli", text: "Sekarang barulah dapat berehat. Banyak juga kerja yang kita siapkan hari ini!" },
          { speaker: "Zahar", text: "Mari ingat semula kerja kita tadi. Apakah persoalan yang timbul daripada peristiwa itu?" },
        ],
        prompt: "Huraikan persoalan kerjasama dalam menyelesaikan sesuatu tugas. Berikan satu contoh peristiwa.",
        choices: [memories.poem, memories.clearing],
        hint: "Nyatakan perkara yang diketengahkan oleh pengarang. Sokong dengan tindakan watak yang sesuai.",
      },
    ],
  },
};
