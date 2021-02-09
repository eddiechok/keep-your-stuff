import { Injectable } from "@angular/core";
import { combineLatest, Observable, of, ReplaySubject, throwError } from "rxjs";
import { map, switchMap, take, tap } from "rxjs/operators";
import { DbService } from "src/app/shared/services/db.service";
import { Category } from "./category.model";

@Injectable({
  providedIn: "root"
})
export class CategoryService {
  private _categories = new ReplaySubject<Category[]>(1);

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
        console.log(categories);
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
          ...category,
          stuffs: 0
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
    return this._categories.pipe(
      take(1),
      switchMap(categories => {
        const category = categories.find(category => category.id === id);
        if (!category) {
          return throwError("not_found");
        } else if (category.stuffs) {
          return throwError("stuffs_not_empty");
        } else {
          return this.db
            .deleteRowById("category", id)
            .pipe(map(() => categories));
        }
      }),
      tap(categories => {
        this._categories.next(
          categories.filter(category => category.id !== id)
        );
      })
    );
  }
}
