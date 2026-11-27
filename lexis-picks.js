const status = document.querySelector('#picks-status');

function showStatus(message) {
  status.textContent = message;
  status.hidden = false;
}

function linkUrl(value, sameOrigin = false) {
  if (!value) return null;

  try {
    const url = new URL(value, location.href);
    const acceptable = sameOrigin
      ? url.origin === location.origin && ['http:', 'https:'].includes(url.protocol)
      : url.protocol === 'https:' && !url.username && !url.password;
    return acceptable ? url.href : null;
  } catch {
    return null;
  }
}

function productCard(product, retailer) {
  const element = document.createElement('li');
  const card = document.createElement('article');
  card.className = 'picks-card';
  element.append(card);

  const visual = document.createElement('div');
  visual.className = 'picks-visual';
  const placeholder = document.createElement('span');
  placeholder.textContent = 'Product photo pending';
  const photoUrl = linkUrl(product.imagePath, true);
  if (photoUrl && product.imageAlt) {
    const photo = document.createElement('img');
    photo.alt = product.imageAlt;
    photo.loading = 'lazy';
    photo.addEventListener('error', () => photo.replaceWith(placeholder), { once: true });
    photo.src = photoUrl;
    visual.append(photo);
  } else {
    visual.append(placeholder);
  }

  const copy = document.createElement('div');
  copy.className = 'picks-card-copy';
  const title = document.createElement('h3');
  title.textContent = product.name;
  const description = document.createElement('p');
  description.textContent = product.description;
  copy.append(title, description);

  const articleUrl = linkUrl(product.relatedArticleUrl, true);
  if (articleUrl) {
    const article = document.createElement('a');
    article.className = 'text-link';
    article.href = articleUrl;
    article.textContent = 'Read the related article';
    article.setAttribute('aria-label', 'Read the related article for ' + product.name);
    copy.append(article);
  }

  const affiliateUrl = retailer?.active === true && linkUrl(product.affiliateUrl);
  if (affiliateUrl && retailer.buttonLabel && retailer.disclosure) {
    const shopping = document.createElement('div');
    shopping.className = 'picks-shopping';
    const link = document.createElement('a');
    link.className = 'button';
    link.href = affiliateUrl;
    link.rel = 'sponsored';
    link.textContent = retailer.buttonLabel;
    link.setAttribute('aria-label', retailer.buttonLabel + ' for ' + product.name);
    const paid = document.createElement('small');
    paid.textContent = retailer.disclosure;
    shopping.append(link, paid);
    copy.append(shopping);
  }

  card.append(visual, copy);
  return element;
}

async function loadPicks() {
  const response = await fetch('picks-products.json');
  if (!response.ok) throw new Error('Product data unavailable');
  const { products, retailers } = await response.json();
  const published = products.filter(product => product.status === 'published')
    .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));

  const search = document.querySelector('#picks-search');
  for (const section of document.querySelectorAll('[data-category]')) {
    const grid = section.querySelector('.picks-grid');
    const picks = published.filter(product => product.category === section.dataset.category);
    const visible = search ? picks : picks.slice(0, 3);
    const cards = visible.map(product => productCard(product, retailers[product.retailer]));
    grid.append(...cards);

    if (!search) continue;
    search.disabled = false;
    function filterPicks() {
      const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let matches = 0;
      visible.forEach((product, index) => {
        const text = [product.name, product.description, product.retailer].join(' ').toLowerCase();
        const match = terms.every(term => text.includes(term));
        cards[index].hidden = !match;
        matches += Number(match);
      });
      if (!visible.length) showStatus('Picks are being prepared.');
      else if (!matches) showStatus('No picks match your search.');
      else showStatus(matches + (matches === 1 ? ' pick' : ' picks'));
    }

    search.addEventListener('input', filterPicks);
    filterPicks();
  }

  document.querySelector('#amazon-disclosure').hidden = retailers.Amazon?.active !== true;
  if (!published.length) showStatus('Picks are being prepared.');
}

loadPicks().catch(() => showStatus('The product collections are temporarily unavailable.'));
