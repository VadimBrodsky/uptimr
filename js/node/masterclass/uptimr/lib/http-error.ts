export default class HTTPError extends Error {
  public name: string;
  public status: number;
  public payload: { Error: string } | {};

  constructor(status = 500, message?: string) {
    super(message);

    // Saving class name in the property of our custom error as a shortcut
    this.name = this.constructor.name;

    // Capturing stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);

    // Additional properties
    this.status = status;
    this.payload = message ? { Error: message } : {};
  }
}
