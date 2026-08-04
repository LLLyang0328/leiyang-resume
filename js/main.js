/* 雷仰 · 个人简历 — 交互逻辑 */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 顶部进度条 ---------- */
  var progressBar = document.getElementById("scrollProgress");
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = p + "%";
  }

  /* ---------- 头部滚动状态 ---------- */
  var header = document.getElementById("siteHeader");
  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 12);
  }

  /* ---------- 移动端菜单 ---------- */
  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");
  navToggle.addEventListener("click", function () {
    var open = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });
  siteNav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- 滚动显现 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- 当前区块高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (sec) {
      spyObserver.observe(sec);
    });
  }

  /* ---------- 画廊渲染 ---------- */
  var galleryRoot = document.getElementById("galleryRoot");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var allItems = [];
  var certItems = [];
  var currentIndex = -1;

  function combinedItems() {
    return allItems.concat(certItems);
  }

  function collectCertItems() {
    certItems = Array.prototype.slice.call(document.querySelectorAll(".cert-item")).map(function (el) {
      return {
        file: el.getAttribute("data-file"),
        title: el.getAttribute("data-title")
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll(".cert-item"), function (el, i) {
      if (el._lbWired) return;
      el._lbWired = true;
      el.addEventListener("click", function () {
        openLightbox(allItems.length + i);
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(allItems.length + i);
        }
      });
    });
  }

  function openLightbox(index) {
    var items = combinedItems();
    if (index < 0 || index >= items.length) return;
    currentIndex = index;
    var item = items[index];
    lightboxImg.src = item.file;
    lightboxImg.alt = item.title;
    lightboxCaption.textContent = item.title;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    currentIndex = -1;
  }

  function moveLightbox(step) {
    if (currentIndex < 0) return;
    var items = combinedItems();
    openLightbox((currentIndex + step + items.length) % items.length);
  }

  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", function () {
    moveLightbox(-1);
  });
  lightboxNext.addEventListener("click", function () {
    moveLightbox(1);
  });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") moveLightbox(-1);
    if (e.key === "ArrowRight") moveLightbox(1);
  });

  function renderGallery(data) {
    if (!galleryRoot || !data || !data.groups || !data.items) return;
    var itemsByGroup = {};
    data.items.forEach(function (item) {
      (itemsByGroup[item.group] = itemsByGroup[item.group] || []).push(item);
    });

    var frag = document.createDocumentFragment();
    data.groups.forEach(function (group) {
      var items = itemsByGroup[group.key] || [];
      if (!items.length) return;
      var groupWrap = document.createElement("div");
      groupWrap.className = "gallery-group reveal visible";

      var heading = document.createElement("h3");
      heading.textContent = group.title;
      groupWrap.appendChild(heading);

      var grid = document.createElement("div");
      grid.className = "gallery-grid";

      items.forEach(function (item, i) {
        var figure = document.createElement("figure");
        figure.className = "gallery-item";
        figure.tabIndex = 0;

        var img = document.createElement("img");
        img.src = item.file;
        img.alt = item.title;
        img.loading = "lazy";
        img.width = 640;

        var caption = document.createElement("figcaption");
        caption.textContent = item.title;

        figure.appendChild(img);
        figure.appendChild(caption);

        var index = allItems.length;
        allItems.push(item);

        figure.addEventListener("click", function () {
          openLightbox(index);
        });
        figure.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(index);
          }
        });

        grid.appendChild(figure);
      });

      groupWrap.appendChild(grid);
      frag.appendChild(groupWrap);
    });

    galleryRoot.innerHTML = "";
    galleryRoot.appendChild(frag);
  }

  fetch("assets/images/manifest.json")
    .then(function (res) {
      if (!res.ok) throw new Error("manifest load failed");
      return res.json();
    })
    .then(renderGallery)
    .catch(function () {
      if (galleryRoot) {
        galleryRoot.innerHTML =
          '<p class="gallery-loading">作品图片加载失败，请刷新重试。</p>';
      }
    })
    .then(function () {
      collectCertItems();
      markImgsLoaded();
    });

  /* ---------- 页脚年份 ---------- */
  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 滚动监听 ---------- */
  function onScroll() {
    updateProgress();
    updateHeader();
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateProgress);
})();

/* 图片加载完成淡入，加载中显示占位底色 */
function markImgsLoaded() {
  document.querySelectorAll("img").forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("img-loaded");
    }
  });
}
markImgsLoaded();
document.addEventListener("load", function (e) {
  if (e.target && e.target.tagName === "IMG") {
    e.target.classList.add("img-loaded");
  }
}, true);
