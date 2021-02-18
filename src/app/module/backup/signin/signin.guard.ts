import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from "@angular/router";
import { Plugins } from "@capacitor/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SigninGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return Plugins.Storage.get({ key: "userData" }).then(data => !data.value);
  }
}
