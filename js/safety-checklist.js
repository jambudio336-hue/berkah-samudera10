(() => {
  "use strict";

  const SafetyChecklist = {
    checks: [],
    activeDay: "",
    dayKey() {
      const now = new Date();
      const localDay = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
      return { day: localDay, key: `bs10_safety_checklist_${localDay}` };
    },
    read() {
      const { day, key } = this.dayKey();
      this.activeDay = day;
      try {
        const value = JSON.parse(localStorage.getItem(key) || "{}");
        return value && typeof value === "object" ? value : {};
      } catch (_) {
        return {};
      }
    },
    save() {
      const { day, key } = this.dayKey();
      const values = Object.fromEntries(this.checks.map((input) => [input.dataset.safetyCheck, input.checked]));
      try {
        localStorage.setItem(key, JSON.stringify(values));
        this.activeDay = day;
        this.render();
      } catch (_) {
        const message = document.getElementById("safetyMessage");
        if (message) message.textContent = "Penyimpanan lokal penuh atau tidak tersedia; checklist belum tersimpan.";
      }
    },
    render() {
      const checked = this.checks.filter((input) => input.checked).length;
      const total = this.checks.length;
      const counter = document.getElementById("safetyCounter");
      const message = document.getElementById("safetyMessage");
      if (counter) counter.textContent = `${checked}/${total} selesai`;
      if (message) {
        if (checked === total && total > 0) message.textContent = "Semua item dicentang hari ini. Ini bukan jaminan kapal bebas bahaya; ikuti prosedur keselamatan resmi.";
        else if (checked > 0) message.textContent = `${checked} dari ${total} item selesai hari ini. Selesaikan pemeriksaan sebelum berangkat.`;
        else message.textContent = "Checklist belum dimulai. Pemeriksaan ini tidak menggantikan prosedur keselamatan resmi.";
      }
    },
    loadDay() {
      const values = this.read();
      this.checks.forEach((input) => { input.checked = values[input.dataset.safetyCheck] === true; });
      this.render();
    },
    init() {
      this.checks = [...document.querySelectorAll("[data-safety-check]")];
      if (!this.checks.length) return;
      this.checks.forEach((input) => input.addEventListener("change", () => this.save()));
      document.getElementById("btnSafetyReset")?.addEventListener("click", () => {
        const { key } = this.dayKey();
        try { localStorage.removeItem(key); } catch (_) {}
        this.checks.forEach((input) => { input.checked = false; });
        this.render();
      });
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && this.dayKey().day !== this.activeDay) this.loadDay();
      });
      this.loadDay();
    }
  };

  window.SafetyChecklist = SafetyChecklist;
})();
