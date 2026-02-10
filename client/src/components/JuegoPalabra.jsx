import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fondo from '../assets/CompletaPalabra.png';
import { playSound } from '../utils/sound';

// Importar imágenes
import sol from '../assets/juego4/sol.jpg';
import pan from '../assets/juego4/pan.jpeg';
import casa from '../assets/juego4/casa.jpeg';
import mesa from '../assets/juego4/mesa.jpeg';
import flor from '../assets/juego4/flor.jpeg';
import gato from '../assets/juego4/gato.jpeg';
import agua from '../assets/juego4/agua.jpeg';
import luna from '../assets/juego4/luna.jpeg';
import mar from '../assets/juego4/mar.jpeg';
import nube from '../assets/juego4/nube.jpeg';

import arbol from '../assets/juego4/arbol.jpeg';
import amigo from '../assets/juego4/amigo.jpeg';
import baile from '../assets/juego4/baile.jpeg';
import cielo from '../assets/juego4/cielo.jpeg';
import perro from '../assets/juego4/perro.jpeg';

import familia from '../assets/juego4/familia.jpeg';
import escuela from '../assets/juego4/escuela.jpg';
import ventana from '../assets/juego4/ventana.jpeg';
import comida from '../assets/juego4/comida.jpeg';
import hermano from '../assets/juego4/hermano.jpeg';
import libro from '../assets/juego4/libro.jpeg';
import lapiz from '../assets/juego4/lapiz.jpeg';
import silla from '../assets/juego4/silla.jpeg';
import gorra from '../assets/juego4/gorra.jpeg';
import jardin from '../assets/juego4/jardin.jpeg';
import musica from '../assets/juego4/musica.jpeg';
import bandera from '../assets/juego4/bandera.jpeg';
import botella from '../assets/juego4/botella.jpeg';

const palabrasData = {
    facil: [
        { palabra: 'SOL', img: sol },
        { palabra: 'PAN', img: pan },
        { palabra: 'CASA', img: casa },
        { palabra: 'MESA', img: mesa },
        { palabra: 'FLOR', img: flor },
        { palabra: 'GATO', img: gato },
        { palabra: 'AGUA', img: agua },
        { palabra: 'LUNA', img: luna },
        { palabra: 'MAR', img: mar },
        { palabra: 'NUBE', img: nube }
    ],
    medio: [
        { palabra: 'ARBOL', img: arbol },
        { palabra: 'AMIGO', img: amigo },
        { palabra: 'BAILE', img: baile },
        { palabra: 'CIELO', img: cielo },
        { palabra: 'PERRO', img: perro },
        { palabra: 'LIBRO', img: libro },
        { palabra: 'LAPIZ', img: lapiz },
        { palabra: 'SILLA', img: silla },
        { palabra: 'GORRA', img: gorra }
    ],
    dificil: [
        { palabra: 'FAMILIA', img: familia },
        { palabra: 'ESCUELA', img: escuela },
        { palabra: 'VENTANA', img: ventana },
        { palabra: 'COMIDA', img: comida },
        { palabra: 'HERMANO', img: hermano },
        { palabra: 'JARDIN', img: jardin },
        { palabra: 'MUSICA', img: musica },
        { palabra: 'BANDERA', img: bandera },
        { palabra: 'BOTELLA', img: botella }
    ]
};

const btnStyle = (bg) => ({
    padding: '10px 25px', backgroundColor: bg, color: 'white',
    border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
});

const JuegoPalabra = ({ onVolver, usuario }) => {
    const [etapa, setEtapa] = useState('seleccion'); // seleccion, jugando, ganaste
    const [dificultad, setDificultad] = useState(null);
    const [indicePalabra, setIndicePalabra] = useState(0);
    const [palabraObj, setPalabraObj] = useState(null);
    const [letrasDesordenadas, setLetrasDesordenadas] = useState([]);
    const [huecos, setHuecos] = useState([]); // Array de objetos { letra: char, ocupado: boolean }
    const [mensaje, setMensaje] = useState('');
    const [puntuacion, setPuntuacion] = useState(0);
    const [errores, setErrores] = useState(0);
    const [tiempo, setTiempo] = useState(35); // Nuevo estado de tiempo
    const scoreRef = React.useRef(0);

    const iniciarJuego = (nivel) => {
        setDificultad(nivel);
        setIndicePalabra(0);
        setPuntuacion(0);
        scoreRef.current = 0;
        setErrores(0);
        setTiempo(35); // 35 segundos para todas las dificultades
        cargarPalabra(nivel, 0);
        setEtapa('jugando');
    };

    // Timer effect
    useEffect(() => {
        let interval;
        if (etapa === 'jugando' && tiempo > 0) {
            interval = setInterval(() => {
                setTiempo((prev) => {
                    if (prev <= 1) {

                        // Guardar resultado cuando se acaba el tiempo
                        if (usuario && usuario.codigo) {
                            axios.post('http://localhost:3000/api/guardar-resultado', {
                                codigo: usuario.codigo,
                                juego: 'Completar',
                                dificultad: dificultad.charAt(0).toUpperCase() + dificultad.slice(1),
                                puntuacion: scoreRef.current,
                                tiempo_jugado: 35 - prev, // Tiempo total (35) menos restante
                                errores: errores
                            }).catch(err => console.error("Error guardando resultado:", err));
                        }

                        setEtapa('ganaste'); // Reutilizamos pantalla final
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [etapa, tiempo]);

    const cargarPalabra = (nivel, indice) => {
        const lista = palabrasData[nivel];
        if (indice >= lista.length) {
            // Si se acaban las palabras antes del tiempo, reiniciamos lista o terminamos?
            // Por simplicidad, si completa todas, geniales puntos extra o fin.
            // Vamos a hacer que vuelva a empezar la lista para ranking infinito en el tiempo
            setIndicePalabra(0);
            cargarPalabra(nivel, 0);
            return;
        }

        const obj = lista[indice];
        setPalabraObj(obj);

        // Preparar huecos vacíos
        const letras = obj.palabra.split('');
        setHuecos(letras.map(() => null)); // null significa vacío

        // Desordenar letras (asegurar unicidad de IDs para react key)
        const desordenadas = [...letras]
            .map((l, i) => ({ id: `orig-${i}`, letra: l, usada: false }))
            .sort(() => Math.random() - 0.5);

        setLetrasDesordenadas(desordenadas);
        setMensaje('');
    };

    const handleLetraClick = (letraObj) => {
        if (letraObj.usada) return; // Ya está arriba

        // Buscar primer hueco vacío
        const primerVacio = huecos.findIndex(h => h === null);
        if (primerVacio !== -1) {
            // Poner letra en hueco
            const nuevosHuecos = [...huecos];
            nuevosHuecos[primerVacio] = letraObj;
            setHuecos(nuevosHuecos);

            // Marcar letra como usada
            const nuevasDesordenadas = letrasDesordenadas.map(l => l.id === letraObj.id ? { ...l, usada: true } : l);
            setLetrasDesordenadas(nuevasDesordenadas);

            // Validar si se llenó (check if all slots filled)
            if (nuevosHuecos.every(h => h !== null)) {
                validarPalabra(nuevosHuecos, palabraObj.palabra);
            }
        }
    };

    const handleHuecoClick = (index) => {
        const letraEnHueco = huecos[index];
        if (!letraEnHueco) return;

        // Quitar del hueco
        const nuevosHuecos = [...huecos];
        nuevosHuecos[index] = null;
        setHuecos(nuevosHuecos);

        // Marcar como no usada abajo
        const nuevasDesordenadas = letrasDesordenadas.map(l => l.id === letraEnHueco.id ? { ...l, usada: false } : l);
        setLetrasDesordenadas(nuevasDesordenadas);
        setMensaje('');
    };

    const validarPalabra = (huecosLlenos, palabraCorrecta) => {
        const palabraFormada = huecosLlenos.map(h => h.letra).join('');
        if (palabraFormada === palabraCorrecta) {
            setMensaje('¡CORRECTO!');
            setPuntuacion(p => {
                const newScore = p + 1;
                scoreRef.current = newScore;
                return newScore;
            });
            setTimeout(() => {
                const nuevoIndice = indicePalabra + 1;
                setIndicePalabra(nuevoIndice);
                cargarPalabra(dificultad, nuevoIndice);
            }, 1000); // Esperar 1s para ver el mensaje
        } else {
            setMensaje('¡Casi! Inténtalo de nuevo');
            setErrores(prev => prev + 1);
            // Opcional: Auto-resetear letras incorrectas despues de un tiempo?
            // Por ahora dejamos que el usuario las quite
        }
    };

    return (
        <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})`, flexDirection: 'column' }}>

            {etapa === 'seleccion' && (
                <div className="formulario" style={{ textAlign: 'center' }}>
                    <h1 style={{ color: '#333' }}>Completa la Palabra</h1>
                    <p>Ordena las letras para escribir lo que ves en la imagen.</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                        <button onClick={() => { playSound('click'); iniciarJuego('facil'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#4CAF50')}>Fácil</button>
                        <button onClick={() => { playSound('click'); iniciarJuego('medio'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#FF9800')}>Medio</button>
                        <button onClick={() => { playSound('click'); iniciarJuego('dificil'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#f44336')}>Difícil</button>
                    </div>
                    <button onClick={() => { playSound('click'); onVolver(); }} onMouseEnter={() => playSound('hover')} style={{ ...btnStyle('#666'), marginTop: '20px' }}>Volver</button>
                </div>
            )}

            {etapa === 'jugando' && palabraObj && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '90%' }}>

                    {/* Panel Superior */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '600px', color: 'white', fontWeight: 'bold', fontSize: '1.5rem', textShadow: '2px 2px 4px black' }}>
                        <span>Nivel: {dificultad.toUpperCase()}</span>
                        <span style={{ color: tiempo < 10 ? '#ff5252' : 'white' }}>Tiempo: {tiempo}s</span>
                        <span>Puntos: {puntuacion}</span>
                    </div>

                    {/* Imagen */}
                    <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                        <img src={palabraObj.img} alt="Adivina" style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '10px' }} />
                    </div>

                    {/* Mensaje */}
                    <div style={{ height: '30px', color: mensaje === '¡CORRECTO!' ? '#4CAF50' : '#f44336', fontWeight: 'bold', fontSize: '2rem', textShadow: '1px 1px 2px white' }}>
                        {mensaje}
                    </div>

                    {/* Huecos (Donde se forma la palabra) */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {huecos.map((letraObj, i) => (
                            <div
                                key={i}
                                onClick={() => { playSound('click'); handleHuecoClick(i); }}
                                onMouseEnter={(e) => { if (letraObj) playSound('hover'); }}
                                style={{
                                    width: '60px', height: '60px',
                                    borderBottom: '4px solid #333',
                                    backgroundColor: letraObj ? '#fff' : 'rgba(255,255,255,0.3)',
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.5rem', fontWeight: 'bold',
                                    color: '#333',
                                    cursor: letraObj ? 'pointer' : 'default',
                                    boxShadow: letraObj ? '0 4px 6px rgba(0,0,0,0.2)' : 'none'
                                }}
                            >
                                {letraObj ? letraObj.letra : ''}
                            </div>
                        ))}
                    </div>

                    {/* Letras Desordenadas (Teclado) */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px', marginTop: '20px' }}>
                        {letrasDesordenadas.map((l) => (
                            <button
                                key={l.id}
                                onClick={() => { playSound('click'); handleLetraClick(l); }}
                                onMouseEnter={() => { if (!l.usada) playSound('hover'); }}
                                disabled={l.usada}
                                style={{
                                    width: '50px', height: '50px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: l.usada ? '#9E9E9E' : '#2196F3',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    cursor: l.usada ? 'default' : 'pointer',
                                    boxShadow: l.usada ? 'none' : '0 4px 0 #1565C0',
                                    transform: l.usada ? 'scale(0.9)' : 'scale(1)',
                                    opacity: l.usada ? 0.5 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {l.letra}
                            </button>
                        ))}
                    </div>

                    <button onClick={() => { playSound('click'); setEtapa('seleccion'); }} onMouseEnter={() => playSound('hover')} style={{ ...btnStyle('#f44336'), marginTop: '20px' }}>Salir</button>
                </div>
            )}

            {etapa === 'ganaste' && (
                <div className="formulario" style={{ textAlign: 'center' }}>
                    <h1 style={{ color: '#4CAF50' }}>{tiempo === 0 ? '¡Tiempo Agotado!' : '¡Nivel Completado!'}</h1>
                    <h2 style={{ color: '#333' }}>Puntuación Final: {puntuacion}</h2>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
                        <button onClick={() => { playSound('click'); setEtapa('seleccion'); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#2196F3')}>Jugar de nuevo</button>
                        <button onClick={() => { playSound('click'); onVolver(); }} onMouseEnter={() => playSound('hover')} style={btnStyle('#f44336')}>Salir</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default JuegoPalabra;
