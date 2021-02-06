import { Category } from "../category/category.model";
import { Location } from "../location/location.model";

export type Stuff = {
  id: number;
  name: string;
  imgUrl?: string;
  desc?: string;
  expiryDate?: string;
  categoryId: number;
  locationId: number;
};

export type StuffWithRelations = {
  id: number;
  name: string;
  category: Category;
  location: Location;
  imgUrl?: string;
  desc?: string;
  expiryDate?: string;
};
