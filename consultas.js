const { Pool } = require("pg");
const format = require("pg-format");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "123456",
  database: "joyas",
  port: 5432,
  allowExitOnIdle: true,
});

const obtenerJoyas = async ({ limits = 10, page = 1, order_by = "id_ASC" }) => {
  const [campo, direccion] = order_by.split("_");
  const offSet = (page - 1) * limits;
  const formattedQuery = format(
    "SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s",
    campo,
    direccion,
    limits,
    offSet
  );
  const { rows: joyas } = await pool.query(formattedQuery);
  return joyas;
};

const obtenerJoyasPorFiltros = async ({
  precio_max,
  precio_min,
  categoria,
  metal,
}) => {
  let consulta = "SELECT * FROM inventario";
  let filtros = [];
  const values = [];

  const agregarFiltro = (campo, comparador, valor) => {
    values.push(valor);
    const { length } = filtros;
    filtros.push(`${campo} ${comparador} $${length + 1}`);
  };
  if (precio_max) {
    agregarFiltro("precio", "<=", precio_max);
  }
  if (precio_min) {
    agregarFiltro("precio", ">=", precio_min);
  }
  if (categoria) {
    agregarFiltro("categoria", "=", categoria);
  }
  if (metal) {
    agregarFiltro("metal", "=", metal);
  }
  if (filtros.length > 0) {
    consulta += ` WHERE ` + filtros.join(" AND ");
  }
  const { rows: joyas } = await pool.query(consulta, values);
  return joyas;
};

const prepararHATEOAS = (joyas) => {
  const results = joyas
    .map((j) => {
      return {
        name: j.nombre,
        href: `/joyas/joya${j.id}`,
      };
    })
    .slice(0, 4);
  const totalJoyas = joyas.length;
  let stockTotal = 0;
  for (let i = 0; i < joyas.length; i++) {
    stockTotal += joyas[i].stock;
  }
  const HATEOAS = {
    totalJoyas,
    stockTotal,
    results,
  };
  return HATEOAS;
};

module.exports = {
  obtenerJoyas,
  prepararHATEOAS,
  obtenerJoyasPorFiltros,
};
