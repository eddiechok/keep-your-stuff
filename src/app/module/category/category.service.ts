import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { delay, map, switchMap, take, tap } from "rxjs/operators";
import { DbService } from "src/app/shared/services/db.service";
import { Category } from "./category.model";

@Injectable({
  providedIn: "root"
})
export class CategoryService {
  private _categories = new BehaviorSubject<Category[]>([]);

  constructor(private db: DbService) {
    this.loadCategories().subscribe();
  }

  get categories() {
    return this._categories.asObservable();
  }

  loadCategories() {
    const sql = `SELECT a.*, COUNT(b.id) as stuffs 
    FROM category as a 
    LEFT JOIN stuff as b ON b.categoryId = a.id 
    GROUP BY a.id`;

    return this.db.getRowsBySql(sql).pipe(
      tap(categories => {
        this._categories.next(categories);
      })
    );
  }

  getCategory(id: number) {
    return this._categories.pipe(
      switchMap(categories => {
        const category = categories.find(category => category.id === id);
        if (category) {
          return of(category);
        } else {
          return this.db.getRowById("category", id) as Observable<Category>;
        }
      }),
      tap(category => {
        if (!category) throw new Error("not_found");
      })
    );
  }

  addCategory(category: Omit<Category, "id">) {
    return combineLatest([
      this.db.insertRow("category", category),
      this._categories.pipe(take(1))
    ]).pipe(
      tap(([id, categories]) => {
        const newCategory: Category = {
          id,
          ...category
        };
        this._categories.next(categories.concat(newCategory));
      })
    );
  }

  updateCategory(id: number, data: Omit<Category, "id">) {
    return combineLatest([
      this.db.updateRowById("category", data, id),
      this._categories.pipe(take(1))
    ]).pipe(
      tap(([_, categories]) => {
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
    return combineLatest([
      this.db.deleteRowById("category", id),
      this._categories.pipe(take(1))
    ]).pipe(
      tap(([_, categories]) => {
        this._categories.next(
          categories.filter(category => category.id !== id)
        );
      })
    );
  }
}
