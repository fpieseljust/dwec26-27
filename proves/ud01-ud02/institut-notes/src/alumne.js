import { Persona } from "./persona.js";

export class Alumne extends Persona {
  constructor(id, nom, cognoms, matriculades = []) {
    super(id, nom, cognoms);
    this.matriculades = matriculades;
    this.notes = {};
  }

  posarNota(assignaturaId, nota) {
    if (nota < 0 || nota > 10) {
      throw new Error("Nota invàlida");
    }
    this.notes[assignaturaId] = nota;
    return this.notes[assignaturaId];
  }
}
