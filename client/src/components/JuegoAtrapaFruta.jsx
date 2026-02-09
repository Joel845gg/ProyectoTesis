import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import fondo from '../assets/Fondo.png';
// Imágenes Juego 2
import fresa from '../assets/juego1/fresa.png'; // Fresa no está en juego2, usaremos de juego1 o eliminamos si no se quiere
import naranja from '../assets/juego2/naranja.png';
import manzana from '../assets/juego2/manzana.png';
import sandia from '../assets/juego2/sandia.png';
import pera from '../assets/juego2/pera.png';
import platano from '../assets/juego2/platano.png';
import bombaImg from '../assets/juego2/bomba.png';
import doradaImg from '../assets/juego2/manzana_dorada.png';
import canastaImg from '../assets/juego2/canasta.png';
import { playSound } from '../utils/sound';

const JuegoAtrapaFruta = ({ onVolver, usuario }) => {
    const [etapa, setEtapa] = useState('seleccion');
    const [dificultad, setDificultad] = useState(null);
    const [puntuacion, setPuntuacion] = useState(0);
    const [tiempo, setTiempo] = useState(60);

    const gameState = useRef({
        canastaX: 50,
        objetos: [],
        lastSpawn: 0,
        keys: { ArrowLeft: false, ArrowRight: false },
        score: 0
    });

    const requestRef = useRef();
    const [, setTick] = useState(0);

    // Pool de frutas normales
    const frutasImgs = [naranja, manzana, sandia, pera, platano];

    const config = {
        facil: { velocidad: 0.15, spawnRate: 1200, tipos: ['fruta'] },
        medio: { velocidad: 0.3, spawnRate: 900, tipos: ['fruta', 'dorada'] },
        dificil: { velocidad: 0.4, spawnRate: 700, tipos: ['fruta', 'dorada', 'bomba'] }
    };

    const iniciarJuego = (nivel) => {
        setDificultad(nivel);
        setPuntuacion(0);
        setPuntuacion(0);
        setTiempo(35);
        gameState.current = {
            canastaX: 50,
            objetos: [],
            lastSpawn: 0,
            keys: { ArrowLeft: false, ArrowRight: false },
            score: 0
        };
        setEtapa('jugando');
    };

    // Manejo de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                gameState.current.keys[e.key] = true;
            }
        };
        const handleKeyUp = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                gameState.current.keys[e.key] = false;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Loop Principal
    useEffect(() => {
        if (etapa !== 'jugando') {
            cancelAnimationFrame(requestRef.current);
            return;
        }

        let lastTime = Date.now();
        const conf = config[dificultad];

        const update = () => {
            const now = Date.now();
            const dt = now - lastTime;
            lastTime = now;

            // 1. Mover Canasta (Velocidad reducida de 0.8 a 0.5)
            if (gameState.current.keys.ArrowLeft) {
                gameState.current.canastaX = Math.max(0, gameState.current.canastaX - 0.5);
            }
            if (gameState.current.keys.ArrowRight) {
                gameState.current.canastaX = Math.min(90, gameState.current.canastaX + 0.5);
            }

            // 2. Spawn Objetos
            if (now - gameState.current.lastSpawn > conf.spawnRate) {
                // Lógica de probabilidad ponderada
                let tipoElegido = 'fruta';
                const rand = Math.random();

                if (dificultad === 'medio') {
                    // Medio: 40% Fruta, 60% Dorada
                    if (rand < 0.6) tipoElegido = 'dorada';
                } else if (dificultad === 'dificil') {
                    // Difícil: 20% Fruta, 30% Bomba, 50% Dorada
                    if (rand < 0.5) tipoElegido = 'dorada';
                    else if (rand < 0.8) tipoElegido = 'bomba';
                }

                let nuevoObj = {
                    id: now,
                    x: Math.random() * 90,
                    y: -10,
                    tipo: tipoElegido,
                    img: frutasImgs[Math.floor(Math.random() * frutasImgs.length)],
                    valor: 10
                };

                if (tipoElegido === 'dorada') {
                    nuevoObj.img = doradaImg;
                    nuevoObj.valor = 20;
                } else if (tipoElegido === 'bomba') {
                    nuevoObj.img = bombaImg;
                    nuevoObj.valor = -20;
                }

                gameState.current.objetos.push(nuevoObj);
                gameState.current.lastSpawn = now;
            }

            // 3. Mover y Colisiones
            gameState.current.objetos.forEach(obj => {
                obj.y += conf.velocidad * (dt / 5);
            });

            // Filtrar y detectar colisiones
            gameState.current.objetos = gameState.current.objetos.filter(obj => {
                if (obj.y > 100) return false;

                const enAltura = obj.y > 80 && obj.y < 95; // Ajustado visualmente a la canasta
                const enAncho = Math.abs(obj.x - (gameState.current.canastaX + 2)) < 8; // Ajuste fino del centro

                if (enAltura && enAncho) {
                    gameState.current.score += obj.valor;
                    setPuntuacion(gameState.current.score);
                    return false;
                }

                return true;
            });

            setTick(prev => prev + 1);
            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);

        const timerId = setInterval(() => {
            setTiempo(t => {
                if (t <= 1) {

                    // Guardar resultado
                    if (usuario && usuario.codigo) {
                        const difNombre = dificultad.charAt(0).toUpperCase() + dificultad.slice(1);
                        // Usamos 'Atrapar' como nombre del juego basado en JSON ejemplo
                        axios.post('http://localhost:3000/api/guardar-resultado', {
                            codigo: usuario.codigo,
                            juego: 'Atrapar',
                            dificultad: difNombre,
                            puntuacion: puntuacion,
                            tiempo_jugado: 60 - t
                        }).catch(err => console.error("Error guardando resultado:", err));
                    }

                    setEtapa('resumen');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => {
            cancelAnimationFrame(requestRef.current);
            clearInterval(timerId);
        };
    }, [etapa, dificultad]);

    // UI Render
    return (
        <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})`, position: 'relative', overflow: 'hidden' }}>

            {etapa === 'jugando' && (
                <div style={{
                    position: 'absolute', top: 20, left: 20, right: 20,
                    display: 'flex', justifyContent: 'space-between',
                    color: 'white', fontSize: '2rem', fontWeight: 'bold', zIndex: 10,
                    textShadow: '2px 2px 4px black'
                }}>
                    <span>Puntos: {puntuacion}</span>
                    <span>Tiempo: {tiempo}</span>
                    <button
                        onClick={() => { playSound('click'); setEtapa('seleccion'); }}
                        onMouseEnter={() => playSound('hover')}
                        style={{ ...btnStyle('#f44336'), fontSize: '1rem', padding: '8px 20px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
                    >
                        Salir
                    </button>
                </div>
            )}

            {etapa === 'jugando' && (
                <>
                    {gameState.current.objetos.map(obj => (
                        <div key={obj.id} style={{
                            position: 'absolute',
                            left: `${obj.x}%`,
                            top: `${obj.y}%`,
                            width: '90px',
                            height: '90px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <img
                                src={obj.img}
                                alt="objeto"
                                style={{
                                    width: '100%', height: '100%', objectFit: 'contain',
                                    filter: obj.tipo === 'dorada' ? 'drop-shadow(0 0 10px gold)' : 'none'
                                }}
                            />
                        </div>
                    ))}

                    {/* Canasta con imagen */}
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: `${gameState.current.canastaX}%`,
                        width: '100px',
                        height: '100px',
                        zIndex: 5,
                        pointerEvents: 'none'
                    }}>
                        <img src={canastaImg} alt="canasta" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                </>
            )}

            {etapa === 'seleccion' && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 20
                }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', textAlign: 'center' }}>
                        <h1 style={{ marginBottom: '20px' }}>Atrapa la Fruta</h1>
                        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Usa las flechas ⬅️ ➡️</p>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <button onClick={() => { playSound('click'); iniciarJuego('facil'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#4CAF50')}>FÁCIL</button>
                            <button onClick={() => { playSound('click'); iniciarJuego('medio'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#FF9800')}>MEDIO</button>
                            <button onClick={() => { playSound('click'); iniciarJuego('dificil'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#f44336')}>DIFÍCIL</button>
                        </div>
                        <button onClick={() => { playSound('click'); onVolver(); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#666')}>Volver</button>
                    </div>
                </div>
            )}

            {etapa === 'resumen' && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 20
                }}>
                    <div style={{ backgroundColor: 'white', padding: '50px', borderRadius: '30px', textAlign: 'center' }}>
                        <h1 style={{ color: '#4CAF50', fontSize: '3rem' }}>¡Tiempo Agotado!</h1>
                        <h2>Puntuación Final: {puntuacion}</h2>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                            <button onClick={() => { playSound('click'); setEtapa('seleccion'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#2196F3')}>Jugar de nuevo</button>
                            <button onClick={() => { playSound('click'); onVolver(); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#f44336')}>Salir</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

const btnStyle = (bg) => ({
    padding: '10px 30px', backgroundColor: bg, color: 'white',
    border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
    boxShadow: '0 5px 10px rgba(0,0,0,0.2)'
});

export default JuegoAtrapaFruta;
