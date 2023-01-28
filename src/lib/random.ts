import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { v4 } from "uuid";
import { lowerCase } from "lodash";

export const getRandomId = () => {
  let name = localStorage.getItem("preferredName");
  if (!name) {
    name = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
    });
  }
  return v4() + "-" + name;
};

export const getNameFromId = (id: string) => {
  return lowerCase(id.replace(/.+-/, ""));
};
