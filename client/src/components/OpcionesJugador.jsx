import React from 'react';
import fondo from '../assets/Fondo.png';
import { playSound } from '../utils/sound';

const OpcionesJugador = ({ onRegistrar, onIngresar, onRecuperar, onVolver }) => {
    // Estilo base compartido
    const btnStyle = {
        padding: '15px 40px',
        fontSize: '1.5rem',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        boxShadow: 'rgba(0, 0, 0, 0.3) 0px 5px 15px',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '350px', // Un poco más anchos para texto largo
        marginBottom: '20px'
    };

    return (
        <div
            className="pantalla-completa"
            style={{ backgroundImage: `url(${fondo})` }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <button
                    onClick={() => { playSound('click'); onRegistrar(); }}
                    onMouseEnter={() => playSound('hover')}
                    style={{
                        ...btnStyle,
                        backgroundColor: '#FF9800',
                    }}
                >
                    Registrarme
                </button>

                <button
                    onClick={() => { playSound('click'); onIngresar(); }}
                    onMouseEnter={() => playSound('hover')}
                    style={{
                        ...btnStyle,
                        backgroundColor: '#2196F3',
                    }}
                >
                    Ingresar Código
                </button>

                <button
                    onClick={() => { playSound('click'); onRecuperar(); }}
                    onMouseEnter={() => playSound('hover')}
                    style={{
                        ...btnStyle,
                        backgroundColor: '#9C27B0', // Violeta para diferenciar
                        fontSize: '1.3rem'
                    }}
                >
                    ¿Olvidaste tu código?
                </button>

                <button
                    onClick={() => { playSound('click'); onVolver(); }}
                    onMouseEnter={() => playSound('hover')}
                    style={{
                        ...btnStyle,
                        backgroundColor: '#f44336',
                        marginTop: '10px'
                    }}
                >
                    Volver
                </button>
            </div>
        </div>
    );
};

export default OpcionesJugador;
