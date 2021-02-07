import { Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, from, Observable, of } from "rxjs";
import { map, switchMap, take, takeWhile, tap } from "rxjs/operators";
import { DbService } from "src/app/shared/services/db.service";
import { PhotoService } from "src/app/shared/services/photo.service";
import { Stuff } from "./stuff.model";

@Injectable({
  providedIn: "root"
})
export class StuffService {
  private _stuffs = new BehaviorSubject<Stuff[]>([]);
  private _isLoaded$ = new BehaviorSubject(false);

  constructor(private db: DbService, private photoService: PhotoService) {
    this.loadStuffs().subscribe();
  }

  get stuffs() {
    return this._stuffs.asObservable();
  }

  get isLoaded$() {
    // destroy the subscriber when the stuff is loaded
    return this._isLoaded$.pipe(takeWhile(isLoaded => !isLoaded, true));
  }

  loadStuffs() {
    return this.db.getRows("stuff").pipe(
      // use switchMap when return as promise
      switchMap(async (stuffs: Stuff[]) => {
        const loadedImageStuffs: Stuff[] = [];
        // wait for all the promise to execute in parallel
        await Promise.all(
          // map all the stuffs to an array of promise
          stuffs.map(async stuff => {
            if (stuff.imgUrl) {
              const filepath = await this.photoService.loadPicture(
                stuff.imgUrl
              );
              stuff.imgUrl = filepath;
            }
            loadedImageStuffs.push(stuff);
          })
        );
        return loadedImageStuffs;
      }),
      tap(stuffs => {
        this._stuffs.next(stuffs);
        this._isLoaded$.next(true);
      })
    );
  }

  getStuff(id: number) {
    return this._stuffs.pipe(
      switchMap(stuffs => {
        const stuff = stuffs.find(stuff => stuff.id === id);
        if (stuff) {
          return of(stuff);
        } else {
          return this.db.getRowById("stuff", id).pipe(
            switchMap((stuff: Stuff) => {
              // load pic from filepath if has filepath
              if (stuff.imgUrl) {
                return from(this.photoService.loadPicture(stuff.imgUrl)).pipe(
                  map(filepath => {
                    stuff.imgUrl = filepath;
                    return stuff;
                  }),
                  tap(stuff => {
                    // add new stuff to stuffs obsvervable
                    const updatedStuffs = [...stuffs, stuff];
                    this._stuffs.next(updatedStuffs);
                  })
                );
              }
              return of(stuff);
            })
          );
        }
      }),
      tap(stuff => {
        if (!stuff) throw new Error("not_found");
      })
    );
  }

  addStuff(stuff: Omit<Stuff, "id">) {
    let savePicObs$: Observable<any> = of(stuff.imgUrl);

    if (stuff.imgUrl) {
      savePicObs$ = from(
        this.photoService.savePicture(stuff.imgUrl).then(file => {
          return file.filepath;
        })
      );
    }
    return savePicObs$.pipe(
      switchMap(imgUrl =>
        combineLatest([
          this.db.insertRow("stuff", { ...stuff, imgUrl }),
          this._stuffs.pipe(take(1))
        ])
      ),
      tap(([id, stuffs]) => {
        const newStuff: Stuff = {
          id,
          ...stuff
        };
        this._stuffs.next(stuffs.concat(newStuff));
      }),
      map(([id, _]) => id)
    );
  }

  updateStuff(id: number, data: Omit<Stuff, "id">, imgUrl?: string) {
    let savePicObs$: Observable<any> = of(imgUrl);

    if (imgUrl) {
      savePicObs$ = from(
        this.photoService.savePicture(imgUrl).then(file => {
          return file.filepath;
        })
      );
    }
    return savePicObs$.pipe(
      switchMap(_imgUrl =>
        combineLatest([
          this.db.updateRowById("stuff", { ...data, imgUrl: _imgUrl }, id),
          this._stuffs.pipe(take(1))
        ])
      ),
      tap(([_, stuffs]) => {
        const newStuffs = [...stuffs];
        const updateStuffIndex = newStuffs.findIndex(stuff => stuff.id === id);
        newStuffs[updateStuffIndex] = {
          ...newStuffs[updateStuffIndex],
          ...data
        };

        this._stuffs.next(newStuffs);
      })
    );
  }

  deleteStuff(id: number) {
    return combineLatest([
      this.db.deleteRowById("stuff", id),
      this._stuffs.pipe(take(1))
    ]).pipe(
      tap(([_, stuffs]) => {
        this._stuffs.next(stuffs.filter(stuff => stuff.id !== id));
      })
    );
  }
}
