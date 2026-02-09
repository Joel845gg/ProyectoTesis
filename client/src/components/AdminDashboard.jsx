import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fondo from '../assets/Fondo.png';
import { playSound } from '../utils/sound';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Gamepad2, Trophy, LogOut, TrendingUp, Award, Brain } from 'lucide-react';

const AdminDashboard = ({ onVolver }) => {
    const [jugadores, setJugadores] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabActiva, setTabActiva] = useState('general'); // 'general' o 'prepost'
    const [prepostJugadores, setPrepostJugadores] = useState([]);
    const [prepostStats, setPrepostStats] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, statsRes, prepostJugadoresRes, prepostStatsRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/admin/stats'),
                    axios.get('http://localhost:3000/api/admin/dashboard-stats'),
                    axios.get('http://localhost:3000/api/admin/prepost/jugadores'),
                    axios.get('http://localhost:3000/api/admin/prepost/stats')
                ]);
                setJugadores(usersRes.data);
                setStats(statsRes.data);
                setPrepostJugadores(prepostJugadoresRes.data);
                setPrepostStats(prepostStatsRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Error cargando dashboard", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const [busqueda, setBusqueda] = useState('');
    const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);

    const jugadoresFiltrados = jugadores.filter(j =>
        j.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.codigo.includes(busqueda)
    );

    const verDetalles = async (codigo) => {
        try {
            const res = await axios.get(`http://localhost:3000/api/usuario/${codigo}`);
            setJugadorSeleccionado(res.data);
        } catch (err) {
            console.error("Error cargando detalles", err);
        }
    };

    const handleEliminar = async (codigo) => {
        try {
            await axios.delete(`http://localhost:3000/api/usuario/${codigo}`);
            setJugadores(prev => prev.filter(j => j.codigo !== codigo));
            const statsRes = await axios.get('http://localhost:3000/api/admin/dashboard-stats');
            setStats(statsRes.data);
        } catch (err) {
            console.error("Error eliminando jugador", err);
            alert("Hubo un error al eliminar el jugador.");
        }
    };

    // Calcular juego más jugado
    const juegoMasJugado = stats?.juegos?.reduce((max, juego) =>
        juego.cantidad > (max?.cantidad || 0) ? juego : max, null
    );

    // Calcular mejores puntuaciones globales
    const mejoresPuntuaciones = [...jugadores]
        .sort((a, b) => parseFloat(b.mejor_puntuacion_global) - parseFloat(a.mejor_puntuacion_global))
        .slice(0, 5);

    // Preparar datos para gráficos Pre/Post
    const prepostChartData = prepostStats ? [
        {
            metrica: 'Atención',
            Inicial: parseFloat(prepostStats.promedio_atencion_inicial || 0).toFixed(1),
            Final: parseFloat(prepostStats.promedio_atencion_final || 0).toFixed(1),
            Mejora: parseFloat(prepostStats.promedio_mejora_atencion || 0).toFixed(1)
        },
        {
            metrica: 'Memoria',
            Inicial: parseFloat(prepostStats.promedio_memoria_inicial || 0).toFixed(1),
            Final: parseFloat(prepostStats.promedio_memoria_final || 0).toFixed(1),
            Mejora: parseFloat(prepostStats.promedio_mejora_memoria || 0).toFixed(1)
        },
        {
            metrica: 'Reacción',
            Inicial: parseFloat(prepostStats.promedio_reaccion_inicial || 0).toFixed(1),
            Final: parseFloat(prepostStats.promedio_reaccion_final || 0).toFixed(1),
            Mejora: parseFloat(prepostStats.promedio_mejora_reaccion || 0).toFixed(1)
        }
    ] : [];

    return (
        <div className="pantalla-completa" style={{ backgroundImage: `url(${fondo})`, overflowY: 'auto' }}>
            <div style={{
                backgroundColor: 'rgba(245, 247, 250, 0.98)',
                minHeight: '100vh',
                width: '100%',
                padding: '40px',
                boxSizing: 'border-box'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '2.5rem' }}>Panel de Control</h1>
                        <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Monitoreo y Análisis Cognitivo</p>
                    </div>
                    <button
                        onClick={() => { playSound('click'); onVolver(); }}
                        onMouseEnter={() => playSound('hover')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 25px', backgroundColor: '#e74c3c', color: 'white',
                            border: 'none', borderRadius: '12px', cursor: 'pointer',
                            fontWeight: 'bold', fontSize: '1rem',
                            boxShadow: '0 4px 6px rgba(231, 76, 60, 0.3)'
                        }}
                    >
                        <LogOut size={20} /> Cerrar Sesión
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e0e0e0' }}>
                    <button
                        onClick={() => { playSound('click'); setTabActiva('general'); }}
                        style={{
                            padding: '15px 30px',
                            backgroundColor: tabActiva === 'general' ? '#3498db' : 'transparent',
                            color: tabActiva === 'general' ? 'white' : '#7f8c8d',
                            border: 'none',
                            borderBottom: tabActiva === 'general' ? '3px solid #2980b9' : 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        Estadísticas Generales
                    </button>
                    <button
                        onClick={() => { playSound('click'); setTabActiva('prepost'); }}
                        style={{
                            padding: '15px 30px',
                            backgroundColor: tabActiva === 'prepost' ? '#9b59b6' : 'transparent',
                            color: tabActiva === 'prepost' ? 'white' : '#7f8c8d',
                            border: 'none',
                            borderBottom: tabActiva === 'prepost' ? '3px solid #8e44ad' : 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Brain size={20} /> Análisis Cognitivo (Pre/Post)
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#666' }}>Cargando datos...</div>
                ) : (
                    <>
                        {tabActiva === 'general' && (
                            <>
                                {/* KPI Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                    <Card
                                        title="Total Jugadores"
                                        value={stats?.generales?.total_jugadores || 0}
                                        icon={<Users size={32} color="#3498db" />}
                                        color="#3498db"
                                    />
                                    <Card
                                        title="Partidas Jugadas"
                                        value={stats?.generales?.total_partidas || 0}
                                        icon={<Gamepad2 size={32} color="#2ecc71" />}
                                        color="#2ecc71"
                                    />
                                    <Card
                                        title="Mejor Puntuación Global"
                                        value={Math.max(...jugadores.map(j => parseFloat(j.mejor_puntuacion_global) || 0), 0)}
                                        icon={<Trophy size={32} color="#f1c40f" />}
                                        color="#f1c40f"
                                    />
                                    <Card
                                        title="Juego Más Jugado"
                                        value={juegoMasJugado?.juego || 'N/A'}
                                        icon={<Award size={32} color="#9b59b6" />}
                                        color="#9b59b6"
                                    />
                                </div>

                                {/* Charts Section */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                                    <div style={chartContainerStyle}>
                                        <h3 style={{ color: '#34495e', marginBottom: '20px' }}>Promedio de Puntuación por Juego</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={stats?.puntajes}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="juego" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="promedio" name="Puntuación Promedio" fill="#8884d8" radius={[10, 10, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div style={chartContainerStyle}>
                                        <h3 style={{ color: '#34495e', marginBottom: '20px' }}>Distribución de Juegos</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={stats?.juegos}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="cantidad"
                                                    nameKey="juego"
                                                >
                                                    {stats?.juegos.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Top 5 Mejores Puntuaciones */}
                                <div style={{ ...chartContainerStyle, marginBottom: '40px' }}>
                                    <h3 style={{ color: '#34495e', marginBottom: '20px', padding: '0 20px' }}>🏆 Top 5 Mejores Puntuaciones</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                                                <th style={thStyle}>Posición</th>
                                                <th style={thStyle}>Jugador</th>
                                                <th style={thStyle}>Puntuación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mejoresPuntuaciones.map((jugador, index) => (
                                                <tr key={jugador.codigo} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                    <td style={{ ...tdStyle, textAlign: 'center', fontSize: '1.5rem' }}>
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                                                    </td>
                                                    <td style={tdStyle}>{jugador.nombre} {jugador.apellido}</td>
                                                    <td style={{ ...tdStyle, fontWeight: 'bold', color: '#27ae60' }}>{jugador.mejor_puntuacion_global}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Players Table */}
                                <div style={tableContainerStyle}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 20px' }}>
                                        <h3 style={{ color: '#34495e', margin: 0 }}>Listado Detallado de Jugadores</h3>
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, apellido o código..."
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                            style={{
                                                padding: '10px 15px',
                                                borderRadius: '8px',
                                                border: '1px solid #ddd',
                                                width: '300px',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                                                    <th style={thStyle}>Código</th>
                                                    <th style={thStyle}>Nombre</th>
                                                    <th style={thStyle}>Apellido</th>
                                                    <th style={thStyle}>Mejor Puntuación</th>
                                                    <th style={thStyle}>Puntuación Total</th>
                                                    <th style={thStyle}>Juegos</th>
                                                    <th style={thStyle}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {jugadoresFiltrados.map((jugador, index) => (
                                                    <tr key={jugador.codigo} style={{
                                                        borderBottom: '1px solid #e9ecef',
                                                        backgroundColor: index % 2 === 0 ? 'white' : '#fcfcfc'
                                                    }}>
                                                        <td style={tdStyle}><span style={badgeStyle}>{jugador.codigo}</span></td>
                                                        <td style={tdStyle}>{jugador.nombre}</td>
                                                        <td style={tdStyle}>{jugador.apellido}</td>
                                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#27ae60' }}>
                                                            {jugador.mejor_puntuacion_global}
                                                        </td>
                                                        <td style={tdStyle}>{jugador.puntuacion_total}</td>
                                                        <td style={tdStyle}>{jugador.total_juegos_jugados}</td>
                                                        <td style={tdStyle}>
                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                <button
                                                                    onClick={() => { playSound('click'); verDetalles(jugador.codigo); }}
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        backgroundColor: '#3498db',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.9rem'
                                                                    }}
                                                                    title="Ver Detalles"
                                                                >
                                                                    <Users size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        playSound('click');
                                                                        if (confirm('¿Estás seguro de eliminar a este jugador? Esta acción no se puede deshacer.')) {
                                                                            handleEliminar(jugador.codigo);
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        backgroundColor: '#e74c3c',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.9rem'
                                                                    }}
                                                                    title="Eliminar Jugador"
                                                                >
                                                                    <LogOut size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {tabActiva === 'prepost' && (
                            <>
                                <h2 style={{ color: '#2c3e50', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Brain size={32} color="#9b59b6" /> Análisis Cognitivo Pre-Test vs Post-Test
                                </h2>

                                {/* Estadísticas Agregadas */}
                                {prepostStats && (
                                    <div style={{ ...chartContainerStyle, marginBottom: '30px' }}>
                                        <h3 style={{ color: '#34495e', marginBottom: '20px' }}>📊 Promedios Grupales</h3>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={prepostChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="metrica" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="Inicial" fill="#e74c3c" name="Evaluación Inicial" />
                                                <Bar dataKey="Final" fill="#27ae60" name="Evaluación Final" />
                                                <Bar dataKey="Mejora" fill="#3498db" name="Mejora" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Tabla Detallada de Jugadores */}
                                <div style={tableContainerStyle}>
                                    <h3 style={{ color: '#34495e', marginBottom: '20px', padding: '0 20px' }}>Evaluaciones Individuales</h3>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                                                    <th style={thStyle}>Código</th>
                                                    <th style={thStyle}>Nombre</th>
                                                    <th style={thStyle} colSpan="2">Atención</th>
                                                    <th style={thStyle} colSpan="2">Memoria</th>
                                                    <th style={thStyle} colSpan="2">Reacción</th>
                                                    <th style={thStyle}>Mejoras</th>
                                                </tr>
                                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                                                    <th style={thStyle}></th>
                                                    <th style={thStyle}></th>
                                                    <th style={{ ...thStyle, fontSize: '0.8rem' }}>Inicial</th>
                                                    <th style={{ ...thStyle, fontSize: '0.8rem' }}>Final</th>
                                                    <th style={{ ...thStyle, fontSize: '0.8rem' }}>Inicial</th>
                                                    <th style={{ ...thStyle, fontSize: '0.8rem' }}>Final</th>
                                                    <th style={{ ...thStyle, fontSize: '0.8rem' }}>Inicial</th>
                                                    <th style={{ ...thStyle, fontSize: '0.8rem' }}>Final</th>
                                                    <th style={{ ...thStyle, fontSize: '0.8rem' }}>A/M/R</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {prepostJugadores.map((jugador, index) => (
                                                    <tr key={jugador.codigo} style={{
                                                        borderBottom: '1px solid #e9ecef',
                                                        backgroundColor: index % 2 === 0 ? 'white' : '#fcfcfc'
                                                    }}>
                                                        <td style={tdStyle}><span style={badgeStyle}>{jugador.codigo}</span></td>
                                                        <td style={tdStyle}>{jugador.nombre}</td>
                                                        <td style={{ ...tdStyle, textAlign: 'center', color: '#e74c3c' }}>{jugador.atencion_inicial}</td>
                                                        <td style={{ ...tdStyle, textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>{jugador.atencion_final}</td>
                                                        <td style={{ ...tdStyle, textAlign: 'center', color: '#e74c3c' }}>{jugador.memoria_inicial}</td>
                                                        <td style={{ ...tdStyle, textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>{jugador.memoria_final}</td>
                                                        <td style={{ ...tdStyle, textAlign: 'center', color: '#e74c3c' }}>{jugador.reaccion_inicial}</td>
                                                        <td style={{ ...tdStyle, textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>{jugador.reaccion_final}</td>
                                                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', color: '#3498db' }}>
                                                            +{jugador.mejora_atencion}/+{jugador.mejora_memoria}/+{jugador.mejora_reaccion}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Modal Detalles */}
                {jugadorSeleccionado && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '600px',
                            maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 5px 30px rgba(0,0,0,0.3)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, color: '#2c3e50' }}>{jugadorSeleccionado.nombre} {jugadorSeleccionado.apellido}</h2>
                                <button
                                    onClick={() => setJugadorSeleccionado(null)}
                                    style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7f8c8d' }}
                                >
                                    ✖
                                </button>
                            </div>

                            <h3 style={{ color: '#34495e', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Historial de Juegos</h3>
                            <div style={{ marginTop: '15px' }}>
                                {jugadorSeleccionado.historial_juegos && typeof jugadorSeleccionado.historial_juegos === 'object' && jugadorSeleccionado.historial_juegos.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Juego</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Dificultad</th>
                                                <th style={{ padding: '10px', textAlign: 'right' }}>Puntos</th>
                                                <th style={{ padding: '10px', textAlign: 'right' }}>Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...jugadorSeleccionado.historial_juegos].reverse().map((partida, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '10px' }}>{partida.juego}</td>
                                                    <td style={{ padding: '10px' }}>{partida.dificultad}</td>
                                                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#27ae60' }}>{partida.puntuacion}</td>
                                                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '0.9rem', color: '#7f8c8d' }}>
                                                        {new Date(partida.fecha).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>No hay partidas registradas.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Card = ({ title, value, icon, color }) => (
    <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        borderLeft: `5px solid ${color}`
    }}>
        <div style={{ padding: '15px', borderRadius: '50%', backgroundColor: `${color}20` }}>
            {icon}
        </div>
        <div>
            <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
            <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50', fontSize: '2rem' }}>{value}</h2>
        </div>
    </div>
);

const chartContainerStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
};

const tableContainerStyle = {
    backgroundColor: 'white',
    padding: '25px 0',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    overflow: 'hidden'
};

const thStyle = {
    padding: '15px 20px',
    textAlign: 'left',
    color: '#7f8c8d',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const tdStyle = {
    padding: '15px 20px',
    color: '#2c3e50',
    fontSize: '1rem'
};

const badgeStyle = {
    backgroundColor: '#ecf0f1',
    padding: '5px 10px',
    borderRadius: '6px',
    fontWeight: 'bold',
    color: '#34495e',
    fontFamily: 'monospace'
};

export default AdminDashboard;
