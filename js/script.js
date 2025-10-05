// Global Variables
let globalChart = null;
let map = null;
let modisLayer = null;

// NASA GIBS WMTS Configuration
const GIBS_URL = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg';
const TILE_MATRIX_SET = 'GoogleMapsCompatible_Level9';

document.addEventListener('DOMContentLoaded', () => {
    // --- MAP PAGE SPECIFIC CODE ---
    if (document.getElementById('map')) {
        // --- CONFIGURATION ---
        const timelessLayers = ['ASTER_GDEM_Color_Index', 'ASTER_Global_Emissivity_100m', 'ASTER_Global_Digital_Elevation_Model_V003'];

        // --- DATA ---
        const eventsData = [
            {
                year: 2005,
                lat: 29.95,
                lng: -90.07,
                title: "Hurricane Katrina",
                description: "One of the most destructive hurricanes in U.S. history, causing massive flooding in New Orleans."
            },
            {
                year: 2010,
                lat: 63.62,
                lng: -19.61,
                title: "Eyjafjallajökull Eruption",
                description: "An Icelandic volcano eruption that disrupted European air travel for weeks due to a massive ash cloud."
            },
            {
                year: 2020,
                lat: -35.0,
                lng: 149.0,
                title: "Australian 'Black Summer' Bushfires",
                description: "Unprecedentedly widespread and destructive bushfires that burned across southeastern Australia."
            },
            {
                year: 2020,
                lat: 38.0,
                lng: -120.0,
                title: "California Wildfire Siege",
                description: "A series of massive wildfires, including the August Complex fire, the largest in California's history."
            }
        ];

        // --- MAP INITIALIZATION ---
        const map = L.map('map', { minZoom: 2 }).setView([20, 0], 2);
        let currentLayer = null;
        let eventMarkers = L.layerGroup().addTo(map);

        // --- DOM ELEMENTS ---
        const yearSlider = document.getElementById('year-slider');
        const yearLabel = document.getElementById('year-label');
        const layerSwitcher = document.getElementById('layer-switcher');

        // --- UI PANEL TOGGLE LOGIC ---
        const toggleBtn = document.getElementById('toggle-ui-btn');
        const uiPanel = document.getElementById('ui-panel');

        toggleBtn.addEventListener('click', () => {
            uiPanel.classList.toggle('is-visible');
        });

        // Add loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Loading tiles...';
        document.body.appendChild(loadingIndicator);

        // --- CORE MAP FUNCTION ---
        function updateMap(year, layerName) {
            // 1. Update satellite layer
            const date = `${year}-06-15`;
            const isTimeless = timelessLayers.includes(layerName);
            
            // Configure the tile URL based on layer type
            const tileUrl = isTimeless 
                ? `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerName}/default/{tileMatrixSet}/{z}/{y}/{x}.jpg`
                : `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerName}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg`;

            // Configure layer options
            const layerOptions = {
                tileMatrixSet: 'GoogleMapsCompatible_Level9',
                maxNativeZoom: 9,
                maxZoom: 12,
                attribution: '<a href="https://earthdata.nasa.gov/eosdis/science-system-description/services-and-tools/gibs">NASA GIBS</a>'
            };

            // Add time parameter only for time-based layers
            if (!isTimeless) {
                layerOptions.time = date;
            }

            const newLayer = L.tileLayer(tileUrl, layerOptions).on('tileerror', function(error) {
                console.error(`Tile Error: Could not load tile for layer ${layerName}`, error);
                loadingIndicator.textContent = `Error loading ${layerName}`;
                loadingIndicator.classList.add('visible', 'error');
                setTimeout(() => {
                    loadingIndicator.classList.remove('visible', 'error');
                    loadingIndicator.textContent = 'Loading tiles...';
                }, 3000);
            });

            if (currentLayer) {
                map.removeLayer(currentLayer);
            }
            currentLayer = newLayer;
            currentLayer.addTo(map);

            // Show loading indicator
            loadingIndicator.classList.add('visible');
            setTimeout(() => {
                loadingIndicator.classList.remove('visible');
            }, 1000);

            // 2. Update event markers
            eventMarkers.clearLayers();
            const eventsForYear = eventsData.filter(event => event.year === parseInt(year));
            eventsForYear.forEach(event => {
                const popupContent = `<h3>${event.title}</h3><p>${event.description}</p>`;
                L.marker([event.lat, event.lng])
                    .bindPopup(popupContent)
                    .addTo(eventMarkers);
            });
        }

        // --- EVENT LISTENERS ---
        // Slider for changing the year
        yearSlider.addEventListener('input', (e) => {
            const year = e.target.value;
            const selectedLayer = document.querySelector('input[name="layer"]:checked').value;
            yearLabel.textContent = year;
            updateMap(year, selectedLayer);
        });

        // Radio buttons for changing the data layer
        layerSwitcher.addEventListener('change', (e) => {
            if (e.target.name === 'layer') {
                const year = yearSlider.value;
                const selectedLayer = e.target.value;
                updateMap(year, selectedLayer);
            }
        });

        // --- INITIAL LOAD ---
        function initialLoad() {
            const initialYear = yearSlider.value;
            const initialLayer = document.querySelector('input[name="layer"]:checked').value;
            yearLabel.textContent = initialYear;
            updateMap(initialYear, initialLayer);
        }

        initialLoad();
    }

    // --- GLOBAL SITE LOGIC ---
    // --- Dynamic Shrinking Header ---
    const header = document.getElementById('main-header');
    const logoLink = document.querySelector('.logo-link');
    let isHeaderShrunk = false; // State variable to prevent jittering

    window.addEventListener('scroll', () => {
        // Condition to SHRINK the header
        if (window.scrollY > 100 && !isHeaderShrunk) {
            header.classList.add('header-scrolled');
            isHeaderShrunk = true;
        } 
        // Condition to EXPAND the header
        else if (window.scrollY <= 100 && isHeaderShrunk) {
            header.classList.remove('header-scrolled');
            isHeaderShrunk = false;
        }
    });

    // Initialize header state on page load
    if (window.scrollY > 100) {
        header.classList.add('header-scrolled');
        isHeaderShrunk = true;
    }

    // --- Scroll to Top on Logo Click ---
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Mobile Menu functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    mobileMenuToggle?.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close mobile menu when clicking a link
    mainNav?.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            mobileMenuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    const modal = document.getElementById('data-modal');
    const dataButton = document.querySelector('.cta-button');
    const closeButton = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');

    // Open modal and initialize chart
    dataButton?.addEventListener('click', () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Initialize chart if it doesn't exist
        if (!globalChart) {
            const ctx = document.createElement('canvas');
            document.getElementById('chart-container').appendChild(ctx);
            
            const data = {
                labels: ['2000', '2005', '2010', '2015', '2020', '2025'],
                datasets: [{
                    label: 'Global Temperature Anomaly (°C)',
                    data: [0.39, 0.54, 0.72, 0.90, 1.02, 1.15],
                    backgroundColor: 'rgba(236, 64, 122, 0.5)',
                    borderColor: 'rgba(236, 64, 122, 1)',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            };

            globalChart = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#D0D6F9'
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: {
                                color: 'rgba(208, 214, 249, 0.1)'
                            },
                            ticks: {
                                color: '#D0D6F9'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(208, 214, 249, 0.1)'
                            },
                            ticks: {
                                color: '#D0D6F9'
                            }
                        }
                    }
                }
            });
        }
    });

    // Close modal functions
    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Cleanup chart
        if (globalChart) {
            globalChart.destroy();
            globalChart = null;
            document.getElementById('chart-container').innerHTML = '';
        }
    };

    // Close with button
    closeButton?.addEventListener('click', closeModal);

    // Close with overlay click
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
});