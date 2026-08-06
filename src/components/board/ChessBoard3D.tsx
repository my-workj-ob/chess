'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BoardState, Move, Position, PieceColor, PieceType } from '@/lib/engine/types';

interface ChessBoard3DProps {
  board: BoardState;
  legalMoves: Move[];
  lastMove: Move | null;
  kingCheckSquare: Position | null;
  currentTurn: 'w' | 'b';
  onMakeMove: (from: Position, to: Position) => void;
  orientation?: 'w' | 'b';
  isFinished?: boolean;
  winnerColor?: 'w' | 'b' | 'draw' | null;
  loserColor?: 'w' | 'b' | null;
  reasonText?: string;
  theme: 'classic' | 'emerald' | 'cyberpunk' | 'wood';
  onRestart?: () => void;
  mode?: string;
}

export const ChessBoard3D: React.FC<ChessBoard3DProps> = ({
  board,
  legalMoves,
  lastMove,
  kingCheckSquare,
  currentTurn,
  onMakeMove,
  orientation = 'w',
  isFinished = false,
  winnerColor = null,
  loserColor = null,
  reasonText = '',
  theme,
  onRestart = () => { },
  mode = 'ai',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Interaction and UI States
  const [showOverlay, setShowOverlay] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [selected3DPos, setSelected3DPos] = useState<Position | null>(null);
  const pointerDownScreenPos = useRef({ x: 0, y: 0 });

  // References for Three.js objects to avoid rebuilding the scene on every render
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Camera angles for custom orbit controls
  const cameraAnglesRef = useRef({ theta: orientation === 'w' ? 0 : Math.PI, phi: Math.PI / 4, radius: 10 });
  const isMouseDownRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Raycaster states for piece selection and dragging
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const selectedPieceRef = useRef<{ r: number; c: number; mesh: THREE.Group } | null>(null);
  const dragPlaneRef = useRef<THREE.Plane | null>(null);
  const hoverSquareRef = useRef<{ r: number; c: number } | null>(null);
  const boardSquaresMeshesRef = useRef<THREE.Mesh[][]>([]);
  const piecesMeshesRef = useRef<Map<string, THREE.Group>>(new Map());

  // Store visual indicators (highlights, legal moves dots, attack paths)
  const indicatorMeshesRef = useRef<THREE.Object3D[]>([]);

  // Track orientation changes
  useEffect(() => {
    cameraAnglesRef.current.theta = orientation === 'w' ? 0 : Math.PI;
    updateCameraPosition();
  }, [orientation]);

  // Keep track of finished state
  useEffect(() => {
    if (isFinished) {
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  }, [isFinished]);

  // Helper to map 2D board coordinates (r, c) to 3D positions (X, Z)
  // White orientation: c = 0 is a (left), r = 0 is 8 (top)
  // X: (c - 3.5)
  // Z: (r - 3.5)
  const get3DCoords = (r: number, c: number) => {
    return {
      x: c - 3.5,
      y: 0.1,
      z: r - 3.5,
    };
  };

  // Helper to map 3D coords (x, z) to 2D board coordinates (r, c)
  const getBoardCoords = (x: number, z: number) => {
    const c = Math.round(x + 3.5);
    const r = Math.round(z + 3.5);
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      return { r, c };
    }
    return null;
  };

  // Procedural 3D Piece Geometries Generator
  const createPieceGeometry = (type: PieceType): { geometry: THREE.BufferGeometry; scaleY: number } => {
    let geometry: THREE.BufferGeometry;
    let scaleY = 1.0;

    switch (type) {
      case 'p': { // Pawn
        const points = [];
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.28, 0));
        points.push(new THREE.Vector2(0.28, 0.08));
        points.push(new THREE.Vector2(0.2, 0.12));
        points.push(new THREE.Vector2(0.14, 0.35));
        points.push(new THREE.Vector2(0.1, 0.45));
        points.push(new THREE.Vector2(0.18, 0.5));
        points.push(new THREE.Vector2(0.1, 0.55));

        const base = new THREE.LatheGeometry(points, 16);
        const head = new THREE.SphereGeometry(0.16, 12, 12);
        head.translate(0, 0.65, 0);

        geometry = base; // Merge them physically or group them. For simplicity, we create groups.
        // We will combine them in the group.
        scaleY = 0.8;
        break;
      }
      case 'r': { // Rook
        const points = [];
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.32, 0));
        points.push(new THREE.Vector2(0.32, 0.1));
        points.push(new THREE.Vector2(0.26, 0.18));
        points.push(new THREE.Vector2(0.24, 0.55));
        points.push(new THREE.Vector2(0.3, 0.65));
        points.push(new THREE.Vector2(0.3, 0.8));

        geometry = new THREE.LatheGeometry(points, 16);
        scaleY = 0.95;
        break;
      }
      case 'n': { // Knight (Extruded shape)
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0.22, 0);
        shape.lineTo(0.22, 0.15);
        shape.quadraticCurveTo(0.18, 0.35, 0.12, 0.45);
        shape.lineTo(0.26, 0.55);
        shape.lineTo(0.26, 0.65);
        shape.quadraticCurveTo(0.12, 0.65, 0.03, 0.75);
        shape.lineTo(0.03, 0.85);
        shape.lineTo(-0.03, 0.78);
        shape.quadraticCurveTo(-0.18, 0.65, -0.18, 0.35);
        shape.lineTo(-0.18, 0.08);
        shape.lineTo(0, 0);

        const settings = {
          depth: 0.14,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 1,
          bevelSize: 0.015,
          bevelThickness: 0.015,
        };
        geometry = new THREE.ExtrudeGeometry(shape, settings);
        geometry.center();
        geometry.rotateX(Math.PI / 2);
        geometry.translate(0, 0.45, 0);
        scaleY = 1.0;
        break;
      }
      case 'b': { // Bishop
        const points = [];
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.3, 0));
        points.push(new THREE.Vector2(0.3, 0.1));
        points.push(new THREE.Vector2(0.22, 0.18));
        points.push(new THREE.Vector2(0.18, 0.5));
        points.push(new THREE.Vector2(0.24, 0.6));
        points.push(new THREE.Vector2(0.15, 0.82));
        points.push(new THREE.Vector2(0.04, 0.88));

        geometry = new THREE.LatheGeometry(points, 16);
        scaleY = 1.05;
        break;
      }
      case 'q': { // Queen
        const points = [];
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.35, 0));
        points.push(new THREE.Vector2(0.35, 0.12));
        points.push(new THREE.Vector2(0.25, 0.22));
        points.push(new THREE.Vector2(0.2, 0.65));
        points.push(new THREE.Vector2(0.34, 0.8));
        points.push(new THREE.Vector2(0.26, 0.85));
        points.push(new THREE.Vector2(0.04, 0.9));

        geometry = new THREE.LatheGeometry(points, 16);
        scaleY = 1.15;
        break;
      }
      case 'k': { // King
        const points = [];
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(0.36, 0));
        points.push(new THREE.Vector2(0.36, 0.12));
        points.push(new THREE.Vector2(0.26, 0.22));
        points.push(new THREE.Vector2(0.2, 0.7));
        points.push(new THREE.Vector2(0.28, 0.84));
        points.push(new THREE.Vector2(0.24, 0.94));
        points.push(new THREE.Vector2(0.04, 0.96));

        geometry = new THREE.LatheGeometry(points, 16);
        scaleY = 1.25;
        break;
      }
    }

    return { geometry, scaleY };
  };

  // Materials Generator based on Theme
  const getThemeMaterials = (color: PieceColor, type?: PieceType) => {
    let material: THREE.Material;

    const isWhite = color === 'w';

    switch (theme) {
      case 'emerald':
        if (isWhite) {
          // Emerald Green semi-transparent glass
          material = new THREE.MeshPhysicalMaterial({
            color: 0x10b981,
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.6,
            thickness: 0.5,
            ior: 1.5,
            specularIntensity: 1.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
          });
        } else {
          // Obsidian dark/ruby crystal
          material = new THREE.MeshPhysicalMaterial({
            color: 0x064e3b,
            metalness: 0.2,
            roughness: 0.15,
            transmission: 0.4,
            thickness: 0.6,
            ior: 1.6,
            specularIntensity: 0.9,
            clearcoat: 0.8,
          });
        }
        break;

      case 'cyberpunk':
        if (isWhite) {
          // Neon Cyan emissive
          material = new THREE.MeshStandardMaterial({
            color: 0x0891b2,
            emissive: 0x06b6d4,
            emissiveIntensity: 0.7,
            roughness: 0.2,
            metalness: 0.3,
          });
        } else {
          // Neon Pink emissive
          material = new THREE.MeshStandardMaterial({
            color: 0xdb2777,
            emissive: 0xec4899,
            emissiveIntensity: 0.7,
            roughness: 0.2,
            metalness: 0.3,
          });
        }
        break;

      case 'wood':
        if (isWhite) {
          // Ash/Maple light wood tone
          material = new THREE.MeshStandardMaterial({
            color: 0xdfcbb5,
            roughness: 0.6,
            metalness: 0.1,
          });
        } else {
          // Dark walnut oak wood tone
          material = new THREE.MeshStandardMaterial({
            color: 0x482f1d,
            roughness: 0.6,
            metalness: 0.1,
          });
        }
        break;

      case 'classic':
      default:
        if (isWhite) {
          // Highly polished gold/brass
          material = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.85,
            roughness: 0.12,
          });
        } else {
          // Highly polished silver/chrome
          material = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            metalness: 0.9,
            roughness: 0.12,
          });
        }
        break;
    }

    return material;
  };

  const getBoardMaterials = () => {
    let lightMat: THREE.Material;
    let darkMat: THREE.Material;
    let borderMat: THREE.Material;

    switch (theme) {
      case 'emerald':
        lightMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.2 }); // pearl
        darkMat = new THREE.MeshStandardMaterial({ color: 0x022c22, roughness: 0.3, metalness: 0.3 }); // dark forest jade
        borderMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4, metalness: 0.1 });
        break;

      case 'cyberpunk':
        lightMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.1, metalness: 0.4 });
        darkMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.5 });
        borderMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.5, metalness: 0.8, emissive: 0x4338ca, emissiveIntensity: 0.15 });
        break;

      case 'wood':
        lightMat = new THREE.MeshStandardMaterial({ color: 0xd7b889, roughness: 0.7, metalness: 0.05 }); // light maple
        darkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8, metalness: 0.05 }); // walnut
        borderMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9, metalness: 0.05 }); // mahogany border
        break;

      case 'classic':
      default:
        lightMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.1 });
        darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.1 });
        borderMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.3 });
        break;
    }

    return { lightMat, darkMat, borderMat };
  };

  // Camera Orbit update helper
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const angles = cameraAnglesRef.current;

    // Polar coordinates mapping
    const x = angles.radius * Math.sin(angles.theta) * Math.cos(angles.phi);
    const z = angles.radius * Math.cos(angles.theta) * Math.cos(angles.phi);
    const y = angles.radius * Math.sin(angles.phi);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  };

  // Build the complete 3D scene
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Set background color
    scene.background = new THREE.Color(0x070a13);

    // 2. Camera setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous children
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 12, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Spotlight for nice specular reflection highlights
    const spotLight = new THREE.SpotLight(0xffffff, 1.5, 30, Math.PI / 4, 0.5, 1);
    spotLight.position.set(-8, 10, -8);
    scene.add(spotLight);

    // 5. Board Bezel Setup
    const boardMats = getBoardMaterials();
    const borderGeo = new THREE.BoxGeometry(8.5, 0.1, 8.5);
    const borderMesh = new THREE.Mesh(borderGeo, boardMats.borderMat);
    borderMesh.position.y = -0.01;
    borderMesh.receiveShadow = true;
    scene.add(borderMesh);

    // 6. Board Grid Setup
    const squareGeo = new THREE.BoxGeometry(1, 0.15, 1);
    boardSquaresMeshesRef.current = Array(8).fill(null).map(() => Array(8).fill(null));

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isLight = (r + c) % 2 === 0;
        const mat = isLight ? boardMats.lightMat : boardMats.darkMat;
        const square = new THREE.Mesh(squareGeo, mat);

        const pos = get3DCoords(r, c);
        square.position.set(pos.x, 0.05, pos.z);
        square.receiveShadow = true;
        scene.add(square);

        // Save reference for intersection and highlights
        boardSquaresMeshesRef.current[r][c] = square;
      }
    }

    // 7. Drag plane helper
    dragPlaneRef.current = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.5);

    // 8. Rebuild pieces group
    rebuildPieces();

    // 9. Auto-rotate anim
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating && !isMouseDownRef.current) {
        cameraAnglesRef.current.theta += 0.003;
        updateCameraPosition();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [theme]); // Rebuild complete WebGL scene only when theme changes

  // Dynamic board sync (update piece meshes positions and draw indicators)
  useEffect(() => {
    rebuildPieces();
    drawVisualIndicators();
  }, [board, lastMove, kingCheckSquare, legalMoves, theme, selected3DPos]);

  // Re-build all 3D pieces dynamically
  const rebuildPieces = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing pieces
    piecesMeshesRef.current.forEach((mesh) => {
      scene.remove(mesh);
    });
    piecesMeshesRef.current.clear();

    // Build new pieces from board matrix
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const pieceGroup = new THREE.Group();
        pieceGroup.name = `piece_${r}_${c}`;
        pieceGroup.userData = { r, c, color: piece.color, type: piece.type };

        const { geometry, scaleY } = createPieceGeometry(piece.type);
        const material = getThemeMaterials(piece.color, piece.type);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        pieceGroup.add(mesh);

        // Extra details for Pawns
        if (piece.type === 'p') {
          // Pawn already has a sphere in createPieceGeometry base, scaled
        }

        // Additional geometries for King / Queen details
        if (piece.type === 'k') {
          // Add cross
          const crossMat = material;
          const vert = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.05), crossMat);
          vert.position.y = 1.05;
          vert.castShadow = true;
          pieceGroup.add(vert);

          const horiz = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.05), crossMat);
          horiz.position.y = 1.08;
          horiz.castShadow = true;
          pieceGroup.add(horiz);
        }

        if (piece.type === 'q') {
          // Small crown sphere on top
          const crownBall = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), material);
          crownBall.position.y = 0.95;
          crownBall.castShadow = true;
          pieceGroup.add(crownBall);
        }

        if (piece.type === 'b') {
          // Tiny ball on bishop head
          const bishopBall = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), material);
          bishopBall.position.y = 0.94;
          bishopBall.castShadow = true;
          pieceGroup.add(bishopBall);
        }

        // Apply scale
        pieceGroup.scale.set(1, scaleY, 1);

        // Position piece
        const pos = get3DCoords(r, c);
        pieceGroup.position.set(pos.x, 0.075, pos.z);

        // Rotate Knight to face appropriate direction
        if (piece.type === 'n') {
          pieceGroup.rotation.y = piece.color === 'w' ? 0 : Math.PI;
        }

        scene.add(pieceGroup);
        piecesMeshesRef.current.set(`${r}_${c}`, pieceGroup);
      }
    }
  };

  // Tracing Checker and Escape blocker paths in 3D
  const drawVisualIndicators = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // 1. Remove old indicators
    indicatorMeshesRef.current.forEach((obj) => {
      scene.remove(obj);
    });
    indicatorMeshesRef.current.length = 0;

    // 2. Draw last move indicators (Soft yellow outline on squares)
    if (lastMove) {
      const fromPos = get3DCoords(lastMove.from.r, lastMove.from.c);
      const toPos = get3DCoords(lastMove.to.r, lastMove.to.c);

      const frameGeo = new THREE.BoxGeometry(0.98, 0.02, 0.98);
      const moveMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 });

      const frameFrom = new THREE.Mesh(frameGeo, moveMat);
      frameFrom.position.set(fromPos.x, 0.13, fromPos.z);
      scene.add(frameFrom);
      indicatorMeshesRef.current.push(frameFrom);

      const frameTo = new THREE.Mesh(frameGeo, moveMat);
      frameTo.position.set(toPos.x, 0.13, toPos.z);
      scene.add(frameTo);
      indicatorMeshesRef.current.push(frameTo);
    }

    // 3. Highlight King check square in red
    if (kingCheckSquare) {
      const pos = get3DCoords(kingCheckSquare.r, kingCheckSquare.c);
      const checkGeo = new THREE.BoxGeometry(0.99, 0.03, 0.99);
      const checkMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.55 });

      const checkMesh = new THREE.Mesh(checkGeo, checkMat);
      checkMesh.position.set(pos.x, 0.131, pos.z);
      scene.add(checkMesh);
      indicatorMeshesRef.current.push(checkMesh);
    }

    // Highlight selected piece square in blue/gold, and draw legal move indicators
    if (selected3DPos) {
      const pos = get3DCoords(selected3DPos.r, selected3DPos.c);
      const selGeo = new THREE.BoxGeometry(0.98, 0.03, 0.98);
      const selMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.4 });
      const selMesh = new THREE.Mesh(selGeo, selMat);
      selMesh.position.set(pos.x, 0.131, pos.z);
      scene.add(selMesh);
      indicatorMeshesRef.current.push(selMesh);

      showLegalMovesIndicators(selected3DPos.r, selected3DPos.c);
    }

    // 4. Trace Attack Paths in 3D (Checking vectors and escape blockers)
    const activeKingColor = isFinished && loserColor ? loserColor : currentTurn;
    const enemyColor: PieceColor = activeKingColor === 'w' ? 'b' : 'w';

    // Find King Position
    let kPos: Position | null = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === activeKingColor) {
          kPos = { r, c };
          break;
        }
      }
      if (kPos) break;
    }

    if (kPos && (kingCheckSquare || isFinished)) {
      // 4a. Find Direct checkers
      const directCheckers = getAttackerPaths(kPos, enemyColor);

      directCheckers.forEach((path) => {
        if (path.length < 2) return;
        const start = get3DCoords(path[0].r, path[0].c);
        const end = get3DCoords(path[path.length - 1].r, path[path.length - 1].c);

        // Draw Laser line cylinder
        const laser = create3DLaser(start, end, 0xf43f5e, 0.035); // Rose neon checking line
        scene.add(laser);
        indicatorMeshesRef.current.push(laser);

        // Add a pulsing ring at checker source
        const ringGeo = new THREE.RingGeometry(0.35, 0.45, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(start.x, 0.15, start.z);
        scene.add(ring);
        indicatorMeshesRef.current.push(ring);
      });

      // 4b. Find Escape blockers (adjacent squares under attack)
      const adjacentOffsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];

      adjacentOffsets.forEach(([dr, dc]) => {
        const r = kPos!.r + dr;
        const c = kPos!.c + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
          const p = board[r][c];
          if (!p || p.color === enemyColor) {
            const sqPos = { r, c };
            const blockers = getAttackerPaths(sqPos, enemyColor);

            blockers.forEach((path) => {
              if (path.length < 2) return;
              const start = get3DCoords(path[0].r, path[0].c);
              const end = get3DCoords(path[path.length - 1].r, path[path.length - 1].c);

              // Thin orange/amber line
              const laser = create3DLaser(start, end, 0xf59e0b, 0.015);
              scene.add(laser);
              indicatorMeshesRef.current.push(laser);

              // Small amber dot on blocked escape square
              const dotGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8);
              const dotMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
              const dot = new THREE.Mesh(dotGeo, dotMat);
              dot.position.set(end.x, 0.14, end.z);
              scene.add(dot);
              indicatorMeshesRef.current.push(dot);
            });
          }
        }
      });
    }
  };

  // Local helper to find paths from enemy attackers to a target square
  const getAttackerPaths = (targetPos: Position, attackerColor: PieceColor): Position[][] => {
    const paths: Position[][] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p || p.color !== attackerColor) continue;
        if (r === targetPos.r && c === targetPos.c) continue; // Skip self

        const dr = targetPos.r - r;
        const dc = targetPos.c - c;
        const absDr = Math.abs(dr);
        const absDc = Math.abs(dc);

        if (p.type === 'p') {
          const pawnDir = attackerColor === 'w' ? 1 : -1;
          if (dr === pawnDir && absDc === 1) {
            paths.push([{ r, c }, targetPos]);
          }
        } else if (p.type === 'n') {
          if ((absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2)) {
            paths.push([{ r, c }, targetPos]);
          }
        } else if (p.type === 'r' || (p.type === 'q' && (dr === 0 || dc === 0))) {
          if (dr === 0 || dc === 0) {
            const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
            const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;
            let tempR = r + stepR;
            let tempC = c + stepC;
            let blocked = false;
            const currentPath: Position[] = [{ r, c }];

            while (tempR >= 0 && tempR < 8 && tempC >= 0 && tempC < 8 && (tempR !== targetPos.r || tempC !== targetPos.c)) {
              if (board[tempR][tempC]) {
                blocked = true;
                break;
              }
              currentPath.push({ r: tempR, c: tempC });
              tempR += stepR;
              tempC += stepC;
            }
            if (!blocked) {
              currentPath.push(targetPos);
              paths.push(currentPath);
            }
          }
        }

        if (p.type === 'b' || (p.type === 'q' && absDr === absDc)) {
          if (absDr === absDc) {
            const stepR = dr > 0 ? 1 : -1;
            const stepC = dc > 0 ? 1 : -1;
            let tempR = r + stepR;
            let tempC = c + stepC;
            let blocked = false;
            const currentPath: Position[] = [{ r, c }];

            while (tempR >= 0 && tempR < 8 && tempC >= 0 && tempC < 8 && (tempR !== targetPos.r || tempC !== targetPos.c)) {
              if (board[tempR][tempC]) {
                blocked = true;
                break;
              }
              currentPath.push({ r: tempR, c: tempC });
              tempR += stepR;
              tempC += stepC;
            }
            if (!blocked) {
              currentPath.push(targetPos);
              paths.push(currentPath);
            }
          }
        }
      }
    }

    return paths;
  };

  // Helper to draw a cylindrical glowing laser cylinder in 3D
  const create3DLaser = (start: { x: number; z: number }, end: { x: number; z: number }, hexColor: number, radius: number): THREE.Mesh => {
    const startVec = new THREE.Vector3(start.x, 0.2, start.z);
    const endVec = new THREE.Vector3(end.x, 0.2, end.z);
    const distance = startVec.distanceTo(endVec);

    const laserGeo = new THREE.CylinderGeometry(radius, radius, distance, 6);
    laserGeo.translate(0, distance / 2, 0);
    laserGeo.rotateX(Math.PI / 2);

    const laserMat = new THREE.MeshBasicMaterial({ color: hexColor });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.position.copy(startVec);
    laserMesh.lookAt(endVec);

    return laserMesh;
  };

  // Mouse / Touch Interactions (Rotation, Raycasting and Drag & Drop)
  const getMouseCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if (!mountRef.current) return null;
    const rect = mountRef.current.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: -((clientY - rect.top) / rect.height) * 2 + 1,
      rawX: clientX,
      rawY: clientY,
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const coords = getMouseCoords(e);
    if (!coords) return;

    isMouseDownRef.current = true;
    previousMousePositionRef.current = { x: coords.rawX, y: coords.rawY };
    pointerDownScreenPos.current = { x: coords.rawX, y: coords.rawY };

    // Set raycaster
    if (cameraRef.current && sceneRef.current) {
      mouseRef.current.set(coords.x, coords.y);
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // 1. Intersect with pieces
      const piecesGroups = Array.from(piecesMeshesRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(piecesGroups, true);

      if (intersects.length > 0) {
        // Find top level piece group parent
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.name.startsWith('piece_')) {
          obj = obj.parent;
        }

        if (obj && obj.userData.color === currentTurn) {
          const { r, c } = obj.userData;
          selectedPieceRef.current = { r, c, mesh: obj as THREE.Group };

          // Elevate piece slightly to indicate selected state
          obj.position.y = 0.5;

          // Draw active legal moves indicators in 3D
          showLegalMovesIndicators(r, c);
          return; // Don't orbit-rotate camera if dragging a piece
        }
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const coords = getMouseCoords(e);
    if (!coords) return;

    const deltaX = coords.rawX - previousMousePositionRef.current.x;
    const deltaY = coords.rawY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: coords.rawX, y: coords.rawY };

    // 1. If dragging a piece
    if (selectedPieceRef.current && cameraRef.current && dragPlaneRef.current) {
      mouseRef.current.set(coords.x, coords.y);
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      const intersection = new THREE.Vector3();
      raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersection);

      // Update dragged piece XZ position
      selectedPieceRef.current.mesh.position.x = intersection.x;
      selectedPieceRef.current.mesh.position.z = intersection.z;

      // Project hover square
      const hover = getBoardCoords(intersection.x, intersection.z);
      if (hover) {
        if (!hoverSquareRef.current || hoverSquareRef.current.r !== hover.r || hoverSquareRef.current.c !== hover.c) {
          hoverSquareRef.current = hover;
          highlightHoverSquare(hover.r, hover.c);
        }
      }
      return;
    }

    // 2. If rotating the camera (Orbit view)
    if (isMouseDownRef.current) {
      const angles = cameraAnglesRef.current;
      angles.theta -= deltaX * 0.005;
      angles.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, angles.phi - deltaY * 0.005));
      updateCameraPosition();
    }
  };

  const handlePointerUp = (e?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    isMouseDownRef.current = false;

    const coords = e ? getMouseCoords(e) : null;
    const rawX = coords ? coords.rawX : pointerDownScreenPos.current.x;
    const rawY = coords ? coords.rawY : pointerDownScreenPos.current.y;

    const deltaX = rawX - pointerDownScreenPos.current.x;
    const deltaY = rawY - pointerDownScreenPos.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const isClick = distance < 5;

    if (selectedPieceRef.current) {
      const dragMesh = selectedPieceRef.current.mesh;
      const startR = selectedPieceRef.current.r;
      const startC = selectedPieceRef.current.c;

      // Snap the piece mesh back to its base height
      const originalPos = get3DCoords(startR, startC);
      dragMesh.position.set(originalPos.x, 0.075, originalPos.z);

      // Clear visual indicators drawn during drag
      clearLegalMovesIndicators();

      if (!isClick) {
        // 1. DRAG AND DROP
        const target = getBoardCoords(dragMesh.position.x, dragMesh.position.z);
        if (target) {
          const isLegal = legalMoves.some(
            (m) => m.from.r === startR && m.from.c === startC && m.to.r === target.r && m.to.c === target.c
          );

          if (isLegal && (startR !== target.r || startC !== target.c)) {
            onMakeMove({ r: startR, c: startC }, { r: target.r, c: target.c });
            setSelected3DPos(null);
          }
        }
      } else {
        // 2. CLICK / TAP SELECTION
        if (selected3DPos && selected3DPos.r === startR && selected3DPos.c === startC) {
          // Clicked selected piece again: deselect
          setSelected3DPos(null);
        } else {
          // Clicked own piece: select it
          setSelected3DPos({ r: startR, c: startC });
        }
      }

      selectedPieceRef.current = null;
      hoverSquareRef.current = null;
    } else {
      // Clicked on something when NO piece was grabbed (empty square or enemy piece)
      if (isClick && coords && cameraRef.current && sceneRef.current) {
        mouseRef.current.set(coords.x, coords.y);
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

        // Raycast pieces first
        const piecesGroups = Array.from(piecesMeshesRef.current.values());
        const pieceIntersects = raycasterRef.current.intersectObjects(piecesGroups, true);

        if (pieceIntersects.length > 0) {
          let obj: THREE.Object3D | null = pieceIntersects[0].object;
          while (obj && !obj.name.startsWith('piece_')) {
            obj = obj.parent;
          }

          if (obj) {
            const { r, c, color } = obj.userData;
            if (color !== currentTurn && selected3DPos) {
              // Clicked enemy piece: check if capture is legal
              const isLegalCapture = legalMoves.some(
                (m) => m.from.r === selected3DPos.r && m.from.c === selected3DPos.c && m.to.r === r && m.to.c === c
              );
              if (isLegalCapture) {
                onMakeMove(selected3DPos, { r, c });
              }
            }
          }
          setSelected3DPos(null);
        } else {
          // Raycast board squares
          const squares = boardSquaresMeshesRef.current.flat().filter(Boolean) as THREE.Mesh[];
          const squareIntersects = raycasterRef.current.intersectObjects(squares);

          if (squareIntersects.length > 0) {
            const clickedSquareMesh = squareIntersects[0].object;
            let foundSq: Position | null = null;
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                if (boardSquaresMeshesRef.current[r][c] === clickedSquareMesh) {
                  foundSq = { r, c };
                  break;
                }
              }
              if (foundSq) break;
            }

            if (foundSq && selected3DPos) {
              const isLegalMove = legalMoves.some(
                (m) => m.from.r === selected3DPos.r && m.from.c === selected3DPos.c && m.to.r === foundSq!.r && m.to.c === foundSq!.c
              );
              if (isLegalMove) {
                onMakeMove(selected3DPos, foundSq);
              }
            }
          }
          setSelected3DPos(null);
        }
      }
    }
  };

  // Draw indicators for legal moves of selected piece
  const showLegalMovesIndicators = (fromR: number, fromC: number) => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Filter legal moves for this piece
    const moves = legalMoves.filter((m) => m.from.r === fromR && m.from.c === fromC);

    moves.forEach((move) => {
      const pos = get3DCoords(move.to.r, move.to.c);

      // If capturing an enemy, draw a red border ring; if moving, draw a small green sphere dot
      if (move.captured) {
        const ringGeo = new THREE.RingGeometry(0.38, 0.46, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(pos.x, 0.13, pos.z);
        scene.add(ring);
        indicatorMeshesRef.current.push(ring);
      } else {
        const dotGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(pos.x, 0.2, pos.z);
        scene.add(dot);
        indicatorMeshesRef.current.push(dot);
      }
    });
  };

  // Highlight the square that is currently hovered during a drag
  const highlightHoverSquare = (r: number, c: number) => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old hover highlights
    const oldHovers = indicatorMeshesRef.current.filter((mesh) => mesh.name === 'hover_highlight');
    oldHovers.forEach((mesh) => {
      scene.remove(mesh);
      const idx = indicatorMeshesRef.current.indexOf(mesh);
      if (idx > -1) indicatorMeshesRef.current.splice(idx, 1);
    });

    // Check if it is a legal destination
    if (selectedPieceRef.current) {
      const startR = selectedPieceRef.current.r;
      const startC = selectedPieceRef.current.c;
      const isLegal = legalMoves.some(
        (m) => m.from.r === startR && m.from.c === startC && m.to.r === r && m.to.c === c
      );

      if (isLegal) {
        const pos = get3DCoords(r, c);
        const hoverGeo = new THREE.BoxGeometry(0.96, 0.03, 0.96);
        const hoverMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.35,
        });
        const hoverMesh = new THREE.Mesh(hoverGeo, hoverMat);
        hoverMesh.name = 'hover_highlight';
        hoverMesh.position.set(pos.x, 0.132, pos.z);
        scene.add(hoverMesh);
        indicatorMeshesRef.current.push(hoverMesh);
      }
    }
  };

  // Clear legal moves indicators
  const clearLegalMovesIndicators = () => {
    drawVisualIndicators(); // Re-draw base check vectors, checking rings, and move squares (clears legal dots)
  };

  return (
    <div className="relative w-full h-full select-none outline-none">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none rounded-[15px] overflow-hidden"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />

      {/* 3D Extra UI Buttons (Camera rotation toggle) */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`px-2 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wider transition active:scale-95 shadow-md flex items-center gap-1 ${isRotating
            ? 'bg-violet-600 border-violet-500 text-white'
            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
        >
          🔄 {isRotating ? "Aylanishni To'xtatish" : "Avto-Aylanish"}
        </button>
      </div>

      {/* Inspect Board overlay if finished */}
      {!showOverlay && isFinished && (
        <button
          onClick={() => setShowOverlay(true)}
          className="absolute top-3 right-3 z-30 px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800/80 backdrop-blur-md text-[10px] font-black text-amber-400 hover:text-white transition active:scale-95 shadow-xl flex items-center gap-1.5"
        >
          👁️ Natijani Ko'rish
        </button>
      )}

      {/* Glassmorphic Overlay for Game Result */}
      {isFinished && showOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-[2px] z-30 p-4 rounded-[15px] animate-fade-in">
          <div className="bg-[#0b0f19]/90 border border-slate-800/80 backdrop-blur-md p-5 rounded-3xl max-w-[260px] w-full text-center shadow-2xl space-y-4 transform scale-100 transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                O'YIN YAKUNLANDI
              </span>
              <h3 className="text-sm font-black text-white leading-tight">
                {winnerColor === 'draw'
                  ? 'DURRANG'
                  : (winnerColor === (orientation === 'b' ? 'w' : 'b') || winnerColor === 'b' && orientation === 'w' || winnerColor === 'w' && orientation === 'b')
                    ? 'MAG\'LUBIYAT'
                    : 'G\'ALABA!'}
              </h3>
            </div>

            <p className="text-[10px] text-slate-400 font-bold leading-normal">
              {winnerColor === 'draw'
                ? `O'yin durrang bilan yakunlandi. Sabab: ${reasonText}`
                : (winnerColor === orientation)
                  ? `Siz raqibni mag'lub etdingiz! Sabab: ${reasonText}`
                  : `Siz mag'lub bo'ldingiz. Sabab: ${reasonText}`}
            </p>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => {
                  setShowOverlay(false);
                  if (onRestart) onRestart();
                }}
                className="w-full py-2.5 rounded-xl text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 active:scale-95 transition-all shadow-lg shadow-amber-500/10"
              >
                {mode === 'online' ? 'Lobbyga Qaytish' : 'Yangi O\'yin Boshlash'}
              </button>
              <button
                onClick={() => setShowOverlay(false)}
                className="w-full py-2 rounded-xl text-[9px] font-black bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition"
              >
                Doskani Ko'rish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
