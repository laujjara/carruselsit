// --- CONFIGURACIÓN ---
const restApiUrl = "https://services7.arcgis.com/lsxbLWF2l19Rmhqj/ArcGIS/rest/services/IndicadoresBanner/FeatureServer/0/query?where=1%3D1&outFields=*&f=json";
const itemsPerPage = 5; // 5 tarjetas por vista
const autoScrollInterval = 8000; // velocidad más lenta

// --- ELEMENTOS DEL DOM ---
const slider = document.getElementById('indicator-slider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentIndex = 0;
let totalItems = 0;
let autoScrollTimer;

// Función para obtener datos y crear las tarjetas
async function initializeCarousel() {
  try {
    const response = await fetch(restApiUrl);
    if (!response.ok) {
      throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.features) {
      throw new Error("Formato de datos incorrecto desde el servicio de ArcGIS.");
    }

    const indicators = data.features;
    totalItems = indicators.length;

    if (totalItems === 0) {
      slider.innerHTML = "<p>No se encontraron indicadores en el servicio.</p>";
      return;
    }

    slider.innerHTML = indicators.map(item => {
      const attr = item.attributes;
      const link = attr.URL_Destino || '#';
      const icon = attr.URL_Icono || '';
      const title = attr.NombreIndicador || 'Indicador';
      const description = attr.Descripcion || '';
      const year = attr.anio || '';
      const displayValue = attr.ValorIndicador || 'N/A';

      return `
        <div class="indicator-card">
          <a href="${link}" target="_top">
            <div class="icon-container">
              <img src="${icon}" alt="${title}">
            </div>
            <div class="text-container">
              <p class="nombre-indicador">${title}</p>
              <p class="descripcion">${description}</p>
              <p class="anio">${year}</p>
              <div class="valor-indicador">${displayValue}</div>
            </div>
          </a>
        </div>
      `;
    }).join('');

    // Pausar al entrar y reanudar al salir de una tarjeta
    const cards = slider.querySelectorAll('.indicator-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', stopAutoScroll);
      card.addEventListener('mouseleave', startAutoScroll);
    });

    startAutoScroll();
  } catch (error) {
    console.error('Error detallado al cargar los indicadores:', error);
    slider.innerHTML = `<p style="color: red; padding: 20px;">Error: No se pudieron cargar los indicadores.</p>`;
  }
}

function updateCarousel() {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentIndex >= totalPages) currentIndex = 0;
  if (currentIndex < 0) currentIndex = totalPages - 1;

  const offset = -currentIndex * 100;
  slider.style.transform = `translateX(${offset}%)`;
}

function showNext() { currentIndex++; updateCarousel(); }
function showPrev() { currentIndex--; updateCarousel(); }

function startAutoScroll() {
  stopAutoScroll();
  autoScrollTimer = setInterval(showNext, autoScrollInterval);
}

function stopAutoScroll() {
  if (autoScrollTimer) {
    clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }
}

prevBtn.addEventListener('click', () => { showPrev(); stopAutoScroll(); });
nextBtn.addEventListener('click', () => { showNext(); stopAutoScroll(); });

// Iniciar
initializeCarousel();
