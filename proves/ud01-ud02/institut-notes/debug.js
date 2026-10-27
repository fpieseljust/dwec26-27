import { Institut } from "./src/institut.js";
import { Alumne } from "./src/alumne.js";
import { Assignatura } from "./src/assignatura.js";

const institut = new Institut("./dades/alumnes.json", "./dades/assignatures.json", "./dades/professors.json");

console.log("Alumnes:", institut.alumnes.length);
console.log("Assignatures:", institut.assignatures.length);

// Cerca
console.log('Buscar "laia":', institut.buscarAlumne("laia")?.nom);
console.log('Buscar "MARTÍNEZ":', institut.buscarAlumne("MARTÍNEZ")?.nomComplet?.());
console.log('Buscar "mar":', institut.buscarAlumne("mar")?.nom);

// Matricular
try {
  institut.matricular(1, 102);
  console.log("Matriculat ok. Matriculades:", institut.alumnes[0].matriculades);
} catch (e) {
  console.log("Err matricular:", e.message);
}

// Notes
try {
  institut.posarNota(1, 101, 7.5);
  institut.posarNota(1, 102, 6);
  console.log("Notes Laia:", institut.alumnes[0].notes);
} catch (e) {
  console.log("Err nota:", e.message);
}

// Mitjana
console.log("Mitjana Laia:", institut.mitjana(1));

// Mòduls 2n DWEC
console.log("2n DWEC:", institut.obtenirModuls2nDWEC().map(a => a.codi));

// Desar
institut.desar();
