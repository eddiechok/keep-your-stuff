import { Category } from "../category/category.model";
import { Location } from "../location/location.model";

export type Stuff = {
  id: number;
  name: string;
  filepath?: string;
  imgUrl?: string;
  desc?: string;
  expiryDate?: string;
  categoryId: number;
  locationId: number;
  price?: number;
  quantity?: number;
};

export type StuffWithRelations = {
  id: number;
  name: string;
  category: Category;
  location: Location;
  filepath?: string;
  imgUrl?: string;
  desc?: string;
  expiryDate?: string;
  price?: number;
  quantity?: number;
};
