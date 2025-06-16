// Configuration
const config = {
    pastebinUrl: 'https://pastebin.com/raw/p8hsZrGD',
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    defaultData: {
        status: "offline",
        message: "Service currently unavailable",
        links: {},
        version: "0.0.0"
    }
};

// Cache DOM elements
const elements = {
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    downloadGrid: document.getElementById('downloadGrid'),
    bypassBtn: document.getElementById('bypassBtn'),
    srcBtn: document.getElementById('srcBtn'),
    killsignBtn: document.getElementById('killsignBtn')
};

// Current state
let currentData = {};

/**
 * Fetches data from Pastebin
 * @returns {Promise<Object>} The parsed JSON data
 */
async function fetchData() {
    try {
        const response = await fetch(config.pastebinUrl, {
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return config.defaultData;
    }
}

/**
 * Updates the UI with new data
 * @param {Object} data - The data to display
 */
function updateUI(data) {
    currentData = data;
    
    // Update status
    updateStatus(data.status, data.message);
    
    // Update downloads
    updateDownloads(data.links, data.version);
    
    // Update purchase links
    updatePurchaseLinks(data.links);
}

/**
 * Updates the status indicator
 * @param {string} status - 'online' or 'offline'
 * @param {string} message - Status message
 */
function updateStatus(status, message) {
    elements.statusDot.className = `status-dot ${status}`;
    elements.statusText.textContent = message || 
        (status === 'online' ? 'All systems operational' : 'Service unavailable');
}

/**
 * Updates the downloads section
 * @param {Object} links - Key-value pairs of download names and URLs
 * @param {string} version - Current version
 */
function updateDownloads(links = {}, version = '1.0.0') {
    if (!links || Object.keys(links).length === 0) {
        elements.downloadGrid.innerHTML = `
            <div class="download-card">
                <h3 class="download-title"><i class="fas fa-exclamation-circle"></i> No Downloads Available</h3>
                <p>Check back later for updates.</p>
            </div>
        `;
        return;
    }
    
    elements.downloadGrid.innerHTML = Object.entries(links)
        .map(([name, url]) => {
            const formattedName = formatName(name);
            return `
                <div class="download-card">
                    <h3 class="download-title"><i class="fas fa-download"></i> ${formattedName}</h3>
                    <p>Version: ${version}</p>
                    <a href="${url}" class="download-btn" target="_blank">Download</a>
                </div>
            `;
        })
        .join('');
}

/**
 * Formats a link name for display
 * @param {string} name - The raw name (e.g., 'killsign')
 * @returns {string} Formatted name (e.g., 'Kill Sign')
 */
function formatName(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Updates purchase button links
 * @param {Object} links - Key-value pairs of product links
 */
function updatePurchaseLinks(links = {}) {
    if (links.bypass) elements.bypassBtn.href = links.bypass;
    if (links.src) elements.srcBtn.href = links.src;
    if (links.killsign) elements.killsignBtn.href = links.killsign;
}

/**
 * Initializes the application
 */
async function init() {
    try {
        const data = await fetchData();
        updateUI(data);
        
        // Set up periodic refresh
        setInterval(async () => {
            const newData = await fetchData();
            if (JSON.stringify(newData) !== JSON.stringify(currentData)) {
                updateUI(newData);
            }
        }, config.refreshInterval);
    } catch (error) {
        console.error('Initialization error:', error);
        updateUI(config.defaultData);
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
