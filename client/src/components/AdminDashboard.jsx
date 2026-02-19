import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fondo from '../assets/Fondo.png';
import { playSound } from '../utils/sound';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Users, Gamepad2, Trophy, LogOut, TrendingUp, Award, Brain, Eye, Download } from 'lucide-react';

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
                    axios.get('/api/admin/stats'),
                    axios.get('/api/admin/dashboard-stats'),
                    axios.get('/api/admin/prepost/jugadores'),
                    axios.get('/api/admin/prepost/stats')
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
            const res = await axios.get(`/api/usuario/${codigo}`);
            setJugadorSeleccionado(res.data);
        } catch (err) {
            console.error("Error cargando detalles", err);
        }
    };

    const handleEliminar = async (codigo) => {
        try {
            await axios.delete(`/api/usuario/${codigo}`);
            setJugadores(prev => prev.filter(j => j.codigo !== codigo));
            const statsRes = await axios.get('/api/admin/dashboard-stats');
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

    const [mostrarModalEvaluacion, setMostrarModalEvaluacion] = useState(false);
    const [evaluacionData, setEvaluacionData] = useState({
        codigo: '',
        nombreJugador: '',
        tipo: 'inicial', // 'inicial' | 'final'
        paso: 1, // 1: Codigo, 2: Cuestionario
        respuestas: {} // { A1: 5, A2: 4 ... }
    });

    const preguntas = {
        A: [
            "Me distraigo fácilmente cuando realizo una actividad.",
            "Puedo mantener la atención durante varios minutos sin perder el foco.",
            "Me resulta difícil concentrarme cuando hay estímulos alrededor.",
            "Logro terminar una tarea sin abandonarla antes de tiempo."
        ],
        B: [
            "Recuerdo palabras o información que acabo de ver o escuchar.",
            "Olvido rápidamente lo que estaba haciendo.",
            "Puedo recordar la ubicación de objetos o imágenes vistas recientemente.",
            "Me cuesta relacionar información nueva con la que ya conozco."
        ],
        C: [
            "Reacciono rápidamente ante estímulos visuales.",
            "Siento que respondo con lentitud cuando debo actuar rápido.",
            "Me coordino bien al usar mis manos frente a una pantalla."
        ]
    };

    const handleBuscarJugador = async () => {
        try {
            const res = await axios.get(`/api/usuario/${evaluacionData.codigo}`);
            setEvaluacionData(prev => ({ ...prev, nombreJugador: `${res.data.nombre} ${res.data.apellido}`, paso: 2 }));
        } catch (err) {
            alert("Jugador no encontrado");
        }
    };

    const handleRespuestaChange = (seccion, indice, valor) => {
        setEvaluacionData(prev => ({
            ...prev,
            respuestas: { ...prev.respuestas, [`${seccion}${indice}`]: parseInt(valor) }
        }));
    };

    const calcularTotales = () => {
        // Sumar respuestas por sección
        let atencion = 0, memoria = 0, reaccion = 0;
        Object.keys(evaluacionData.respuestas).forEach(key => {
            const val = evaluacionData.respuestas[key];
            if (key.startsWith('A')) atencion += val;
            if (key.startsWith('B')) memoria += val;
            if (key.startsWith('C')) reaccion += val;
        });
        return { atencion, memoria, reaccion };
    };

    const handleGuardarEvaluacion = async () => {
        const totales = calcularTotales();
        try {
            await axios.post('/api/admin/evaluacion', {
                codigo: evaluacionData.codigo,
                tipo: evaluacionData.tipo,
                respuestas: totales
            });
            setMostrarModalEvaluacion(false);
            setEvaluacionData({ codigo: '', nombreJugador: '', tipo: 'inicial', paso: 1, respuestas: {} });

            // Recargar datos
            const [prepostJugadoresRes, prepostStatsRes] = await Promise.all([
                axios.get('/api/admin/prepost/jugadores'),
                axios.get('/api/admin/prepost/stats')
            ]);
            setPrepostJugadores(prepostJugadoresRes.data);
            setPrepostStats(prepostStatsRes.data);

            alert("Evaluación guardada correctamente");
        } catch (err) {
            console.error(err);
            alert("Error al guardar evaluación");
        }
    };

    const [modalIndividual, setModalIndividual] = useState(null);

    const generarRecomendacion = (jugador) => {
        const mAtencion = parseInt(jugador.mejora_atencion);
        const mMemoria = parseInt(jugador.mejora_memoria);
        const mReaccion = parseInt(jugador.mejora_reaccion);
        const total = mAtencion + mMemoria + mReaccion;

        // Identificar áreas
        const areas = [
            { nombre: 'Atención', valor: mAtencion },
            { nombre: 'Memoria', valor: mMemoria },
            { nombre: 'Reacción', valor: mReaccion }
        ];

        // Ordenar de menor a mayor mejora
        areas.sort((a, b) => a.valor - b.valor);
        const areaMenor = areas[0];
        const areaMayor = areas[2];

        if (mAtencion < 0 || mMemoria < 0 || mReaccion < 0) {
            return `Se ha detectado un descenso en el rendimiento de ${areaMenor.nombre}. Es fundamental priorizar ejercicios de esta área para recuperar y fortalecer la capacidad. Mantén la constancia para revertir esta tendencia.`;
        } else if (total > 8) {
            return `¡Resultados excepcionales! El jugador ha demostrado un crecimiento notable en todas las áreas, destacando especialmente en ${areaMayor.nombre}. Se recomienda aumentar el nivel de dificultad para seguir desafiando sus capacidades cognitivas.`;
        } else if (total >= 4) {
            return `Buen progreso general. Se observa una evolución positiva y equilibrada. Para maximizar el rendimiento, se sugiere enfocar las próximas sesiones en ${areaMenor.nombre}, que presenta un margen de mejora mayor.`;
        } else {
            return `Desempeño estable. Aunque se mantienen las capacidades, el crecimiento es moderado. Se recomienda aumentar la frecuencia de las sesiones y variar los tipos de juegos para estimular una mayor plasticidad neuronal.`;
        }
    };

    const generarPDF = (jugador) => {
        const doc = new jsPDF();


        // --- Header ---
        doc.setFontSize(22);
        doc.setTextColor(65, 84, 255); // Blue #4154FF
        doc.text("INTEGRA COGNITIVA", 15, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Reporte de Resultados Pre vs Post", 15, 26);

        // Player Info (Right aligned)
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(`${jugador.nombre}`, 195, 20, { align: 'right' });
        doc.setFontSize(10);
        doc.text(`ID: ${jugador.codigo}`, 195, 26, { align: 'right' });

        // Line Separator
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(15, 30, 195, 30);

        // --- Table Section ---
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("EVOLUCIÓN DE CAPACIDADES", 15, 45);

        autoTable(doc, {
            startY: 50,
            head: [['Categoría', 'Pre-Test', 'Post-Test', 'Mejora']],
            body: [
                ['Atención', jugador.atencion_inicial, jugador.atencion_final, jugador.mejora_atencion],
                ['Memoria', jugador.memoria_inicial, jugador.memoria_final, jugador.mejora_memoria],
                ['Reacción', jugador.reaccion_inicial, jugador.reaccion_final, jugador.mejora_reaccion],
            ],
            theme: 'grid',
            headStyles: { fillColor: [20, 24, 35], textColor: 255 }, // Dark header
            columnStyles: {
                0: { cellWidth: 80 },
                3: { fontStyle: 'bold', textColor: [0, 128, 0] } // Green for improvement (simplified)
            },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 3) {
                    const val = parseInt(data.cell.raw);
                    if (val > 0) {
                        data.cell.text = `+${val}`;
                        data.cell.styles.textColor = [46, 204, 113]; // Green
                    } else if (val < 0) {
                        data.cell.styles.textColor = [231, 76, 60]; // Red
                    } else {
                        data.cell.styles.textColor = [0, 0, 0]; // Black
                    }
                }
            }
        });

        // --- Chart Section ---
        let finalY = doc.lastAutoTable.finalY + 15;
        doc.text("COMPARATIVA VISUAL (GRIS: INICIAL | AZUL: FINAL)", 15, finalY);

        const startChartY = finalY + 10;
        const barHeight = 8;
        const gap = 15;
        const maxScore = 20; // Assuming max score is 20 for scaling (5 questions * 4? No, 4 questions * 5 = 20. Wait, Section C has 3 questions. Let's assume scale is max possible score. A=20, B=20, C=15. Let's normalize or just use fixed width).
        // Max possible scores: A=20, B=20, C=15. Let's use 20 as 100% width (approx 140 units).
        const maxWidth = 130;
        const scale = maxWidth / 20;

        const drawBar = (label, scorePre, scorePost, y) => {
            doc.setFontSize(9);
            doc.setTextColor(80);
            doc.text(label.toUpperCase(), 15, y + 6);

            // Bar Background (optional, maybe not needed)

            // Pre Bar (Gray)
            const widthPre = scorePre * scale;
            doc.setFillColor(160, 160, 160); // Gray
            doc.roundedRect(45, y, widthPre, barHeight, 2, 2, 'F');

            // Post Bar (Blue) - Draw below or overlay? The image looks like separate bars or overlaid. 
            // If I draw it slightly offset or below? Let's draw it just below the gray one for clarity, or overlapping if requested.
            // User said: "GRIS: INICIAL | AZUL: FINAL". Let's put Blue UNDER Gray visually? Or stacked? 
            // Let's do: Gray bar on top, Blue bar on bottom? No, image typically shows side by side or one over another.
            // Let's put Blue slightly lower (overlapping) or just below.
            // Let's try: Gray at y, Blue at y + 5 (overlapping).

            const widthPost = scorePost * scale;
            doc.setFillColor(65, 84, 255); // Blue
            doc.roundedRect(45, y + 4, widthPost, barHeight, 2, 2, 'F');
        };

        drawBar("ATENCION", jugador.atencion_inicial, jugador.atencion_final, startChartY);
        drawBar("MEMORIA", jugador.memoria_inicial, jugador.memoria_final, startChartY + gap);
        drawBar("REACCION", jugador.reaccion_inicial, jugador.reaccion_final, startChartY + gap * 2);

        // --- Recommendation Section ---
        const recY = startChartY + gap * 3 + 10;

        doc.setDrawColor(65, 84, 255);
        doc.setLineWidth(1);
        doc.roundedRect(15, recY, 180, 40, 3, 3); // Border container

        // Background fill for recommendation (very light blue)
        doc.setFillColor(240, 242, 255);
        doc.roundedRect(15, recY, 180, 40, 3, 3, 'F');

        // Blue strip on left
        doc.setFillColor(65, 84, 255);
        doc.roundedRect(15, recY, 2, 40, 1, 1, 'F');

        doc.setFontSize(11);
        doc.setTextColor(65, 84, 255);
        doc.text("RECOMENDACIÓN PROFESIONAL:", 25, recY + 10);

        doc.setFontSize(10);
        doc.setTextColor(60);

        // Generate dynamic recommendation
        const recomendacion = generarRecomendacion(jugador);

        const splitText = doc.splitTextToSize(recomendacion, 160);
        doc.text(splitText, 25, recY + 18);

        doc.save(`Reporte_Cognitivo_${jugador.nombre}_${jugador.codigo}.pdf`);
    };

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
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {tabActiva === 'prepost' && (
                            <button
                                onClick={() => { playSound('click'); setMostrarModalEvaluacion(true); }}
                                onMouseEnter={() => playSound('hover')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '12px 25px', backgroundColor: '#9b59b6', color: 'white',
                                    border: 'none', borderRadius: '12px', cursor: 'pointer',
                                    fontWeight: 'bold', fontSize: '1rem',
                                    boxShadow: '0 4px 6px rgba(155, 89, 182, 0.3)'
                                }}
                            >
                                <Brain size={20} /> Nueva Evaluación
                            </button>
                        )}
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
                                                <th style={thStyle}>Juego / Dificultad</th>
                                                <th style={thStyle}>Puntuación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats?.top5?.map((record, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                    <td style={{ ...tdStyle, textAlign: 'center', fontSize: '1.5rem' }}>
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                                                    </td>
                                                    <td style={tdStyle}>{record.nombre} {record.apellido}</td>
                                                    <td style={tdStyle}>
                                                        <span style={{ fontWeight: 'bold', color: '#34495e' }}>{record.juego}</span>
                                                        <span style={{ color: '#7f8c8d', fontSize: '0.9rem', marginLeft: '5px' }}>({record.dificultad})</span>
                                                    </td>
                                                    <td style={{ ...tdStyle, fontWeight: 'bold', color: '#27ae60' }}>{record.puntuacion}</td>
                                                </tr>
                                            ))}
                                            {!stats?.top5?.length && (
                                                <tr>
                                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#95a5a6' }}>
                                                        Aún no hay puntuaciones registradas.
                                                    </td>
                                                </tr>
                                            )}
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
                                                    <th style={thStyle}>Acciones</th>
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
                                                    <th style={thStyle}></th>
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
                                                        <td style={tdStyle}>
                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                <button
                                                                    onClick={() => setModalIndividual(jugador)}
                                                                    title="Ver Informe Individual"
                                                                    style={{
                                                                        padding: '5px 10px',
                                                                        backgroundColor: '#34495e',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '5px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => generarPDF(jugador)}
                                                                    style={{
                                                                        padding: '5px 10px',
                                                                        backgroundColor: '#e67e22',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '5px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <Download size={16} />
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

                            {/* 
                                CONTENIDO DEL DASHBOARD INDIVIDUAL 
                                Implementación de los 5 Indicadores: 
                                1. Puntaje por actividad (Gráfico de Línea)
                                2. Número de errores (Gráfico de Barras)
                                3. Frecuencia de uso (Gráfico de Barras por Fecha)
                                4. Tiempo de respuesta (Gráfico de Área/Línea)
                                5. Nivel alcanzado (Tarjetas de Dificultad Máxima)
                            */}
                            {(() => {
                                const historial = jugadorSeleccionado.historial_juegos || [];

                                if (historial.length === 0) {
                                    return <p style={{ color: '#7f8c8d', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>No hay partidas registradas para este jugador.</p>;
                                }

                                // --- PROCESAMIENTO DE DATOS ---

                                // 1. Datos para Gráficos de Evolución (Puntaje, Errores, Tiempo)
                                const datosEvolucion = historial.map((p, i) => ({
                                    intento: i + 1,
                                    fecha: new Date(p.fecha).toLocaleDateString(),
                                    puntaje: parseFloat(p.puntuacion),
                                    errores: parseInt(p.errores || 0),
                                    tiempo: parseInt(p.tiempo_jugado || 0),
                                    juego: p.juego,
                                    dificultad: p.dificultad
                                }));

                                // 2. Datos para Frecuencia de Uso (Por Fecha)
                                const frecuenciaMap = historial.reduce((acc, curr) => {
                                    const fecha = new Date(curr.fecha).toLocaleDateString();
                                    acc[fecha] = (acc[fecha] || 0) + 1;
                                    return acc;
                                }, {});
                                const datosFrecuencia = Object.keys(frecuenciaMap).map(fecha => ({
                                    fecha,
                                    partidas: frecuenciaMap[fecha]
                                }));

                                // 3. Nivel Alcanzado (Máxima dificultad por juego)
                                const nivelesPosibles = { 'Facil': 1, 'Medio': 2, 'Dificil': 3, 'Media': 2 }; // 'Media' corrección por si acaso
                                const nivelesMap = {};

                                historial.forEach(p => {
                                    const nivelActual = nivelesPosibles[p.dificultad] || 0;
                                    const nivelGuardado = nivelesMap[p.juego] ? nivelesPosibles[nivelesMap[p.juego]] : 0;

                                    if (nivelActual >= nivelGuardado) {
                                        nivelesMap[p.juego] = p.dificultad;
                                    }
                                });

                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                                        {/* INDICADOR 5: NIVEL ALCANZADO */}
                                        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '12px' }}>
                                            <h3 style={{ color: '#2c3e50', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <TrendingUp size={24} color="#e67e22" /> Nivel Máximo Alcanzado
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                                                {Object.keys(nivelesMap).map(juego => (
                                                    <div key={juego} style={{
                                                        backgroundColor: 'white', padding: '15px', borderRadius: '10px',
                                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center',
                                                        borderBottom: `4px solid ${nivelesMap[juego] === 'Dificil' ? '#e74c3c' :
                                                            nivelesMap[juego] === 'Medio' || nivelesMap[juego] === 'Media' ? '#f39c12' : '#2ecc71'
                                                            }`
                                                    }}>
                                                        <h4 style={{ margin: '0 0 5px 0', color: '#34495e' }}>{juego}</h4>
                                                        <span style={{
                                                            fontSize: '1.2rem', fontWeight: 'bold',
                                                            color: nivelesMap[juego] === 'Dificil' ? '#c0392b' : '#27ae60'
                                                        }}>
                                                            {nivelesMap[juego].toUpperCase()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                                            {/* INDICADOR 1: PUNTAJE POR ACTIVIDAD */}
                                            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                                                <h4 style={{ margin: '0 0 15px 0', color: '#3498db' }}>1. Evolución de Puntaje</h4>
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <LineChart data={datosEvolucion}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="intento" label={{ value: 'Partidas', position: 'insideBottomRight', offset: -5 }} />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Line type="monotone" dataKey="puntaje" stroke="#3498db" strokeWidth={2} name="Puntaje" dot={{ r: 3 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* INDICADOR 2: NÚMERO DE ERRORES */}
                                            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                                                <h4 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>2. Historial de Errores</h4>
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <BarChart data={datosEvolucion}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="intento" />
                                                        <YAxis allowDecimals={false} />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="errores" fill="#e74c3c" name="Errores Cometidos" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>

                                        </div>

                                        {/* TABLA DE HISTORIAL ORIGINAL (Como referencia detallada) */}
                                        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                            <h4 style={{ color: '#7f8c8d' }}>Detalle de Partidas (Referencia)</h4>
                                            <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                            <th style={{ padding: '10px', textAlign: 'left' }}>Juego</th>
                                                            <th style={{ padding: '10px', textAlign: 'left' }}>Dificultad</th>
                                                            <th style={{ padding: '10px', textAlign: 'center' }}>Errores</th>
                                                            <th style={{ padding: '10px', textAlign: 'right' }}>Puntos</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {[...historial].reverse().map((partida, i) => (
                                                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                                                <td style={{ padding: '10px' }}>{partida.juego}</td>
                                                                <td style={{ padding: '10px' }}>{partida.dificultad}</td>
                                                                <td style={{ padding: '10px', textAlign: 'center', color: '#e74c3c' }}>{partida.errores}</td>
                                                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#27ae60' }}>
                                                                    {partida.juego === 'Parejas' ? Math.round(partida.puntuacion) : partida.puntuacion}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Modal Nueva Evaluación */}
                {mostrarModalEvaluacion && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '700px',
                            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 5px 30px rgba(0,0,0,0.3)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, color: '#9b59b6' }}>Nueva Evaluación Cognitiva</h2>
                                <button
                                    onClick={() => setMostrarModalEvaluacion(false)}
                                    style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#7f8c8d' }}
                                >
                                    ✖
                                </button>
                            </div>

                            {evaluacionData.paso === 1 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#34495e', fontWeight: 'bold' }}>Código del Jugador:</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                value={evaluacionData.codigo}
                                                onChange={(e) => setEvaluacionData({ ...evaluacionData, codigo: e.target.value })}
                                                placeholder="Ej: 1234"
                                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #bdc3c7', fontSize: '1.1rem' }}
                                            />
                                            <button
                                                onClick={handleBuscarJugador}
                                                style={{
                                                    padding: '10px 20px', backgroundColor: '#3498db', color: 'white',
                                                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                                                }}
                                            >
                                                Buscar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ padding: '15px', backgroundColor: '#f0f3f6', borderRadius: '8px' }}>
                                        <p style={{ margin: 0, color: '#2c3e50', fontWeight: 'bold' }}>Jugador: <span style={{ color: '#2980b9' }}>{evaluacionData.nombreJugador}</span></p>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#34495e', fontWeight: 'bold' }}>Tipo de Evaluación:</label>
                                        <select
                                            value={evaluacionData.tipo}
                                            onChange={(e) => setEvaluacionData({ ...evaluacionData, tipo: e.target.value })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #bdc3c7', fontSize: '1.1rem' }}
                                        >
                                            <option value="inicial">Evaluación Inicial (Pre)</option>
                                            <option value="final">Evaluación Final (Post)</option>
                                        </select>
                                    </div>

                                    <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
                                        {['A', 'B', 'C'].map(seccion => (
                                            <div key={seccion} style={{ marginBottom: '20px' }}>
                                                <h4 style={{ color: '#e67e22', borderBottom: '2px solid #fcebb6', paddingBottom: '5px' }}>
                                                    {seccion === 'A' ? 'Sección A – Atención y Concentración' :
                                                        seccion === 'B' ? 'Sección B – Memoria' : 'Sección C – Velocidad de reacción y respuesta'}
                                                </h4>
                                                {preguntas[seccion].map((pregunta, i) => (
                                                    <div key={i} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px dashed #eee' }}>
                                                        <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>{pregunta}</p>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '300px' }}>
                                                            {[1, 2, 3, 4, 5].map(val => (
                                                                <label key={val} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`${seccion}${i}`}
                                                                        value={val}
                                                                        checked={evaluacionData.respuestas[`${seccion}${i}`] === val}
                                                                        onChange={(e) => handleRespuestaChange(seccion, i, e.target.value)}
                                                                        style={{ marginBottom: '5px' }}
                                                                    />
                                                                    <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{val}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                        <button
                                            onClick={() => setEvaluacionData(prev => ({ ...prev, paso: 1 }))}
                                            style={{
                                                padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white',
                                                border: 'none', borderRadius: '8px', cursor: 'pointer'
                                            }}
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            onClick={handleGuardarEvaluacion}
                                            style={{
                                                padding: '10px 20px', backgroundColor: '#27ae60', color: 'white',
                                                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                                            }}
                                        >
                                            Guardar Evaluación
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal Análisis Individual */}
                {modalIndividual && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
                    }}>
                        <div style={{
                            backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: '90%', maxWidth: '800px',
                            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '30px' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.8rem' }}>Análisis Individual</h2>
                                    <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>Jugador: <strong>{modalIndividual.nombre}</strong> (ID: {modalIndividual.codigo})</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => generarPDF(modalIndividual)}
                                        style={{
                                            padding: '8px 15px', backgroundColor: '#e67e22', color: 'white',
                                            border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center'
                                        }}
                                    >
                                        <Download size={16} /> PDF
                                    </button>
                                    <button
                                        onClick={() => setModalIndividual(null)}
                                        style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#95a5a6' }}
                                    >
                                        ✖
                                    </button>
                                </div>
                            </div>

                            {/* Contenido Visual */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                                {/* Tabla Resumen */}
                                <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '12px' }}>
                                    <h3 style={{ marginTop: 0, color: '#34495e', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Evolución</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '8px', color: '#7f8c8d', fontSize: '0.9rem' }}>Categoría</th>
                                                <th style={{ textAlign: 'center', padding: '8px', color: '#7f8c8d', fontSize: '0.9rem' }}>Pre</th>
                                                <th style={{ textAlign: 'center', padding: '8px', color: '#7f8c8d', fontSize: '0.9rem' }}>Post</th>
                                                <th style={{ textAlign: 'center', padding: '8px', color: '#7f8c8d', fontSize: '0.9rem' }}>Dif</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {['Atencion', 'Memoria', 'Reaccion'].map(cat => {
                                                const pre = modalIndividual[`${cat.toLowerCase()}_inicial`];
                                                const post = modalIndividual[`${cat.toLowerCase()}_final`];
                                                const diff = modalIndividual[`mejora_${cat.toLowerCase()}`];
                                                return (
                                                    <tr key={cat} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#2c3e50' }}>{cat}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center', color: '#7f8c8d' }}>{pre}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center', color: '#2c3e50', fontWeight: 'bold' }}>{post}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center', color: diff > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                                                            {diff > 0 ? '+' : ''}{diff}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Gráfico Simple (Barras CSS) */}
                                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                                    <h3 style={{ marginTop: 0, color: '#34495e', marginBottom: '20px' }}>Comparativa Visual</h3>
                                    {['Atencion', 'Memoria', 'Reaccion'].map(cat => {
                                        const pre = modalIndividual[`${cat.toLowerCase()}_inicial`];
                                        const post = modalIndividual[`${cat.toLowerCase()}_final`];
                                        // Escala simple: Max 20 puntos = 100%
                                        const pPre = (pre / 20) * 100;
                                        const pPost = (post / 20) * 100;

                                        return (
                                            <div key={cat} style={{ marginBottom: '15px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px', color: '#7f8c8d' }}>
                                                    <span>{cat.toUpperCase()}</span>
                                                </div>
                                                <div style={{ position: 'relative', height: '20px', backgroundColor: '#ecf0f1', borderRadius: '10px', overflow: 'hidden' }}>
                                                    {/* Barra Pre (Gris) */}
                                                    <div style={{
                                                        position: 'absolute', top: 0, left: 0, height: '100%', width: `${pPre}%`,
                                                        backgroundColor: '#bdc3c7', opacity: 0.7
                                                    }} title={`Inicial: ${pre}`}></div>
                                                    {/* Barra Post (Azul - superpuesta o abajo? Hagamos superpuesta con opacidad o más fina) */}
                                                    <div style={{
                                                        position: 'absolute', bottom: 0, left: 0, height: '50%', width: `${pPost}%`,
                                                        backgroundColor: '#3498db', zIndex: 2
                                                    }} title={`Final: ${post}`}></div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#95a5a6', marginTop: '2px' }}>
                                                    <span>Pre: {pre}</span>
                                                    <span>Post: {post}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recomendación */}
                            <div style={{ backgroundColor: '#f0f2ff', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #4154ff' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#4154ff' }}>RECOMENDACIÓN PROFESIONAL:</h4>
                                <p style={{ margin: 0, color: '#34495e', lineHeight: '1.5' }}>
                                    {generarRecomendacion(modalIndividual)}
                                </p>
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
