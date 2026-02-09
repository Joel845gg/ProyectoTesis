import React, { useState } from 'react';
import fondo from '../assets/Fondo.png';
import juego1 from '../assets/JUEGO1.png';
import juego2 from '../assets/JUEGO2.png';
import juego3 from '../assets/JUEGO3.png';
import juego4 from '../assets/JUEGO4.png';
import { playSound } from '../utils/sound';

const SelectorJuego = ({ usuario, onVolver, onSeleccionarJuego }) => {
    const [indiceActual, setIndiceActual] = useState(0);

    const juegos = [ // No uso el nombre real de la variable para no romper diff, pero actualizo el contenido del array
        { id: 1, titulo: 'Memoria', img: juego1, color: '#FF9800' },
        { id: 2, titulo: 'Atrapa Fruta', img: juego2, color: '#2196F3' },
        { id: 3, titulo: 'Atrapa al Topo', img: juego3, color: '#4CAF50' },
        { id: 4, titulo: 'Completa la Palabra', img: juego4, color: '#9C27B0' },
    ];

    const siguienteJuego = () => {
        setIndiceActual((prev) => (prev + 1) % juegos.length);
    };

    const anteriorJuego = () => {
        setIndiceActual((prev) => (prev - 1 + juegos.length) % juegos.length);
    };

    const juegoActual = juegos[indiceActual];

    // ... (estilos)

    // ...

    // En App.jsx se manejará la redirección

    // En App.jsx se manejará la redirección
    const handleJugar = () => {
        onSeleccionarJuego(juegoActual.id);
    };

    // Estilos de flechas
    const arrowStyle = {
        background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
        color: '#333',
        fontSize: '3rem',
        border: 'none',
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.3s',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
    };

    return (
        <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})` }}>
            {/* Panel Superior: Información de la sesión */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '40px',
                backgroundColor: '#FF9800',
                padding: '10px 20px',
                borderRadius: '30px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                zIndex: 10
            }}>
                <span>Jugador: {usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Invitado'}</span>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                gap: '80px' // Más espacio para las flechas grandes
            }}>

                {/* Flecha Izquierda */}
                <button
                    onClick={() => {
                        playSound('click');
                        anteriorJuego();
                    }}
                    onMouseEnter={() => playSound('hover')}
                    style={arrowStyle}
                    className="arrow-btn"
                >
                    ❮
                </button>

                {/* Tarjeta Central del Juego */}
                <div
                    key={indiceActual} // Forzar reinicio de animación al cambiar
                    className="game-card"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        padding: '30px',
                        borderRadius: '40px',
                        boxShadow: `0 0 50px ${juegoActual.color}80`, // Glow con transparencia
                        border: `8px solid ${juegoActual.color}`,
                        width: '500px',
                        position: 'relative'
                    }}>

                    <h2 style={{
                        margin: 0, marginBottom: '15px',
                        color: juegoActual.color,
                        fontSize: '2.5rem',
                        textTransform: 'uppercase',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                    }}>
                        {juegoActual.titulo}
                    </h2>

                    <img
                        src={juegoActual.img}
                        alt={juegoActual.titulo}
                        style={{
                            width: '100%',
                            borderRadius: '25px',
                            marginBottom: '30px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                            border: '2px solid #eee'
                        }}
                    />

                    <button style={{
                        padding: '18px 60px',
                        fontSize: '1.8rem',
                        backgroundColor: juegoActual.color,
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}
                        onClick={() => {
                            playSound('click');
                            onSeleccionarJuego(juegoActual.id);
                        }}
                        onMouseOver={(e) => {
                            playSound('hover');
                            e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        JUGAR
                    </button>
                </div>

                {/* Flecha Derecha */}
                <button
                    onClick={() => {
                        playSound('click');
                        siguienteJuego();
                    }}
                    onMouseEnter={() => playSound('hover')}
                    style={arrowStyle}
                    className="arrow-btn"
                >
                    ❯
                </button>
            </div>

            {/* Botón Salir */}
            <button
                onClick={onVolver}
                style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '10px 40px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                }}
            >
                Salir
            </button>



            <style>{`
        .arrow-btn:hover {
          transform: scale(1.2);
          background: white !important;
          color: #000 !important;
          box-shadow: 0 0 20px rgba(255,255,255,0.8) !important;
        }
        .arrow-btn:active {
          transform: scale(0.9);
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
        }

        @keyframes popIn {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
        }

        .game-card {
            animation: popIn 0.5s ease-out, float 4s ease-in-out infinite;
        }
      `}</style>
        </div >
    );
};

export default SelectorJuego;
