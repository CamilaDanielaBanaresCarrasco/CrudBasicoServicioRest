const http = require('http');
const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid"); // se utiliza para generar identificadores únicos universalmente

http.createServer(async (req, res) => { //Creando el servidor 
    const { searchParams, pathname } = new URL(req.url, `http://${req.headers.host}`);
    const params = new URLSearchParams(searchParams);

    console.log(pathname);  // traigo el patshname para compararlo
  
    //http://localhost:8080/autos
    if (pathname === '/autos' && req.method === 'GET') { // traer para leer
      try {
        const lecturaArchivo = await fs.readFile("autos.txt"); //leemos el archivo
        res.write(lecturaArchivo.toString());  //Escribimos el archivo
        res.end();  // Terminamos el proceso
      } catch (error) {
        console.error("Error al leer el archivo JSON DE AUTOS:", error);  //ERROR
        res.statusCode = 500;
        res.write("Error en el servidor DE AUTOS");
        res.end();
      }
    }
   

 // Verificar si la ruta es '/autos' y el método de solicitud es 'POST'
if (pathname === '/autos' && req.method === 'POST') { // AGREGA a lo leído
    try {
      const archivoOriginal = await fs.readFile("autos.txt"); // Leer el contenido del archivo "autos.txt"
      const datosOriginales = JSON.parse(archivoOriginal); // Analizar el contenido del archivo como JSON
      const id = uuidv4(); // Crear un ID único
      let datosAuto = ""; // Variable para almacenar los datos del auto a agregar
  
      // Escuchar el evento 'data' para recibir los datos de la solicitud
      req.on("data", (data) => {
          datosAuto += data;
      });
  
      // Escuchar el evento 'end' cuando finaliza la recepción de datos
      req.on("end", async () => {
        const autoNuevo = JSON.parse(datosAuto); // Analizar los datos del auto a agregar como JSON
        datosOriginales[id] = autoNuevo; // Agregar el auto nuevo al objeto de datos originales con el ID generado
  
        await fs.writeFile("autos.txt", JSON.stringify(datosOriginales, null, 2)); // Escribir los datos actualizados en el archivo "autos.txt"
  
        res.write("Autos agregado exitosamente"); // Enviar una respuesta indicando que el auto fue agregado con éxito
        res.end(); // Finalizar la respuesta
      });
    } catch (error) {
      console.error("Error al leer o parsear el archivo JSON:", error); // Imprimir el error en la consola en caso de problemas al leer o analizar el archivo JSON
      res.statusCode = 500; // Establecer el código de estado de la respuesta a 500 (Error interno del servidor)
      res.write("Error en el servidor"); // Enviar una respuesta indicando que hubo un error en el servidor
      res.end(); // Finalizar la respuesta
    }
  }
  

    if (pathname === '/autos' && req.method === 'PUT') { // MODIFICA algún dato de lo leído
    try {
      const id = params.get("id"); // Traigo el dato 'id' de la URL (ejemplo: http://localhost:8080/comics?id=12345534635)
      let datosParaModificar = ""; // Variable para almacenar los datos a modificar
  
      // Escuchar el evento 'data' para recibir los datos de la solicitud
      req.on("data", (datos) => {
        datosParaModificar += datos;
      });
  
      // Escuchar el evento 'end' cuando finaliza la recepción de datos
      req.on("end", async () => {
        const datosArchivo = await fs.readFile("autos.txt"); // Leer el contenido del archivo "autos.txt"
        const objetoArchivoOriginal = JSON.parse(datosArchivo); // Analizar el contenido del archivo como JSON
  
        const autoOriginal = objetoArchivoOriginal[id]; // Obtener el auto original del objeto según el 'id' proporcionado
        const autoModificado = JSON.parse(datosParaModificar); // Analizar los datos a modificar como JSON
  
        const autoActualizado = { ...autoOriginal, ...autoModificado }; // Realizar una mezcla de los datos original y modificados
        objetoArchivoOriginal[id] = autoActualizado; // Actualizar el auto original con los datos modificados
  
        await fs.writeFile("autos.txt", JSON.stringify(objetoArchivoOriginal, null, 2)); // Escribir los datos actualizados en el archivo "autos.txt"
  
        res.write("Los datos fueron modificados"); // Enviar una respuesta indicando que los datos fueron modificados
        res.end(); // Finalizar la respuesta
      });
    } catch (error) {
      console.error("Error al leer o parsear el archivo JSON:", error); // Imprimir el error en la consola en caso de problemas al leer o analizar el archivo JSON
      res.statusCode = 500; // Establecer el código de estado de la respuesta a 500 (Error interno del servidor)
      res.write("Error en el servidor"); // Enviar una respuesta indicando que hubo un error en el servidor
      res.end(); // Finalizar la respuesta
    }
  }
  


    // Verificar si la ruta es '/autos' y el método de solicitud es 'DELETE'
if (pathname === '/autos' && req.method === 'DELETE') { // ELIMINA algún dato de lo leído
    try {
      const autosOriginales = await fs.readFile("autos.txt"); // Leer el contenido del archivo "autos.txt"
      const objetoArchivoOriginal = JSON.parse(autosOriginales); // Analizar el contenido del archivo como JSON
      const id = params.get("id"); // Obtener el parámetro 'id' de la URL
  
      if (objetoArchivoOriginal.hasOwnProperty(id)) { // Verificar si el objeto original tiene una propiedad con el 'id' proporcionado
        delete objetoArchivoOriginal[id]; // Eliminar la propiedad correspondiente al 'id' del objeto original
  
        await fs.writeFile("autos.txt", JSON.stringify(objetoArchivoOriginal, null, 2)); // Escribir los datos actualizados en el archivo "autos.txt"
  
        res.write("El auto ha sido eliminado exitosamente"); // Enviar una respuesta indicando que el auto ha sido eliminado con éxito
        res.end(); // Finalizar la respuesta
      } else {
        res.write("No se encontró ningún auto con el ID proporcionado"); // Enviar una respuesta indicando que no se encontró ningún auto con el 'id' proporcionado
        res.end(); // Finalizar la respuesta
      }
    } catch (error) {
      console.error("Error al leer o parsear el archivo JSON:", error); // Imprimir el error en la consola en caso de problemas al leer o analizar el archivo JSON
      res.statusCode = 500; // Establecer el código de estado de la respuesta a 500 (Error interno del servidor)
      res.write("Error en el servidor"); // Enviar una respuesta indicando que hubo un error en el servidor
      res.end(); // Finalizar la respuesta
    }
  }
  }).listen(8080, function () {
    console.log("Servidor iniciado en el puerto 8080");
  });
  

