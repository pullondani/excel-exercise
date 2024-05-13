# Spreadsheet Excercise
A simple html and js program that creates a spreadsheet and allows for some basic data entry and calculation. 

## Features:
- It builds and creates a 100x100 grid with labelled headers.
- When you enter data it stores it within a JavaScript map which allows for fast retrieval.
- Refresh button rebuilds all of the cells and then fills them in with the data stored in the map.
- It supports writing equations and calculates a value based on other cells.
- It will correctly daisy-chain the equations and update all related cells when one is updated.
- There is some basic validation when entering data. If the input is invalid the cell will turn red until a vaid input is put in.

## Next features and improvements I would implement:
- Model based validation. Currently I am validating the input, if I instead built it into the class and had the validation as a state then on re-render I would check the validity of all the cells. This would improve validation consistency.
Estimated 30 minutes of work.

- Add support for functions like SUM, AVERAGE, COUNT etc. It would require changes to the operate function, I would detect alphanumeric chars up to a "(". Then apply the operation to all of the cells within the brackets, including those in a range.
Estimated 30 minutes of work.

- Add formatting support. This should be an easy change, I would add a new format property to the DataCell class. Within the render method, if it detects this string it would apply the relevant CSS change.
Estimated 20 minutes of work.
