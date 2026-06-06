import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SavedArtwork, TemplateType } from "../types";

interface Gallery3DProps {
  activeCanvasDataUrl: string;
  savedArtworks: SavedArtwork[];
}

const templateVietnameseNames: Record<TemplateType, string> = {
  whale: "Cá Voi Xanh Đại Dương",
  dolphin: "Bé Cá Heo Lướt Sóng",
  goldfish: "Cá Vàng Óng Ánh",
  shark: "Cá Mập Tuần Tra",
  turtle: "Bác Rùa Biển Chăm Chỉ",
  octopus: "Bạn Bạch Tuộc Tinh Nghịch",
};

export default function Gallery3D({ activeCanvasDataUrl, savedArtworks }: Gallery3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cubeFrameRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Hook to handle initialization of 3D Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 300;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b); // Zinc-950 background

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 5. Create 3D picture frame mesh using a box
    const frameGeometry = new THREE.BoxGeometry(2.6, 1.95, 0.15);

    // Draw frame backing and sides with elegant mahogany wood color,
    // and map the front surface with initial canvas screenshot texture.
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x854d0e, // warm gold/wood color
      roughness: 0.6,
      metalness: 0.1,
    });

    const initialImage = new Image();
    initialImage.src = activeCanvasDataUrl || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    
    // Front face material texture
    const initialTexture = new THREE.CanvasTexture(initialImage);
    const frontMaterial = new THREE.MeshBasicMaterial({
      map: initialTexture,
    });

    // Material array for the 6 faces of the BoxGeometry
    // Faces: Right, Left, Top, Bottom, Front, Back
    const materials = [
      woodMaterial, // right
      woodMaterial, // left
      woodMaterial, // top
      woodMaterial, // bottom
      frontMaterial, // front
      woodMaterial, // back
    ];

    const cubeFrame = new THREE.Mesh(frameGeometry, materials);
    cubeFrameRef.current = cubeFrame;
    scene.add(cubeFrame);

    // 6. Interaction controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = () => {
      isDragging = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      const deltaMove = {
        x: offsetX - previousMousePosition.x,
        y: offsetY - previousMousePosition.y,
      };

      if (isDragging && cubeFrameRef.current) {
        cubeFrameRef.current.rotation.y += deltaMove.x * 0.005;
        cubeFrameRef.current.rotation.x += deltaMove.y * 0.005;
      }

      previousMousePosition = { x: offsetX, y: offsetY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Attach mouse listeners directly to renderer element
    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Support touch interactions for tablet/phones
    let lastTouchX = 0;
    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        const rect = container.getBoundingClientRect();
        lastTouchX = e.touches[0].clientX - rect.left;
        lastTouchY = e.touches[0].clientY - rect.top;
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0 && cubeFrameRef.current) {
        const rect = container.getBoundingClientRect();
        const currentTouchX = e.touches[0].clientX - rect.left;
        const currentTouchY = e.touches[0].clientY - rect.top;
        
        const deltaX = currentTouchX - lastTouchX;
        const deltaY = currentTouchY - lastTouchY;
        
        cubeFrameRef.current.rotation.y += deltaX * 0.008;
        cubeFrameRef.current.rotation.x += deltaY * 0.008;

        lastTouchX = currentTouchX;
        lastTouchY = currentTouchY;
      }
    };
    renderer.domElement.addEventListener("touchstart", handleTouchStart);
    renderer.domElement.addEventListener("touchmove", handleTouchMove);
    renderer.domElement.addEventListener("touchend", handleMouseUp);

    // 7. Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging && cubeFrameRef.current) {
        // Slow autonomous rotation on y-axis
        cubeFrameRef.current.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize observer to handle fluid responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: dw, height: dh } = entry.contentRect;
        if (rendererRef.current) {
          rendererRef.current.setSize(dw, dh);
          camera.aspect = dw / dh;
          camera.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(container);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener("mousedown", handleMouseDown);
        rendererRef.current.domElement.removeEventListener("mousemove", handleMouseMove);
        rendererRef.current.domElement.removeEventListener("touchstart", handleTouchStart);
        rendererRef.current.domElement.removeEventListener("touchmove", handleTouchMove);
        rendererRef.current.domElement.removeEventListener("touchend", handleMouseUp);
      }
      window.removeEventListener("mouseup", handleMouseUp);
      frameGeometry.dispose();
      woodMaterial.dispose();
      frontMaterial.dispose();
      initialTexture.dispose();
      renderer.dispose();
    };
  }, []); // Run once on load to initialize context

  // Effect to update the texture when the active drawing canvas exports or saved artwork changes
  useEffect(() => {
    updateTexture(activeCanvasDataUrl);
  }, [activeCanvasDataUrl]);

  const updateTexture = (url: string) => {
    if (!cubeFrameRef.current) return;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const newTex = new THREE.CanvasTexture(img);
      const cube = cubeFrameRef.current;
      if (cube) {
        // Dispose old texture to free GPU memory
        const oldMat = (cube.material as THREE.Material[])[4] as THREE.MeshBasicMaterial;
        if (oldMat.map) oldMat.map.dispose();
        
        // Apply new texture on the front face (face index 4)
        const frontMaterial = new THREE.MeshBasicMaterial({ map: newTex });
        (cube.material as THREE.Material[])[4] = frontMaterial;
        frontMaterial.needsUpdate = true;
      }
    };
  };

  const selectSavedArtwork = (dataUrl: string) => {
    updateTexture(dataUrl);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Three.js viewport container */}
      <div className="relative w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden shadow-inner border border-zinc-800">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" id="threejs-container" />
        <div className="absolute bottom-3 left-3 bg-zinc-900/90 text-zinc-200 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-zinc-800 backdrop-blur">
          🖱️ Rê chuột trái hoặc vuốt để xoay | Trưng bày tranh do bé vẽ
        </div>
      </div>

      {/* List of artworks */}
      <div>
        <h4 className="font-extrabold text-zinc-400 text-xs mb-2 flex items-center gap-1.5">
          🖼️ Các tác phẩm đã hoàn thành treo trong phòng trưng bày:
        </h4>
        <div className="flex items-center gap-3 overflow-x-auto py-2 pr-2" id="gallery-scroller-works">
          {/* Quick item with active current canvas */}
          <div
            onClick={() => selectSavedArtwork(activeCanvasDataUrl)}
            className="relative flex-shrink-0 w-28 aspect-video bg-zinc-950 border border-dashed border-indigo-500 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-transform transform hover:-translate-y-1"
          >
            <img src={activeCanvasDataUrl} className="w-full h-full object-cover" alt="Active artwork" referrerPolicy="no-referrer" />
            <div className="absolute bottom-0 right-0 left-0 bg-indigo-600 text-white font-extrabold text-[8px] text-center py-0.5">
              ĐANG VẼ ✏️
            </div>
          </div>

          {/* User saved snapshots */}
          {savedArtworks.map((art, idx) => (
            <div
              key={idx}
              onClick={() => selectSavedArtwork(art.dataUrl)}
              className="relative flex-shrink-0 w-28 aspect-video bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-transform transform hover:-translate-y-1"
            >
              <img src={art.dataUrl} className="w-full h-full object-cover" alt={art.title} referrerPolicy="no-referrer" />
              <div className="absolute bottom-0 right-0 left-0 bg-indigo-500/90 text-white font-extrabold text-[8px] text-center py-0.5 truncate px-1">
                {templateVietnameseNames[art.template] || art.title}
              </div>
            </div>
          ))}

          {savedArtworks.length === 0 && (
            <div className="text-xs font-bold text-zinc-500 py-3 px-4 italic bg-zinc-950 border border-zinc-850 rounded-xl">
              Chưa lưu giữ tranh nào khác. Hãy ấn "Lưu tác phẩm" ở tab Quét AR nhé!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
