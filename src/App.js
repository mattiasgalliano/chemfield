import { useEffect, useRef, useState } from 'react';
import { Molecule } from 'openchemlib/full'; // Use full version for complete support
import './App.css';
// import RDKitModule from 'rdkit'; // Import RDKit.js
// import * as $3Dmol from '3dmol';

const MOLECULES = [
  { smiles: 'NC1=NC=NC2=C1N=CN2', name: 'Adenine' },
  { smiles: 'O=C1NC(=O)NC=C1C', name: 'Thymine' },
  { smiles: 'O=C1Nccc(N)n1', name: 'Cytosine' },
  { smiles: 'N1C(N)=NC=2NC=NC2C1=O', name: 'Guanine' },

  { smiles: 'C[C@@H](C(=O)O)N', name: 'Alanine (A)' },
  { smiles: 'NC(CCCNC(N)=N)C(O)=O', name: 'Arginine (R)' },
  { smiles: 'O=C(N)C[C@H](N)C(=O)O', name: 'Asparagine (N)' },
  { smiles: 'O=C(O)CC(N)C(=O)O', name: 'Aspartic acid (D)' },
  { smiles: 'C([C@@H](C(=O)O)N)S', name: 'Cysteine (C)' },
  { smiles: 'C(CC(=O)O)[C@@H](C(=O)O)N', name: 'Glutamic acid (E)' },
  { smiles: 'O=C(N)CCC(N)C(=O)O', name: 'Glutamine (Q)' },
  { smiles: 'C(C(=O)O)N', name: 'Glycine (G)' },
  { smiles: 'O=C([C@H](CC1=CNC=N1)N)O', name: 'Histidine (H)' },
  { smiles: 'CC[C@H](C)[C@@H](C(=O)O)N', name: 'Isoleucine (I)' },
  { smiles: 'CC(C)C[C@@H](C(=O)O)N', name: 'Leucine (L)' },
  { smiles: 'NCCCCC(N)C(=O)O', name: 'Lysine (K)' },
  { smiles: 'CSCC[C@H](N)C(=O)O', name: 'Methionine (M)' },
  { smiles: 'N[C@@H](CC1=CC=CC=C1)C(O)=O', name: 'Phenylalanine (Phe)' },
  { smiles: 'OC(=O)C1CCCN1', name: 'Proline (P)' },
  { smiles: 'C([C@@H](C(=O)O)N)O', name: 'Serine (S)' },
  { smiles: 'C[C@H]([C@@H](C(=O)O)N)O', name: 'Threonine (T)' },
  { smiles: 'c1ccc2c(c1)c(c[nH]2)C[C@@H](C(=O)O)N', name: 'Tryptophan (W)' },
  { smiles: 'N[C@@H](Cc1ccc(O)cc1)C(O)=O', name: 'Tyrosine (Y)' },
  { smiles: 'CC(C)[C@@H](C(=O)O)N', name: 'Valine (V)' },
];

function App() {
  const canvasRef = useRef(null);
  let hoveredMolecule = null;
  let parallaxOffset = { x: 0, y: 0 };

  const [ripples] = useState([]);

  const [mode, setMode] = useState('discover');
  const [score, setScore] = useState(0);
  //const [hoveredMolecule, setHoveredMolecule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const molecules = [];

    window.addEventListener('resize', resize);
    resize();

    function drawGrid() {
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.strokeRect(x, y, gridSize, gridSize);
        }
      }
    }

    function drawParallaxBackground() {
      ctx.fillStyle = 'rgba(200, 200, 200, 0.05)';
      ctx.fillRect(parallaxOffset.x, parallaxOffset.y, canvas.width, canvas.height);
    }

    function createMoleculeImage(smilesStr, size, callback) {
      try {
        const mol = Molecule.fromSmiles(smilesStr);
        mol.ensureHelperArrays(Molecule.cHelperNeighbours);

        const svg = mol.toSVG(size * 1, size * 1, null, {
          showHs: true,
          bondThickness: 2,
          noStereoProblem: true,
        });

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
          URL.revokeObjectURL(url);
          callback(img);
        };

        img.src = url;
      } catch (error) {
        console.error(`Failed to create molecule for ${smilesStr}:`, error);
      }
    }


    // function createMoleculeImage(smilesStr, size, callback) {
    //   try {
    //     // Create a ChemDoodleWebComponent in the DOM
    //     const container = document.createElement('div');
    //     container.style.width = `${size}px`;
    //     container.style.height = `${size}px`;
    //     document.body.appendChild(container); // Temporarily add to body (can be removed after)
    
    //     // Initialize ChemDoodle web component
    //     const canvas = new ChemDoodleWebComponent(container);
    
    //     // Set the SMILES string to the ChemDoodle canvas
    //     canvas.setSmiles(smilesStr);
    
    //     // Convert the ChemDoodle canvas to an image
    //     setTimeout(() => {
    //       const image = new Image();
    //       image.src = canvas.toDataURL(); // Convert canvas to image URL
    
    //       // When the image is loaded, call the callback
    //       image.onload = () => {
    //         // Clean up the temporary container
    //         container.remove();
    //         callback(image);
    //       };
    //     }, 100); // Small timeout to ensure rendering is complete
    
    //   } catch (error) {
    //     console.error(`Failed to create molecule for ${smilesStr}:`, error);
    //   }
    // }  

    class MoleculeSprite {
      constructor() {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.25 + Math.random() * 0.5;

        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.size = 350 + Math.random() * 200;
        this.speed = speed;
        this.stopped = false;
        const molecule = MOLECULES[Math.floor(Math.random() * MOLECULES.length)];
        this.smiles = molecule.smiles;
        this.name = molecule.name;
        this.image = null;

        createMoleculeImage(this.smiles, this.size, (img) => {
          this.image = img;
        });
      }

      update() {
        if (!this.stopped) {
          this.x += this.dx;
          this.y += this.dy;
        }
      }

      draw() {
        if (!this.image) return;
        this.update();
        ctx.drawImage(this.image, this.x - this.size / 2 + parallaxOffset.x, this.y - this.size / 2 + parallaxOffset.y, this.size, this.size);

        if (hoveredMolecule == this && mode !== 'quiz') {
          ctx.fillStyle = 'blue';
          ctx.font = '24px OCR A Std';
          ctx.textAlign = 'center';
          ctx.fillText(this.name, this.x, this.y - 50);
        }
      }

      isHovered(mouseX, mouseY) {
        return (
          mouseX >= this.x - this.size / 9 &&
          mouseX <= this.x + this.size / 9 &&
          mouseY >= this.y - this.size / 9 &&
          mouseY <= this.y + this.size / 9
        );
      }
    }

    function drawBackground() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + parallaxOffset.x, canvas.height / 2 + parallaxOffset.y, 100,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, '#dedede');
      gradient.addColorStop(0.5, '#cacaca');
      gradient.addColorStop(1, '#999999');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Grey color with 50% transparency
      ctx.lineWidth = 0.5;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.strokeRect(x, y, gridSize, gridSize);
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // drawParallaxBackground();
      // drawGrid();
      drawBackground();
      if (Math.random() < 0.01) {
        molecules.push(new MoleculeSprite());
      }
      molecules.forEach(molecule => molecule.draw());
      drawRipples(); // Draw ripple effect
      requestAnimationFrame(animate);
    }

    //

    function addRippleEffect(x, y) {
      ripples.push({ x, y, radius: 5, opacity: 1 });
    }
    
    function drawRipples() {
      ctx.globalAlpha = 1;
      ripples.forEach((ripple, index) => {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 0, 0, ${ripple.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    
        // Update ripple properties
        ripple.radius += 3;
        ripple.opacity -= 0.025;
    
        // Remove finished ripples
        if (ripple.opacity <= 0) {
          ripples.splice(index, 1);
        }
      });
      ctx.globalAlpha = 1;
    }

    //

    function getQuizOptions(correctName) {
      let options = [correctName];
      while (options.length < 4) {
        const randomName = MOLECULES[Math.floor(Math.random() * MOLECULES.length)].name;
        if (!options.includes(randomName)) {
          options.push(randomName);
        }
      }
      return options.sort(() => Math.random() - 0.5);
    }

    function handleInteraction(x, y) {
      hoveredMolecule = molecules.find(mol => mol.isHovered(x, y)) || null;
    }

    function handleClick(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
    
      // Find the molecule under the click
      const clickedMolecule = molecules.find(mol => mol.isHovered(x, y));
    
      if (clickedMolecule) {
        // Toggle movement
        clickedMolecule.stopped = !clickedMolecule.stopped;
      }
    
      if (mode === 'quiz' && clickedMolecule) {
        const options = getQuizOptions(clickedMolecule.name);
        setQuizOptions(options);
        setCurrentAnswer(clickedMolecule.name);
    
        // Set modal position near the clicked molecule
        setModalPosition({
          top: event.clientY + 10,
          left: event.clientX + 10
        });
    
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    
      addRippleEffect(x, y);
    }

    function handleMouseMove(event) {
      const rect = canvas.getBoundingClientRect();
      handleInteraction(event.clientX - rect.left, event.clientY - rect.top);
    }

    // function handleTouchMove(event) {
    //   event.preventDefault();
    //   const touch = event.touches[0];
    //   const rect = canvas.getBoundingClientRect();
    //   handleInteraction(touch.clientX - rect.left, touch.clientY - rect.top);
    // }

    // function handleTouchStart(event) {
    //   event.preventDefault();
    //   const touch = event.touches[0];
    //   const rect = canvas.getBoundingClientRect();
    //   handleInteraction(touch.clientX - rect.left, touch.clientY - rect.top);
    //   handleClick();
    // }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    // canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    // canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      // canvas.removeEventListener('touchmove', handleTouchMove);
      // canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [mode, score, hoveredMolecule]);

  function getQuizOptions(correctName) {
    let options = [correctName];
    while (options.length < 4) {
      const randomName = MOLECULES[Math.floor(Math.random() * MOLECULES.length)].name;
      if (!options.includes(randomName)) {
        options.push(randomName);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  }

  function handleSelectOption(selectedOption) {
    if (selectedOption === currentAnswer && score < 10) {
      setScore(score + 1);
    }
    setShowModal(false);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  return (
    <div className="App" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <button 
        className="hamburger" 
        onClick={() => setMode(mode === 'discover' ? 'quiz' : 'discover')}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          fontSize: '30px',
          background: 'none',
          border: 'none',
          color: '#333',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        ☰
      </button>
      {mode === 'quiz' && <p className="score">Score: {score}</p>}
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {showModal && (
        <QuizModal 
          options={quizOptions} 
          onSelect={handleSelectOption} 
          onClose={handleCloseModal} 
          position={modalPosition} 
        />
      )}
    </div>
  );
}

function QuizModal({ options, onSelect, position }) {
  return (
    <div className="modal" style={{ ...modalStyle, top: position.top, left: position.left }}>
      <div className="modal-content" style={modalContentStyle}>
        <div className="button-container" style={buttonContainerStyle}>
          {options.map(option => (
            <button key={option} onClick={() => onSelect(option)} style={buttonStyle}>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const modalStyle = {
  position: 'absolute',
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly dark transparent background
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  padding: '10px',
  opacity: 0, // Start with hidden opacity
  animation: 'fadeIn 0.5s forwards', // Animation for modal fade-in
};

const modalContentStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0)', // Fully transparent background
  padding: '20px',
  textAlign: 'center',
  width: '200px', // Adjust width as needed
  backdropFilter: 'blur(10px)', // Apply blur effect to the background
  transform: 'translateY(-20px)', // Start the content slightly above
  animation: 'rollIn 0.5s forwards', // Animation for sliding in
};

const buttonContainerStyle = {
  display: 'flex',
  flexDirection: 'column', // Arrange buttons in a column (vertically)
  justifyContent: 'space-between', // Space the buttons evenly
  height: '200px', // Ensure there is space for exactly 4 rows
};

const buttonStyle = {
  margin: '5px 0',
  padding: '10px',
  fontSize: '16px',
  cursor: 'pointer',
  backgroundColor: 'rgba(255, 255, 255, 0.7)', // Light transparent background for buttons
  border: 'none',
  borderRadius: '5px',
  color: '#333', // Dark color for button text
  textAlign: 'center',
};

// Add keyframes for animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  @keyframes rollIn {
    0% { transform: translateY(-20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
`, styleSheet.cssRules.length);

export default App;
