export class Persona {
  constructor(id, nom, cognoms) {
    this.id = id;
    this.nom = nom;
    this.cognoms = cognoms;
  }

  nomComplet() {
    return this.cognoms + ", " + this.nom;
  }
}
