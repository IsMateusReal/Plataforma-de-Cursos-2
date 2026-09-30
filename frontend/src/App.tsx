import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import type { Course, Enrollment, CourseProgress, Module, Lesson } from './types';
import { Navbar } from './components/Navbar';
import {
  ArrowRight, BadgeCheck, Play, Clock, BookOpen, CheckCircle, ArrowLeft, GraduationCap,
  Plus, Edit2, Trash2, X, List, Video, VideoOff, RotateCcw
} from 'lucide-react';

const COURSE_COVERS = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=85',
];

type Notice = { type: 'success' | 'error'; message: string };

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  
  // Vistas: catalog | dashboard | player | admin | admin-modules | admin-lessons
  const [view, setView] = useState<string>('catalog');

  // Player States
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [mediaErrorLessonId, setMediaErrorLessonId] = useState<number | null>(null);

  // Auth States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [authError, setAuthError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // ==============================
  // ADMIN STATES
  // ==============================
  const [selectedAdminCourseId, setSelectedAdminCourseId] = useState<number | null>(null);
  const [selectedAdminModuleId, setSelectedAdminModuleId] = useState<number | null>(null);

  // Dados derivados (sempre atualizados com a lista 'courses')
  const currentAdminCourse = courses.find(c => c.id_curso === selectedAdminCourseId) || null;
  const currentAdminModule = currentAdminCourse?.modulos?.find(m => m.id_modulo === selectedAdminModuleId) || null;

  // Modais CRUD
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState({ titulo: '', descricao: '', nivel: 'Iniciante', totalAulas: 0, totalHoras: 0, id_categoria: 1 });

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [moduleForm, setModuleForm] = useState({ titulo: '', ordem: 1 });

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState({ titulo: '', tipoConteudo: 'VIDEO', url_conteudo: '', duracaoMinutos: 0, ordem: 1 });

  // ==============================
  // CARREGAMENTOS INICIAIS
  // ==============================
  const loadCourses = async () => {
    try {
      const res = await api.get<Course[]>('/courses');
      setCourses(res.data);
    } catch (err) { console.error('Erro ao carregar cursos:', err); }
  };

  const loadMyEnrollments = async () => {
    if (!token) return;
    try {
      const res = await api.get<Enrollment[]>('/enrollments/my-courses');
      setMyEnrollments(res.data);
    } catch (err) { console.error('Erro ao carregar matrículas:', err); }
  };

  useEffect(() => {
    loadCourses();
    if (token) loadMyEnrollments();
  }, [token]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  // ==============================
  // AUTH & MATRÍCULA
  // ==============================
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthSubmitting(true);
    try {
      if (authMode === 'register') await api.post('/users', { nomeCompleto, email, password });
      const res = await api.post('/auth/login', { email, password });
      const newToken = res.data.access_token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setIsAuthOpen(false); setPassword(''); setAuthError('');
      setView('dashboard');
      setNotice({ type: 'success', message: authMode === 'register' ? 'Conta criada. Você já está conectado.' : 'Login realizado com sucesso. Bem-vindo de volta!' });
    } catch (err: any) {
      const message = err.response?.data?.message;
      setAuthError(Array.isArray(message) ? message.join(', ') : message || 'Falha na autenticação');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null); setMyEnrollments([]); setSelectedCourse(null); setCurrentLessonId(null); setProgress(null); setView('catalog');
  };

  const handleEnroll = async (id_curso: number) => {
    if (!token) { setAuthMode('login'); setIsAuthOpen(true); return; }
    try {
      await api.post('/enrollments', { id_curso });
      await loadMyEnrollments();
      setNotice({ type: 'success', message: 'Matrícula confirmada. O curso já está na sua Dashboard.' });
      setView('dashboard');
    } catch (err: any) {
      setNotice({ type: 'error', message: err.response?.data?.message || 'Não foi possível realizar a matrícula.' });
    }
  };

  // ==============================
  // PLAYER
  // ==============================
  const handleOpenCourse = async (id_curso: number) => {
    try {
      const resCourse = await api.get<Course>(`/courses/${id_curso}`);
      setSelectedCourse(resCourse.data);
      if (token) {
        try {
          const resProg = await api.get<CourseProgress>(`/lesson-progress/course/${id_curso}`);
          setProgress(resProg.data);
        } catch (err) { setProgress(null); }
      }
      const firstLesson = resCourse.data.modulos?.[0]?.aulas?.[0];
      setCurrentLessonId(firstLesson ? firstLesson.id_aula : null);
      setMediaErrorLessonId(null);
      setView('player');
    } catch (err) { console.error('Erro ao abrir curso:', err); }
  };

  const handleCompleteLesson = async (id_aula: number) => {
    if (!token || !selectedCourse) return;
    try {
      await api.post('/lesson-progress', { id_aula, status: 'CONCLUIDA' });
      const resProg = await api.get<CourseProgress>(`/lesson-progress/course/${selectedCourse.id_curso}`);
      setProgress(resProg.data);
    } catch (err) { console.error('Erro ao atualizar progresso:', err); }
  };

  const currentLesson = selectedCourse?.modulos
    ?.flatMap((module) => module.aulas || [])
    .find((lesson) => lesson.id_aula === currentLessonId);
  const enrolledCourseIds = new Set(myEnrollments.map((enrollment) => enrollment.id_curso));
  const lessonCount = courses.reduce((total, course) => total + (course.modulos?.reduce((moduleTotal, module) => moduleTotal + (module.aulas?.length || 0), 0) || 0), 0);

  // ==============================
  // CRUD CURSOS
  // ==============================
  const openCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourseId(course.id_curso);
      setCourseForm({ titulo: course.titulo, descricao: course.descricao || '', nivel: course.nivel, totalAulas: course.totalAulas, totalHoras: course.totalHoras, id_categoria: course.categoria?.id_categoria || 1 });
    } else {
      setEditingCourseId(null);
      setCourseForm({ titulo: '', descricao: '', nivel: 'Iniciante', totalAulas: 0, totalHoras: 0, id_categoria: 1 });
    }
    setIsCourseModalOpen(true);
  };
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourseId) await api.patch(`/courses/${editingCourseId}`, courseForm);
      else await api.post('/courses', courseForm);
      setIsCourseModalOpen(false); loadCourses();
    } catch (err: any) { alert(err.response?.data?.message || 'Erro ao guardar curso.'); }
  };
  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('Apagar curso irreversivelmente?')) return;
    try { await api.delete(`/courses/${id}`); loadCourses(); }
    catch (err: any) { alert(err.response?.data?.message || 'Erro ao apagar.'); }
  };

  // ==============================
  // CRUD MÓDULOS
  // ==============================
  const openModuleModal = (module?: Module) => {
    if (module) {
      setEditingModuleId(module.id_modulo);
      setModuleForm({ titulo: module.titulo, ordem: module.ordem });
    } else {
      setEditingModuleId(null); setModuleForm({ titulo: '', ordem: 1 });
    }
    setIsModuleModalOpen(true);
  };
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...moduleForm, id_curso: selectedAdminCourseId };
      if (editingModuleId) await api.patch(`/modules/${editingModuleId}`, payload);
      else await api.post('/modules', payload);
      setIsModuleModalOpen(false); loadCourses();
    } catch (err: any) { alert(err.response?.data?.message || 'Erro ao guardar módulo.'); }
  };
  const handleDeleteModule = async (id: number) => {
    if (!window.confirm('Apagar este módulo e todas as suas aulas?')) return;
    try { await api.delete(`/modules/${id}`); loadCourses(); }
    catch (err: any) { alert(err.response?.data?.message || 'Erro ao apagar módulo.'); }
  };

  // ==============================
  // CRUD AULAS
  // ==============================
  const openLessonModal = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLessonId(lesson.id_aula);
      setLessonForm({ titulo: lesson.titulo, tipoConteudo: lesson.tipoConteudo, url_conteudo: lesson.url_conteudo, duracaoMinutos: lesson.duracaoMinutos, ordem: lesson.ordem });
    } else {
      setEditingLessonId(null); setLessonForm({ titulo: '', tipoConteudo: 'VIDEO', url_conteudo: '', duracaoMinutos: 0, ordem: 1 });
    }
    setIsLessonModalOpen(true);
  };
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...lessonForm, id_modulo: selectedAdminModuleId };
      if (editingLessonId) await api.patch(`/lessons/${editingLessonId}`, payload);
      else await api.post('/lessons', payload);
      setIsLessonModalOpen(false); loadCourses();
    } catch (err: any) { alert(err.response?.data?.message || 'Erro ao guardar aula.'); }
  };
  const handleDeleteLesson = async (id: number) => {
    if (!window.confirm('Apagar esta aula?')) return;
    try { await api.delete(`/lessons/${id}`); loadCourses(); }
    catch (err: any) { alert(err.response?.data?.message || 'Erro ao apagar aula.'); }
  };

  return (
    <div className="app-shell min-h-screen text-white">
      <Navbar currentView={view} setCurrentView={setView} token={token} onOpenAuth={() => { setAuthMode('login'); setIsAuthOpen(true); }} onLogout={handleLogout} />

      {notice && (
        <div className={`feedback-toast ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          {notice.type === 'success' ? <BadgeCheck size={20} /> : <X size={18} />}
          <span>{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Fechar aviso"><X size={16} /></button>
        </div>
      )}

      {/* VIEWS COMUNS (CATALOG / DASHBOARD) */}
      {view === 'catalog' && (
        <main className="catalog-page">
          <section className="catalog-intro">
            <div className="catalog-copy">
              <span className="eyebrow">APRENDA · PRATIQUE · AVANCE</span>
              <h1>Conhecimento que<br /><em>vira movimento.</em></h1>
              <p>Escolha uma trilha, acompanhe seu ritmo e transforme curiosidade em habilidade.</p>
            </div>
            <div className="catalog-stats" aria-label="Resumo do catálogo">
              <div><strong>{courses.length.toString().padStart(2, '0')}</strong><span>cursos</span></div>
              <div><strong>{lessonCount.toString().padStart(2, '0')}</strong><span>aulas</span></div>
            </div>
          </section>

          <section className="catalog-section">
            <div className="section-heading">
              <div><span className="eyebrow">SEU PRÓXIMO CAPÍTULO</span><h2>Explore os cursos</h2></div>
              <span className="course-count">{courses.length} disponíveis</span>
            </div>
            {courses.length ? (
              <div className="course-grid">
                {courses.map((course) => {
                  const isEnrolled = enrolledCourseIds.has(course.id_curso);
                  const modules = course.modulos || [];
                  const lessons = modules.reduce((total, module) => total + (module.aulas?.length || 0), 0);
                  return (
                    <article key={course.id_curso} className="course-card">
                      <div className="course-cover">
                        <img src={COURSE_COVERS[Math.abs(course.id_curso) % COURSE_COVERS.length]} alt="" loading="lazy" />
                        <span className="cover-label">{course.categoria?.nome || course.nivel}</span>
                        {isEnrolled && <span className="enrolled-label"><BadgeCheck size={15} /> Matriculado</span>}
                      </div>
                      <div className="course-card-body">
                        <div className="course-meta"><span>{course.nivel}</span><span>{modules.length} módulos · {lessons} aulas</span></div>
                        <h3>{course.titulo}</h3>
                        <p>{course.descricao || 'Uma nova trilha de conhecimento espera por você.'}</p>
                        <button
                          type="button"
                          onClick={() => isEnrolled ? handleOpenCourse(course.id_curso) : handleEnroll(course.id_curso)}
                          className={isEnrolled ? 'course-action enrolled' : 'course-action'}
                        >
                          {isEnrolled ? <><Play size={17} /> Continuar curso</> : <><GraduationCap size={17} /> Matricular-se <ArrowRight size={16} /></>}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state"><BookOpen size={30} /><h3>Novas trilhas em breve</h3><p>Estamos preparando os próximos cursos.</p></div>
            )}
          </section>
        </main>
      )}

      {view === 'dashboard' && (
        <main className="catalog-page dashboard-page">
          <section className="dashboard-heading">
            <div><span className="eyebrow">SEU ESPAÇO DE APRENDIZADO</span><h1>Meus cursos</h1><p>Continue de onde parou. Cada aula concluída é um passo à frente.</p></div>
            <button type="button" className="browse-button" onClick={() => setView('catalog')}><BookOpen size={17} /> Explorar catálogo</button>
          </section>
          {myEnrollments.length ? (
            <div className="course-grid dashboard-grid">
              {myEnrollments.map((enrollment) => {
                const course = enrollment.curso;
                const modules = course.modulos || [];
                const lessons = modules.reduce((total, module) => total + (module.aulas?.length || 0), 0);
                return (
                  <article key={enrollment.id_matricula} className="course-card dashboard-card">
                    <div className="course-cover">
                      <img src={COURSE_COVERS[Math.abs(course.id_curso) % COURSE_COVERS.length]} alt="" loading="lazy" />
                      <span className="enrolled-label"><BadgeCheck size={15} /> Na sua biblioteca</span>
                    </div>
                    <div className="course-card-body">
                      <div className="course-meta"><span>{course.nivel}</span><span>{modules.length} módulos · {lessons} aulas</span></div>
                      <h3>{course.titulo}</h3>
                      <p>{course.descricao || 'Continue sua jornada de aprendizado.'}</p>
                      <button type="button" onClick={() => handleOpenCourse(course.id_curso)} className="course-action enrolled"><Play size={17} /> Acessar curso <ArrowRight size={16} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state dashboard-empty"><GraduationCap size={34} /><h2>Sua próxima conquista começa com uma aula.</h2><p>Você ainda não se matriculou em nenhum curso.</p><button type="button" className="course-action" onClick={() => setView('catalog')}>Encontrar meu primeiro curso <ArrowRight size={16} /></button></div>
          )}
        </main>
      )}

      {view === 'player' && selectedCourse && (
        <main className="learning-page">
          <button
            type="button"
            onClick={() => setView('dashboard')}
            className="learning-back"
          >
            <ArrowLeft size={16} /> Voltar para meus cursos
          </button>

          <header className="learning-heading">
            <div>
              <span className="eyebrow">SUA TRILHA DE APRENDIZADO</span>
              <h1>{selectedCourse.titulo}</h1>
              {selectedCourse.descricao && <p>{selectedCourse.descricao}</p>}
            </div>
            <div className="learning-summary">
              <strong>{selectedCourse.modulos?.length || 0}</strong><span>módulos</span>
              <i />
              <strong>{selectedCourse.totalAulas || selectedCourse.modulos?.reduce((total, module) => total + (module.aulas?.length || 0), 0) || 0}</strong><span>aulas</span>
            </div>
          </header>

          <div className="learning-layout">
            <div className="learning-main">
              <div className="lesson-screen">
                {currentLesson?.url_conteudo && mediaErrorLessonId !== currentLesson.id_aula ? (
                  <video
                    key={currentLesson.id_aula}
                    src={currentLesson.url_conteudo}
                    controls
                    playsInline
                    onError={() => setMediaErrorLessonId(currentLesson.id_aula)}
                    aria-label={`Vídeo: ${currentLesson.titulo}`}
                  >
                    Seu navegador não suporta vídeo.
                  </video>
                ) : (
                  <div className="lesson-fallback">
                    <span className="fallback-icon"><VideoOff size={25} /></span>
                    <h2>{mediaErrorLessonId === currentLesson?.id_aula ? 'Este vídeo não está disponível' : currentLesson ? 'Aula sem vídeo cadastrado' : 'Escolha uma aula para começar'}</h2>
                    <p>{mediaErrorLessonId === currentLesson?.id_aula ? 'O link salvo não pôde ser reproduzido. Peça à gestão para revisar o endereço do vídeo.' : currentLesson ? 'Ainda não há um endereço de vídeo válido para esta aula.' : 'Selecione uma aula na lista ao lado para iniciar sua trilha.'}</p>
                    {mediaErrorLessonId === currentLesson?.id_aula && (
                      <button type="button" onClick={() => setMediaErrorLessonId(null)} className="retry-media"><RotateCcw size={15} /> Tentar novamente</button>
                    )}
                  </div>
                )}
              </div>

              <section className="lesson-detail">
                <div>
                  <span className="lesson-kicker">AULA ATUAL</span>
                  <h2>{currentLesson?.titulo || 'Nenhuma aula selecionada'}</h2>
                  <p><Clock size={15} /> {currentLesson?.duracaoMinutos || 0} minutos</p>
                </div>
                {token && currentLessonId && (
                  <button
                    type="button"
                    onClick={() => handleCompleteLesson(currentLessonId)}
                    className="complete-lesson"
                  >
                    <CheckCircle size={17} /> Marcar como concluída
                  </button>
                )}
              </section>

              {progress && (
                <section className="learning-progress">
                  <div className="progress-labels">
                    <span>PROGRESSO DA TRILHA</span>
                    <strong>{progress.percentualConcluido}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-value" style={{ width: `${Math.min(100, Math.max(0, progress.percentualConcluido || 0))}%` }} />
                  </div>
                  <p>{progress.aulasConcluidas} de {progress.totalAulas} aulas concluídas</p>
                </section>
              )}
            </div>

            <aside className="lesson-outline">
              <header className="outline-heading">
                <div><span className="lesson-kicker">POR ONDE COMEÇAR</span><h2>Conteúdo do curso</h2></div>
                <span>{selectedCourse.modulos?.length || 0}</span>
              </header>
              <div className="outline-modules">
                {selectedCourse.modulos?.map((module) => (
                  <section key={module.id_modulo} className="outline-module">
                    <h3><span>{module.ordem.toString().padStart(2, '0')}</span>{module.titulo}</h3>
                    <div className="outline-lessons">
                      {module.aulas?.map((lesson) => (
                        <button
                          key={lesson.id_aula}
                          type="button"
                          onClick={() => { setCurrentLessonId(lesson.id_aula); setMediaErrorLessonId(null); }}
                          className={`outline-lesson ${currentLessonId === lesson.id_aula ? 'selected' : ''}`}
                        >
                          <span className="outline-lesson-title">
                            <Play size={14} /><span>{lesson.titulo}</span>
                          </span>
                          <span className="outline-duration">{lesson.duracaoMinutos} min</span>
                        </button>
                      ))}
                      {!module.aulas?.length && <p className="outline-empty">Aulas em breve.</p>}
                    </div>
                  </section>
                ))}
                {!selectedCourse.modulos?.length && <p className="outline-empty">Este curso ainda não tem módulos.</p>}
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* ==============================
          VIEWS DE ADMIN (CRUD)
      ============================== */}

      {/* 1. ADMIN CURSOS */}
      {view === 'admin' && (
        <main className="management-page">
          <header className="management-heading">
            <div><span className="eyebrow">PAINEL DE CONTEÚDO</span><h1>Gestão de cursos</h1><p>Crie trilhas e organize o conteúdo da plataforma.</p></div>
            <button onClick={() => openCourseModal()} className="management-primary"><Plus size={17}/> Novo curso</button>
          </header>
          <div className="management-table">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="border-b border-slate-800 bg-slate-950/50"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Título</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
              <tbody>
                {courses.length === 0 && <tr><td colSpan={3} className="management-empty">Nenhum curso cadastrado ainda.</td></tr>}
                {courses.map(course => (
                  <tr key={course.id_curso} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="px-6 py-4">#{course.id_curso}</td>
                    <td className="px-6 py-4 text-white font-medium">{course.titulo}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setSelectedAdminCourseId(course.id_curso); setView('admin-modules'); }} className="management-icon-button modules" title="Gerenciar módulos" aria-label={`Gerenciar módulos de ${course.titulo}`}><List size={18} /></button>
                      <button onClick={() => openCourseModal(course)} className="management-icon-button edit" title="Editar curso" aria-label={`Editar ${course.titulo}`}><Edit2 size={18} /></button>
                      <button onClick={() => handleDeleteCourse(course.id_curso)} className="management-icon-button delete" title="Excluir curso" aria-label={`Excluir ${course.titulo}`}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* 2. ADMIN MÓDULOS */}
      {view === 'admin-modules' && currentAdminCourse && (
        <main className="management-page">
          <button onClick={() => setView('admin')} className="management-back"><ArrowLeft size={16}/> Voltar para cursos</button>
          <header className="management-heading">
            <div><span className="eyebrow">CURSO · {currentAdminCourse.titulo}</span><h1>Módulos</h1><p>Organize as etapas desta trilha de aprendizagem.</p></div>
            <button onClick={() => openModuleModal()} className="management-primary"><Plus size={17}/> Novo módulo</button>
          </header>
          <div className="management-table">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="border-b border-slate-800 bg-slate-950/50"><tr><th className="px-6 py-4">Ordem</th><th className="px-6 py-4">Título</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
              <tbody>
                {(!currentAdminCourse.modulos || currentAdminCourse.modulos.length === 0) ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Nenhum módulo.</td></tr>
                ) : (currentAdminCourse.modulos.map(mod => (
                  <tr key={mod.id_modulo} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="px-6 py-4">{mod.ordem}</td>
                    <td className="px-6 py-4 text-white font-medium">{mod.titulo}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setSelectedAdminModuleId(mod.id_modulo); setView('admin-lessons'); }} className="management-icon-button modules" title="Gerenciar aulas" aria-label={`Gerenciar aulas de ${mod.titulo}`}><Video size={18} /></button>
                      <button onClick={() => openModuleModal(mod)} className="management-icon-button edit" title="Editar módulo" aria-label={`Editar ${mod.titulo}`}><Edit2 size={18} /></button>
                      <button onClick={() => handleDeleteModule(mod.id_modulo)} className="management-icon-button delete" title="Excluir módulo" aria-label={`Excluir ${mod.titulo}`}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* 3. ADMIN AULAS */}
      {view === 'admin-lessons' && currentAdminModule && (
        <main className="management-page">
          <button onClick={() => setView('admin-modules')} className="management-back"><ArrowLeft size={16}/> Voltar para módulos</button>
          <header className="management-heading">
            <div><span className="eyebrow">MÓDULO · {currentAdminModule.titulo}</span><h1>Aulas</h1><p>Gerencie vídeos e materiais deste módulo.</p></div>
            <button onClick={() => openLessonModal()} className="management-primary coral"><Plus size={17}/> Nova aula</button>
          </header>
          <div className="management-table">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="border-b border-slate-800 bg-slate-950/50"><tr><th className="px-6 py-4">Ordem</th><th className="px-6 py-4">Título</th><th className="px-6 py-4">Duração</th><th className="px-6 py-4 text-right">Ações</th></tr></thead>
              <tbody>
                {(!currentAdminModule.aulas || currentAdminModule.aulas.length === 0) ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhuma aula.</td></tr>
                ) : (currentAdminModule.aulas.map(aula => (
                  <tr key={aula.id_aula} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="px-6 py-4">{aula.ordem}</td>
                    <td className="px-6 py-4 text-white font-medium">{aula.titulo}</td>
                    <td className="px-6 py-4">{aula.duracaoMinutos} min</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openLessonModal(aula)} className="management-icon-button edit" title="Editar aula" aria-label={`Editar ${aula.titulo}`}><Edit2 size={18} /></button>
                      <button onClick={() => handleDeleteLesson(aula.id_aula)} className="management-icon-button delete" title="Excluir aula" aria-label={`Excluir ${aula.titulo}`}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* ==============================
          MODAIS
      ============================== */}

      {isAuthOpen && (
        <div className="modal-backdrop auth-backdrop">
          <div className="auth-dialog">
            <div className="auth-header">
              <div>
                <span className="auth-brand"><span className="brand-icon"><BookOpen size={19} /></span> Matt's School<span className="brand-period">.</span></span>
                <h2>
                  {authMode === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}
                </h2>
                <p>
                  {authMode === 'login' ? 'Insira suas credenciais para continuar' : 'Cadastre-se para se matricular nos cursos'}
                </p>
              </div>
              <button type="button" onClick={() => setIsAuthOpen(false)} className="modal-close" aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            {authError && (
              <div role="alert" className="auth-error">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="auth-form">
              {authMode === 'register' && (
                <input
                  type="text"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className="auth-field"
                  placeholder="Nome completo"
                  autoComplete="name"
                  required
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-field"
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-field"
                placeholder="Senha"
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
              <button type="submit" disabled={isAuthSubmitting} className="auth-submit">
                {isAuthSubmitting ? 'Entrando…' : authMode === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
              className="auth-switch"
            >
              {authMode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Cursos */}
      {isCourseModalOpen && (
        <div className="modal-backdrop">
          <div className="work-modal">
            <div className="mb-6 flex justify-between"><h2 className="text-xl font-bold">{editingCourseId ? 'Editar' : 'Novo'} Curso</h2><button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 cursor-pointer"><X size={20}/></button></div>
            <form onSubmit={handleSaveCourse} className="space-y-4">
              <input required type="text" placeholder="Título" value={courseForm.titulo} onChange={e => setCourseForm({...courseForm, titulo: e.target.value})} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="ID Categoria" value={courseForm.id_categoria} onChange={e => setCourseForm({...courseForm, id_categoria: Number(e.target.value)})} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white" />
                <select value={courseForm.nivel} onChange={e => setCourseForm({...courseForm, nivel: e.target.value})} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"><option>Iniciante</option><option>Intermediário</option><option>Avançado</option></select>
              </div>
              <textarea placeholder="Descrição" rows={3} value={courseForm.descricao} onChange={e => setCourseForm({...courseForm, descricao: e.target.value})} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"></textarea>
              <button type="submit" className="w-full cursor-pointer rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Módulos */}
      {isModuleModalOpen && (
        <div className="modal-backdrop">
          <div className="work-modal">
            <div className="mb-6 flex justify-between"><h2 className="text-xl font-bold">{editingModuleId ? 'Editar' : 'Novo'} Módulo</h2><button onClick={() => setIsModuleModalOpen(false)} className="text-slate-400 cursor-pointer"><X size={20}/></button></div>
            <form onSubmit={handleSaveModule} className="space-y-4">
              <input required type="text" placeholder="Título do Módulo" value={moduleForm.titulo} onChange={e => setModuleForm({...moduleForm, titulo: e.target.value})} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white" />
              <input required type="number" placeholder="Ordem (Ex: 1)" value={moduleForm.ordem} onChange={e => setModuleForm({...moduleForm, ordem: Number(e.target.value)})} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white" />
              <button type="submit" className="w-full cursor-pointer rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aulas */}
      {isLessonModalOpen && (
        <div className="modal-backdrop">
          <div className="work-modal">
            <div className="mb-6 flex justify-between"><h2 className="text-xl font-bold">{editingLessonId ? 'Editar' : 'Nova'} Aula</h2><button onClick={() => setIsLessonModalOpen(false)} className="text-slate-400 cursor-pointer"><X size={20}/></button></div>
            <form onSubmit={handleSaveLesson} className="space-y-4">
              <input required type="text" placeholder="Título da Aula" value={lessonForm.titulo} onChange={e => setLessonForm({...lessonForm, titulo: e.target.value})} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white" />
              <input required type="text" placeholder="URL do Vídeo" value={lessonForm.url_conteudo} onChange={e => setLessonForm({...lessonForm, url_conteudo: e.target.value})} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Duração (min)" value={lessonForm.duracaoMinutos} onChange={e => setLessonForm({...lessonForm, duracaoMinutos: Number(e.target.value)})} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white" />
                <input required type="number" placeholder="Ordem (Ex: 1)" value={lessonForm.ordem} onChange={e => setLessonForm({...lessonForm, ordem: Number(e.target.value)})} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white" />
              </div>
              <button type="submit" className="w-full cursor-pointer rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500">Guardar</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}