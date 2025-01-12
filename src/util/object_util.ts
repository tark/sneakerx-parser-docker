import JSON5 from "json5";

export const stringify = (object: any) => {
  return JSON5.stringify(object, {quote: '"'})
}
