import "table2excel";

const idDisplay = document.getElementById("poke-id");
const pokeTable = document.getElementById("poke-table");
const tableBody = pokeTable.tBodies[0];

const getPokemonBtn = document.getElementById("get-pokemon-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const exportBtn = document.getElementById("export-btn");

// ------------------------

getPokemonBtn.addEventListener("click", fetchInitialData);
exportBtn.addEventListener("click", exportToExcel);

function fetchInitialData() {
  fetchPokemon("https://pokeapi.co/api/v2/pokemon?limit=25");
  getPokemonBtn.classList.add("hidden");
  exportBtn.classList.remove("hidden");
  getPokemonBtn.removeEventListener("click", fetchInitialData);
}

function exportToExcel() {
  const table2excel = new Table2Excel();
  table2excel.export(pokeTable);
}

function displayIds(arr) {
  const firstId = arr[0].id;
  const lastId = arr[arr.length - 1].id;
  idDisplay.innerHTML = `Displaying IDs: ${firstId} - ${lastId}`;
}

function handlePaginationBtn(url, btn) {
  // verify url exists => enable/disable btn visibility,
  // create handler to fetch next/prev data set
  if (url) {
    btn.classList.remove("hidden");
    btn.onclick = () => fetchPokemon(url);
  } else {
    btn.classList.add("hidden");
  }
}

function renderPokemon(pokeDetails) {
  // create new row
  const newRow = tableBody.insertRow();

  // create three new cells in the new row
  const idCell = newRow.insertCell();
  const nameCell = newRow.insertCell();
  const typeCell = newRow.insertCell();

  // insert details into each cell
  idCell.innerHTML = `${pokeDetails.id}`;
  nameCell.innerHTML = `${pokeDetails.name}`;
  typeCell.innerHTML = `${pokeDetails.types[0]["type"].name}`;
}

// ------------------------

// main function
async function fetchPokemon(url) {
  // fetch arr of pokemon
  const res = await fetch(url);
  const data = await res.json();
  const allPokemon = data.results;

  // fetch details for each pokemon, store results in an arr
  const pokeDetailsArr = await Promise.all(
    allPokemon.map((p) => {
      return fetch(p.url).then((res) => res.json());
    })
  );

  // display IDs for current pokemon above table
  displayIds(pokeDetailsArr);

  // clear old table data
  tableBody.innerHTML = "";

  // render each pokemon into table
  pokeDetailsArr.forEach((detail) => renderPokemon(detail));

  // update pagination buttons visibility + request url
  handlePaginationBtn(data.previous, prevBtn);
  handlePaginationBtn(data.next, nextBtn);
}

// -----------------

// enables webpack hot reloading
if (module.hot) {
  module.hot.accept();
}
