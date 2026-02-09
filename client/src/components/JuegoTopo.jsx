import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import fondo from '../assets/AtrapaTopo.png';
import topoImg from '../assets/juego3/topo.png';
import { playSound } from '../utils/sound';

const btnStyle = (bg) => ({
    padding: '10px 25px', backgroundColor: bg, color: 'white',
    border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
});

const JuegoTopo = ({ onVolver, usuario }) => {
    const [etapa, setEtapa] = useState('seleccion'); // seleccion, jugando, resumen
    const [dificultad, setDificultad] = useState(null);
    const [puntuacion, setPuntuacion] = useState(0);
    const [errores, setErrores] = useState(0); // Nuevo estado para errores (trampas)
    const [tiempo, setTiempo] = useState(60);
    const [grid, setGrid] = useState([]); // Array de estados para cada celda
    const [gridSize, setGridSize] = useState(3);

    const timerRef = useRef(null);
    const moleTimerRef = useRef(null);

    // Configuración por dificultad
    const config = {
        facil: { size: 3, speed: 1000, trampas: false },
        medio: { size: 4, speed: 1000, trampas: true }, // Velocidad unificada
        dificil: { size: 5, speed: 1000, trampas: true } // Velocidad unificada
    };

    const iniciarJuego = (nivel) => {
        const conf = config[nivel];
        setDificultad(nivel);
        setGridSize(conf.size);
        setPuntuacion(0);
        setPuntuacion(0);
        setErrores(0); // Reset errores
        setTiempo(35);
        setEtapa('jugando');

        // Inicializar grid vacío
        const totalCells = conf.size * conf.size;
        setGrid(Array(totalCells).fill(null)); // null, 'topo', 'trampa'
    };

    // Loop del juego (Aparición de Topos)
    useEffect(() => {
        if (etapa !== 'jugando') {
            clearInterval(timerRef.current);
            clearInterval(moleTimerRef.current);
            return;
        }

        const conf = config[dificultad];
        const totalCells = conf.size * conf.size;

        // Timer de juego
        timerRef.current = setInterval(() => {
            setTiempo(prev => {
                if (prev <= 1) {

                    // Guardar resultado
                    if (usuario && usuario.codigo) {
                        // Puntuación máxima posible aprox: 60 seg / 1 seg por topo * 10 pts = 600? 
                        // No hay maximo claro, es acumulativo.
                        // Tiempo jugado es fijo 60s si llega al final.

                        const conf = config[dificultad];
                        // Ajustar nombre dificultad
                        const difNombre = dificultad.charAt(0).toUpperCase() + dificultad.slice(1);

                        axios.post('http://localhost:3000/api/guardar-resultado', {
                            codigo: usuario.codigo,
                            juego: 'Topo',
                            dificultad: difNombre,
                            puntuacion: puntuacion,
                            tiempo_jugado: 60 - prev, // Deberia ser casi 60
                            errores: errores // Envia la cantidad de trampas activadas
                        }).catch(err => console.error("Error guardando resultado:", err));
                    }

                    setEtapa('resumen');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Ciclo de aparición
        const spawnMole = () => {
            // Limpiar grid
            const newGrid = Array(totalCells).fill(null);

            // Posición Topo
            let molePos = Math.floor(Math.random() * totalCells);
            newGrid[molePos] = 'topo';

            // Posición Trampa (si aplica)
            if (conf.trampas) {
                // En difícil puede haber más trampas
                const numTrampas = dificultad === 'dificil' ? 2 : 1;

                for (let i = 0; i < numTrampas; i++) {
                    let trapPos;
                    do {
                        trapPos = Math.floor(Math.random() * totalCells);
                    } while (trapPos === molePos || newGrid[trapPos] === 'trampa');
                    newGrid[trapPos] = 'trampa';
                }
            }

            setGrid(newGrid);
        };

        spawnMole(); // Primer spawn
        moleTimerRef.current = setInterval(spawnMole, conf.speed);

        return () => {
            clearInterval(timerRef.current);
            clearInterval(moleTimerRef.current);
        };
    }, [etapa, dificultad]);

    const handleClick = (index) => {
        if (etapa !== 'jugando') return;

        const item = grid[index];
        if (item === 'topo') {
            setPuntuacion(prev => prev + 10);
            // Efecto visual de golpe? (opcional: limpiar celda instantáneo)
            const newGrid = [...grid];
            newGrid[index] = 'hit'; // Estado temporal de golpe
            setGrid(newGrid);
        } else if (item === 'trampa') {
            setPuntuacion(prev => Math.max(0, prev - 5));
            setErrores(prev => prev + 1); // Contar error
            const newGrid = [...grid];
            newGrid[index] = 'boom'; // Estado temporal de trampa activada
            setGrid(newGrid);
        }
    };

    // Estilos dinámicos para el grid
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`, // Forzar filas iguales
        gap: '10px',
        width: '100%',
        maxWidth: '500px',
        aspectRatio: '1/1', // Cuadrado
    };

    return (
        <div className="pantalla-completa" style={{
            backgroundImage: `url(${fondo})`,
            display: 'flex', // Asegurar flex para centrar
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>

            {etapa === 'seleccion' && (
                <div className="formulario" style={{ textAlign: 'center' }}>
                    <h1 style={{ marginBottom: '20px', color: '#333' }}>Atrapa el Topo</h1>
                    <p style={{ marginBottom: '20px' }}>Golpea a los topos para ganar puntos. ¡Cuidado con las trampas!</p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button onClick={() => { playSound('click'); iniciarJuego('facil'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#4CAF50')}>FÁCIL</button>
                        <button onClick={() => { playSound('click'); iniciarJuego('medio'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#FF9800')}>MEDIO</button>
                        <button onClick={() => { playSound('click'); iniciarJuego('dificil'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#f44336')}>DIFÍCIL</button>
                    </div>
                    <button onClick={() => { playSound('click'); onVolver(); }} onMouseEnter={() => playSound('hover')} style={{ ...btnStyle('#666'), marginTop: '20px' }}>Volver</button>
                </div>
            )}

            {etapa === 'resumen' && (
                <div className="formulario" style={{ textAlign: 'center' }}>
                    <h1 style={{ color: '#4CAF50', fontSize: '3rem' }}>¡Tiempo Agotado!</h1>
                    <h2>Puntuación Final: {puntuacion}</h2>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
                        <button onClick={() => { playSound('click'); setEtapa('seleccion'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#2196F3')}>Jugar de nuevo</button>
                        <button onClick={() => { playSound('click'); onVolver(); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#f44336')}>Salir</button>
                    </div>
                </div>
            )}

            {etapa === 'jugando' && (
                <>
                    {/* HUD */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '600px',
                        marginBottom: '20px', color: 'white', fontSize: '2rem', fontWeight: 'bold',
                        textShadow: '2px 2px 4px black'
                    }}>
                        <span>Puntos: {puntuacion}</span>
                        <span>Tiempo: {tiempo}s</span>
                    </div>

                    {/* Tablero */}
                    <div style={gridStyle}>
                        {grid.map((cell, i) => (
                            <div
                                key={i}
                                onClick={() => handleClick(i)}
                                style={{
                                    backgroundColor: '#8BC34A', // Color césped
                                    border: '4px solid #558B2F',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {cell === 'topo' && (
                                    <img src={topoImg} alt="Topo" style={{ width: '80%', height: '80%', objectFit: 'contain', animation: 'popIn 0.2s ease-out' }} />
                                )}
                                {cell === 'trampa' && (
                                    <span style={{ fontSize: '3rem' }}>💣</span>
                                )}
                                {cell === 'hit' && (
                                    <span style={{ fontSize: '3rem', color: 'white', fontWeight: 'bold' }}>+10</span>
                                )}
                                {cell === 'boom' && (
                                    <span style={{ fontSize: '3rem' }}>💥</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <button onClick={() => { playSound('click'); setEtapa('seleccion'); }} onMouseEnter={() => playSound('hover')} style={{ ...btnStyle('#f44336'), marginTop: '20px' }}>Salir</button>

                    <style>{`
                        @keyframes popIn {
                            0% { transform: scale(0); }
                            80% { transform: scale(1.2); }
                            100% { transform: scale(1); }
                        }
                    `}</style>
                </>
            )}

        </div>
    );
};

export default JuegoTopo;
