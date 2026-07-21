import { BaseQuery } from "./query";
import { Parser } from "./parser";

type UserSearchResponse = ReturnType<typeof Parser.prototype.parseUserSearch>;

export class UserQuery extends BaseQuery<UserSearchResponse> {
  target(accountId: number) {
    this.query.targeteAccountID = accountId.toString();
    return this;
  }

  protected async execute(): Promise<UserSearchResponse> {
    const response = await fetch(
      this.BOOMLINGS_BASE_API + "/getGJUserInfo20.php",
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
