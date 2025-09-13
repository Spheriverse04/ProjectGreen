--
-- PostgreSQL database dump
--

\restrict SKiyJ46dy0fcTbXe92sLLa1RqUx2v9JG7f9WmjQMM1pWXzt6nTQ7L8ROsyghWM6

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: QuestionType; Type: TYPE; Schema: public; Owner: projectgreen_user
--

CREATE TYPE public."QuestionType" AS ENUM (
    'MCQ',
    'SUBJECTIVE'
);


ALTER TYPE public."QuestionType" OWNER TO projectgreen_user;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: projectgreen_user
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'WORKER',
    'CITIZEN'
);


ALTER TYPE public."Role" OWNER TO projectgreen_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Flashcard; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."Flashcard" (
    id text NOT NULL,
    "moduleId" text NOT NULL,
    question text NOT NULL,
    answer text NOT NULL
);


ALTER TABLE public."Flashcard" OWNER TO projectgreen_user;

--
-- Name: Quiz; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."Quiz" (
    id text NOT NULL,
    "moduleId" text NOT NULL,
    title text NOT NULL
);


ALTER TABLE public."Quiz" OWNER TO projectgreen_user;

--
-- Name: QuizOption; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."QuizOption" (
    id text NOT NULL,
    "questionId" text NOT NULL,
    text text NOT NULL,
    "isCorrect" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."QuizOption" OWNER TO projectgreen_user;

--
-- Name: QuizQuestion; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."QuizQuestion" (
    id text NOT NULL,
    "quizId" text NOT NULL,
    type public."QuestionType" NOT NULL,
    question text NOT NULL,
    answer text
);


ALTER TABLE public."QuizQuestion" OWNER TO projectgreen_user;

--
-- Name: TrainingModule; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."TrainingModule" (
    id text NOT NULL,
    title text NOT NULL,
    role public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TrainingModule" OWNER TO projectgreen_user;

--
-- Name: User; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    age integer,
    gender text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'CITIZEN'::public."Role" NOT NULL,
    "totalXp" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."User" OWNER TO projectgreen_user;

--
-- Name: UserFlashcardProgress; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."UserFlashcardProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "flashcardId" text NOT NULL,
    mastered boolean DEFAULT false NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."UserFlashcardProgress" OWNER TO projectgreen_user;

--
-- Name: UserModuleProgress; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."UserModuleProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "moduleId" text NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."UserModuleProgress" OWNER TO projectgreen_user;

--
-- Name: UserQuizProgress; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."UserQuizProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "quizId" text NOT NULL,
    score integer,
    accuracy double precision,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."UserQuizProgress" OWNER TO projectgreen_user;

--
-- Name: UserVideoProgress; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."UserVideoProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "videoId" text NOT NULL,
    watched boolean DEFAULT false NOT NULL,
    "xpEarned" integer DEFAULT 0 NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."UserVideoProgress" OWNER TO projectgreen_user;

--
-- Name: Video; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public."Video" (
    id text NOT NULL,
    "moduleId" text NOT NULL,
    title text NOT NULL,
    url text NOT NULL
);


ALTER TABLE public."Video" OWNER TO projectgreen_user;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: projectgreen_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO projectgreen_user;

--
-- Data for Name: Flashcard; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."Flashcard" (id, "moduleId", question, answer) FROM stdin;
e5854dd2-1a3b-4734-ba53-32833bee1d4d	cb746bbc-1ee3-4660-98b0-4958f7d71021	Introduction	You are a  LOL!
49190210-9751-4c90-b273-943b59652d7d	6a69694e-b8e9-4711-96cc-1a917035ac70	Context	Why are u here?
3bcebcdc-b6d4-4b66-ad47-4bb6bd08cbb6	f10d4e09-ea74-4045-af5d-e68bfe91e377	Introduction	Are u ready!
\.


--
-- Data for Name: Quiz; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."Quiz" (id, "moduleId", title) FROM stdin;
914a8a29-1cbe-4736-a97a-ea79f7418561	cb746bbc-1ee3-4660-98b0-4958f7d71021	Alphabet word
c611ac11-075e-4bbd-84dc-a7d32c0b385e	6a69694e-b8e9-4711-96cc-1a917035ac70	Who are You
da552f40-7a74-4a91-bc42-ad8cdced4fd5	f10d4e09-ea74-4045-af5d-e68bfe91e377	Intro
\.


--
-- Data for Name: QuizOption; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."QuizOption" (id, "questionId", text, "isCorrect") FROM stdin;
b2517c93-52c4-476b-bf80-8bc2bed28967	f33117bb-fd6a-4e5f-b3ba-6383c1470fad	Apple	t
269148c3-807a-414c-a7ae-1ce56a71e3fb	f33117bb-fd6a-4e5f-b3ba-6383c1470fad	Mango	f
b5a97109-7c30-42c3-951a-c4caf25cb976	f33117bb-fd6a-4e5f-b3ba-6383c1470fad	Orange	f
1394665b-41f8-4623-b88d-55a1a3ffbccb	58a3c10a-5bbd-4ca6-a410-dd835c371577	LOL!	t
86b82dac-82e6-406b-90b2-17f269438514	58a3c10a-5bbd-4ca6-a410-dd835c371577	PRO	f
1c23264a-9ced-4a9c-acd1-e4c37561663a	58a3c10a-5bbd-4ca6-a410-dd835c371577	NUB...	f
fa3dfb0d-25f0-4422-a5da-92128bb41353	c6a49140-3cf7-446c-baf4-85d456438b9e	Mad	t
1f9fa1ef-94ff-423b-a56b-7b12a4765476	c6a49140-3cf7-446c-baf4-85d456438b9e	Crazy	f
55dc1914-ff34-4c9a-8f0d-b30357bdf10b	c6a49140-3cf7-446c-baf4-85d456438b9e	Psycho	f
658f525d-2a07-4cf7-a5d4-559a8476b25b	5648f250-879a-47bd-88f5-dc9b6fcd20f0	Banana	t
0f3fd414-cab4-469b-8689-14cac88602b1	5648f250-879a-47bd-88f5-dc9b6fcd20f0	Orange	f
\.


--
-- Data for Name: QuizQuestion; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."QuizQuestion" (id, "quizId", type, question, answer) FROM stdin;
f33117bb-fd6a-4e5f-b3ba-6383c1470fad	914a8a29-1cbe-4736-a97a-ea79f7418561	MCQ	A for : 	\N
58a3c10a-5bbd-4ca6-a410-dd835c371577	c611ac11-075e-4bbd-84dc-a7d32c0b385e	MCQ	You are a : 	\N
c6a49140-3cf7-446c-baf4-85d456438b9e	da552f40-7a74-4a91-bc42-ad8cdced4fd5	MCQ	who are u	\N
5648f250-879a-47bd-88f5-dc9b6fcd20f0	914a8a29-1cbe-4736-a97a-ea79f7418561	MCQ	B for: 	\N
\.


--
-- Data for Name: TrainingModule; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."TrainingModule" (id, title, role, "createdAt") FROM stdin;
cb746bbc-1ee3-4660-98b0-4958f7d71021	Module 1	CITIZEN	2025-09-12 09:10:24.802
f10d4e09-ea74-4045-af5d-e68bfe91e377	Module 1	WORKER	2025-09-12 10:12:35.979
6a69694e-b8e9-4711-96cc-1a917035ac70	Module 2	CITIZEN	2025-09-12 14:50:13.266
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."User" (id, name, email, phone, age, gender, "createdAt", password, role, "totalXp") FROM stdin;
d69b3b47-6d06-4ca1-8dcc-7b8012ef714b	Super Admin	admin@projectgreen.com	+911234567890	\N	\N	2025-09-11 17:18:54.969	$2b$10$EAipv55bAv6zQZ.jHTSJOOOqNEanJwq91oBCEsmcrE0F.zZmjcbpG	ADMIN	0
d2e8d699-e1fd-49bf-9ede-ff6eb0cf34b2	Kaushik	abc@mail.com	+918876076788	\N	\N	2025-09-12 06:55:26.065	$2b$10$5UtlwEaO.hkxtF1/LVP7zOZs1gs6QGehl5fHMdv/D5s2iUPlBkOJa	CITIZEN	0
c6902f19-5fcd-4015-9e53-d1cbe4961948	Mintu	mintu@mail.com	+919707455784	\N	\N	2025-09-12 15:01:36.443	$2b$10$WbdoYKTufLf2c0dqevstzuVEGoJrY.FkhurRX5O9xFzcvlZYwqQ5q	WORKER	0
\.


--
-- Data for Name: UserFlashcardProgress; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."UserFlashcardProgress" (id, "userId", "flashcardId", mastered, "xpEarned", "completedAt") FROM stdin;
22ff4f12-b9c9-414a-bb24-a64b4028ff7a	d2e8d699-e1fd-49bf-9ede-ff6eb0cf34b2	e5854dd2-1a3b-4734-ba53-32833bee1d4d	t	10	2025-09-12 20:55:13.929
\.


--
-- Data for Name: UserModuleProgress; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."UserModuleProgress" (id, "userId", "moduleId", completed, "xpEarned", "completedAt") FROM stdin;
\.


--
-- Data for Name: UserQuizProgress; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."UserQuizProgress" (id, "userId", "quizId", score, accuracy, "xpEarned", "completedAt") FROM stdin;
0c323a92-5574-41b1-9036-aa7841257951	d2e8d699-e1fd-49bf-9ede-ff6eb0cf34b2	914a8a29-1cbe-4736-a97a-ea79f7418561	0	\N	100	2025-09-12 20:55:33.45
\.


--
-- Data for Name: UserVideoProgress; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."UserVideoProgress" (id, "userId", "videoId", watched, "xpEarned", "completedAt") FROM stdin;
f8804d15-23c0-4048-bbdb-ff75e689c32f	d2e8d699-e1fd-49bf-9ede-ff6eb0cf34b2	b9aca2af-b9f7-4f8a-9f89-916128397012	t	15	2025-09-12 20:55:19.713
\.


--
-- Data for Name: Video; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public."Video" (id, "moduleId", title, url) FROM stdin;
b9aca2af-b9f7-4f8a-9f89-916128397012	cb746bbc-1ee3-4660-98b0-4958f7d71021	India's Solid Waste Management Strategy	https://youtu.be/F2RdvQsFRPk?si=M-YgpQqIiDYL_7h_
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: projectgreen_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a10e58ba-b20a-440c-9366-86c1d348076a	af152961c1e404a763cc9091594014b2c82e5158b910c280ad4441924ca3de10	2025-09-10 01:30:47.738527+05:30	20250909200047_init	\N	\N	2025-09-10 01:30:47.725578+05:30	1
6c4101a1-28c1-4328-bd4a-2cf81e466d03	a5ce9d07414da497803e8f730fac0648c6c12e8aef01bcc78c55aabdcf2330f7	2025-09-10 18:15:10.619326+05:30	20250910124510_add_password_to_user	\N	\N	2025-09-10 18:15:10.613761+05:30	1
257cc182-c6cc-4d59-b179-55872213e275	e39e133ccf9f432d09ef378009cbc38a8207380a9f147377d66b4d05d0e1ee6d	2025-09-11 10:56:23.959199+05:30	20250911052623_add_role_to_user	\N	\N	2025-09-11 10:56:23.955674+05:30	1
5a1c51aa-3a64-417c-8de5-0dea5c128a44	8f24ab3e34e2fbba08689042c867b62d13488ec7cbb67271c147f261fb7a4ab0	2025-09-11 20:34:21.372154+05:30	20250911150421_add_training_module	\N	\N	2025-09-11 20:34:21.353445+05:30	1
a685c75e-a802-4cf1-bf91-0e6219ef8694	1a2663e2fabdc9ec8041242514a08e0de16f1b603eee4303d57982c9a8a674e7	2025-09-12 23:21:55.34632+05:30	20250912175155_add_user_progress	\N	\N	2025-09-12 23:21:55.318169+05:30	1
\.


--
-- Name: Flashcard Flashcard_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."Flashcard"
    ADD CONSTRAINT "Flashcard_pkey" PRIMARY KEY (id);


--
-- Name: QuizOption QuizOption_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."QuizOption"
    ADD CONSTRAINT "QuizOption_pkey" PRIMARY KEY (id);


--
-- Name: QuizQuestion QuizQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."QuizQuestion"
    ADD CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY (id);


--
-- Name: Quiz Quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_pkey" PRIMARY KEY (id);


--
-- Name: TrainingModule TrainingModule_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."TrainingModule"
    ADD CONSTRAINT "TrainingModule_pkey" PRIMARY KEY (id);


--
-- Name: UserFlashcardProgress UserFlashcardProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserFlashcardProgress"
    ADD CONSTRAINT "UserFlashcardProgress_pkey" PRIMARY KEY (id);


--
-- Name: UserModuleProgress UserModuleProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserModuleProgress"
    ADD CONSTRAINT "UserModuleProgress_pkey" PRIMARY KEY (id);


--
-- Name: UserQuizProgress UserQuizProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserQuizProgress"
    ADD CONSTRAINT "UserQuizProgress_pkey" PRIMARY KEY (id);


--
-- Name: UserVideoProgress UserVideoProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserVideoProgress"
    ADD CONSTRAINT "UserVideoProgress_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Video Video_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."Video"
    ADD CONSTRAINT "Video_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: UserFlashcardProgress_userId_flashcardId_key; Type: INDEX; Schema: public; Owner: projectgreen_user
--

CREATE UNIQUE INDEX "UserFlashcardProgress_userId_flashcardId_key" ON public."UserFlashcardProgress" USING btree ("userId", "flashcardId");


--
-- Name: UserModuleProgress_userId_moduleId_key; Type: INDEX; Schema: public; Owner: projectgreen_user
--

CREATE UNIQUE INDEX "UserModuleProgress_userId_moduleId_key" ON public."UserModuleProgress" USING btree ("userId", "moduleId");


--
-- Name: UserQuizProgress_userId_quizId_key; Type: INDEX; Schema: public; Owner: projectgreen_user
--

CREATE UNIQUE INDEX "UserQuizProgress_userId_quizId_key" ON public."UserQuizProgress" USING btree ("userId", "quizId");


--
-- Name: UserVideoProgress_userId_videoId_key; Type: INDEX; Schema: public; Owner: projectgreen_user
--

CREATE UNIQUE INDEX "UserVideoProgress_userId_videoId_key" ON public."UserVideoProgress" USING btree ("userId", "videoId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: projectgreen_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: projectgreen_user
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: Flashcard Flashcard_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."Flashcard"
    ADD CONSTRAINT "Flashcard_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."TrainingModule"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QuizOption QuizOption_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."QuizOption"
    ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."QuizQuestion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: QuizQuestion QuizQuestion_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."QuizQuestion"
    ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public."Quiz"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Quiz Quiz_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."TrainingModule"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserFlashcardProgress UserFlashcardProgress_flashcardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserFlashcardProgress"
    ADD CONSTRAINT "UserFlashcardProgress_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES public."Flashcard"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserFlashcardProgress UserFlashcardProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserFlashcardProgress"
    ADD CONSTRAINT "UserFlashcardProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserModuleProgress UserModuleProgress_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserModuleProgress"
    ADD CONSTRAINT "UserModuleProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."TrainingModule"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserModuleProgress UserModuleProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserModuleProgress"
    ADD CONSTRAINT "UserModuleProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserQuizProgress UserQuizProgress_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserQuizProgress"
    ADD CONSTRAINT "UserQuizProgress_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public."Quiz"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserQuizProgress UserQuizProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserQuizProgress"
    ADD CONSTRAINT "UserQuizProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserVideoProgress UserVideoProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserVideoProgress"
    ADD CONSTRAINT "UserVideoProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserVideoProgress UserVideoProgress_videoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."UserVideoProgress"
    ADD CONSTRAINT "UserVideoProgress_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES public."Video"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Video Video_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: projectgreen_user
--

ALTER TABLE ONLY public."Video"
    ADD CONSTRAINT "Video_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."TrainingModule"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict SKiyJ46dy0fcTbXe92sLLa1RqUx2v9JG7f9WmjQMM1pWXzt6nTQ7L8ROsyghWM6

