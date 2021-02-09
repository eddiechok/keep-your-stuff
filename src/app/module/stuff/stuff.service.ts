import { Injectable } from "@angular/core";
import { CameraPhoto } from "@capacitor/core";
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  from,
  Observable,
  of,
  ReplaySubject
} from "rxjs";
import { map, switchMap, take, takeWhile, tap } from "rxjs/operators";
import { DbService } from "src/app/shared/services/db.service";
import { PhotoService } from "src/app/shared/services/photo.service";
import { Stuff } from "./stuff.model";

@Injectable({
  providedIn: "root"
})
export class StuffService {
  private _stuffs = new ReplaySubject<Stuff[]>(1);
  // private _isLoaded$ = new BehaviorSubject(false);

  constructor(private db: DbService, private photoService: PhotoService) {
    this.loadStuffs().subscribe();
  }

  get stuffs() {
    return this._stuffs.asObservable();
  }

  // get isLoaded$() {
  //   // destroy the subscriber when the stuff is loaded
  //   return this._isLoaded$.pipe(takeWhile(isLoaded => !isLoaded, true));
  // }

  loadStuffs() {
    return this.db.getRows("stuff").pipe(
      // use switchMap when return as promise
      switchMap(async (stuffs: Stuff[]) => {
        const loadedImageStuffs: Stuff[] = [];
        // wait for all the promise to execute in parallel
        await Promise.all(
          // map all the stuffs to an array of promise
          stuffs.map(async stuff => {
            if (stuff.filepath) {
              // get imageUrl if the stuff has image filepath
              const imgUrl = await this.photoService.loadPicture(
                stuff.filepath
              );
              stuff.imgUrl = imgUrl;
            }
            loadedImageStuffs.push(stuff);
          })
        );
        return loadedImageStuffs;
      }),
      tap(stuffs => {
        console.log("stuffs loaded");
        this._stuffs.next(stuffs);
        // this._isLoaded$.next(true);
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
              if (stuff.filepath) {
                return from(this.photoService.loadPicture(stuff.filepath)).pipe(
                  map(imgUrl => {
                    stuff.imgUrl = imgUrl;
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

  addStuff(stuff: Omit<Stuff, "id">, image: CameraPhoto) {
    let savePicObs$: Observable<any> = of(null);
    let filepath: string = null;

    if (image?.webPath) {
      savePicObs$ = from(
        // save picture into filesystem and get the filepath
        this.photoService.savePicture(image).then(file => {
          filepath = file.filepath;
        })
      );
    }
    return savePicObs$.pipe(
      switchMap(() => {
        const addedStuff = { ...stuff, filepath };
        delete addedStuff.imgUrl; // do not add imgUrl into db

        return combineLatest([
          this.db.insertRow("stuff", addedStuff),
          this._stuffs.pipe(take(1))
        ]);
      }),
      tap(([id, stuffs]) => {
        const newStuff: Stuff = {
          id,
          ...stuff,
          filepath
        };

        this._stuffs.next(stuffs.concat(newStuff));
      }),
      map(([id, _]) => id)
    );
  }

  updateStuff(id: number, data: Omit<Stuff, "id">, image?: CameraPhoto) {
    let savePicObs$: Observable<any> = of(null);
    let filepath: string = null;
    const isOldPicChange = !data.imgUrl || image?.webPath;

    if (image?.webPath) {
      savePicObs$ = from(
        this.photoService.savePicture(image).then(file => {
          filepath = file.filepath;
        })
      );
    }

    return savePicObs$.pipe(
      switchMap(() => {
        const updatedStuff = { ...data };
        // if the imgUrl is empty or user has update new image, else dont update filepath
        if (isOldPicChange) {
          updatedStuff.filepath = filepath;
        }
        delete updatedStuff.imgUrl; // do not add imgUrl into db

        return combineLatest([
          this.db.updateRowById("stuff", updatedStuff, id),
          this._stuffs.pipe(take(1))
        ]);
      }),
      map(([_, stuffs]) => {
        const newStuffs = [...stuffs];
        const updateStuffIndex = newStuffs.findIndex(stuff => stuff.id === id);
        const oldFilepath = newStuffs[updateStuffIndex].filepath;

        newStuffs[updateStuffIndex] = {
          ...newStuffs[updateStuffIndex],
          ...data,
          filepath: isOldPicChange ? filepath : oldFilepath
        };

        if (oldFilepath && isOldPicChange) {
          //remove old picture in filesystem
          this.photoService.removePicture(oldFilepath);
        }

        this._stuffs.next(newStuffs);
      })
    );
  }

  deleteStuff(id: number) {
    return combineLatest([
      this.db.deleteRowById("stuff", id),
      this._stuffs.pipe(take(1))
    ]).pipe(
      map(([_, stuffs]) => {
        this._stuffs.next(stuffs.filter(stuff => stuff.id !== id));
        return stuffs.find(stuff => stuff.id !== id);
      }),
      tap(deletedStuff => {
        if (deletedStuff.filepath) {
          //remove picture in filesystem
          this.photoService.removePicture(deletedStuff.filepath);
        }
      })
    );
  }
}
