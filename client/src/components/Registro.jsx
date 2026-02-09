import React, { useState } from 'react';
import fondo from '../assets/Fondo.png';
import { playSound } from '../utils/sound';

const Registro = ({ onVolver }) => {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [codigoGenerado, setCodigoGenerado] = useState(null);
    const [error, setError] = useState('');
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

    const handleRegistro = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, apellido })
            });

            const data = await response.json();

            if (response.ok) {
                setCodigoGenerado(data.codigo);
            } else {
                setError(data.error || 'Error al registrar');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    if (codigoGenerado) {
        return (
            <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})` }}>
                <div className="formulario" style={{ textAlign: 'center' }}>
                    <h2>¡Registro Exitoso!</h2>
                    <p>Tu código de acceso es:</p>
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: '#333',
                        margin: '20px 0',
                        letterSpacing: '10px'
                    }}>
                        {codigoGenerado}
                    </div>
                    <p style={{ color: 'red', fontWeight: 'bold' }}>¡Guárdalo muy bien!</p>
                    <button
                        onClick={() => { playSound('click'); onVolver(); }}
                        onMouseEnter={() => playSound('hover')}
                        style={{
                            ...btnStyle,
                            backgroundColor: '#2196F3'
                        }}
                    >
                        Volver al Menú
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})` }}>
            <form className="formulario" onSubmit={handleRegistro}>
                <h2 style={{ color: '#333', textShadow: 'none', textAlign: 'center', marginBottom: '20px' }}>Registro</h2>

                <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                />

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                <button
                    type="submit"
                    onMouseEnter={() => playSound('hover')}
                    onClick={() => playSound('click')}
                    disabled={loading}
                    style={{
                        ...btnStyle,
                        backgroundColor: '#4CAF50',
                        width: '100%'
                    }}
                >
                    {loading ? 'Registrando...' : 'Registrarse'}
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

export default Registro;
