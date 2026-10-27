import fs from "node:fs";
import { Alumne } from "./alumne.js";
import { Professor } from "./professor.js";
import { Assignatura } from "./assignatura.js";

export class Institut {
  constructor(rutaAlumnes = "./dades/alumnes.json", rutaAssignatures = "./dades/assignatures.json", rutaProfessors = "./dades/professors.json") {
    this.rutaAlumnes = rutaAlumnes;
    this.rutaAssignatures = rutaAssignatures;
    this.rutaProfessors = rutaProfessors;

    this.alumnes = this.carregarAlumnes();
    this.assignatures = this.carregarAssignatures();
    this.professors = this.carregarProfessors();
  }

  carregarAlumnes() {
    try {
      const contingut = fs.readFileSync(this.rutaAlumnes, "utf-8");
      const dades = JSON.parse(contingut);
      return dades.map((d) => new Alumne(d.id, d.nom, d.cognoms, d.matriculades || []));
    } catch (e) {
      return [];
    }
  }

  carregarAssignatures() {
    try {
      const contingut = fs.readFileSync(this.rutaAssignatures, "utf-8");
      const dades = JSON.parse(contingut);
      return dades.map((d) => new Assignatura(d.id, d.codi, d.nom, d.curs, d.modul));
    } catch (e) {
      return [];
    }
  }

  carregarProfessors() {
    try {
      const contingut = fs.readFileSync(this.rutaProfessors, "utf-8");
      const dades = JSON.parse(contingut);
      return dades.map((d) => new Professor(d.id, d.nom, d.cognoms, d.assignaturesImpartides || []));
    } catch (e) {
      return [];
    }
  }

  desar() {
    const dadesAlumnes = this.alumnes.map((a) => ({
      id: a.id,
      nom: a.nom,
      cognoms: a.cognoms,
      matriculades: a.matriculades,
      notes: a.notes,
    }));
    const dadesAssignatures = this.assignatures.map((as) => ({
      id: as.id,
      codi: as.codi,
      nom: as.nom,
      curs: as.curs,
      modul: as.modul,
    }));
    const dadesProfessors = this.professors.map((p) => ({
      id: p.id,
      nom: p.nom,
      cognoms: p.cognoms,
      assignaturesImpartides: p.assignaturesImpartides,
    }));

    fs.writeFileSync(this.rutaAlumnes, JSON.stringify(dadesAlumnes), "utf-8");
    fs.writeFileSync(this.rutaAssignatures, JSON.stringify(dadesAssignatures), "utf-8");
    fs.writeFileSync(this.rutaProfessors, JSON.stringify(dadesProfessors), "utf-8");
  }

  buscarAlumne(nomOCognom) {
    if (!nomOCognom) return undefined;
    const terme = String(nomOCognom).toLowerCase();
    for (let i = 0; i < this.alumnes.length; i++) {
      const a = this.alumnes[i];
      const nom = String(a.nom || "").toLowerCase();
      if (nom.includes(terme)) return a;
    }
    for (let i = 0; i < this.alumnes.length; i++) {
      const a = this.alumnes[i];
      const cognoms = String(a.cognoms || "").toLowerCase();
      if (cognoms.includes(terme)) return a;
    }
    for (let i = 0; i < this.alumnes.length; i++) {
      const a = this.alumnes[i];
      const nom = String(a.nom || "").toLowerCase();
      const cognoms = String(a.cognoms || "").toLowerCase();
      const nomComplet1 = (cognoms + ", " + nom).toLowerCase();
      const nomComplet2 = (cognoms + " " + nom).toLowerCase();
      if (nomComplet1.includes(terme) || nomComplet2.includes(terme)) return a;
    }
    return undefined;
  }

  donarAltaAssignatura(assignatura) {
    this.assignatures.push(assignatura);
    return assignatura;
  }

  matricular(alumneId, assignaturaId) {
    const alumne = this.alumnes.find((a) => a.id === alumneId);
    const assignatura = this.assignatures.find((as) => as.id === assignaturaId);

    if (!alumne || !assignatura) {
      throw new Error("Alumne o assignatura no trobats");
    }

    if (!Array.isArray(alumne.matriculades)) {
      alumne.matriculades = [];
    }

    if (alumne.matriculades.includes(assignaturaId)) {
      throw new Error("Ja està matriculat o duplicat");
    }

    alumne.matriculades.push(assignaturaId);
    return alumne;
  }

  posarNota(alumneId, assignaturaId, nota) {
    const alumne = this.alumnes.find((a) => a.id === alumneId);
    if (!alumne) {
      throw new Error("Alumne no trobat");
    }
    return alumne.posarNota(assignaturaId, nota);
  }

  mitjana(alumneId) {
    const alumne = this.alumnes.find((a) => a.id === alumneId);
    if (!alumne) {
      throw new Error("Alumne no trobat");
    }

    const notes = Object.values(alumne.notes || {}).filter((n) => typeof n === "number");
    if (notes.length === 0) {
      return 0;
    }

    let suma = 0;
    for (let i = 0; i < notes.length; i++) {
      suma += notes[i];
    }
    const mitjana = suma / notes.length;
    return Math.round(mitjana * 100) / 100;
  }

  llistarAlumnesMatriculats(assignaturaId) {
    const assignatura = this.assignatures.find((as) => as.id === assignaturaId);
    if (!assignatura) {
      return [];
    }
    const resultat = [];
    for (let i = 0; i < this.alumnes.length; i++) {
      const alumne = this.alumnes[i];
      if (Array.isArray(alumne.matriculades) && alumne.matriculades.includes(assignaturaId)) {
        resultat.push(alumne);
      }
    }
    return resultat.slice();
  }

  assignaturesDunAlumne(alumneId) {
    const alumne = this.alumnes.find((a) => a.id === alumneId);
    if (!alumne || !Array.isArray(alumne.matriculades)) {
      return [];
    }
    const resultat = [];
    for (let i = 0; i < alumne.matriculades.length; i++) {
      const asId = alumne.matriculades[i];
      const as = this.assignatures.find((a) => a.id === asId);
      if (as) {
        resultat.push(as);
      }
    }
    return resultat.slice();
  }

  informeAlumne(alumneId) {
    const alumne = this.alumnes.find((a) => a.id === alumneId);
    if (!alumne) {
      throw new Error("Alumne no trobat");
    }

    const assignaturesMatriculades = [];
    if (Array.isArray(alumne.matriculades)) {
      for (let i = 0; i < alumne.matriculades.length; i++) {
        const asId = alumne.matriculades[i];
        const as = this.assignatures.find((a) => a.id === asId);
        if (as) {
          if (as.codi) assignaturesMatriculades.push(as.codi);
          else if (as.nom) assignaturesMatriculades.push(as.nom);
        } else {
          assignaturesMatriculades.push(String(asId));
        }
      }
    }

    return {
      alumne: { id: alumne.id, nomComplet: alumne.nomComplet() },
      assignaturesMatriculades,
      notes: alumne.notes || {},
      mitjana: this.mitjana(alumneId),
    };
  }
}
