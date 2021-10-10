import "table2excel";

const idDisplay = document.getElementById("poke-id");
const pokeTable = document.getElementById("poke-table");
const tableBody = pokeTable.tBodies[0];

const getPokemonBtn = document.getElementById("get-pokemon-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const exportBtn = document.getElementById("export-btn");

const typeSelectionContainer = document.getElementById(
  "type-selection-container"
);
const typeSelector = document.getElementById("type-selector");

// ------------------------

// ------------------------

typeSelector.onchange = () => {
  console.log(typeSelector.length);
  main();
};
// ------------------------

getPokemonBtn.addEventListener("click", fetchInitialData);
exportBtn.addEventListener("click", exportToExcel);

function fetchInitialData() {
  main("https://pokeapi.co/api/v2/pokemon?limit=25");
  getPokemonBtn.classList.add("hidden");
  exportBtn.classList.remove("hidden");
  typeSelectionContainer.classList.remove("hidden");
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
    btn.onclick = () => main(url);
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
  typeCell.innerHTML = `${pokeDetails.primaryType}`;
}

async function fetchPokemon(url) {
  // fetch arr of pokemon + pagination urls
  const res = await fetch(url);
  const data = await res.json();
  const allPokemon = data.results;

  // fetch details for each pokemon, store results in an arr
  const pokeDetailsArr = await Promise.all(
    allPokemon.map((p) => {
      return fetch(p.url).then((res) => res.json());
    })
  );

  return [pokeDetailsArr, data.previous, data.next];
}

// ------------------------

// main function
async function main(url = "") {
  let pokeDetailsArr, prevUrl, nextUrl;
  if (url) {
    // fetch pokemon details + pagination urls
    [pokeDetailsArr, prevUrl, nextUrl] = await fetchPokemon(url);
    // format data
    pokeDetailsArr = pokeDetailsArr.map((pokemon) => ({
      id: pokemon.id,
      name: pokemon.name,
      primaryType: pokemon.types[0]["type"].name,
    }));

    // update pagination buttons visibility + request url
    handlePaginationBtn(prevUrl, prevBtn);
    handlePaginationBtn(nextUrl, nextBtn);
  } else {
    pokeDetailsArr = Array.from(tableBody.children).map((row) => {
      return {
        id: row.children[0].innerHTML,
        name: row.children[1].innerHTML,
        primaryType: row.children[2].innerHTML,
      };
    });
  }

  // display IDs for current pokemon above table
  displayIds(pokeDetailsArr);

  // clear old table data
  tableBody.innerHTML = "";

  // render each pokemon into table
  pokeDetailsArr.forEach((detail) => renderPokemon(detail));

  // look through multi-select dropdown and find values that are checked
  let types = getType();
  if (types.length === 0) {
    types = "ALL";
  }
  console.log(types);

  // go through table and for all entries whose type
  // does NOT match, add class hidden
  const tableArr = Array.from(tableBody.children);
  if (types === "ALL") {
    tableArr.forEach((row) => row.classList.remove("hidden"));
  } else {
    tableArr.forEach((row) => {
      if (!types.includes(row.children[2].innerHTML)) {
        row.style.display = "none";
      }
    });
  }
}

// -----------------
function getType() {
  // look through multi-select dropdown and find values that are checked
  const multiSelectorOptions = Array.from(
    document.querySelector(".multiselect-dropdown-list").children
  );

  let typeArr = [];
  multiSelectorOptions.forEach((type) => {
    const classList = Array.from(type.classList);
    if (classList.includes("checked")) {
      typeArr.push(type.children[1].innerHTML);
    }
  });
  return typeArr;
}

// -----------------

// enables webpack hot reloading
if (module.hot) {
  module.hot.accept();
}
