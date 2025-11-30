import { SiteConfig } from './types';

export const DEFAULT_CONFIG: SiteConfig = {
  identity: {
    name: "Partai Harapan Masa Depan",
    logoUrl: "https://via.placeholder.com/150/2563eb/ffffff?text=PHMD",
    tagline: "Membangun Negeri, Menata Hati",
  },
  header: {
    backgroundColor: "#ffffff",
    textColor: "#111827",
    hoverColor: "#2563eb",
    isSticky: true,
  },
  footer: {
    backgroundColor: "#111827",
    textColor: "#ffffff",
    description: "Jadilah bagian dari perubahan. Daftarkan diri Anda sebagai relawan atau anggota.",
    copyrightText: "All rights reserved.",
  },
  registration: {
    enabled: true,
    buttonText: "Daftar Sekarang",
    url: "#contact",
    buttonColor: "#2563eb",
    buttonTextColor: "#ffffff",
  },
  theme: {
    primaryColor: "#2563eb", // blue-600
    secondaryColor: "#1e40af", // blue-800
    buttonColor: "#2563eb",
    buttonHoverColor: "#1e40af",
    fontFamily: "Poppins",
    rounded: "xl",
  },
  hero: {
    title: "Bersama Kita Wujudkan Perubahan Nyata",
    subtitle: "Bergabunglah dengan gerakan kami untuk menciptakan masyarakat yang adil, makmur, dan berteknologi maju.",
    imageUrl: "https://picsum.photos/1920/1080?random=1",
    images: ["https://picsum.photos/1920/1080?random=1"],
    ctaText: "Bergabung Sekarang",
    ctaButtonColor: "#2563eb",
    ctaButtonTextColor: "#ffffff",
    ctaButtonLink: "#contact",
    secondaryButtonText: "Pelajari Lebih Lanjut",
    secondaryButtonColor: "transparent",
    secondaryButtonTextColor: "#111827",
    secondaryButtonLink: "#about",
    backgroundColor: "#ffffff",
    textColor: "#111827",
  },
  about: {
    title: "Tentang Kami",
    content: "Kami adalah organisasi yang berdedikasi untuk memberdayakan masyarakat melalui pendidikan, inovasi teknologi, dan solidaritas sosial. Didirikan pada tahun 2024, kami percaya bahwa kekuatan komunitas adalah kunci keberhasilan bangsa.",
    imageUrl: "https://picsum.photos/800/600?random=2",
    backgroundColor: "#f9fafb", // gray-50
    textColor: "#111827",
  },
  contact: {
    address: "Jl. Merdeka No. 45, Jakarta Pusat, Indonesia",
    email: "info@partaiharapan.id",
    phone: "+62 812 3456 7890",
  },
  socialMedia: [
    { id: "1", platform: "Facebook", url: "https://facebook.com" },
    { id: "2", platform: "Twitter", url: "https://twitter.com" },
    { id: "3", platform: "Instagram", url: "https://instagram.com" },
  ],
  teamBackgroundColor: "#ffffff",
  teamTextColor: "#111827",
  teamTitleColor: "#111827",
  team: [
    {
      id: "1",
      name: "Dr. Budi Santoso",
      role: "Ketua Umum",
      photoUrl: "https://picsum.photos/200/200?random=10",
      description: "Dr. Budi memiliki pengalaman lebih dari 20 tahun dalam bidang kebijakan publik dan pengabdian masyarakat. Beliau lulusan S3 Ilmu Politik dari universitas terkemuka."
    },
    {
      id: "2",
      name: "Siti Aminah, M.Kom",
      role: "Sekretaris Jenderal",
      photoUrl: "https://picsum.photos/200/200?random=11",
      description: "Siti Aminah adalah pakar teknologi yang berfokus pada digitalisasi organisasi modern."
    },
    {
      id: "3",
      name: "Rahmat Hidayat",
      role: "Bendahara",
      photoUrl: "https://picsum.photos/200/200?random=12",
      description: "Profesional di bidang keuangan dengan sertifikasi CFA dan pengalaman di berbagai perusahaan multinasional."
    },
    {
      id: "4",
      name: "Andi Wijaya",
      role: "Ketua Bidang Pemuda",
      photoUrl: "https://picsum.photos/200/200?random=13",
      description: "Aktivis muda yang vokal menyuarakan hak-hak generasi milenial dan gen-z."
    },
  ],
  newsBackgroundColor: "#f9fafb",
  newsTextColor: "#111827",
  newsTitleColor: "#111827",
  aboutTitleColor: "#111827",
  sectionTitles: {
    structure: 'Struktur Organisasi',
    news: 'Berita & Kegiatan'
  },
  mediaQuotes: [],
  news: [
    {
      id: "101",
      title: "Kegiatan Bakti Sosial di Desa Sukamaju",
      date: "2023-10-15",
      content: "Tim kami turun langsung ke lapangan untuk membagikan sembako dan memberikan layanan kesehatan gratis bagi warga. Antusiasme warga sangat tinggi menyambut program ini.",
      imageUrl: "https://picsum.photos/600/400?random=20",
    },
    {
      id: "102",
      title: "Seminar Teknologi untuk Pemuda",
      date: "2023-11-01",
      content: "Membekali generasi muda dengan kemampuan coding dan AI agar siap menghadapi tantangan global. Acara ini dihadiri oleh 500 peserta dari berbagai daerah.",
      imageUrl: "https://picsum.photos/600/400?random=21",
    },
    {
      id: "103",
      title: "Rapat Kerja Nasional 2024",
      date: "2024-01-20",
      content: "Merumuskan strategi pemenangan dan program kerja tahunan untuk kesejahteraan anggota. Fokus utama tahun ini adalah ekspansi ke daerah terpencil.",
      imageUrl: "https://picsum.photos/600/400?random=22",
    },
  ],
};