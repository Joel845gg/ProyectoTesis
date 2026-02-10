import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fondo from '../assets/EncuentraPareja.png';
import backCard from '../assets/juego1/back.png';
import { playSound } from '../utils/sound';

// Importar imágenes para las cartas
import fresa from '../assets/juego1/fresa.png';
import kiwi from '../assets/juego1/kiwi.png';
import coco from '../assets/juego1/coco.png';
import sandia from '../assets/juego1/sandia.png';
import naranja from '../assets/juego1/naranja.png';
import pera from '../assets/juego1/pera.png';
import platano from '../assets/juego1/platano.png';
import manzana from '../assets/juego1/manzana.png';
import cereza from '../assets/juego1/cereza.png';

const JuegoMemoria = ({ onVolver, usuario }) => {
    const [etapa, setEtapa] = useState('seleccion'); // seleccion, jugando, resumen
    const [dificultad, setDificultad] = useState(null); // facil, medio, dificil
    const [cartas, setCartas] = useState([]);
    const [cartasVolteadas, setCartasVolteadas] = useState([]);
    const [parejasEncontradas, setParejasEncontradas] = useState([]);
    const [intentos, setIntentos] = useState(0);
    const [tiempoInicio, setTiempoInicio] = useState(0);

    const
        imagenes = [fresa, kiwi, coco, sandia, naranja, pera, platano, manzana, cereza];

    // Configuración de dificultades
    const config = {
        facil: { pares: 3, cols: 3 },
        medio: { pares: 6, cols: 4 },
        dificil: { pares: 9, cols: 6 }
    };

    const [tiempo, setTiempo] = useState(0); // Tiempo transcurrido
    const timerRef = React.useRef(null);

    const iniciarJuego = (nivel) => {
        setDificultad(nivel);
        const numPares = config[nivel].pares;
        const imagenesSeleccionadas = imagenes.slice(0, numPares);

        const cartasBarajadas = [...imagenesSeleccionadas, ...imagenesSeleccionadas]
            .sort(() => Math.random() - 0.5)
            .map((img, index) => ({ id: index, img, estado: 'oculta' }));

        setCartas(cartasBarajadas);
        setCartasVolteadas([]);
        setParejasEncontradas([]);
        setIntentos(0);
        setTiempo(0);
        setEtapa('jugando');

        // Iniciar Timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTiempo((prev) => prev + 1);
        }, 1000);
    };

    const finalizarJuego = (completado, tiempoJugado) => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (usuario && usuario.codigo) {
            axios.post('http://localhost:3000/api/guardar-resultado', {
                codigo: usuario.codigo,
                juego: 'Parejas',
                dificultad: dificultad.charAt(0).toUpperCase() + dificultad.slice(1),
                puntuacion: (completado ? (1000 - (intentos * 10)) : (parejasEncontradas.length * 50)) / 100, // Puntos parciales si pierde
                tiempo_jugado: tiempoJugado,
                errores: intentos // En memoria, los intentos cuentan como "fallos" o esfuerzo
            }).catch(err => console.error("Error guardando resultado:", err));
        }
        setTimeout(() => setEtapa('resumen'), 1000);
    };

    const manejarClickCarta = (carta) => {
        if (etapa !== 'jugando') return;

        if (
            cartasVolteadas.length === 2 ||
            cartasVolteadas.some(c => c.id === carta.id) ||
            parejasEncontradas.includes(carta.img)
        ) return;

        const nuevasVolteadas = [...cartasVolteadas, carta];
        setCartasVolteadas(nuevasVolteadas);

        if (nuevasVolteadas.length === 2) {
            setIntentos(prev => prev + 1);
            if (nuevasVolteadas[0].img === nuevasVolteadas[1].img) {
                const nuevasParejas = [...parejasEncontradas, carta.img];
                setParejasEncontradas(nuevasParejas);
                setCartasVolteadas([]);

                // Verificar Victoria
                if (nuevasParejas.length === config[dificultad].pares) {
                    clearInterval(timerRef.current);
                    finalizarJuego(true, tiempo); // Tiempo que tardó
                }
            } else {
                setTimeout(() => {
                    setCartasVolteadas([]);
                }, 1000);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Pantalla de Selección
    if (etapa === 'seleccion') {
        return (
            <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})` }}>
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    padding: '40px',
                    borderRadius: '30px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                    <h1 style={{ color: '#333', marginBottom: '30px' }}>Selecciona la Dificultad</h1>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <button
                            onClick={() => { playSound('click'); iniciarJuego('facil'); }}
                            onMouseEnter={() => playSound('hover')}
                            style={{
                                padding: '15px 40px', fontSize: '1.5rem', backgroundColor: '#4CAF50', color: 'white',
                                border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            FÁCIL (3 Parejas)
                        </button>
                        <button
                            onClick={() => { playSound('click'); iniciarJuego('medio'); }}
                            onMouseEnter={() => playSound('hover')}
                            style={{
                                padding: '15px 40px', fontSize: '1.5rem', backgroundColor: '#FF9800', color: 'white',
                                border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            MEDIO (6 Parejas)
                        </button>
                        <button
                            onClick={() => { playSound('click'); iniciarJuego('dificil'); }}
                            onMouseEnter={() => playSound('hover')}
                            style={{
                                padding: '15px 40px', fontSize: '1.5rem', backgroundColor: '#f44336', color: 'white',
                                border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            DIFÍCIL (9 Parejas)
                        </button>
                    </div>
                    <button
                        onClick={() => { playSound('click'); onVolver(); }}
                        onMouseEnter={() => playSound('hover')}
                        style={{
                            marginTop: '40px', padding: '10px 30px', backgroundColor: '#666', color: 'white',
                            border: 'none', borderRadius: '20px', cursor: 'pointer'
                        }}
                    >
                        Volver al Menú
                    </button>
                </div>
            </div>
        );
    }

    // Pantalla de Resumen
    if (etapa === 'resumen') {
        return (
            <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})` }}>
                <div style={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: '50px',
                    borderRadius: '30px',
                    textAlign: 'center',
                    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <h1 style={{ color: '#4CAF50', fontSize: '3rem', marginBottom: '20px' }}>¡Felicidades!</h1>
                    <h2 style={{ color: '#333' }}>Completaste el nivel {dificultad.toUpperCase()}</h2>
                    <p style={{ fontSize: '1.5rem', margin: '20px 0' }}>
                        Intentos realizados: <strong>{intentos}</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
                        <button
                            onClick={() => { playSound('click'); setEtapa('seleccion'); }}
                            onMouseEnter={() => playSound('hover')}
                            style={{
                                padding: '15px 30px', backgroundColor: '#2196F3', color: 'white', border: 'none',
                                borderRadius: '50px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            Jugar de nuevo
                        </button>
                        <button
                            onClick={() => { playSound('click'); onVolver(); }}
                            onMouseEnter={() => playSound('hover')}
                            style={{
                                padding: '15px 30px', backgroundColor: '#f44336', color: 'white', border: 'none',
                                borderRadius: '50px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            Salir
                        </button>
                    </div>
                </div>
                <style>{`
          @keyframes popIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
            </div>
        );
    }

    // Pantalla de Juego
    return (
        <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})`, position: 'relative' }}>
            {/* Barra superior fija */}
            <div style={{
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.95)',
                padding: '15px 30px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 100
            }}>
                <h2 style={{ color: '#333', margin: 0, fontSize: '1.8rem' }}>Intentos: {intentos}</h2>
                <h2 style={{ color: '#333', margin: 0, fontSize: '1.8rem' }}>Tiempo: {tiempo}s</h2>
                <button
                    onClick={() => { playSound('click'); setEtapa('seleccion'); }}
                    onMouseEnter={() => playSound('hover')}
                    style={{
                        padding: '10px 30px',
                        borderRadius: '50px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: '#f44336',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                    }}
                >
                    Salir
                </button>
            </div>

            {/* Grid de cartas centrado */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                paddingTop: '80px', // Espacio para la barra superior
                paddingBottom: '20px'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${config[dificultad].cols}, 1fr)`,
                    gap: '20px',
                    padding: '30px',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    borderRadius: '30px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                    {cartas.map(carta => {
                        const estaVolteada = cartasVolteadas.some(c => c.id === carta.id) || parejasEncontradas.includes(carta.img);
                        return (
                            <div
                                key={carta.id}
                                onClick={() => manejarClickCarta(carta)}
                                style={{
                                    width: '120px',
                                    height: '170px',
                                    backgroundColor: estaVolteada ? 'white' : '#FF9800',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transform: estaVolteada ? 'rotateY(180deg)' : 'rotateY(0)',
                                    transition: 'transform 0.6s, background-color 0.3s',
                                    boxShadow: '0 8px 15px rgba(0,0,0,0.3)',
                                    border: '3px solid white'
                                }}
                            >
                                {estaVolteada ? (
                                    <img src={carta.img} alt="carta" style={{ width: '85%', height: '85%', objectFit: 'contain', transform: 'rotateY(180deg)' }} />
                                ) : (
                                    <span style={{ fontSize: '3rem', color: 'white', fontWeight: 'bold' }}>?</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default JuegoMemoria;
