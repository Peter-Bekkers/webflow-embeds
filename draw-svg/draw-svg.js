document.addEventListener("DOMContentLoaded", () => {
  /*
  ==========================================================
  FLOWBASE — SVG HANDWRITING DRAW + FILL
  ==========================================================

  HOW TO USE
  ----------
  1. Add the attribute below to a wrapper:
     text-handwrite

  2. Put one or more SVGs inside the wrapper.
     Each SVG acts like one "letter" or drawing unit.

  3. Optionally set global defaults:
     window.FlowbaseDrawSVG = { ... }

  4. Optionally override settings per instance with attributes:
     handwrite-stroke-color="#ff0000"
     handwrite-draw-duration="1.2"
     handwrite-redraw-on-hover="true"

  SETTINGS PRIORITY
  -----------------
  defaults < global config < instance attributes
  */

  if (typeof gsap === "undefined") {
    console.warn("FLOWBASE Draw SVG: GSAP is not loaded.");
    return;
  }

  const DEFAULTS = {
    strokeColor: "#000",
    strokeWidth: 2.5,
    lineCap: "round",
    lineJoin: "round",

    fillColor: "#000",
    fillDelay: 1.25,
    fillDuration: 0.35,

    drawDuration: 2,
    drawEase: "power2.out",
    strokeDelay: 0,

    stagger: 0.12,

    runOnScroll: true,
    rootMargin: "0px 0px -15% 0px",

    runOnHover: false,
    redrawOnHover: false,

    hoverRedrawMinGap: 150,
  };

  const globalConfig = window.FlowbaseDrawSVG || {};
  const svgNS = "http://www.w3.org/2000/svg";

  function parseBoolean(value) {
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

  function cleanObject(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined),
    );
  }

  function getInstanceConfig(wrapper) {
    return cleanObject({
      strokeColor: parseString(wrapper.getAttribute("handwrite-stroke-color")),
      strokeWidth: parseNumber(wrapper.getAttribute("handwrite-stroke-width")),
      lineCap: parseString(wrapper.getAttribute("handwrite-line-cap")),
      lineJoin: parseString(wrapper.getAttribute("handwrite-line-join")),

      fillColor: parseString(wrapper.getAttribute("handwrite-fill-color")),
      fillDelay: parseNumber(wrapper.getAttribute("handwrite-fill-delay")),
      fillDuration: parseNumber(
        wrapper.getAttribute("handwrite-fill-duration"),
      ),

      drawDuration: parseNumber(
        wrapper.getAttribute("handwrite-draw-duration"),
      ),
      drawEase: parseString(wrapper.getAttribute("handwrite-draw-ease")),
      strokeDelay: parseNumber(wrapper.getAttribute("handwrite-stroke-delay")),

      stagger: parseNumber(wrapper.getAttribute("handwrite-stagger")),

      runOnScroll: parseBoolean(
        wrapper.getAttribute("handwrite-run-on-scroll"),
      ),
      rootMargin: parseString(wrapper.getAttribute("handwrite-root-margin")),

      runOnHover: parseBoolean(wrapper.getAttribute("handwrite-run-on-hover")),
      redrawOnHover: parseBoolean(
        wrapper.getAttribute("handwrite-redraw-on-hover"),
      ),

      hoverRedrawMinGap: parseNumber(
        wrapper.getAttribute("handwrite-hover-redraw-min-gap"),
      ),
    });
  }

  function getSettings(wrapper) {
    return {
      ...DEFAULTS,
      ...globalConfig,
      ...getInstanceConfig(wrapper),
    };
  }

  function buildLetter(svg, settings, index) {
    const originalPaths = Array.from(svg.querySelectorAll("path"));
    if (!originalPaths.length) return null;

    const host = svg.parentElement || svg;
    const computed = window.getComputedStyle(host);

    if (computed.position === "static") {
      host.style.position = "relative";
    }

    svg.style.opacity = "0";

    const overlay = document.createElementNS(svgNS, "svg");
    overlay.setAttribute(
      "viewBox",
      svg.getAttribute("viewBox") || "0 0 100 100",
    );
    overlay.setAttribute("width", svg.getAttribute("width") || "100%");
    overlay.setAttribute("height", svg.getAttribute("height") || "100%");
    overlay.setAttribute(
      "preserveAspectRatio",
      svg.getAttribute("preserveAspectRatio") || "xMidYMid meet",
    );

    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.pointerEvents = "auto";
    overlay.style.overflow = "visible";

    const fillGroup = document.createElementNS(svgNS, "g");
    const strokeGroup = document.createElementNS(svgNS, "g");

    overlay.appendChild(fillGroup);
    overlay.appendChild(strokeGroup);
    host.appendChild(overlay);

    const fillPaths = [];
    const strokePaths = [];
    let longestLength = 0;

    originalPaths.forEach((path) => {
      const fillClone = path.cloneNode(true);
      fillClone.setAttribute("fill", settings.fillColor);
      fillClone.setAttribute("stroke", "none");
      fillClone.style.opacity = "0";
      fillGroup.appendChild(fillClone);
      fillPaths.push(fillClone);

      const strokeClone = path.cloneNode(true);
      strokeClone.setAttribute("fill", "none");
      strokeClone.setAttribute("stroke", settings.strokeColor);
      strokeClone.setAttribute("stroke-width", settings.strokeWidth);
      strokeClone.setAttribute("stroke-linecap", settings.lineCap);
      strokeClone.setAttribute("stroke-linejoin", settings.lineJoin);

      let length = 0;
      try {
        length = strokeClone.getTotalLength();
      } catch (error) {
        return;
      }

      longestLength = Math.max(longestLength, length);

      strokeClone.style.strokeDasharray = `${length}px`;
      strokeClone.style.strokeDashoffset = `${length}px`;

      strokeGroup.appendChild(strokeClone);
      strokePaths.push({
        el: strokeClone,
        length,
      });
    });

    if (!strokePaths.length) return null;

    const letter = {
      index,
      svg,
      host,
      overlay,
      fillPaths,
      strokePaths,
      longestLength,
      lastHoverTime: 0,
      tl: null,
    };

    function resetLetter() {
      letter.fillPaths.forEach((path) => {
        path.style.opacity = "0";
      });

      letter.strokePaths.forEach(({ el, length }) => {
        el.style.strokeDasharray = `${length}px`;
        el.style.strokeDashoffset = `${length}px`;
      });
    }

    function playLetter() {
      if (letter.tl) {
        letter.tl.kill();
      }

      resetLetter();

      const tl = gsap.timeline();

      letter.strokePaths.forEach(({ el, length }) => {
        const pathDuration =
          settings.drawDuration * (length / letter.longestLength);

        tl.to(
          el,
          {
            strokeDashoffset: 0,
            duration: pathDuration,
            ease: settings.drawEase,
          },
          settings.strokeDelay,
        );
      });

      tl.to(
        letter.fillPaths,
        {
          opacity: 1,
          duration: settings.fillDuration,
          ease: "power2.out",
          stagger: 0,
        },
        settings.fillDelay,
      );

      letter.tl = tl;
      return tl;
    }

    letter.resetLetter = resetLetter;
    letter.playLetter = playLetter;

    overlay.addEventListener("mouseenter", () => {
      const now = Date.now();
      if (now - letter.lastHoverTime < settings.hoverRedrawMinGap) return;
      letter.lastHoverTime = now;

      if (settings.runOnHover || settings.redrawOnHover) {
        letter.playLetter();
      }
    });

    return letter;
  }

  function initWrapper(wrapper, wrapperIndex) {
    if (wrapper.dataset.handwriteReady === "true") return;
    wrapper.dataset.handwriteReady = "true";

    const settings = getSettings(wrapper);
    const svgs = Array.from(wrapper.querySelectorAll("svg"));
    if (!svgs.length) return;

    const letters = [];

    svgs.forEach((svg, index) => {
      const letter = buildLetter(svg, settings, index);
      if (letter) letters.push(letter);
    });

    if (!letters.length) return;

    letters.forEach((letter) => {
      letter.resetLetter();
    });

    let hasPlayedInitial = false;

    function playInitialSequence() {
      if (hasPlayedInitial) return;
      hasPlayedInitial = true;

      const master = gsap.timeline();

      letters.forEach((letter, index) => {
        master.add(letter.playLetter(), index * settings.stagger);
      });
    }

    if (!settings.runOnHover && settings.runOnScroll) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              playInitialSequence();
              observer.disconnect();
            }
          });
        },
        {
          threshold: 0,
          root: null,
          rootMargin: settings.rootMargin,
        },
      );

      observer.observe(wrapper);
    }
  }

  const wrappers = document.querySelectorAll("[text-handwrite]");
  if (!wrappers.length) return;

  wrappers.forEach((wrapper, index) => {
    initWrapper(wrapper, index);
  });
});
