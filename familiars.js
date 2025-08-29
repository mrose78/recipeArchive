const API_KEY = 'AIzaSyCHKDWth1y6WpLQ4qZIQ-IqRy-FVDkNlnU';
const SHEET_ID = '1-LhDIZwUpFJR1TlGUgJgCKE14II4UzLjcKg7WOQ1FPQ';
const RANGE = 'Familiars!A2:Z';

const listContainer = document.getElementById('familiar-list');
const searchInput = document.getElementById('search');
const ownToggle = document.getElementById('own-toggle');

let familiars = [];

// 🧠 Utility: Build portrait URL from ID
function getFamiliarImageUrl(name) {
  //if (!id || id.length < 3) return null;
  //const folder = parseInt(id.slice(0, id.length - 2)) + 1;
  //return `https://www1.flightrising.com/static/cms/familiar/art/${id}.png`;
  return 'familiars_images\\' + name + '.png' 
}

//async function fetchData() {
//  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
//  const response = await fetch(url);
//  const data = await response.json();
//  const rows = data.values;

//  if (!rows || rows.length < 2) return;

//  const headers = rows[0];
//  familiars = rows.slice(1).map(row => {
//    const obj = {};
//    headers.forEach((key, index) => {
//      obj[key] = row[index] || '';
//    });
//    return obj;
//  });

//  renderFamiliars(familiars);
//}

async function fetchData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const rows = data.values;

  if (!rows || rows.length < 2) return;

  const headers = rows[0];
  familiars = rows
    .slice(1)
    .filter(row => row[0] && row[0].trim() !== '') // only keep if first column is not empty
    .map(row => {
      const obj = {};
      headers.forEach((key, index) => {
        obj[key] = row[index] || '';
      });
      return obj;
    });

  renderFamiliars(familiars);
}

function renderFamiliars(data) {
  const searchTerm = searchInput.value.toLowerCase();
  const showOwnedOnly = ownToggle.checked;

  const filtered = data.filter(familiar => {
    const matchesSearch =
      (familiar.Name || '').toLowerCase().includes(searchTerm) ||
      (familiar.Source || '').toLowerCase().includes(searchTerm);

    //const isOwned = showOwnedOnly ? dragon.Own?.toLowerCase() === 'x' : true;
    const isOwned = showOwnedOnly
        ? ['x', 'yes', 'true'].includes((familiar.Own || '').trim().toLowerCase())
        : true;

    return matchesSearch && isOwned;
  });

  listContainer.innerHTML = '';

  filtered.forEach(familiar => {
    const card = document.createElement('div');
    card.className = 'relative bg-white rounded-lg shadow p-4 transition hover:scale-105 flex flex-col';

    // ID Badge (top right)
    const idBadge = document.createElement('div');
    idBadge.className = 'absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded';
    idBadge.textContent = familiar.ID || '—';
    card.appendChild(idBadge);

    // Image (if ID exists)
    //const imgUrl = getFamiliarImageUrl(familiar.ID);
    const imgUrl = getFamiliarImageUrl(familiar.Name);
    if (imgUrl) {
      const image = document.createElement('img');
      image.src = imgUrl;
      image.alt = `Portrait of ${familiar.Name}`;
      image.className = `w-full h-40 object-contain rounded mb-2 ${['x', 'yes', 'true'].includes((familiar.Own || '').trim().toLowerCase()) ? '' : 'grayscale'}`;

      card.appendChild(image);
    }

    // Card Content
    card.innerHTML += `
      <h2 class="text-xl font-bold mb-2">${familiar.Name}</h2>
      <p><strong>Source:</strong> ${familiar.Source}</p>
    `;

    listContainer.appendChild(card);
  });
}

// 🔁 Event listeners
searchInput.addEventListener('input', () => renderFamiliars(familiars));
ownToggle.addEventListener('change', () => renderFamiliars(familiars));

// 🚀 Go!
fetchData();
