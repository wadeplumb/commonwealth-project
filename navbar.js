(function () {
  // Converts a filename to a readable label
  // Removes .html extension and date prefix, then capitalizes words
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

  // Extracts and validates HTML filenames from href attributes
  // Strips query strings and hash fragments, returns null for non-HTML files
  function normalizeHtmlFile(href) {
    if (!href) return null;
    var cleanHref = href.split("#")[0].split("?")[0];
    if (!/\.html?$/i.test(cleanHref)) return null;
    var fileName = cleanHref.split("/").pop();
    return fileName || null;
  }

  // Returns a sorted array of unique values
  function uniqueSorted(values) {
    return Array.from(new Set(values)).sort(function (a, b) {
      return a.localeCompare(b);
    });
  }

  // Gets the current directory path from the window location
  function getCurrentDirPath() {
    var path = window.location.pathname;
    var slash = path.lastIndexOf("/");
    return slash >= 0 ? path.slice(0, slash + 1) : "/";
  }

  // Gets the current filename from the window location
  function getCurrentFileName() {
    var name = window.location.pathname.split("/").pop();
    return name || "index.html";
  }

  // Discovers available page files by fetching directory listing or parsing page links
  async function findPageFiles() {
    var currentFile = getCurrentFileName();
    var discovered = [];

    // Try to fetch directory listing
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
      // Fallback: some hosts or file:// protocol don't allow directory listing
    }

    // Fallback: extract links from current page if directory listing failed
    if (!discovered.length) {
      discovered = Array.from(document.querySelectorAll("a[href]"))
        .map(function (a) {
          return normalizeHtmlFile(a.getAttribute("href"));
        })
        .filter(Boolean);
    }

    // Ensure current file is always included
    discovered.push(currentFile);
    return uniqueSorted(discovered);
  }

  // Builds and inserts the navbar into the DOM
  async function buildNavbar() {
    var header = document.querySelector(".nav-bar-container");
    if (!header) return;

    var pageFiles = await findPageFiles();
    var currentFile = getCurrentFileName();

    // Create nav element with accessibility attributes
    var nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Page navigation");
    nav.setAttribute("class", "nav-bar");

    // Create a link for each discovered page file
    pageFiles.forEach(function (fileName) {
      var link = document.createElement("a");
      link.href = "./" + fileName;
      link.textContent = toLabel(fileName);
      link.style.padding = "8px 12px";
      link.style.borderRadius = "999px";
      // Highlight current page with dark text, others with white
      link.style.color = currentFile === fileName ? "#111" : "#fff";
      link.style.textDecoration = "none";
      link.style.fontWeight = "600";
      link.style.fontSize = "20px";
      link.style.width = "fit-content";
      nav.appendChild(link);
    });

    header.appendChild(nav);
  }

  // Initialize navbar when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildNavbar);
  } else {
    buildNavbar();
  }
  var currentFile = getCurrentFileName();
  console.log(currentFile);
  if (currentFile === "2026-02-20-untitled.html") {
    var titleBlockHeader = document.getElementById("title-block-header");
    if (titleBlockHeader) {
      titleBlockHeader.style.backgroundImage =
        'url("../images/henerysplace.png")';
      titleBlockHeader.style.backgroundSize = "cover";
      titleBlockHeader.style.backgroundPosition = "center";
      titleBlockHeader.style.height = "600px";
    }
  }
})();
