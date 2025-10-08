const API_URL = 'https://script.google.com/macros/s/AKfycbwPmUaagSIZswTtGgnvZAAvtqIrTddRJ9DvdLs4hKlechtKrvc1dBLoLokufnsrg-x4Ew/exec'; 
let allFrogs = [];

// Helper function to convert Rarity string to a number for sorting
function getRarityValue(rarityString) {
    // You'll need to adjust these values based on your actual Pocket Frogs rarities
    const rarityMap = {
        'Common': 1,
        'Rare': 2,
        'Legendary': 3,
        // Add all your rarity levels here
        'Taming': 0.5 // Example of another level
    };
    // Use 100 for unknown or uncaught types to push them to the end
    return rarityMap[rarityString] || 100; 
}

// 1. Fetch data from Google Apps Script
async function fetchFrogs() {
    try {
        const response = await fetch(API_URL);
        allFrogs = await response.json();
        
        // Initial rendering with default sort/filter
        filterAndSortFrogs(); 
    } catch (error) {
        document.getElementById('frog-collection').innerHTML = '<p>Error loading data. Check your Apps Script deployment URL.</p>';
        console.error("Error fetching frog data:", error);
    }
}

// 2. Render the frog cards (Updated for image container)
function renderFrogs(frogs) {
    const container = document.getElementById('frog-collection');
    container.innerHTML = ''; 

    frogs.forEach(frog => {
        const statusClass = frog.status.toLowerCase().replace(/\s/g, '-'); 
        
        const card = document.createElement('div');
        card.className = `frog-card status-${statusClass}`; 
        
        // **NEW: Added the frog-image-container for conditional overlay**
        card.innerHTML = `
            <div class="frog-image-container">
                <img src="${frog.imageon}" alt="${frog.frog}">
            </div>
            <h2>${frog.frog}</h2>
            <p>Rarity: ${frog.rarity}</p>
            <p>Status: ${frog.status}</p>
        `;
        container.appendChild(card);
    });
}

// 3. Combined Logic for Filtering and Sorting
function filterAndSortFrogs() {
    const statusFilter = document.getElementById('status-filter').value;
    const sortOption = document.getElementById('sort-option').value;
    
    let processedFrogs = allFrogs;

    // --- A. Filtering ---
    if (statusFilter !== 'all') {
        processedFrogs = processedFrogs.filter(frog => frog.status === statusFilter);
    }

    // --- B. Sorting ---
    if (sortOption === 'name-asc') {
        processedFrogs.sort((a, b) => a.frog.localeCompare(b.frog));
    } else if (sortOption === 'rarity-asc') {
        processedFrogs.sort((a, b) => {
            const rarityA = getRarityValue(a.rarity);
            const rarityB = getRarityValue(b.rarity);
            
            // Primary sort by Rarity value
            if (rarityA !== rarityB) {
                return rarityA - rarityB;
            }
            // Secondary sort by Name if Rarity is the same
            return a.frog.localeCompare(b.frog);
        });
    }

    renderFrogs(processedFrogs);
}

// Initial call to start the process
fetchFrogs();