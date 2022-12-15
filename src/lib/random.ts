import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { v4 } from "uuid";
import { lowerCase } from "lodash";

export const getRandomId = () => {
  const randomName: string = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
  });
  return v4() + "-" + randomName;
};

export const getNameFromId = (id: string) => {
  return lowerCase(id.replace(/.+-/, ""));
};
