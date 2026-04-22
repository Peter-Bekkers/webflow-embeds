document.addEventListener("DOMContentLoaded", () => {
  /*
  ==========================================================
  FLOWBASE — UNIVERSAL SWIPER
  ==========================================================

  SETTINGS PRIORITY
  -----------------
  defaults < global config < instance attributes

  GLOBAL CONFIG
  -------------
  window.FlowbaseSwiper = { ... }

  REQUIRED HTML
  -------------
  <div swiper>
    <div class="swiper-wrapper">
      <div class="swiper-slide">...</div>
      <div class="swiper-slide">...</div>
    </div>
  </div>

  OPTIONAL MATCHING CONTROLS
  --------------------------
  swiper-id="blog-01"

  <button swiper-button-prev="blog-01"></button>
  <button swiper-button-next="blog-01"></button>
  <div swiper-progress="blog-01"></div>
  <div swiper-scrollbar="blog-01"></div>
  */

  if (typeof Swiper === "undefined") {
    console.warn("Flowbase Swiper: Swiper.js is not loaded.");
    return;
  }

  const DEFAULTS = {
    slidesPerView: "auto",
    spaceBetween: 24,
    centeredSlides: false,
    loop: false,
    speed: 600,
    autoHeight: false,

    freeMode: true,
    freeModeSticky: false,
    grabCursor: true,

    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,

    preventClicks: true,
    preventClicksPropagation: false,
    slideToClickedSlide: false,

    navigation: true,
    pagination: true,
    paginationType: "progressbar",
    scrollbar: false,

    keyboard: false,
    keyboardOnlyInViewport: true,

    mousewheel: false,
    mousewheelForceToAxis: true,
    mousewheelSensitivity: 1,

    autoplay: false,
    autoplayDelay: 4000,
    autoplayDisableOnInteraction: false,
    autoplayPauseOnHover: true,

    breakpoints: null,

    watchOverflow: true,
    observer: true,
    observeParents: true,

    activeClass: "is-active",
    prevClass: "is-prev",
    nextClass: "is-next",
    visibleClass: "is-visible",

    gsapAnimateActive: false,
    gsapDuration: 0.6,
    gsapY: 16,
    gsapScale: 1,
    gsapOpacityFrom: 0,

    debug: false,
  };

  const globalConfig = window.FlowbaseSwiper || {};

  function parseBool(value) {
    if (value == null) return undefined;
    if (value === "" || value === "true") return true;
    if (value === "false") return false;
    return undefined;
  }

  function parseNumber(value) {
    if (value == null || value === "") return undefined;
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
  }

  function parseString(value) {
    return value == null || value === "" ? undefined : value;
  }

  function parseSlidesPerView(value) {
    if (value == null || value === "") return undefined;
    if (value === "auto") return "auto";
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  }

  function parseJSON(value, fallback) {
    if (value == null || value === "") return undefined;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("Flowbase Swiper: Invalid JSON:", value);
      return fallback;
    }
  }

  function cleanObject(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined),
    );
  }

  function getInstanceConfig(el) {
    return cleanObject({
      slidesPerView: parseSlidesPerView(
        el.getAttribute("swiper-slides-per-view"),
      ),
      spaceBetween: parseNumber(el.getAttribute("swiper-space-between")),
      centeredSlides: parseBool(el.getAttribute("swiper-centered")),
      loop: parseBool(el.getAttribute("swiper-loop")),
      speed: parseNumber(el.getAttribute("swiper-speed")),
      autoHeight: parseBool(el.getAttribute("swiper-auto-height")),

      freeMode: parseBool(el.getAttribute("swiper-free-mode")),
      freeModeSticky: parseBool(el.getAttribute("swiper-free-mode-sticky")),
      grabCursor: parseBool(el.getAttribute("swiper-grab-cursor")),

      slidesOffsetBefore: parseNumber(el.getAttribute("swiper-offset-before")),
      slidesOffsetAfter: parseNumber(el.getAttribute("swiper-offset-after")),

      preventClicks: parseBool(el.getAttribute("swiper-prevent-clicks")),
      preventClicksPropagation: parseBool(
        el.getAttribute("swiper-prevent-clicks-propagation"),
      ),
      slideToClickedSlide: parseBool(
        el.getAttribute("swiper-slide-to-clicked-slide"),
      ),

      navigation: parseBool(el.getAttribute("swiper-navigation")),
      pagination: parseBool(el.getAttribute("swiper-pagination")),
      paginationType: parseString(el.getAttribute("swiper-pagination-type")),
      scrollbar: parseBool(el.getAttribute("swiper-scrollbar")),

      keyboard: parseBool(el.getAttribute("swiper-keyboard")),
      keyboardOnlyInViewport: parseBool(
        el.getAttribute("swiper-keyboard-only-in-viewport"),
      ),

      mousewheel: parseBool(el.getAttribute("swiper-mousewheel")),
      mousewheelForceToAxis: parseBool(
        el.getAttribute("swiper-mousewheel-force-axis"),
      ),
      mousewheelSensitivity: parseNumber(
        el.getAttribute("swiper-mousewheel-sensitivity"),
      ),

      autoplay: parseBool(el.getAttribute("swiper-autoplay")),
      autoplayDelay: parseNumber(el.getAttribute("swiper-autoplay-delay")),
      autoplayDisableOnInteraction: parseBool(
        el.getAttribute("swiper-autoplay-disable-on-interaction"),
      ),
      autoplayPauseOnHover: parseBool(
        el.getAttribute("swiper-autoplay-pause-on-hover"),
      ),

      breakpoints: parseJSON(el.getAttribute("swiper-breakpoints")),

      watchOverflow: parseBool(el.getAttribute("swiper-watch-overflow")),
      observer: parseBool(el.getAttribute("swiper-observer")),
      observeParents: parseBool(el.getAttribute("swiper-observe-parents")),

      activeClass: parseString(el.getAttribute("swiper-active-class")),
      prevClass: parseString(el.getAttribute("swiper-prev-class")),
      nextClass: parseString(el.getAttribute("swiper-next-class")),
      visibleClass: parseString(el.getAttribute("swiper-visible-class")),

      gsapAnimateActive: parseBool(
        el.getAttribute("swiper-gsap-animate-active"),
      ),
      gsapDuration: parseNumber(el.getAttribute("swiper-gsap-duration")),
      gsapY: parseNumber(el.getAttribute("swiper-gsap-y")),
      gsapScale: parseNumber(el.getAttribute("swiper-gsap-scale")),
      gsapOpacityFrom: parseNumber(el.getAttribute("swiper-gsap-opacity-from")),

      debug: parseBool(el.getAttribute("swiper-debug")),
    });
  }

  function getSettings(el) {
    return {
      ...DEFAULTS,
      ...globalConfig,
      ...getInstanceConfig(el),
    };
  }

  function findControls(id, type) {
    return document.querySelector(`[${type}="${id}"]`);
  }

  function updateSlideStateClasses(swiper, settings) {
    if (!swiper || !swiper.slides) return;

    swiper.slides.forEach((slide) => {
      slide.classList.remove(
        settings.activeClass,
        settings.prevClass,
        settings.nextClass,
        settings.visibleClass,
      );
    });

    const activeSlide = swiper.slides[swiper.activeIndex];
    const prevSlide = swiper.slides[swiper.activeIndex - 1];
    const nextSlide = swiper.slides[swiper.activeIndex + 1];

    if (activeSlide) activeSlide.classList.add(settings.activeClass);
    if (prevSlide) prevSlide.classList.add(settings.prevClass);
    if (nextSlide) nextSlide.classList.add(settings.nextClass);

    if (swiper.visibleSlides && swiper.visibleSlides.length) {
      swiper.visibleSlides.forEach((slide) => {
        slide.classList.add(settings.visibleClass);
      });
    } else {
      swiper.slides.forEach((slide) => {
        if (slide.classList.contains("swiper-slide-visible")) {
          slide.classList.add(settings.visibleClass);
        }
      });
    }
  }

  function animateActiveSlide(swiper, settings) {
    if (typeof gsap === "undefined" || !settings.gsapAnimateActive) return;

    const activeSlide = swiper.slides[swiper.activeIndex];
    if (!activeSlide) return;

    const target = activeSlide.querySelector("[swiper-animate]") || activeSlide;

    gsap.killTweensOf(target);

    gsap.fromTo(
      target,
      {
        opacity: settings.gsapOpacityFrom,
        y: settings.gsapY,
        scale: settings.gsapScale,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: settings.gsapDuration,
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );
  }

  function buildSwiperConfig(slider, id, settings) {
    const config = {
      slidesPerView: settings.slidesPerView,
      spaceBetween: settings.spaceBetween,
      centeredSlides: settings.centeredSlides,
      loop: settings.loop,
      speed: settings.speed,
      autoHeight: settings.autoHeight,

      grabCursor: settings.grabCursor,

      slidesOffsetBefore: settings.slidesOffsetBefore,
      slidesOffsetAfter: settings.slidesOffsetAfter,

      preventClicks: settings.preventClicks,
      preventClicksPropagation: settings.preventClicksPropagation,
      slideToClickedSlide: settings.slideToClickedSlide,

      watchOverflow: settings.watchOverflow,
      observer: settings.observer,
      observeParents: settings.observeParents,

      keyboard: settings.keyboard
        ? {
            enabled: true,
            onlyInViewport: settings.keyboardOnlyInViewport,
          }
        : false,

      mousewheel: settings.mousewheel
        ? {
            enabled: true,
            forceToAxis: settings.mousewheelForceToAxis,
            sensitivity: settings.mousewheelSensitivity,
          }
        : false,

      freeMode: settings.freeMode
        ? {
            enabled: true,
            sticky: settings.freeModeSticky,
          }
        : false,

      on: {
        init: function () {
          updateSlideStateClasses(this, settings);
          animateActiveSlide(this, settings);

          if (settings.debug) {
            console.log("Flowbase Swiper initialized:", {
              id,
              settings,
              instance: this,
            });
          }
        },
        slideChange: function () {
          updateSlideStateClasses(this, settings);
          animateActiveSlide(this, settings);
        },
        transitionEnd: function () {
          updateSlideStateClasses(this, settings);
        },
        resize: function () {
          updateSlideStateClasses(this, settings);
        },
      },
    };

    if (settings.breakpoints) {
      config.breakpoints = settings.breakpoints;
    }

    if (settings.navigation) {
      const nextEl = findControls(id, "swiper-button-next");
      const prevEl = findControls(id, "swiper-button-prev");

      if (nextEl || prevEl) {
        config.navigation = {
          nextEl,
          prevEl,
          disabledClass: "is-disabled",
          hiddenClass: "is-hidden",
        };
      }
    }

    if (settings.pagination) {
      const paginationEl = findControls(id, "swiper-progress");

      if (paginationEl) {
        config.pagination = {
          el: paginationEl,
          type: settings.paginationType,
          clickable: true,
        };
      }
    }

    if (settings.scrollbar) {
      const scrollbarEl = findControls(id, "swiper-scrollbar");

      if (scrollbarEl) {
        config.scrollbar = {
          el: scrollbarEl,
          draggable: true,
          hide: false,
        };
      }
    }

    if (settings.autoplay) {
      config.autoplay = {
        delay: settings.autoplayDelay,
        disableOnInteraction: settings.autoplayDisableOnInteraction,
        pauseOnMouseEnter: settings.autoplayPauseOnHover,
      };
    }

    return config;
  }

  function initSlider(slider, index) {
    if (slider.dataset.swiperReady === "true") return;

    const wrapper = slider.querySelector(".swiper-wrapper");
    const slides = slider.querySelectorAll(".swiper-slide");

    if (!wrapper || !slides.length) {
      console.warn(
        "Flowbase Swiper: Missing .swiper-wrapper or .swiper-slide",
        slider,
      );
      return;
    }

    slider.dataset.swiperReady = "true";

    const id = slider.getAttribute("swiper-id") || `swiper-${index + 1}`;
    slider.setAttribute("swiper-id", id);

    const settings = getSettings(slider);
    const config = buildSwiperConfig(slider, id, settings);

    const instance = new Swiper(slider, config);
    slider.flowbaseSwiper = instance;
  }

  const sliders = document.querySelectorAll("[swiper]");
  if (!sliders.length) return;

  sliders.forEach((slider, index) => {
    initSlider(slider, index);
  });
});
