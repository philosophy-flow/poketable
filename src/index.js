import "table2excel";
// import { TableExport } from "tableexport";

const getPokemonBtn = document.getElementById("get-pokemon-btn");
getPokemonBtn.addEventListener("click", () => {
  fetchPokemon("https://pokeapi.co/api/v2/pokemon?limit=25");
});

const exportBtn = document.getElementById("export-btn");
exportBtn.addEventListener("click", () => {
  const table2excel = new Table2Excel();
  table2excel.export(pokeTable);

  // TableExport(pokeTable);
});

const pokeTable = document.getElementById("poke-table");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

const idDisplay = document.getElementById("poke-id");

async function fetchPokemon(url) {
  getPokemonBtn.classList.add("hidden");
  exportBtn.classList.remove("hidden");

  const res = await fetch(url);
  const data = await res.json();
  const allPokemon = data.results;

  const pokeDetailsArr = await Promise.all(
    allPokemon.map((p) => {
      return fetch(p.url).then((res) => res.json());
    })
  );

  const firstId = pokeDetailsArr[0].id;
  const lastId = pokeDetailsArr[24].id;

  idDisplay.innerHTML = `Displaying IDs: ${firstId}-${lastId}`;

  pokeDetailsArr.forEach((pokeDetail) => renderPokemon(pokeDetail));

  handlePaginationBtns(data.previous, data.next);

  // const filteredPokeArr = pokeDetailsArr.filter(
  //   (detail) => detail.types[0]["type"].name === "electric"
  // );
}

function renderPokemon(pokeDetails) {
  const tableBody = document.getElementById("table-body");
  const newRow = tableBody.insertRow();
  const idCell = newRow.insertCell();
  const nameCell = newRow.insertCell();
  const typeCell = newRow.insertCell();

  idCell.innerHTML = `${pokeDetails.id}`;
  nameCell.innerHTML = `${pokeDetails.name}`;
  typeCell.innerHTML = `${pokeDetails.types[0]["type"].name}`;
}

function handlePaginationBtns(prevUrl, nextUrl) {
  if (prevUrl) {
    prevBtn.classList.remove("hidden");
    prevBtn.onclick = () => {
      pokeTable.children[1].innerHTML = "";
      fetchPokemon(prevUrl);
    };
  } else {
    prevBtn.classList.add("hidden");
  }

  if (nextUrl) {
    nextBtn.classList.remove("hidden");
    nextBtn.onclick = () => {
      pokeTable.children[1].innerHTML = "";
      fetchPokemon(nextUrl);
    };
  } else {
    nextBtn.classList.add("hidden");
  }
}

if (module.hot) {
  module.hot.accept();
}
