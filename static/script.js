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
          ${data.google_results.map(item => `<li><a href="${item.link}" target="_blank">${item.title}</a>: ${item.snippet}</li>`).join("") || "<li>No results found.</li>"}
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
  