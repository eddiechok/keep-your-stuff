import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from "@angular/router";
import { Plugins } from "@capacitor/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class BackupGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return Plugins.Storage.get({ key: "userData" }).then(data => {
      if (!data.value) {
        this.router.navigateByUrl("/backup/signin", { replaceUrl: true });
      }
      return !!data.value;
    });
  }
}
