import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { map, tap, take } from "rxjs/operators";
import { Category } from "./category.model";

@Injectable({
  providedIn: "root"
})
export class CategoryService {
  private _categories = new BehaviorSubject<Category[]>([
    {
      id: 1,
      name: "Stationery",
      icon: "library-outline"
    },
    {
      id: 2,
      name: "Car",
      icon: "car-sport-outline"
    }
  ]);

  constructor() {}

  get categories() {
    return this._categories.asObservable();
  }

  getCategory(id: number) {
    return this._categories.pipe(
      map(categories => {
        return { ...categories.find(category => category.id === id) };
      })
    );
  }

  addCategory(category: Omit<Category, "id">) {
    return this._categories.pipe(
      take(1),
      tap(categories => {
        const newCategory: Category = {
          id: categories.length + 1,
          ...category
        };

        this._categories.next(categories.concat(newCategory));
      })
    );
  }

  updateCategory(id: number, data: Omit<Category, "id">) {
    return this._categories.pipe(
      take(1),
      tap(categories => {
        const newCategories = [...categories];
        const updateCategoryIndex = newCategories.findIndex(
          category => category.id === id
        );
        newCategories[updateCategoryIndex] = {
          ...newCategories[updateCategoryIndex],
          ...data
        };

        this._categories.next(newCategories);
      })
    );
  }

  deleteCategory(id: number) {
    return this._categories.pipe(
      take(1),
      tap(categories => {
        this._categories.next(
          categories.filter(category => category.id !== id)
        );
      })
    );
  }
}
