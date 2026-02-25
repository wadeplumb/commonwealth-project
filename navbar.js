(function () {
  function toLabel(fileName) {
    var base = fileName
      .replace(/\.html$/i, "")
      .replace(/^\d{4}-\d{2}-\d{2}-/, "");
    if (!base) return "Home";
    return base
      .split("-")
      .filter(Boolean)
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  function normalizeHtmlFile(href) {
    if (!href) return null;
    var cleanHref = href.split("#")[0].split("?")[0];
    if (!/\.html?$/i.test(cleanHref)) return null;
    var fileName = cleanHref.split("/").pop();
    return fileName || null;
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values)).sort(function (a, b) {
      return a.localeCompare(b);
    });
  }

  function getCurrentDirPath() {
    var path = window.location.pathname;
    var slash = path.lastIndexOf("/");
    return slash >= 0 ? path.slice(0, slash + 1) : "/";
  }

  function getCurrentFileName() {
    var name = window.location.pathname.split("/").pop();
    return name || "index.html";
  }

  async function findPageFiles() {
    var currentFile = getCurrentFileName();
    var discovered = [];

    try {
      var res = await fetch(getCurrentDirPath(), { cache: "no-store" });
      if (res.ok) {
        var html = await res.text();
        var doc = new DOMParser().parseFromString(html, "text/html");
        discovered = Array.from(doc.querySelectorAll("a[href]"))
          .map(function (a) {
            return normalizeHtmlFile(a.getAttribute("href"));
          })
          .filter(Boolean);
      }
    } catch (err) {
      // Some hosts (or file://) do not allow directory listing.
    }

    if (!discovered.length) {
      discovered = Array.from(document.querySelectorAll("a[href]"))
        .map(function (a) {
          return normalizeHtmlFile(a.getAttribute("href"));
        })
        .filter(Boolean);
    }

    discovered.push(currentFile);
    return uniqueSorted(discovered);
  }

  async function buildNavbar() {
    var header = document.querySelector("header");
    if (!header) return;

    var pageFiles = await findPageFiles();
    var currentFile = getCurrentFileName();

    var nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Page navigation");
    nav.setAttribute("class", "nav-bar");
    nav.style.display = "flex";
    // nav.style.flexWrap = "wrap";
    // nav.style.gap = "12px";
    // nav.style.justifyContent = "center";
    // nav.style.marginTop = "16px";
    // nav.style.width = "100vw";

    pageFiles.forEach(function (fileName) {
      var link = document.createElement("a");
      link.href = "./" + fileName;
      link.textContent = toLabel(fileName);
      link.style.padding = "8px 12px";
      link.style.border = "1px solid #111";
      link.style.borderRadius = "999px";
      link.style.backgroundColor = currentFile === fileName ? "#111" : "#fff";
      link.style.color = currentFile === fileName ? "#fff" : "#111";
      link.style.textDecoration = "none";
      link.style.fontWeight = "600";
      link.style.width = "fit-content";
      nav.appendChild(link);
    });

    header.appendChild(nav);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildNavbar);
  } else {
    buildNavbar();
  }
})();
