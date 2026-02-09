import React from 'react';
import fondo from '../assets/FondoPrincipal.png';
import { playSound } from '../utils/sound';

const MenuPrincipal = ({ onJugar }) => {
    return (
        <div
            className="pantalla-completa"
            style={{
                backgroundImage: `url(${fondo})`,
                display: 'flex',
                alignItems: 'flex-start', // Alinear al inicio verticalmente (o dejarlo centrado y mover con margin)
                justifyContent: 'flex-start', // Alinear a la izquierda
                paddingLeft: '10%', // Espacio desde la izquierda para alinearse con el texto "MENTE ACTIVA"
                paddingTop: '35vh' // Bajar el contenido para estar debajo del texto del título de la imagen
            }}
        >
            {/* Título eliminado */}

            <button
                onClick={() => { playSound('click'); onJugar(); }}
                onMouseEnter={() => playSound('hover')}
                style={{
                    padding: '15px 60px',
                    fontSize: '2rem',
                    backgroundColor: 'rgb(76, 175, 80)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    boxShadow: 'rgba(0, 0, 0, 0.3) 0px 5px 15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '49vh',
                    marginLeft: '160px'
                }}
            >
                JUGAR
            </button>
        </div>
    );
};

export default MenuPrincipal;
