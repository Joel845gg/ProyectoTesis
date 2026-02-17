--
-- PostgreSQL database dump
--

\restrict ueGaLRXz9UcIpgXmYHy3cdyU2YvvjfmF4w2yuZfuSb7xktZPe85sBtZJ1ejT808

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_navigation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_navigation (
    id integer NOT NULL,
    icon character varying(50) NOT NULL,
    label character varying(100) NOT NULL,
    href character varying(200) NOT NULL
);


ALTER TABLE public.app_navigation OWNER TO postgres;

--
-- Name: app_navigation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.app_navigation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.app_navigation_id_seq OWNER TO postgres;

--
-- Name: app_navigation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.app_navigation_id_seq OWNED BY public.app_navigation.id;


--
-- Name: estadisticas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estadisticas (
    id integer NOT NULL,
    jugador_codigo character varying(10) NOT NULL,
    mejor_puntuacion_global numeric(10,2) NOT NULL,
    puntuacion_total numeric(10,2) NOT NULL,
    total_juegos_jugados integer NOT NULL
);


ALTER TABLE public.estadisticas OWNER TO postgres;

--
-- Name: estadisticas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estadisticas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estadisticas_id_seq OWNER TO postgres;

--
-- Name: estadisticas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estadisticas_id_seq OWNED BY public.estadisticas.id;


--
-- Name: historial_juegos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_juegos (
    id integer NOT NULL,
    jugador_codigo character varying(10) NOT NULL,
    juego character varying(30) NOT NULL,
    dificultad character varying(20) NOT NULL,
    puntuacion numeric(10,2) NOT NULL,
    tiempo_jugado integer NOT NULL,
    fecha timestamp without time zone NOT NULL,
    errores integer DEFAULT 0
);


ALTER TABLE public.historial_juegos OWNER TO postgres;

--
-- Name: historial_juegos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_juegos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_juegos_id_seq OWNER TO postgres;

--
-- Name: historial_juegos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_juegos_id_seq OWNED BY public.historial_juegos.id;


--
-- Name: jugadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jugadores (
    codigo character varying(10) NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido character varying(50) NOT NULL,
    fecha_registro timestamp without time zone NOT NULL
);


ALTER TABLE public.jugadores OWNER TO postgres;

--
-- Name: mejores_puntuaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mejores_puntuaciones (
    id integer NOT NULL,
    jugador_codigo character varying(10) NOT NULL,
    juego character varying(30) NOT NULL,
    dificultad character varying(20) NOT NULL,
    puntuacion numeric(10,2) NOT NULL
);


ALTER TABLE public.mejores_puntuaciones OWNER TO postgres;

--
-- Name: mejores_puntuaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mejores_puntuaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mejores_puntuaciones_id_seq OWNER TO postgres;

--
-- Name: mejores_puntuaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mejores_puntuaciones_id_seq OWNED BY public.mejores_puntuaciones.id;


--
-- Name: prepost_evaluaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prepost_evaluaciones (
    id integer NOT NULL,
    jugador_codigo character varying(10) NOT NULL,
    tipo character varying(10) NOT NULL,
    atencion integer NOT NULL,
    memoria integer NOT NULL,
    reaccion integer NOT NULL,
    CONSTRAINT prepost_evaluaciones_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['inicial'::character varying, 'final'::character varying])::text[])))
);


ALTER TABLE public.prepost_evaluaciones OWNER TO postgres;

--
-- Name: prepost_evaluaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prepost_evaluaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prepost_evaluaciones_id_seq OWNER TO postgres;

--
-- Name: prepost_evaluaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prepost_evaluaciones_id_seq OWNED BY public.prepost_evaluaciones.id;


--
-- Name: prepost_jugadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prepost_jugadores (
    codigo character varying(10) NOT NULL,
    nombre character varying(120) NOT NULL
);


ALTER TABLE public.prepost_jugadores OWNER TO postgres;

--
-- Name: prepost_mejoras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prepost_mejoras (
    id integer NOT NULL,
    jugador_codigo character varying(10) NOT NULL,
    atencion integer NOT NULL,
    memoria integer NOT NULL,
    reaccion integer NOT NULL
);


ALTER TABLE public.prepost_mejoras OWNER TO postgres;

--
-- Name: prepost_mejoras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prepost_mejoras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prepost_mejoras_id_seq OWNER TO postgres;

--
-- Name: prepost_mejoras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prepost_mejoras_id_seq OWNED BY public.prepost_mejoras.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    codigo character varying(4) NOT NULL,
    estadisticas jsonb DEFAULT '{}'::jsonb,
    historial_juegos jsonb DEFAULT '[]'::jsonb,
    mejores_puntuaciones jsonb DEFAULT '{}'::jsonb,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: app_navigation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_navigation ALTER COLUMN id SET DEFAULT nextval('public.app_navigation_id_seq'::regclass);


--
-- Name: estadisticas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas ALTER COLUMN id SET DEFAULT nextval('public.estadisticas_id_seq'::regclass);


--
-- Name: historial_juegos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_juegos ALTER COLUMN id SET DEFAULT nextval('public.historial_juegos_id_seq'::regclass);


--
-- Name: mejores_puntuaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mejores_puntuaciones ALTER COLUMN id SET DEFAULT nextval('public.mejores_puntuaciones_id_seq'::regclass);


--
-- Name: prepost_evaluaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepost_evaluaciones ALTER COLUMN id SET DEFAULT nextval('public.prepost_evaluaciones_id_seq'::regclass);


--
-- Name: prepost_mejoras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepost_mejoras ALTER COLUMN id SET DEFAULT nextval('public.prepost_mejoras_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: app_navigation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_navigation (id, icon, label, href) FROM stdin;
1	BarChart3	Resultados	/resultados
\.


--
-- Data for Name: estadisticas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estadisticas (id, jugador_codigo, mejor_puntuacion_global, puntuacion_total, total_juegos_jugados) FROM stdin;
1	0184	8.00	33.00	5
2	1031	29.00	97.50	9
3	1329	22.00	107.00	9
4	1393	24.00	97.00	9
5	1569	21.00	87.00	9
6	1812	72.00	124.00	7
7	2436	8.00	13.00	3
8	2532	15.00	78.50	9
9	2850	15.00	79.00	9
10	3201	16.00	82.50	10
11	4005	9.50	60.50	9
12	5413	15.00	82.00	10
13	5660	10.00	35.00	6
15	7649	14.00	67.50	9
16	8187	15.00	78.50	9
17	8434	66.00	98.00	6
18	8687	9.00	67.50	10
19	8872	21.00	47.00	6
20	9377	9.50	43.00	7
21	9733	8.50	20.50	3
25	9284	9.60	10.60	2
24	9779	49.00	124.60	7
\.


--
-- Data for Name: historial_juegos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_juegos (id, jugador_codigo, juego, dificultad, puntuacion, tiempo_jugado, fecha, errores) FROM stdin;
1	0184	Topo	Facil	7.00	29	2025-10-17 15:52:07	0
2	0184	Completar	Dificil	5.00	59	2025-10-17 15:51:18	0
3	0184	Completar	Facil	6.00	59	2025-10-17 15:50:13	0
9	1031	Topo	Facil	29.00	29	2026-01-06 18:31:27	0
10	1031	Topo	Medio	17.00	45	2026-01-06 18:32:16	0
11	1031	Topo	Dificil	8.00	41	2026-01-06 18:32:59	0
12	1031	Completar	Facil	9.00	59	2026-01-06 18:34:02	0
13	1031	Completar	Medio	8.00	60	2026-01-06 18:35:09	0
14	1031	Completar	Dificil	6.00	59	2026-01-06 18:36:12	0
18	1329	Topo	Facil	22.00	30	2026-01-06 12:54:39	0
19	1329	Topo	Medio	18.00	44	2026-01-06 12:55:30	0
20	1329	Topo	Dificil	22.00	41	2026-01-06 12:56:15	0
21	1329	Completar	Facil	10.00	60	2026-01-06 12:57:31	0
22	1329	Completar	Medio	7.00	60	2026-01-06 12:59:25	0
23	1329	Completar	Dificil	7.00	60	2026-01-06 13:00:28	0
27	1393	Topo	Facil	24.00	29	2026-01-07 13:34:18	0
28	1393	Topo	Medio	15.00	44	2026-01-07 13:35:08	0
29	1393	Topo	Dificil	19.00	40	2026-01-07 13:35:51	0
30	1393	Completar	Facil	7.00	59	2026-01-07 13:36:54	0
31	1393	Completar	Medio	6.00	60	2026-01-07 13:38:16	0
32	1393	Completar	Dificil	5.00	59	2026-01-07 13:39:19	0
36	1569	Topo	Facil	11.00	30	2026-01-06 18:38:56	0
37	1569	Topo	Medio	21.00	45	2026-01-06 18:40:03	0
38	1569	Topo	Dificil	7.00	41	2026-01-06 18:40:47	0
39	1569	Completar	Facil	11.00	60	2026-01-06 18:41:53	0
40	1569	Completar	Medio	9.00	59	2026-01-06 18:43:05	0
41	1569	Completar	Dificil	6.00	59	2026-01-06 18:44:08	0
42	1812	Topo	Medio	72.00	44	2025-10-17 15:22:14	0
43	1812	Topo	Facil	25.00	29	2025-10-17 15:21:22	0
44	1812	Completar	Dificil	4.00	59	2025-10-17 15:20:39	0
45	1812	Completar	Facil	6.00	60	2025-10-17 15:19:36	0
46	1812	Completar	Facil	3.00	60	2025-10-17 15:18:31	0
49	2436	Completar	Facil	2.00	60	2025-10-17 15:59:52	0
55	2532	Topo	Facil	15.00	29	2026-01-06 16:44:57	0
56	2532	Topo	Medio	8.00	45	2026-01-06 16:45:45	0
57	2532	Topo	Dificil	6.00	40	2026-01-06 16:46:28	0
58	2532	Completar	Facil	10.00	59	2026-01-06 16:47:57	0
59	2532	Completar	Medio	9.00	60	2026-01-06 16:49:00	0
60	2532	Completar	Dificil	8.00	59	2026-01-06 16:50:06	0
64	2850	Topo	Facil	7.00	29	2026-01-06 19:37:20	0
65	2850	Topo	Medio	15.00	45	2026-01-06 19:38:16	0
66	2850	Topo	Dificil	7.00	39	2026-01-06 19:41:01	0
67	2850	Completar	Facil	11.00	59	2026-01-06 19:42:04	0
68	2850	Completar	Medio	8.00	60	2026-01-06 19:45:50	0
69	2850	Completar	Dificil	6.00	60	2026-01-06 19:46:54	0
74	3201	Topo	Facil	16.00	29	2026-01-07 13:42:03	0
75	3201	Topo	Medio	9.00	44	2026-01-07 13:42:53	0
76	3201	Topo	Dificil	5.00	41	2026-01-07 13:43:39	0
77	3201	Completar	Facil	9.00	60	2026-01-07 13:44:43	0
78	3201	Completar	Medio	7.00	59	2026-01-07 13:46:14	0
79	3201	Completar	Dificil	6.00	59	2026-01-07 13:47:17	0
83	4005	Topo	Facil	4.00	30	2026-01-06 20:17:58	0
84	4005	Topo	Medio	8.00	45	2026-01-06 20:18:46	0
85	4005	Topo	Dificil	7.00	39	2026-01-06 20:19:27	0
86	4005	Completar	Facil	8.00	60	2026-01-06 20:20:30	0
87	4005	Completar	Medio	7.00	59	2026-01-06 20:21:34	0
88	4005	Completar	Dificil	7.00	60	2026-01-06 20:22:37	0
92	5413	Topo	Facil	9.00	30	2026-01-06 18:46:56	0
93	5413	Topo	Medio	15.00	45	2026-01-06 18:47:45	0
94	5413	Topo	Dificil	11.00	40	2026-01-06 18:48:28	0
95	5413	Completar	Facil	10.00	60	2026-01-06 18:49:31	0
96	5413	Completar	Medio	5.00	59	2026-01-06 18:50:38	0
97	5413	Completar	Dificil	5.00	59	2026-01-06 18:51:40	0
99	5660	Completar	Facil	7.00	60	2025-10-17 16:09:38	0
100	5660	Completar	Facil	3.00	59	2025-10-17 16:08:34	0
101	5660	Topo	Facil	4.00	29	2025-10-17 16:07:24	0
102	5660	Topo	Facil	4.00	29	2025-10-17 16:06:47	0
112	7649	Topo	Facil	5.00	30	2026-01-06 19:55:33	0
113	7649	Topo	Medio	14.00	45	2026-01-06 19:56:20	0
114	7649	Topo	Dificil	3.00	41	2026-01-06 19:57:04	0
4	0184	Parejas	Medio	7.00	109	2025-10-17 15:49:04	0
5	0184	Parejas	Facil	8.00	65	2025-10-17 15:47:09	0
6	1031	Parejas	Facil	9.00	9	2026-01-06 18:29:28	0
7	1031	Parejas	Medio	7.00	20	2026-01-06 18:29:51	0
115	7649	Completar	Facil	8.00	59	2026-01-06 20:01:10	0
116	7649	Completar	Medio	8.00	60	2026-01-06 20:13:25	0
117	7649	Completar	Dificil	8.00	60	2026-01-06 20:15:22	0
121	8187	Topo	Facil	13.00	29	2026-01-07 13:27:02	0
122	8187	Topo	Medio	15.00	44	2026-01-07 13:28:11	0
123	8187	Topo	Dificil	6.00	40	2026-01-07 13:28:57	0
124	8187	Completar	Facil	11.00	59	2026-01-07 13:30:02	0
125	8187	Completar	Medio	6.00	60	2026-01-07 13:31:05	0
126	8187	Completar	Dificil	7.00	59	2026-01-07 13:32:08	0
127	8434	Topo	Dificil	6.00	41	2025-10-17 15:44:54	0
128	8434	Topo	Facil	66.00	29	2025-10-17 15:43:59	0
129	8434	Completar	Dificil	6.00	59	2025-10-17 15:43:13	0
130	8434	Completar	Facil	10.00	59	2025-10-17 15:42:07	0
137	8687	Topo	Facil	8.00	30	2026-01-06 20:25:06	0
138	8687	Topo	Medio	6.00	44	2026-01-06 20:25:53	0
139	8687	Topo	Dificil	5.00	41	2026-01-06 20:26:51	0
140	8687	Completar	Facil	8.00	59	2026-01-06 20:27:54	0
141	8687	Completar	Medio	6.00	60	2026-01-06 20:28:58	0
142	8687	Completar	Dificil	5.00	59	2026-01-06 20:30:01	0
143	8872	Topo	Medio	21.00	44	2025-10-17 15:35:25	0
144	8872	Topo	Facil	5.00	29	2025-10-17 15:34:37	0
145	8872	Completar	Facil	5.00	60	2025-10-17 15:33:57	0
146	8872	Completar	Medio	3.00	59	2025-10-17 15:32:54	0
151	9377	Completar	Facil	6.00	59	2025-10-17 15:07:37	0
152	9377	Completar	Medio	6.00	59	2025-10-17 15:08:47	0
153	9377	Topo	Facil	7.00	29	2025-10-17 15:09:26	0
154	9377	Topo	Facil	7.00	29	2025-10-17 15:10:00	0
155	9377	Completar	Dificil	4.00	59	2025-10-17 15:11:08	0
158	9733	Completar	Facil	4.00	60	2025-10-17 16:16:56	0
8	1031	Parejas	Dificil	4.50	48	2026-01-06 18:30:42	0
15	1329	Parejas	Facil	8.50	12	2026-01-06 12:52:33	0
16	1329	Parejas	Medio	7.50	22	2026-01-06 12:52:59	0
17	1329	Parejas	Dificil	5.00	42	2026-01-06 12:53:45	0
24	1393	Parejas	Facil	9.00	8	2026-01-07 13:32:38	0
25	1393	Parejas	Medio	8.50	14	2026-01-07 13:32:55	0
26	1393	Parejas	Dificil	3.50	46	2026-01-07 13:33:45	0
33	1569	Parejas	Facil	9.50	9	2026-01-06 18:37:07	0
34	1569	Parejas	Medio	7.50	17	2026-01-06 18:37:26	0
35	1569	Parejas	Dificil	5.00	38	2026-01-06 18:38:07	0
47	1812	Parejas	Medio	5.50	189	2025-10-17 15:17:23	0
48	1812	Parejas	Facil	8.50	58	2025-10-17 15:14:11	0
50	2436	Parejas	Medio	3.00	126	2025-10-17 15:58:40	0
51	2436	Parejas	Facil	8.00	82	2025-10-17 15:56:29	0
52	2532	Parejas	Facil	8.50	11	2026-01-06 16:42:35	0
53	2532	Parejas	Medio	7.50	19	2026-01-06 16:42:58	0
54	2532	Parejas	Dificil	6.50	83	2026-01-06 16:44:24	0
61	2850	Parejas	Facil	9.50	4	2026-01-06 19:35:42	0
62	2850	Parejas	Medio	8.50	14	2026-01-06 19:35:57	0
63	2850	Parejas	Dificil	7.00	23	2026-01-06 19:36:23	0
70	3201	Parejas	Facil	9.00	7	2026-01-07 13:39:48	0
71	3201	Parejas	Medio	8.00	16	2026-01-07 13:40:09	0
72	3201	Parejas	Medio	8.50	14	2026-01-07 13:40:56	0
73	3201	Parejas	Dificil	5.00	32	2026-01-07 13:41:31	0
80	4005	Parejas	Facil	9.50	4	2026-01-06 20:16:21	0
81	4005	Parejas	Medio	7.00	18	2026-01-06 20:16:42	0
82	4005	Parejas	Dificil	3.00	40	2026-01-06 20:17:24	0
89	5413	Parejas	Facil	9.00	7	2026-01-06 18:45:14	0
90	5413	Parejas	Medio	7.00	28	2026-01-06 18:45:45	0
91	5413	Parejas	Dificil	4.50	34	2026-01-06 18:46:21	0
98	5413	Parejas	Medio	6.50	36	2026-01-13 10:22:21	0
103	5660	Parejas	Medio	7.00	82	2025-10-17 16:06:01	0
104	5660	Parejas	Facil	10.00	26	2025-10-17 16:04:34	0
109	7649	Parejas	Facil	10.00	2	2026-01-06 19:51:05	0
110	7649	Parejas	Medio	8.00	30	2026-01-06 19:51:38	0
111	7649	Parejas	Dificil	3.50	40	2026-01-06 19:55:01	0
118	8187	Parejas	Facil	9.50	5	2026-01-07 13:25:25	0
119	8187	Parejas	Medio	5.50	28	2026-01-07 13:25:56	0
120	8187	Parejas	Dificil	5.50	30	2026-01-07 13:26:29	0
131	8434	Parejas	Medio	2.00	161	2025-10-17 15:40:58	0
132	8434	Parejas	Facil	8.00	79	2025-10-17 15:38:13	0
133	8687	Parejas	Facil	9.00	5	2026-01-06 20:23:28	0
134	8687	Parejas	Facil	9.00	6	2026-01-06 20:23:36	0
135	8687	Parejas	Medio	7.50	18	2026-01-06 20:23:56	0
136	8687	Parejas	Dificil	4.00	36	2026-01-06 20:24:35	0
147	8872	Parejas	Medio	4.50	202	2025-10-17 15:31:46	0
148	8872	Parejas	Facil	8.50	78	2025-10-17 15:28:20	0
149	9377	Parejas	Facil	9.50	16	2025-10-17 15:02:09	0
150	9377	Parejas	Medio	3.50	257	2025-10-17 15:06:30	0
156	9733	Parejas	Facil	8.50	70	2025-10-17 16:14:48	0
157	9733	Parejas	Medio	8.00	56	2025-10-17 16:15:46	0
174	9779	Parejas	Dificil	7.60	46	2026-02-09 20:31:00.083641	24
175	9779	Atrapar	Dificil	49.00	59	2026-02-09 20:35:11.666982	3
176	9779	Atrapar	Dificil	49.00	59	2026-02-09 20:35:11.669152	3
177	9779	Topo	Medio	27.00	59	2026-02-09 20:35:53.281817	4
178	9779	Topo	Medio	27.00	59	2026-02-09 20:35:53.305864	4
179	9779	Completar	Dificil	5.00	34	2026-02-09 20:36:33.179514	0
180	9779	Completar	Dificil	5.00	34	2026-02-09 20:36:33.199986	0
181	9284	Parejas	Facil	9.60	13	2026-02-10 12:14:46.211364	4
182	9284	Topo	Medio	1.00	59	2026-02-10 12:16:39.576481	3
183	9284	Topo	Medio	1.00	59	2026-02-10 12:16:39.583394	3
184	9779	Completar	Medio	4.00	34	2026-02-10 12:32:39.211206	0
185	9779	Completar	Medio	4.00	34	2026-02-10 12:32:39.223534	0
\.


--
-- Data for Name: jugadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jugadores (codigo, nombre, apellido, fecha_registro) FROM stdin;
0184	Cesar	Muñoz	2025-10-17 15:45:42
1031	Maria	Gonzales	2026-01-06 18:28:37
1329	Maria	Guanoluisa	2026-01-06 12:51:56
1393	Teresa	Romero	2026-01-06 20:31:39
1569	Francisco	Perez	2026-01-06 18:36:44
1812	Gabriel	Freire	2025-10-17 15:12:36
2436	Maria	Chacon	2025-10-17 15:54:31
2532	Jose	Rodriguez	2026-01-06 16:41:33
2850	Juan	Martinez	2026-01-06 19:23:34
3201	Manuel	Torres	2026-01-06 20:31:55
4005	Antonio	Sanchez	2026-01-06 20:16:05
5413	Carmen	Lopez	2026-01-06 18:44:49
5660	Ramon	Caiza	2025-10-17 16:03:33
7649	Isabel	Garcia	2026-01-06 19:50:32
8187	Luis	Diaz	2026-01-06 20:31:21
8434	Carmen	Chicaiza	2025-10-17 15:36:34
8687	Rosa	Fernandez	2026-01-06 20:23:11
8872	Digna	Chacon	2025-10-17 15:26:38
9377	Isabel	Vizuete	2025-10-17 15:01:23
9733	Luis	Zambrano	2025-10-17 16:13:15
9779	Joel	Taipicaña	2026-02-09 20:26:24.065948
9284	Nicol	Chicaiza	2026-02-10 12:13:44.422025
\.


--
-- Data for Name: mejores_puntuaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mejores_puntuaciones (id, jugador_codigo, juego, dificultad, puntuacion) FROM stdin;
1	0184	Completar	Dificil	5.00
2	0184	Completar	Facil	6.00
5	0184	Topo	Facil	7.00
6	1031	Completar	Dificil	6.00
7	1031	Completar	Facil	9.00
8	1031	Completar	Medio	8.00
12	1031	Topo	Dificil	8.00
13	1031	Topo	Facil	29.00
14	1031	Topo	Medio	17.00
15	1329	Completar	Dificil	7.00
16	1329	Completar	Facil	10.00
17	1329	Completar	Medio	7.00
21	1329	Topo	Dificil	22.00
22	1329	Topo	Facil	22.00
23	1329	Topo	Medio	18.00
24	1393	Completar	Dificil	5.00
25	1393	Completar	Facil	7.00
26	1393	Completar	Medio	6.00
30	1393	Topo	Dificil	19.00
31	1393	Topo	Facil	24.00
32	1393	Topo	Medio	15.00
33	1569	Completar	Dificil	6.00
34	1569	Completar	Facil	11.00
35	1569	Completar	Medio	9.00
39	1569	Topo	Dificil	7.00
40	1569	Topo	Facil	11.00
41	1569	Topo	Medio	21.00
42	1812	Completar	Dificil	4.00
43	1812	Completar	Facil	6.00
46	1812	Topo	Facil	25.00
47	1812	Topo	Medio	72.00
48	2436	Completar	Facil	2.00
51	2532	Completar	Dificil	8.00
52	2532	Completar	Facil	10.00
53	2532	Completar	Medio	9.00
57	2532	Topo	Dificil	6.00
58	2532	Topo	Facil	15.00
59	2532	Topo	Medio	8.00
60	2850	Completar	Dificil	6.00
61	2850	Completar	Facil	11.00
62	2850	Completar	Medio	8.00
66	2850	Topo	Dificil	7.00
67	2850	Topo	Facil	7.00
68	2850	Topo	Medio	15.00
69	3201	Completar	Dificil	6.00
70	3201	Completar	Facil	9.00
71	3201	Completar	Medio	7.00
75	3201	Topo	Dificil	5.00
76	3201	Topo	Facil	16.00
77	3201	Topo	Medio	9.00
78	4005	Completar	Dificil	7.00
79	4005	Completar	Facil	8.00
80	4005	Completar	Medio	7.00
84	4005	Topo	Dificil	7.00
85	4005	Topo	Facil	4.00
86	4005	Topo	Medio	8.00
87	5413	Completar	Dificil	5.00
88	5413	Completar	Facil	10.00
89	5413	Completar	Medio	5.00
93	5413	Topo	Dificil	11.00
94	5413	Topo	Facil	9.00
95	5413	Topo	Medio	15.00
96	5660	Completar	Facil	7.00
99	5660	Topo	Facil	4.00
102	7649	Completar	Dificil	8.00
103	7649	Completar	Facil	8.00
104	7649	Completar	Medio	8.00
108	7649	Topo	Dificil	3.00
109	7649	Topo	Facil	5.00
110	7649	Topo	Medio	14.00
111	8187	Completar	Dificil	7.00
112	8187	Completar	Facil	11.00
113	8187	Completar	Medio	6.00
117	8187	Topo	Dificil	6.00
118	8187	Topo	Facil	13.00
119	8187	Topo	Medio	15.00
120	8434	Completar	Dificil	6.00
121	8434	Completar	Facil	10.00
124	8434	Topo	Dificil	6.00
125	8434	Topo	Facil	66.00
126	8687	Completar	Dificil	5.00
127	8687	Completar	Facil	8.00
128	8687	Completar	Medio	6.00
132	8687	Topo	Dificil	5.00
133	8687	Topo	Facil	8.00
134	8687	Topo	Medio	6.00
135	8872	Completar	Facil	5.00
136	8872	Completar	Medio	3.00
3	0184	Parejas	Facil	8.00
4	0184	Parejas	Medio	7.00
139	8872	Topo	Facil	5.00
140	8872	Topo	Medio	21.00
141	9377	Completar	Dificil	4.00
142	9377	Completar	Facil	6.00
143	9377	Completar	Medio	6.00
146	9377	Topo	Facil	7.00
147	9733	Completar	Facil	4.00
9	1031	Parejas	Dificil	4.50
10	1031	Parejas	Facil	9.00
11	1031	Parejas	Medio	7.00
18	1329	Parejas	Dificil	5.00
19	1329	Parejas	Facil	8.50
20	1329	Parejas	Medio	7.50
27	1393	Parejas	Dificil	3.50
28	1393	Parejas	Facil	9.00
29	1393	Parejas	Medio	8.50
36	1569	Parejas	Dificil	5.00
37	1569	Parejas	Facil	9.50
38	1569	Parejas	Medio	7.50
44	1812	Parejas	Facil	8.50
45	1812	Parejas	Medio	5.50
49	2436	Parejas	Facil	8.00
50	2436	Parejas	Medio	3.00
54	2532	Parejas	Dificil	6.50
55	2532	Parejas	Facil	8.50
56	2532	Parejas	Medio	7.50
63	2850	Parejas	Dificil	7.00
64	2850	Parejas	Facil	9.50
65	2850	Parejas	Medio	8.50
72	3201	Parejas	Dificil	5.00
73	3201	Parejas	Facil	9.00
74	3201	Parejas	Medio	8.50
81	4005	Parejas	Dificil	3.00
82	4005	Parejas	Facil	9.50
83	4005	Parejas	Medio	7.00
90	5413	Parejas	Dificil	4.50
91	5413	Parejas	Facil	9.00
92	5413	Parejas	Medio	7.00
97	5660	Parejas	Facil	10.00
98	5660	Parejas	Medio	7.00
105	7649	Parejas	Dificil	3.50
106	7649	Parejas	Facil	10.00
107	7649	Parejas	Medio	8.00
114	8187	Parejas	Dificil	5.50
115	8187	Parejas	Facil	9.50
116	8187	Parejas	Medio	5.50
122	8434	Parejas	Facil	8.00
123	8434	Parejas	Medio	2.00
129	8687	Parejas	Dificil	4.00
130	8687	Parejas	Facil	9.00
131	8687	Parejas	Medio	7.50
137	8872	Parejas	Facil	8.50
138	8872	Parejas	Medio	4.50
144	9377	Parejas	Facil	9.50
145	9377	Parejas	Medio	3.50
148	9733	Parejas	Facil	8.50
149	9733	Parejas	Medio	8.00
159	9779	Parejas	Dificil	7.60
160	9779	Atrapar	Dificil	49.00
161	9779	Atrapar	Dificil	49.00
162	9779	Topo	Medio	27.00
163	9779	Completar	Dificil	5.00
164	9284	Parejas	Facil	9.60
165	9284	Topo	Medio	1.00
166	9779	Completar	Medio	4.00
167	9779	Completar	Medio	4.00
\.


--
-- Data for Name: prepost_evaluaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prepost_evaluaciones (id, jugador_codigo, tipo, atencion, memoria, reaccion) FROM stdin;
1	0184	inicial	11	11	9
2	0184	final	13	14	10
3	1031	inicial	9	8	7
4	1031	final	11	10	8
5	1329	inicial	8	9	7
6	1329	final	10	12	8
7	1393	inicial	10	10	8
8	1393	final	12	12	9
9	1569	inicial	8	7	6
10	1569	final	10	9	7
11	1812	inicial	7	8	6
12	1812	final	9	10	7
13	2436	inicial	6	7	5
14	2436	final	8	9	6
15	2532	inicial	9	9	7
16	2532	final	11	12	8
17	2850	inicial	10	9	8
18	2850	final	12	12	9
19	3201	inicial	11	10	9
20	3201	final	13	13	10
21	4005	inicial	8	8	6
22	4005	final	10	10	7
23	5413	inicial	9	10	7
24	5413	final	11	13	8
25	5660	inicial	7	7	5
26	5660	final	9	10	6
27	7649	inicial	10	11	8
28	7649	final	12	14	9
29	8187	inicial	8	9	7
30	8187	final	10	12	8
31	8434	inicial	7	8	6
32	8434	final	9	10	7
33	8687	inicial	9	9	7
34	8687	final	11	12	8
35	8872	inicial	6	7	5
36	8872	final	8	9	6
37	9377	inicial	8	8	6
38	9377	final	10	10	7
39	9779	inicial	11	10	9
40	9779	final	15	17	13
\.


--
-- Data for Name: prepost_jugadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prepost_jugadores (codigo, nombre) FROM stdin;
0184	Alejandro Gallo
1031	Juliana Salas
1329	Andrea Mena
1393	Monica Diaz
1569	Carlos Rivera
1812	Jose Paredes
2436	Maria Lopez
2532	Roberto Bravo
2850	Juan Martinez
3201	Manuel Torres
4005	Antonio Sanchez
5413	Carmen Lopez
5660	Ramon Caiza
7649	Isabel Garcia
8187	Luis Diaz
8434	Carmen Chicaiza
8687	Rosa Fernandez
8872	Digna Chacon
9377	Isabel Vizuete
9779	Joel Taipicaña
\.


--
-- Data for Name: prepost_mejoras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prepost_mejoras (id, jugador_codigo, atencion, memoria, reaccion) FROM stdin;
1	0184	2	3	1
2	1031	2	2	1
3	1329	2	3	1
4	1393	2	2	1
5	1569	2	2	1
6	1812	2	2	1
7	2436	2	2	1
8	2532	2	3	1
9	2850	2	3	1
10	3201	2	3	1
11	4005	2	2	1
12	5413	2	3	1
13	5660	2	3	1
14	7649	2	3	1
15	8187	2	3	1
16	8434	2	2	1
17	8687	2	3	1
18	8872	2	2	1
19	9377	2	2	1
20	9779	4	7	4
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, apellido, codigo, estadisticas, historial_juegos, mejores_puntuaciones, fecha_registro) FROM stdin;
\.


--
-- Name: app_navigation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.app_navigation_id_seq', 1, true);


--
-- Name: estadisticas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estadisticas_id_seq', 25, true);


--
-- Name: historial_juegos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_juegos_id_seq', 216, true);


--
-- Name: mejores_puntuaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mejores_puntuaciones_id_seq', 198, true);


--
-- Name: prepost_evaluaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prepost_evaluaciones_id_seq', 41, true);


--
-- Name: prepost_mejoras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prepost_mejoras_id_seq', 20, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- Name: app_navigation app_navigation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_navigation
    ADD CONSTRAINT app_navigation_pkey PRIMARY KEY (id);


--
-- Name: estadisticas estadisticas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas
    ADD CONSTRAINT estadisticas_pkey PRIMARY KEY (id);


--
-- Name: historial_juegos historial_juegos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_juegos
    ADD CONSTRAINT historial_juegos_pkey PRIMARY KEY (id);


--
-- Name: jugadores jugadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_pkey PRIMARY KEY (codigo);


--
-- Name: mejores_puntuaciones mejores_puntuaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mejores_puntuaciones
    ADD CONSTRAINT mejores_puntuaciones_pkey PRIMARY KEY (id);


--
-- Name: prepost_evaluaciones prepost_evaluaciones_jugador_tipo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepost_evaluaciones
    ADD CONSTRAINT prepost_evaluaciones_jugador_tipo_key UNIQUE (jugador_codigo, tipo);


--
-- Name: prepost_evaluaciones prepost_evaluaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepost_evaluaciones
    ADD CONSTRAINT prepost_evaluaciones_pkey PRIMARY KEY (id);


--
-- Name: prepost_jugadores prepost_jugadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepost_jugadores
    ADD CONSTRAINT prepost_jugadores_pkey PRIMARY KEY (codigo);


--
-- Name: prepost_mejoras prepost_mejoras_jugador_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepost_mejoras
    ADD CONSTRAINT prepost_mejoras_jugador_key UNIQUE (jugador_codigo);


--
-- Name: prepost_mejoras prepost_mejoras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepost_mejoras
    ADD CONSTRAINT prepost_mejoras_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_codigo_key UNIQUE (codigo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: estadisticas estadisticas_jugador_codigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estadisticas
    ADD CONSTRAINT estadisticas_jugador_codigo_fkey FOREIGN KEY (jugador_codigo) REFERENCES public.jugadores(codigo) ON DELETE CASCADE;


--
-- Name: historial_juegos historial_juegos_jugador_codigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_juegos
    ADD CONSTRAINT historial_juegos_jugador_codigo_fkey FOREIGN KEY (jugador_codigo) REFERENCES public.jugadores(codigo) ON DELETE CASCADE;


--
-- Name: mejores_puntuaciones mejores_puntuaciones_jugador_codigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mejores_puntuaciones
    ADD CONSTRAINT mejores_puntuaciones_jugador_codigo_fkey FOREIGN KEY (jugador_codigo) REFERENCES public.jugadores(codigo) ON DELETE CASCADE;


--
-- Name: prepost_evaluaciones prepost_evaluaciones_jugador_codigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepost_evaluaciones
    ADD CONSTRAINT prepost_evaluaciones_jugador_codigo_fkey FOREIGN KEY (jugador_codigo) REFERENCES public.prepost_jugadores(codigo) ON DELETE CASCADE;


--
-- Name: prepost_mejoras prepost_mejoras_jugador_codigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prepost_mejoras
    ADD CONSTRAINT prepost_mejoras_jugador_codigo_fkey FOREIGN KEY (jugador_codigo) REFERENCES public.prepost_jugadores(codigo) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ueGaLRXz9UcIpgXmYHy3cdyU2YvvjfmF4w2yuZfuSb7xktZPe85sBtZJ1ejT808

