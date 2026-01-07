import { BaseQuery } from "./query";
import { Parser } from "./parser";

export class UserQuery extends BaseQuery<any> {
  search(query: string) {
    this.query.str = query;
    return this;
  }

  protected async execute(): Promise<any> {
    const response = await fetch(
      this.BOOMLINGS_BASE_API + "/getGJUsers20.php",
      {
        method: "POST",
        headers: {
          "User-Agent": "",
        },
        body: new URLSearchParams({
          ...this.query,
          secret: this.COMMON_SECRET,
        }),
      },
    );

    const text = await response.text();

    const parser = new Parser();
    return parser.parseUserSearch(text);
  }
}
