import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const academicRoot = join(projectRoot, "html", "academico");
const templateRoot = join(academicRoot, "templates");

const [header, footer] = await Promise.all([
  readFile(join(templateRoot, "shared-header.html"), "utf8"),
  readFile(join(templateRoot, "shared-footer.html"), "utf8"),
]);

for (const page of ["noticias", "inscripciones"]) {
  const template = await readFile(join(templateRoot, page + ".template.html"), "utf8");

  if (!template.includes("<!-- shared:header -->") || !template.includes("<!-- shared:footer -->")) {
    throw new Error("La plantilla de " + page + " no contiene los marcadores compartidos.");
  }

  const output = template
    .replace("<!-- shared:header -->", header)
    .replace("<!-- shared:footer -->", footer);

  await writeFile(join(academicRoot, page + ".html"), output);
}

console.log("Páginas institucionales generadas.");
