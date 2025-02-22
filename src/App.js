import { useEffect, useRef } from 'react';
import { Molecule } from 'openchemlib/full'; // Use full version for complete support
import './App.css';

const MOLECULES = [
  { smiles: 'C', name: 'Methane' },
  { smiles: 'CC', name: 'Ethane' },
  { smiles: 'O=C=O', name: 'Carbon Dioxide' },
  { smiles: 'CCO', name: 'Ethanol' },
  { smiles: 'c1ccccc1', name: 'Benzene' },
  { smiles: 'CN', name: 'Methylamine' },
  { smiles: 'CC(=O)O', name: 'Acetate' },
  { smiles: 'C1CCCCC1', name: 'Cyclohexane' },
  { smiles: 'C#N', name: 'Hydrogen Cyanide' },
  { smiles: 'C=C', name: 'Ethene' },
  { smiles: 'CCN', name: 'Ethylamine' },
  { smiles: 'CCOCC', name: 'Diethyl Ether' },
  { smiles: 'CC(=O)CC', name: 'Butanone' },
  { smiles: 'CC(C)O', name: 'Isopropanol' },
  { smiles: 'CC(C)(C)O', name: 'tert-Butanol' },
  { smiles: 'C(CO)O', name: 'Glycolaldehyde' },
  { smiles: 'C1=CC=CC=C1O', name: 'Phenol' },
  { smiles: 'C1=CC=C(C=C1)O', name: 'Catechol' },
  { smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O', name: 'Aspirin' },
  { smiles: 'CC(=O)NCC1=CC=CC=C1', name: 'Acetanilide' },
  { smiles: 'CCN(CC)CC', name: 'Tetraethylamine' },
  { smiles: 'NCC(O)CO', name: 'Serine (Amino Acid)' },
  { smiles: 'CC(C)C1=CC=CC=C1', name: 'Cumene' },
  { smiles: 'C1C=CC=CC=1', name: 'Cyclopentadiene' },
  { smiles: 'CC(C)CC', name: 'Pentane' },
  { smiles: 'CCOCCOCCO', name: 'Polyethylene Glycol' },
  { smiles: 'C1CCCCCC1', name: 'Cycloheptane' },
  { smiles: 'CC(C)CC(C)CC(C)C', name: 'Squalene' },
  { smiles: 'CC(=O)CC(=O)C', name: 'Diacetyl' },
  { smiles: 'CC(=O)CC(=O)CC(=O)', name: 'Triacetyl' },
  { smiles: 'CCOCCOC', name: 'Dioxane' },
  { smiles: 'C1COC2=C(O1)C=CC=C2', name: 'Coumarin' },
  { smiles: 'C1=CC=C2C(=C1)C=CC=C2', name: 'Naphthalene' },
  { smiles: 'O=C(O)C(O)=O', name: 'Oxalic Acid' },
  { smiles: 'C1CC2=C(C1)C=CC=C2O', name: 'Flavone' },
  { smiles: 'CC(C)CC(C)(C)C', name: 'Neopentane' },
  { smiles: 'C1=CNC=N1', name: 'Pyrimidine' },
  { smiles: 'C1CNCCN1', name: 'Piperazine' },
  { smiles: 'C1CNCC1', name: 'Pyrrolidine' },
  { smiles: 'C1=CC=CC=N1', name: 'Pyridine' },
  { smiles: 'C1=NC=NC=N1', name: 'Purine' },
  { smiles: 'C1C=NC=N1', name: 'Imidazole' },
  { smiles: 'C1=CC=C(C=C1)N', name: 'Aniline' },
  { smiles: 'O=C(NCC1=CC=CC=C1)C2=CC=CC=C2', name: 'Lidocaine' },
  { smiles: 'O=C1C=C(O)C(=O)C=C1', name: 'Quinone' },
];

function App() {
  const canvasRef = useRef(null);
  let hoveredMolecule = null;
  let parallaxOffset = { x: 0, y: 0 };

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

    class MoleculeSprite {
      constructor() {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 0.5;

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

        if (hoveredMolecule === this) {
          ctx.fillStyle = 'black';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(this.name, this.x, this.y - 30);
        }
      }

      isHovered(mouseX, mouseY) {
        return (
          mouseX >= this.x - this.size / 3 &&
          mouseX <= this.x + this.size / 3 &&
          mouseY >= this.y - this.size / 3 &&
          mouseY <= this.y + this.size / 3
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
      if (Math.random() < 0.02) {
        molecules.push(new MoleculeSprite());
      }
      molecules.forEach(molecule => molecule.draw());
      requestAnimationFrame(animate);
    }

    function handleInteraction(x, y) {
      hoveredMolecule = molecules.find(mol => mol.isHovered(x, y)) || null;
    }

    function handleClick(event) {
      if (hoveredMolecule) {
        hoveredMolecule.stopped = !hoveredMolecule.stopped;
      }
    }

    function handleMouseMove(event) {
      const rect = canvas.getBoundingClientRect();
      handleInteraction(event.clientX - rect.left, event.clientY - rect.top);
    }

    function handleTouchMove(event) {
      event.preventDefault();
      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      handleInteraction(touch.clientX - rect.left, touch.clientY - rect.top);
    }

    function handleTouchStart(event) {
      event.preventDefault();
      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      handleInteraction(touch.clientX - rect.left, touch.clientY - rect.top);
      handleClick();
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return (
    <div className="App">
      <canvas ref={canvasRef} style={{ background: 'transparent' }} />
    </div>
  );
}

export default App;
