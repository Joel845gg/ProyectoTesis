import React, { useState } from 'react';
import fondo from '../assets/Fondo.png';
import { playSound } from '../utils/sound';

const IngresoCodigo = ({ onVolver, onIngresoExitoso }) => {
    const [codigo, setCodigo] = useState('');
    const [error, setError] = useState('');
    const [saludo, setSaludo] = useState('');
    const [loading, setLoading] = useState(false);

    // Estilo base para botones
    const btnStyle = {
        padding: '10px 30px',
        fontSize: '1.2rem',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        boxShadow: 'rgba(0, 0, 0, 0.3) 0px 3px 10px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '20px'
    };

    const handleIngreso = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo })
            });

            const data = await response.json();

            if (response.ok) {
                setSaludo(`¡Hola ${data.nombre} ${data.apellido}!`);
                // Pausa para mostrar el saludo antes de navegar
                setTimeout(() => {
                    onIngresoExitoso(data);
                }, 2000);
            } else {
                setError(data.error || 'Código incorrecto');
                setLoading(false);
            }
        } catch (err) {
            setError('Error de conexión');
            setLoading(false);
        }
    };

    if (saludo) {
        return (
            <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})` }}>
                <div className="formulario" style={{ textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                    <h2 style={{ color: '#4CAF50', fontSize: '2rem', textShadow: 'none' }}>{saludo}</h2>
                    <p>Cargando juegos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})` }}>
            <form className="formulario" onSubmit={handleIngreso}>
                <h2 style={{ color: '#333', textShadow: 'none', textAlign: 'center', marginBottom: '20px' }}>Ingresa tu Código</h2>

                <input
                    type="text"
                    placeholder="Código de 4 dígitos"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    maxLength={4}
                    required
                    style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.5rem' }}
                />

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                <button
                    type="submit"
                    onMouseEnter={() => playSound('hover')}
                    onClick={() => playSound('click')}
                    disabled={loading}
                    style={{
                        ...btnStyle,
                        backgroundColor: '#2196F3',
                        width: '100%'
                    }}
                >
                    {loading ? 'Verificando...' : 'Ingresar'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={() => { playSound('click'); onVolver(); }}
                        onMouseEnter={() => playSound('hover')}
                        style={{
                            ...btnStyle,
                            backgroundColor: '#f44336',
                            padding: '10px 30px',
                            fontSize: '1rem'
                        }}
                    >
                        Volver
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IngresoCodigo;
