import { tutors as initialTutors, pendingTutors as initialPendingTutors } from './mockData';

// ─── Seed accounts ───────────────────────────────────────────────────────────
const defaultUsers = [
  {
    id: 'admin-1',
    name: 'Administrador UTP',
    email: 'admin@utp.edu.pe',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'student-1',
    name: 'Juan Pérez',
    email: 'C123456@utp.edu.pe',
    password: 'student123',
    role: 'student',
    career: 'Ingeniería de Sistemas',
    code: 'U21304561',
    cycle: 4,
  },
  {
    id: 'student-2',
    name: 'María López',
    email: 'C234567@utp.edu.pe',
    password: 'student123',
    role: 'student',
    career: 'Ingeniería Industrial',
    code: 'U21304562',
    cycle: 3,
  },
  {
    id: 'student-3',
    name: 'Carlos Mendez',
    email: 'C345678@utp.edu.pe',
    password: 'student123',
    role: 'student',
    career: 'Ingeniería de Sistemas',
    code: 'U21304563',
    cycle: 5,
  },
  ...initialTutors.map((t) => ({
    id: `tutor-${t.id}`,
    tutorId: t.id,
    name: t.name,
    email: `tutor${t.id}@utp.edu.pe`,
    password: 'tutor123',
    role: 'tutor',
    career: t.career,
    avatar: t.avatar,
    specialties: t.specialties,
    availability: t.availability,
  }))
];

// ─── Seed classes ─────────────────────────────────────────────────────────────
const defaultClasses = [
  {
    id: 'class-1',
    tutorId: 1,
    tutorName: 'Ricardo Alarcón',
    tutorAvatar: initialTutors[0].avatar,
    title: 'Estructuras de Datos y Complejidad O(n)',
    description: 'Aprende los fundamentos de la complejidad algorítmica y estructuras esenciales como listas enlazadas, pilas y colas.',
    date: '2026-10-20',
    startTime: '16:00',
    endTime: '17:30',
    subject: 'Algoritmos',
    platform: 'Microsoft Teams',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/utp-mentors-class-1',
    materials: 'Diapositivas: https://drive.google.com/drive/folders/utp-class-1',
    status: 'Programada',
    capacity: 15,
    studentIds: ['student-1'],
    studentNames: ['Juan Pérez'],
  },
  {
    id: 'class-2',
    tutorId: 2,
    tutorName: 'Elena Vizcarra',
    tutorAvatar: initialTutors[1].avatar,
    title: 'Resolución de Vectores en 3D y Cinemática',
    description: 'Sesión práctica para resolver problemas de vectores en tres dimensiones y ecuaciones cinemáticas aplicadas.',
    date: '2026-10-14',
    startTime: '09:00',
    endTime: '10:30',
    subject: 'Física I',
    platform: 'Zoom',
    meetingLink: 'https://zoom.us/j/987654321',
    materials: 'Guía PDF: https://utp.edu.pe/materials/fisica1-guia.pdf',
    status: 'Finalizada',
    capacity: 20,
    studentIds: ['student-1'],
    studentNames: ['Juan Pérez'],
    rating: 0,
  },
  {
    id: 'class-3',
    tutorId: 1,
    tutorName: 'Ricardo Alarcón',
    tutorAvatar: initialTutors[0].avatar,
    title: 'Punteros y Asignación de Memoria en C++',
    description: 'Conceptos avanzados de punteros, referencias y gestión dinámica de memoria en C++.',
    date: '2026-10-21',
    startTime: '14:30',
    endTime: '16:00',
    subject: 'C++',
    platform: 'Google Meet',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    materials: 'Código fuente: https://github.com/utp/pointers-class3',
    status: 'Programada',
    capacity: 2,
    studentIds: [],
    studentNames: [],
  },
];

// ─── Seed class requests ──────────────────────────────────────────────────────
const defaultClassRequests = [
  {
    id: 'req-1',
    title: 'Introducción a Machine Learning con Python',
    description: 'Quisiera una clase que cubra los fundamentos del aprendizaje automático: regresión, clasificación y clustering usando scikit-learn.',
    category: 'Programación',
    reason: 'Para mi proyecto de fin de carrera necesito aplicar ML y aún no domino los conceptos base.',
    createdBy: 'student-1',
    createdByName: 'Juan Pérez',
    createdAt: '2026-07-10T10:00:00Z',
    status: 'Lista para revisión',
    interestedIds: ['student-1', 'student-2', 'student-3'],
    interestedNames: ['Juan Pérez', 'María López', 'Carlos Mendez'],
    minThreshold: 3,
    reviewedBy: null,
    reviewedByName: null,
    reviewComment: null,
    reviewedAt: null,
    scheduleProposals: [],
    votingOpen: false,
    votingDeadline: null,
    selectedScheduleId: null,
    draftClassId: null,
  },
  {
    id: 'req-2',
    title: 'Cálculo Diferencial — Límites y Derivadas',
    description: 'Repaso intensivo de límites, continuidad y derivadas para el examen parcial.',
    category: 'Matemática',
    reason: 'Tengo el parcial la próxima semana y necesito reforzar los temas que no entiendo bien.',
    createdBy: 'student-2',
    createdByName: 'María López',
    createdAt: '2026-07-12T14:00:00Z',
    status: 'Esperando interesados',
    interestedIds: ['student-2'],
    interestedNames: ['María López'],
    minThreshold: 3,
    reviewedBy: null,
    reviewedByName: null,
    reviewComment: null,
    reviewedAt: null,
    scheduleProposals: [],
    votingOpen: false,
    votingDeadline: null,
    selectedScheduleId: null,
    draftClassId: null,
  },
];

// ─── Seed notifications ───────────────────────────────────────────────────────
const defaultNotifications = [
  {
    id: 'notif-1',
    userId: 'tutor-1',
    title: 'Nueva solicitud lista para revisión',
    message: 'La solicitud "Introducción a Machine Learning con Python" ha alcanzado el mínimo de interesados.',
    type: 'request_ready',
    relatedId: 'req-1',
    read: false,
    createdAt: '2026-07-12T08:00:00Z',
  },
];

// ─── Default config ───────────────────────────────────────────────────────────
const defaultConfig = {
  minInterestThreshold: 3,
};

// ─── Seed pending tutors (extended with verification fields) ──────────────────
const defaultPendingTutors = initialPendingTutors.map((t, i) => ({
  ...t,
  email: `pending${i + 1}@utp.edu.pe`,
  cycle: 4,
  verificationStatus: 'pending_review',
  submittedAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
  documents: [],
  adminObservations: [],
  approvedBy: null,
  approvedAt: null,
}));

// ─── DB initialization ────────────────────────────────────────────────────────
function initDB() {
  if (!localStorage.getItem('utp_users')) {
    localStorage.setItem('utp_users', JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem('utp_tutors')) {
    localStorage.setItem('utp_tutors', JSON.stringify(initialTutors));
  }
  if (!localStorage.getItem('utp_pending_tutors')) {
    localStorage.setItem('utp_pending_tutors', JSON.stringify(defaultPendingTutors));
  }
  if (!localStorage.getItem('utp_classes')) {
    localStorage.setItem('utp_classes', JSON.stringify(defaultClasses));
  }
  if (!localStorage.getItem('utp_class_requests')) {
    localStorage.setItem('utp_class_requests', JSON.stringify(defaultClassRequests));
  }
  if (!localStorage.getItem('utp_notifications')) {
    localStorage.setItem('utp_notifications', JSON.stringify(defaultNotifications));
  }
  if (!localStorage.getItem('utp_config')) {
    localStorage.setItem('utp_config', JSON.stringify(defaultConfig));
  }
}

initDB();

// ─── DB API ───────────────────────────────────────────────────────────────────
export const db = {

  // ── USERS ──────────────────────────────────────────────────────────────────
  getUsers() {
    return JSON.parse(localStorage.getItem('utp_users') || '[]');
  },

  saveUser(newUser) {
    const users = this.getUsers();
    users.push(newUser);
    localStorage.setItem('utp_users', JSON.stringify(users));

    if (newUser.role === 'tutor') {
      const pending = this.getPendingTutors();
      pending.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        career: newUser.career || 'Ingeniería',
        cycle: newUser.cycle || 4,
        year: newUser.cycle ? Math.ceil(newUser.cycle / 2) : 3,
        badge: 'GPA: Pendiente',
        avatar: newUser.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi4MYHROughn1gYtmaHBoVRqc0c36V6CC-yzOI_Xe3XXBJgztnNGqLh3dvnnO-ensA4DodAbAQI6FNoBAGS-wFA8v00CYEzwSApY9va2prtKuzybdrL_hf9u8dAqN5J7IS20Qiamy3eUgt-gw_SFdtO-YQ9-o7460N_Z3GhLSp7eJiRyIwixYEVoS85VXvL9DRYr55dktWkYS9fnjDbglmCbqfnGiV6qEE6MdvWZas9DN2i8DLUi2ggn4p4zrUwKWk04a_feUXg6g',
        verificationStatus: 'pending_review',
        submittedAt: new Date().toISOString(),
        documents: [],
        adminObservations: [],
        approvedBy: null,
        approvedAt: null,
      });
      localStorage.setItem('utp_pending_tutors', JSON.stringify(pending));
    }
    return newUser;
  },

  // ── TUTORS & APPROVALS ──────────────────────────────────────────────────────
  getTutors() {
    return JSON.parse(localStorage.getItem('utp_tutors') || '[]');
  },

  getPendingTutors() {
    return JSON.parse(localStorage.getItem('utp_pending_tutors') || '[]');
  },

  getPendingTutorById(id) {
    return this.getPendingTutors().find(t => t.id === id) || null;
  },

  /** Upload / replace a document for a pending tutor */
  addDocument(pendingId, doc) {
    const pending = this.getPendingTutors();
    const idx = pending.findIndex(t => t.id === pendingId);
    if (idx === -1) return false;

    const existing = pending[idx].documents || [];
    // Replace if same label already exists
    const existingDocIdx = existing.findIndex(d => d.label === doc.label);
    if (existingDocIdx !== -1) {
      existing[existingDocIdx] = { ...doc, isObserved: false, observationNote: null, uploadedAt: new Date().toISOString() };
    } else {
      existing.push({ ...doc, isObserved: false, observationNote: null, uploadedAt: new Date().toISOString() });
    }
    pending[idx].documents = existing;
    localStorage.setItem('utp_pending_tutors', JSON.stringify(pending));
    return true;
  },

  removeDocument(pendingId, docId) {
    const pending = this.getPendingTutors();
    const idx = pending.findIndex(t => t.id === pendingId);
    if (idx === -1) return false;
    pending[idx].documents = (pending[idx].documents || []).filter(d => d.id !== docId);
    localStorage.setItem('utp_pending_tutors', JSON.stringify(pending));
    return true;
  },

  /** Change verification status and optionally add admin observation */
  setVerificationStatus(pendingId, status, note, adminId, adminName) {
    const pending = this.getPendingTutors();
    const idx = pending.findIndex(t => t.id === pendingId);
    if (idx === -1) return false;

    pending[idx].verificationStatus = status;

    const observation = {
      by: adminId || 'admin-1',
      byName: adminName || 'Administrador UTP',
      note: note || '',
      date: new Date().toISOString(),
      action: status,
    };
    pending[idx].adminObservations = [...(pending[idx].adminObservations || []), observation];

    if (status === 'approved') {
      pending[idx].approvedBy = adminId || 'admin-1';
      pending[idx].approvedAt = new Date().toISOString();
    }

    // Mark observed documents if status is needs_correction
    if (status === 'needs_correction' && note) {
      // note may contain comma-separated doc labels to observe
    }

    localStorage.setItem('utp_pending_tutors', JSON.stringify(pending));

    // Notify the tutor user
    const users = this.getUsers();
    const tutorUser = users.find(u => u.id === pendingId);
    if (tutorUser) {
      const messages = {
        in_review: 'Un administrador ha comenzado a revisar tu solicitud de verificación.',
        needs_correction: 'Se requieren correcciones en tu documentación de verificación.',
        approved: '¡Tu cuenta de profesor ha sido aprobada! Ya puedes crear y publicar clases.',
        rejected: 'Tu solicitud de verificación fue rechazada. Revisa los comentarios del administrador.',
      };
      if (messages[status]) {
        this.createNotification(pendingId, 'Actualización de Verificación', messages[status], 'verification', pendingId);
      }
    }

    return true;
  },

  /** Mark a specific document as observed/needs replacement */
  observeDocument(pendingId, docId, note) {
    const pending = this.getPendingTutors();
    const idx = pending.findIndex(t => t.id === pendingId);
    if (idx === -1) return false;
    const docIdx = pending[idx].documents.findIndex(d => d.id === docId);
    if (docIdx === -1) return false;
    pending[idx].documents[docIdx].isObserved = true;
    pending[idx].documents[docIdx].observationNote = note;
    localStorage.setItem('utp_pending_tutors', JSON.stringify(pending));
    return true;
  },

  approveTutor(pendingId, adminId, adminName) {
    const pending = this.getPendingTutors();
    const approvedItem = pending.find(t => t.id === pendingId);
    if (!approvedItem) return false;

    // Change status in pending list (keep record)
    this.setVerificationStatus(pendingId, 'approved', 'Solicitud aprobada. Bienvenido a la plataforma.', adminId, adminName);

    // Remove from pending after marking approved
    const updatedPending = pending.filter(t => t.id !== pendingId);
    const activeTutors = this.getTutors();
    const nextId = activeTutors.length > 0 ? Math.max(...activeTutors.map(t => t.id)) + 1 : 1;

    const newTutor = {
      id: nextId,
      name: approvedItem.name,
      career: approvedItem.career,
      rating: 5.0,
      reviews: 0,
      specialties: ['Matemática', 'Algoritmos'],
      availability: 'Lun - Jue: 6pm - 8pm',
      bio: `Mentor dedicado especialista en ${approvedItem.career}.`,
      avatar: approvedItem.avatar,
      badge: 'Nuevo Mentor',
    };

    activeTutors.push(newTutor);
    localStorage.setItem('utp_tutors', JSON.stringify(activeTutors));
    localStorage.setItem('utp_pending_tutors', JSON.stringify(updatedPending));

    // Update user account
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === pendingId);
    if (userIndex !== -1) {
      users[userIndex].tutorId = nextId;
      users[userIndex].isPending = false;
      users[userIndex].avatar = newTutor.avatar;
      users[userIndex].specialties = newTutor.specialties;
      users[userIndex].availability = newTutor.availability;
      localStorage.setItem('utp_users', JSON.stringify(users));
    }

    return true;
  },

  rejectTutor(pendingId, adminId, adminName, reason) {
    this.setVerificationStatus(pendingId, 'rejected', reason || 'Solicitud rechazada.', adminId, adminName);
    const pending = this.getPendingTutors();
    const updatedPending = pending.filter(t => t.id !== pendingId);
    localStorage.setItem('utp_pending_tutors', JSON.stringify(updatedPending));
    const users = this.getUsers();
    const updatedUsers = users.filter(u => u.id !== pendingId);
    localStorage.setItem('utp_users', JSON.stringify(updatedUsers));
    return true;
  },

  // ── CLASSES ─────────────────────────────────────────────────────────────────
  getClasses() {
    return JSON.parse(localStorage.getItem('utp_classes') || '[]');
  },

  createClass(newClass) {
    const classes = this.getClasses();
    const classId = `class-${Date.now()}`;
    const fullClass = {
      id: classId,
      studentIds: [],
      studentNames: [],
      status: 'Programada',
      capacity: 10,
      materials: '',
      ...newClass,
    };
    classes.push(fullClass);
    localStorage.setItem('utp_classes', JSON.stringify(classes));
    return fullClass;
  },

  updateClass(classId, updatedFields) {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) return null;
    classes[index] = { ...classes[index], ...updatedFields };
    localStorage.setItem('utp_classes', JSON.stringify(classes));
    return classes[index];
  },

  deleteClass(classId) {
    const classes = this.getClasses();
    localStorage.setItem('utp_classes', JSON.stringify(classes.filter(c => c.id !== classId)));
    return true;
  },

  enrollStudent(classId, studentId, studentName) {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) return { success: false, error: 'La clase no existe.' };

    const classObj = classes[index];
    if (classObj.studentIds.includes(studentId)) {
      return { success: false, error: 'Ya estás inscrito en esta clase.' };
    }
    if (classObj.capacity && classObj.studentIds.length >= classObj.capacity) {
      return { success: false, error: 'La clase ya ha alcanzado su capacidad máxima.' };
    }

    classObj.studentIds.push(studentId);
    classObj.studentNames.push(studentName);
    classes[index] = classObj;
    localStorage.setItem('utp_classes', JSON.stringify(classes));
    return { success: true, class: classObj };
  },

  cancelEnrollment(classId, studentId) {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) return { success: false, error: 'La clase no existe.' };

    const classObj = classes[index];
    const si = classObj.studentIds.indexOf(studentId);
    if (si === -1) return { success: false, error: 'No estás inscrito en esta clase.' };

    classObj.studentIds.splice(si, 1);
    classObj.studentNames.splice(si, 1);
    classes[index] = classObj;
    localStorage.setItem('utp_classes', JSON.stringify(classes));
    return { success: true, class: classObj };
  },

  // ── CLASS REQUESTS ──────────────────────────────────────────────────────────
  getClassRequests() {
    return JSON.parse(localStorage.getItem('utp_class_requests') || '[]');
  },

  getClassRequestById(id) {
    return this.getClassRequests().find(r => r.id === id) || null;
  },

  createClassRequest({ title, description, category, reason, createdBy, createdByName }) {
    const config = this.getConfig();
    const threshold = config.minInterestThreshold || 3;
    const request = {
      id: `req-${Date.now()}`,
      title,
      description,
      category: category || 'General',
      reason,
      createdBy,
      createdByName,
      createdAt: new Date().toISOString(),
      status: 'Esperando interesados',
      interestedIds: [createdBy],
      interestedNames: [createdByName],
      minThreshold: threshold,
      reviewedBy: null,
      reviewedByName: null,
      reviewComment: null,
      reviewedAt: null,
      scheduleProposals: [],
      votingOpen: false,
      votingDeadline: null,
      selectedScheduleId: null,
      draftClassId: null,
    };

    // Check if immediately reaches threshold (e.g. threshold=1)
    if (request.interestedIds.length >= threshold) {
      request.status = 'Lista para revisión';
    }

    const requests = this.getClassRequests();
    requests.push(request);
    localStorage.setItem('utp_class_requests', JSON.stringify(requests));
    return request;
  },

  updateClassRequest(requestId, updatedFields) {
    const requests = this.getClassRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;
    requests[index] = { ...requests[index], ...updatedFields };
    localStorage.setItem('utp_class_requests', JSON.stringify(requests));
    return requests[index];
  },

  /** Student registers interest in a class request */
  addInterest(requestId, studentId, studentName) {
    const requests = this.getClassRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, error: 'Solicitud no encontrada.' };

    const req = requests[index];
    if (req.interestedIds.includes(studentId)) {
      return { success: false, error: 'Ya te has registrado como interesado.' };
    }
    if (req.status === 'Rechazada' || req.status === 'Aceptada') {
      return { success: false, error: 'Esta solicitud ya no acepta nuevos interesados.' };
    }

    req.interestedIds.push(studentId);
    req.interestedNames.push(studentName);

    const config = this.getConfig();
    const threshold = config.minInterestThreshold || req.minThreshold || 3;
    if (req.interestedIds.length >= threshold && req.status === 'Esperando interesados') {
      req.status = 'Lista para revisión';
      // Notify all tutors
      const tutors = this.getUsers().filter(u => u.role === 'tutor' && !u.isPending);
      tutors.forEach(t => {
        this.createNotification(
          t.id,
          'Solicitud lista para revisión',
          `"${req.title}" ha alcanzado ${req.interestedIds.length} interesados y está lista para revisión.`,
          'request_ready',
          requestId
        );
      });
      // Notify creator
      this.createNotification(
        req.createdBy,
        '¡Tu solicitud está lista!',
        `"${req.title}" alcanzó el mínimo de interesados. Un profesor la revisará pronto.`,
        'request_ready',
        requestId
      );
    }

    requests[index] = req;
    localStorage.setItem('utp_class_requests', JSON.stringify(requests));
    return { success: true, request: req };
  },

  removeInterest(requestId, studentId) {
    const requests = this.getClassRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, error: 'Solicitud no encontrada.' };

    const req = requests[index];
    if (req.createdBy === studentId) {
      return { success: false, error: 'El creador no puede retirarse de su propia solicitud.' };
    }

    const si = req.interestedIds.indexOf(studentId);
    if (si === -1) return { success: false, error: 'No estás registrado como interesado.' };

    req.interestedIds.splice(si, 1);
    req.interestedNames.splice(si, 1);

    // Revert status if below threshold
    const config = this.getConfig();
    const threshold = config.minInterestThreshold || req.minThreshold || 3;
    if (req.interestedIds.length < threshold && req.status === 'Lista para revisión') {
      req.status = 'Esperando interesados';
    }

    requests[index] = req;
    localStorage.setItem('utp_class_requests', JSON.stringify(requests));
    return { success: true, request: req };
  },

  /** Tutor accepts request and marks it for schedule proposal */
  acceptRequest(requestId, tutorId, tutorName) {
    const requests = this.getClassRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return false;

    requests[index].status = 'Aceptada';
    requests[index].reviewedBy = tutorId;
    requests[index].reviewedByName = tutorName;
    requests[index].reviewedAt = new Date().toISOString();
    requests[index].reviewComment = null;
    localStorage.setItem('utp_class_requests', JSON.stringify(requests));

    // Notify all interested students
    requests[index].interestedIds.forEach(sid => {
      this.createNotification(
        sid,
        'Solicitud Aceptada',
        `El profesor ${tutorName} aceptó la solicitud "${requests[index].title}". Pronto propondrá horarios.`,
        'request_accepted',
        requestId
      );
    });

    return true;
  },

  /** Tutor rejects a request */
  rejectRequest(requestId, tutorId, tutorName, comment) {
    const requests = this.getClassRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return false;

    requests[index].status = 'Rechazada';
    requests[index].reviewedBy = tutorId;
    requests[index].reviewedByName = tutorName;
    requests[index].reviewedAt = new Date().toISOString();
    requests[index].reviewComment = comment || '';
    localStorage.setItem('utp_class_requests', JSON.stringify(requests));

    // Notify interested students
    requests[index].interestedIds.forEach(sid => {
      this.createNotification(
        sid,
        'Solicitud Rechazada',
        `La solicitud "${requests[index].title}" fue rechazada. Motivo: ${comment || 'Sin comentarios.'}`,
        'request_rejected',
        requestId
      );
    });

    return true;
  },

  /** Tutor proposes a schedule option */
  addScheduleProposal(requestId, { date, startTime, duration, platform }) {
    const requests = this.getClassRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return false;

    const proposal = {
      id: `sched-${Date.now()}`,
      date,
      startTime,
      duration,
      platform,
      votes: [],
    };

    requests[index].scheduleProposals.push(proposal);
    localStorage.setItem('utp_class_requests', JSON.stringify(requests));
    return proposal;
  },

  /** Open voting on schedule proposals */
  openVoting(requestId) {
    const requests = this.getClassRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return false;

    const req = requests[index];
    if (req.scheduleProposals.length === 0) return false;

    req.status = 'Votación abierta';
    req.votingOpen = true;
    req.votingDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    requests[index] = req;
    localStorage.setItem('utp_class_requests', JSON.stringify(requests));

    // Notify students
    req.interestedIds.forEach(sid => {
      this.createNotification(
        sid,
        'Votación de Horario Abierta',
        `Puedes votar el horario de "${req.title}". La votación cierra en 7 días.`,
        'voting_open',
        requestId
      );
    });

    return true;
  },

  /** Student votes for a schedule */
  voteSchedule(requestId, scheduleId, studentId) {
    const requests = this.getClassRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, error: 'Solicitud no encontrada.' };

    const req = requests[index];
    if (!req.votingOpen) return { success: false, error: 'La votación no está abierta.' };
    if (!req.interestedIds.includes(studentId)) {
      return { success: false, error: 'Solo los interesados pueden votar.' };
    }

    // Remove existing vote from any proposal
    req.scheduleProposals.forEach(p => {
      p.votes = p.votes.filter(id => id !== studentId);
    });

    // Add vote
    const schedIdx = req.scheduleProposals.findIndex(p => p.id === scheduleId);
    if (schedIdx === -1) return { success: false, error: 'Propuesta de horario no encontrada.' };
    req.scheduleProposals[schedIdx].votes.push(studentId);

    requests[index] = req;
    localStorage.setItem('utp_class_requests', JSON.stringify(requests));
    return { success: true };
  },

  /** Close voting and auto-select winner (or flag for manual selection on tie) */
  closeVoting(requestId) {
    const requests = this.getClassRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return false;

    const req = requests[index];
    req.votingOpen = false;
    req.status = 'Votación cerrada';

    // Find winner
    const sorted = [...req.scheduleProposals].sort((a, b) => b.votes.length - a.votes.length);
    if (sorted.length > 0) {
      const topVotes = sorted[0].votes.length;
      const tied = sorted.filter(p => p.votes.length === topVotes);
      if (tied.length === 1) {
        req.selectedScheduleId = sorted[0].id;
      }
      // If tied, selectedScheduleId stays null — tutor must choose manually
    }

    requests[index] = req;
    localStorage.setItem('utp_class_requests', JSON.stringify(requests));
    return req;
  },

  /** Tutor manually selects a schedule (on tie or override) */
  selectSchedule(requestId, scheduleId) {
    return this.updateClassRequest(requestId, { selectedScheduleId: scheduleId });
  },

  /** Create draft class from accepted request with selected schedule */
  createDraftClass(requestId, tutorId, tutorName, tutorAvatar) {
    const req = this.getClassRequestById(requestId);
    if (!req || !req.selectedScheduleId) return null;

    const schedule = req.scheduleProposals.find(p => p.id === req.selectedScheduleId);
    if (!schedule) return null;

    // Calculate end time from duration
    const [h, m] = schedule.startTime.split(':').map(Number);
    const durationMins = parseInt(schedule.duration) || 90;
    const endH = Math.floor((h * 60 + m + durationMins) / 60);
    const endM = (h * 60 + m + durationMins) % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const draftClass = this.createClass({
      tutorId,
      tutorName,
      tutorAvatar,
      title: req.title,
      description: req.description,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime,
      subject: req.category,
      platform: schedule.platform,
      meetingLink: '',
      materials: '',
      status: 'Borrador',
      capacity: 20,
      studentIds: [...req.interestedIds],
      studentNames: [...req.interestedNames],
      fromRequestId: requestId,
    });

    // Link draft to request
    this.updateClassRequest(requestId, { draftClassId: draftClass.id, status: 'Clase creada' });

    // Notify students
    req.interestedIds.forEach(sid => {
      this.createNotification(
        sid,
        'Clase Creada',
        `La clase "${req.title}" ha sido programada. El profesor la publicará pronto.`,
        'class_created',
        draftClass.id
      );
    });

    return draftClass;
  },

  // ── NOTIFICATIONS ───────────────────────────────────────────────────────────
  getNotifications(userId) {
    const all = JSON.parse(localStorage.getItem('utp_notifications') || '[]');
    return all.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createNotification(userId, title, message, type, relatedId) {
    const notifications = JSON.parse(localStorage.getItem('utp_notifications') || '[]');
    const notif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      title,
      message,
      type,
      relatedId: relatedId || null,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.push(notif);
    localStorage.setItem('utp_notifications', JSON.stringify(notifications));
    return notif;
  },

  markNotificationRead(notifId) {
    const notifications = JSON.parse(localStorage.getItem('utp_notifications') || '[]');
    const idx = notifications.findIndex(n => n.id === notifId);
    if (idx !== -1) {
      notifications[idx].read = true;
      localStorage.setItem('utp_notifications', JSON.stringify(notifications));
    }
  },

  markAllNotificationsRead(userId) {
    const notifications = JSON.parse(localStorage.getItem('utp_notifications') || '[]');
    notifications.forEach(n => { if (n.userId === userId) n.read = true; });
    localStorage.setItem('utp_notifications', JSON.stringify(notifications));
  },

  getUnreadCount(userId) {
    return this.getNotifications(userId).filter(n => !n.read).length;
  },

  // ── CONFIG ──────────────────────────────────────────────────────────────────
  getConfig() {
    return JSON.parse(localStorage.getItem('utp_config') || '{}');
  },

  setConfig(key, value) {
    const config = this.getConfig();
    config[key] = value;
    localStorage.setItem('utp_config', JSON.stringify(config));
  },
};
