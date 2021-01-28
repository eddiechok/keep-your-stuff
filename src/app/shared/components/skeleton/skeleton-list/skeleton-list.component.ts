import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-skeleton-list",
  templateUrl: "./skeleton-list.component.html",
  styleUrls: ["./skeleton-list.component.scss"]
})
export class SkeletonListComponent implements OnInit {
  @Input() paragraph = 1;
  @Input() iconSize = 56;

  rows: number[] = [];
  paragraphRows: number[] = [];

  constructor() {}

  ngOnInit() {
    this.rows = Array(7)
      .fill(0)
      .map((x, i) => i);

    this.paragraphRows = Array(this.paragraph)
      .fill(0)
      .map((x, i) => i);
  }
}
