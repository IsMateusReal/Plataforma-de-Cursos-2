export interface User {
  id_usuario: number;
  nomeCompleto: string;
  email: string;
}

export interface Category {
  id_categoria: number;
  nome: string;
  descricao?: string;
}

export interface Lesson {
  id_aula: number;
  id_modulo: number;
  titulo: string;
  tipoConteudo: string;
  url_conteudo: string;
  duracaoMinutos: number;
  ordem: number;
}

export interface Module {
  id_modulo: number;
  id_curso: number;
  titulo: string;
  ordem: number;
  aulas: Lesson[];
}

export interface Course {
  id_curso: number;
  titulo: string;
  descricao?: string;
  nivel: string;
  totalAulas: number;
  totalHoras: number;
  categoria?: Category;
  instrutor?: { nomeCompleto: string; email: string };
  modulos?: Module[];
}

export interface Enrollment {
  id_matricula: number;
  id_curso: number;
  dataMatricula: string;
  dataConclusao?: string | null;
  curso: Course;
}

export interface CourseProgress {
  id_curso: number;
  totalAulas: number;
  aulasConcluidas: number;
  percentualConcluido: number;
}