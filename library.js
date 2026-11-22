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
if (query || activeLink) {
  const scope = activeLink ? ` in ${activeLink.textContent}` : "";
  document.querySelector("#result-heading").textContent = query
    ? `No results for “${query}”${scope}`
    : `No published articles${scope} yet`;
  document.querySelector("#result-detail").textContent =
    "The editorial collection is in preparation.";
}
if (window.location.hash === "#library-search") searchForm.elements.q.focus();
