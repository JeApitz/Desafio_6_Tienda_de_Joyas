const format = require("pg-format");
const express = require("express");
const {
  obtenerJoyas,
  prepararHATEOAS,
  obtenerJoyasPorFiltros,
} = require("./consultas");

const app = express();
app.listen(3000, console.log("Servidor encendido"));

const informeConsulta = (req, res, next) => {
  const informe = {
    ruta: req.originalUrl,
  };
  console.log("URL consultada:", informe);

  next();
};

// Middleware
app.use(informeConsulta);

app.get("/joyas", async (req, res) => {
  try {
    const queryString = req.query;
    const joyas = await obtenerJoyas(queryString);
    const HATEOAS = await prepararHATEOAS(joyas);
    res.json(HATEOAS);
  } catch (error) {
    res.status(500).send("Se produjo un error al realizar la consulta");
  }
});

app.get("/joyas/filtros", async (req, res) => {
  try {
    res.json(await obtenerJoyasPorFiltros(req.query));
  } catch (error) {
    res.status(500).send("Se produjo un error al realizar la consulta");
  }
});
