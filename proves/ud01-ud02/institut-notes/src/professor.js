import { Persona } from "./persona.js";

export class Professor extends Persona {
  constructor(id, nom, cognoms, assignaturesImpartides = []) {
    super(id, nom, cognoms);
    this.assignaturesImpartides = assignaturesImpartides;
  }
}
