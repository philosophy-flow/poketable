import "table2excel";
import "./multiselect-dropdown";

const idDisplay = document.getElementById("poke-id");
const pokeTable = document.getElementById("poke-table");
const tableBody = pokeTable.tBodies[0];
const typeSelectContainer = document.getElementById("type-select-container");

const getPokemonBtn = document.getElementById("get-pokemon-btn");
const exportBtn = document.getElementById("export-btn");
const typeSelector = document.getElementById("type-selector");

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// ------------------------

getPokemonBtn.addEventListener("click", fetchInitialData);
exportBtn.addEventListener("click", exportToExcel);
typeSelector.addEventListener("change", () => main());

function fetchInitialData() {
  main("https://pokeapi.co/api/v2/pokemon?limit=25");
  exportBtn.classList.remove("hidden");
  typeSelectContainer.classList.remove("hidden");
  getPokemonBtn.classList.add("hidden");
  getPokemonBtn.removeEventListener("click", fetchInitialData);
}

function exportToExcel() {
  // clone table so that hidden nodes can be removed before export
  let exportTable = pokeTable.cloneNode(true);
  exportTable.removeAttribute("id");

  // search for entries that are hidden and remove from cloned table
  let entries = Array.from(exportTable.tBodies[0].children);
  entries.forEach((entry) => {
    if (entry.classList.contains("display-none")) {
      entry.remove();
    }
  });

  // export cloned table
  const table2excel = new Table2Excel();
  table2excel.export(exportTable);
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

function getTypes() {
  // look through multi-select dropdown and find values that are checked
  const multiSelectorOptions = Array.from(
    document.querySelector(".multiselect-dropdown-list").children
  );

  // add selected types to typesArr
  let typeArr = [];
  multiSelectorOptions.forEach((type) => {
    const classList = type.classList;
    if (classList.contains("checked")) {
      typeArr.push(type.children[1].innerHTML);
    }
  });

  return typeArr;
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
  // if url passed to main, then details come from API call
  // if no url passed to main, then details come from existing table
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
  let typesArr = getTypes();

  // compare selected types to each row's type, hide row if no match
  const tableArr = Array.from(tableBody.children);
  if (typesArr.length > 0) {
    tableArr.forEach((row) => {
      const rowType = row.children[2].innerHTML;
      if (!typesArr.includes(rowType)) {
        row.classList.add("display-none");
      }
    });
  }
}

// -----------------

// enables webpack hot reloading
if (module.hot) {
  module.hot.accept();
}
