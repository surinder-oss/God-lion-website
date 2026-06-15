/* ════════════════════════════════════════════════════════════════
   GOLD LION MORTGAGES — LEAD-GEN LAYER (behaviour)
   Powers: (a) lead-magnet capture forms, (b) exit-intent + scroll modal.
   The quiz has its own inline script in quiz.html.

   ── ACTIVATION (Surinderpal) ────────────────────────────────────
   Every capture form posts to LEAD_FORM_ENDPOINT_TO_CONFIGURE.
   Replace that string below with a real endpoint:
     • Pipedrive Web Form  → use its embed/POST URL, OR
     • Formspree           → https://formspree.io/f/XXXXXXXX
   Until a real endpoint is set, forms run in DEMO MODE: they do NOT
   send anywhere; they just show the thank-you state so the UX can be
   previewed safely. See website-lead-gen-buildout.md for full steps.
   ════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Live endpoint — Google Apps Script web app: logs to a Sheet, emails
  // Surinderpal instantly, and auto-replies to the lead. (See lead-capture.gs.)
  var LEAD_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx-ajOzcdMqLjn-Y_3i766BPBE2cMx3hc2NsMgn_I9ERztB3YpTdHsZKz7SGukc4RhkAQ/exec';
  // ▲▲▲ ─────────────────────────────────────────────────────────────── ▲▲▲

  var ENDPOINT_IS_LIVE =
    LEAD_FORM_ENDPOINT &&
    LEAD_FORM_ENDPOINT.indexOf('LEAD_FORM_ENDPOINT_TO_CONFIGURE') === -1 &&
    /^https?:\/\//.test(LEAD_FORM_ENDPOINT);

  /* ── Submit a capture form ──────────────────────────────────────
     Marked up as: <form class="lead-form" data-magnet="..."> with
     a sibling .lead-thanks block inside the same .lead-form-card. */
  function wireLeadForms() {
    var forms = document.querySelectorAll('form.lead-form');
    Array.prototype.forEach.call(forms, function (form) {
      // Point the form at the configured endpoint when live.
      if (ENDPOINT_IS_LIVE) { form.setAttribute('action', LEAD_FORM_ENDPOINT); }

      // Hidden honeypot — bots fill it, humans never see it; the server drops those.
      if (!form.querySelector('input[name="_gotcha"]')) {
        var hp = document.createElement('input');
        hp.type = 'text'; hp.name = '_gotcha'; hp.tabIndex = -1;
        hp.setAttribute('autocomplete', 'off'); hp.setAttribute('aria-hidden', 'true');
        hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;';
        form.appendChild(hp);
      }

      form.addEventListener('submit', function (e) {
        // Basic native validation first.
        if (!form.checkValidity()) { return; }

        var card    = form.closest('.lead-form-card') || form.parentNode;
        var fields  = form.querySelector('.lead-form-fields') || form;
        var thanks  = card.querySelector('.lead-thanks');

        function showThanks() {
          if (fields) { fields.classList.add('hidden'); }
          if (thanks) { thanks.classList.add('active'); }
        }

        if (!ENDPOINT_IS_LIVE) {
          // DEMO MODE — never navigate away, just preview the success UX.
          e.preventDefault();
          showThanks();
          return;
        }

        // LIVE MODE — post to the Google Apps Script endpoint. It returns no
        // CORS headers, so use mode:'no-cors' (fire-and-forget) and show the
        // thank-you as soon as the request completes. URL-encoded body so
        // Apps Script reads e.parameter cleanly; stamps the page it came from.
        e.preventDefault();
        var fd = new FormData(form);
        fd.append('page', location.pathname + location.search);
        var body = new URLSearchParams();
        fd.forEach(function (v, k) { body.append(k, v); });
        if (window.fetch) {
          fetch(LEAD_FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', body: body })
            .then(showThanks)
            .catch(showThanks);
        } else {
          showThanks();
        }
      });
    });
  }

  /* ── Exit-intent + scroll modal ─────────────────────────────────
     Shows once per browser session. Triggers on:
       • mouse leaving the top of the viewport (desktop exit-intent), or
       • scrolling past ~55% of the page (mobile-friendly fallback).
     Dismissed state is remembered for the session. */
  function wireExitModal() {
    var overlay = document.getElementById('leadModal');
    if (!overlay) { return; }

    var STORAGE_KEY = 'glmLeadModalSeen';
    var alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (err) {}
    if (alreadySeen) { return; }

    var opened = false;

    function openModal() {
      if (opened) { return; }
      opened = true;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (err) {}
      detach();
    }

    function closeModal() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    function onMouseOut(e) {
      // Fire only when the cursor genuinely exits via the top edge.
      if (e.clientY <= 0 && (!e.relatedTarget && !e.toElement)) { openModal(); }
    }
    function onScroll() {
      var scrolled = (window.scrollY + window.innerHeight) /
                     document.documentElement.scrollHeight;
      if (scrolled > 0.55) { openModal(); }
    }
    function onKey(e) { if (e.key === 'Escape') { closeModal(); } }

    function detach() {
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('scroll', onScroll);
    }

    // Don't pounce the instant the page loads — give a short grace period.
    setTimeout(function () {
      document.addEventListener('mouseout', onMouseOut);
      window.addEventListener('scroll', onScroll, { passive: true });
    }, 4000);

    document.addEventListener('keydown', onKey);

    // Wire close controls (button + click-outside).
    var closeBtns = overlay.querySelectorAll('[data-lead-close]');
    Array.prototype.forEach.call(closeBtns, function (btn) {
      btn.addEventListener('click', closeModal);
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { closeModal(); }
    });
  }

  function init() {
    wireLeadForms();
    wireExitModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
