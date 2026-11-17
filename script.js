document.addEventListener("DOMContentLoaded", () => {
  const SUPPORTED_LANGS = ["en", "uk", "ru"];
  const translations = window.TS_I18N || {};

  function detectInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (urlLang && SUPPORTED_LANGS.includes(urlLang.toLowerCase())) {
      return urlLang.toLowerCase();
    }
    try {
      const saved = localStorage.getItem("ts_lang");
      if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
    } catch (_) {}
    const navLang = (navigator.language || "en").toLowerCase();
    if (navLang.startsWith("uk")) return "uk";
    if (navLang.startsWith("ru")) return "ru";
    return "en";
  }

  let currentLang = detectInitialLang();
  let activePresetKey = "rain";
  let activeShowcaseKey = "turrets";

  function t(key, fallback = "") {
    const dict = translations[currentLang] || translations.en || {};
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    const enDict = translations.en || {};
    if (Object.prototype.hasOwnProperty.call(enDict, key)) return enDict[key];
    return fallback;
  }

  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const compareRange = document.getElementById("compare-range");
  const beforeWrap = document.getElementById("compare-before-wrap");
  const divider = document.getElementById("compare-divider");
  const beforeImg = document.getElementById("compare-before-img");
  const afterImg = document.getElementById("compare-after-img");
  const beforeVideo = document.getElementById("compare-before-video");
  const afterVideo = document.getElementById("compare-after-video");
  const labelLeft = document.getElementById("compare-label-left");
  const labelRight = document.getElementById("compare-label-right");

  const presets = {
    rain: {
      beforeImg: "assets/screenshots/vanilla-sandbox.jpg",
      afterImg: "assets/screenshots/shader-rain.jpg",
      beforeVideo: "assets/videos/Default.mp4",
      afterVideo: "assets/videos/Rainny.mp4",
      leftKey: "compare.leftVanilla",
      rightKey: "compare.rightRain",
    },
    snow: {
      beforeImg: "assets/screenshots/vanilla-sandbox.jpg",
      afterImg: "assets/screenshots/shader-snow.jpg",
      beforeVideo: "assets/videos/Default.mp4",
      afterVideo: "assets/videos/Snowy.mp4",
      leftKey: "compare.leftVanilla",
      rightKey: "compare.rightSnow",
    },
    weather: {
      beforeImg: "assets/screenshots/shader-sunny.jpg",
      afterImg: "assets/screenshots/shader-snow.jpg",
      beforeVideo: null,
      afterVideo: null,
      leftKey: "compare.leftSunny",
      rightKey: "compare.rightSnow",
    },
  };

  function bindMediaWithFallback(videoEl, imgEl, videoSrc, imgSrc) {
    if (!imgEl) return;
    imgEl.src = imgSrc;

    if (!videoEl || !videoSrc) {
      if (videoEl) videoEl.classList.add("is-hidden");
      imgEl.classList.remove("is-hidden");
      return;
    }

    videoEl.poster = imgSrc;
    videoEl.classList.remove("is-hidden");
    imgEl.classList.add("is-hidden");

    const sourceEl = videoEl.querySelector("source");
    if (sourceEl) {
      sourceEl.src = videoSrc;
    } else {
      videoEl.src = videoSrc;
    }

    const fallbackToImg = () => {
      videoEl.classList.add("is-hidden");
      imgEl.classList.remove("is-hidden");
    };

    if (sourceEl) {
      sourceEl.onerror = fallbackToImg;
    }
    videoEl.onerror = fallbackToImg;
    videoEl.load();
    videoEl.play().catch(() => {});
  }

  if (beforeVideo && afterVideo) {
    beforeVideo.addEventListener("timeupdate", () => {
      if (
        !beforeVideo.classList.contains("is-hidden") &&
        !afterVideo.classList.contains("is-hidden") &&
        Math.abs(beforeVideo.currentTime - afterVideo.currentTime) > 0.12
      ) {
        afterVideo.currentTime = beforeVideo.currentTime;
      }
    });
  }

  function updateSlider(val) {
    const pct = Math.max(0, Math.min(100, Number(val)));
    if (beforeWrap) beforeWrap.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    if (divider) divider.style.left = `${pct}%`;
  }

  if (compareRange) {
    updateSlider(compareRange.value);
    compareRange.addEventListener("input", (e) => updateSlider(e.target.value));
    bindMediaWithFallback(
      beforeVideo,
      beforeImg,
      presets.rain.beforeVideo,
      presets.rain.beforeImg,
    );
    bindMediaWithFallback(
      afterVideo,
      afterImg,
      presets.rain.afterVideo,
      presets.rain.afterImg,
    );
  }

  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = presets[btn.dataset.preset];
      if (!preset) return;
      activePresetKey = btn.dataset.preset;

      document.querySelectorAll(".preset-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      bindMediaWithFallback(
        beforeVideo,
        beforeImg,
        preset.beforeVideo,
        preset.beforeImg,
      );
      bindMediaWithFallback(
        afterVideo,
        afterImg,
        preset.afterVideo,
        preset.afterImg,
      );
      if (labelLeft) labelLeft.textContent = t(preset.leftKey);
      if (labelRight) labelRight.textContent = t(preset.rightKey);

      if (compareRange) {
        compareRange.value = "50";
        updateSlider(50);
      }
    });
  });

  const showcaseData = {
    turrets: {
      img: "assets/screenshots/app-turrets.jpg",
      captionKey: "showcase.turretsCaption",
      tagKey: "showcase.turretsTag",
      titleKey: "showcase.turretsTitle",
      descKey: "showcase.turretsDesc",
    },
    hulls: {
      img: "assets/screenshots/app-hulls.jpg",
      captionKey: "showcase.hullsCaption",
      tagKey: "showcase.hullsTag",
      titleKey: "showcase.hullsTitle",
      descKey: "showcase.hullsDesc",
    },
    paints: {
      img: "assets/screenshots/app-paints.jpg",
      captionKey: "showcase.paintsCaption",
      tagKey: "showcase.paintsTag",
      titleKey: "showcase.paintsTitle",
      descKey: "showcase.paintsDesc",
    },
    shots: {
      img: "assets/screenshots/app-shots.jpg",
      captionKey: "showcase.shotsCaption",
      tagKey: "showcase.shotsTag",
      titleKey: "showcase.shotsTitle",
      descKey: "showcase.shotsDesc",
      placeholderTitleKey: "showcase.shotsPlaceholderTitle",
      placeholderDescKey: "showcase.shotsPlaceholderDesc",
    },
    editors: {
      img: "assets/screenshots/app-editors.png",
      captionKey: "showcase.editorsCaption",
      tagKey: "showcase.editorsTag",
      titleKey: "showcase.editorsTitle",
      descKey: "showcase.editorsDesc",
      placeholderTitleKey: "showcase.editorsPlaceholderTitle",
      placeholderDescKey: "showcase.editorsPlaceholderDesc",
    },
    settings: {
      img: "assets/screenshots/app-settings.png",
      captionKey: "showcase.settingsCaption",
      tagKey: "showcase.settingsTag",
      titleKey: "showcase.settingsTitle",
      descKey: "showcase.settingsDesc",
      placeholderTitleKey: "showcase.settingsPlaceholderTitle",
      placeholderDescKey: "showcase.settingsPlaceholderDesc",
    },
  };

  const showcaseImg = document.getElementById("showcase-img");
  const showcaseTag = document.getElementById("showcase-tag");
  const showcaseTitle = document.getElementById("showcase-title");
  const showcaseDesc = document.getElementById("showcase-desc");
  const showcasePlaceholder = document.getElementById("showcase-placeholder");
  const showcasePlaceholderTitle = document.getElementById(
    "showcase-placeholder-title",
  );
  const showcasePlaceholderDesc = document.getElementById(
    "showcase-placeholder-desc",
  );
  const showcasePlaceholderPath = document.getElementById(
    "showcase-placeholder-path",
  );

  function showShowcaseImage() {
    if (showcaseImg) showcaseImg.classList.remove("is-hidden");
    if (showcasePlaceholder) showcasePlaceholder.classList.add("is-hidden");
  }

  function showShowcasePlaceholder(tabKey) {
    const data = showcaseData[tabKey];
    if (!data) return;
    if (showcaseImg) showcaseImg.classList.add("is-hidden");
    if (showcasePlaceholder) showcasePlaceholder.classList.remove("is-hidden");
    if (showcasePlaceholderTitle) {
      showcasePlaceholderTitle.textContent = data.placeholderTitleKey
        ? t(data.placeholderTitleKey)
        : t(data.titleKey);
    }
    if (showcasePlaceholderDesc) {
      showcasePlaceholderDesc.textContent = data.placeholderDescKey
        ? t(data.placeholderDescKey)
        : t(data.descKey);
    }
    if (showcasePlaceholderPath) {
      showcasePlaceholderPath.textContent = data.img;
    }
  }

  if (showcaseImg) {
    showcaseImg.addEventListener("load", showShowcaseImage);
    showcaseImg.addEventListener("error", () =>
      showShowcasePlaceholder(activeShowcaseKey),
    );
  }

  const packMenuImg = document.getElementById("pack-menu-img");
  const packMenuPlaceholder = document.getElementById("pack-menu-placeholder");
  if (packMenuImg && packMenuPlaceholder) {
    packMenuImg.addEventListener("load", () => {
      packMenuImg.classList.remove("is-hidden");
      packMenuPlaceholder.classList.add("is-hidden");
    });
    packMenuImg.addEventListener("error", () => {
      packMenuImg.classList.add("is-hidden");
      packMenuPlaceholder.classList.remove("is-hidden");
    });
  }

  const allVideos = Array.from(document.querySelectorAll("video"));
  allVideos.forEach((video) => {
    video.controls = false;
    video.loop = true;
    const enforceMute = () => {
      if (!video.muted) video.muted = true;
      if (video.volume !== 0) video.volume = 0;
    };
    enforceMute();
    video.addEventListener("volumechange", enforceMute);
  });

  if ("IntersectionObserver" in window && allVideos.length > 0) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (video.classList.contains("is-hidden")) return;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 },
    );
    allVideos.forEach((video) => videoObserver.observe(video));
  }

  document.querySelectorAll(".js-optional-video").forEach((video) => {
    const placeholder =
      video.parentElement?.querySelector(".media-placeholder");
    const source = video.querySelector("source");
    const showPlaceholder = () => {
      video.classList.add("is-hidden");
      if (placeholder) placeholder.classList.remove("is-hidden");
    };
    const showVideo = () => {
      video.classList.remove("is-hidden");
      if (placeholder) placeholder.classList.add("is-hidden");
    };
    video.addEventListener("loadeddata", showVideo);
    video.addEventListener("error", showPlaceholder);
    if (source) source.addEventListener("error", showPlaceholder);
  });

  function renderShowcaseTab(tabKey) {
    const data = showcaseData[tabKey];
    if (!data) return;
    if (showcaseImg) {
      showShowcaseImage();
      showcaseImg.src = data.img;
      showcaseImg.dataset.caption = t(data.captionKey);
    }
    if (showcaseTag) showcaseTag.textContent = t(data.tagKey);
    if (showcaseTitle) showcaseTitle.textContent = t(data.titleKey);
    if (showcaseDesc) showcaseDesc.textContent = t(data.descKey);
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const data = showcaseData[btn.dataset.tab];
      if (!data) return;
      activeShowcaseKey = btn.dataset.tab;

      document.querySelectorAll(".tab-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      renderShowcaseTab(activeShowcaseKey);
    });
  });

  function applyLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = "en";
    currentLang = lang;
    try {
      localStorage.setItem("ts_lang", lang);
    } catch (_) {}

    document.documentElement.lang = lang;
    const titleText = t("meta.title");
    if (titleText) document.title = titleText;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t("meta.description")) {
      metaDesc.setAttribute("content", t("meta.description"));
    }

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = t(el.dataset.i18n);
      if (val) el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const val = t(el.dataset.i18nHtml);
      if (val) el.innerHTML = val;
    });

    document.querySelectorAll("[data-i18n-caption]").forEach((el) => {
      const val = t(el.dataset.i18nCaption);
      if (val) el.dataset.caption = val;
    });

    const activePreset = presets[activePresetKey];
    if (activePreset) {
      if (labelLeft) labelLeft.textContent = t(activePreset.leftKey);
      if (labelRight) labelRight.textContent = t(activePreset.rightKey);
    }

    renderShowcaseTab(activeShowcaseKey);

    document.querySelectorAll(".lang-option").forEach((btn) => {
      const isSelected = btn.dataset.lang === lang;
      btn.classList.toggle("active", isSelected);
      btn.setAttribute("aria-selected", String(isSelected));
    });

    const currentFlagEl = document.getElementById("lang-current-flag");
    const selectedFlag = document.querySelector(
      `.lang-option[data-lang="${lang}"] .lang-flag`,
    );
    if (currentFlagEl && selectedFlag) {
      currentFlagEl.innerHTML = selectedFlag.innerHTML;
    }
  }

  const langDropdown = document.getElementById("lang-dropdown");
  const langTrigger = document.getElementById("lang-trigger");

  function setLangMenuOpen(isOpen) {
    if (!langDropdown || !langTrigger) return;
    langDropdown.classList.toggle("open", isOpen);
    langTrigger.setAttribute("aria-expanded", String(isOpen));
  }

  if (langTrigger && langDropdown) {
    langTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      setLangMenuOpen(!langDropdown.classList.contains("open"));
    });

    document.addEventListener("click", (e) => {
      if (!langDropdown.contains(e.target)) {
        setLangMenuOpen(false);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setLangMenuOpen(false);
    });
  }

  document.querySelectorAll(".lang-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLanguage(btn.dataset.lang);
      setLangMenuOpen(false);
    });
  });

  applyLanguage(currentLang);

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll(".js-lightbox-trigger").forEach((img) => {
    img.addEventListener("click", () => {
      if (!lightbox || !lightboxImg || !lightboxCaption) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = img.dataset.caption || img.alt || "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  fetch(
    "https://api.github.com/repos/Gabriel250903/ProTankiTextureSwapper/releases/latest",
  )
    .then((res) => (res.ok ? res.json() : null))
    .then((release) => {
      if (!release || !release.assets) return;
      const installer = release.assets.find((a) =>
        a.name.toLowerCase().endsWith(".exe"),
      );
      if (installer && installer.browser_download_url) {
        document.querySelectorAll(".js-download-link").forEach((link) => {
          link.href = installer.browser_download_url;
        });
      }
      if (release.tag_name) {
        const navVer = document.getElementById("nav-version");
        if (navVer) navVer.textContent = release.tag_name;
      }
    })
    .catch(() => {});
});
