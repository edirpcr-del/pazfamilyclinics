/* ============================================================
   PAZ Family Clinics — custom post-hydration layer
   Waits for React hydration to COMPLETE, then applies fixes.
   ============================================================ */
(function () {
  var WHATSAPP = "923005479663";
  var EMAIL = "info@pazfamilyclinics.com";

  /* ---------- Helpers ---------- */
  function isAppointment()   { return location.pathname.indexOf("/patients/appointment") !== -1; }
  function isFindDoctor()    { return location.pathname.indexOf("/patients/find-a-doctor") !== -1; }
  function isSuccessStories(){ return location.pathname.indexOf("/patients/success-stories") !== -1; }
  function isHome()          { return location.pathname === "/" || location.pathname === "/index.html"; }

  function getDoctorParam() {
    try { return new URLSearchParams(location.search).get("doctor"); }
    catch (e) { return null; }
  }

  function val(form, id) {
    var el = form.querySelector("#" + id);
    return el ? String(el.value || "").trim() : "";
  }

  /* ---------- WhatsApp message builder ---------- */
  function buildAppointmentMsg(form) {
    var lines = ["New Appointment Request — PAZ Family Clinics", "-----------------------------------------"];
    var doctor = val(form, "doctor");
    if (doctor) lines.push("Doctor: " + doctor);
    lines.push("");
    [["name","Patient Name"],["phone","Phone"],["date","Preferred Date"],
     ["time","Preferred Time"],["reason","Reason for Visit"],["notes","Additional Notes"]
    ].forEach(function (p) {
      var v = val(form, p[0]);
      if (v) lines.push(p[1] + ": " + v);
    });
    return lines.join("\n");
  }
  function openWhatsApp(msg) {
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank");
  }
  function openEmail(msg) {
    location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Appointment Request — PAZ Family Clinics") + "&body=" + encodeURIComponent(msg);
  }
  function send(msg) { try { openWhatsApp(msg); } catch (e) { openEmail(msg); } }

  /* ---------- Gynecologist appointment check ---------- */
  function isGynAppt(form) {
    if (getDoctorParam() === "gynecologist") return true;
    var sel = form.querySelector("#doctor");
    if (!sel) return false;
    var opt = sel.options[sel.selectedIndex];
    if (!opt) return false;
    return (opt.value || "").toLowerCase() === "gynecologist" || (opt.textContent || "").toLowerCase().indexOf("gynecologist") !== -1;
  }

  /* ---------- WhatsApp event listeners (document-level, safe) ---------- */
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form || form.tagName !== "FORM") return;
    if (!isAppointment()) return;
    if (!isGynAppt(form)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    send(buildAppointmentMsg(form));
  }, true);

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var btn = t.closest("button");
    if (!btn) return;
    if ((btn.textContent || "").indexOf("Send via WhatsApp") === -1) return;
    var form = btn.closest("form");
    if (!form) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    send(buildAppointmentMsg(form));
  }, true);

  /* ---------- Gyn option in dropdown ---------- */
  function ensureGynOption() {
    if (!isAppointment()) return;
    var sel = document.querySelector('select[id="doctor"]');
    if (!sel) return;
    if (!sel.querySelector("[data-paz-gyn-opt]")) {
      var o = document.createElement("option");
      o.value = "Gynecologist";
      o.setAttribute("data-paz-gyn-opt", "1");
      o.textContent = "Gynecologist — Women’s Health";
      sel.appendChild(o);
    }
    if (getDoctorParam() === "gynecologist") {
      for (var i = 0; i < sel.options.length; i++) {
        if ((sel.options[i].value || "").toLowerCase() === "gynecologist") { sel.selectedIndex = i; break; }
      }
    }
  }

  /* ---------- Doctors grid lookup ---------- */
  function findDoctorsGrid() {
    var grids = document.querySelectorAll("main div.grid");
    for (var i = 0; i < grids.length; i++) {
      var arts = grids[i].querySelectorAll("article");
      if (arts.length >= 2 && arts.length < 5 && !grids[i].querySelectorAll("li.card-hairline").length) return grids[i];
    }
    return null;
  }
  function gynCardHTML() {
    return '<div class="flex items-center gap-4">' +
        '<span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7 text-primary"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>' +
        '</span>' +
        '<div>' +
          '<h3 class="text-lg font-semibold">Gynecologist</h3>' +
          '<p class="text-xs text-gold-ink">MBBS, FCPS (Obstetrics &amp; Gynecology)</p>' +
          '<p class="text-sm text-muted-foreground">Women’s Health</p>' +
        '</div>' +
      '</div>' +
      '<ul class="mt-4 flex flex-wrap gap-2"><li class="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-primary">Gynecology</li><li class="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-primary">Women’s Health</li></ul>' +
      '<p class="mt-4 text-sm leading-relaxed text-foreground/80">Our dedicated female gynecologist provides comprehensive women’s health care in a comfortable, private environment. She is experienced with routine gynecological check-ups, prenatal and postnatal care, menstrual and hormonal concerns, and confidential consultations.</p>' +
      '<div class="mt-6 pt-2 flex flex-wrap gap-3">' +
        '<a href="https://wa.me/923005479663?text=' + encodeURIComponent("Assalam o Alaikum, I would like to book a gynecology appointment with the female gynecologist at PAZ Family Clinics.") + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/85 h-10 px-5 py-2">Book on WhatsApp</a>' +
        '<a href="/patients/appointment?doctor=gynecologist" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-5 py-2">Book an appointment</a>' +
      '</div>';
  }

  /* ---------- Find-a-Doctor page ---------- */
  function ensureGynCard() {
    if (!isFindDoctor()) return;
    var grid = findDoctorsGrid();
    if (!grid || grid.querySelector("[data-paz-gyn-card]")) return;
    var a = document.createElement("article");
    a.setAttribute("data-paz-gyn-card", "1");
    a.className = "card-hairline flex flex-col rounded-2xl p-6";
    a.innerHTML = gynCardHTML();
    grid.appendChild(a);
  }
  function ensureGynFilter() {
    if (!isFindDoctor()) return;
    var g = document.querySelector('[role="group"][aria-label="Filter by specialty"]');
    if (!g || g.querySelector("[data-paz-gyn-filter]")) return;
    var b = document.createElement("button");
    b.setAttribute("data-paz-gyn-filter", "1");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.className = "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors bg-card text-primary hover:bg-accent";
    b.textContent = "Gynecology";
    g.appendChild(b);
  }

  /* ---------- Home page ---------- */
  function ensureHomeGynService() {
    if (!isHome()) return;
    var lists = document.querySelectorAll("main ul.mt-8.grid");
    var servicesList = null;
    for (var i = 0; i < lists.length; i++) {
      if (lists[i].querySelectorAll("li.card-hairline").length >= 6 && !lists[i].querySelectorAll("article").length) {
        servicesList = lists[i]; break;
      }
    }
    if (!servicesList || servicesList.querySelector("[data-paz-home-gyn-service]")) return;
    var li = document.createElement("li");
    li.setAttribute("data-paz-home-gyn-service", "1");
    li.className = "card-hairline rounded-2xl p-6";
    li.innerHTML =
      '<span class="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart h-5 w-5 text-primary"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' +
      '</span>' +
      '<h3 class="mt-4 text-lg font-semibold">Gynecology</h3>' +
      '<p class="mt-2 text-sm leading-relaxed text-foreground/80">Comprehensive women’s health services with a dedicated female gynecologist — routine check-ups, prenatal care, and confidential consultations.</p>';
    servicesList.appendChild(li);
  }
  function ensureHomeGynDoctor() {
    if (!isHome()) return;
    var grid = findDoctorsGrid();
    if (!grid || grid.querySelector("[data-paz-home-gyn-doc]")) return;
    var a = document.createElement("article");
    a.setAttribute("data-paz-home-gyn-doc", "1");
    a.className = "card-hairline flex flex-col rounded-2xl p-6";
    a.innerHTML = gynCardHTML();
    grid.appendChild(a);
  }

  /* ---------- Footer + sub-nav cleanup ---------- */
  function hideFooterBrandText() {
    var footer = document.querySelector("footer");
    if (!footer) return;
    Array.prototype.forEach.call(footer.querySelectorAll("p"), function (p) {
      if (p.textContent.trim() === "PAZ Family Clinics") p.style.display = "none";
    });
  }
  function removeSuccessStoriesLinks() {
    var sub = document.querySelector('nav[aria-label="Patient and families sections"]');
    if (sub) Array.prototype.forEach.call(sub.querySelectorAll("a"), function (a) {
      if (a.textContent.trim() === "Success Stories") a.remove();
    });
    var footer = document.querySelector("footer");
    if (footer) Array.prototype.forEach.call(footer.querySelectorAll("nav a"), function (a) {
      if (a.textContent.trim() === "Patient Success Stories") a.remove();
    });
  }
  function hideFakeReviews() {
    if (!isSuccessStories()) return;
    var s = document.querySelector('section[aria-labelledby="stories-heading"]');
    if (s) s.style.display = "none";
  }
  function homePageCleanup() {
    if (!isHome()) return;
    var hero = document.querySelector("main > section:first-child img[src*='paz-logo']");
    if (hero) hero.style.display = "none";
    var stories = document.querySelector('section[aria-labelledby="stories-heading"]');
    if (stories) stories.style.display = "none";
  }

  /* ---------- Run all fixes ---------- */
  function run() {
    try { ensureGynOption(); }         catch (e) {}
    try { ensureGynCard(); }           catch (e) {}
    try { ensureGynFilter(); }         catch (e) {}
    try { ensureHomeGynService(); }    catch (e) {}
    try { ensureHomeGynDoctor(); }     catch (e) {}
    try { hideFooterBrandText(); }     catch (e) {}
    try { removeSuccessStoriesLinks(); } catch (e) {}
    try { hideFakeReviews(); }         catch (e) {}
    try { homePageCleanup(); }         catch (e) {}
  }

  /* ================================================================
     THE KEY FIX: Wait for React hydration to finish, then run.
     React removes __REACT_DEVTOOLS_GLOBAL_HOOK__ after hydration, but
     simpler: we wait until the DOM is stable (no mutations for 500ms).
     ================================================================ */
  var observer, debounceTimer, mutationCount = 0;
  function onMutations() {
    mutationCount++;
    clearTimeout(debounceTimer);
    // If DOM stops changing for 500ms, hydration is finished
    debounceTimer = setTimeout(function () {
      observer.disconnect();
      run();
      // Reconnect to catch future route changes (SPA navigation)
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      observer = new MutationObserver(onMutations);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      // Also run once after a delay in case there are no mutations
      setTimeout(function () { try { observer.disconnect(); } catch(e){} run(); }, 2000);
    });
  } else {
    observer = new MutationObserver(onMutations);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { try { observer.disconnect(); } catch(e){} run(); }, 2000);
  }
})();