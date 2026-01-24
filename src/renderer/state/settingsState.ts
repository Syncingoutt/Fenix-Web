// Settings state management

// Tax preference
let includeTax: boolean = true;

export function getIncludeTax(): boolean {
  return includeTax;
}

export function setIncludeTax(value: boolean): void {
  includeTax = value;
}
