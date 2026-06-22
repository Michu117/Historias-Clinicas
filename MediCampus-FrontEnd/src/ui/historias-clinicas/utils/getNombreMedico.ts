export function getNombreMedico(): string {
  try {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return 'Médico responsable';
    const user = JSON.parse(stored);
    const u = user?.usuario;
    if (u?.nombre && u?.apellido) return `${u.nombre} ${u.apellido}`;
    if (u?.nombre) return u.nombre;
    if (user?.correo) return user.correo;
    return 'Médico responsable';
  } catch {
    return 'Médico responsable';
  }
}
