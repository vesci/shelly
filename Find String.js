// Shelly Split string by character sample

// input string
let input = '2346232736;342342;503;15.2;390;2333.22;xx;FI;';
// take index
let takeNo = 4; 
// split character
let split = ';';

// find value at given position
function FindValue(input, takeNo, split)
{
  let runIndex = 0;
  let valueStr = "";
  for (let i = 0; i<input.length; i++)
  {
    let s = input.at(i);
    if (chr(s) === split) runIndex++;     
    if (chr(s) !== split && runIndex === takeNo) valueStr = valueStr + chr(s);
  }
  return JSON.parse(valueStr);
}

let value = FindValue(input, takeNo, split);
print ("value:", value);
print ("value + 10:", value + 10);
