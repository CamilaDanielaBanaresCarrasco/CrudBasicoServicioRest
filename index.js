const http = require('http');
const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid"); // se utiliza para generar identificadores únicos universalmente

http.createServer(async (req, res) => { //Creando el servidor 
  const { searchParams, pathname } = new URL(req.url, `http://${req.headers.host}`);
  const params = new URLSearchParams(searchParams);
  console.log(pathname);

  if (pathname === '/comics' && req.method === 'GET') {
    try {
      const lecturaArchivo = await fs.readFile("comics.txt");
      res.write(lecturaArchivo.toString());
      res.end();
    } catch (error) {
      console.error("Error al leer el archivo JSON:", error);
      res.statusCode = 500;
      res.write("Error en el servidor");
      res.end();
    }
  }

  if (pathname === '/comics' && req.method === 'POST') {
    try {
      const archivoOriginal = await fs.readFile("comics.txt");
      const datosOriginales = JSON.parse(archivoOriginal);
      const id = uuidv4();
      let datosComic = "";

      req.on("data", (data) => {
        datosComic += data;
      });

      req.on("end", async () => {
        const comicNuevo = JSON.parse(datosComic);
        datosOriginales[id] = comicNuevo;

        await fs.writeFile("comics.txt", JSON.stringify(datosOriginales, null, 2));
        res.write("Comic agregado exitosamente");
        res.end();
      });
    } catch (error) {
      console.error("Error al leer o parsear el archivo JSON:", error);
      res.statusCode = 500;
      res.write("Error en el servidor");
      res.end();
    }
  }

  if (pathname === '/comics' && req.method === 'PUT') {
    try {
      const id = params.get("id");
      let datosParaModificar = "";

      req.on("data", (datos) => {
        datosParaModificar += datos;
      });

      req.on("end", async () => {
        const datosArchivo = await fs.readFile("comics.txt");
        const objetoArchivoOriginal = JSON.parse(datosArchivo);

        const comicOriginal = objetoArchivoOriginal[id];
        const comicModificado = JSON.parse(datosParaModificar);

        const comicActualizado = { ...comicOriginal, ...comicModificado };
        objetoArchivoOriginal[id] = comicActualizado;

        await fs.writeFile("comics.txt", JSON.stringify(objetoArchivoOriginal, null, 2));

        res.write("Los datos fueron modificados");
        res.end();
      });
    } catch (error) {
      console.error("Error al leer o parsear el archivo JSON:", error);
      res.statusCode = 500;
      res.write("Error en el servidor");
      res.end();
    }
  }

  if (pathname === '/comics' && req.method === 'DELETE') {
    try {
      const comicsOriginales = await fs.readFile("comics.txt");
      const objetoArchivoOriginal = JSON.parse(comicsOriginales);
      const id = params.get("id");
      
      if (objetoArchivoOriginal.hasOwnProperty(id)) {
        delete objetoArchivoOriginal[id];

        await fs.writeFile("comics.txt", JSON.stringify(objetoArchivoOriginal, null, 2));

        res.write("El cómic ha sido eliminado exitosamente");
        res.end();
      } else {
        res.write("No se encontró ningún cómic con el ID proporcionado");
        res.end();
      }
    } catch (error) {
      console.error("Error al leer o parsear el archivo JSON:", error);
      res.statusCode = 500;
      res.write("Error en el servidor");
      res.end();
    }
  }
}).listen(8080, function () {
  console.log("Servidor iniciado en el puerto 8080");
});
