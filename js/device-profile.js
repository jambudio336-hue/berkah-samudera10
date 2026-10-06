const DeviceProfile = {
  bound: false,

  init() {
    const name = document.getElementById("settingVesselName");
    const id = document.getElementById("settingDeviceId");
    const sharing = document.getElementById("settingShareLiveLocation");
    if (name && !name.value) name.value = localStorage.getItem("bs10_vessel_name") || "Berkah Samudera 10";
    if (sharing) sharing.checked = localStorage.getItem("bs10_share_live_location") === "true";
    this.renderId(localStorage.getItem("bs10_device_id"));
    this.renderStatus();
    if (!sharing || this.bound) return;
    this.bound = true;

    sharing.addEventListener("change", async () => {
      const requested = sharing.checked;
      if (requested) {
        const shipName = (name && name.value.trim()) || localStorage.getItem("bs10_vessel_name") || "Berkah Samudera 10";
        const deviceId = localStorage.getItem("bs10_device_id") || "akan dibuat otomatis";
        const consent = window.confirm(
          "IZINKAN BERBAGI LOKASI KAPAL REAL-TIME?\n\n" +
          "Nama kapal: " + shipName + "\n" +
          "ID perangkat: " + deviceId + "\n\n" +
          "Saat aktif dan aplikasi berjalan, koordinat GPS presisi, nama kapal, ID perangkat, kecepatan, akurasi, haluan, dan waktu pembaruan akan terlihat di peta pengguna Berkah Samudera lain yang online. Lokasi memerlukan GPS dan internet. Tracking latar belakang Android hanya menyimpan GPS di perangkat dan tidak mengirimnya ke cloud.\n\n" +
          "Anda dapat menghentikan berbagi kapan saja. Aktifkan hanya jika pemilik kapal menyetujui publikasi lokasi."
        );
        if (!consent) {
          sharing.checked = false;
          this.renderStatus("Berbagi lokasi tidak diaktifkan.");
          return;
        }
      }

      localStorage.setItem("bs10_share_live_location", String(requested));
      sharing.disabled = true;
      this.renderStatus(requested ? "Membuat profil aman dan mengaktifkan lokasi…" : "Menghentikan berbagi lokasi…");
      try {
        if (typeof SupabaseSync === "undefined") throw new Error("Modul profil belum siap");
        await SupabaseSync.setShareLiveLocation(requested);
        this.renderId(SupabaseSync.deviceId);
        this.renderStatus(requested ? "Berbagi GPS aktif selama aplikasi berjalan • kapal dan ID terlihat oleh pengguna lain." : (navigator.onLine ? "Lokasi berhenti dibagikan. Posisi publik dihapus." : "GPS berhenti dikirim di perangkat; pencabutan posisi cloud menunggu koneksi."));
        this.renderMapStatus();
      } catch (_) {
        if (requested) {
          localStorage.setItem("bs10_share_live_location", "false");
          sharing.checked = false;
          this.renderStatus("Berbagi lokasi gagal diaktifkan; GPS tetap privat. Coba lagi saat online.");
        } else {
          localStorage.setItem("bs10_share_live_location", "false");
          sharing.checked = false;
          this.renderStatus("GPS berhenti dikirim di perangkat; pembaruan penghapusan cloud akan dicoba saat online.");
        }
      } finally {
        sharing.disabled = false;
      }
    });
  },

  renderId(value) {
    const field = document.getElementById("settingDeviceId");
    const id = value || (typeof SupabaseSync !== "undefined" && SupabaseSync.deviceId) || localStorage.getItem("bs10_device_id");
    if (field) field.value = id || "Dibuat otomatis saat tersambung internet";
    const mapId = document.getElementById("mapDeviceId");
    if (mapId) mapId.textContent = id || "menunggu ID perangkat";
  },

  renderStatus(message) {
    const status = document.getElementById("deviceProfileStatus");
    if (status) status.textContent = message || (navigator.onLine ? "Profil dibuat otomatis tanpa email, kata sandi, atau form login." : "Offline • ID profil otomatis dibuat saat internet tersedia.");
  },

  renderMapStatus() {
    const status = document.getElementById("sharedVesselStatus");
    if (!status) return;
    status.textContent = localStorage.getItem("bs10_share_live_location") === "true"
      ? "Lokasi Anda dibagikan saat aplikasi aktif • kapal lain dengan izin aktif tampil di peta."
      : "Anda dapat melihat kapal yang berbagi; posisi kapal Anda sendiri tetap privat.";
  },

  async saveVesselName() {
    const field = document.getElementById("settingVesselName");
    const name = String(field && field.value || "Berkah Samudera 10").trim().slice(0, 60) || "Berkah Samudera 10";
    localStorage.setItem("bs10_vessel_name", name);
    if (typeof SupabaseSync === "undefined") return;
    try {
      await SupabaseSync.init();
      if (SupabaseSync.client && SupabaseSync.userId) {
        const id = await SupabaseSync.updateProfile(name);
        this.renderId(id);
        this.renderStatus("Nama kapal tersimpan pada profil anonim perangkat.");
      }
    } catch (_) {
      this.renderStatus("Nama tersimpan lokal; profil online diperbarui saat koneksi tersedia.");
    }
  }
};
