const params = new URLSearchParams(window.location.search);
const categoryLinks = [...document.querySelectorAll("[data-category]")];
const activeLinks = categoryLinks.filter(link => link.dataset.category === params.get("category"));
const [activeLink] = activeLinks;
const searchForm = document.querySelector("#library-search");
const query = params.get("q")?.trim() ?? "";

searchForm.elements.q.value = query;
for (const link of activeLink ? activeLinks : [document.querySelector(".filters a")]) {
  link.setAttribute("aria-current", "true");
}

if (activeLink) {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "category";
  input.value = activeLink.dataset.category;
  searchForm.append(input);
}
for (const link of document.querySelectorAll(".filters a, .library-sidebar a")) {
  if (query) {
    const url = new URL(link.href);
    url.searchParams.set("q", query);
    link.href = url.href;
  }
}
const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
let count = 0;
for (const article of document.querySelectorAll("[data-article-category]")) {
  const searchable = `${article.textContent} ${article.dataset.keywords}`.toLowerCase();
  const matchesCategory = !activeLink || article.dataset.articleCategory === activeLink.dataset.category;
  article.hidden = !matchesCategory || !terms.every(term => searchable.includes(term));
  count += Number(!article.hidden);
}

const scope = activeLink ? ` in ${activeLink.textContent.trim()}` : "";
document.querySelector("#result-heading").textContent = query
  ? `Results for “${query}”${scope}`
  : activeLink ? activeLink.textContent.trim() : "All articles";
document.querySelector("#article-count").textContent = `${count} published article${count === 1 ? "" : "s"}`;
document.querySelector("#result-detail").hidden = count !== 0;
if (window.location.hash === "#library-search") searchForm.elements.q.focus();
