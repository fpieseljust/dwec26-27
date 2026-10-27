import assert from "node:assert/strict";
import { test, after } from "node:test";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { Institut } from "../src/institut.js";
import { Alumne } from "../src/alumne.js";
import { Assignatura } from "../src/assignatura.js";

function crearEntorn() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "institut-test-"));
  const rutaA = path.join(dir, "alumnes.json");
  const rutaAs = path.join(dir, "assignatures.json");
  const rutaP = path.join(dir, "professors.json");
  fs.writeFileSync(rutaA, JSON.stringify([]));
  fs.writeFileSync(rutaAs, JSON.stringify([]));
  fs.writeFileSync(rutaP, JSON.stringify([]));
  return { dir, rutaA, rutaAs, rutaP };
}

test("nomComplet format Cognoms, Nom", () => {
  const a = new Alumne(1, "Laia", "Martínez");
  assert.equal(a.nomComplet(), "Martínez, Laia");
});

test("buscarAlumne exacte, minúscules, parcial i sense resultats", () => {
  const { dir, rutaA, rutaAs, rutaP } = crearEntorn();
  after(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch(e){} });
  fs.writeFileSync(rutaA, JSON.stringify([
    { id: 1, nom: "Laia", cognoms: "Martínez", matriculades: [] },
    { id: 2, nom: "Marc", cognoms: "Vidal", matriculades: [] }
  ]));
  const inst = new Institut(rutaA, rutaAs, rutaP);
  assert.equal(inst.buscarAlumne("Laia")?.nom, "Laia");
  assert.equal(inst.buscarAlumne("laia")?.nom, "Laia");
  assert.equal(inst.buscarAlumne("mar")?.nom, "Marc");
  assert.equal(inst.buscarAlumne("inexistent"), undefined);
});

test("matricular correcte, duplicat, inexistents sense modificar", () => {
  const { dir, rutaA, rutaAs, rutaP } = crearEntorn();
  after(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch(e){} });
  fs.writeFileSync(rutaA, JSON.stringify([{ id: 1, nom: "Laia", cognoms: "Martínez", matriculades: [] }]));
  fs.writeFileSync(rutaAs, JSON.stringify([{ id: 101, codi: "DWEC", nom: "DWEC", curs: "2n", modul: "DWEC" }]));
  const inst = new Institut(rutaA, rutaAs, rutaP);
  inst.matricular(1, 101);
  assert.equal(inst.alumnes[0].matriculades.length, 1);
  assert.throws(() => inst.matricular(1, 101));
  assert.equal(inst.alumnes[0].matriculades.length, 1);
  assert.throws(() => inst.matricular(99, 101));
  assert.throws(() => inst.matricular(1, 999));
});

test("posarNota vàlida i invàlida", () => {
  const a = new Alumne(1, "Laia", "Martínez");
  assert.equal(a.posarNota(101, 0), 0);
  assert.equal(a.posarNota(101, 10), 10);
  assert.throws(() => a.posarNota(101, -1), /Nota invàlida/);
  assert.throws(() => a.posarNota(101, 11), /Nota invàlida/);
});

test("mitjana amb notes, sense notes i arrodoniment", () => {
  const { dir, rutaA, rutaAs, rutaP } = crearEntorn();
  after(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch(e){} });
  fs.writeFileSync(rutaA, JSON.stringify([{ id: 1, nom: "Laia", cognoms: "Martínez", matriculades: [101,102], notes: {} }]));
  const inst = new Institut(rutaA, rutaAs, rutaP);
  assert.equal(inst.mitjana(1), 0);
  inst.posarNota(1, 101, 7);
  inst.posarNota(1, 102, 6);
  assert.equal(inst.mitjana(1), 6.5);
  inst.posarNota(1, 103, 10);
  assert.equal(inst.mitjana(1), 7.67);
});

test("desar i carregar, fitxer inexistent i JSON invàlid", () => {
  const { dir, rutaA, rutaAs, rutaP } = crearEntorn();
  after(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch(e){} });
  const inst = new Institut(rutaA, rutaAs, rutaP);
  inst.donarAltaAssignatura(new Assignatura(101, "DWEC", "DWEC", "2n", "DWEC"));
  inst.alumnes.push(new Alumne(1, "Laia", "Martínez", [101]));
  inst.desar();
  const inst2 = new Institut(rutaA, rutaAs, rutaP);
  assert.equal(inst2.alumnes.length, 1);
  assert.equal(inst2.assignatures[0].codi, "DWEC");

  const inst3 = new Institut(path.join(dir, "no.json"), path.join(dir, "no2.json"), path.join(dir, "no3.json"));
  assert.equal(Array.isArray(inst3.alumnes), true);
  assert.equal(inst3.alumnes.length, 0);

  fs.writeFileSync(rutaA, "{bad");
  const inst4 = new Institut(rutaA, rutaAs, rutaP);
  assert.equal(inst4.alumnes.length, 0);
});
