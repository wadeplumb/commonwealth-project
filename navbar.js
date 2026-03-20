// add same title to all pages
var titleElement = document.getElementsByClassName("title")[0];
if (titleElement) {
  var link = document.createElement("a");
  link.href = "./home.html";
  link.textContent = "Beacon Academy of Southern Utah";
  link.style.color = "#ffffff";
  link.style.textDecoration = "none";
  link.style.fontWeight = "400";
  link.style.fontSize = "32px";
  link.style.paddingTop = "10px";
  link.style.paddingBottom = "10px";
  titleElement.replaceWith(link);
}

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
      link.style.color = currentFile === fileName ? "#959595" : "#ffffff";
      link.style.textDecoration = "none";
      link.style.fontWeight = "300";
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

  // add background image to home page header
  var currentFile = getCurrentFileName();
  console.log(currentFile);
  if (currentFile === "home.html") {
    var titleBlockHeader = document.getElementById("title-block-header");
    if (titleBlockHeader) {
      titleBlockHeader.style.backgroundImage =
        'url("../images/henerysplace.png")';
      titleBlockHeader.style.backgroundSize = "cover";
      titleBlockHeader.style.backgroundPosition = "center";
      titleBlockHeader.style.height = "600px";
    }
  }
  function addModernFooter() {
    // Prevent duplicates
    if (document.getElementById("custom-footer")) return;

    const footer = document.createElement("footer");
    footer.id = "custom-footer";

    // Get page files for footer links
    findPageFiles().then(function (pageFiles) {
      var linksHtml = pageFiles
        .map(function (fileName) {
          return '<a href="./' + fileName + '">' + toLabel(fileName) + "</a>";
        })
        .join("");

      footer.innerHTML = `
      <div class="footer-container">
        <div class="footer-section">
          <a href="./home.html">
            <h3>Beacon Academy</h3>
          </a>
          <p>Beacon Academy seeks to be a long-lasting community dedicated to nurturing the genius, passions, and potential in each child and parent through excellence in education, leadership, and individualized mentoring.</p>
        </div>

        <div class="footer-section">
          <h4>Links</h4>
          ${linksHtml}
        </div>

        <div class="footer-section">
          <h4>Contact</h4>
          <a href="mailto:beaconacademysu@gmail.com">Email</a>

        </div>
      </div>

      <div class="footer-bottom">
        © ${new Date().getFullYear()} Beacon Academy of Southern Utah. All rights reserved.
      </div>
    `;

      document.body.appendChild(footer);
    });

    // Styles
    const style = document.createElement("style");
    style.textContent = `
    #custom-footer {
      background: #0f172a;
      color: #e5e7eb;
      padding: 40px 20px 20px;
    }

    .footer-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      max-width: 1000px;
      margin: auto;
    }

    .footer-section h3,
    .footer-section h4 {
      margin-bottom: 10px;
      color: #ffffff;
    }

    .footer-section p {
      font-size: 14px;
      color: #9ca3af;
    }

    .footer-section a {
      display: block;
      color: #9ca3af;
      text-decoration: none;
      margin: 5px 0;
      font-size: 14px;
    }

    .footer-section a:hover {
      color: #38bdf8;
    }

    .footer-bottom {
      text-align: center;
      margin-top: 30px;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #1f2937;
      padding-top: 15px;
    }
  `;

    document.head.appendChild(style);
  }

  // Run it
  addModernFooter();
})();
