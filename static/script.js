/* ==========================
   Section 1 - Star Map & Star Ball
   ========================== */
   (function initStarMap() {
    const canvas = document.getElementById('star-map');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
  
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000033);
  
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 1000;
  
    const starCount = 1000000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 5000;
    }
  
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x0ff,
      size: 1,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
  
    function animate() {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0005;
      renderer.render(scene, camera);
    }
    animate();
  
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  })();
  
  /* ==========================
     Section 1 - Transition: Star Ball to Visualizer
     ========================== */
  (function initTransition() {
    const starBall = document.getElementById('center-circles');
    const visualizerCanvas = document.getElementById('visualizer');
    const escapeBtn = document.getElementById('escape-btn');
    const ctx = visualizerCanvas.getContext('2d');
  
    function resizeVisualizer() {
      visualizerCanvas.width = window.innerWidth;
      visualizerCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeVisualizer);
    resizeVisualizer();
  
    let phase = 0;
    function animateVisualizer() {
      ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
      const centerY = visualizerCanvas.height / 2;
      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        const amplitude = 30 + i * 20;
        const frequency = 0.02 + i * 0.005;
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(0,255,255,${0.6 - i * 0.15})`;
        for (let x = 0; x < visualizerCanvas.width; x += 2) {
          const y = centerY + amplitude * Math.sin(frequency * x + phase + i);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      phase += 0.05;
      requestAnimationFrame(animateVisualizer);
    }
  
    starBall.addEventListener('click', () => {
      starBall.style.opacity = '0';
      setTimeout(() => {
        starBall.style.display = 'none';
        visualizerCanvas.style.display = 'block';
        escapeBtn.style.display = 'block';
        animateVisualizer();
      }, 1000);
    });
  
    escapeBtn.addEventListener('click', () => {
      visualizerCanvas.style.display = 'none';
      escapeBtn.style.display = 'none';
      starBall.style.display = 'block';
      setTimeout(() => {
        starBall.style.opacity = '1';
      }, 100);
    });
  })();
  
  /* ==========================
     Section 2 - Search Bar Functionality
     ========================== */
  document.getElementById('search-btn').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    if (!query) return;
  
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = "<p>Loading...</p>";
  
    try {
      const response = await fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: query, modality: "text" })
      });
  
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
  
      const data = await response.json();
  
      resultsContainer.innerHTML = `
        <h2>Deep Summary</h2>
        <p>${data.ai_answer}</p>
        <h3>Sanity Results</h3>
        <ul>
          ${data.sanity_results.map(item => `<li><strong>${item.title}</strong>: ${item.body}</li>`).join("") || "<li>No results found.</li>"}
        </ul>
        <h3>Google Results</h3>
        <ul>
          ${data.google_results.map(item => `
            <li>
              <a href="${item.link}" target="_blank">${item.title}</a>: ${item.snippet} 
              <button class="favorite-btn" data-title="${item.title}" data-link="${item.link}" data-snippet="${item.snippet}">★</button>
            </li>
          `).join("") || "<li>No results found.</li>"}
        </ul>
      `;
    } catch (error) {
      resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  });
  

/* ==========================
     Section 4 - Voice input.
     ========================== */

  (function initVoiceSearch() {
    const voiceBtn = document.getElementById('voice-btn');
    const searchInput = document.getElementById('search-input');
    
    // Check for browser support for Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log("Voice recognition not supported in this browser.");
      voiceBtn.style.display = 'none';
      return;
    }
    
    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // When the voice button is clicked, start recognition
    voiceBtn.addEventListener('click', () => {
      recognition.start();
      voiceBtn.innerText = 'Listening...';
    });
    
    // Process the recognized speech
    recognition.addEventListener('result', (event) => {
      const transcript = event.results[0][0].transcript;
      searchInput.value = transcript;
      voiceBtn.innerText = '🎤';
      // Optionally, automatically trigger the search
      document.getElementById('search-btn').click();
    });
    
    // Reset button when speech ends
    recognition.addEventListener('speechend', () => {
      recognition.stop();
      voiceBtn.innerText = '🎤';
    });
    
    // Handle any errors
    recognition.addEventListener('error', (event) => {
      console.error('Speech recognition error:', event.error);
      voiceBtn.innerText = '🎤';
    });
  })();


/* ========================================
      Autocomplete and Suggestions feature
   ======================================== */

  
(function initAutocomplete() {
  const searchInput = document.getElementById('search-input');
  const suggestionsContainer = document.getElementById('suggestions-container');

  searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (query.length === 0) {
      suggestionsContainer.style.display = 'none';
      suggestionsContainer.innerHTML = '';
      return;
    }
    
    try {
      const response = await fetch(`/autocomplete?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions. Status: ${response.status}`);
      }
      const data = await response.json();
      const suggestions = data.suggestions;
      if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = suggestions
          .map(s => `<div class="suggestion-item">${s}</div>`)
          .join('');
        suggestionsContainer.style.display = 'block';
        // Add click event listeners to each suggestion item
        document.querySelectorAll('#suggestions-container .suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            searchInput.value = item.innerText;
            suggestionsContainer.style.display = 'none';
            document.getElementById('search-btn').click();
          });
        });
      } else {
        suggestionsContainer.style.display = 'none';
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      suggestionsContainer.style.display = 'none';
    }
  });
})();

  


/* ========================================
      Raycasting
   ======================================== */
   (function initStarMap() {
    const canvas = document.getElementById('star-map');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000033);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 1000;
    
    const starCount = 1000000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 5000;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x0ff,
      size: 1,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
    
    function animate() {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0005;
      renderer.render(scene, camera);
    }
    animate();
    
    // Add raycasting for interactive star clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    canvas.addEventListener('click', (event) => {
      // Convert click coordinates to normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(stars);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const point = intersect.point;
        // Generate a fun fact about the star
        const starInfo = `Star Coordinates:<br>X: ${point.x.toFixed(2)}<br>Y: ${point.y.toFixed(2)}<br>Z: ${point.z.toFixed(2)}<br><br>Fun Fact: Stars can be billions of years old!`;
        // Display the modal with the star information
        const modal = document.getElementById('star-info-modal');
        const starInfoDiv = document.getElementById('star-info');
        starInfoDiv.innerHTML = starInfo;
        modal.style.display = 'block';
      }
    });
    
    // Close modal when the close button is clicked
    document.getElementById('modal-close').addEventListener('click', () => {
      document.getElementById('star-info-modal').style.display = 'none';
    });
    
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  })();
  


/* ===================================================
     Favorites/Bookmarking feature using localStorage
   =================================================== */

(function initFavorites() {
  // Helper functions to load and save favorites
  function loadFavorites() {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  }
  
  function saveFavorites(favorites) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
  
  function updateFavoritesUI() {
    const favorites = loadFavorites();
    const favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = favorites.map(fav => `
      <li>
        <a href="${fav.link}" target="_blank">${fav.title}</a>
        <button class="remove-fav-btn" data-link="${fav.link}">Remove</button>
      </li>
    `).join("");
    
    // Attach event listeners for remove buttons
    document.querySelectorAll(".remove-fav-btn").forEach(btn => {
      btn.addEventListener("click", (event) => {
        const link = event.target.getAttribute("data-link");
        let favs = loadFavorites();
        favs = favs.filter(fav => fav.link !== link);
        saveFavorites(favs);
        updateFavoritesUI();
      });
    });
  }
  
  // Set up event listener for favorite buttons in search results
  document.addEventListener("click", function(event) {
    if (event.target.classList.contains("favorite-btn")) {
      const title = event.target.getAttribute("data-title");
      const link = event.target.getAttribute("data-link");
      const snippet = event.target.getAttribute("data-snippet");
      let favorites = loadFavorites();
      // Only add if not already present
      if (!favorites.some(fav => fav.link === link)) {
        favorites.push({ title, link, snippet });
        saveFavorites(favorites);
        updateFavoritesUI();
      }
      event.target.disabled = true; // Optionally disable the button after adding
    }
  });
  
  // Initialize favorites UI on page load
  updateFavoritesUI();
})();
