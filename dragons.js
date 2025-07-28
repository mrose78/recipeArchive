const API_KEY = 'AIzaSyCHKDWth1y6WpLQ4qZIQ-IqRy-FVDkNlnU';
const SHEET_ID = '1-LhDIZwUpFJR1TlGUgJgCKE14II4UzLjcKg7WOQ1FPQ';
const RANGE = 'Dragons!A1:Z';

const listContainer = document.getElementById('dragon-list');
const searchInput = document.getElementById('search');
const ownToggle = document.getElementById('own-toggle');

let dragons = [];

// 🧠 Utility: Build portrait URL from ID
function getDragonImageUrl(id) {
  if (!id || id.length < 3) return null;
  const folder = parseInt(id.slice(0, id.length - 2)) + 1;
  return `https://flightrising.com/rendern/portraits/${folder}/${id}p.png`;
}

async function fetchData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  const rows = data.values;

  if (!rows || rows.length < 2) return;

  const headers = rows[0];
  dragons = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((key, index) => {
      obj[key] = row[index] || '';
    });
    return obj;
  });

  renderDragons(dragons);
}

function renderDragons(data) {
  const searchTerm = searchInput.value.toLowerCase();
  const showOwnedOnly = ownToggle.checked;

  const filtered = data.filter(dragon => {
    const matchesSearch =
      (dragon.Name || '').toLowerCase().includes(searchTerm) ||
      (dragon.Breed || '').toLowerCase().includes(searchTerm) ||
      (dragon.Element || '').toLowerCase().includes(searchTerm);

    //const isOwned = showOwnedOnly ? dragon.Own?.toLowerCase() === 'x' : true;
    const isOwned = showOwnedOnly
        ? ['x', 'yes', 'true'].includes((dragon.Own || '').trim().toLowerCase())
        : true;

    return matchesSearch && isOwned;
  });

  listContainer.innerHTML = '';

  filtered.forEach(dragon => {
    const card = document.createElement('div');
    card.className = 'relative bg-white rounded-lg shadow p-4 transition hover:scale-105 flex flex-col';

    // ID Badge (top right)
    const idBadge = document.createElement('div');
    idBadge.className = 'absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded';
    idBadge.textContent = dragon.ID || '—';
    card.appendChild(idBadge);

    // Image (if ID exists)
    const imgUrl = getDragonImageUrl(dragon.ID);
    if (imgUrl) {
      const image = document.createElement('img');
      image.src = imgUrl;
      image.alt = `Portrait of ${dragon.Name}`;
      image.className = `w-full h-40 object-contain rounded mb-2 ${['x', 'yes', 'true'].includes((dragon.Own || '').trim().toLowerCase()) ? '' : 'grayscale'}`;

      card.appendChild(image);
    }

    // Card Content
    card.innerHTML += `
      <h2 class="text-xl font-bold mb-2">${dragon.Name || 'Unnamed'} (${dragon.Breed || 'Unknown'})</h2>
      <p><strong>Hatchday:</strong> ${dragon.Hatchday}</p>
      <p><strong>Own:</strong> ${dragon.Own}</p>
      <p><strong>Next Breed:</strong> ${dragon["Next Breed Date"]}</p>
      <p><strong>Sex:</strong> ${dragon.Sex}</p>
      <p><strong>Age:</strong> ${dragon.Age}</p>
      <p><strong>Genes:</strong> ${dragon["1st Gene"]} / ${dragon["2nd Gene"]} / ${dragon["3rd Gene"]}</p>
      <p><strong>Colors:</strong> ${dragon["1st Color"]}, ${dragon["2nd Color"]}, ${dragon["3rd Color"]}</p>
      <p><strong>Element:</strong> ${dragon.Element} (${dragon["Eye Type"]})</p>
      ${dragon.PredictURL ? `<a href="${dragon.PredictURL}" class="text-blue-600 underline mt-2 block">Predict Link</a>` : ''}
    `;

    listContainer.appendChild(card);
  });
}

// 🔁 Event listeners
searchInput.addEventListener('input', () => renderDragons(dragons));
ownToggle.addEventListener('change', () => renderDragons(dragons));

// 🚀 Go!
fetchData();
