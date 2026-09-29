import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import type { Course, Enrollment, CourseProgress } from './types';
import { Navbar } from './components/Navbar';
import {
  Play,
  Clock,
  BookOpen,
  CheckCircle,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );

  const [view, setView] = useState<
    'catalog' | 'dashboard' | 'player'
  >('catalog');

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [authError, setAuthError] = useState('');

  // ==============================
  // CARREGAR CURSOS
  // ==============================

  const loadCourses = async () => {
    try {
      const res = await api.get<Course[]>('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error('Erro ao carregar cursos:', err);
    }
  };

  // ==============================
  // CARREGAR MINHAS MATRÍCULAS
  // ==============================

  const loadMyEnrollments = async () => {
    if (!token) return;

    try {
      const res = await api.get<Enrollment[]>(
        '/enrollments/my-courses'
      );

      setMyEnrollments(res.data);
    } catch (err) {
      console.error('Erro ao carregar matrículas:', err);
    }
  };

  // ==============================
  // CARREGAMENTO INICIAL
  // ==============================

  useEffect(() => {
    loadCourses();

    if (token) {
      loadMyEnrollments();
    }
  }, [token]);

  // ==============================
  // LOGIN / CADASTRO
  // ==============================

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setAuthError('');

    try {
      if (authMode === 'register') {
        await api.post('/users', {
          nomeCompleto,
          email,
          password,
        });
      }

      const res = await api.post('/auth/login', {
        email,
        password,
      });

      const newToken = res.data.access_token;

      localStorage.setItem('token', newToken);

      setToken(newToken);
      setIsAuthOpen(false);

      setPassword('');
      setAuthError('');

      await loadMyEnrollments();
    } catch (err: any) {
      setAuthError(
        err.response?.data?.message ||
          'Falha na autenticação'
      );
    }
  };

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout = () => {
    localStorage.removeItem('token');

    setToken(null);
    setMyEnrollments([]);
    setSelectedCourse(null);
    setCurrentLessonId(null);
    setProgress(null);
    setView('catalog');
  };

  // ==============================
  // MATRÍCULA
  // ==============================

  const handleEnroll = async (id_curso: number) => {
    if (!token) {
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }

    try {
      await api.post('/enrollments', {
        id_curso,
      });

      await loadMyEnrollments();

      alert('Matrícula realizada com sucesso!');

      setView('dashboard');
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          'Erro ao realizar matrícula.'
      );
    }
  };

  // ==============================
  // ABRIR CURSO
  // ==============================

  const handleOpenCourse = async (id_curso: number) => {
    try {
      const resCourse = await api.get<Course>(
        `/courses/${id_curso}`
      );

      const course = resCourse.data;

      setSelectedCourse(course);

      if (token) {
        try {
          const resProg = await api.get<CourseProgress>(
            `/lesson-progress/course/${id_curso}`
          );

          setProgress(resProg.data);
        } catch (err) {
          console.error(
            'Erro ao carregar progresso:',
            err
          );

          setProgress(null);
        }
      } else {
        setProgress(null);
      }

      const firstLesson =
        course.modulos?.[0]?.aulas?.[0];

      if (firstLesson) {
        setCurrentLessonId(firstLesson.id_aula);
      } else {
        setCurrentLessonId(null);
      }

      setView('player');
    } catch (err) {
      console.error(
        'Erro ao abrir curso:',
        err
      );
    }
  };

  // ==============================
  // CONCLUIR AULA
  // ==============================

  const handleCompleteLesson = async (
    id_aula: number
  ) => {
    if (!token || !selectedCourse) return;

    try {
      await api.post('/lesson-progress', {
        id_aula,
        status: 'CONCLUIDA',
      });

      const resProg = await api.get<CourseProgress>(
        `/lesson-progress/course/${selectedCourse.id_curso}`
      );

      setProgress(resProg.data);
    } catch (err) {
      console.error(
        'Erro ao atualizar progresso:',
        err
      );
    }
  };

  // ==============================
  // AULA ATUAL
  // ==============================

  const currentLesson =
    selectedCourse?.modulos
      ?.flatMap((mod) => mod.aulas || [])
      .find(
        (aula) => aula.id_aula === currentLessonId
      );

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}

      <Navbar
        currentView={view}
        setCurrentView={setView}
        token={token}
        onOpenAuth={() => {
          setAuthMode('login');
          setAuthError('');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* ==============================
          CATÁLOGO
      ============================== */}

      {view === 'catalog' && (
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-2 text-indigo-400">
              <GraduationCap size={24} />

              <span className="text-sm font-medium">
                Plataforma de Cursos
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white">
              Catálogo de Cursos
            </h1>

            <p className="mt-2 text-slate-400">
              Explore os conteúdos disponíveis
              desenvolvidos para a plataforma.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <BookOpen
                size={40}
                className="mx-auto mb-4 text-slate-600"
              />

              <p className="text-slate-400">
                Nenhum curso disponível no momento.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id_curso}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg transition hover:-translate-y-1 hover:border-slate-700"
                >
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-indigo-600/30 to-slate-900">
                    <BookOpen
                      size={52}
                      className="text-indigo-400"
                    />
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                        {course.categoria?.nome ||
                          'Desenvolvimento'}
                      </span>

                      <span className="text-xs text-slate-500">
                        {course.nivel}
                      </span>
                    </div>

                    <h2 className="mb-2 text-lg font-semibold text-white">
                      {course.titulo}
                    </h2>

                    <p className="mb-5 min-h-12 text-sm leading-6 text-slate-400">
                      {course.descricao ||
                        'Sem descrição cadastrada.'}
                    </p>

                    <div className="mb-5 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Play size={14} />
                        {course.totalAulas || 0} aulas
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {course.totalHoras || 0}h
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleEnroll(course.id_curso)
                      }
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500"
                    >
                      <GraduationCap size={17} />

                      Matricular-se
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ==============================
          DASHBOARD
      ============================== */}

      {view === 'dashboard' && (
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white">
              Meus Cursos
            </h1>

            <p className="mt-2 text-slate-400">
              Acompanhe o seu progresso e continue
              os seus estudos.
            </p>
          </div>

          {myEnrollments.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <BookOpen
                size={42}
                className="mx-auto mb-4 text-slate-600"
              />

              <h2 className="mb-2 text-lg font-semibold">
                Ainda não está matriculado em nenhum curso.
              </h2>

              <p className="mb-6 text-sm text-slate-400">
                Explore os cursos disponíveis no catálogo.
              </p>

              <button
                type="button"
                onClick={() => setView('catalog')}
                className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Ir para o Catálogo
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myEnrollments.map((enr) => (
                <div
                  key={
                    enr.id_matricula ||
                    enr.curso?.id_curso
                  }
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/20 to-slate-950">
                    <BookOpen
                      size={42}
                      className="text-indigo-400"
                    />
                  </div>

                  <span className="text-xs font-medium text-indigo-400">
                    {enr.curso?.categoria?.nome ||
                      'Curso'}
                  </span>

                  <h2 className="mt-2 mb-5 text-lg font-semibold text-white">
                    {enr.curso?.titulo}
                  </h2>

                  <button
                    type="button"
                    onClick={() => {
                      if (enr.curso?.id_curso) {
                        handleOpenCourse(
                          enr.curso.id_curso
                        );
                      }
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                  >
                    <Play size={17} />

                    Acessar Curso
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ==============================
          PLAYER
      ============================== */}

      {view === 'player' && selectedCourse && (
        <main className="mx-auto max-w-7xl px-6 py-8">
          <button
            type="button"
            onClick={() =>
              setView(token ? 'dashboard' : 'catalog')
            }
            className="mb-6 flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />

            Voltar para{' '}
            {token ? 'Meus Cursos' : 'Catálogo'}
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Reprodutor de Conteúdo
            </h1>

            <p className="mt-2 text-slate-400">
              {selectedCourse.titulo}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            {/* PLAYER */}
            <div>
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black">
                {currentLesson?.url_conteudo ? (
                  <video
                    key={currentLesson.id_aula}
                    src={currentLesson.url_conteudo}
                    controls
                    className="aspect-video w-full bg-black"
                  >
                    Seu navegador não suporta vídeo.
                  </video>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-slate-900">
                    <div className="text-center">
                      <Play
                        size={48}
                        className="mx-auto mb-3 text-indigo-400"
                      />

                      <p className="text-slate-400">
                        Vídeo demonstrativo
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="text-xl font-semibold">
                  {currentLesson?.titulo ||
                    'Selecione uma aula'}
                </h2>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                  <Clock size={16} />

                  Duração:{' '}
                  {currentLesson?.duracaoMinutos || 0}{' '}
                  minutos
                </div>

                {token && currentLessonId && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCompleteLesson(
                        currentLessonId
                      )
                    }
                    className="mt-5 flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500"
                  >
                    <CheckCircle size={17} />

                    Marcar como Concluída
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="text-xl font-semibold">
                  {selectedCourse.titulo}
                </h2>

                {progress && (
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Progresso do curso
                      </span>

                      <span className="font-medium text-indigo-400">
                        {progress.percentualConcluido}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              progress.percentualConcluido ||
                                0
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LISTA DE AULAS */}
            <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="mb-4 px-2 text-lg font-semibold">
                Conteúdo do Curso
              </h2>

              <div className="space-y-4">
                {selectedCourse.modulos?.map(
                  (mod) => (
                    <div key={mod.id_modulo}>
                      <h3 className="mb-2 px-2 text-sm font-medium text-slate-200">
                        {mod.titulo}
                      </h3>

                      <div className="space-y-1">
                        {mod.aulas?.map(
                          (aula) => (
                            <button
                              key={aula.id_aula}
                              type="button"
                              onClick={() =>
                                setCurrentLessonId(
                                  aula.id_aula
                                )
                              }
                              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                                currentLessonId ===
                                aula.id_aula
                                  ? 'border border-indigo-500/30 bg-indigo-600/20 font-medium text-indigo-300'
                                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <Play
                                  size={14}
                                />

                                <span className="truncate">
                                  {aula.titulo}
                                </span>
                              </span>

                              <span className="ml-2 shrink-0 text-xs text-slate-500">
                                {aula.duracaoMinutos}m
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* ==============================
          MODAL DE AUTENTICAÇÃO
      ============================== */}

      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {authMode === 'login'
                  ? 'Acessar Conta'
                  : 'Criar Nova Conta'}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {authMode === 'login'
                  ? 'Insira suas credenciais para continuar'
                  : 'Cadastre-se para se matricular nos cursos'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth}>
              {authMode === 'register' && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm text-slate-300">
                    Nome Completo
                  </label>

                  <input
                    type="text"
                    value={nomeCompleto}
                    onChange={(e) =>
                      setNomeCompleto(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Seu nome"
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="mb-2 block text-sm text-slate-300">
                  E-mail
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm text-slate-300">
                  Senha
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                {authMode === 'login'
                  ? 'Entrar'
                  : 'Cadastrar'}
              </button>
            </form>

            <button
              type="button"
              onClick={() =>
                setAuthMode(
                  authMode === 'login'
                    ? 'register'
                    : 'login'
                )
              }
              className="mt-4 w-full cursor-pointer text-xs text-indigo-400 hover:underline"
            >
              {authMode === 'login'
                ? 'Não tem conta? Cadastre-se'
                : 'Já tem uma conta? Faça login'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAuthOpen(false);
                setAuthError('');
              }}
              className="mt-4 w-full cursor-pointer rounded-xl bg-slate-800 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
