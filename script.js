const ROWS_TO_RENDER = 100;
const COLS_TO_RENDER = 100;

/**
 * Spreadsheet.
 * Allows the user to enter data and do basic equations.
 **/
class DataCell {
  constructor(value, cell, equation) {
    this.value = value;
    this.cell = cell;

    if (equation) {
      this.equation = equation;
      this.cell.addEventListener("focus", () => {
        if (this.equation) {
          this.cell.textContent = this.equation;
        }
      });
    }
  }
}

var cellMap;
var tableRef;
var tbody;

const render = () => {
  for (const [_, dataCell] of cellMap) {
    try {
      dataCell.cell.textContent = dataCell.equation
        ? parseEquation(dataCell.equation)
        : dataCell.value;
    } catch (e) {
      console.error("Render error:", e.message);
    }
  }
};

const handleInput = (row, col, cell) => {
  try {
    let input = cell.textContent;
    let cellKey = buildKey(row, col);

    cell.style.backgroundColor = "white";
    switch (getValidityType(input)) {
      case "number":
        cellMap.set(cellKey, new DataCell(input, cell));
        break;
      case "equation":
        cellMap.set(cellKey, new DataCell(parseEquation(input), cell, input));
        break;
      case "delete":
        cellMap.delete(cellKey);
        return;

      default:
        cell.style.backgroundColor = "red";
        return;
    }

    render();
  } catch (err) {
    cell.style.backgroundColor = "red";
    console.error("Input error:", err);
  }
};

const getValidityType = (input) => {
  if (!input) {
    return "delete";
  } else if (isValidNumber(input)) {
    return "number";
  } else if (isValidEquation(input)) {
    return "equation";
  }
  return false;
};

// Recursive
const parseEquation = (input, depth = 0) => {
  if (depth > 10) {
    throw new Error("You found the bottom. Loop protection.");
  }
  let operators = input.match(/[\+\-\*\/]/g);
  let values = input
    .match(POS_PATTERN)
    .map((text) => {
      let k = getKeyFromAlph(text);
      if (!cellMap.has(k)) {
        throw new Error("Invalid selection: No data at cell " + text);
      }
      return cellMap.get(k);
    })
    .filter((cell) => cell)
    .map((cell) =>
      cell.equation
        ? parseEquation(cell.equation, ++depth)
        : parseInt(cell.value)
    );

  return operate(values, operators);
};

const operate = (values, operators) => {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(
      "Invalid input: values must be a non-empty array of numbers."
    );
  }

  let result = values[0];
  for (let i = 1; i < values.length; i++) {
    switch (operators[i - 1]) {
      case "+":
        result += values[i];
        break;
      case "-":
        result -= values[i];
        break;
      case "*":
        result *= values[i];
        break;
      case "/":
        result /= values[i];
        break;
      default:
        throw new Error("Invalid operator: must be +, -, *, or /.");
    }
  }

  return result;
};

// Takes a number and converts it to column string
// Breaks after ZZ
const getAlphString = (n) => {
  var quot = Math.floor(n / 26) - 1;
  var first = String.fromCharCode(65 + (n % 26));
  var second = String.fromCharCode(65 + quot);
  var chstr = n >= 26 ? second + first : first;

  return chstr;
};

// Takes a position string and converts to a map key
const getKeyFromAlph = (val) => {
  let row, col;
  let match = val.match(/^([a-zA-Z]{1,2})(\d{1,2})$/);
  if (match) {
    let [, str, num] = match;
    row = parseInt(num) - 1;
    let s = str.toUpperCase();

    // Convert from base26 into base10, 64 because A=0
    col =
      s.length > 1
        ? (s.charCodeAt(0) - 64) * 26 + (s.charCodeAt(1) - 65)
        : s.charCodeAt(0) - 65;
  }

  return buildKey(row, col);
};

// Not great. Has nice properties now but limits table to 100x100.
const buildKey = (row, col) =>
  row.toString().padStart(2, "0") + col.toString().padStart(2, "0");

const NUM_PATTERN = /^\d*$/; // Minimal validation, not robust
const isValidNumber = (input) => NUM_PATTERN.test(input);

const POS_PATTERN = /[a-zA-Z]{1,2}[0-9]{1,2}/g; // g to find all matches
const EQ_PATTERN =
  /^=[a-zA-Z]{1,2}[0-9]{1,2}(?:[\+\-\*\/][a-zA-Z]{1,2}[0-9]{1,2})*$/; // Minimal validation, not robust
const isValidEquation = (input) => EQ_PATTERN.test(input);

const handleRefresh = () => {
  buildCells();
};

const buildCells = () => {
  let replacement = tableRef.createTBody();
  if (tbody) {
    tableRef.replaceChild(replacement, tbody);
  }
  tbody = replacement;

  for (let row = 0; row < ROWS_TO_RENDER; row++) {
    const tr = tbody.insertRow();

    var th = document.createElement("th");
    th.appendChild(document.createTextNode(`${row + 1}`));
    tr.appendChild(th);

    // Row and col number equates to the data structure without needing adjustment.
    for (let col = 0; col < COLS_TO_RENDER; col++) {
      let cell = document.createElement("td");
      cell.contentEditable = true;
      tr.appendChild(cell);

      cell.addEventListener("blur", () => {
        handleInput(row, col, cell);
      });
    }
  }

  render();
};

const createSpreadsheet = () => {
  tableRef = document.getElementById("spreadsheet");
  cellMap = new Map();

  const thead = document.createElement("thead");
  tableRef.appendChild(thead);
  const headerRow = document.createElement("tr");
  thead.appendChild(headerRow);

  // Corner square
  const headerCell = document.createElement("th");
  headerRow.appendChild(headerCell);

  for (let col = 0; col < COLS_TO_RENDER; col++) {
    const headerCell = document.createElement("th");
    headerRow.appendChild(headerCell);

    const ch = getAlphString(col);
    headerCell.textContent = ch;
  }

  buildCells();
};

// Run code
createSpreadsheet();
