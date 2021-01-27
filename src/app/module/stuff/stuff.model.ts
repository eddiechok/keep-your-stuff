import { Category } from "../category/category.model";
import { Location } from "../location/location.model";

export type Stuff = {
  id: number;
  name: string;
  categoryId: number;
  locationId: number;
  imgUrl?: string;
  desc?: string;
};

export type StuffWithRelations = {
  id: number;
  name: string;
  category: Category;
  location: Location;
  imgUrl?: string;
  desc?: string;
};
